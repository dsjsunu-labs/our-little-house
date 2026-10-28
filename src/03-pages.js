  /* =========================================================
     Report page
     ========================================================= */
  function renderReportPage() {
    const all = (state.reports || []).slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
    const filtered = session.reportFilter === 'all' ? all : all.filter(function (r) { return r.author === session.reportFilter; });
    const groups = [];
    filtered.forEach(function (r) {
      const key = dayKey(r.createdAt);
      let g = groups.find(function (x) { return x.key === key; });
      if (!g) { g = { key: key, ts: r.createdAt, items: [] }; groups.push(g); }
      g.items.push(r);
    });
    const week = [];
    const today = startOfDay(Date.now());
    for (let i = 6; i >= 0; i--) week.push(today - i * DAY);
    const weekCount = all.filter(function (r) { return r.createdAt >= today - 6 * DAY; }).length;
    const streak = reportStreak();
    const a = user('a'), b = user('b');
    return '<div class="report-hero"><h1>不是查岗，<br><em>是想让你安心。</em></h1>' +
      '<p>“我到家啦”“吃饭啦”“准备睡啦”……这些小小的回声，是两个人之间最踏实的连线。</p>' +
      '<span class="stamp">SEEN<br><b>WITH LOVE</b></span></div>' +
      '<div class="report-quick">' + REPORT_TYPES.map(function (r) {
        return '<button class="quick-report" data-action="quick-report" data-type="' + r.type + '"><span class="qr-emoji">' + r.emoji + '</span><span>' + r.type + '</span><span class="qr-sub">' + r.sub + '</span></button>';
      }).join('') + '</div>' +
      '<div class="report-stats">' +
      '<div class="report-stat"><b>' + all.length + '</b><span>累计报备</span></div>' +
      '<div class="report-stat"><b>' + weekCount + '</b><span>本周报备</span></div>' +
      '<div class="report-stat"><b>' + streak + '</b><span>连续天数</span></div>' +
      '</div>' +
      '<div class="week-strip">' + week.map(function (ts) {
        const count = all.filter(function (r) { return dayKey(r.createdAt) === dayKey(ts); }).length;
        const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
        const isToday = dayKey(ts) === dayKey();
        return '<div class="week-day' + (count ? ' has' : '') + (isToday ? ' today' : '') + '"><b>' + dayNames[new Date(ts).getDay()] + '</b><span class="w-dot">' + (count || new Date(ts).getDate()) + '</span><span>' + (new Date(ts).getMonth() + 1) + '/' + new Date(ts).getDate() + '</span></div>';
      }).join('') + '</div>' +
      '<div class="report-tools"><div class="chip-row">' +
      reportFilterChip('all', '全部') + reportFilterChip('a', a.name) + reportFilterChip('b', b.name) +
      '</div><button class="btn btn-secondary btn-sm" data-action="open-report">' + icon('plus', 11) + ' 自定义</button></div>' +
      (groups.length ? '<div class="report-timeline">' + groups.map(function (g) {
        return '<div class="report-day"><h3>' + groupLabel(g.ts) + ' <span>' + fmtDate(g.ts) + ' · ' + g.items.length + ' 次</span></h3>' +
          g.items.map(renderReportItem).join('') + '</div>';
      }).join('') + '</div>' : '<div class="empty"><span class="emoji">📮</span><h3>这里的回声还很安静</h3><p>点上面的任意一个按钮，发出今天的第一条报备。</p></div>') +
      '<div class="report-note">报备不是义务，是“我想起你了”的另一种说法。<br>连续报备 ' + streak + ' 天，已经是很了不起的默契。</div>';
  }

  function reportFilterChip(id, label) {
    return '<button class="chip' + (session.reportFilter === id ? ' active' : '') + '" data-action="report-filter" data-filter="' + id + '">' + esc(label) + '</button>';
  }

  function renderReportItem(r) {
    const u = user(r.author);
    const canDelete = r.author === session.activeUser;
    return '<div class="report-item"><span class="r-icon">' + esc(r.emoji || '💌') + '</span><div class="r-main"><b>' + esc(r.type) + ' · ' + esc(u.name) + '</b>' +
      (r.text && r.text !== r.type ? '<p>' + esc(r.text) + '</p>' : '') +
      '</div><time>' + fmtTime(r.createdAt) + '</time>' +
      (canDelete ? '<button class="report-del" data-action="delete-report" data-id="' + r.id + '" aria-label="删除报备">' + icon('close', 10) + '</button>' : '') +
      '</div>';
  }

  function reportStreak() {
    const keys = new Set((state.reports || []).map(function (r) { return dayKey(r.createdAt); }));
    let cursor = startOfDay(Date.now());
    if (!keys.has(dayKey(cursor))) cursor -= DAY;
    let n = 0;
    while (keys.has(dayKey(cursor))) { n++; cursor -= DAY; if (n > 999) break; }
    return n;
  }

  /* =========================================================
     Food page
     ========================================================= */
  function renderFoodPage() {
    const type = session.foodType;
    const items = (state.foods || []).filter(function (f) { return f.type === type; });
    const restaurants = state.foods.filter(function (f) { return f.type === 'restaurant'; });
    const dishes = state.foods.filter(function (f) { return f.type === 'dish'; });
    const done = state.foods.filter(function (f) { return f.done; }).length;
    const sorted = items.slice().sort(function (a, b) {
      if (!!a.done !== !!b.done) return a.done ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
    return '<div class="food-hero"><h1>把想吃的，<br><em>都记下来。</em></h1>' +
      '<p>想去的店、想做的菜，还有那些“下次一定要一起吃”的约定。</p>' +
      '<div class="food-doodle">🍰</div>' +
      '<div class="food-stats"><span class="food-stat"><b>' + restaurants.length + '</b> 家店</span><span class="food-stat"><b>' + dishes.length + '</b> 道菜</span><span class="food-stat"><b>' + done + '</b> 已打卡</span></div></div>' +
      '<div class="food-tools"><div class="segmented">' +
      foodTab('restaurant', '想吃的店', restaurants.length) + foodTab('dish', '想做的菜', dishes.length) +
      '</div><button class="random-btn" data-action="random-food" aria-label="随机选一个">' + icon('random', 17) + '</button></div>' +
      '<div class="food-summary"><span class="left">' + icon('sparkles', 12) + ' <b>' + (type === 'restaurant' ? '还没吃到的店' : '还没做过的菜') + '</b> · ' + sorted.filter(function (f) { return !f.done; }).length + ' 个</span>' +
      '<button class="text-link" data-action="open-food-add" data-type="' + type + '">添加 +</button></div>' +
      (sorted.length ? '<div>' + sorted.map(foodCard).join('') + '</div>' : '<div class="empty"><span class="emoji">' + (type === 'restaurant' ? '🍜' : '🍳') + '</span><h3>' + (type === 'restaurant' ? '还没有收藏的店' : '还没有想做的菜') + '</h3><p>把下一次约会、下一顿晚饭，先放进这个口袋里。</p><button class="btn btn-primary btn-sm" style="margin-top:10px" data-action="open-food-add" data-type="' + type + '">放进第一个</button></div>') +
      '<button class="dashed-add" style="margin-top:10px" data-action="open-food-add" data-type="' + type + '">' + icon('plus', 14) + (type === 'restaurant' ? ' 收藏一家想去的店' : ' 记下一道想做的菜') + '</button>' +
      '<div class="food-foot-note">“今天吃什么”是每天都要回答一次的难题，<br>还好我们有彼此的清单。</div>';
  }

  function foodTab(id, label, count) {
    return '<button class="' + (session.foodType === id ? 'active' : '') + '" data-action="food-tab" data-type="' + id + '">' + label + '<span class="n">' + count + '</span></button>';
  }

  function foodEmoji(f) {
    const list = f.type === 'restaurant' ? ['🍜', '🍣', '🍰', '🥘', '🍲', '🍙', '☕', '🍧'] : ['🍳', '🥘', '🍅', '🥟', '🍰', '🍲', '🥗', '🍞'];
    return pick(list, hashString(f.title || 'food'));
  }

  function foodCard(f) {
    const u = user(f.author);
    return '<article class="food-card' + (f.done ? ' done' : '') + '">' +
      '<div class="food-art">' + (f.image ? '<img src="' + esc(f.image) + '" alt="" loading="lazy">' : '<span class="art-emoji">' + foodEmoji(f) + '</span>') +
      (f.done ? '<span class="art-stamp">已打卡</span>' : '') + '</div>' +
      '<div class="food-main"><div class="food-meta"><span>' + (f.type === 'restaurant' ? '想去的店' : '想做的菜') + '</span><span>·</span><span class="author">' + avatarHtml(u, 'xs') + esc(u.name) + '</span></div>' +
      '<h3>' + esc(f.title) + '</h3>' +
      (f.note ? '<p class="food-note">' + esc(f.note) + '</p>' : '') +
      (f.tags && f.tags.length ? '<div class="food-tags">' + f.tags.map(function (t) { return '<span>#' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="food-links">' + (f.link ? linkChip(f.link) : '') + (f.done && f.rating ? '<span class="rating">' + '♥'.repeat(f.rating) + '<span style="color:#e8d7c2">' + '♡'.repeat(5 - f.rating) + '</span></span>' : '') + '</div>' +
      '</div>' +
      '<div class="food-side"><button class="food-check" data-action="toggle-food" data-id="' + f.id + '" aria-label="' + (f.done ? '标记未打卡' : '标记已打卡') + '">' + icon('check', 13) + '</button>' +
      (f.done ? '<span class="food-done-label">DONE</span>' : '') +
      '<button class="food-edit" data-action="edit-food" data-id="' + f.id + '" aria-label="编辑">' + icon('edit', 12) + '</button></div>' +
      '</article>';
  }

  function randomFood() {
    let pool = state.foods.filter(function (f) { return f.type === session.foodType && !f.done; });
    if (!pool.length) pool = state.foods.filter(function (f) { return f.type === session.foodType; });
    if (!pool.length) {
      toast('先往口袋里放一个心愿吧', '🥺');
      return;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    openRandomFoodSheet(item);
  }

  function openRandomFoodSheet(item) {
    const u = user(item.author);
    showSheet(sheetHead('今晚吃这个', '命运的小勺替你们选好了，不许反悔。') +
      '<div class="food-card" style="margin-bottom:14px"><div class="food-art">' + (item.image ? '<img src="' + esc(item.image) + '" alt="">' : '<span class="art-emoji">' + foodEmoji(item) + '</span>') + '</div>' +
      '<div class="food-main"><div class="food-meta"><span>' + (item.type === 'restaurant' ? '想去的店' : '想做的菜') + '</span><span>·</span><span>' + avatarHtml(u, 'xs') + esc(u.name) + '</span></div><h3>' + esc(item.title) + '</h3><p class="food-note">' + esc(item.note || '就是它了。') + '</p></div></div>' +
      '<div class="sheet-foot"><button class="btn btn-secondary" data-action="random-food">换一个</button><button class="btn btn-primary" data-action="close-sheet">就它了 ' + icon('heart', 13) + '</button></div>' +
      '<p class="sheet-note" style="margin-top:10px">吃完饭记得回来点一下打卡，把这一天存起来。</p>');
  }

  /* =========================================================
     Travel page
     ========================================================= */
  function renderTravelPage() {
    const type = session.travelType;
    const all = state.travels || [];
    const items = all.filter(function (t) { return t.category === type; }).slice().sort(function (a, b) {
      if (!!a.done !== !!b.done) return a.done ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
    const done = all.filter(function (t) { return t.done; }).length;
    const pct = all.length ? Math.round((done / all.length) * 100) : 0;
    const next = all.find(function (t) { return !t.done && t.category === 'place'; }) || all.find(function (t) { return !t.done; });
    return '<div class="travel-hero">' + travelMapSvg() +
      '<div class="travel-hero-copy"><h1>下一站，<br><em>和你。</em></h1>' +
      '<p>' + (next ? '先把「' + esc(next.title) + '」钉在地图上。' : '把想去的地方，先钉在地图上。') + '</p></div>' +
      '<span class="stamp">TO GO<br><b>WITH YOU</b></span>' +
      '<div class="travel-progress"><div class="tp-top"><span>一起完成的小心愿</span><span><b>' + done + '</b> / ' + all.length + '</span></div>' +
      '<div class="progress-track"><i style="width:' + pct + '%"></i></div></div></div>' +
      '<div class="travel-tools"><div class="segmented">' +
      travelTab('place', '想去的地方', all.filter(function (t) { return t.category === 'place'; }).length) +
      travelTab('todo', '想做的事', all.filter(function (t) { return t.category === 'todo'; }).length) +
      travelTab('shop', '想逛的', all.filter(function (t) { return t.category === 'shop'; }).length) +
      '</div></div>' +
      '<div class="food-summary"><span class="left">' + icon('mapPin', 12) + ' <b>' + ({ place: '下一站候选', todo: '一起完成', shop: '一起逛逛' })[type] + '</b> · ' + items.filter(function (t) { return !t.done; }).length + ' 个心愿</span>' +
      '<button class="text-link" data-action="open-travel-add" data-type="' + type + '">添加 +</button></div>' +
      (items.length ? '<div>' + items.map(travelCard).join('') + '</div>' : '<div class="empty"><span class="emoji">' + (type === 'place' ? '🗺️' : type === 'todo' ? '✨' : '🛍️') + '</span><h3>这一段还是空白</h3><p>把下一站、下一件想一起做的事，先写进手帐里。</p><button class="btn btn-primary btn-sm" style="margin-top:10px" data-action="open-travel-add" data-type="' + type + '">钉上第一个心愿</button></div>') +
      '<button class="dashed-add" style="margin-top:10px" data-action="open-travel-add" data-type="' + type + '">' + icon('plus', 14) + ' 再钉一个心愿</button>' +
      '<div class="travel-foot-note">地图只是手绘的想象，<br>真正的那一站，要一起走到才算数。</div>';
  }

  function travelTab(id, label, count) {
    return '<button class="' + (session.travelType === id ? 'active' : '') + '" data-action="travel-tab" data-type="' + id + '">' + label + '<span class="n">' + count + '</span></button>';
  }

  function travelCard(t) {
    const u = user(t.author);
    const emoji = t.category === 'place' ? '📍' : t.category === 'todo' ? '✨' : '🛍️';
    const catLabel = { place: '想去的地方', todo: '想做的事', shop: '想逛的' }[t.category] || '心愿';
    return '<article class="travel-card cat-' + t.category + (t.done ? ' done' : '') + '">' +
      '<div class="travel-stub"><span class="t-emoji">' + emoji + '</span><span class="t-no">NO.' + String((state.travels.indexOf(t) + 1)).padStart(2, '0') + '</span></div>' +
      '<div class="travel-main"><div class="travel-meta"><span>' + catLabel + '</span><span>·</span><span>' + avatarHtml(u, 'xs') + esc(u.name) + '</span></div>' +
      '<h3>' + esc(t.title) + '</h3>' +
      (t.place ? '<span class="t-place">' + icon('mapPin', 10) + esc(t.place) + '</span>' : '') +
      (t.note ? '<p class="travel-note">' + esc(t.note) + '</p>' : '') +
      '<div class="travel-bottom"><div class="travel-links">' + (t.link ? linkChip(t.link) : '') + '</div>' +
      '<div class="travel-actions"><button class="travel-check" data-action="toggle-travel" data-id="' + t.id + '">' + icon(t.done ? 'check' : 'clock', 10) + (t.done ? '已完成' : '还没') + '</button>' +
      '<button class="travel-edit" data-action="edit-travel" data-id="' + t.id + '" aria-label="编辑">' + icon('edit', 11) + '</button></div></div></div>' +
      (t.done ? '<span class="done-stamp">DONE</span>' : '') +
      '</article>';
  }

  /* =========================================================
     Us page
     ========================================================= */
  function renderUsPage() {
    const a = user('a'), b = user('b');
    const info = getDayInfo();
    const statuses = state.statuses.length;
    const reports = state.reports.length;
    const wishes = state.foods.length + state.travels.length;
    const dramas = state.dramas.length;
    const memories = state.memories.length;
    const events = state.events.length;
    const todos = state.todos.filter(function (t) { return !t.done; }).length;
    const visits = state.visits.length;
    const countdowns = state.countdowns.length;
    return '<section class="us-hero">' +
      '<div class="us-hero-top">' +
      '<div class="couple-avatars">' + avatarHtml(a, 'pair-a') + '<span class="heart-link">' + icon('heart', 12) + '</span>' + avatarHtml(b, 'pair-b') + '</div>' +
      '<div class="us-hero-copy"><h1>' + esc(a.name) + ' <span style="color:var(--rose)">&</span> ' + esc(b.name) + '</h1>' +
      '<p>' + zodiacLabel('a') + ' × ' + zodiacLabel('b') + '</p></div>' +
      '<button class="icon-btn us-edit" data-action="edit-profiles" aria-label="编辑资料">' + icon('edit', 15) + '</button></div>' +
      '<div class="us-hero-bottom"><span class="days"><b>' + info.count + '</b> 天 · ' + esc(info.nextLabel) + '</span><span class="badge rose">' + IconsHeartInline() + ' OUR HOME</span></div>' +
      '</section>' +
      '<div class="quote-card"><span class="eyebrow">A NOTE FOR TODAY</span><p>' + esc(quoteOfDay()) + '</p><div class="q-sign">' + icon('heart', 10) + ' OUR LITTLE HOUSE · ' + fmtDate(Date.now()) + '</div></div>' +
      '<div class="feature-grid">' +
      '<button class="feature-card wide zodiac" data-action="nav" data-page="zodiac">' +
      '<div class="fc-icon">' + icon('sparkles', 18) + '</div>' +
      '<div class="constellation">' + constellationSvg('') + '</div>' +
      '<div><span class="fc-badge">默契 ' + compatibilityScore(a, b) + '%</span>' +
      '<h3>星座 & AI 性格小报告</h3><p>看看你们的星盘、默契指数，和那些需要小心绕开的瞬间。</p></div>' +
      '<span class="fc-arrow">→</span></button>' +
      '<button class="feature-card wide recap" data-action="nav" data-page="recap">' +
      '<div class="fc-icon">' + icon('book', 18) + '</div>' +
      '<div class="recap-mini"><b>' + currentMonthLabel() + '</b><span>MONTHLY ZINE</span></div>' +
      '<div><h3>月度回忆</h3><p>把这个月的照片、旅行、美食和心情，排成一张专属杂志。</p></div>' +
      '<span class="fc-arrow">→</span></button>' +
      '<button class="feature-card calendar" data-action="nav" data-page="calendar"><div class="fc-icon">' + icon('calendar', 17) + '</div>' +
      '<div><h3>共享日历</h3><p>' + (events ? events + ' 个约定 · 一起记着' : '把约会和纪念日写进来') + '</p></div><span class="fc-arrow">→</span></button>' +
      '<button class="feature-card countdown" data-action="nav" data-page="countdown"><div class="fc-icon">' + icon('clock', 17) + '</div>' +
      '<div><h3>倒计时</h3><p>' + (countdowns ? countdowns + ' 个日子 · 历史上的今天' : '等下一个特别的日子') + '</p></div><span class="fc-arrow">→</span></button>' +
      '<button class="feature-card checklist" data-action="nav" data-page="checklist"><div class="fc-icon">' + icon('checkCircle', 17) + '</div>' +
      '<div><h3>共同清单</h3><p>' + (todos ? todos + ' 件小事还没打勾' : '今天一起做点什么？') + '</p></div><span class="fc-arrow">→</span></button>' +
      '<button class="feature-card footprints" data-action="nav" data-page="footprints"><div class="fc-icon">' + icon('mapPin', 17) + '</div>' +
      '<div><h3>足迹地图</h3><p>' + (visits ? '一起去过 ' + visits + ' 个地方' : '把去过的城市钉在地图上') + '</p></div><span class="fc-arrow">→</span></button>' +
      '<button class="feature-card drama" data-action="nav" data-page="dramas"><div class="fc-icon">' + icon('tv', 17) + '</div>' +
      '<div><h3>一起看的剧</h3><p>' + (dramas ? dramas + ' 部剧 · 等有空看' : '今晚看点什么？') + '</p></div><span class="fc-arrow">→</span></button>' +
      '<button class="feature-card memory" data-action="nav" data-page="memories"><div class="fc-icon">' + icon('video', 17) + '</div>' +
      '<div><h3>回忆胶囊</h3><p>' + (memories ? memories + ' 支舍不得删的视频' : '存下抖音 / 微信里的碎片') + '</p></div><span class="fc-arrow">→</span></button>' +
      '<button class="feature-card settings" data-action="nav" data-page="settings"><div class="fc-icon">' + icon('settings', 17) + '</div>' +
      '<div><h3>小屋设置</h3><p>资料、密码、备份和收纳</p></div><span class="fc-arrow">→</span></button>' +
      '</div>' +
      '<div class="us-stats"><div class="us-stat"><b>' + statuses + '</b><span>条动态</span></div><div class="us-stat"><b>' + reports + '</b><span>次报备</span></div><div class="us-stat"><b>' + wishes + '</b><span>个心愿</span></div></div>' +
      '<div class="us-footer"><span class="footer-heart">♡</span><br>OUR LITTLE HOUSE · PRIVATE FOR TWO<br>只属于 ' + esc(a.name) + ' 和 ' + esc(b.name) + ' 的小小空间<br><span style="opacity:.55">v' + APP_VERSION + ' · LOCAL FIRST</span></div>';
  }

  function IconsHeartInline() {
    return '<span style="display:inline-flex;width:9px;height:9px">' + icon('heart', 9) + '</span>';
  }

  function currentMonthLabel() {
    const d = new Date();
    return d.getFullYear() + '.' + pad(d.getMonth() + 1);
  }

  /* =========================================================
     Zodiac + AI
     ========================================================= */
  function zodiacForUser(id) {
    return id === 'a' ? ZODIACS[11] : ZODIACS[8];
  }

  function zodiacLabel(id) {
    const z = zodiacForUser(id);
    return z.name.replace('座', '') + (id === 'a' ? '女' : '男');
  }

  function zodiacOf(birthday) {
    const d = parseDate(birthday);
    if (!d) return null;
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const md = m * 100 + day;
    if (md >= 321 && md <= 419) return ZODIACS[0];
    if (md >= 420 && md <= 520) return ZODIACS[1];
    if (md >= 521 && md <= 621) return ZODIACS[2];
    if (md >= 622 && md <= 722) return ZODIACS[3];
    if (md >= 723 && md <= 822) return ZODIACS[4];
    if (md >= 823 && md <= 922) return ZODIACS[5];
    if (md >= 923 && md <= 1023) return ZODIACS[6];
    if (md >= 1024 && md <= 1122) return ZODIACS[7];
    if (md >= 1123 && md <= 1221) return ZODIACS[8];
    if (md >= 1222 || md <= 119) return ZODIACS[9];
    if (md >= 120 && md <= 218) return ZODIACS[10];
    return ZODIACS[11];
  }

  function compatibilityScore(a, b) {
    const za = zodiacForUser(a.id);
    const zb = zodiacForUser(b.id);
    if (!za || !zb) return 0;
    const key = za.element + '-' + zb.element;
    const base = ELEMENT_PAIR[key] || 72;
    const jitter = (hashString(a.name + b.name + za.id + zb.id) % 7) - 3;
    return Math.max(55, Math.min(98, base + jitter));
  }

  function dailyFortune(a, b) {
    const za = zodiacForUser(a.id);
    const zb = zodiacForUser(b.id);
    if (!za || !zb) return null;
    const seed = hashString(dayKey() + za.id + zb.id + a.name + b.name);
    return {
      good: pick(GOOD_FORTUNES, seed, 3),
      bad: pick(BAD_FORTUNES, seed, 9),
      cautions: [
        pick(CAUTIONS, seed, 4),
        pick(CAUTIONS, seed, 11),
        pick(CAUTIONS, seed, 17)
      ],
      lucky: pick(['奶油白', '草莓粉', '薄荷绿', '黄油黄', '雾霾蓝', '葡萄紫'], seed, 23),
      food: pick(['热乎乎的汤', '一块小蛋糕', '一碗面', '两杯热奶茶', '刚出炉的面包', '甜甜的草莓'], seed, 31)
    };
  }

  function renderZodiacPage() {
    const a = user('a'), b = user('b');
    const za = zodiacForUser('a'), zb = zodiacForUser('b');
    const both = true;
    const score = compatibilityScore(a, b);
    const fortune = dailyFortune(a, b);
    return subhead('星座与性格', 'us', '<button class="icon-btn" data-action="edit-profiles" aria-label="编辑资料">' + icon('edit', 14) + '</button>') +
      '<div class="zodiac-hero">' +
      '<div class="constellation-bg">' + constellationSvg('') + '</div>' +
      '<div class="zodiac-hero-content"><div><h2>' + (both ? '我们的化学反应' : '星星还没对齐') + '</h2>' +
      '<p>' + (both ? '把两个人的小脾气，放在同一张星图上看。' : '补上两个人的生日，就能看到默契指数和相处小提醒。') + '</p></div>' +
      (both ? '<div class="compat-ring"><svg viewBox="0 0 100 100"><circle class="ring-bg" cx="50" cy="50" r="42"/><circle class="ring-fill" cx="50" cy="50" r="42" stroke-dasharray="' + (score / 100 * 264) + ' 264"/></svg><div class="inner"><b>' + score + '</b><span>默契指数</span></div></div>' : '<button class="btn btn-secondary btn-sm" data-action="edit-profiles">补生日</button>') +
      '</div>' +
      '<div class="zodiac-signs"><div class="zodiac-mini"><span class="z-symbol">' + za.symbol + '</span><div><b>' + zodiacLabel('a') + '</b><span>' + za.range + ' · ' + ELEMENTS[za.element].label + '</span></div></div>' +
      '<div class="zodiac-mini"><span class="z-symbol">' + zb.symbol + '</span><div><b>' + zodiacLabel('b') + '</b><span>' + zb.range + ' · ' + ELEMENTS[zb.element].label + '</span></div></div></div>' +
      '</div>' +
      (both ? renderFate(fortune) + renderCaution(fortune) : renderZodiacEmpty()) +
      renderAiCard(a, b, za, zb);
  }

  function renderFate(fortune) {
    return '<div class="section-head"><div><span class="eyebrow">TODAY\'S LITTLE NOTES</span><h2>今天的好与坏</h2></div><span class="tiny muted">' + fmtDate(Date.now()) + '</span></div>' +
      '<div class="fate-grid"><div class="fate-card good"><div class="f-label">' + icon('sparkles', 11) + ' 宜</div><p>' + esc(fortune.good) + '</p></div>' +
      '<div class="fate-card bad"><div class="f-label">' + icon('shield', 11) + ' 忌</div><p>' + esc(fortune.bad) + '</p></div></div>' +
      '<div class="badge butter" style="margin-top:8px">今日幸运色 · ' + esc(fortune.lucky) + '　今日幸运食物 · ' + esc(fortune.food) + '</div>';
  }

  function renderCaution(fortune) {
    return '<div class="section-head"><div><span class="eyebrow">GENTLE WARNING</span><h2>需要小心的地方</h2></div><span class="tiny muted">不是预言，是提醒</span></div>' +
      '<div class="caution-list">' + fortune.cautions.map(function (c, i) {
        return '<div class="caution-item"><span class="c-num">' + (i + 1) + '</span><span>' + esc(c) + '</span></div>';
      }).join('') + '</div>';
  }

  function renderZodiacEmpty() {
    return '<div class="empty" style="margin-top:12px"><span class="emoji">🌙</span><h3>还差两个生日</h3><p>生日是星座的入口。填上之后，这里会长出你们的默契指数、今日宜忌和相处提醒。</p><button class="btn btn-primary btn-sm" style="margin-top:10px" data-action="edit-profiles">去补生日</button></div>';
  }

  function renderAiCard(a, b, za, zb) {
    const ai = state.meta.ai;
    return '<div class="ai-card"><div class="ai-head"><div><span class="eyebrow">AI LITTLE REPORT</span><h3>我们的性格说明书</h3><p>从星座、名字和你们一起留下的小事里，写一份只属于两个人的观察。</p></div><span class="ai-spark">✦</span></div>' +
      (session.aiLoading ? '<div class="ai-loading"><span class="orb"></span><span>正在观察你们的小脾气…</span></div>' :
        ai ? renderAiReport(ai, a, b) :
          '<div class="ai-empty"><div class="ai-orb">🔮</div><p>不是算命，是帮你们把“为什么总是这样”讲得可爱一点。</p>' +
          '<button class="btn btn-dark" data-action="generate-ai">' + icon('sparkles', 14) + ' 生成我们的报告</button></div>') +
      '<p class="ai-disclaimer">AI 灵感分析 · 本地生成，仅供娱乐 · 不联网、不上传</p></div>';
  }

  function renderAiReport(ai, a, b) {
    const tags = Array.from(new Set((ai.tagsA || []).concat(ai.tagsB || []))).slice(0, 7);
    return '<div class="ai-report">' +
      '<div class="ai-title"><b>' + esc(ai.titleA) + ' × ' + esc(ai.titleB) + '</b><span class="badge rose">匹配 ' + ai.score + '%</span></div>' +
      '<p class="ai-summary">' + esc(ai.summary) + '</p>' +
      '<div class="ai-tags">' + tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
      (ai.mbtiLine ? '<div class="ai-block"><h4>' + icon('book', 11) + ' MBTI 小注</h4><p>' + esc(ai.mbtiLine) + '</p></div>' : '') +
      '<div class="ai-block"><h4>' + icon('heart', 11) + ' ' + esc(a.name) + ' 的小设定</h4><p>' + esc(ai.aParagraph) + '</p></div>' +
      '<div class="ai-block"><h4>' + icon('heart', 11) + ' ' + esc(b.name) + ' 的小设定</h4><p>' + esc(ai.bParagraph) + '</p></div>' +
      '<div class="ai-block"><h4>' + icon('sparkles', 11) + ' 我们的化学反应</h4><p>' + esc(ai.chemistry) + '</p></div>' +
      '<div class="ai-block"><h4>' + icon('shield', 11) + ' 要小心的小裂缝</h4><p>' + esc(ai.friction) + '</p></div>' +
      '<div class="ai-block"><h4>' + icon('calendar', 11) + ' 本周小任务</h4><p>' + esc(ai.task) + '</p></div>' +
      '<div class="ai-block"><h4>' + icon('database', 11) + ' 数据里的小发现</h4><p>' + esc(ai.dataLine) + '</p></div>' +
      '<div class="ai-actions"><button class="btn btn-secondary btn-sm" data-action="generate-ai">' + icon('refresh', 12) + ' 重新写一份</button>' +
      '<button class="btn btn-ghost btn-sm" data-action="nav" data-page="settings">保存/备份</button></div>' +
      '</div>';
  }

  function generateAiReport() {
    const a = user('a'), b = user('b');
    const za = zodiacForUser('a'), zb = zodiacForUser('b');
    const seed = (state.meta.ai && state.meta.ai.seed ? state.meta.ai.seed : Math.floor(Math.random() * 9000)) + 1;
    const ta = AI_TYPES[za.element];
    const tb = AI_TYPES[zb.element];
    const titleA = pick(ta.titles, seed, hashString(a.name));
    let titleB = pick(tb.titles, seed, hashString(b.name) + 5);
    if (titleB === titleA) {
      titleB = tb.titles[(tb.titles.indexOf(titleB) + 1) % tb.titles.length];
    }
    const score = compatibilityScore(a, b);
    const statusCount = state.statuses.length;
    const reportCount = state.reports.length;
    const foodCount = state.foods.length;
    const travelCount = state.travels.length;
    const doneFood = state.foods.filter(function (f) { return f.done; }).length;
    const doneTravel = state.travels.filter(function (t) { return t.done; }).length;
    const combo = za.element + '-' + zb.element;
    const chemistryMap = {
      'fire-air': '一个点火，一个扇风。你们在一起很容易把普通的一天过成小型冒险，聊天不会无聊，行动力也会互相加成。',
      'air-fire': '一个点火，一个扇风。你们在一起很容易把普通的一天过成小型冒险，聊天不会无聊，行动力也会互相加成。',
      'earth-water': '一个把根扎稳，一个把情绪照看。你们是那种不太声张、却能把日子过得很长的组合。',
      'water-earth': '一个把根扎稳，一个把情绪照看。你们是那种不太声张、却能把日子过得很长的组合。',
      'fire-fire': '两个人都热，也都倔。开心的时候像烟花，意见不合的时候也容易同时上头。学会轮流退半步，你们会非常耀眼。',
      'earth-earth': '你们都重视踏实和承诺，关系像慢慢盖起来的房子，不轰烈，但很稳。偶尔也要给彼此一点没有计划的小惊喜。',
      'air-air': '两个人都需要聊天、空间和新鲜感，像两只一起飞的小风筝。记得偶尔把线收一收，聊聊那些不轻松但重要的话。',
      'water-water': '你们都敏感、会共情，容易被彼此的情绪牵动。温柔是你们的天赋，但别让“猜”代替“问”。',
      'fire-earth': '一个想马上行动，一个想先想清楚。节奏不同不代表不合适，提前说好“谁先迈一步”，会少很多误会。',
      'earth-fire': '一个想马上行动，一个想先想清楚。节奏不同不代表不合适，提前说好“谁先迈一步”，会少很多误会。',
      'air-water': '一个用讲道理消化情绪，一个用感受消化道理。你们最需要的不是谁说服谁，而是先接住，再讨论。',
      'water-air': '一个用讲道理消化情绪，一个用感受消化道理。你们最需要的不是谁说服谁，而是先接住，再讨论。',
      'fire-water': '一个像火，一个像水，靠近时很迷人，也容易互相蒸发。火需要被温柔回应，水需要被明确安放。',
      'water-fire': '一个像火，一个像水，靠近时很迷人，也容易互相蒸发。火需要被温柔回应，水需要被明确安放。',
      'earth-air': '一个脚踏实地，一个想要呼吸。你们可以互相打开新的世界，也要记得把“我在”说给那个容易想多的人听。',
      'air-earth': '一个脚踏实地，一个想要呼吸。你们可以互相打开新的世界，也要记得把“我在”说给那个容易想多的人听。'
    };
    const frictionMap = {
      fire: '脾气来得快，别在气头上接话，给彼此十分钟冷却，再回来好好说。',
      earth: '习惯把不舒服攒着，别等“扣分”扣完了才开口，小事也值得当天说清楚。',
      air: '容易用玩笑带过认真，遇到重要的事，试着把“没事”换成“其实我有一点在意”。',
      water: '会把一句无心的话回放很多遍，记得主动确认，不要让 TA 一个人猜。'
    };
    const third = function (text) { return String(text).replace(/你/g, 'TA'); };
    const task = pick([
      '这周找一个晚上，把手机放到另一个房间，认真吃完一顿饭。',
      '这周一起完成清单上最小的那个心愿，不用等“有空”。',
      '这周每天出门前，给对方留一句具体一点的夸奖。',
      '这周交换一首“听到就想起你”的歌，写进彼此的状态里。',
      '这周允许一次没有计划的散步，走到哪里算哪里。',
      '这周把一件“我以为你知道”的小事，认真说出口。'
    ], seed, 13);
    const summary = a.name + '是' + titleA + '，' + b.name + '是' + titleB + '。' +
      '你们的默契不是“完全一样”，而是刚好能接住彼此不一样的那部分。';
    const descA = pick(ta.desc, seed, 1);
    let descB = pick(tb.desc, seed, 4);
    if (descB === descA) descB = tb.desc[(tb.desc.indexOf(descB) + 1) % tb.desc.length];
    const quirkA = pick(ta.quirk, seed, 2);
    let quirkB = pick(tb.quirk, seed, 5);
    if (quirkB === quirkA) quirkB = tb.quirk[(tb.quirk.indexOf(quirkB) + 1) % tb.quirk.length];
    const aParagraph = '你是' + titleA + '。' + descA + ' ' + quirkA + ' ' + ta.love[0] + ' ' + ta.love[1] + ' 但别忘了，你也值得被同样认真地回应。';
    const bParagraph = 'TA是' + titleB + '。' + third(descB) + ' ' + third(quirkB) + ' ' + third(tb.love[0]) + ' ' + third(tb.love[1]) + ' 有时候 TA 没说，不代表没在意。';
    const mbtiA = String(a.mbti || '').toUpperCase();
    const mbtiB = String(b.mbti || '').toUpperCase();
    let mbtiLine = '';
    if (mbtiA && mbtiB) {
      const both = function (ch) { return mbtiA.indexOf(ch) >= 0 && mbtiB.indexOf(ch) >= 0; };
      const either = function (ch) { return mbtiA.indexOf(ch) >= 0 || mbtiB.indexOf(ch) >= 0; };
      let note = '';
      if (both('N')) note = '两个 N 人相处，最不缺的就是脑内小剧场和深夜长谈。记得偶尔把想法落到具体的行动上。';
      else if (both('S')) note = '两个 S 人更相信看得见摸得着的细节，稳稳的日常就是你们的安全感。';
      else if (either('N') && either('S')) note = '一个爱想未来，一个更在意当下，分工合作反而很互补。';
      else if (both('F')) note = '两个 F 人都很会照顾情绪，也要练习把真实需求说出口，而不是只忙着体谅对方。';
      else if (both('T')) note = '两个 T 人习惯讲道理，别忘了先接住情绪，再讨论对错。';
      else if (either('T') && either('F')) note = '一个先讲逻辑，一个先讲感受，先确认彼此不是在对立，再讨论问题。';
      else if (both('J')) note = '两个 J 人喜欢计划，偶尔来一次没有安排的散步会很有趣。';
      else if (both('P')) note = '两个 P 人自由随性，记得给重要的事设一个小提醒。';
      else if (either('J') && either('P')) note = '一个爱计划，一个爱随性，提前约定哪些事必须定、哪些事可以随缘。';
      else note = '这张字母表只是一个切口，不是你们的说明书。';
      mbtiLine = '你们的 MBTI 是 ' + mbtiA + ' × ' + mbtiB + '。' + note;
    } else if (mbtiA || mbtiB) {
      mbtiLine = '目前只记录了' + (mbtiA ? a.name : b.name) + '的 MBTI（' + (mbtiA || mbtiB) + '），补上另一个人的，会更好玩。';
    }
    const dataLine = '你们已经一起留下 ' + statusCount + ' 条动态、' + reportCount + ' 次报备、' + foodCount + ' 个美食心愿和 ' + travelCount + ' 个旅行坐标。' +
      (doneFood + doneTravel > 0 ? '其中 ' + (doneFood + doneTravel) + ' 个已经打了勾——这些“说到做到”，就是关系里最实在的糖。' : '清单还长，慢慢来，反正你们有一整个以后。');
    const report = {
      seed: seed,
      createdAt: Date.now(),
      titleA: titleA,
      titleB: titleB,
      tagsA: ta.tags.slice(0, 3),
      tagsB: tb.tags.slice(0, 3),
      summary: summary,
      mbtiLine: mbtiLine,
      aParagraph: aParagraph,
      bParagraph: bParagraph,
      chemistry: chemistryMap[combo] || '你们的相处有自己的节奏，不必照搬别人的恋爱模板。',
      friction: za.element === zb.element
        ? '你们都' + frictionMap[za.element]
        : '对' + a.name + '来说，' + frictionMap[za.element] + ' 对' + b.name + '来说，' + frictionMap[zb.element],
      task: task,
      dataLine: dataLine,
      score: score
    };
    state.meta.ai = report;
    saveState();
  }

  /* =========================================================
     Drama page
     ========================================================= */
  function renderDramaPage() {
    const all = state.dramas.slice().sort(function (a, b) {
      if (a.status !== b.status) return a.status === 'want' ? -1 : 1;
      return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
    });
    const list = session.dramaFilter === 'all' ? all : all.filter(function (d) { return d.status === session.dramaFilter; });
    const counts = {
      all: all.length,
      want: all.filter(function (d) { return d.status !== 'done'; }).length,
      done: all.filter(function (d) { return d.status === 'done'; }).length
    };
    return subhead('一起看的剧', 'us', '<button class="icon-btn" data-action="open-drama-add" aria-label="添加剧集">' + icon('plus', 16) + '</button>') +
      '<div class="drama-list-head"><span class="eyebrow">WATCH LIST</span><h2>把想看的剧，留给有空的晚上。</h2><p>不追进度，只记下“以后要一起看”的约定。</p></div>' +
      '<div class="drama-filters"><div class="segmented">' +
      dramaTab('all', '全部', counts.all) + dramaTab('want', '想看', counts.want) + dramaTab('done', '看完', counts.done) +
      '</div></div>' +
      (list.length ? '<div>' + list.map(dramaCard).join('') + '</div>' : '<div class="empty" style="margin-top:9px"><span class="emoji">🎬</span><h3>这里还没有剧</h3><p>去下面挑一部，或者自己添加。</p></div>') +
      '<button class="dashed-add" style="margin-top:10px" data-action="open-drama-add">' + icon('plus', 14) + ' 添加一部想一起看的剧</button>' +
      '<div class="drama-recs"><div class="rec-head"><h3>不知道看什么？</h3><span>替你挑了几部</span></div><div class="rec-scroll">' +
      DRAMA_RECS.map(function (rec) {
        const has = state.dramas.some(function (d) { return d.title === rec.title; });
        return '<div class="rec-card"><span class="rc-emoji">' + rec.emoji + '</span><b>' + esc(rec.title) + '</b><span>' + esc(rec.platform) + ' · ' + rec.total + ' 集</span>' +
          '<span>' + esc(rec.note) + '</span><button data-action="add-rec" data-title="' + esc(rec.title) + '">' + (has ? '已在清单 ✓' : '+ 加入清单') + '</button></div>';
      }).join('') + '</div></div>' +
      '<div class="us-footer" style="padding-top:18px">看剧的时候，记得把肩膀借给对方。</div>';
  }

  function dramaTab(id, label, n) {
    return '<button class="' + (session.dramaFilter === id ? 'active' : '') + '" data-action="drama-filter" data-filter="' + id + '">' + label + '<span class="n">' + n + '</span></button>';
  }

  function posterHtml(d, cls) {
    const colors = [['#d98d9b', '#8f5a6b'], ['#8ebba6', '#4f7768'], ['#e6bd77', '#b27b3c'], ['#a9a1c9', '#6b638e'], ['#e3a1a8', '#a4657c'], ['#9bbfd8', '#5d7f9d']];
    const c = colors[hashString(d.title) % colors.length];
    return '<div class="' + cls + '" style="background:linear-gradient(145deg,' + c[0] + ',' + c[1] + ')"><span class="dp-emoji">' + esc(d.emoji || '🎬') + '</span><span class="dp-title">' + esc(d.title) + '</span></div>';
  }

  function dramaCard(d) {
    const done = d.status === 'done';
    return '<article class="drama-card' + (done ? ' done' : '') + '">' + posterHtml(d, 'drama-poster') +
      '<div class="d-main"><div class="d-meta"><span class="badge ' + (done ? '' : 'rose') + '">' + (done ? '看完' : '想看') + '</span><span>' + esc(d.platform || '') + '</span>' +
      (d.total ? '<span>· ' + d.total + ' 集</span>' : '') + '</div>' +
      '<h3>' + esc(d.title) + '</h3><p class="d-note">' + esc(d.note || '') + '</p>' +
      '<div class="d-bottom"><span>' + (done ? '已经一起看完' : '等一个有空的晚上') + '</span>' +
      '<div class="d-actions"><button data-action="drama-done" data-id="' + d.id + '" aria-label="' + (done ? '移回想看' : '标记看完') + '">' + icon(done ? 'refresh' : 'check', 11) + '</button>' +
      '<button data-action="edit-drama" data-id="' + d.id + '" aria-label="编辑">' + icon('edit', 11) + '</button></div></div></div></article>';
  }

  /* =========================================================
     Memories page
     ========================================================= */
  function renderMemoryPage() {
    const all = state.memories.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
    const filtered = session.memoryFilter === 'all' ? all : all.filter(function (m) { return platformOf(m.url).id === session.memoryFilter; });
    const platforms = ['all', 'douyin', 'wechat', 'bilibili', 'xhs', 'web'];
    return subhead('回忆胶囊', 'us', '<button class="icon-btn" data-action="open-memory-add" aria-label="添加回忆">' + icon('plus', 16) + '</button>') +
      '<div class="memory-hero"><h1>把舍不得删的，<br><em>都收在这里。</em></h1><p>抖音、微信视频号、B站、小红书……那些“你看这个好好笑”的瞬间，也值得被记住。</p><div class="mem-doodle">🎞️</div></div>' +
      '<div class="memory-filters">' + platforms.map(function (p) {
        const label = p === 'all' ? '全部' : ({ douyin: '抖音', wechat: '微信', bilibili: 'B站', xhs: '小红书', web: '链接' })[p];
        return '<button class="chip' + (session.memoryFilter === p ? ' active' : '') + '" data-action="memory-filter" data-filter="' + p + '">' + label + '</button>';
      }).join('') + '</div>' +
      (filtered.length ? '<div class="memory-grid">' + filtered.map(memoryCard).join('') + '</div>' :
        '<div class="empty"><span class="emoji">🎞️</span><h3>胶囊还是空的</h3><p>把抖音 / 微信里舍不得删的视频链接贴进来，写一句为什么想记住。</p><button class="btn btn-primary btn-sm" style="margin-top:10px" data-action="open-memory-add">存下第一支</button></div>') +
      '<button class="dashed-add" style="margin-top:12px" data-action="open-memory-add">' + icon('plus', 14) + ' 存一支视频 / 一个链接</button>' +
      '<div class="report-note">链接只会保存在这台设备里，不会自动下载视频。<br>微信里打不开的链接，可以先复制，再去对应的 App 打开。</div>';
  }

  function memoryCard(m) {
    const p = platformOf(m.url);
    return '<article class="memory-card"><div class="memory-cover">' +
      (m.image ? '<img src="' + esc(m.image) + '" alt="" loading="lazy">' : '<span class="mc-emoji">' + p.emoji + '</span>') +
      '<span class="platform-badge">' + p.label + '</span>' +
      (m.url ? '<span class="play">' + icon('play', 11) + '</span>' : '') + '</div>' +
      '<div class="memory-body"><h3>' + esc(m.title) + '</h3><p>' + esc(m.note || '没有写备注，但应该是个好瞬间。') + '</p>' +
      '<div class="memory-foot"><span>' + relTime(m.createdAt) + '</span><div class="m-actions">' +
      (m.url ? '<button data-action="copy-link" data-url="' + esc(m.url) + '">复制</button><button data-action="open-link" data-url="' + esc(m.url) + '">打开</button>' : '') +
      '<button data-action="edit-memory" data-id="' + m.id + '">编辑</button></div></div></div></article>';
  }

  /* =========================================================
     Settings page
     ========================================================= */
  function renderSettingsPage() {
    const a = user('a'), b = user('b');
    const used = storageSize();
    const pct = Math.min(100, (used / (5 * 1024 * 1024)) * 100);
    const samples = sampleCount();
    return subhead('小屋设置', 'us', '<button class="icon-btn" data-action="lock" aria-label="锁上小屋">' + icon('lock', 15) + '</button>') +
      '<div class="settings-section"><div class="settings-label">' + icon('heart', 11) + ' 住户资料</div><div class="settings-card">' +
      settingsProfileRow(a) + settingsProfileRow(b) +
      '<button class="settings-row" data-action="edit-profiles"><span class="s-icon">' + icon('calendar', 15) + '</span><span class="s-copy"><b>在一起的第一天</b><span>' + esc(state.meta.start || '还没填写') + ' · ' + getDayInfo().count + ' 天</span></span><span class="chev">›</span></button>' +
      '</div></div>' +
      '<div class="settings-section"><div class="settings-label">' + icon('shield', 11) + ' 小锁与安全</div><div class="settings-card">' +
      '<button class="settings-row" data-action="change-password"><span class="s-icon">' + icon('key', 15) + '</span><span class="s-copy"><b>修改小屋密码</b><span>密码只做本机进入验证，不加密数据</span></span><span class="chev">›</span></button>' +
      '<button class="settings-row" data-action="lock"><span class="s-icon">' + icon('lock', 15) + '</span><span class="s-copy"><b>锁上小屋</b><span>下次进入需要重新输入暗号</span></span><span class="chev">›</span></button>' +
      '</div><div class="settings-note">这是一间本地小屋：数据只保存在当前浏览器。换手机、清缓存或换浏览器之前，记得先导出备份。</div></div>' +
      '<div class="settings-section"><div class="settings-label">' + icon('database', 11) + ' 数据与备份</div><div class="settings-card">' +
      '<button class="settings-row" data-action="export-data"><span class="s-icon">' + icon('download', 15) + '</span><span class="s-copy"><b>导出小屋备份</b><span>下载一个包含所有文字和图片的 JSON 文件</span></span><span class="chev">›</span></button>' +
      '<button class="settings-row" data-action="import-data"><span class="s-icon">' + icon('upload', 15) + '</span><span class="s-copy"><b>恢复小屋备份</b><span>用之前导出的 JSON 覆盖当前小屋</span></span><span class="chev">›</span></button>' +
      '<button class="settings-row" data-action="clear-samples" ' + (samples ? '' : 'disabled style="opacity:.5"') + '><span class="s-icon">' + icon('sparkles', 15) + '</span><span class="s-copy"><b>清空示例内容</b><span>' + (samples ? '移除 ' + samples + ' 条示例，保留你们的资料' : '没有需要清理的示例') + '</span></span><span class="chev">›</span></button>' +
      '</div>' +
      '<div class="settings-row" style="margin-top:9px;border:1px solid var(--line);border-radius:14px;background:var(--paper)"><span class="s-icon">' + icon('database', 15) + '</span><span class="s-copy"><b>本机占用 ' + formatBytes(used) + '</b><span>建议保持在 4 MB 以内</span><div class="storage-bar"><i style="width:' + pct + '%"></i></div></span></div>' +
      '<input type="file" id="import-file" accept="application/json,.json" class="hidden">' +
      '</div>' +
      '<div class="settings-section"><div class="settings-label">' + icon('star', 11) + ' 关于小屋</div>' +
      '<div class="about-card"><div class="about-cat">🎀</div><b>OUR LITTLE HOUSE</b><p>一间只属于两个人的小小空间。<br>原创小猫插画 · 无外部依赖 · 数据留在本机。</p><span class="ver">VERSION ' + APP_VERSION + '</span></div>' +
      '<div class="settings-note">抖音、微信视频号等链接只做收藏，不内嵌播放。</div>' +
      '<div class="settings-card" style="margin-top:9px"><button class="settings-row danger" data-action="reset-house"><span class="s-icon">' + icon('trash', 15) + '</span><span class="s-copy"><b>清空并重置小屋</b><span>删除所有资料、密码和照片，无法恢复</span></span><span class="chev">›</span></button></div>' +
      '</div>' +
      '<div class="us-footer"><span class="footer-heart">♡</span><br>OUR LITTLE HOUSE · MADE FOR TWO<br>谢谢你们把日子过得这么认真。</div>';
  }

  function settingsProfileRow(u) {
    return '<button class="settings-row profile-settings-row" data-action="edit-profiles"><span class="avatar">' + avatarSvg(u.avatar) + '</span><span class="s-copy"><b>' + esc(u.name) + '</b><span>' + (u.birthday ? '生日 ' + esc(u.birthday) + ' · ' + zodiacLabel(u.id) : zodiacLabel(u.id) + ' · 未填写生日') + (u.mbti ? ' · ' + esc(u.mbti) : '') + '</span></span><span class="chev">›</span></button>';
  }


  /* =========================================================
     Shared calendar / checklist / recap / footprints
     ========================================================= */
  function monthShift(key, delta) {
    const parts = String(key || '').split('-');
    let y = Number(parts[0]);
    let m = Number(parts[1]);
    if (!y || !m) { const n = new Date(); y = n.getFullYear(); m = n.getMonth() + 1; }
    const d = new Date(y, m - 1 + delta, 1);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }

  function monthTitle(key) {
    const parts = String(key || '').split('-');
    return Number(parts[0]) + ' 年 ' + Number(parts[1]) + ' 月';
  }

  function monthLabel(key) {
    const parts = String(key || '').split('-');
    return Number(parts[0]) + '.' + pad(Number(parts[1]));
  }

  function inMonth(ts, key) {
    return dayKey(ts).slice(0, 7) === key;
  }

  function anniversaryForMonth(key) {
    const start = parseDate(state.meta.start);
    if (!start) return null;
    const parts = String(key).split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    if (start.getMonth() + 1 !== m) return null;
    const d = new Date(y, m - 1, start.getDate());
    if (d.getMonth() + 1 !== m) return null;
    return {
      id: 'anniversary-' + y,
      title: '在一起纪念日',
      date: dayKey(d),
      type: 'anniversary',
      note: '第 ' + (y - start.getFullYear() + 1) + ' 年，还是想和你一起过。',
      derived: true
    };
  }

  function calendarEventsForMonth(key) {
    const list = (state.events || []).filter(function (e) { return String(e.date).slice(0, 7) === key; });
    const ann = anniversaryForMonth(key);
    if (ann) list.push(ann);
    return list.sort(function (a, b) { return a.date.localeCompare(b.date); });
  }

  function renderCalendarPage() {
    const key = session.calendarMonth || dayKey().slice(0, 7);
    const parts = key.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const first = new Date(year, month - 1, 1);
    const days = new Date(year, month, 0).getDate();
    const lead = first.getDay();
    const events = calendarEventsForMonth(key);
    const today = dayKey();
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push('<span class="cal-cell empty"></span>');
    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month - 1, d);
      const dk = dayKey(date);
      const evs = events.filter(function (e) { return e.date === dk; });
      cells.push('<button class="cal-cell' + (dk === today ? ' today' : '') + (evs.length ? ' has' : '') + '" data-action="open-event-add" data-date="' + dk + '">' +
        '<span class="cal-day">' + d + '</span>' +
        (evs.length ? '<span class="cal-dots">' + evs.slice(0, 3).map(function (e) { return '<i class="' + esc(e.type) + '"></i>'; }).join('') + '</span>' : '') +
        (evs.length ? '<span class="cal-label">' + esc(evs[0].title) + '</span>' : '') +
        '</button>');
    }
    while (cells.length % 7 !== 0) cells.push('<span class="cal-cell empty"></span>');
    return subhead('共享日历', 'us', '<button class="icon-btn" data-action="open-event-add" data-date="' + today + '" aria-label="添加日程">' + icon('plus', 16) + '</button>') +
      '<div class="calendar-card">' +
      '<div class="calendar-head"><button class="calendar-nav" data-action="calendar-shift" data-delta="-1" aria-label="上个月">' + icon('chevronRight', 14) + '</button>' +
      '<div><span class="eyebrow">OUR CALENDAR</span><h2>' + monthTitle(key) + '</h2></div>' +
      '<button class="calendar-nav" data-action="calendar-shift" data-delta="1" aria-label="下个月">' + icon('chevronRight', 14) + '</button></div>' +
      '<div class="calendar-week">' + ['日', '一', '二', '三', '四', '五', '六'].map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div>' +
      '<div class="calendar-grid">' + cells.join('') + '</div>' +
      '<div class="calendar-legend"><span><i class="date"></i>约会</span><span><i class="food"></i>吃饭</span><span><i class="anniversary"></i>纪念日</span><span><i class="other"></i>其他</span></div>' +
      '</div>' +
      '<div class="section-head"><div><span class="eyebrow">THIS MONTH</span><h2>这个月的约定</h2></div><button class="text-link" data-action="open-event-add" data-date="' + today + '">添加 +</button></div>' +
      (events.length ? '<div class="event-list">' + events.map(renderEventItem).join('') + '</div>' : '<div class="empty"><span class="emoji">🗓️</span><h3>这个月还没有约定</h3><p>点日历上的任意一天，或右上角的加号，记下一件想一起做的事。</p></div>') +
      '<div class="report-note">日历保存在这台设备里，两个身份看到的是同一份。</div>';
  }

  function renderEventItem(e) {
    const typeLabel = { date: '约会', food: '吃饭', trip: '旅行', anniversary: '纪念日', other: '其他' }[e.type] || '约定';
    const u = e.author ? user(e.author) : null;
    const d = new Date(e.date + 'T00:00:00');
    return '<div class="event-item ' + esc(e.type) + '">' +
      '<div class="event-date"><b>' + (d.getMonth() + 1) + '/' + d.getDate() + '</b><span>' + ['日', '一', '二', '三', '四', '五', '六'][d.getDay()] + '</span></div>' +
      '<div class="event-main"><div class="event-top"><span class="badge ' + (e.type === 'anniversary' ? 'rose' : e.type === 'food' ? 'butter' : '') + '">' + typeLabel + '</span>' +
      (u ? '<span class="tiny muted">' + esc(u.name) + ' 记的</span>' : '<span class="tiny muted">每年都会亮起来</span>') + '</div>' +
      '<b>' + esc(e.title) + '</b>' + (e.note ? '<p>' + esc(e.note) + '</p>' : '') + '</div>' +
      (e.derived ? '<span class="event-lock">♡</span>' : '<button class="event-edit" data-action="edit-event" data-id="' + e.id + '" aria-label="编辑日程">' + icon('edit', 12) + '</button>') +
      '</div>';
  }

  function renderChecklistPage() {
    const all = state.todos || [];
    const categories = ['生活', '购物', '家务', '其他'];
    const filter = session.checklistFilter || 'all';
    const list = (filter === 'all' ? all : all.filter(function (t) { return t.category === filter; })).slice().sort(function (a, b) {
      if (!!a.done !== !!b.done) return a.done ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
    const done = all.filter(function (t) { return t.done; }).length;
    const pct = all.length ? Math.round((done / all.length) * 100) : 0;
    return subhead('共同清单', 'us', '<button class="icon-btn" data-action="open-todo-add" aria-label="添加清单">' + icon('plus', 16) + '</button>') +
      '<div class="checklist-hero"><div class="checklist-hero-copy"><span class="eyebrow">TOGETHER LIST</span><h2>把日子过成<br><em>一起打勾的清单。</em></h2><p>小到买牙刷，大到去看海。完成一件，就多一个共同的“我们做到了”。</p></div>' +
      '<div class="checklist-ring" style="--pct:' + pct + '%"><b>' + pct + '%</b><span>完成</span></div></div>' +
      '<div class="checklist-progress"><div><span>已经一起完成</span><b>' + done + ' / ' + all.length + '</b></div><div class="progress-track"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="chip-row checklist-filters">' +
      '<button class="chip' + (filter === 'all' ? ' active' : '') + '" data-action="todo-filter" data-filter="all">全部 <span class="count">' + all.length + '</span></button>' +
      categories.map(function (c) {
        return '<button class="chip' + (filter === c ? ' active' : '') + '" data-action="todo-filter" data-filter="' + c + '">' + c + ' <span class="count">' + all.filter(function (t) { return t.category === c; }).length + '</span></button>';
      }).join('') + '</div>' +
      (list.length ? '<div class="todo-list">' + list.map(renderTodoItem).join('') + '</div>' : '<div class="empty"><span class="emoji">✅</span><h3>这一栏还空着</h3><p>写下一件想一起做的小事，完成的时候会很有成就感。</p></div>') +
      '<button class="dashed-add" style="margin-top:10px" data-action="open-todo-add">' + icon('plus', 14) + ' 再加一件小事</button>' +
      '<div class="report-note">清单不设截止日也没关系。<br>重要的是，有个人和你一起把生活往前推。</div>';
  }

  function renderTodoItem(t) {
    const u = user(t.author);
    return '<article class="todo-item' + (t.done ? ' done' : '') + '">' +
      '<button class="todo-check" data-action="toggle-todo" data-id="' + t.id + '" aria-label="' + (t.done ? '标记未完成' : '标记完成') + '">' + (t.done ? icon('check', 13) : '') + '</button>' +
      '<div class="todo-main"><div class="todo-line"><b>' + esc(t.title) + '</b><span class="badge">' + esc(t.category) + '</span></div>' +
      (t.note ? '<p>' + esc(t.note) + '</p>' : '') +
      '<div class="todo-meta">' + avatarHtml(u, 'xs') + esc(u.name) + (t.due ? ' · ' + esc(t.due) : '') + '</div></div>' +
      '<button class="todo-edit" data-action="edit-todo" data-id="' + t.id + '" aria-label="编辑清单">' + icon('edit', 12) + '</button>' +
      '</article>';
  }

  function recapStats(key) {
    const statuses = (state.statuses || []).filter(function (p) { return inMonth(p.createdAt, key); }).sort(function (a, b) { return b.createdAt - a.createdAt; });
    const reports = (state.reports || []).filter(function (r) { return inMonth(r.createdAt, key); });
    const foods = (state.foods || []).filter(function (f) { return f.done && inMonth(f.completedAt || f.createdAt, key); });
    const travels = (state.travels || []).filter(function (t) { return t.done && inMonth(t.completedAt || t.createdAt, key); });
    const dramas = (state.dramas || []).filter(function (d) { return d.status === 'done' && inMonth(d.completedAt || d.updatedAt || d.createdAt, key); });
    const memories = (state.memories || []).filter(function (m) { return inMonth(m.createdAt, key); });
    const visits = (state.visits || []).filter(function (v) { return String(v.date).slice(0, 7) === key; });
    const photos = [];
    statuses.forEach(function (p) {
      const imgs = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
      imgs.forEach(function (img) { photos.push({ src: img, post: p }); });
    });
    const moodCounts = {};
    statuses.forEach(function (p) { if (p.mood) moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1; });
    const topMood = Object.keys(moodCounts).sort(function (a, b) { return moodCounts[b] - moodCounts[a]; })[0] || '';
    return {
      statuses: statuses,
      reports: reports,
      foods: foods,
      travels: travels,
      dramas: dramas,
      memories: memories,
      visits: visits,
      photos: photos,
      topMood: topMood,
      lastStatus: statuses[0] || null
    };
  }

  function recapSentence(stats) {
    const bits = [];
    if (stats.statuses.length) bits.push('留下 ' + stats.statuses.length + ' 条动态');
    if (stats.reports.length) bits.push('报备 ' + stats.reports.length + ' 次');
    if (stats.foods.length) bits.push('打卡 ' + stats.foods.length + ' 个美食心愿');
    if (stats.travels.length) bits.push('完成 ' + stats.travels.length + ' 个旅行心愿');
    if (stats.dramas.length) bits.push('一起看完 ' + stats.dramas.length + ' 部剧');
    if (!bits.length) return '这个月安安静静的，但你们还在一起。';
    return '这个月，你们' + bits.join('、') + '。';
  }

  function renderRecapPage() {
    const key = session.recapMonth || dayKey().slice(0, 7);
    const stats = recapStats(key);
    const photoStrip = stats.photos.slice(0, 4);
    const doneWishes = stats.foods.concat(stats.travels).slice(0, 4);
    const nextWishes = (state.foods || []).filter(function (f) { return !f.done; }).slice(0, 2)
      .concat((state.travels || []).filter(function (t) { return !t.done; }).slice(0, 2));
    const quote = stats.lastStatus ? stats.lastStatus.text : quoteOfDay();
    const title = stats.statuses.length || stats.reports.length || stats.photos.length ? '这个月，<br><em>我们一起走过。</em>' : '这个月，<br><em>也在一起。</em>';
    return subhead('月度回忆', 'us', '<button class="icon-btn" data-action="print-recap" aria-label="打印月度回忆">' + icon('download', 15) + '</button>') +
      '<div class="recap-toolbar"><button class="calendar-nav" data-action="recap-shift" data-delta="-1" aria-label="上个月">' + icon('chevronRight', 14) + '</button>' +
      '<span>' + monthTitle(key) + '</span><button class="calendar-nav" data-action="recap-shift" data-delta="1" aria-label="下个月">' + icon('chevronRight', 14) + '</button></div>' +
      '<article class="recap-zine" id="recap-zine">' +
      '<div class="zine-top"><span class="eyebrow">OUR LITTLE HOUSE · MONTHLY ZINE</span><span class="zine-no">NO. ' + monthLabel(key).replace('.', ' / ') + '</span></div>' +
      '<h1>' + title + '</h1>' +
      '<p class="zine-lead">' + esc(recapSentence(stats)) + '</p>' +
      '<div class="zine-photos' + (photoStrip.length ? '' : ' no-photos') + '">' +
      (photoStrip.length ? photoStrip.map(function (p, i) {
        return '<figure class="zine-photo p' + i + '"><img src="' + esc(p.src) + '" alt=""><figcaption>' + esc(p.post.text.slice(0, 24)) + '</figcaption></figure>';
      }).join('') : '<div class="zine-empty-art"><span>📷</span><p>这个月的照片还空着<br>下次记得多拍一点</p></div>') +
      (stats.photos.length > 4 ? '<span class="zine-more">+' + (stats.photos.length - 4) + '</span>' : '') +
      '</div>' +
      '<div class="zine-stats">' +
      '<div><b>' + stats.statuses.length + '</b><span>条动态</span></div>' +
      '<div><b>' + stats.reports.length + '</b><span>次报备</span></div>' +
      '<div><b>' + (stats.foods.length + stats.travels.length) + '</b><span>个心愿</span></div>' +
      '<div><b>' + stats.photos.length + '</b><span>张照片</span></div>' +
      '</div>' +
      '<div class="zine-quote"><span class="eyebrow">A LINE FROM THIS MONTH</span><p>“' + esc(quote) + '”</p>' +
      (stats.topMood ? '<span class="zine-mood">这个月最常出现的表情：' + esc(stats.topMood) + '</span>' : '') + '</div>' +
      '<div class="zine-split">' +
      '<div><span class="eyebrow">DONE TOGETHER</span><h3>一起完成的小事</h3>' +
      (doneWishes.length || stats.dramas.length || stats.memories.length ?
        '<ul>' + doneWishes.map(function (x) { return '<li>✓ ' + esc(x.title) + '</li>'; }).join('') +
        stats.dramas.map(function (d) { return '<li>✓ 看完《' + esc(d.title) + '》</li>'; }).join('') +
        stats.memories.map(function (m) { return '<li>✓ 存下「' + esc(m.title) + '」</li>'; }).join('') + '</ul>' :
        '<p class="zine-muted">这个月还没打勾，下个月补上。</p>') + '</div>' +
      '<div><span class="eyebrow">NEXT MONTH</span><h3>下个月想一起</h3>' +
      (nextWishes.length ? '<ul>' + nextWishes.map(function (x) { return '<li>○ ' + esc(x.title) + '</li>'; }).join('') + '</ul>' : '<p class="zine-muted">去清单里挑一件吧。</p>') + '</div>' +
      '</div>' +
      '<div class="zine-sign"><span>♡</span><p>' + esc(user('a').name) + ' & ' + esc(user('b').name) + '<br><small>FROM OUR LITTLE HOUSE · ' + monthLabel(key) + '</small></p></div>' +
      '</article>' +
      '<div class="recap-actions"><button class="btn btn-secondary" data-action="copy-recap">' + icon('copy', 13) + ' 复制文字</button><button class="btn btn-primary" data-action="print-recap">' + icon('download', 13) + ' 保存 / 打印</button></div>' +
      '<p class="report-note">用打印功能可以保存为 PDF；手机浏览器里选择“打印 → 存储为 PDF”。</p>';
  }

  function recapPlainText(key) {
    const stats = recapStats(key);
    const lines = [];
    lines.push('OUR LITTLE HOUSE · ' + monthTitle(key) + ' 月度回忆');
    lines.push(recapSentence(stats));
    if (stats.lastStatus) lines.push('这个月的一句话：' + stats.lastStatus.text);
    const done = stats.foods.concat(stats.travels).map(function (x) { return x.title; });
    if (done.length) lines.push('一起完成：' + done.join('、'));
    if (stats.dramas.length) lines.push('一起看完：' + stats.dramas.map(function (d) { return d.title; }).join('、'));
    lines.push('—— ' + user('a').name + ' & ' + user('b').name);
    return lines.join('\n');
  }

  function printRecap() {
    document.body.classList.add('printing-recap');
    setTimeout(function () {
      window.print();
      setTimeout(function () { document.body.classList.remove('printing-recap'); }, 800);
    }, 80);
  }

  const CITY_COORDS = {
    '北京': [116.4, 39.9], '上海': [121.5, 31.2], '广州': [113.3, 23.1], '深圳': [114.1, 22.5],
    '成都': [104.1, 30.6], '重庆': [106.5, 29.6], '杭州': [120.2, 30.3], '南京': [118.8, 32.1],
    '苏州': [120.6, 31.3], '武汉': [114.3, 30.6], '长沙': [112.9, 28.2], '西安': [108.9, 34.3],
    '厦门': [118.1, 24.5], '青岛': [120.4, 36.1], '天津': [117.2, 39.1], '郑州': [113.6, 34.7],
    '昆明': [102.8, 24.9], '大理': [100.2, 25.6], '丽江': [100.2, 26.9], '桂林': [110.3, 25.3],
    '三亚': [109.5, 18.3], '海口': [110.3, 20.0], '哈尔滨': [126.6, 45.8], '沈阳': [123.4, 41.8],
    '大连': [121.6, 38.9], '呼和浩特': [111.7, 40.8], '乌鲁木齐': [87.6, 43.8], '拉萨': [91.1, 29.7],
    '西宁': [101.8, 36.6], '兰州': [103.8, 36.1], '银川': [106.2, 38.5], '贵阳': [106.6, 26.6],
    '南宁': [108.3, 22.8], '福州': [119.3, 26.1], '南昌': [115.9, 28.7], '合肥': [117.3, 31.9],
    '石家庄': [114.5, 38.0], '太原': [112.5, 37.9], '济南': [117.0, 36.7], '宁波': [121.5, 29.9],
    '温州': [120.7, 28.0], '无锡': [120.3, 31.6], '常州': [119.9, 31.8], '徐州': [117.2, 34.3],
    '洛阳': [112.4, 34.6], '开封': [114.3, 34.8], '敦煌': [94.7, 40.1], '张家界': [110.5, 29.1],
    '黄山': [118.3, 29.7], '婺源': [117.9, 29.2], '泉州': [118.6, 24.9], '汕头': [116.7, 23.4],
    '珠海': [113.5, 22.3], '佛山': [113.1, 23.0], '东莞': [113.8, 23.0], '惠州': [114.4, 23.1],
    '北海': [109.1, 21.5], '西双版纳': [100.8, 22.0], '香格里拉': [99.7, 27.8], '阿那亚': [119.3, 39.7],
    '莫干山': [119.9, 30.6], '景德镇': [117.2, 29.3], '秦皇岛': [119.6, 39.9], '烟台': [121.4, 37.5]
  };

  function cityPoint(city) {
    const raw = String(city || '').split('·')[0].trim();
    const key = Object.keys(CITY_COORDS).find(function (c) { return raw.indexOf(c) >= 0 || c.indexOf(raw) >= 0; });
    if (!key) return null;
    const c = CITY_COORDS[key];
    return {
      x: 25 + ((c[0] - 73) / (135 - 73)) * 310,
      y: 22 + ((54 - c[1]) / (54 - 18)) * 216
    };
  }

  function footprintMapSvg(visits) {
    const pins = visits.map(function (v) {
      const p = cityPoint(v.city);
      return p ? { v: v, p: p } : null;
    }).filter(Boolean);
    const route = pins.slice().sort(function (a, b) { return String(a.v.date).localeCompare(String(b.v.date)); });
    const routePath = route.length > 1 ? route.map(function (x, i) { return (i ? 'L' : 'M') + x.p.x.toFixed(1) + ' ' + x.p.y.toFixed(1); }).join(' ') : '';
    return '<svg class="footprint-map" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid meet" aria-label="手绘足迹地图">' +
      '<defs><linearGradient id="fp-land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef5e9"/><stop offset="1" stop-color="#e2eee5"/></linearGradient></defs>' +
      '<rect width="360" height="260" rx="20" fill="#f8fbf5"/>' +
      '<g stroke="#cadbcc" stroke-width=".7" opacity=".45">' +
      [40, 80, 120, 160, 200, 240, 280, 320].map(function (x) { return '<path d="M' + x + ' 18V242"/>'; }).join('') +
      [40, 80, 120, 160, 200, 220].map(function (y) { return '<path d="M18 ' + y + 'H342"/>'; }).join('') +
      '</g>' +
      '<path d="M207.4 236.8L203.3 235L203.1 229.8L205.6 227.1L213.9 225.5L215.1 227.8L211.7 233.9L207.4 236.8Z M61.3 91.9L60.9 88.5L64.3 86.9L59.8 76.5L72.3 72.8L75.9 62L85.8 64L88.6 61.3L88.8 55.3L93 54.7L98.8 50.2L100.1 54.4L111.4 59.8L114.9 64.7L112.9 71.7L114.7 74.3L127.4 76.1L136.5 80.6L141.7 89.6L164.2 90L176.6 94.6L182.6 94.5L184.8 96.4L190.6 93.2L206.2 90.9L219.1 83.5L216.7 79.3L219.4 75.4L227.3 77.1L239.9 71.6L247.1 66L258.3 65.8L258.9 63.7L250.3 57.6L246.5 59.8L238.7 59.6L237.4 57.2L243.4 46.7L249.4 48.9L256.4 45.1L256.4 42.5L263.7 34.2L263.6 30.9L260.9 29.5L265 26.5L271.2 25.4L277.9 25.2L289.7 29.2L298.3 47.4L307 49.4L312.9 53.6L314.9 59.3L322.5 59.3L335.1 55.1L325.5 75.1L319.4 74.1L315.1 76.2L315.7 88.4L313.2 88.6L313.2 91.6L310 88.1L308 91.5L300.3 94L301 97.2L294.3 95.1L281.3 106.4L265.3 112.6L267.9 109.8L266.9 107.5L270.8 103.5L268.2 100.3L258.2 106.6L255.1 110.5L250.2 110.8L247.7 113.6L250.3 117.6L254.4 118.6L254.6 121.3L258.5 123.1L264.1 118.8L271.8 121.3L272.6 124.4L265.5 126.1L255.8 136.5L261.1 139.8L269.5 155.8L269.5 160.3L266.3 161.9L270.5 167L268.4 176.6L265.6 177.2L253.3 198.7L239.5 209.3L233.8 210L230.8 212.7L229 210.7L226.2 213.7L213.9 217.6L212.2 224L209.4 224.3L208.1 220L209.3 217.6L195.2 215.1L192.8 212.7L193.6 209.2L186.6 205.9L182.4 209.1L173.5 209.7L168.3 212.1L169 219L166.4 218.8L165.8 214.9L162.1 216.6L156.2 213.3L157.7 208.3L154.5 207.1L153.3 201.6L148 202.6L148.6 195.5L153.4 190.5L153.4 180.9L149.6 176L141.2 175.5L142.9 173L140.6 169.3L137 171.8L132.8 170.3L122.5 178.6L118.5 179.4L110.1 176.2L104.1 182.2L103.7 177.5L100.6 178.7L89.1 176.8L81.2 173L79.5 170.1L71.6 165.3L67.6 163.5L65.6 164.9L53.7 156.9L52.3 150.3L55.9 151.1L56 148L54.1 145L54.6 140.1L49.2 133L41 130.6L39.5 126L34.9 121.5L34.3 115.7L29.6 115L28.4 109.4L29.1 106.6L33.9 103.8L42.6 103.4L44.5 99.6L50.9 98.9L61.3 91.9Z" fill="url(#fp-land)" stroke="#a9c3af" stroke-width="1.2"/>' +
      '' +
      '' +
      (routePath ? '<path d="' + routePath + '" fill="none" stroke="#d38c9a" stroke-width="1.4" stroke-dasharray="3 6" opacity=".7"/>' : '') +
      pins.map(function (x, i) {
        const p = x.p;
        const labelLeft = p.x > 245;
        const dy = i % 2 === 0 ? -7 : 10;
        return '<g class="fp-pin" transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')">' +
          '<circle r="8" fill="#e35d77" opacity=".14"/><circle r="4" fill="#e35d77"/><circle r="1.5" fill="#fff"/>' +
          '<text x="' + (labelLeft ? -7 : 7) + '" y="' + dy + '" text-anchor="' + (labelLeft ? 'end' : 'start') + '" fill="#6b4e54" stroke="#f8fbf5" stroke-width="2.2" paint-order="stroke" font-size="6.5" font-weight="700">' + esc(x.v.city) + '</text>' +
          '</g>';
      }).join('') +
      '<text x="24" y="30" fill="#9bb3a2" font-size="7" font-family="Arial" letter-spacing="1.4">OUR FOOTPRINTS</text>' +
      '<text x="24" y="246" fill="#9bb3a2" font-size="6.5" font-family="Arial" letter-spacing="1">HAND-DRAWN · NOT A NAVIGATION MAP</text>' +
      '</svg>';
  }

  function renderFootprintsPage() {
    const visits = (state.visits || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    const mapped = visits.filter(function (v) { return cityPoint(v.city); });
    const unmapped = visits.filter(function (v) { return !cityPoint(v.city); });
    const cities = Array.from(new Set(visits.map(function (v) { return v.city; }).filter(Boolean)));
    const years = Array.from(new Set(visits.map(function (v) { return String(v.date).slice(0, 4); }).filter(Boolean))).sort();
    return subhead('足迹地图', 'us', '<button class="icon-btn" data-action="open-footprint-add" aria-label="添加足迹">' + icon('plus', 16) + '</button>') +
      '<div class="footprint-hero">' +
      '<div class="footprint-map-wrap">' + footprintMapSvg(visits) + '<span class="footprint-badge">' + cities.length + ' 个地方</span></div>' +
      '<div class="footprint-caption"><div><span class="eyebrow">PLACES WE’VE BEEN</span><h2>把走过的路，<br><em>钉在同一张地图上。</em></h2></div>' +
      '<p>手绘示意图，不接地图 SDK，也不代表完整行政边界。想记的是一座城、一顿饭，还是一起吹过的风，都可以。</p></div>' +
      '</div>' +
      '<div class="us-stats" style="margin-top:10px"><div class="us-stat"><b>' + cities.length + '</b><span>个城市</span></div><div class="us-stat"><b>' + years.length + '</b><span>年</span></div><div class="us-stat"><b>' + visits.length + '</b><span>次出发</span></div></div>' +
      (unmapped.length ? '<div class="footprint-unmapped">还没在地图上找到：' + unmapped.map(function (v) { return esc(v.city); }).join('、') + '（可以换成常见城市名，或先留在清单里）</div>' : '') +
      '<div class="section-head"><div><span class="eyebrow">TRAVEL LOG</span><h2>去过的城市</h2></div><button class="text-link" data-action="open-footprint-add">添加 +</button></div>' +
      (visits.length ? '<div class="footprint-list">' + visits.map(renderFootprintItem).join('') + '</div>' : '<div class="empty"><span class="emoji">🗺️</span><h3>地图还没点亮</h3><p>把一起去过的城市写进来，它会慢慢长成一张只属于你们的地图。</p><button class="btn btn-primary btn-sm" style="margin-top:10px" data-action="open-footprint-add">点亮第一个</button></div>') +
      '<button class="dashed-add" style="margin-top:10px" data-action="open-footprint-add">' + icon('plus', 14) + ' 记一次新的出发</button>' +
      '<div class="report-note">地图是手绘方位图，不是导航。<br>常见城市会自动落点；生僻地名会先放进清单。</div>';
  }

  function renderFootprintItem(v) {
    const u = user(v.author);
    return '<article class="footprint-item"><div class="footprint-date"><b>' + String(v.date).slice(5, 7) + '</b><span>' + String(v.date).slice(0, 4) + '</span></div>' +
      '<div class="footprint-main"><div class="fp-top"><b>' + esc(v.city) + '</b><span class="badge mint">足迹</span></div>' +
      (v.note ? '<p>' + esc(v.note) + '</p>' : '') + '<div class="todo-meta">' + avatarHtml(u, 'xs') + esc(u.name) + ' · ' + esc(v.date) + '</div></div>' +
      '<button class="todo-edit" data-action="edit-footprint" data-id="' + v.id + '" aria-label="编辑足迹">' + icon('edit', 12) + '</button></article>';
  }
