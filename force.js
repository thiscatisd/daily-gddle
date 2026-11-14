// node force.js 4284013   -> the next roll will be that level ID (also resets today's roll so you can press GENERATE)
// node force.js clear     -> cancel a queued forced roll
const fs = require('fs'), path = require('path');
const F = path.join(process.env.DATA_DIR || path.join(__dirname, 'data'), 'force.json'), a = process.argv[2];
if (a === 'clear') { fs.rmSync(F, { force: true }); console.log('Forced roll cancelled.'); }
else if (!parseInt(a)) console.log('Usage: node force.js <levelID>   |   node force.js clear');
else {
  const id = parseInt(a), lv = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/levels.json'))).find(l => l.id === id);
  fs.writeFileSync(F, JSON.stringify({ id, reset: true }));
  console.log(lv ? `Next roll: "${lv.n}" by ${lv.by} (#${id}).` : `#${id} is not in the pool; the next roll uses a placeholder level with that ID.`);
  console.log('Refresh the page and press GENERATE. Works with the server already running.');
}
