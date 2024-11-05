const fs = require('fs');
const path = require('path');

const cnameContent = 'survival.game.ysw.kr';
const outputPath = path.resolve(__dirname, 'dist', 'CNAME');

fs.writeFileSync(outputPath, cnameContent, 'utf8');
console.log('CNAME file created successfully.');
