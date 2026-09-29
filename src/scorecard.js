export const STORAGE_KEY = 'everyday-scorecard-v1';
export const PERIODS = ['Morning', 'Afternoon', 'Evening'];
export const RATINGS = ['positive', 'negative', 'neutral'];

export function emptyScorecard() {
  return {
    version: 2, identity: '', reflection: '', habits: [],
    intentions: Array.from({ length: 5 }, () => ({ behavior: '', time: '', location: '' })),
    stacks: Array.from({ length: 5 }, () => ({ cue: '', behavior: '' })),
  };
}

function validateStatements(statements, fields) {
  if (!Array.isArray(statements) || statements.length !== 5) {
    throw new Error('This backup must contain five statements in each worksheet.');
  }
  return statements.map((statement) => {
    if (!statement || fields.some((field) => typeof statement[field] !== 'string' || statement[field].length > 300)) {
      throw new Error('This backup contains an invalid worksheet statement. Your journal has not been changed.');
    }
    return Object.fromEntries(fields.map((field) => [field, statement[field]]));
  });
}

export function validateScorecard(value) {
  if (!value || ![1, 2].includes(value.version) || typeof value.identity !== 'string' ||
      typeof value.reflection !== 'string' || !Array.isArray(value.habits) ||
      value.identity.length > 500 || value.reflection.length > 5000 || value.habits.length > 1000) {
    throw new Error('This file is not a valid Everyday scorecard backup.');
  }
  const ids = new Set();
  const habits = value.habits.map((habit) => {
    if (!habit || typeof habit.id !== 'string' || !habit.id || ids.has(habit.id) ||
        typeof habit.name !== 'string' || !habit.name.trim() || habit.name.length > 160 ||
        !PERIODS.includes(habit.period) || !(habit.rating === null || RATINGS.includes(habit.rating)) ||
        typeof habit.note !== 'string' || habit.note.length > 2000) {
      throw new Error('This backup contains an invalid habit. Your scorecard has not been changed.');
    }
    ids.add(habit.id);
    return { id: habit.id, name: habit.name.trim(), period: habit.period, rating: habit.rating, note: habit.note };
  });
  const worksheets = value.version === 1 ? emptyScorecard() : value;
  return {
    version: 2, identity: value.identity, reflection: value.reflection, habits,
    intentions: validateStatements(worksheets.intentions, ['behavior', 'time', 'location']),
    stacks: validateStatements(worksheets.stacks, ['cue', 'behavior']),
  };
}

export function summarize(habits) {
  const result = { positive: 0, negative: 0, neutral: 0, unrated: 0, total: habits.length };
  for (const habit of habits) result[habit.rating ?? 'unrated'] += 1;
  return { ...result, rated: result.total - result.unrated };
}

export function moveHabit(habits, id, direction) {
  const index = habits.findIndex((habit) => habit.id === id);
  if (index < 0 || ![-1, 1].includes(direction)) return habits;
  const period = habits[index].period;
  let neighbor = index + direction;
  while (neighbor >= 0 && neighbor < habits.length && habits[neighbor].period !== period) neighbor += direction;
  if (neighbor < 0 || neighbor >= habits.length) return habits;
  const next = [...habits];
  [next[index], next[neighbor]] = [next[neighbor], next[index]];
  return next;
}

export function starterHabits() {
  return [
    ['Wake up', 'Morning'],
    ['Reach for my phone', 'Morning'],
    ['Drink a glass of water', 'Morning'],
    ['Make breakfast', 'Morning'],
    ['Eat lunch at my desk', 'Afternoon'],
    ['Take a walk', 'Afternoon'],
    ['Scroll after dinner', 'Evening'],
    ['Read before bed', 'Evening'],
  ].map(([name, period]) => ({ id: crypto.randomUUID(), name, period, rating: null, note: '' }));
}