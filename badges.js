// Badges translated from the RNGdle wiki. Entry: [name, description, points, test(s, n), family?]
// Within one family only the highest-scoring badge is awarded.
const D = s => [...s].map(Number), U = s => new Set(s).size, sum = s => D(s).reduce((a, b) => a + b, 0);
const cnt = s => { const m = {}; for (const c of s) m[c] = (m[c] || 0) + 1; return Object.values(m); };
const run = (s, f) => { let b = 1, c = 1; for (let i = 1; i < s.length; i++) { c = f(+s[i - 1], +s[i]) ? c + 1 : 1; b = Math.max(b, c); } return b; };
const all = (s, f) => D(s).every((x, i, a) => i === 0 || f(a[i - 1], x));
const pw = (n, k) => { const r = Math.round(n ** (1 / k)); return r > 1 && r ** k === n; };
const prime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const fib = n => { let a = 1, b = 2; while (b < n) [a, b] = [b, a + b]; return n === 1 || b === n; };
const cons = (s, k) => { for (let L = 1; L * k <= s.length; L++) { let t = '', a = +s.slice(0, L); for (let j = 0; j < k; j++) t += a + j; if (t === s) return true; } return false; };
const has = (name, d, pts, x, fam) => [name, `Contains the digits ${x}`, pts, s => s.includes(x), fam];
const end = (name, pts, x, fam) => [name, `Ends in ${x}`, pts, s => s.endsWith(x), fam];
const same = k => s => run(s, (a, b) => a === b) >= k;
const NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const EL = ['Lone Zero', 'Lone One', 'Lone Two', 'Lone Three', 'Lone Four', 'Lone Five', 'Lone Six', 'Lone Seven', 'Lone Eight', 'Lone Nine'];
const EL_PTS = [309, 282, 282, 282, 282, 282, 282, 282, 282, 282];

const B = [
  ...NAMES.map((n, i) => [n, `The number ${i}`, 100000100, s => s === String(i)]),
  ['Single Digit', 'Only one digit long', 10000010, s => s.length === 1],
  ['Two Digits', 'Two digits long', 1111112, s => s.length === 2], ['Three Digits', 'Three digits long', 111111, s => s.length === 3],
  ['Four Digits', 'Four digits long', 11111, s => s.length === 4], ['Five Digits', 'Five digits long', 1111, s => s.length === 5],
  ['Six Digits', 'Six digits long', 111, s => s.length === 6],
  ['Contiguous Sixes', 'Six identical digits in a row', 10000010, same(6), 'same'], ['Five of a Kind (run)', 'Five identical digits in a row', 552487, same(5), 'same'],
  ['Contiguous Quads', 'Four identical digits in a row', 37023, same(4), 'same'], ['Contiguous Trips', 'Three identical digits in a row', 2784, same(3), 'same'],
  ['Homogeneous', 'Every digit is the same', 2222224, s => s.length > 1 && U(s) === 1 && s[0] !== '0'],
  ['Deep Void (5)', 'Contains 00000', 10000010, s => s.includes('00000'), 'void'], ['Deep Void (4)', 'Contains 0000', 552487, s => s.includes('0000'), 'void'],
  ['Deep Void (3)', 'Contains 000', 37023, s => s.includes('000'), 'void'], ['Deep Void', 'Contains 00', 2784, s => s.includes('00'), 'void'],
  end('Eon', 10000010, '00000', 'z'), end('Epoch', 1000001, '0000', 'z'), end('Millennium', 100000, '000', 'z'), end('Century', 10000, '00', 'z'), end('Clean', 1000, '0', 'z'),
  end('Semi-Eon', 10000010, '50000', 'z'), end('Semi-Epoch', 1000001, '5000', 'z'), end('Semi-Millennium', 100000, '500', 'z'), end('Semi-Century', 10000, '50', 'z'), end('Semi-Clean', 1000, '5', 'z'),
  end('Quint Nine', 10000010, '99999', 'n'), end('Quad Nine', 1000001, '9999', 'n'), end('Triple Nine', 100000, '999', 'n'), end('Double Nine', 10000, '99', 'n'),
  end('Quarter-Century', 10000, '25'), end('Three-Quarter-Century', 10000, '75'),
  has('Jackpot Five', '', 5263163, '77777', 'jp'), has('Jackpot Four', '', 357143, '7777', 'jp'), has('Jackpot', '', 27027, '777', 'jp'),
  has('Devil', '', 27027, '666'), has('Secret Agent', '', 34614, '007'), has('Orientation', '', 25132, '101'), has('Error 404', '', 25132, '404'),
  has('Calendar', '', 25006, '365'), has('Botanist', '', 25006, '420'), has('Emergency', '', 25006, '911'),
  has('Leet', '', 333334, '1337'), has('Big Brother', '', 333334, '1984'), has('Hell', '', 333334, '7734'), has('Hello', '', 11111122, '07734'),
  has('8008', '', 333334, '8008'), has('80085', '', 5000005, '80085'), has('Very Nice', '', 334448, '6969'), has('6767', '', 334448, '6767'), has('Deeper Meaning', '', 334448, '4242'),
  has('Pi Slice (5)', '', 5000005, '31415', 'pi'), has('Pi Slice (4)', '', 333334, '3141', 'pi'), has('Pi Slice (3)', '', 25006, '314', 'pi'),
  has('E Slice (5)', '', 5000005, '27182', 'e'), has('E Slice (4)', '', 333334, '2718', 'e'), has('E Slice (3)', '', 25006, '271', 'e'),
  has('Tau Slice (5)', '', 5000005, '62831', 'tau'), has('Tau Slice (4)', '', 333334, '6283', 'tau'),
  has('Meaning of Life', '', 2024, '42'), has('Six-Seven', '', 2024, '67'), has('Nice', '', 2024, '69'), has('Eighty-Six', '', 2024, '86'),
  ['Funny Numbers', 'Contains both 69 and 420', 1666668, s => s.includes('69') && s.includes('420')],
  ['Sequence (6)', 'Six consecutive digits in order', 11111122, s => Math.max(run(s, (a, b) => b === a + 1), run(s, (a, b) => b === a - 1)) >= 6, 'seq'],
  ['Straight', 'Five consecutive digits in order', 454546, s => Math.max(run(s, (a, b) => b === a + 1), run(s, (a, b) => b === a - 1)) >= 5, 'seq'],
  ['Sequence (4)', 'Four consecutive digits in order', 25907, s => Math.max(run(s, (a, b) => b === a + 1), run(s, (a, b) => b === a - 1)) >= 4, 'seq'],
  ['Sequence (3)', 'Three consecutive digits in order', 1716, s => Math.max(run(s, (a, b) => b === a + 1), run(s, (a, b) => b === a - 1)) >= 3, 'seq'],
  ['Cascade', 'Each digit is the previous plus 1', 3333337, s => s.length > 2 && s[0] !== '0' && all(s, (a, b) => b === a + 1)],
  ['Waterfall', 'Each digit is the previous minus 1', 2857146, s => s.length > 2 && all(s, (a, b) => b === a - 1)],
  ['Ascension', 'Each digit is bigger than the last', 219298, s => s.length > 2 && all(s, (a, b) => b > a)],
  ['Decay', 'Each digit is smaller than the last', 119474, s => s.length > 2 && all(s, (a, b) => b < a)],
  ['Steps', 'Digits never go down', 20202, s => s.length > 2 && all(s, (a, b) => b >= a)],
  ['Slopes', 'Digits never go up', 12582, s => s.length > 2 && all(s, (a, b) => b <= a)],
  ['Even Spacing', 'Digits form an arithmetic sequence', 862070, s => s.length > 2 && U(s) > 1 && new Set(D(s).slice(1).map((x, i) => x - D(s)[i])).size === 1],
  ['Palindrome', 'Reads the same both ways', 50025, s => s.length > 2 && s === [...s].reverse().join('')],
  ['Pocket Mirror', 'Contains a 4 or 5 digit palindrome', 2124, s => /(\d)(\d)\2\1|(\d)(\d)\d\4\3/.test(s)],
  ['Strobogrammatic', 'Looks the same rotated 180 degrees', 502513, s => s.length > 1 && [...s].every((c, i) => ({ 0: 0, 1: 1, 8: 8, 6: 9, 9: 6 })[c] === +s[s.length - 1 - i])],
  ['Echo', 'First half equals second half', 100100, s => s.length > 1 && s.length % 2 === 0 && s.slice(0, s.length / 2) === s.slice(s.length / 2)],
  ['Mini Echo', 'A two-digit sequence repeats back to back', 3704, s => /(\d\d)\1/.test(s)],
  ['Rhyme', 'A sequence of 2+ digits appears twice', 1872, s => /(\d{2,})\d*\1/.test(s)],
  ['Bookends', 'Starts and ends with the same two digits', 10010, s => s.length > 3 && s.slice(0, 2) === s.slice(-2)],
  ['Mirror Bookends', 'Ends with the first two digits reversed', 10010, s => s.length > 3 && s.slice(0, 2) === [...s.slice(-2)].reverse().join('')],
  ['Equilibrium', 'First and last digits are equal', 1000, s => s.length > 1 && s[0] === s.at(-1)],
  ['Zipper', 'Two different digits alternating', 246914, s => s.length > 3 && U(s) === 2 && run(s, (a, b) => a !== b) === s.length && s.split('').every((c, i) => c === s[i % 2])],
  ['Double Hop', 'The same digit every two positions', 5321, s => s.length > 3 && [...s].every((c, i) => i < 2 || c === s[i - 2])],
  ['Duality', 'Made of exactly two different digits', 21654, s => U(s) === 2 && s.length > 2], ['Trinity', 'Exactly three different digits', 1265, s => U(s) === 3 && s.length > 3],
  ['Quartet', 'Exactly four different digits', 290, s => U(s) === 4 && s.length > 4], ['Heterogeneous', 'Every digit is unique', 593, s => U(s) === s.length && s.length > 1],
  ['Binary Soul', 'Only 0s and 1s', 1538463, s => /^[01]+$/.test(s) && s.length > 1],
  ['Firefly', 'One odd digit out, all others identical', 82237, s => s.length > 3 && U(s) === 2 && cnt(s).includes(1)],
  ['Five of a Kind', 'Contains five of the same digit', 198020, s => Math.max(...cnt(s)) >= 5, 'kind'], ['Four of a Kind', 'Contains four of the same digit', 8436, s => Math.max(...cnt(s)) >= 4, 'kind'],
  ['Three of a Kind', 'Contains three of the same digit', 724, s => Math.max(...cnt(s)) >= 3, 'kind'],
  ['Full House', 'A triple of one digit and a pair of another', 2397, s => { const c = cnt(s); return c.includes(3) && c.includes(2); }],
  ['Three Pair', 'Three pairs', 10288, s => cnt(s).filter(x => x === 2).length >= 3], ['Two Pair', 'Two pairs', 377, s => cnt(s).filter(x => x === 2).length >= 2],
  ['Pair', 'One digit appears twice', 120, s => cnt(s).includes(2)],
  ['Contiguous Three Pair', 'Three adjacent pairs (aabbcc)', 154321, s => /(\d)\1(\d)\2(\d)\3/.test(s)], ['Contiguous Two Pair', 'Two adjacent pairs (aabb)', 3957, s => /(\d)\1(\d)\2/.test(s)],
  ['Contiguous Pair', 'Two identical digits side by side', 249, s => /(\d)\1/.test(s)],
  ['Snake Eyes', 'Exactly one pair of 1s and no other pairs', 2121, s => cnt(s).filter(x => x === 2).length === 1 && (s.match(/1/g) || []).length === 2],
  ['Hopscotch', 'A digit repeats two positions apart', 312, s => [...s].some((c, i) => i > 1 && c === s[i - 2])],
  ['Turtle', 'Neighbouring digits differ by at most 1', 36049, s => s.length > 3 && all(s, (a, b) => Math.abs(a - b) <= 1)],
  ['Mini Scramble', '3-5 adjacent digits that sort into a run', 579, s => { for (let L = 3; L <= 5; L++) for (let i = 0; i + L <= s.length; i++) { const w = D(s.slice(i, i + L)); if (new Set(w).size === L && Math.max(...w) - Math.min(...w) === L - 1) return true; } return false; }],
  ['Neighbors', 'Contains two digits that differ by 1', 161, s => D(s).some(a => D(s).includes(a + 1))],
  ['Gap One', 'First and last digits differ by 1', 529, s => s.length > 1 && Math.abs(s[0] - s.at(-1)) === 1],
  ['Grounded', 'First digit is smaller than the last', 250, s => s.length > 1 && s[0] < s.at(-1)], ['Liftoff', 'First digit is bigger than the last', 200, s => s.length > 1 && s[0] > s.at(-1)],
  ['Hills', 'Digits alternate strictly up and down', 733, s => s.length > 3 && D(s).every((x, i, a) => i < 2 || (a[i - 1] - a[i - 2]) * (x - a[i - 1]) < 0)],
  ['Mountain', 'Strictly up to a peak, then strictly down', 5885, s => { const d = D(s), p = d.indexOf(Math.max(...d)); return p > 0 && p < d.length - 1 && all(s.slice(0, p + 1), (a, b) => b > a) && all(s.slice(p), (a, b) => b < a); }],
  ['Valley', 'Strictly down to a low point, then strictly up', 4199, s => { const d = D(s), p = d.indexOf(Math.min(...d)); return p > 0 && p < d.length - 1 && all(s.slice(0, p + 1), (a, b) => b < a) && all(s.slice(p), (a, b) => b > a); }],
  ['Flush', 'All digits even or all odd', 2845, s => D(s).every(x => x % 2 === D(s)[0] % 2) && s.length > 1],
  ['Alternator', 'Digit parity alternates', 2845, s => s.length > 2 && all(s, (a, b) => (a + b) % 2 === 1)],
  ['Divisible by 3', 'Every digit is 0, 3, 6 or 9', 24414, s => /^[0369]+$/.test(s) && s.length > 1],
  ['Heavy', 'Digit sum is 45 or more', 33300, s => sum(s) >= 45], ['Feather', 'Digit sum is under 15', 2667, s => sum(s) < 15], ['Blackjack', 'Digit sum is exactly 21', 2521, s => sum(s) === 21],
  ['Low Ball', 'Only digits 0-4', 6400, s => /^[0-4]+$/.test(s) && s.length > 1], ['High Roller', 'Only digits 5-9', 5120, s => /^[5-9]+$/.test(s) && s.length > 1],
  ['Balanced', 'Both halves have the same digit sum', 1959, s => (s.length === 4 || s.length === 6) && sum(s.slice(0, s.length / 2)) === sum(s.slice(s.length / 2))],
  ['Spy Number', 'Digit sum equals digit product', 1030929, s => s.length > 1 && sum(s) === D(s).reduce((a, b) => a * b, 1)],
  ['Lucky Seven', 'Contains a 7', 213, s => s.includes('7')], ['Void', 'Contains no zeros', 167, s => !s.includes('0')],
  ...EL.map((e, i) => [e, `Contains exactly one ${i}`, EL_PTS[i], s => (s.match(new RegExp(i, 'g')) || []).length === 1]),
  ['Odd', 'Is odd', 200, (s, n) => n % 2 === 1], ['Even', 'Is even', 200, (s, n) => n % 2 === 0],
  ['Lucky Seven (divisible)', 'Divisible by 7', 700, (s, n) => n % 7 === 0], ['Dozen', 'Divisible by 12', 1200, (s, n) => n % 12 === 0], ['Eleven', 'Divisible by 11', 1100, (s, n) => n % 11 === 0],
  ['Prime Number', 'Only divisible by 1 and itself', 1274, (s, n) => prime(n)], ['Harshad Number', 'Divisible by its digit sum', 1048, (s, n) => n % sum(s) === 0],
  ['Fibonacci Number', 'A Fibonacci number', 3333337, (s, n) => fib(n)], ['Power of Two', 'A power of 2', 5000005, (s, n) => n > 0 && (n & (n - 1)) === 0],
  ['6th Power', 'A perfect 6th power', 9090918, (s, n) => pw(n, 6), 'pow'], ['5th Power', 'A perfect 5th power', 6250006, (s, n) => pw(n, 5), 'pow'],
  ['4th Power', 'A perfect 4th power', 3125003, (s, n) => pw(n, 4), 'pow'], ['3rd Power', 'A perfect cube', 990100, (s, n) => pw(n, 3), 'pow'], ['2nd Power', 'A perfect square', 99900, (s, n) => pw(n, 2), 'pow'],
  ['Pronic Number', 'Product of two consecutive integers', 100000, (s, n) => { const r = Math.floor(Math.sqrt(n)); return r * (r + 1) === n; }],
  ['4 Consecutive Numbers', 'Four consecutive integers joined together', 25000025, s => cons(s, 4), 'cn'], ['3 Consecutive Numbers', 'Three consecutive integers joined together', 555556, s => cons(s, 3), 'cn'],
  ['2 Consecutive Numbers', 'Two consecutive integers joined together', 50505, s => s.length > 2 && cons(s, 2), 'cn'],
];

// Own badges (GD themed)
B.push(
  ['Founder', 'ID under 10,000', 60000, (s, n) => n < 10000, 'age'], ['Elder', 'ID under 100,000', 15000, (s, n) => n < 100000, 'age'],
  ['Veteran', 'ID under 1,000,000', 4000, (s, n) => n < 1000000, 'age'],
  ['Round Million', 'A multiple of 1,000,000', 500000, (s, n) => n % 1000000 === 0],
  has('Launch Day', 'Contains 2013, the year Geometry Dash launched', 300000, '2013'), has('Ten Ten', "Contains 1010, a demon's star count twice", 300000, '1010'),
  ['Palindromic Prime', 'A prime that reads the same backwards', 150000, (s, n) => s.length > 2 && s === [...s].reverse().join('') && prime(n)],
  ['WYSI', 'Contains 727. When you see it.', 727727, s => s.includes('727')],
  ['Lucky Streak', 'Three or more 7s anywhere', 6000, s => (s.match(/7/g) || []).length >= 3],
);

// Impossible or absurdly unlikely for GD IDs (up to about 9 digits): removed.
const DROP = new Set(['Zero', 'Cascade', 'Waterfall', 'Ascension', 'Decay', 'Even Spacing', 'Zipper', 'Double Hop', 'Binary Soul', 'Homogeneous',
  'Three Digits', 'Four Digits', 'Power of Two', 'Fibonacci Number', '6th Power', '5th Power', '4th Power', '3rd Power', '4 Consecutive Numbers',
  'Eon', 'Semi-Eon', 'Quint Nine']);
const CAP = 1000000; // no single badge is worth more than this

// New names
const RENAME = {
  'Single Digit': 'Lone Digit', 'Two Digits': 'Double Digits', 'Five Digits': 'Five-Figure', 'Six Digits': 'Six-Figure',
  'Contiguous Sixes': 'Hexstack', 'Five of a Kind (run)': 'Pentastack', 'Contiguous Quads': 'Quad Stack', 'Contiguous Trips': 'Triple Stack',
  'Deep Void (5)': 'Abyss (5)', 'Deep Void (4)': 'Abyss (4)', 'Deep Void (3)': 'Abyss (3)', 'Deep Void': 'Abyss',
  'Epoch': 'Ten K', 'Millennium': 'Thousand Club', 'Century': 'Hundred Club', 'Clean': 'Round Ten',
  'Semi-Epoch': 'Half Ten K', 'Semi-Millennium': 'Half Thousand', 'Semi-Century': 'Half Hundred', 'Semi-Clean': 'Half Ten',
  'Quad Nine': 'Nines x4', 'Triple Nine': 'Nines x3', 'Double Nine': 'Nines x2', 'Quarter-Century': 'Quarter Hundred', 'Three-Quarter-Century': 'Three-Quarter Hundred',
  'Jackpot Five': 'Slot Machine (5)', 'Jackpot Four': 'Slot Machine (4)', 'Jackpot': 'Slot Machine', 'Devil': 'Beast Mark', 'Secret Agent': 'Double-O',
  'Orientation': 'Intro Course', 'Error 404': 'Page Missing', 'Calendar': 'Full Year', 'Botanist': 'Garden Club', 'Emergency': 'Dispatch',
  'Leet': 'Elite Code', 'Big Brother': 'Dystopia', 'Hell': 'Underworld', 'Hello': 'Greeting', '8008': 'Calculator Joke', '80085': 'Calculator Joke XL',
  'Very Nice': 'Double Nice', '6767': 'Brainrot Echo', 'Deeper Meaning': 'Answer x2', 'Meaning of Life': 'The Answer', 'Six-Seven': 'Brainrot', 'Nice': 'Nice One',
  'Eighty-Six': 'Cut Off', 'Funny Numbers': 'Meme Combo',
  'Pi Slice (5)': 'Circle Digits (5)', 'Pi Slice (4)': 'Circle Digits (4)', 'Pi Slice (3)': 'Circle Digits (3)',
  'E Slice (5)': 'Euler Digits (5)', 'E Slice (4)': 'Euler Digits (4)', 'E Slice (3)': 'Euler Digits (3)', 'Tau Slice (5)': 'Full Turn (5)', 'Tau Slice (4)': 'Full Turn (4)',
  'Sequence (6)': 'Staircase (6)', 'Straight': 'Staircase (5)', 'Sequence (4)': 'Staircase (4)', 'Sequence (3)': 'Staircase (3)', 'Steps': 'Climb', 'Slopes': 'Slide',
  'Palindrome': 'Mirror Number', 'Pocket Mirror': 'Mini Mirror', 'Strobogrammatic': 'Upside-Down Proof', 'Echo': 'Split Twin', 'Mini Echo': 'Stutter', 'Rhyme': 'Chorus',
  'Bookends': 'Same Ends', 'Mirror Bookends': 'Flipped Ends', 'Equilibrium': 'Matching Ends', 'Duality': 'Two-Tone', 'Trinity': 'Three-Tone', 'Quartet': 'Four-Tone',
  'Heterogeneous': 'All Different', 'Firefly': 'Odd One Out', 'Five of a Kind': 'Quintet', 'Four of a Kind': 'Quad', 'Three of a Kind': 'Trio', 'Full House': 'Poker Night',
  'Three Pair': 'Triple Duo', 'Two Pair': 'Double Duo', 'Pair': 'Duo', 'Contiguous Three Pair': 'Triple Twins', 'Contiguous Two Pair': 'Double Twins', 'Contiguous Pair': 'Twins',
  'Snake Eyes': 'Double Ace', 'Hopscotch': 'Skip Step', 'Turtle': 'Smooth Ride', 'Mini Scramble': 'Jumbled Run', 'Neighbors': 'Next Door', 'Gap One': 'Near Ends',
  'Grounded': 'Uphill', 'Liftoff': 'Downhill', 'Hills': 'Zigzag', 'Mountain': 'Summit', 'Valley': 'Basin', 'Flush': 'Same Parity', 'Alternator': 'Odd-Even Dance',
  'Divisible by 3': 'Tri Digits', 'Heavy': 'Heavyweight', 'Feather': 'Featherweight', 'Blackjack': 'Twenty-One', 'Low Ball': 'Small Fry', 'High Roller': 'Big Fish',
  'Balanced': 'Even Split', 'Spy Number': 'Sum Equals Product', 'Lucky Seven': 'Seven Inside', 'Void': 'Zero-Free', 'Odd': 'Odd Number', 'Even': 'Even Number',
  'Lucky Seven (divisible)': 'Seven Multiple', 'Eleven': 'Eleven Multiple', 'Prime Number': 'Prime Time', 'Harshad Number': 'Self-Divisible', '2nd Power': 'Perfect Square',
  'Pronic Number': 'Neighbour Product', '3 Consecutive Numbers': 'Triple Count', '2 Consecutive Numbers': 'Double Count',
};

const tier = p => p >= 10000010 ? 'MYTHIC' : p >= 1000001 ? 'ANOMALY' : p >= 100000 ? 'EPIC' : p >= 10000 ? 'RARE' : p >= 1000 ? 'SINGULAR' : 'COMMON';

module.exports = function idBadges(id) {
  const s = String(id), n = Number(id), got = [], best = {};
  for (const [name0, d, e0, f, fam] of B) {
    if (DROP.has(name0)) continue;
    const name = RENAME[name0] || name0, e = Math.min(e0, CAP);
    let ok = false; try { ok = f(s, n); } catch {}
    if (!ok) continue;
    const b = { n: name, d, e, r: tier(e) };
    if (fam) { if (!best[fam] || e > best[fam].e) best[fam] = b; } else got.push(b);
  }
  return [...got, ...Object.values(best)].sort((a, b) => b.e - a.e);
};

module.exports.list = () => B.filter(x => !DROP.has(x[0])).map(([n, d, e]) => { const p = Math.min(e, CAP); return { n: RENAME[n] || n, d, e: p, r: tier(p) }; }).sort((a, c) => c.e - a.e);
