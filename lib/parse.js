'use strict';

const fs = require('node:fs');
const path = require('node:path');

const timeCodeToSeconds = (hourMinuteSecond) => {
  if (hourMinuteSecond.length === 2) {
    const [minutes, seconds] = hourMinuteSecond;
    return minutes * 60 + seconds;
  }
  const [hours, minutes, seconds ] = hourMinuteSecond;
  return hours * 3600 + minutes * 60 + seconds;
};

const parseWithTime = (url, timeCode, text, seconds) => {
  const parsedLine = `[${timeCode} ${text}](${url}?t=${seconds})`;
  return parsedLine;
};

const parseTitle = (url, title) => {
  const str = title.substring(3);
  const parsedTitle = `## [${str}](${url})`;
  return parsedTitle;
};

const read = async (file) => {
  const { readFile } = fs.promises;
  try {
    const text = await readFile(file, 'utf8');
    return text;
  } catch (e) {
    throw e;
  }
};

const generateFileName = (source) => 'parsed-' + path.basename(source);

module.exports = async (file) => {
  const data = await read(file);
  const output = generateFileName(file);
  const ws = fs.createWriteStream(output);
  const lines = data.split('\n');
  let url = undefined;
  let title = undefined;
  for (const line of lines) {
    if (line === '```') continue;
    if (line.startsWith('http')) {
      url = line;
      if (title) {
        ws.write(parseTitle(url, title) + '\n');
        title = undefined;
      }
      continue;
    }
    if (line.startsWith('##')) {
      title = line;
      continue;
    }
    const [timeCode] = line.split(' ');
    if (!timeCode) {
      ws.write(line + '\n');
      continue;
    }
    const hourMinuteSecond = timeCode.split(':').map(Number);
    const hasNaN = hourMinuteSecond.some(isNaN);
    if (hasNaN) {
      ws.write(line + '\n');
      continue;
    }
    const seconds = timeCodeToSeconds(hourMinuteSecond);
    const text = line.replace(timeCode, '').substring(1);
    const parsedLine = parseWithTime(url, timeCode, text, seconds);
    ws.write('- ' + parsedLine + '\n');
  }
  console.log(`${output} is created and parsed!`);
};
