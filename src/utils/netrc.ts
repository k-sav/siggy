import fs from 'fs';
import { join } from 'path';

export function getNetRcKey(key) {
  const netrc = parseNetrc();
  const sc = netrc['statsig.com'] || {};
  return sc[key];
}

export function setNetRcKey(key, value) {
  const netrc = parseNetrc();
  const sc = netrc['statsig.com'] || {};
  sc[key] = value;
  netrc['statsig.com'] = sc;
  saveNetrc(netrc);
}

export function parseNetrc() {
  var home = getHomePath();

  if (!home) {
    return {};
  }
  const file = join(home, '.netrc');

  if (!file || !fs.existsSync(file)) {
    return {};
  }
  const contents = fs.readFileSync(file, 'utf-8');
  return parseContents(contents);
};

function parseContents(content) {
  const lines = content.split('\n');
  for (let ii = 0; ii < lines.length; ii++) {
    var index = lines[ii].indexOf('#');
    if (index > -1) {
      lines[ii] = lines[ii].substring(0, index);
    }
  }
  content = lines.join('\n');

  const tokens = content.split(/[ \t\n\r]+/);
  let machines = {};
  let m = null;
  
  // if first index in array is empty string, strip it off (happens when first
  // line of file is comment. Breaks the parsing)
  if (tokens[0] === '') {
    tokens.shift();
  }

  for(let i = 0; i < tokens.length; i+=2) {
    const key = tokens[i];
    let value = tokens[i + 1];

    if (!key || !value) {
      continue;
    }

    if (key === 'machine') {
      m = {};
      machines[value] = m;
    }
    else {
      m[key] = value;
    }
  }

  return machines;
};

function format(machines){
  var lines = [];
  var keys = Object.getOwnPropertyNames(machines).sort();

  keys.forEach(function(key){
    lines.push('machine ' + key);
    const machine = machines[key];
    const attrs = Object.getOwnPropertyNames(machine).sort();
    attrs.forEach(attr => {
      if (typeof(machine[attr]) === 'string') {
        lines.push('    ' + attr + ' ' + machine[attr]);
      }
    });
  });
  return lines.join('\n');
};

export function saveNetrc(contents) {
  const home = getHomePath();
  const destFile = join(home, '.netrc');
  const data = format(contents) + '\n';
  fs.writeFileSync(destFile, data);
};

function getHomePath() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}