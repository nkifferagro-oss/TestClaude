/**
 * Prey size ordering — from smallest to largest.
 * Keys are lowercase normalized names. Value = sort order (lower = smaller).
 */
const PREY_SIZE_ORDER = {
  // Souris nouveau-nés
  'pinkie': 10, 'pinkies': 10, 'pinky': 10,
  'nouveau-né': 10, 'nouveau né': 10, 'nouveaux-nés': 10,

  // Souriceaux
  'fuzzy': 20, 'fuzzies': 20,
  'souriceaux': 25,

  // Hoppers / juvéniles
  'hopper': 30, 'hoppers': 30,

  // Souris adultes
  'souris xs': 40,
  'souris s': 50, 'petite souris': 50, 'souris small': 50,
  'souris': 60, 'souris m': 60, 'souris medium': 60, 'souris moyenne': 60,
  'souris l': 70, 'grande souris': 70, 'souris large': 70,
  'souris xl': 80,

  // Ratons
  'raton xs': 90,
  'raton s': 100, 'petit raton': 100,
  'raton': 110, 'raton m': 110, 'raton moyen': 110,
  'raton l': 120, 'grand raton': 120,

  // Rats adultes
  'rat xs': 130,
  'rat s': 140, 'petit rat': 140, 'rat small': 140,
  'rat': 150, 'rat m': 150, 'rat moyen': 150, 'rat medium': 150,
  'rat l': 160, 'grand rat': 160, 'rat large': 160,
  'rat xl': 170, 'gros rat': 170,

  // Lapins
  'lapin s': 180, 'petit lapin': 180, 'lapereau': 175,
  'lapin': 190, 'lapin m': 190, 'lapin moyen': 190,
  'lapin l': 200, 'grand lapin': 200,
  'lapin xl': 210,

  // Autres
  'cobaye': 220, 'cobaye s': 215, 'cobaye m': 225, 'cobaye l': 230,
  'poussin': 235,
  'poulet s': 240, 'poulet': 245, 'poulet m': 245, 'poulet l': 250,
};

/** Returns sort order for a prey size string. Unknown sizes sort last. */
export function getPreySizeOrder(preySize) {
  const key = (preySize ?? '').toLowerCase().trim();
  if (key in PREY_SIZE_ORDER) return PREY_SIZE_ORDER[key];

  // Partial match fallback
  for (const [k, v] of Object.entries(PREY_SIZE_ORDER)) {
    if (key.includes(k) || k.includes(key)) return v;
  }

  return 9999;
}

// Statuses that count as a successful meal (reset the feeding clock)
const MEAL_SUCCESS = new Set(['ok', 'g', 'sg']);
// Statuses that mean "don't feed this week" (already decided)
const SKIP_STATUSES = new Set(['ok', 'g', 'sg', 'p', 'm']);

/**
 * Determine which snakes need feeding in `currentWeek`.
 *
 * A snake needs feeding when:
 *   - It has no recorded meal at all (first week ever), OR
 *   - The number of weeks since its last successful meal >= its feeding frequency
 *   - AND the current week column doesn't already have a terminal status (ok/G/SG/p/M)
 *
 * Returns sorted array (by prey size ascending).
 */
export function getSnakesToFeed(snakes, currentWeek) {
  const result = [];

  for (const snake of snakes) {
    const { species, nbSpecimens, preySize, frequency, weekHistory } = snake;

    // Convert frequency (days) to weeks, minimum 1
    const freqWeeks = Math.max(1, Math.round(frequency / 7));

    // If current week already has a definitive status, skip
    const currentStatus = weekHistory[currentWeek];
    if (currentStatus && SKIP_STATUSES.has(currentStatus)) continue;

    // Find last successful meal (ok / G / SG) in weeks before currentWeek
    let lastMealWeek = null;
    for (let w = currentWeek - 1; w >= 1; w--) {
      if (MEAL_SUCCESS.has(weekHistory[w])) {
        lastMealWeek = w;
        break;
      }
    }

    const weeksSinceLastMeal = lastMealWeek !== null ? currentWeek - lastMealWeek : Infinity;
    const needsFeeding = weeksSinceLastMeal >= freqWeeks;

    if (!needsFeeding) continue;

    // Detect potential ongoing molt (M within last 3 weeks)
    let inMolt = false;
    for (let w = currentWeek - 1; w >= Math.max(1, currentWeek - 3); w--) {
      if (weekHistory[w] === 'm') { inMolt = true; break; }
    }

    // Check if snake refused last time (for display info)
    const lastRefused = weekHistory[currentWeek - 1] === 'ref' ||
      (lastMealWeek !== null && weekHistory[currentWeek - 1] === 'ref');

    result.push({
      ...snake,
      freqWeeks,
      lastMealWeek,
      weeksSinceLastMeal: isFinite(weeksSinceLastMeal) ? weeksSinceLastMeal : null,
      inMolt,
      lastRefused,
    });
  }

  result.sort((a, b) => getPreySizeOrder(a.preySize) - getPreySizeOrder(b.preySize));
  return result;
}

/**
 * Build a prey summary from the list of snakes to feed.
 * Snakes in molt are counted separately (tentative).
 *
 * Returns: { confirmed: PreyGroup[], tentative: PreyGroup[] }
 *   PreyGroup: { preySize, total, snakeCount }
 */
export function getPreySummary(snakesToFeed) {
  const confirmed = {};
  const tentative = {};

  for (const snake of snakesToFeed) {
    const { preySize, nbSpecimens, inMolt } = snake;
    const bucket = inMolt ? tentative : confirmed;

    if (!bucket[preySize]) {
      bucket[preySize] = { preySize, total: 0, snakeCount: 0, order: getPreySizeOrder(preySize) };
    }
    bucket[preySize].total += nbSpecimens;
    bucket[preySize].snakeCount += 1;
  }

  const sort = (map) =>
    Object.values(map).sort((a, b) => a.order - b.order);

  return { confirmed: sort(confirmed), tentative: sort(tentative) };
}
