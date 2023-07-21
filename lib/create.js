'use strict';

const fs = require('node:fs');
const path = require('node:path');

const timeCodeToSeconds = (timeCode) => {
  const hourMinuteSecond = timeCode.split(':').map(Number);
  if (hourMinuteSecond.length === 2) {
    const [minutes, seconds] = hourMinuteSecond;
    return minutes * 60 + seconds;
  }
  const [hours, minutes, seconds] = hourMinuteSecond;
  return hours * 3600 + minutes * 60 + seconds;
};

const generateTitle = (title, url) => `\n## [${title}](${url})\n\n`;

const lineParser = (url, timeCode, text) => {
  const seconds = timeCodeToSeconds(timeCode);
  const line = `- [${timeCode} ${text}](${url}?t=${seconds})\n`;
  return line;
};

const idk = (ws, lines) => {
  const title = lines.shift();
  const url = lines.shift();
  ws.write(generateTitle(title, url));
  for (const line of lines) {
    const [timeCode] = line.split(' ');
    const text = line.replace(timeCode, '').substring(1);
    const parsedLine = lineParser(url, timeCode, text);
    ws.write(parsedLine);
  }
};

const isArrayOfArrays = (arr) => arr.every(Array.isArray);

module.exports = (file, datas) => {
  const ws = fs.createWriteStream(file, { flags: 'a' });
  if (!isArrayOfArrays(datas)) idk(ws, datas);
  else for (const data of datas) idk(ws, data);
  console.log(`${path.basename(file)} is created!`);
};
