  /* =========================================================
     Home
     ========================================================= */
  function renderHome() {
    const a = user('a');
    const b = user('b');
    const info = getDayInfo();
    const reports = (state.reports || []).slice().sort(function (x, y) { return y.createdAt - x.createdAt; }).slice(0, 3);
    const feed = filteredStatuses();
    const visible = session.showAllFeed ? feed : feed.slice(0, 4);
    return '' +
      renderHomeHero(a, b, info) +
      sectionHead('RIGHT NOW', '此刻的我们', '<button class="text-link" data-action="open-status" data-user="' + session.activeUser + '">记录 +</button>') +
      '<div class="now-panel">' + nowRow(a) + nowRow(b) +
      '<div class="now-foot"><span class="hint">状态是一个一个小小的“我在这里”</span><button class="link" data-action="switch-user">换个身份</button></div></div>' +
      renderQuickDock() +
      sectionHead('CHECK-IN', '今天的报备', '<button class="side-link" data-action="nav" data-page="report">全部</button>') +
      renderReportPeek(reports) +
      sectionHead('LITTLE MOMENTS', '我们的动态', '<button class="text-link" data-action="open-status" data-user="' + session.activeUser + '">写一条 +</button>') +
      '<div class="feed-tools"><div class="feed-filter">' +
      feedFilterBtn('all', '全部') + feedFilterBtn('a', a.name) + feedFilterBtn('b', b.name) +
      '</div><span class="tiny muted">' + feed.length + ' 条</span></div>' +
      (visible.length ? visible.map(renderPost).join('') : renderFeedEmpty()) +
      (feed.length > 4 ? '<button class="dashed-add" data-action="toggle-feed">' + (session.showAllFeed ? '收起旧动态' : '把旧动态也翻出来') + '</button>' : '') +
      renderHomeFooter();
  }

  function renderHomeHero(a, b, info) {
    return '<section class="home-hero">' +
      '<div class="hero-kicker"><span class="date">' + fmtDateLong(Date.now()) + '</span></div>' +
      '<h1>今天也<br><span class="hl">住在一起</span><span class="dot">。</span></h1>' +
      '<p class="hero-sub">把细碎的日子，收进我们的小屋。</p>' +
      '<span class="weather hero-weather">☁️ 今日气氛 · ' + atmosphere() + '</span>' +
      '<div class="hero-cat">' + mascotFullHtml() + '</div>' +
      '<span class="hero-spark">✦</span>' +
      '<div class="polaroid">' +
      '<span class="tape top"></span><span class="tape top2"></span>' +
      '<div class="couple-line">' +
      '<div class="couple-avatars">' + avatarHtml(a, 'pair-a') + '<span class="heart-link">' + icon('heart', 12) + '</span>' + avatarHtml(b, 'pair-b') + '</div>' +
      '<div class="couple-copy"><div class="names">' + esc(a.name) + ' <i>&</i> ' + esc(b.name) + '</div>' +
      '<div class="days"><b>' + info.count + '</b> 天 · 一起住进小屋</div>' +
      '<div class="anniv">' + icon('calendar', 11) + ' ' + esc(info.nextLabel) + '</div>' +
      '<button class="edit-mini" data-action="edit-profiles">编辑资料</button></div>' +
      '</div>' +
      '<span class="stamp">EST. ' + info.startYear + '<b>NO. 01</b></span>' +
      '</div>' +
      '<div class="hero-notes"><span>LOVE IS IN THE LITTLE THINGS</span><span class="line"></span><b>♡</b></div>' +
      '</section>';
  }

  function nowRow(u) {
    const n = u.now || {};
    const has = n.text || n.mood;
    return '<button class="now-row" data-action="open-status" data-user="' + u.id + '">' +
      avatarHtml(u, '') +
      '<div class="now-main"><div class="now-top"><b>' + esc(u.name) + '</b>' +
      '<span class="badge">' + (u.id === session.activeUser ? '你' : 'TA') + '</span>' +
      '<time>' + (n.updatedAt ? relTime(n.updatedAt) : '还没更新') + '</time></div>' +
      '<div class="now-text' + (has ? '' : ' empty-text') + '">' + (has ? esc(n.text || '只留下了一个心情') : '现在在干嘛？戳这里留下一个时间点。') + '</div>' +
      '<div class="now-bottom">' +
      (n.activity ? '<span class="badge mint">' + esc(n.activity) + '</span>' : '') +
      (n.place ? '<span class="badge">' + icon('mapPin', 9) + ' ' + esc(n.place) + '</span>' : '') +
      '</div></div>' +
      (n.mood ? '<span class="now-mood">' + esc(n.mood) + '</span>' : '') +
      '<span class="now-chevron">' + icon('chevronRight', 14) + '</span>' +
      '</button>';
  }

  function renderQuickDock() {
    return '<div class="quick-dock">' +
      '<button class="quick-btn" data-action="quick-report" data-type="到家啦"><span class="q-emoji">🏠</span>到家啦</button>' +
      '<button class="quick-btn" data-action="quick-report" data-type="想你啦"><span class="q-emoji">💗</span>想你啦</button>' +
      '<button class="quick-btn" data-action="open-food-add" data-type="restaurant"><span class="q-emoji">🍜</span>加美食</button>' +
      '<button class="quick-btn" data-action="open-travel-add" data-type="place"><span class="q-emoji">📍</span>加心愿</button>' +
      '</div>';
  }

  function renderReportPeek(reports) {
    if (!reports.length) {
      return '<div class="empty"><span class="emoji">📮</span><h3>报备栏还空着</h3><p>发一条“到家啦”，让 TA 放心。</p><button class="btn btn-secondary btn-sm" style="margin-top:10px" data-action="nav" data-page="report">去报备</button></div>';
    }
    return '<div class="report-peek">' + reports.map(function (r) {
      const u = user(r.author);
      return '<div class="report-peek-row"><span class="r-emoji">' + esc(r.emoji || '💌') + '</span>' +
        '<div class="r-copy"><b>' + esc(u.name) + '</b>' + esc(r.type) +
        (r.text && r.text !== r.type ? '<div class="tiny muted">' + esc(r.text) + '</div>' : '') + '</div>' +
        '<time>' + (dayKey(r.createdAt) === dayKey() ? fmtTime(r.createdAt) : relTime(r.createdAt)) + '</time></div>';
    }).join('') +
      '<div class="peek-foot"><span>今天已经报备 ' + reportCountForDay(Date.now()) + ' 次</span><button data-action="nav" data-page="report">去报备 →</button></div></div>';
  }

  function feedFilterBtn(id, label) {
    return '<button class="' + (session.feedFilter === id ? 'active' : '') + '" data-action="feed-filter" data-filter="' + id + '">' + esc(label) + '</button>';
  }

  function renderFeedEmpty() {
    return '<div class="empty"><span class="emoji">🫧</span><h3>还没有动态</h3><p>写下今天第一件想和 TA 分享的小事吧。</p><button class="btn btn-primary btn-sm" style="margin-top:10px" data-action="open-status" data-user="' + session.activeUser + '">记录此刻</button></div>';
  }

  function renderHomeFooter() {
    return '<div class="us-footer"><span class="footer-heart">♡</span><br>OUR LITTLE HOUSE · MADE FOR TWO<br>把普通的日子，慢慢过成纪念日。</div>';
  }

  function renderPost(p) {
    const u = user(p.author);
    const isMine = p.author === session.activeUser;
    const open = session.openComments.has(p.id);
    const reactions = p.reactions || {};
    const commentCount = (p.comments || []).length;
    const images = (Array.isArray(p.images) && p.images.length) ? p.images.filter(Boolean) : (p.image ? [p.image] : []);
    return '<article class="post" data-post-id="' + p.id + '">' +
      '<div class="post-head">' + avatarHtml(u, 'sm') +
      '<div class="post-who"><div class="line1"><b>' + esc(u.name) + '</b>' + (p.author === session.activeUser ? '<span class="badge rose">你</span>' : '') +
      (p.activity ? '<span class="place">' + esc(p.activity) + '</span>' : '') + '</div>' +
      '<div class="line2"><time title="' + esc(fmtDateTime(p.createdAt)) + '">' + relTime(p.createdAt) + '</time><span class="dot"></span><span>' + fmtTime(p.createdAt) + '</span>' +
      (p.place ? '<span class="dot"></span><span>' + icon('mapPin', 8) + ' ' + esc(p.place) + '</span>' : '') + '</div></div>' +
      (isMine ? '<button class="post-more" data-action="delete-post" data-id="' + p.id + '" aria-label="删除这条动态">' + icon('trash', 14) + '</button>' : '<span class="post-more">' + icon('more', 15) + '</span>') +
      '</div>' +
      '<div class="post-body"><p class="post-text">' + esc(p.text) + '</p>' +
      (p.mood ? '<span class="post-mood"><span class="m">' + esc(p.mood) + '</span>' + esc((MOODS.find(function (m) { return m.emoji === p.mood; }) || {}).label || '此刻') + '</span>' : '') +
      renderPostGallery(images) +
      '</div>' +
      '<div class="post-actions">' +
      REACTIONS.map(function (emoji) {
        const arr = reactions[emoji] || [];
        return '<button class="reaction' + (arr.indexOf(session.activeUser) >= 0 ? ' active' : '') + '" data-action="react" data-post="' + p.id + '" data-emoji="' + emoji + '" aria-label="用 ' + emoji + ' 回应">' + emoji + (arr.length ? '<span class="n">' + arr.length + '</span>' : '') + '</button>';
      }).join('') +
      '<span class="spacer"></span>' +
      '<button class="act-link" data-action="toggle-comments" data-post="' + p.id + '">' + icon('comment', 14) + (commentCount || '') + '</button>' +
      '</div>' +
      (open ? renderComments(p) : '') +
      '</article>';
  }

  function renderPostGallery(images) {
    if (!images || !images.length) return '';
    const cls = images.length === 1 ? 'one' : images.length === 2 ? 'two' : 'many';
    return '<div class="post-gallery ' + cls + '">' +
      images.map(function (src, i) {
        return '<img src="' + esc(src) + '" alt="动态照片 ' + (i + 1) + '" loading="lazy">';
      }).join('') +
      (images.length > 1 ? '<span class="photo-count">' + images.length + ' 张</span>' : '') +
      '</div>';
  }

  function renderComments(p) {
    const list = p.comments || [];
    return '<div class="comments">' +
      (list.length ? list.map(function (c) {
        const cu = user(c.author);
        return '<div class="comment">' + avatarHtml(cu, 'xs') +
          '<div class="comment-copy"><div class="c-top"><b>' + esc(cu.name) + '</b><time>' + relTime(c.createdAt) + '</time></div>' +
          (c.sticker ? '<div class="sticker-comment"><span class="sticker-face">' + esc(c.sticker.emoji) + '</span><span class="sticker-label">' + esc(c.sticker.label) + '</span></div>' : '<p>' + esc(c.text) + '</p>') +
          '</div>' +
          (c.author === session.activeUser ? '<button class="comment-del" data-action="delete-comment" data-post="' + p.id + '" data-id="' + c.id + '" aria-label="删除评论">' + icon('close', 10) + '</button>' : '') +
          '</div>';
      }).join('') : '<div class="no-comments">还没有评论，先贴一张小贴纸吧。</div>') +
      (session.stickerFor === p.id ? '<div class="sticker-tray">' + STICKERS.map(function (s, i) {
        return '<button class="sticker-btn" data-action="add-sticker" data-post="' + p.id + '" data-index="' + i + '"><span class="s-emoji">' + s.emoji + '</span>' + s.label + '</button>';
      }).join('') + '</div>' : '') +
      '<form class="comment-form" data-form="comment" data-post="' + p.id + '">' + avatarHtml(currentUser(), 'xs') +
      '<input type="text" name="text" maxlength="160" placeholder="以 ' + esc(currentUser().name) + ' 的身份说点什么…" autocomplete="off">' +
      '<button class="sticker-toggle" type="button" data-action="toggle-stickers" data-post="' + p.id + '" aria-label="打开表情包">😽</button>' +
      '<button class="send" type="submit" aria-label="发送评论">' + icon('send', 13) + '</button>' +
      '</form></div>';
  }
