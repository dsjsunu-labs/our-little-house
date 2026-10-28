#!/usr/bin/env node
/* 把 src 下的片段拼成单文件 index.html：node build.mjs
   改完 src 里的任何一个文件后运行一次即可。 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');

const read = name => fs.readFileSync(path.join(SRC, name), 'utf8').replace(/^\uFEFF/, '');

const shell = read('shell.html');
const styles = read('styles.css');
const parts = ['01-base.js', '02-home.js', '03-pages.js', '03b-countdown.js', '04-sheets.js', '05-handlers.js'];
const js = parts.map(read).join('\n\n');

if (!shell.includes('/*__STYLES__*/') || !shell.includes('/*__APP__*/')) {
  throw new Error('shell.html is missing a placeholder');
}
if (/<\/script/i.test(js)) {
  throw new Error('JavaScript contains a literal closing script tag');
}

const html = shell.replace('/*__STYLES__*/', styles).replace('/*__APP__*/', js);
fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
console.log(`wrote index.html (${html.length.toLocaleString()} chars)`);
