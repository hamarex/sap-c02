'use strict';
const assert = require('assert');
const L = require('../logic.js');

function mk(no, n, multiEvery) {
  const mc = [];
  for (let i = 1; i <= n; i++) {
    const id = 'mc-' + no + '-' + String(i).padStart(3, '0');
    mc.push(multiEvery && i % multiEvery === 0
      ? { id, stem: 's', choices: ['a', 'b', 'c', 'd', 'e'], answers: [1, 3], select: 2, explain: [], domain: no }
      : { id, stem: 's', choices: ['a', 'b', 'c', 'd'], answer: 2, explain: [], domain: no });
  }
  return { no, title: 't', lessons: [], ox: [], mc };
}
const data = { chapters: [mk(1, 40, 3), mk(2, 40, 3), mk(3, 40, 3), mk(4, 40, 3)] };
let n = 0;
function t(name, fn) { fn(); n++; console.log('ok - ' + name); }

t('gradeMc 択一', () => {
  const q = data.chapters[0].mc[0];
  assert(L.gradeMc(q, 2).correct); assert(!L.gradeMc(q, 1).correct); assert(!L.gradeMc(q, [2]).correct);
});
t('gradeMc 複数選択(順不同・完全一致)', () => {
  const q = data.chapters[0].mc[2];
  assert(L.isMulti(q));
  assert(L.gradeMc(q, [3, 1]).correct);
  assert(!L.gradeMc(q, [1]).correct); assert(!L.gradeMc(q, [1, 3, 4]).correct);
  assert(!L.gradeMc(q, []).correct); assert(!L.gradeMc(q, 1).correct);
});
t('gradeOx', () => { assert(L.gradeOx({ answer: true }, true).correct); assert(!L.gradeOx({ answer: true }, false).correct); });
t('buildExam 75問・章配分', () => {
  const ex = L.buildExam(data, Math.random);
  assert.strictEqual(ex.mc.length, 75); assert.strictEqual(ex.minutes, 180);
  assert.strictEqual(new Set(ex.mc.map(q => q.id)).size, 75);
  const c = [0, 0, 0, 0, 0]; ex.mc.forEach(q => c[L.chapterOf(q)]++);
  assert.deepStrictEqual(c.slice(1), [19, 22, 19, 15]);
});
t('buildExam 問題不足時は上限まで', () => {
  const small = { chapters: [mk(1, 5), mk(2, 5), mk(3, 5), mk(4, 5)] };
  assert.strictEqual(L.buildExam(small).mc.length, 20);
  const one = { chapters: [mk(1, 3)] };
  assert.strictEqual(L.buildExam(one).mc.length, 3);
});
t('buildExam 偏りがあっても余りを他章に回す', () => {
  const d = { chapters: [mk(1, 5), mk(2, 40), mk(3, 40), mk(4, 40)] };
  const ex = L.buildExam(d); assert.strictEqual(ex.mc.length, 75);
});
t('scoreExam スケール・合格', () => {
  const ex = L.buildExam(data);
  const all = {}; ex.mc.forEach(q => { all[q.id] = L.isMulti(q) ? q.answers : q.answer; });
  let r = L.scoreExam(ex, all);
  assert.strictEqual(r.score, 1000); assert(r.pass); assert.strictEqual(r.correct, 75);
  const part = {}; ex.mc.slice(0, 54).forEach(q => { part[q.id] = all[q.id]; }); // 54/75 = 72%
  r = L.scoreExam(ex, part);
  assert.strictEqual(r.score, 720); assert(r.pass);
  const part2 = {}; ex.mc.slice(0, 53).forEach(q => { part2[q.id] = all[q.id]; });
  r = L.scoreExam(ex, part2); assert.strictEqual(r.score, 707); assert(!r.pass);
  r = L.scoreExam(ex, {}); assert.strictEqual(r.score, 0);
  const bc = Object.values(r.byChapter).reduce((a, b) => a + b.total, 0); assert.strictEqual(bc, 75);
});
t('scoreExam 空配列は未回答', () => {
  const ex = { mc: [data.chapters[0].mc[2]] };
  assert.strictEqual(L.scoreExam(ex, { [ex.mc[0].id]: [] }).correct, 0);
});
t('進捗の保存・読込・インポート', () => {
  const store = {}; const st = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } };
  assert.strictEqual(L.STORAGE_KEY, 'sapc02.progress.v1');
  let r = L.loadProgress(st); assert(r.ok);
  r.progress.lessonsDone.push('1-1'); assert(L.saveProgress(st, r.progress));
  assert.deepStrictEqual(L.loadProgress(st).progress.lessonsDone, ['1-1']);
  store[L.STORAGE_KEY] = '{bad'; assert(!L.loadProgress(st).ok);
  const cur = L.emptyProgress();
  assert(L.importProgress('xx', cur).error); assert(L.importProgress('{"version":2}', cur).error);
  assert.strictEqual(L.importProgress(JSON.stringify(cur), cur).error, null);
});
t('ロック', () => {
  const p = L.emptyProgress();
  assert(L.isChapterUnlocked(p, 1)); assert(!L.isChapterUnlocked(p, 2)); assert(!L.examUnlocked(p, data));
  data.chapters.forEach(c => { p.chapterTest[c.no] = { score: 1, passed: true }; });
  assert(L.isChapterUnlocked(p, 4)); assert(L.examUnlocked(p, data));
});
console.log(n + ' tests passed');
