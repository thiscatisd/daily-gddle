// node server.js  (no npm install needed)
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'change-me';
// Writable files (players, codes, record, feedback, force) live in DATA_DIR so a host volume can be mounted there. levels.json stays in ./data.
const DD = process.env.DATA_DIR || path.join(__dirname, 'data'); fs.mkdirSync(DD, { recursive: true });
const clientIp = req => req.headers['cf-connecting-ip'] || clientIp(req);

// ---- tweak these ----
const DIFF = { Auto: 1, Easy: 1, Normal: .95, Hard: .9, Harder: .85, Insane: .75, 'Easy Demon': .65,
  'Medium Demon': .55, 'Hard Demon': .45, 'Insane Demon': .35, 'Extreme Demon': .25 };
const CPW = [1, 1, .85, .5, .2, .1];            // creator points 0..5 (rarer = fewer)
const FAME = f => 1 / (1 + f / 5);              // f = list count + weekly/daily/gauntlet/award points
const LEN = s => 1 / (1 + .4 * Math.pow((s || 70) / 90, 1.5));
const HARD = h => h ? Math.max(.05, Math.pow(h / 150, .8)) : 1; // pointercrate rank (1 = hardest)
// Tier is decided by the roll's total EP (highest matching minimum wins). Tweak freely.
const TIERS = [[500000, 'MYTHIC', '#ff4fd8'], [150000, 'LEGENDARY', '#ffb020'], [50000, 'EPIC', '#a86bff'],
  [15000, 'RARE', '#4aa3ff'], [5000, 'UNCOMMON', '#34d399'], [0, 'COMMON', '#9ca3af']];
const RARITY_EP = p => Math.round(1500 * Math.log2(1 / p));
// ---------------------

const levels = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/levels.json')));
const weigh = l => (DIFF[l.d] || .5) * CPW[l.cp] * FAME(l.f) * LEN(l.s) * HARD(l.h);
const w = levels.map(weigh);
const total = w.reduce((a, b) => a + b, 0);
const cum = []; w.reduce((a, b, i) => (cum[i] = a + b), 0);
const sorted = [...w].sort((a, b) => a - b), sc = []; sorted.reduce((a, b, i) => (sc[i] = a + b), 0);

function bsearch(arr, x) { let lo = 0, hi = arr.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; arr[m] < x ? lo = m + 1 : hi = m; } return lo; }
const pRarer = wt => sc[Math.min(sorted.length - 1, bsearch(sorted, wt + 1e-15) - 1 < 0 ? 0 : bsearch(sorted, wt + 1e-15) - 1)] / total;

const idBadges = require('./badges');
const STAR = { Auto: 1, Easy: 2, Normal: 3, Hard: 4, Harder: 6, Insane: 8 };
const facts = l => [
  ['Difficulty', DIFF[l.d] || .5, l.d],
  ['Creator points', CPW[l.cp], l.cp ? `${l.cp} CP` : 'Main level'],
  ['Fame', FAME(l.f), l.f ? `${l.f} fame points (rated lists, weeklies, gauntlets)` : 'Not widely known'],
  ['Length', LEN(l.s), l.s ? `${Math.floor(l.s / 60)}:${String(l.s % 60).padStart(2, '0')} long` : 'Length unknown'],
  ['Demon ranking', HARD(l.h), l.h ? `Pointercrate #${l.h}` : 'Not in the hardest 150']];

function describe(i, day) {
  const l = levels[i], p = pRarer(w[i]), f = facts(l);
  const tot = f.reduce((a, x) => a + Math.log(1 / x[1]), 0) || 1, rPts = RARITY_EP(p);
  const parts = f.map(x => ({ n: x[0], d: x[2], e: Math.round(rPts * Math.log(1 / x[1]) / tot) })).filter(x => x.e > 0);
  const badges = idBadges(l.id), idPts = badges.reduce((a, x) => a + x.e, 0), ep = idPts + rPts, tier = TIERS.find(t => ep >= t[0]);
  return { day, level: { id: l.id, name: l.n, by: l.by, diff: l.d, st: l.st || STAR[l.d] || 10, cp: l.cp, secs: l.s, main: !!l.main, lists: l.f, h: l.h },
    tier: tier[1], color: tier[2], top: +(p * 100).toFixed(3), badges, parts, idPts, rPts, ep };
}

function doRoll(pid, day) {
  const h = crypto.createHash('sha256').update(`${SECRET}|${pid}|${day}`).digest();
  const u = (h.readUIntBE(0, 6) / 2 ** 48) * total;
  return describe(Math.min(levels.length - 1, bsearch(cum, u)), day);
}

// force.js queues data/force.json; the next roll uses that ID, then the file is deleted.
const FF = path.join(DD, 'force.json');
const readForce = () => { try { return JSON.parse(fs.readFileSync(FF)); } catch { return null; } };
function forcedIndex(id) {
  let i = levels.findIndex(l => l.id === id);
  if (i < 0) { const l = { id, n: `Level ${id}`, by: 'unknown', d: 'Easy', cp: 1, st: 2, s: null, f: 0, h: 0 }; levels.push(l); w.push(weigh(l)); i = levels.length - 1; }
  return i;
}

const PF = path.join(DD, 'players.json');
const players = fs.existsSync(PF) ? JSON.parse(fs.readFileSync(PF)) : {};
const RF = path.join(DD, 'record.json');
let record = (() => { try { return JSON.parse(fs.readFileSync(RF)); } catch { return null; } })(); // best roll ever on this site
const save = () => fs.writeFileSync(PF, JSON.stringify(players));
const today = () => new Date().toISOString().slice(0, 10);
const msLeft = () => { const n = new Date(); return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1) - n; };

// ---- accounts: no emails, no passwords. A random save code (abc-123-def-456) is the only credential. ----
// Only a one-way scrypt hash of the code is stored, so nobody (including you) can read or recover it.
const CF = path.join(DD, 'codes.json');
const codes = fs.existsSync(CF) ? JSON.parse(fs.readFileSync(CF)) : { salt: crypto.randomBytes(16).toString('hex'), users: {} };
const saveCodes = () => fs.writeFileSync(CF, JSON.stringify(codes));
const norm = c => String(c).toLowerCase().replace(/[^a-z0-9]/g, '');
const codeKey = c => crypto.scryptSync(norm(c), codes.salt, 32).toString('hex');
const LET = 'abcdefghjkmnpqrstuvwxyz', NUM = '23456789'; // no look-alikes (i, l, o, 0, 1)
const pick = (set, n) => Array.from({ length: n }, () => set[crypto.randomInt(set.length)]).join('');
const newCode = () => `${pick(LET, 3)}-${pick(NUM, 3)}-${pick(LET, 3)}-${pick(NUM, 3)}`;
const tries = {};
const limited = ip => { const n = Date.now(), a = (tries[ip] = (tries[ip] || []).filter(t => n - t < 60000)); a.push(n); return a.length > 8; };
const readBody = req => new Promise(r => { let b = ''; req.on('data', c => { b += c; if (b.length > 2000) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(b)); } catch { r({}); } }); });
const inv = p => { const h = p.hist || (p.best ? [p.best] : []), tiers = {}; h.forEach(x => tiers[x.tier] = (tiers[x.tier] || 0) + 1);
  return { rolls: h.length, ep: p.ep, top: [...h].sort((a, b) => b.ep - a.ep).slice(0, 20), tiers, signedIn: !!p.user }; };
const nf = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const pubOf = x => ({ user: x.user, color: x.color || null, fc: (x.fc || '').replace(/(.{3})/, '$1-'), ep: x.ep, best: x.best?.ep || 0, bn: x.best?.name || '', today: x.last?.day === today() ? x.last.tier : null });
const profile = p => {
  if (!p.user) return { user: null };
  if (!p.fc) { do p.fc = pick((LET + NUM).toUpperCase(), 6); while (Object.values(players).some(x => x !== p && x.fc === p.fc)); save(); }
  return { ...pubOf(p), rolls: (p.hist || []).length, friends: (p.friends || []).map(id => players[id]).filter(Boolean).map(pubOf).sort((a, b) => b.ep - a.ep) };
};
async function social(req, p) {
  if (!p.user) return { err: 'Create an account first (menu > Sign in).' };
  if (!(req.headers['content-type'] || '').includes('application/json')) return { err: 'Bad request' };
  const ip = clientIp(req);
  if (limited(ip)) return { err: 'Too many requests. Wait a minute.', code: 429 };
  const b = await readBody(req), idOf = fc => Object.keys(players).find(k => players[k].fc && players[k].fc === nf(fc));
  if (req.url === '/api/profile') {
    if (b.color !== undefined) { if (!/^#[0-9a-f]{6}$/i.test(b.color)) return { err: 'Bad colour' }; p.color = b.color.toLowerCase(); }
    if (b.name !== undefined) { const nm = String(b.name).trim(); if (!/^[A-Za-z0-9_ ]{3,16}$/.test(nm)) return { err: 'Display name: 3-16 letters, numbers, spaces or _' }; p.user = nm; }
  } else if (req.url === '/api/friend') {
    const id = idOf(b.code);
    if (!id) return { err: 'No player has that friend code.' };
    if (players[id] === p) return { err: "That's your own friend code." };
    p.friends ||= [];
    if (p.friends.includes(id)) return { err: 'You are already friends.' };
    if (p.friends.length >= 50) return { err: 'Friend list is full (50).' };
    p.friends.push(id);
  } else { const id = idOf(b.code); p.friends = (p.friends || []).filter(x => x !== id); }
  save(); return { out: profile(p) };
}
// ---- feedback: forwarded to a Discord webhook (env DISCORD_WEBHOOK) and backed up to data/feedback.jsonl ----
const FB_CATS = { Bug: ['\ud83d\udc1b', 0xff5a5f], Idea: ['\ud83d\udca1', 0xffb020], 'Wrong level data': ['\ud83d\udcca', 0x4aa3ff], Other: ['\ud83d\udcac', 0x9ca3af] };
const fbTries = {};
async function feedback(req, p) {
  if (!(req.headers['content-type'] || '').includes('application/json')) return { err: 'Bad request' };
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress, n = Date.now();
  const a = (fbTries[ip] = (fbTries[ip] || []).filter(t => n - t < 3600000)); a.push(n);
  if (a.length > 4) return { err: 'You are sending feedback too fast. Try again later.', code: 429 };
  const b = await readBody(req);
  if (b.website) return { out: { ok: true } }; // honeypot: bots fill this in
  const cat = FB_CATS[b.cat] ? b.cat : 'Other', msg = String(b.msg || '').trim().slice(0, 1000), contact = String(b.contact || '').trim().slice(0, 100);
  if (msg.length < 5) return { err: 'Please write a little more (at least 5 characters).' };
  const lv = b.level && Number.isInteger(b.level.id) ? { id: b.level.id, name: String(b.level.name || '').slice(0, 60) } : null;
  const f = { cat, msg, contact, user: p.user || null, level: lv };
  try { fs.appendFileSync(path.join(DD, 'feedback.jsonl'), JSON.stringify({ ...f, t: new Date().toISOString() }) + '\n'); } catch (e) { console.error('feedback save failed', e.message); }
  const url = process.env.DISCORD_WEBHOOK;
  if (url) {
    const fields = [{ name: 'Contact', value: contact || 'none given', inline: true }, { name: 'Player', value: f.user || 'guest', inline: true }];
    if (lv) fields.push({ name: 'Level', value: `${lv.name} (#${lv.id})`, inline: false });
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        username: 'GDdle feedback', allowed_mentions: { parse: [] },
        embeds: [{ title: `${FB_CATS[cat][0]} ${cat}`, description: msg, color: FB_CATS[cat][1], fields, timestamp: new Date().toISOString() }] }) });
      if (!r.ok) console.error('discord webhook returned', r.status);
    } catch (e) { console.error('discord webhook failed', e.message); }
  } else console.log('DISCORD_WEBHOOK not set; feedback saved to data/feedback.jsonl only');
  return { out: { ok: true } };
}
const board = () => {
  const rows = Object.values(players).filter(p => p.user).map(p => ({ user: p.user, color: p.color || null, ep: p.ep, best: p.best?.ep || 0, bn: p.best?.name || '' }));
  const top = k => [...rows].sort((a, b) => b[k] - a[k]).slice(0, 10);
  return { ep: top('ep'), best: top('best') };
};
async function auth(req, pid, ck) {
  const ip = clientIp(req);
  if (req.url === '/api/logout') return { out: { ok: true }, cookie: ck(crypto.randomBytes(16).toString('hex')) };
  if (!(req.headers['content-type'] || '').includes('application/json')) return { err: 'Bad request' };
  if (limited(ip)) return { err: 'Too many attempts. Wait a minute.', code: 429 };
  const body = await readBody(req);
  if (req.url === '/api/register') {
    if (players[pid]?.user) return { err: 'You already have an account on this device.' };
    const nm = String(body.name || '').trim();
    if (nm && !/^[A-Za-z0-9_ ]{3,16}$/.test(nm)) return { err: 'Display name: 3-16 letters, numbers, spaces or _' };
    const name = nm || `Roller-${pick(NUM, 4)}`;
    const code = newCode();
    codes.users[codeKey(code)] = { pid }; saveCodes();
    (players[pid] ||= { ep: 0, last: null }).user = name; save();
    return { out: { ok: true, code, user: name } }; // the only time the code is ever shown
  }
  const a = codes.users[codeKey(body.code || '')];
  if (!a || !players[a.pid]) return { err: 'That code was not found. Check for typos.' };
  return { out: { ok: true, user: players[a.pid].user }, cookie: ck(a.pid) };
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.url === '/healthz') return res.end('ok');
  const json = (o, hdr = {}) => { res.writeHead(200, { 'Content-Type': 'application/json', ...hdr }); res.end(JSON.stringify(o)); };
  if (req.url.startsWith('/api/')) {
    let pid = (req.headers.cookie || '').match(/gdid=([a-f0-9]{32})/)?.[1], hdr = {};
    const ck = id => `gdid=${id}; Path=/; Max-Age=315360000; HttpOnly; SameSite=Lax${req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`;
    if (!pid) { pid = crypto.randomBytes(16).toString('hex'); hdr['Set-Cookie'] = ck(pid); }
    if (req.url === '/api/leaderboard') return json(board());
    if (req.url === '/api/badges') return json(idBadges.list());
    if (req.method === 'POST' && ['/api/register', '/api/login', '/api/logout'].includes(req.url))
      return auth(req, pid, ck).then(r => { if (r.cookie) hdr['Set-Cookie'] = r.cookie; res.writeHead(r.err ? r.code || 400 : 200, { 'Content-Type': 'application/json', ...hdr }); res.end(JSON.stringify(r.err ? { error: r.err } : r.out)); });
    const p = players[pid] ||= { ep: 0, last: null }, fo = readForce();
    if (fo?.reset && p.last?.day === today()) { p.ep -= p.last.ep; p.last = null; save(); }
    if (req.url === '/api/profile' && req.method === 'GET') return json(profile(p));
    if (req.method === 'POST' && ['/api/profile', '/api/friend', '/api/unfriend'].includes(req.url))
      return social(req, p).then(r => { res.writeHead(r.err ? r.code || 400 : 200, { 'Content-Type': 'application/json', ...hdr }); res.end(JSON.stringify(r.err ? { error: r.err } : r.out)); });
    if (req.method === 'POST' && req.url === '/api/feedback')
      return feedback(req, p).then(r => { res.writeHead(r.err ? r.code || 400 : 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(r.err ? { error: r.err } : r.out)); });
    if (req.url === '/api/inventory') return json(inv(p));
    if (req.url === '/api/roll' && req.method === 'POST' && p.last?.day !== today()) {
      p.last = fo ? describe(forcedIndex(fo.id), today()) : doRoll(pid, today());
      if (fo) fs.rmSync(FF, { force: true });
      if (!fo) {
        const x = p.last, b = { ep: x.ep, name: x.level.name, id: x.level.id, day: x.day, tier: x.tier };
        (p.hist ||= []).push({ ...b, st: x.level.st, diff: x.level.diff }); if (p.hist.length > 400) p.hist.shift();
        if (!p.best) p.best = b; else if (x.ep > p.best.ep) { p.best = b; x.pb = true; }
        if (!record || x.ep > record.ep) { if (record) x.wr = true; record = b; fs.writeFileSync(RF, JSON.stringify(b)); }
      }
      p.ep += p.last.ep; save();
    }
    return json({ roll: p.last?.day === today() ? p.last : null, lifetime: p.ep, msLeft: msLeft(), best: p.best || null, record, user: p.user || null, color: p.color || null }, hdr);
  }
  const f = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : path.normalize(req.url).replace(/^(\.\.[\/\\])+/, ''));
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end('404')) : (res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : 'text/plain' }), res.end(d)));
});
if (require.main === module) server.listen(PORT, () => console.log(`GD-RNGdle on http://localhost:${PORT}  (${levels.length} levels)`));

module.exports = { levels, describe, idBadges };
