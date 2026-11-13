(function (root) {
  'use strict';

  var KEY = 'sapc02.progress.v1';
  var EXAM_N = 75, EXAM_MINUTES = 180, SCALE_MAX = 1000, PASS_SCORE = 720;
  var CHAPTER_WEIGHTS = { 1: 26, 2: 29, 3: 25, 4: 20 };

  function isMulti(q) { return !!q && Array.isArray(q.answers); }

  function sortedUnique(a) {
    return a.filter(function (x, i) { return a.indexOf(x) === i; }).sort(function (x, y) { return x - y; });
  }

  function gradeOx(q, ans) { return { correct: ans === q.answer }; }

  // 択一: ans は 0 始まりの選択肢番号。複数選択: ans は 0 始まり番号の配列（順不同・完全一致で正解）
  function gradeMc(q, ans) {
    if (isMulti(q)) {
      if (!Array.isArray(ans) || !ans.length) return { correct: false };
      var a = sortedUnique(ans), b = sortedUnique(q.answers);
      return { correct: a.length === b.length && a.every(function (x, i) { return x === b[i]; }) };
    }
    return { correct: typeof ans === 'number' && ans === q.answer };
  }

  function emptyProgress() {
    return {
      version: 1,
      position: null,
      lessonsDone: [],
      quizResults: {},
      wrongLog: [],
      chapterTest: {},
      reports: [],
      settings: { passRate: 0.7, unlockAll: false }
    };
  }

  function isObj(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }
  function isStrArr(x) { return Array.isArray(x) && x.every(function (s) { return typeof s === 'string'; }); }
  function isNum(x) { return typeof x === 'number' && isFinite(x); }

  // 不正なら理由の文字列、正しければ null
  function validate(p) {
    if (!isObj(p)) return '進捗ファイルの形式が正しくありません';
    if (p.version !== 1) return '対応していないバージョンです';
    if (p.position !== null && !(isObj(p.position) && isNum(p.position.ch) && typeof p.position.lessonId === 'string' &&
      (p.position.page === undefined || (typeof p.position.page === 'number' && isFinite(p.position.page) && p.position.page >= 0 && Math.floor(p.position.page) === p.position.page)))) return 'position が不正です';
    if (!isStrArr(p.lessonsDone)) return 'lessonsDone が不正です';
    if (!isObj(p.quizResults) || !Object.keys(p.quizResults).every(function (k) {
      var r = p.quizResults[k]; return isObj(r) && typeof r.correct === 'boolean' && isNum(r.ts);
    })) return 'quizResults が不正です';
    if (!isStrArr(p.wrongLog)) return 'wrongLog が不正です';
    if (!isObj(p.chapterTest) || !Object.keys(p.chapterTest).every(function (k) {
      var r = p.chapterTest[k]; return isObj(r) && isNum(r.score) && typeof r.passed === 'boolean';
    })) return 'chapterTest が不正です';
    if (!Array.isArray(p.reports) || !p.reports.every(function (r) {
      return isObj(r) && typeof r.id === 'string' && typeof r.memo === 'string';
    })) return 'reports が不正です';
    if (!isObj(p.settings) || !isNum(p.settings.passRate) || typeof p.settings.unlockAll !== 'boolean') return 'settings が不正です';
    return null;
  }

  function loadProgress(storage) {
    var raw;
    try { raw = storage.getItem(KEY); } catch (e) { return { progress: emptyProgress(), ok: false }; }
    if (raw === null || raw === undefined) return { progress: emptyProgress(), ok: true };
    try {
      var p = JSON.parse(raw);
      if (validate(p) === null) return { progress: p, ok: true };
    } catch (e) { /* 壊れたJSON */ }
    return { progress: emptyProgress(), ok: false };
  }

  function saveProgress(storage, p) {
    try { storage.setItem(KEY, JSON.stringify(p)); return true; } catch (e) { return false; }
  }

  function importProgress(json, current) {
    var p;
    try { p = JSON.parse(json); } catch (e) { return { progress: current, error: 'JSONとして読めませんでした' }; }
    var err = validate(p);
    if (err) return { progress: current, error: err };
    return { progress: p, error: null };
  }

  function isChapterUnlocked(p, no) {
    if (no <= 1 || p.settings.unlockAll) return true;
    var t = p.chapterTest[no - 1];
    return !!(t && t.passed);
  }

  function examUnlocked(p, data) {
    if (p.settings.unlockAll) return true;
    return data.chapters.every(function (c) { var t = p.chapterTest[c.no]; return !!(t && t.passed); });
  }

  // 重み（試験配分）に比例した配分（最大剰余法、caps が各章の上限。余りは他章へ回す）
  function allocate(weights, caps, n) {
    var totalCap = caps.reduce(function (a, b) { return a + b; }, 0);
    n = Math.min(n, totalCap);
    var wsum = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
    var alloc = weights.map(function (w, i) { return Math.min(caps[i], Math.floor(w * n / wsum)); });
    var left = n - alloc.reduce(function (a, b) { return a + b; }, 0);
    var order = weights.map(function (w, i) { return i; }).sort(function (a, b) {
      return (weights[b] * n / wsum - alloc[b]) - (weights[a] * n / wsum - alloc[a]);
    });
    while (left > 0) {
      var moved = false;
      for (var k = 0; k < order.length && left > 0; k++) {
        var i = order[k];
        if (alloc[i] < caps[i]) { alloc[i]++; left--; moved = true; }
      }
      if (!moved) break;
    }
    return alloc;
  }

  function sample(arr, k, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a.slice(0, k);
  }

  // 本番形式: mc から75問（章配分 26/29/25/20%）。ox は使わない。
  function buildExam(data, rng, n) {
    rng = rng || Math.random;
    var chs = data.chapters;
    var weights = chs.map(function (c) { return CHAPTER_WEIGHTS[c.no] || 0; });
    if (!weights.some(function (w) { return w > 0; })) weights = chs.map(function (c) { return c.mc.length; });
    var alloc = allocate(weights, chs.map(function (c) { return c.mc.length; }), n || EXAM_N);
    var out = [];
    chs.forEach(function (c, i) { out = out.concat(sample(c.mc, alloc[i], rng)); });
    return { mc: sample(out, out.length, rng), minutes: EXAM_MINUTES };
  }

  function chapterOf(q) {
    var m = /^mc-(\d+)-/.exec(q.id);
    if (m) return parseInt(m[1], 10);
    return typeof q.domain === 'number' ? q.domain : 0;
  }

  // answers: { [問題ID]: number(択一) | number[](複数選択) }。キーが無い・空配列の問題は未回答で不正解。
  // スコア = 正答率 × 1000（簡易換算。実試験は問題難易度による換算スコア）。720以上で合格。
  function scoreExam(exam, answers) {
    answers = answers || {};
    var correct = 0, byChapter = {};
    exam.mc.forEach(function (q) {
      var ch = chapterOf(q);
      var b = byChapter[ch] || (byChapter[ch] = { correct: 0, total: 0 });
      b.total++;
      var a = Object.prototype.hasOwnProperty.call(answers, q.id) ? answers[q.id] : undefined;
      if (a !== null && a !== undefined && gradeMc(q, a).correct) { b.correct++; correct++; }
    });
    var total = exam.mc.length;
    var score = total ? Math.round(correct * SCALE_MAX / total) : 0;
    return { score: score, max: SCALE_MAX, pass: score >= PASS_SCORE, correct: correct, total: total, byChapter: byChapter };
  }

  var api = {
    STORAGE_KEY: KEY, EXAM_N: EXAM_N, EXAM_MINUTES: EXAM_MINUTES, PASS_SCORE: PASS_SCORE,
    isMulti: isMulti, chapterOf: chapterOf,
    gradeOx: gradeOx, gradeMc: gradeMc,
    emptyProgress: emptyProgress, loadProgress: loadProgress, saveProgress: saveProgress, importProgress: importProgress,
    isChapterUnlocked: isChapterUnlocked, examUnlocked: examUnlocked,
    buildExam: buildExam, scoreExam: scoreExam
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Logic = api;
})(typeof window !== 'undefined' ? window : globalThis);
