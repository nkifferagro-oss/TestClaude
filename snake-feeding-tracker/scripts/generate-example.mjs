/**
 * Generates an example Excel spreadsheet (exemple_suivi.xlsx)
 * Run: node scripts/generate-example.mjs
 */
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const headers = ['Espèce', 'Nb', 'Taille proie', 'Fréquence', 'S1', 'S2', 'S3', 'S4', 'S5'];

const data = [
  headers,
  ['Ball python (juvénile)',  2, 'Souris S',   '7j',  'ok',  'ok',  'ref', 'ok',  ''],
  ['Ball python (adulte)',    1, 'Souris M',   '14j', 'ok',  'p',   'ok',  'p',   ''],
  ['Boa constrictor',         1, 'Rat S',      '14j', 'ok',  'p',   'M',   'M',   ''],
  ['Corn snake (juvénile)',   3, 'Souris XS',  '7j',  'ok',  'ok',  'ok',  'ok',  ''],
  ['Corn snake (adulte)',     2, 'Souris M',   '7j',  'ok',  'ref', 'ok',  'ok',  ''],
  ['Python regius (adulte)',  1, 'Rat M',      '21j', 'ok',  'p',   'p',   'ok',  ''],
  ['Hognose',                 1, 'Souris S',   '7j',  'ok',  'ok',  'ok',  'ref', ''],
  ['Kingsnake',               2, 'Souris M',   '10j', 'ok',  'p',   'ok',  'p',   ''],
  ['Dione ratsnake',          1, 'Raton S',    '7j',  'ok',  'ok',  'M',   'ok',  ''],
  ['Burmese python',          1, 'Rat XL',     '14j', 'ok',  'p',   'SG',  'p',   ''],
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Column widths
ws['!cols'] = [
  { wch: 28 }, { wch: 6 }, { wch: 14 }, { wch: 12 },
  { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 },
];

XLSX.utils.book_append_sheet(wb, ws, 'Suivi nourrissage');
const outPath = join(__dir, '..', 'public', 'exemple_suivi.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Created:', outPath);
