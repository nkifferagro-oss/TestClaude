import * as XLSX from 'xlsx';

/**
 * Parse frequency string to number of days.
 * Accepts: "7", "14", "7j", "7 jours", "1 sem", "2 semaines", "10d", etc.
 */
function parseFrequency(str) {
  if (!str) return 7;
  const s = String(str).trim().toLowerCase();

  // Match "N sem/semaine/semaines/w/week/weeks"
  const weekMatch = s.match(/^(\d+(?:[.,]\d+)?)\s*(sem(?:aine[s]?)?|w(?:eek[s]?)?)$/);
  if (weekMatch) return Math.round(parseFloat(weekMatch[1].replace(',', '.')) * 7);

  // Match "N j/jour/jours/d/day/days"
  const dayMatch = s.match(/^(\d+(?:[.,]\d+)?)\s*(j(?:ours?)?|d(?:ays?)?)?$/);
  if (dayMatch) return Math.round(parseFloat(dayMatch[1].replace(',', '.')));

  return 7;
}

/**
 * Try to extract a week number from a column header.
 * Accepts: "S1", "Sem 1", "Semaine 1", "W1", "1", "01", etc.
 */
function extractWeekNumber(header) {
  const s = String(header).trim();
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

/**
 * Parse an Excel or CSV file and return structured snake data.
 *
 * Expected columns (in order, starting at column 1):
 *   1. Espèce
 *   2. Nb spécimens
 *   3. Taille proie
 *   4. Fréquence (days)
 *   5+. Weekly columns (S1, S2, …) with values: ok | ref | p | M | G | SG
 *
 * Returns: { snakes: Snake[], maxWeek: number }
 */
export function parseSpreadsheet(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length < 2) {
          throw new Error('Le fichier est vide ou ne contient pas de données.');
        }

        const headerRow = rows[0];

        // Detect week columns: columns index >= 4 (0-based) with parseable week numbers
        const weekCols = [];
        for (let i = 4; i < headerRow.length; i++) {
          const h = String(headerRow[i]).trim();
          if (h === '') continue;
          const wn = extractWeekNumber(h);
          if (wn !== null) {
            weekCols.push({ colIndex: i, weekNumber: wn });
          } else {
            // Use sequential order for unnamed columns
            weekCols.push({ colIndex: i, weekNumber: i - 3 });
          }
        }

        const snakes = [];
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          const species = String(row[0] ?? '').trim();
          if (!species) continue; // skip blank rows

          const nbSpecimens = Math.max(1, parseInt(String(row[1]).trim(), 10) || 1);
          const preySize = String(row[2] ?? '').trim();
          const frequency = parseFrequency(String(row[3] ?? '').trim());

          const weekHistory = {};
          for (const { colIndex, weekNumber } of weekCols) {
            const val = String(row[colIndex] ?? '').trim();
            if (val !== '') {
              weekHistory[weekNumber] = val.toLowerCase();
            }
          }

          snakes.push({ species, nbSpecimens, preySize, frequency, weekHistory });
        }

        if (snakes.length === 0) {
          throw new Error('Aucune donnée serpent trouvée. Vérifiez le format du fichier.');
        }

        const maxWeek = weekCols.length > 0
          ? Math.max(...weekCols.map((w) => w.weekNumber))
          : 0;

        resolve({ snakes, maxWeek });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Impossible de lire le fichier.'));
    reader.readAsArrayBuffer(file);
  });
}
