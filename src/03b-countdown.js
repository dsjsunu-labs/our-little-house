  /* =========================================================
     Countdowns + this day in history
     ========================================================= */
  function countdownTarget(cd) {
    const d = parseDate(cd.date);
    if (!d) return null;
    const time = /^\d{1,2}:\d{2}$/.test(cd.time || '') ? cd.time : '00:00';
    const parts = time.split(':');
    const hh = Number(parts[0]) || 0;
    const mm = Number(parts[1]) || 0;
    const now = new Date();
    if (cd.repeat === 'yearly') {
      let target = new Date(now.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0, 0);
      if (target.getMonth() !== d.getMonth()) target = new Date(now.getFullYear(), d.getMonth() + 1, 0, hh, mm, 0, 0);
      if (target.getTime() < now.getTime()) {
        target = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate(), hh, mm, 0, 0);
        if (target.getMonth() !== d.getMonth()) target = new Date(now.getFullYear() + 1, d.getMonth() + 1, 0, hh, mm, 0, 0);
      }
      return target;
    }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0, 0);
  }

  function countdownInfo(cd) {
    const target = countdownTarget(cd);
    if (!target) return null;
    const diff = target.getTime() - Date.now();
    const abs = Math.abs(diff);
    return {
      target: target,
      diff: diff,
      past: diff < 0,
      days: Math.floor(abs / 86400000),
      hours: Math.floor((abs % 86400000) / 3600000),
      mins: Math.floor((abs % 3600000) / 60000),
      secs: Math.floor((abs % 60000) / 1000)
    };
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function countdownHms(info) {
    return pad2(info.hours) + ':' + pad2(info.mins) + ':' + pad2(info.secs);
  }

  function countdownDateLabel(cd) {
    const d = parseDate(cd.date);
    if (!d) return '日期待补';
    const time = cd.time && cd.time !== '00:00' ? ' ' + cd.time : '';
    if (cd.repeat === 'yearly') return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日' + time + ' · 每年';
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日' + time;
  }

  function renderCountdownCard(cd) {
    const info = countdownInfo(cd);
    if (!info) return '';
    const label = info.past ? '已经过去' : '还有';
    return '<article class="cd-card" data-cd-target="' + info.target.getTime() + '">' +
      '<div class="cd-card-head"><span class="cd-emoji">' + esc(cd.emoji || '💗') + '</span><div class="cd-card-title"><b>' + esc(cd.title) + '</b><small>' + esc(countdownDateLabel(cd)) + '</small></div>' +
      '<button class="cd-edit" data-action="edit-countdown" data-id="' + cd.id + '" aria-label="编辑倒计时">' + icon('edit', 12) + '</button></div>' +
      '<div class="cd-count"><span class="cd-days">' + info.days + '</span><span class="cd-unit">天</span><span class="cd-label">' + label + '</span><span class="cd-hms">' + countdownHms(info) + '</span></div>' +
      (cd.note ? '<p class="cd-note">' + esc(cd.note) + '</p>' : '') +
      '</article>';
  }

  function renderCountdownPage() {
    const list = (state.countdowns || []).slice().sort(function (a, b) {
      const ia = countdownInfo(a), ib = countdownInfo(b);
      if (!ia) return 1;
      if (!ib) return -1;
      if (ia.past !== ib.past) return ia.past ? 1 : -1;
      return ia.diff - ib.diff;
    });
    const next = list.find(function (c) { const i = countdownInfo(c); return i && !i.past; }) || list[0];
    const nextInfo = next ? countdownInfo(next) : null;
    const history = historyOnThisDay();
    return subhead('倒计时', 'us', '<button class="icon-btn" data-action="open-countdown-add" aria-label="添加倒计时">' + icon('plus', 16) + '</button>') +
      (next ? '<div class="cd-hero"><span class="eyebrow">NEXT SPECIAL DAY</span><div class="cd-hero-title"><span>' + esc(next.emoji || '💗') + '</span><h2>' + esc(next.title) + '</h2></div>' +
        '<p>' + esc(countdownDateLabel(next)) + '</p>' +
        '<div class="cd-hero-count"><b data-hero-days>' + nextInfo.days + '</b><span>天</span><small data-hero-hms>' + countdownHms(nextInfo) + '</small></div>' +
        (next.note ? '<p class="cd-hero-note">' + esc(next.note) + '</p>' : '') + '</div>' : '') +
      '<div class="section-head"><div><span class="eyebrow">ALL THE DAYS</span><h2>我们的日子</h2></div><button class="text-link" data-action="open-countdown-add">添加 +</button></div>' +
      (list.length ? '<div class="cd-list">' + list.map(renderCountdownCard).join('') + '</div>' : '<div class="empty"><span class="emoji">⏳</span><h3>还没有倒计时</h3><p>把生日、纪念日、下一次见面，或者随便一个想一起等到的日子写进来。</p><button class="btn btn-primary btn-sm" style="margin-top:10px" data-action="open-countdown-add">添加第一个</button></div>') +
      '<button class="dashed-add" style="margin-top:10px" data-action="open-countdown-add">' + icon('plus', 14) + ' 再加一个日子</button>' +
      '<div class="section-head history-head"><div><span class="eyebrow">ON THIS DAY</span><h2>历史上的今天</h2></div><span class="tiny muted">' + fmtDate(Date.now()).replace(/^\d{4}-/, '') + '</span></div>' +
      (history.length ? renderHistory(history) : '<div class="history-empty"><span>📜</span><p>还没有往年今天。<br>明年这个时候，今天写下的东西会回来找你。</p></div>') +
      '<div class="report-note">倒计时会每秒更新；「历史上的今天」会从动态、报备、清单、美食、旅行和足迹里，找出往年同一天发生的事。</div>';
  }

  function historyOnThisDay() {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    const currentYear = now.getFullYear();
    const items = [];
    function push(dateValue, type, text, emoji) {
      if (!dateValue) return;
      let d = null;
      if (dateValue instanceof Date) d = dateValue;
      else if (typeof dateValue === 'number') d = new Date(dateValue);
      else d = parseDate(String(dateValue));
      if (!d || d.getFullYear() >= currentYear) return;
      if (d.getMonth() !== month || d.getDate() !== day) return;
      const clean = String(text || '').replace(/\s+/g, ' ').trim();
      if (!clean) return;
      items.push({ year: d.getFullYear(), type: type, text: clean, emoji: emoji || '•' });
    }
    state.statuses.forEach(function (p) { push(p.createdAt, '动态', user(p.author).name + '：' + p.text, '💬'); });
    state.reports.forEach(function (r) { push(r.createdAt, '报备', user(r.author).name + '：' + (r.text || r.label || '报备'), r.emoji || '📣'); });
    state.memories.forEach(function (m) { push(m.createdAt, '回忆', '存下了「' + m.title + '」', '🎞️'); });
    state.foods.forEach(function (f) { if (f.done) push(f.completedAt || f.createdAt, '美食', '打卡了「' + f.title + '」', '🍜'); });
    state.travels.forEach(function (t) { if (t.done) push(t.completedAt || t.createdAt, '旅行', '完成了「' + t.title + '」', '🧳'); });
    state.visits.forEach(function (v) { push(v.date, '足迹', '去了' + v.city, '📍'); });
    state.events.forEach(function (e) { push(e.date, '约定', e.title, '🗓️'); });
    state.todos.forEach(function (t) { if (t.done) push(t.completedAt || t.createdAt, '清单', '完成了「' + t.title + '」', '✅'); });
    items.sort(function (a, b) { return b.year - a.year; });
    const seen = new Set();
    return items.filter(function (x) {
      const key = x.year + '|' + x.type + '|' + x.text;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 12);
  }

  function renderHistory(items) {
    const years = Array.from(new Set(items.map(function (x) { return x.year; }))).sort(function (a, b) { return b - a; });
    return '<div class="history-list">' + years.map(function (y) {
      return '<div class="history-year"><div class="history-year-label">' + y + '</div><div class="history-year-items">' +
        items.filter(function (x) { return x.year === y; }).map(function (x) {
          return '<div class="history-item"><span>' + esc(x.emoji) + '</span><div><b>' + esc(x.type) + '</b><p>' + esc(x.text) + '</p></div></div>';
        }).join('') + '</div></div>';
    }).join('') + '</div>';
  }

  function tickCountdowns() {
    if (!session.unlocked || session.page !== 'countdown') return;
    document.querySelectorAll('[data-cd-target]').forEach(function (el) {
      const target = Number(el.dataset.cdTarget);
      if (!target) return;
      const diff = target - Date.now();
      const abs = Math.abs(diff);
      const days = Math.floor(abs / 86400000);
      const hours = Math.floor((abs % 86400000) / 3600000);
      const mins = Math.floor((abs % 3600000) / 60000);
      const secs = Math.floor((abs % 60000) / 1000);
      const d = el.querySelector('.cd-days');
      const h = el.querySelector('.cd-hms');
      const label = el.querySelector('.cd-label');
      if (d) d.textContent = days;
      if (h) h.textContent = pad2(hours) + ':' + pad2(mins) + ':' + pad2(secs);
      if (label) label.textContent = diff < 0 ? '已经过去' : '还有';
    });
    const hero = document.querySelector('.cd-hero');
    if (hero) {
      const first = document.querySelector('[data-cd-target]');
      if (first) {
        const target = Number(first.dataset.cdTarget);
        const diff = target - Date.now();
        const abs = Math.abs(diff);
        const hd = hero.querySelector('[data-hero-days]');
        const hh = hero.querySelector('[data-hero-hms]');
        if (hd) hd.textContent = Math.floor(abs / 86400000);
        if (hh) hh.textContent = pad2(Math.floor((abs % 86400000) / 3600000)) + ':' + pad2(Math.floor((abs % 3600000) / 60000)) + ':' + pad2(Math.floor((abs % 60000) / 1000));
      }
    }
  }
