// node check.js 4284013        score a level ID (rarity + ID badges)
// node check.js                prompts for IDs until you press Enter on an empty line
const { levels, describe, idBadges } = require('./server.js');
const f = n => n.toLocaleString();

function check(id) {
  const i = levels.findIndex(l => l.id === id);
  if (i < 0) {
    const b = idBadges(id), idPts = b.reduce((a, x) => a + x.e, 0);
    console.log(`\n#${id} is not in the level pool, showing ID badges only.`);
    b.forEach(x => console.log(`  [${x.r}] ${x.n}  +${f(x.e)}  (${x.d})`));
    return console.log(`  ID total: ${f(idPts)} EP\n`);
  }
  const r = describe(i, 'check'), L = r.level;
  console.log(`\n${L.name} by ${L.by}  (#${L.id})`);
  console.log(`  ${L.diff}, ${L.st} stars${L.main ? ', MAIN LEVEL' : ''}`);
  console.log(`  ${r.tier} (by total EP); the level alone is top ${r.top}% of rolls`);
  console.log('  Level rarity:'); r.parts.forEach(p => console.log(`    ${p.n.padEnd(15)} +${f(p.e).padStart(7)}  ${p.d}`));
  console.log('  ID badges:'); r.badges.forEach(x => console.log(`    [${x.r}] ${x.n.padEnd(22)} +${f(x.e).padStart(11)}  ${x.d}`));
  if (!r.badges.length) console.log('    none');
  console.log(`  TOTAL: ${f(r.ep)} EP  (level ${f(r.rPts)} + ID ${f(r.idPts)})\n`);
}

const arg = parseInt(process.argv[2]);
if (arg) check(arg);
else {
  const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  const ask = () => rl.question('Level ID (Enter to quit): ', a => { a = parseInt(a); if (!a) return rl.close(); check(a); ask(); });
  ask();
}
