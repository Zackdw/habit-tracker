import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyScorecard, validateScorecard, summarize, moveHabit, starterHabits } from './scorecard.js';

test('new scorecards and starter habits do not assume a rating', () => {
  assert.deepEqual(validateScorecard(emptyScorecard()), emptyScorecard());
  const habits = starterHabits();
  assert.equal(habits.length, 8);
  assert.equal(summarize(habits).unrated, 8);
  assert.equal(summarize(habits).neutral, 0);
});

test('summary keeps unreviewed habits distinct from neutral habits', () => {
  assert.deepEqual(summarize([null, 'positive', 'negative', 'neutral', 'positive'].map((rating) => ({ rating }))),
    { positive: 2, negative: 1, neutral: 1, unrated: 1, total: 5, rated: 4 });
});

test('backup roundtrip preserves identity, notes, ratings and order', () => {
  const card = { ...emptyScorecard(), identity: 'A thoughtful person', reflection: 'Notice my cues.', habits: starterHabits() };
  card.habits[1].rating = 'negative';
  card.habits[1].note = 'Before getting out of bed.';
  assert.deepEqual(validateScorecard(JSON.parse(JSON.stringify(card))), card);
});

test('invalid and duplicate backup data is rejected', () => {
  assert.throws(() => validateScorecard({ version: 2 }));
  const card = { ...emptyScorecard(), habits: starterHabits() };
  card.habits[0].rating = 'done';
  assert.throws(() => validateScorecard(card));
  card.habits[0].rating = null;
  card.habits[1].id = card.habits[0].id;
  assert.throws(() => validateScorecard(card));
  assert.throws(() => validateScorecard({ ...emptyScorecard(), identity: 'a'.repeat(501) }));
});

test('reordering stays within a period and respects boundaries', () => {
  const habits = starterHabits();
  const moved = moveHabit(habits, habits[1].id, -1);
  assert.equal(moved[0].id, habits[1].id);
  assert.equal(habits[0].name, 'Wake up');
  assert.equal(moveHabit(habits, habits[0].id, -1), habits);
  assert.equal(moveHabit(habits, habits[3].id, 1), habits);
  assert.equal(moveHabit(habits, 'missing', 1), habits);
});

test('legacy scorecards migrate without losing habits or reflections', () => {
  const legacy = { version: 1, identity: 'Be present', reflection: 'Keep noticing', habits: starterHabits() };
  const migrated = validateScorecard(legacy);
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.habits, legacy.habits);
  assert.equal(migrated.identity, legacy.identity);
  assert.equal(migrated.reflection, legacy.reflection);
  assert.equal(migrated.intentions.length, 5);
  assert.equal(migrated.stacks.length, 5);
  assert.ok(migrated.intentions.every((statement) => statement.behavior === '' && statement.time === '' && statement.location === ''));
});

test('worksheet backups preserve complete and unfinished statements', () => {
  const card = emptyScorecard();
  card.intentions[0] = { behavior: 'read two pages', time: '8 pm on weekdays', location: 'my armchair' };
  card.intentions[4].behavior = 'stretch';
  card.stacks[0] = { cue: 'I close my laptop', behavior: 'put on my walking shoes' };
  assert.equal(card.intentions[1].behavior, '');
  assert.deepEqual(validateScorecard(JSON.parse(JSON.stringify(card))), card);
});

test('malformed worksheets and unsupported backup versions are rejected', () => {
  const card = emptyScorecard();
  assert.throws(() => validateScorecard({ ...card, version: 3 }));
  assert.throws(() => validateScorecard({ ...card, intentions: undefined }));
  assert.throws(() => validateScorecard({ ...card, stacks: null }));
  assert.throws(() => validateScorecard({ ...card, intentions: card.intentions.slice(1) }));
  card.intentions[0].time = 8;
  assert.throws(() => validateScorecard(card));
  card.intentions[0].time = 'a'.repeat(301);
  assert.throws(() => validateScorecard(card));
});