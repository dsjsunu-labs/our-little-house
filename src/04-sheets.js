  /* =========================================================
     Sheets and forms
     ========================================================= */
  function sheetHead(title, subtitle) {
    return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="eyebrow">OUR LITTLE HOUSE</span><h2>' + esc(title) + '</h2>' +
      (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div>' +
      '<button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">' + icon('close', 14) + '</button></div>';
  }

  function showSheet(content) {
    session.lastFocus = document.activeElement;
    session.sheetOpen = true;
    $modal.innerHTML = '<div class="modal-layer"><button class="modal-backdrop" type="button" data-action="close-sheet" aria-label="关闭弹层" tabindex="-1"></button>' +
      '<div class="sheet" role="dialog" aria-modal="true">' + content + '</div></div>';
    document.body.classList.add('modal-open');
    const layer = $modal.querySelector('.modal-layer');
    requestAnimationFrame(function () { if (layer) layer.classList.add('open'); });
    setTimeout(function () {
      const focusable = $modal.querySelector('.sheet input:not([type="hidden"]),.sheet textarea,.sheet select');
      if (focusable && window.innerWidth > 640) {
        try { focusable.focus({ preventScroll: true }); } catch (e) { }
      }
    }, 120);
  }

  function closeSheet(immediate) {
    const layer = $modal.querySelector('.modal-layer');
    if (!layer) {
      session.sheetOpen = false;
      document.body.classList.remove('modal-open');
      return;
    }
    layer.classList.remove('open');
    document.body.classList.remove('modal-open');
    session.sheetOpen = false;
    session.tempImage = '';
    session.tempImages = [];
    session.confirm = null;
    const remove = function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    };
    if (immediate) remove();
    else setTimeout(remove, 330);
    if (session.lastFocus && session.lastFocus.isConnected) {
      try { session.lastFocus.focus({ preventScroll: true }); } catch (e) { }
    }
    session.lastFocus = null;
  }

  function sheetError(form, message) {
    if (!form) return;
    const box = form.querySelector('[data-error]');
    if (box) box.textContent = message || '';
    const sheet = form.closest('.sheet');
    if (sheet) {
      sheet.classList.remove('shake');
      void sheet.offsetWidth;
      sheet.classList.add('shake');
      setTimeout(function () { sheet.classList.remove('shake'); }, 380);
    }
  }

  function avatarPickerHtml(prefix, selected) {
    return '<div class="avatar-picker">' + AVATAR_LIST.map(function (av) {
      return '<label class="avatar-choice"><input type="radio" name="' + prefix + 'Avatar" value="' + av.id + '"' + (selected === av.id ? ' checked' : '') + '><span>' + avatarById(av.id, '') + '</span></label>';
    }).join('') + '</div>';
  }

  function moodChoices(selected) {
    return '<div class="mood-grid">' + MOODS.map(function (m) {
      return '<label class="mood-choice"><input type="radio" name="mood" value="' + m.emoji + '"' + (selected === m.emoji ? ' checked' : '') + '><span><b>' + m.emoji + '</b>' + m.label + '</span></label>';
    }).join('') + '</div>';
  }

  function imageField(value) {
    const has = !!value;
    return '<div class="field" data-image-field><span class="field-label">照片（选填）</span>' +
      '<label class="upload-box' + (has ? ' hidden' : '') + '" data-upload-box><span class="up-icon">' + icon('camera', 16) + '</span><span class="up-copy"><b>添加一张照片</b><span>会自动压缩，只留在这台设备</span></span><input type="file" accept="image/*" data-image-input></label>' +
      '<div class="image-preview' + (has ? '' : ' hidden') + '" data-image-preview><img src="' + (has ? esc(value) : '') + '" alt="照片预览"><button type="button" class="remove-image" data-action="remove-image" aria-label="移除照片">' + icon('close', 12) + '</button><span class="img-note">照片会变成小屋的一部分</span></div></div>';
  }

  function setImageField(field, value) {
    if (!field) return;
    const box = field.querySelector('[data-upload-box]');
    const preview = field.querySelector('[data-image-preview]');
    const img = preview ? preview.querySelector('img') : null;
    if (value) {
      if (box) box.classList.add('hidden');
      if (preview) preview.classList.remove('hidden');
      if (img) img.src = value;
    } else {
      if (box) box.classList.remove('hidden');
      if (preview) preview.classList.add('hidden');
      if (img) img.removeAttribute('src');
    }
  }

  function imagesField() {
    return '<div class="field" data-images-field><span class="field-label">照片（最多 9 张）</span>' +
      '<label class="upload-box" data-images-upload><span class="up-icon">' + icon('camera', 16) + '</span><span class="up-copy"><b>添加照片</b><span>可一次选多张，会自动压缩</span></span><input type="file" accept="image/*" multiple data-images-input></label>' +
      '<div class="images-preview" data-images-preview></div><small>第一张会作为封面，最多 9 张。</small></div>';
  }

  function updateImagesPreview(field) {
    if (!field) return;
    const wrap = field.querySelector('[data-images-preview]');
    if (!wrap) return;
    wrap.innerHTML = session.tempImages.map(function (src, i) {
      return '<div class="image-tile"><img src="' + esc(src) + '" alt="照片 ' + (i + 1) + '"><button type="button" class="remove-image" data-action="remove-status-image" data-index="' + i + '" aria-label="移除照片">' + icon('close', 12) + '</button>' +
        (i === 0 ? '<span class="cover-tag">封面</span>' : '') + '</div>';
    }).join('');
  }

  function openStatusSheet(userId) {
    userId = userId === 'b' ? 'b' : 'a';
    if (session.activeUser !== userId) {
      session.activeUser = userId;
      state.meta.activeUser = userId;
      saveState();
      renderTopbar();
    }
    const u = user(userId);
    session.tempImage = '';
    session.tempImages = [];
    showSheet(sheetHead('记录此刻', '以 ' + u.name + ' 的身份，留下一个时间点。发布后会出现在「我们的动态」里。') +
      '<form class="sheet-form" data-form="status" data-user="' + userId + '">' +
      '<label class="field"><span>此刻在想什么</span><textarea name="text" maxlength="500" placeholder="今天有什么想记住的？">' + '</textarea></label>' +
      '<div class="field"><span class="field-label">心情贴纸</span>' + moodChoices('') + '</div>' +
      '<div class="field-row"><label class="field"><span>在干嘛</span><input type="text" name="activity" maxlength="20" placeholder="下班 / 摸鱼 / 想你了"></label>' +
      '<label class="field"><span>地点（选填）</span><input type="text" name="place" maxlength="24" placeholder="家 / 路上"></label></div>' +
      imagesField() +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot"><button class="btn btn-ghost" type="button" data-action="close-sheet">先不写</button><button class="btn btn-primary" type="submit">' + icon('sparkles', 13) + ' 发布此刻</button></div>' +
      '</form>');
  }

  function openSwitchUserSheet() {
    const a = user('a'), b = user('b');
    showSheet(sheetHead('现在是谁在小屋？', '切换身份后，发动态、评论、报备都会记在对应的人名下。') +
      '<button class="user-switch-row' + (session.activeUser === 'a' ? ' active' : '') + '" data-action="set-user" data-user="a">' + avatarHtml(a, '') +
      '<span class="u-copy"><b>' + esc(a.name) + '</b><span>' + (session.activeUser === 'a' ? '当前身份 · 正在使用' : '切换成 ' + esc(a.name)) + '</span></span><span class="check">' + (session.activeUser === 'a' ? '●' : '○') + '</span></button>' +
      '<button class="user-switch-row' + (session.activeUser === 'b' ? ' active' : '') + '" data-action="set-user" data-user="b">' + avatarHtml(b, '') +
      '<span class="u-copy"><b>' + esc(b.name) + '</b><span>' + (session.activeUser === 'b' ? '当前身份 · 正在使用' : '切换成 ' + esc(b.name)) + '</span></span><span class="check">' + (session.activeUser === 'b' ? '●' : '○') + '</span></button>' +
      '<p class="sheet-note" style="margin-top:12px">你们共用这一台设备时，用这个开关换身份就好。数据不会上传到服务器。</p>');
  }

  function openProfileSheet() {
    const a = user('a'), b = user('b');
    showSheet(sheetHead('编辑住户资料', '名字、生日、头像和在一起的日子，都可以随时改。') +
      '<form class="sheet-form" data-form="profile">' +
      '<div class="profile-form-block"><h3>' + avatarById(a.avatar, 'xs') + ' 你 · ' + esc(a.name) + '</h3>' +
      '<div class="field-row"><label class="field"><span>名字</span><input type="text" name="aName" maxlength="12" value="' + esc(a.name) + '" required></label>' +
      '<label class="field"><span>生日</span><input type="date" name="aBirth" value="' + esc(a.birthday) + '"></label></div>' +
      '<label class="field"><span>MBTI（选填）</span><input type="text" name="aMbti" maxlength="4" value="' + esc(a.mbti) + '" placeholder="INFP"></label>' +
      avatarPickerHtml('a', a.avatar) + '</div>' +
      '<div class="profile-form-block"><h3>' + avatarById(b.avatar, 'xs') + ' TA · ' + esc(b.name) + '</h3>' +
      '<div class="field-row"><label class="field"><span>名字</span><input type="text" name="bName" maxlength="12" value="' + esc(b.name) + '" required></label>' +
      '<label class="field"><span>生日</span><input type="date" name="bBirth" value="' + esc(b.birthday) + '"></label></div>' +
      '<label class="field"><span>MBTI（选填）</span><input type="text" name="bMbti" maxlength="4" value="' + esc(b.mbti) + '" placeholder="ENFP"></label>' +
      avatarPickerHtml('b', b.avatar) + '</div>' +
      '<label class="field"><span>在一起的第一天</span><input type="date" name="start" value="' + esc(state.meta.start || '') + '"><small>填了之后，小屋会帮你们数着日子。</small></label>' +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot"><button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button><button class="btn btn-primary" type="submit">保存资料</button></div>' +
      '</form><p class="sheet-note">生日只用于本地的星座和 AI 性格小报告，不会上传。</p>');
  }

  function openReportSheet() {
    showSheet(sheetHead('自定义报备', '报备不是义务，是“我想起你了”的另一种说法。') +
      '<form class="sheet-form" data-form="report-custom">' +
      '<label class="field"><span>想报备什么</span><textarea name="text" maxlength="200" placeholder="比如：今天加班晚一点，别等我吃饭。" required></textarea></label>' +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot"><button class="btn btn-ghost" type="button" data-action="close-sheet">先不说</button><button class="btn btn-primary" type="submit">' + icon('send', 13) + ' 发出去</button></div>' +
      '</form>');
  }

  function openFoodSheet(type, editId) {
    const item = editId ? state.foods.find(function (f) { return f.id === editId; }) : null;
    const chosen = item ? item.type : (type === 'dish' ? 'dish' : 'restaurant');
    session.tempImage = item && item.image ? item.image : '';
    showSheet(sheetHead(item ? '编辑美食心愿' : '放进美食口袋', item ? '把这家店 / 这道菜改得更像你们一点。' : '想去的店、想做的菜，都值得被记下来。') +
      '<form class="sheet-form" data-form="food" data-edit="' + (item ? item.id : '') + '">' +
      '<input type="hidden" name="type" value="' + chosen + '">' +
      '<div class="type-switch" data-field="type">' +
      '<button type="button" class="' + (chosen === 'restaurant' ? 'active' : '') + '" data-action="sheet-type" data-field="type" data-value="restaurant">🍜 想吃的店</button>' +
      '<button type="button" class="' + (chosen === 'dish' ? 'active' : '') + '" data-action="sheet-type" data-field="type" data-value="dish">🍳 想做的菜</button>' +
      '</div>' +
      '<label class="field"><span>名字</span><input type="text" name="title" maxlength="40" value="' + esc(item ? item.title : '') + '" placeholder="店名 / 菜名" required></label>' +
      '<label class="field"><span>备注</span><textarea name="note" maxlength="200" placeholder="为什么想去？想和谁一起吃？">' + esc(item ? item.note : '') + '</textarea></label>' +
      '<label class="field"><span>标签（用逗号分开）</span><input type="text" name="tags" maxlength="80" value="' + esc(item && item.tags ? item.tags.join('，') : '') + '" placeholder="日料，甜品，约会"></label>' +
      '<label class="field"><span>链接（抖音 / 微信 / 小红书）</span><input type="text" name="link" maxlength="300" value="' + esc(item ? item.link : '') + '" placeholder="粘贴分享文案也可以"><small>网页只保存链接，不会下载视频。</small></label>' +
      '<label class="field"><span>打卡评分（选填）</span><select name="rating">' +
      [0, 1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + ((item && item.rating === n) || (!item && n === 0) ? ' selected' : '') + '>' + (n === 0 ? '还没打分' : '♥'.repeat(n) + ' ' + n + ' 分') + '</option>'; }).join('') +
      '</select></label>' +
      imageField(session.tempImage) +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot">' + (item ? '<button class="btn btn-ghost" type="button" data-action="delete-food" data-id="' + item.id + '">删除</button>' : '<button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button>') +
      '<button class="btn btn-primary" type="submit">' + (item ? '保存修改' : '放进口袋') + '</button></div>' +
      '</form>');
  }

  function openTravelSheet(category, editId) {
    const item = editId ? state.travels.find(function (t) { return t.id === editId; }) : null;
    const chosen = item ? item.category : (['place', 'todo', 'shop'].indexOf(category) >= 0 ? category : 'place');
    session.tempImage = item && item.image ? item.image : '';
    showSheet(sheetHead(item ? '编辑旅行心愿' : '钉一个旅行心愿', item ? '给这个心愿补一点细节。' : '想去的地方、想做的事、想逛的，都先钉在地图上。') +
      '<form class="sheet-form" data-form="travel" data-edit="' + (item ? item.id : '') + '">' +
      '<input type="hidden" name="category" value="' + chosen + '">' +
      '<div class="type-switch three" data-field="category">' +
      '<button type="button" class="' + (chosen === 'place' ? 'active' : '') + '" data-action="sheet-type" data-field="category" data-value="place">📍 地方</button>' +
      '<button type="button" class="' + (chosen === 'todo' ? 'active' : '') + '" data-action="sheet-type" data-field="category" data-value="todo">✨ 事情</button>' +
      '<button type="button" class="' + (chosen === 'shop' ? 'active' : '') + '" data-action="sheet-type" data-field="category" data-value="shop">🛍️ 想逛</button>' +
      '</div>' +
      '<label class="field"><span>心愿标题</span><input type="text" name="title" maxlength="48" value="' + esc(item ? item.title : '') + '" placeholder="比如：去阿那亚看一次日出" required></label>' +
      '<label class="field"><span>地点 / 城市（选填）</span><input type="text" name="place" maxlength="48" value="' + esc(item ? item.place : '') + '" placeholder="秦皇岛 · 阿那亚"></label>' +
      '<label class="field"><span>备注</span><textarea name="note" maxlength="240" placeholder="想和谁、什么时候、为什么想去？">' + esc(item ? item.note : '') + '</textarea></label>' +
      '<label class="field"><span>视频 / 攻略链接（选填）</span><input type="text" name="link" maxlength="300" value="' + esc(item ? item.link : '') + '" placeholder="抖音、微信、小红书链接"><small>网页只保存链接，不会下载视频。</small></label>' +
      imageField(session.tempImage) +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot">' + (item ? '<button class="btn btn-ghost" type="button" data-action="delete-travel" data-id="' + item.id + '">删除</button>' : '<button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button>') +
      '<button class="btn btn-primary" type="submit">' + (item ? '保存修改' : '钉上地图') + '</button></div>' +
      '</form>');
  }

  function openDramaSheet(editId) {
    const item = editId ? state.dramas.find(function (d) { return d.id === editId; }) : null;
    const emojis = ['🎬', '📺', '🌿', '💐', '🎧', '🌌', '🪷', '🍊', '🫧'];
    showSheet(sheetHead(item ? '编辑剧集' : '添加一部剧', item ? '改一下剧名、平台或备注。' : '只记下“以后要一起看”的约定，不追进度。') +
      '<form class="sheet-form" data-form="drama" data-edit="' + (item ? item.id : '') + '">' +
      '<label class="field"><span>剧名</span><input type="text" name="title" maxlength="50" value="' + esc(item ? item.title : '') + '" placeholder="比如：请回答1988" required></label>' +
      '<div class="field-row"><label class="field"><span>平台</span><input type="text" name="platform" maxlength="20" value="' + esc(item ? item.platform : '') + '" placeholder="腾讯 / 芒果 / B站"></label>' +
      '<label class="field"><span>封面 emoji</span><select name="emoji">' + emojis.map(function (e) { return '<option' + ((item && item.emoji === e) || (!item && e === '🎬') ? ' selected' : '') + '>' + e + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="field"><span>总集数（选填）</span><input type="number" name="total" min="0" max="999" value="' + (item && item.total ? item.total : '') + '" placeholder="20"></label>' +
      '<label class="field"><span>备注</span><textarea name="note" maxlength="220" placeholder="为什么想看？想和谁一起看？">' + esc(item ? item.note : '') + '</textarea></label>' +
      '<label class="field"><span>链接（选填）</span><input type="url" name="link" maxlength="300" value="' + esc(item ? item.link : '') + '" placeholder="https://..."></label>' +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot">' + (item ? '<button class="btn btn-ghost" type="button" data-action="delete-drama" data-id="' + item.id + '">删除</button>' : '<button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button>') +
      '<button class="btn btn-primary" type="submit">' + (item ? '保存修改' : '加入剧场') + '</button></div>' +
      '</form>');
  }

  function openMemorySheet(editId) {
    const item = editId ? state.memories.find(function (m) { return m.id === editId; }) : null;
    session.tempImage = item && item.image ? item.image : '';
    showSheet(sheetHead(item ? '编辑回忆胶囊' : '存一支视频', item ? '修改标题、链接或备注。' : '把抖音、微信视频号、B站、小红书里舍不得删的碎片存进来。') +
      '<form class="sheet-form" data-form="memory" data-edit="' + (item ? item.id : '') + '">' +
      '<label class="field"><span>标题</span><input type="text" name="title" maxlength="50" value="' + esc(item ? item.title : '') + '" placeholder="给这个瞬间起个名字" required></label>' +
      '<label class="field"><span>链接 / 分享文案</span><input type="text" name="url" maxlength="600" value="' + esc(item ? item.url : '') + '" placeholder="直接粘贴抖音或微信的分享文案也可以" inputmode="url"><small>会自动提取文案里的第一个链接，并识别平台。</small></label>' +
      '<label class="field"><span>为什么想记住</span><textarea name="note" maxlength="220" placeholder="看的时候在笑什么？">' + esc(item ? item.note : '') + '</textarea></label>' +
      imageField(session.tempImage) +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot">' + (item ? '<button class="btn btn-ghost" type="button" data-action="delete-memory" data-id="' + item.id + '">删除</button>' : '<button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button>') +
      '<button class="btn btn-primary" type="submit">' + (item ? '保存修改' : '收进胶囊') + '</button></div>' +
      '</form>');
  }

  function openEventSheet(date, editId) {
    const item = editId ? state.events.find(function (e) { return e.id === editId; }) : null;
    const types = [['date', '约会'], ['food', '吃饭'], ['trip', '旅行'], ['anniversary', '纪念日'], ['other', '其他']];
    showSheet(sheetHead(item ? '编辑日程' : '添加一个约定', '两个身份共享这份日历。写下想一起做的事，到了那天就会亮起来。') +
      '<form class="sheet-form" data-form="event" data-edit="' + (item ? item.id : '') + '">' +
      '<label class="field"><span>约定名称</span><input type="text" name="title" maxlength="40" value="' + esc(item ? item.title : '') + '" placeholder="比如：一起看一场电影" required></label>' +
      '<div class="field-row"><label class="field"><span>日期</span><input type="date" name="date" value="' + esc(item ? item.date : (date || dayKey())) + '" required></label>' +
      '<label class="field"><span>类型</span><select name="type">' + types.map(function (t) { return '<option value="' + t[0] + '"' + (item && item.type === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="field"><span>备注（选填）</span><textarea name="note" maxlength="180" placeholder="想在哪里、和谁、为什么想去？">' + esc(item ? item.note : '') + '</textarea></label>' +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot">' + (item ? '<button class="btn btn-ghost" type="button" data-action="delete-event" data-id="' + item.id + '">删除</button>' : '<button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button>') +
      '<button class="btn btn-primary" type="submit">' + (item ? '保存修改' : '写进日历') + '</button></div>' +
      '</form>');
  }

  function openTodoSheet(editId) {
    const item = editId ? state.todos.find(function (t) { return t.id === editId; }) : null;
    const categories = ['生活', '购物', '家务', '其他'];
    showSheet(sheetHead(item ? '编辑清单' : '加一件小事', '清单不是任务表，是一起把生活往前推的方式。') +
      '<form class="sheet-form" data-form="todo" data-edit="' + (item ? item.id : '') + '">' +
      '<label class="field"><span>要一起做什么</span><input type="text" name="title" maxlength="50" value="' + esc(item ? item.title : '') + '" placeholder="比如：买一盆小植物" required></label>' +
      '<div class="field-row"><label class="field"><span>分类</span><select name="category">' + categories.map(function (c) { return '<option' + ((item && item.category === c) || (!item && c === '生活') ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>想在哪天做（选填）</span><input type="date" name="due" value="' + esc(item ? item.due : '') + '"></label></div>' +
      '<label class="field"><span>备注（选填）</span><textarea name="note" maxlength="180" placeholder="比如：要一粉一蓝">' + esc(item ? item.note : '') + '</textarea></label>' +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot">' + (item ? '<button class="btn btn-ghost" type="button" data-action="delete-todo" data-id="' + item.id + '">删除</button>' : '<button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button>') +
      '<button class="btn btn-primary" type="submit">' + (item ? '保存修改' : '放进清单') + '</button></div>' +
      '</form>');
  }

  function openFootprintSheet(editId) {
    const item = editId ? state.visits.find(function (v) { return v.id === editId; }) : null;
    const cities = Object.keys(CITY_COORDS).sort();
    showSheet(sheetHead(item ? '编辑足迹' : '点亮一个地方', '写下去过的城市。常见城市会自动落在地图上，其他城市会先留在清单里。') +
      '<form class="sheet-form" data-form="visit" data-edit="' + (item ? item.id : '') + '">' +
      '<label class="field"><span>城市 / 地方</span><input type="text" name="city" maxlength="24" value="' + esc(item ? item.city : '') + '" placeholder="比如：杭州" list="city-suggestions" required><datalist id="city-suggestions">' + cities.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></label>' +
      '<div class="field-row"><label class="field"><span>去的日期</span><input type="date" name="date" value="' + esc(item ? item.date : dayKey()) + '" required></label>' +
      '<label class="field"><span>谁记的</span><select name="author"><option value="a"' + ((item && item.author === 'a') || !item ? ' selected' : '') + '>' + esc(user('a').name) + '</option><option value="b"' + (item && item.author === 'b' ? ' selected' : '') + '>' + esc(user('b').name) + '</option></select></label></div>' +
      '<label class="field"><span>那天的备注</span><textarea name="note" maxlength="180" placeholder="吃了什么、看到了什么、风大不大？">' + esc(item ? item.note : '') + '</textarea></label>' +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot">' + (item ? '<button class="btn btn-ghost" type="button" data-action="delete-visit" data-id="' + item.id + '">删除</button>' : '<button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button>') +
      '<button class="btn btn-primary" type="submit">' + (item ? '保存修改' : '钉在地图上') + '</button></div>' +
      '</form>');
  }

  function openCountdownSheet(editId) {
    const item = editId ? state.countdowns.find(function (c) { return c.id === editId; }) : null;
    const emojis = ['💗', '💌', '🎂', '🎈', '🎄', '🎆', '🌙', '🧳', '🍰', '💍', '🏠', '⭐'];
    const ideas = [
      { title: '情人节', md: '02-14', emoji: '💌' },
      { title: '白色情人节', md: '03-14', emoji: '🤍' },
      { title: '520', md: '05-20', emoji: '💗' },
      { title: '双十一', md: '11-11', emoji: '🛍️' },
      { title: '圣诞节', md: '12-25', emoji: '🎄' }
    ];
    const year = new Date().getFullYear();
    showSheet(sheetHead(item ? '编辑倒计时' : '添加一个日子', '生日、纪念日、下次见面，或者随便一个想一起等到的日子。') +
      '<form class="sheet-form" data-form="countdown" data-edit="' + (item ? item.id : '') + '">' +
      '<div class="cd-ideas">' + ideas.map(function (x) {
        return '<button type="button" class="cd-idea" data-action="countdown-preset" data-title="' + x.title + '" data-md="' + x.md + '" data-year="' + year + '" data-emoji="' + x.emoji + '">' + x.emoji + ' ' + x.title + '</button>';
      }).join('') + '</div>' +
      '<label class="field"><span>名字</span><input type="text" name="title" maxlength="40" value="' + esc(item ? item.title : '') + '" placeholder="比如：下一次见面" required></label>' +
      '<div class="field-row"><label class="field"><span>日期</span><input type="date" name="date" value="' + esc(item ? item.date : dayKey()) + '" required></label>' +
      '<label class="field"><span>时间（选填）</span><input type="time" name="time" value="' + esc(item ? item.time : '00:00') + '"></label></div>' +
      '<div class="field-row"><label class="field"><span>重复</span><select name="repeat"><option value="yearly"' + (!item || item.repeat === 'yearly' ? ' selected' : '') + '>每年</option><option value="once"' + (item && item.repeat === 'once' ? ' selected' : '') + '>只一次</option></select></label>' +
      '<label class="field"><span>图标</span><select name="emoji">' + emojis.map(function (e) { return '<option' + ((item && item.emoji === e) || (!item && e === '💗') ? ' selected' : '') + '>' + e + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="field"><span>备注（选填）</span><textarea name="note" maxlength="160" placeholder="想在这一天做什么？">' + esc(item ? item.note : '') + '</textarea></label>' +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot">' + (item ? '<button class="btn btn-ghost" type="button" data-action="delete-countdown" data-id="' + item.id + '">删除</button>' : '<button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button>') +
      '<button class="btn btn-primary" type="submit">' + (item ? '保存修改' : '开始倒计时') + '</button></div>' +
      '</form>');
  }

  function openMusicSheet() {
    const tracks = state.musicTracks || [];
    const current = state.meta.currentMusicId || 'builtin';
    const playing = !!session.musicPlaying;
    function row(id, title, sub, deletable) {
      const active = current === id;
      return '<div class="music-track' + (active ? ' active' : '') + '">' +
        '<span class="mt-icon">' + icon(active && playing ? 'pause' : 'play', 12) + '</span>' +
        '<span class="mt-copy"><b>' + esc(title) + '</b><span>' + esc(sub) + (active ? ' · 当前' : '') + '</span></span>' +
        '<button data-action="music-select" data-id="' + id + '" aria-label="' + (active && playing ? '暂停' : '播放') + '">' + icon(active && playing ? 'pause' : 'play', 11) + '</button>' +
        (deletable ? '<button class="mt-delete" data-action="delete-music" data-id="' + id + '" aria-label="删除这首">' + icon('trash', 11) + '</button>' : '') +
        '</div>';
    }
    showSheet(sheetHead('小屋音乐盒', '内置一段原创旋律；也可以把你自己下载的 MP3 导进来。音乐只留在这台设备。') +
      '<div class="music-track-list">' +
      row('builtin', '小屋旋律', '原创音乐盒 · 无版权 · 无需网络', false) +
      tracks.map(function (t) {
        return row(t.id, t.title, (t.artist || '本地导入') + ' · ' + (t.size ? (t.size / 1024 / 1024).toFixed(1) + ' MB' : '本地文件'), true);
      }).join('') +
      '</div>' +
      '<label class="upload-box"><span class="up-icon">' + icon('music', 16) + '</span><span class="up-copy"><b>导入本地音乐</b><span>MP3 / M4A / WAV / OGG，可多选</span></span><input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg" multiple data-music-input></label>' +
      '<p class="report-note" style="margin-top:9px">音乐文件存在浏览器 IndexedDB 里，不会上传。<br>单个建议不超过 30MB；清理浏览器数据会一起丢掉，原文件请自己留好。</p>');
  }

  function openPasswordSheet() {
    showSheet(sheetHead('修改小屋密码', '密码只保存在这台设备，用来挡住随手翻开的人。') +
      '<form class="sheet-form" data-form="change-password">' +
      '<label class="field"><span>当前密码</span><input type="password" name="current" maxlength="64" autocomplete="current-password" required></label>' +
      '<label class="field"><span>新密码（至少 4 位）</span><input type="password" name="next" minlength="4" maxlength="32" autocomplete="new-password" required></label>' +
      '<label class="field"><span>再输一次新密码</span><input type="password" name="confirm" minlength="4" maxlength="32" autocomplete="new-password" required></label>' +
      '<label class="field"><span>密码提示（选填）</span><input type="text" name="hint" maxlength="40" value="' + esc(state.meta.hint || '') + '" placeholder="忘了可以看一眼的小提示"></label>' +
      '<div class="form-error" data-error></div>' +
      '<div class="sheet-foot"><button class="btn btn-ghost" type="button" data-action="close-sheet">取消</button><button class="btn btn-primary" type="submit">' + icon('key', 13) + ' 换一把锁</button></div>' +
      '</form>');
  }

  function openConfirm(title, message, confirmLabel, onConfirm, danger) {
    session.confirm = onConfirm;
    showSheet('<div class="confirm-body"><div class="confirm-emoji">' + (danger ? '🥺' : '🎀') + '</div><h2>' + esc(title) + '</h2>' +
      '<p>' + esc(message).replace(/\n/g, '<br>') + '</p></div>' +
      '<div class="confirm-actions"><button class="btn btn-secondary" type="button" data-action="close-sheet">再想想</button>' +
      '<button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" type="button" data-action="run-confirm">' + esc(confirmLabel) + '</button></div>');
  }
