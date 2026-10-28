  /* =========================================================
     Actions
     ========================================================= */
  function handleAction(action, el, event) {
    const id = el.dataset.id;
    switch (action) {
      case 'nav':
        navigate(el.dataset.page);
        break;
      case 'lock':
        lockApp();
        break;
      case 'setup-back': {
        const form = document.querySelector('form[data-form="setup-profile"]');
        if (form) {
          const fd = new FormData(form);
          session.setup.aName = String(fd.get('aName') || session.setup.aName);
          session.setup.bName = String(fd.get('bName') || session.setup.bName);
          session.setup.aBirth = String(fd.get('aBirth') || '');
          session.setup.bBirth = String(fd.get('bBirth') || '');
          session.setup.aAvatar = String(fd.get('aAvatar') || 'mochi');
          session.setup.bAvatar = String(fd.get('bAvatar') || 'bunny');
          session.setup.start = String(fd.get('start') || '');
        }
        renderSetup(1);
        window.scrollTo(0, 0);
        break;
      }
      case 'toggle-password': {
        const wrap = el.closest('.password-wrap');
        if (!wrap) break;
        const input = wrap.querySelector('input');
        if (!input) break;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        el.innerHTML = icon(show ? 'eyeOff' : 'eye', 16);
        el.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
        break;
      }
      case 'show-hint': {
        const box = document.querySelector('[data-hint]');
        const resetBox = document.querySelector('[data-reset-box]');
        if (!box && !resetBox) {
          toast('没有设置密码提示，试试你们常用的暗号', '🥺');
          break;
        }
        if (box) box.classList.toggle('hidden');
        if (resetBox) resetBox.classList.toggle('hidden');
        const open = (box && !box.classList.contains('hidden')) || (resetBox && !resetBox.classList.contains('hidden'));
        el.textContent = open ? '收起提示' : '忘记暗号？';
        break;
      }
      case 'switch-user':
        openSwitchUserSheet();
        break;
      case 'set-user': {
        const next = el.dataset.user === 'b' ? 'b' : 'a';
        session.activeUser = next;
        state.meta.activeUser = next;
        saveState();
        closeSheet(true);
        renderTopbar();
        refreshPage(true);
        toast('现在是 ' + user(next).name + ' 在小屋', '🎀');
        break;
      }
      case 'open-status':
        openStatusSheet(el.dataset.user);
        break;
      case 'open-report':
        openReportSheet();
        break;
      case 'quick-report':
        addQuickReport(el.dataset.type, el);
        break;
      case 'report-filter':
        session.reportFilter = el.dataset.filter || 'all';
        refreshPage(true);
        break;
      case 'feed-filter':
        session.feedFilter = el.dataset.filter || 'all';
        refreshPage(true);
        break;
      case 'toggle-feed':
        session.showAllFeed = !session.showAllFeed;
        refreshPage(true);
        break;
      case 'react':
        toggleReaction(el.dataset.post, el.dataset.emoji, el);
        break;
      case 'toggle-comments': {
        const pid = el.dataset.post;
        if (session.openComments.has(pid)) session.openComments.delete(pid);
        else session.openComments.add(pid);
        session.stickerFor = null;
        refreshPage(true);
        break;
      }
      case 'toggle-stickers': {
        const pid = el.dataset.post;
        session.stickerFor = session.stickerFor === pid ? null : pid;
        session.openComments.add(pid);
        refreshPage(true);
        break;
      }
      case 'add-sticker':
        addSticker(el.dataset.post, Number(el.dataset.index));
        break;
      case 'delete-post':
        askDeletePost(id);
        break;
      case 'delete-comment':
        deleteComment(el.dataset.post, id);
        break;
      case 'open-food-add':
        openFoodSheet(el.dataset.type || session.foodType);
        break;
      case 'food-tab':
        session.foodType = el.dataset.type === 'dish' ? 'dish' : 'restaurant';
        refreshPage(true);
        break;
      case 'toggle-food':
        toggleFood(id, el);
        break;
      case 'edit-food':
        openFoodSheet(null, id);
        break;
      case 'random-food':
        randomFood();
        break;
      case 'open-travel-add':
        openTravelSheet(el.dataset.type || session.travelType);
        break;
      case 'travel-tab':
        session.travelType = ['place', 'todo', 'shop'].indexOf(el.dataset.type) >= 0 ? el.dataset.type : 'place';
        refreshPage(true);
        break;
      case 'toggle-travel':
        toggleTravel(id, el);
        break;
      case 'edit-travel':
        openTravelSheet(null, id);
        break;
      case 'open-drama-add':
        openDramaSheet();
        break;
      case 'drama-filter':
        session.dramaFilter = el.dataset.filter || 'all';
        refreshPage(true);
        break;
      case 'drama-done':
        toggleDramaDone(id);
        break;
      case 'edit-drama':
        openDramaSheet(id);
        break;
      case 'add-rec':
        addRecommendation(el.dataset.title);
        break;
      case 'calendar-shift':
        session.calendarMonth = monthShift(session.calendarMonth, Number(el.dataset.delta) || 1);
        refreshPage(true);
        break;
      case 'open-event-add':
        openEventSheet(el.dataset.date);
        break;
      case 'edit-event':
        openEventSheet(null, id);
        break;
      case 'delete-event':
        askDeleteNew('event', id);
        break;
      case 'todo-filter':
        session.checklistFilter = el.dataset.filter || 'all';
        refreshPage(true);
        break;
      case 'open-todo-add':
        openTodoSheet();
        break;
      case 'toggle-todo':
        toggleTodo(id);
        break;
      case 'edit-todo':
        openTodoSheet(id);
        break;
      case 'delete-todo':
        askDeleteNew('todo', id);
        break;
      case 'recap-shift':
        session.recapMonth = monthShift(session.recapMonth, Number(el.dataset.delta) || 1);
        refreshPage(true);
        break;
      case 'print-recap':
        printRecap();
        break;
      case 'copy-recap':
        copyRecapText();
        break;
      case 'open-countdown-add':
        openCountdownSheet();
        break;
      case 'edit-countdown':
        openCountdownSheet(id);
        break;
      case 'delete-countdown':
        askDeleteNew('countdown', id);
        break;
      case 'countdown-preset':
        applyCountdownPreset(el);
        break;
      case 'open-footprint-add':
        openFootprintSheet();
        break;
      case 'edit-footprint':
        openFootprintSheet(id);
        break;
      case 'delete-visit':
        askDeleteNew('visit', id);
        break;
      case 'open-memory-add':
        openMemorySheet();
        break;
      case 'memory-filter':
        session.memoryFilter = el.dataset.filter || 'all';
        refreshPage(true);
        break;
      case 'edit-memory':
        openMemorySheet(id);
        break;
      case 'copy-link':
        copyLink(el.dataset.url);
        break;
      case 'open-link':
        openExternal(el.dataset.url);
        break;
      case 'generate-ai':
        startAiGeneration();
        break;
      case 'edit-profiles':
        openProfileSheet();
        break;
      case 'change-password':
        openPasswordSheet();
        break;
      case 'export-data':
        exportData();
        break;
      case 'import-data':
        importData();
        break;
      case 'clear-samples':
        askClearSamples();
        break;
      case 'reset-house':
        askResetHouse();
        break;
      case 'reset-from-lock':
        askResetHouse();
        break;
      case 'close-sheet':
        closeSheet();
        break;
      case 'run-confirm': {
        const cb = session.confirm;
        session.confirm = null;
        closeSheet(true);
        if (cb) setTimeout(cb, 60);
        break;
      }
      case 'sheet-type': {
        const form = el.closest('form');
        const field = el.dataset.field;
        const value = el.dataset.value;
        if (!form || !field) break;
        const hidden = form.querySelector('input[name="' + field + '"]');
        if (hidden) hidden.value = value;
        const group = el.closest('.type-switch');
        if (group) {
          Array.from(group.querySelectorAll('button')).forEach(function (b) {
            b.classList.toggle('active', b === el);
          });
        }
        break;
      }
      case 'remove-image': {
        session.tempImage = '';
        const field = el.closest('[data-image-field]');
        setImageField(field, '');
        break;
      }
      case 'remove-status-image': {
        const index = Number(el.dataset.index);
        if (Number.isInteger(index)) session.tempImages.splice(index, 1);
        updateImagesPreview(el.closest('[data-images-field]'));
        break;
      }
      case 'delete-food':
        askDelete('food', id);
        break;
      case 'delete-travel':
        askDelete('travel', id);
        break;
      case 'delete-drama':
        askDelete('drama', id);
        break;
      case 'delete-memory':
        askDelete('memory', id);
        break;
      default:
        break;
    }
  }

  function addQuickReport(type, el) {
    const def = REPORT_TYPES.find(function (r) { return r.type === type; }) || { type: type || '报备', emoji: '💌', text: '' };
    const report = {
      id: uid('r'),
      author: session.activeUser,
      type: def.type,
      emoji: def.emoji,
      text: def.text || def.type,
      createdAt: Date.now()
    };
    state.reports.push(report);
    saveState();
    if (el) {
      const r = el.getBoundingClientRect();
      heartBurst(r.left + r.width / 2, r.top + r.height / 2, def.emoji, 5);
      haptic(10);
    }
    refreshPage(true);
    toast('已报备 · ' + def.type, def.emoji);
  }

  function toggleReaction(postId, emoji, el) {
    const p = state.statuses.find(function (x) { return x.id === postId; });
    if (!p) return;
    p.reactions = p.reactions || {};
    const arr = p.reactions[emoji] || [];
    const idx = arr.indexOf(session.activeUser);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(session.activeUser);
    p.reactions[emoji] = arr;
    saveState();
    if (idx < 0 && el) {
      const r = el.getBoundingClientRect();
      heartBurst(r.left + r.width / 2, r.top + r.height / 2, emoji, 4);
      haptic(8);
    }
    refreshPage(true);
  }

  function addSticker(postId, index) {
    const p = state.statuses.find(function (x) { return x.id === postId; });
    const sticker = STICKERS[index];
    if (!p || !sticker) return;
    p.comments = p.comments || [];
    p.comments.push({ id: uid('c'), author: session.activeUser, sticker: { emoji: sticker.emoji, label: sticker.label }, createdAt: Date.now() });
    session.stickerFor = null;
    saveState();
    refreshPage(true);
    toast('贴了一张「' + sticker.label + '」', sticker.emoji);
  }

  function deleteComment(postId, commentId) {
    const p = state.statuses.find(function (x) { return x.id === postId; });
    if (!p) return;
    p.comments = (p.comments || []).filter(function (c) { return c.id !== commentId; });
    saveState();
    refreshPage(true);
    toast('评论删掉了', '🫧');
  }

  function askDeletePost(id) {
    openConfirm('删掉这条动态？', '这条动态下面的评论和表情也会一起消失。', '删掉', function () {
      state.statuses = state.statuses.filter(function (p) { return p.id !== id; });
      saveState();
      closeSheet(true);
      refreshPage(true);
      toast('删掉了，回忆还长', '🫧');
    }, true);
  }

  function toggleFood(id, el) {
    const f = state.foods.find(function (x) { return x.id === id; });
    if (!f) return;
    f.done = !f.done;
    if (f.done) f.completedAt = Date.now();
    else delete f.completedAt;
    saveState();
    if (f.done) {
      if (el) {
        const r = el.getBoundingClientRect();
        heartBurst(r.left + r.width / 2, r.top + r.height / 2, '🍰', 5);
      }
      confetti();
      toast('打卡成功 · ' + f.title, '🍰');
    } else {
      toast('已移回心愿清单', '🍜');
    }
    refreshPage(true);
  }

  function toggleTravel(id, el) {
    const t = state.travels.find(function (x) { return x.id === id; });
    if (!t) return;
    t.done = !t.done;
    if (t.done) t.completedAt = Date.now();
    else delete t.completedAt;
    saveState();
    if (t.done) {
      if (el) {
        const r = el.getBoundingClientRect();
        heartBurst(r.left + r.width / 2, r.top + r.height / 2, '✨', 5);
      }
      confetti();
      toast('心愿打勾啦 · ' + t.title, '✨');
    } else {
      toast('已移回旅行手帐', '📍');
    }
    refreshPage(true);
  }

  function toggleDramaDone(id) {
    const d = state.dramas.find(function (x) { return x.id === id; });
    if (!d) return;
    const wasDone = d.status === 'done';
    d.status = wasDone ? 'want' : 'done';
    if (wasDone) delete d.completedAt;
    else d.completedAt = Date.now();
    d.updatedAt = Date.now();
    saveState();
    if (!wasDone) {
      confetti();
      toast('又一起看完一部剧，记得聊聊最喜欢的那一段', '🎬');
    } else {
      toast('已移回想看清单', '📺');
    }
    refreshPage(true);
  }

  function addRecommendation(title) {
    const rec = DRAMA_RECS.find(function (r) { return r.title === title; });
    if (!rec) return;
    if (state.dramas.some(function (d) { return d.title === rec.title; })) {
      toast('这部剧已经在清单里啦', '📺');
      return;
    }
    state.dramas.push({
      id: uid('d'),
      title: rec.title,
      platform: rec.platform,
      total: rec.total,
      status: 'want',
      note: rec.note,
      emoji: rec.emoji,
      link: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    saveState();
    if (session.page !== 'dramas') navigate('dramas');
    else refreshPage(true);
    toast('《' + rec.title + '》已加入剧场', '📺');
  }

  function toggleTodo(id) {
    const t = state.todos.find(function (x) { return x.id === id; });
    if (!t) return;
    t.done = !t.done;
    if (t.done) t.completedAt = Date.now();
    else delete t.completedAt;
    saveState();
    const allDone = state.todos.length && state.todos.every(function (x) { return x.done; });
    if (t.done && allDone) {
      confetti();
      toast('清单全部打勾啦，今天很了不起', '✅');
    } else if (t.done) {
      toast('又完成一件小事', '✅');
    } else {
      toast('已移回未完成', '📝');
    }
    refreshPage(true);
  }

  function copyRecapText() {
    const text = recapPlainText(session.recapMonth);
    const done = function () { toast('本月小结已复制', '📋'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function applyCountdownPreset(el) {
    const form = el.closest('form');
    if (!form) return;
    const title = form.querySelector('[name="title"]');
    const date = form.querySelector('[name="date"]');
    const emoji = form.querySelector('[name="emoji"]');
    const md = el.dataset.md || '02-14';
    const year = el.dataset.year || String(new Date().getFullYear());
    if (title) title.value = el.dataset.title || '';
    if (date) date.value = year + '-' + md;
    if (emoji) emoji.value = el.dataset.emoji || '💗';
  }

  function askDeleteNew(kind, id) {
    const names = { event: '日程', todo: '清单', visit: '足迹', countdown: '倒计时' };
    openConfirm('删掉这个' + (names[kind] || '内容') + '？', '删除后不能恢复。', '删掉', function () {
      if (kind === 'event') state.events = state.events.filter(function (x) { return x.id !== id; });
      if (kind === 'todo') state.todos = state.todos.filter(function (x) { return x.id !== id; });
      if (kind === 'visit') state.visits = state.visits.filter(function (x) { return x.id !== id; });
      if (kind === 'countdown') state.countdowns = state.countdowns.filter(function (x) { return x.id !== id; });
      saveState();
      closeSheet(true);
      refreshPage(true);
      toast('删掉了', '🫧');
    }, true);
  }

  function startAiGeneration() {
    if (session.aiLoading) return;
    session.aiLoading = true;
    if (session.page === 'zodiac') renderPage(false);
    setTimeout(function () {
      generateAiReport();
      session.aiLoading = false;
      if (session.page === 'zodiac') renderPage(false);
      confetti();
      toast('性格说明书生成好啦', '🔮');
    }, 900);
  }

  function openExternal(url) {
    const safe = normalizeUrl(url);
    if (!safe) {
      toast('这个链接好像不太对', '🔗');
      return;
    }
    const win = window.open(safe, '_blank', 'noopener,noreferrer');
    if (!win) {
      copyLink(safe);
      toast('新窗口被拦住了，链接已经复制', '🔗');
    }
  }

  function lockApp() {
    try { if (state) saveState(); } catch (e) { }
    closeSheet(true);
    session.unlocked = false;
    session.page = 'home';
    session.openComments = new Set();
    session.stickerFor = null;
    session.aiLoading = false;
    if ($toast) $toast.innerHTML = '';
    document.querySelectorAll('.heart-fly,.confetti').forEach(function (el) { el.remove(); });
    renderLock();
    window.scrollTo(0, 0);
  }

  /* =========================================================
     Export / import / reset
     ========================================================= */
  function exportData() {
    const text = JSON.stringify(state, null, 2);
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'our-little-house-backup-' + dayKey() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast('备份文件已生成', '📦');
  }

  function importData() {
    const input = document.getElementById('import-file');
    if (input) input.click();
  }

  async function readImportFile(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const text = await file.text();
    input.value = '';
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      toast('这个文件好像不是小屋的备份', '🥺');
      return;
    }
    if (!data || data.version !== DATA_VERSION || !data.users || !data.meta || !data.meta.password) {
      toast('备份格式不对，换一个文件试试', '🥺');
      return;
    }
    openConfirm('恢复这份备份？', '当前小屋会被这份备份覆盖，包括动态、照片和密码。\n如果当前有重要的内容，建议先导出一份。', '恢复备份', function () {
      state = ensureState(data);
      saveState();
      enterApp();
      toast('小屋恢复好啦', '🎀');
      confetti();
    }, true);
  }

  function askClearSamples() {
    const n = sampleCount();
    if (!n) {
      toast('没有需要清理的示例内容', '🎀');
      return;
    }
    openConfirm('清空示例内容？', '会移除 ' + n + ' 条示例动态、报备、美食、旅行和剧集。你们自己写的内容会保留。', '清空示例', function () {
      ['statuses', 'reports', 'foods', 'travels', 'dramas', 'memories', 'events', 'todos', 'visits'].forEach(function (key) {
        state[key] = (state[key] || []).filter(function (item) { return !item.sample; });
      });
      ['a', 'b'].forEach(function (id) {
        if (state.users[id].now && state.users[id].now.sample) {
          state.users[id].now = { text: '', mood: '', activity: '', place: '', updatedAt: 0 };
        }
      });
      state.meta.ai = null;
      saveState();
      closeSheet(true);
      refreshPage(true);
      toast('示例已经收走，小屋更空了', '🧺');
    }, false);
  }

  function askResetHouse() {
    openConfirm('清空并重置小屋？', '所有动态、报备、美食、旅行、剧集、回忆和密码都会被删除，无法恢复。\n请先确认已经导出过备份。', '确认清空', function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
      state = null;
      session.unlocked = false;
      session.page = 'home';
      session.activeUser = 'a';
      session.openComments = new Set();
      session.setup = {
        step: 1, password: '', hint: '', aName: '泡泡', bName: '小明',
        aBirth: '', bBirth: '', aAvatar: 'mochi', bAvatar: 'bunny', start: ''
      };
      closeSheet(true);
      renderSetup(1);
      window.scrollTo(0, 0);
    }, true);
  }

  function askDelete(kind, id) {
    const names = { food: '美食心愿', travel: '旅行心愿', drama: '剧集', memory: '回忆胶囊' };
    openConfirm('删掉这个' + names[kind] + '？', '删除后不能恢复，照片也会一起消失。', '删掉', function () {
      if (kind === 'food') state.foods = state.foods.filter(function (x) { return x.id !== id; });
      if (kind === 'travel') state.travels = state.travels.filter(function (x) { return x.id !== id; });
      if (kind === 'drama') state.dramas = state.dramas.filter(function (x) { return x.id !== id; });
      if (kind === 'memory') state.memories = state.memories.filter(function (x) { return x.id !== id; });
      state.meta.ai = null;
      saveState();
      closeSheet(true);
      refreshPage(true);
      toast('删掉了', '🫧');
    }, true);
  }

  /* =========================================================
     Image handling
     ========================================================= */
  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error('not an image'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = function () { reject(new Error('read failed')); };
      reader.onload = function () {
        const img = new Image();
        img.onerror = function () { reject(new Error('decode failed')); };
        img.onload = function () {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (!w || !h) { reject(new Error('empty image')); return; }
          const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(w, h));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(w * scale));
          canvas.height = Math.max(1, Math.round(h * scale));
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fffaf5';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          let quality = 0.78;
          let data = canvas.toDataURL('image/jpeg', quality);
          while (data.length > 440000 && quality > 0.5) {
            quality -= 0.06;
            data = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(data);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function onImageSelected(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const field = input.closest('[data-image-field]');
    if (file.size > 12 * 1024 * 1024) toast('照片有点大，我会帮你压小一点', '📷');
    else toast('正在把照片放进小屋…', '📷');
    try {
      const data = await compressImage(file);
      session.tempImage = data;
      setImageField(field, data);
      toast('照片准备好啦', '🖼️');
    } catch (e) {
      toast('这张照片读不出来，换一张试试', '🥺');
    }
    input.value = '';
  }

  async function onImagesSelected(input) {
    const field = input.closest('[data-images-field]');
    const files = Array.from(input.files || []);
    if (!files.length) return;
    const room = 9 - session.tempImages.length;
    if (room <= 0) {
      toast('最多放 9 张照片，先删掉一张吧', '📷');
      input.value = '';
      return;
    }
    const batch = files.slice(0, room);
    if (files.length > room) toast('最多 9 张，先放前面这些', '📷');
    else toast('正在压缩 ' + batch.length + ' 张照片…', '📷');
    let added = 0;
    for (let i = 0; i < batch.length; i++) {
      try {
        const data = await compressImage(batch[i]);
        if (session.tempImages.length < 9) {
          session.tempImages.push(data);
          added++;
        }
      } catch (e) { /* skip bad file */ }
    }
    updateImagesPreview(field);
    input.value = '';
    if (added) toast('已添加 ' + added + ' 张照片', '🖼️');
    else toast('这些照片读不出来，换一批试试', '🥺');
  }

  /* =========================================================
     Music box: local files in IndexedDB + an original Web Audio loop
     ========================================================= */
  /* 历史数据库名，保持原样以免旧照片读不到。 */
    const MEDIA_DB = 'kitty-house-media';
  const MEDIA_STORE = 'music';
  let mediaDbPromise = null;
  let audioEl = null;
  let musicObjectUrl = '';
  let musicCtx = null;
  let musicMaster = null;
  let musicTimer = null;
  let musicMode = 'builtin';

  function openMediaDb() {
    if (mediaDbPromise) return mediaDbPromise;
    mediaDbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('no-indexeddb')); return; }
      const req = indexedDB.open(MEDIA_DB, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(MEDIA_STORE)) req.result.createObjectStore(MEDIA_STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('idb-open-failed')); };
    });
    return mediaDbPromise;
  }

  async function idbPutMusic(id, blob) {
    const db = await openMediaDb();
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      tx.objectStore(MEDIA_STORE).put(blob, id);
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error || new Error('idb-put-failed')); };
    });
  }

  async function idbGetMusic(id) {
    const db = await openMediaDb();
    return new Promise(function (resolve, reject) {
      const req = db.transaction(MEDIA_STORE, 'readonly').objectStore(MEDIA_STORE).get(id);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { reject(req.error || new Error('idb-get-failed')); };
    });
  }

  async function idbDeleteMusic(id) {
    const db = await openMediaDb();
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      tx.objectStore(MEDIA_STORE).delete(id);
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error || new Error('idb-delete-failed')); };
    });
  }

  function ensureAudio() {
    if (audioEl) return audioEl;
    audioEl = new Audio();
    audioEl.preload = 'metadata';
    audioEl.volume = 0.55;
    audioEl.addEventListener('ended', function () {
      session.musicPlaying = false;
      playNextMusic();
    });
    audioEl.addEventListener('error', function () {
      if (musicMode === 'local') {
        session.musicPlaying = false;
        toast('这首音乐读不出来，换一首试试', '🎵');
        refreshMusicViews();
      }
    });
    return audioEl;
  }

  function stopLocalAudio() {
    if (audioEl) {
      audioEl.pause();
      audioEl.removeAttribute('src');
      audioEl.load();
    }
    if (musicObjectUrl) {
      URL.revokeObjectURL(musicObjectUrl);
      musicObjectUrl = '';
    }
  }

  function stopBuiltinMusic() {
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
    if (musicCtx) {
      try { musicCtx.close(); } catch (e) { /* already closed */ }
      musicCtx = null;
      musicMaster = null;
    }
  }

  function stopAllMusic() {
    stopLocalAudio();
    stopBuiltinMusic();
    session.musicPlaying = false;
  }

  function scheduleBuiltinLoop() {
    if (!musicCtx || !musicMaster || !session.musicPlaying || musicMode !== 'builtin') return;
    const ctx = musicCtx;
    const master = musicMaster;
    const melody = [
      [659.25, .42], [783.99, .42], [880.00, .42], [783.99, .42],
      [659.25, .42], [587.33, .42], [523.25, .84],
      [587.33, .42], [659.25, .42], [783.99, .42], [659.25, .42],
      [587.33, .42], [523.25, .42], [493.88, .84],
      [523.25, .42], [587.33, .42], [659.25, .42], [783.99, .42],
      [880.00, .42], [783.99, .42], [659.25, .84]
    ];
    const start = ctx.currentTime + 0.08;
    let t = start;
    melody.forEach(function (note) {
      const freq = note[0];
      const dur = note[1];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + dur);
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(freq * 2, t);
      shimmerGain.gain.setValueAtTime(0, t);
      shimmerGain.gain.linearRampToValueAtTime(0.025, t + 0.01);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.5);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start(t);
      shimmer.stop(t + dur);
      t += dur;
    });
    const total = t - start;
    musicTimer = setTimeout(scheduleBuiltinLoop, Math.max(800, total * 1000 + 180));
  }

  async function playBuiltinMusic() {
    stopAllMusic();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { toast('这台浏览器不支持音乐盒', '🎵'); return; }
    try {
      musicCtx = new Ctx();
      if (musicCtx.state === 'suspended') await musicCtx.resume();
      musicMaster = musicCtx.createGain();
      musicMaster.gain.value = 0.75;
      musicMaster.connect(musicCtx.destination);
      musicMode = 'builtin';
      state.meta.currentMusicId = 'builtin';
      session.musicPlaying = true;
      saveState();
      scheduleBuiltinLoop();
      refreshMusicViews();
    } catch (e) {
      stopBuiltinMusic();
      session.musicPlaying = false;
      toast('音乐盒没有响起来，再点一次试试', '🎵');
    }
  }

  function pauseMusic() {
    stopAllMusic();
    refreshMusicViews();
  }

  async function selectMusic(id) {
    id = id || 'builtin';
    const wasCurrent = state.meta.currentMusicId === id;
    if (wasCurrent && session.musicPlaying) { pauseMusic(); return; }
    if (id === 'builtin') { await playBuiltinMusic(); return; }
    const track = (state.musicTracks || []).find(function (t) { return t.id === id; });
    if (!track) { toast('这首音乐已经不在了', '🎵'); return; }
    try {
      const blob = await idbGetMusic(id);
      if (!blob) { toast('找不到音乐文件，可能被浏览器清掉了', '🎵'); return; }
      stopAllMusic();
      ensureAudio();
      musicObjectUrl = URL.createObjectURL(blob);
      audioEl.src = musicObjectUrl;
      musicMode = 'local';
      state.meta.currentMusicId = id;
      saveState();
      await audioEl.play();
      session.musicPlaying = true;
      refreshMusicViews();
    } catch (e) {
      session.musicPlaying = false;
      stopLocalAudio();
      toast('浏览器没有允许播放，再点一次播放键试试', '🎵');
      refreshMusicViews();
    }
  }

  function toggleMusic() {
    if (session.musicPlaying) pauseMusic();
    else selectMusic(state.meta.currentMusicId || 'builtin');
  }

  function playNextMusic() {
    const tracks = state.musicTracks || [];
    if (!tracks.length) { pauseMusic(); return; }
    const idx = tracks.findIndex(function (t) { return t.id === state.meta.currentMusicId; });
    const next = tracks[idx + 1] || tracks[0];
    if (next) selectMusic(next.id);
    else pauseMusic();
  }

  function refreshMusicViews() {
    if (document.querySelector('.sheet')) openMusicSheet();
    else refreshPage(true);
  }

  async function importMusicFiles(input) {
    const files = Array.from(input.files || []);
    input.value = '';
    if (!files.length) return;
    const allowed = /\.(mp3|m4a|aac|wav|ogg|oga|flac|webm)$/i;
    let added = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!/^audio\//.test(file.type || '') && !allowed.test(file.name)) {
        toast('「' + file.name + '」不是音频文件', '🎵');
        continue;
      }
      if (file.size > 30 * 1024 * 1024) {
        toast('「' + file.name + '」超过 30MB，先换小一点的', '🎵');
        continue;
      }
      try {
        const id = uid('mu');
        await idbPutMusic(id, file);
        const title = file.name.replace(/\.[^.]+$/, '').slice(0, 60) || '未命名音乐';
        state.musicTracks.push({
          id: id, title: title, artist: '本地导入', size: file.size, createdAt: Date.now()
        });
        added++;
      } catch (e) {
        toast('「' + file.name + '」存不进去，换一首试试', '🎵');
      }
    }
    if (added) {
      saveState();
      toast('导入了 ' + added + ' 首本地音乐', '🎵');
      openMusicSheet();
    }
  }

  async function deleteMusic(id) {
    const track = (state.musicTracks || []).find(function (t) { return t.id === id; });
    if (!track) return;
    if (state.meta.currentMusicId === id) {
      stopAllMusic();
      state.meta.currentMusicId = 'builtin';
    }
    state.musicTracks = state.musicTracks.filter(function (t) { return t.id !== id; });
    saveState();
    try { await idbDeleteMusic(id); } catch (e) { /* metadata already removed */ }
    openMusicSheet();
    toast('删掉了「' + track.title + '」', '🎵');
  }


  /* =========================================================
     Form submissions
     ========================================================= */
  function handleForm(type, form) {
    const fd = new FormData(form);
    const val = function (key) { return String(fd.get(key) || '').trim(); };
    if (type === 'setup-password') {
      const password = val('password');
      const confirm = val('confirm');
      const hint = val('hint');
      if (password.length < 4) { showFormError(form, '暗号至少要有 4 位。'); return; }
      if (password !== confirm) { showFormError(form, '两次输入的暗号不一样。'); return; }
      session.setup.password = password;
      session.setup.hint = hint;
      renderSetup(2);
      window.scrollTo(0, 0);
      return;
    }
    if (type === 'setup-profile') {
      session.setup.aName = val('aName') || '泡泡';
      session.setup.bName = val('bName') || '小明';
      session.setup.aBirth = val('aBirth');
      session.setup.bBirth = val('bBirth');
      session.setup.aAvatar = val('aAvatar') || 'mochi';
      session.setup.bAvatar = val('bAvatar') || 'bunny';
      session.setup.start = val('start');
      if (!session.setup.password) { renderSetup(1); return; }
      state = buildSeedState(session.setup);
      if (!saveState()) return;
      enterApp();
      confetti();
      toast('小屋开张啦，欢迎回家', '🎀');
      return;
    }
    if (type === 'unlock') {
      const password = String(fd.get('password') || '');
      if (verifyPassword(password)) {
        enterApp();
        toast('欢迎回家', '💗');
        setTimeout(function () { heartBurst(window.innerWidth / 2, window.innerHeight * 0.45, '💗', 7); }, 180);
      } else {
        showFormError(form, '暗号不对，再想想。');
        const input = form.querySelector('input[name="password"]');
        if (input) { input.value = ''; input.focus(); }
      }
      return;
    }
    if (type === 'status') {
      const userId = form.dataset.user === 'b' ? 'b' : 'a';
      const text = val('text');
      const mood = val('mood');
      const activity = val('activity');
      const place = val('place');
      const images = session.tempImages.slice(0, 9);
      if (!text && !mood && !images.length) {
        sheetError(form, '写一句话、贴一个心情，或者放几张照片吧。');
        return;
      }
      const now = Date.now();
      const finalText = text || (images.length ? '分享了几张今天的照片。' : '只留下了一个心情。');
      const post = {
        id: uid('s'), author: userId, text: finalText, mood: mood, activity: activity, place: place,
        images: images, createdAt: now, reactions: {}, comments: []
      };
      state.statuses.push(post);
      const u = user(userId);
      u.now = { text: finalText, mood: mood, activity: activity, place: place, updatedAt: now };
      state.meta.activeUser = session.activeUser;
      if (!saveState()) return;
      session.feedFilter = 'all';
      closeSheet(true);
      if (session.page !== 'home') navigate('home');
      else refreshPage(true);
      confetti();
      toast('此刻已经收进小屋', '💗');
      return;
    }
    if (type === 'report-custom') {
      const text = val('text');
      if (!text) { sheetError(form, '写一句想报备的话吧。'); return; }
      state.reports.push({
        id: uid('r'), author: session.activeUser, type: '自定义', emoji: '💌', text: text, createdAt: Date.now()
      });
      saveState();
      closeSheet(true);
      if (session.page !== 'report') navigate('report');
      else refreshPage(true);
      toast('报备已收到', '💌');
      return;
    }
    if (type === 'food') {
      const editId = form.dataset.edit;
      const item = editId ? state.foods.find(function (x) { return x.id === editId; }) : null;
      const title = val('title');
      if (!title) { sheetError(form, '还没写店名或菜名呢。'); return; }
      const rawLink = val('link');
      const link = normalizeUrl(rawLink);
      if (rawLink && !link) { sheetError(form, '链接好像不太对，检查一下再试。'); return; }
      const typeValue = val('type') === 'dish' ? 'dish' : 'restaurant';
      const tags = val('tags').split(/[,，、#\s]+/).map(function (t) { return t.trim(); }).filter(Boolean).slice(0, 8);
      const payload = {
        type: typeValue, title: title, note: val('note'), tags: tags, link: link,
        image: session.tempImage, rating: Number(val('rating')) || 0
      };
      if (item) {
        Object.assign(item, payload);
      } else {
        state.foods.push(Object.assign({ id: uid('f'), author: session.activeUser, done: false, createdAt: Date.now() }, payload));
      }
      session.foodType = typeValue;
      saveState();
      closeSheet(true);
      if (session.page !== 'food') navigate('food');
      else refreshPage(true);
      toast(item ? '美食心愿更新啦' : '已放进口袋', '🍰');
      return;
    }
    if (type === 'travel') {
      const editId = form.dataset.edit;
      const item = editId ? state.travels.find(function (x) { return x.id === editId; }) : null;
      const title = val('title');
      if (!title) { sheetError(form, '还没写心愿标题呢。'); return; }
      const rawLink = val('link');
      const link = normalizeUrl(rawLink);
      if (rawLink && !link) { sheetError(form, '链接好像不太对，检查一下再试。'); return; }
      const category = ['place', 'todo', 'shop'].indexOf(val('category')) >= 0 ? val('category') : 'place';
      const payload = {
        category: category, title: title, place: val('place'), note: val('note'),
        link: link, image: session.tempImage
      };
      if (item) {
        Object.assign(item, payload);
      } else {
        state.travels.push(Object.assign({ id: uid('t'), author: session.activeUser, done: false, createdAt: Date.now() }, payload));
      }
      session.travelType = category;
      saveState();
      closeSheet(true);
      if (session.page !== 'travel') navigate('travel');
      else refreshPage(true);
      toast(item ? '旅行心愿更新啦' : '已钉在旅行手帐上', '📍');
      return;
    }
    if (type === 'drama') {
      const editId = form.dataset.edit;
      const item = editId ? state.dramas.find(function (x) { return x.id === editId; }) : null;
      const title = val('title');
      if (!title) { sheetError(form, '写一下剧名吧。'); return; }
      const total = Math.max(0, Number(val('total')) || 0);
      const rawLink = val('link');
      const link = normalizeUrl(rawLink);
      if (rawLink && !link) { sheetError(form, '链接好像不太对。'); return; }
      const payload = {
        title: title, platform: val('platform'), total: total, status: item && item.status === 'done' ? 'done' : 'want',
        note: val('note'), emoji: val('emoji') || '🎬', link: link, updatedAt: Date.now()
      };
      if (item) {
        Object.assign(item, payload);
      } else {
        state.dramas.push(Object.assign({ id: uid('d'), createdAt: Date.now() }, payload));
      }
      saveState();
      closeSheet(true);
      if (session.page !== 'dramas') navigate('dramas');
      else refreshPage(true);
      toast(item ? '剧集更新啦' : '已加入剧场', '📺');
      return;
    }
    if (type === 'memory') {
      const editId = form.dataset.edit;
      const item = editId ? state.memories.find(function (x) { return x.id === editId; }) : null;
      const title = val('title');
      if (!title) { sheetError(form, '给这个瞬间起个名字吧。'); return; }
      const rawUrl = val('url');
      const url = normalizeUrl(rawUrl);
      if (rawUrl && !url) { sheetError(form, '没有从文案里找到可用的链接。'); return; }
      const payload = {
        title: title, url: url, platform: platformOf(url).id, note: val('note'),
        image: session.tempImage
      };
      if (item) {
        Object.assign(item, payload);
      } else {
        state.memories.push(Object.assign({ id: uid('m'), author: session.activeUser, createdAt: Date.now() }, payload));
      }
      saveState();
      closeSheet(true);
      if (session.page !== 'memories') navigate('memories');
      else refreshPage(true);
      toast(item ? '回忆更新啦' : '已收进回忆胶囊', '🎞️');
      return;
    }
    if (type === 'event') {
      const editId = form.dataset.edit;
      const item = editId ? state.events.find(function (x) { return x.id === editId; }) : null;
      const title = val('title');
      const date = val('date');
      if (!title) { sheetError(form, '写一下这个约定叫什么。'); return; }
      if (!date) { sheetError(form, '选一个日期吧。'); return; }
      const payload = {
        title: title, date: date, type: val('type') || 'date', note: val('note')
      };
      if (item) Object.assign(item, payload);
      else state.events.push(Object.assign({ id: uid('ev'), author: session.activeUser, createdAt: Date.now() }, payload));
      saveState();
      closeSheet(true);
      if (session.page !== 'calendar') navigate('calendar');
      else refreshPage(true);
      toast(item ? '日程更新啦' : '写进日历啦', '🗓️');
      return;
    }
    if (type === 'todo') {
      const editId = form.dataset.edit;
      const item = editId ? state.todos.find(function (x) { return x.id === editId; }) : null;
      const title = val('title');
      if (!title) { sheetError(form, '写一件想一起做的事吧。'); return; }
      const payload = {
        title: title, category: val('category') || '生活', note: val('note'), due: val('due')
      };
      if (item) Object.assign(item, payload);
      else state.todos.push(Object.assign({ id: uid('td'), author: session.activeUser, done: false, createdAt: Date.now() }, payload));
      saveState();
      closeSheet(true);
      if (session.page !== 'checklist') navigate('checklist');
      else refreshPage(true);
      toast(item ? '清单更新啦' : '已放进共同清单', '✅');
      return;
    }
    if (type === 'visit') {
      const editId = form.dataset.edit;
      const item = editId ? state.visits.find(function (x) { return x.id === editId; }) : null;
      const city = val('city');
      const date = val('date');
      if (!city) { sheetError(form, '写一下去过的城市。'); return; }
      if (!date) { sheetError(form, '选一下去的日期。'); return; }
      const payload = {
        city: city, date: date, note: val('note'), author: val('author') === 'b' ? 'b' : 'a'
      };
      if (item) Object.assign(item, payload);
      else state.visits.push(Object.assign({ id: uid('v'), createdAt: Date.now() }, payload));
      saveState();
      closeSheet(true);
      if (session.page !== 'footprints') navigate('footprints');
      else refreshPage(true);
      toast(item ? '足迹更新啦' : '地图上多了一个地方', '📍');
      return;
    }
    if (type === 'countdown') {
      const editId = form.dataset.edit;
      const item = editId ? state.countdowns.find(function (x) { return x.id === editId; }) : null;
      const title = val('title');
      const date = val('date');
      if (!title) { sheetError(form, '给这个日子起个名字吧。'); return; }
      if (!date) { sheetError(form, '选一个日期吧。'); return; }
      const payload = {
        title: title,
        date: date,
        time: val('time') || '00:00',
        repeat: val('repeat') === 'once' ? 'once' : 'yearly',
        emoji: val('emoji') || '💗',
        note: val('note')
      };
      if (item) Object.assign(item, payload);
      else state.countdowns.push(Object.assign({ id: uid('cd'), author: session.activeUser, createdAt: Date.now() }, payload));
      saveState();
      closeSheet(true);
      if (session.page !== 'countdown') navigate('countdown');
      else refreshPage(true);
      toast(item ? '倒计时更新啦' : '开始等这个日子吧', '⏳');
      return;
    }
    if (type === 'profile') {
      const aName = val('aName');
      const bName = val('bName');
      if (!aName || !bName) { sheetError(form, '两个人的名字都要有。'); return; }
      state.users.a.name = aName.slice(0, 12);
      state.users.b.name = bName.slice(0, 12);
      state.users.a.birthday = val('aBirth');
      state.users.b.birthday = val('bBirth');
      state.users.a.mbti = val('aMbti').toUpperCase().slice(0, 4);
      state.users.b.mbti = val('bMbti').toUpperCase().slice(0, 4);
      state.users.a.avatar = val('aAvatar') || state.users.a.avatar;
      state.users.b.avatar = val('bAvatar') || state.users.b.avatar;
      state.meta.start = val('start') || dayKey();
      state.meta.ai = null;
      saveState();
      closeSheet(true);
      renderTopbar();
      refreshPage(true);
      toast('资料保存好啦', '🎀');
      return;
    }
    if (type === 'change-password') {
      const current = String(fd.get('current') || '');
      const next = String(fd.get('next') || '');
      const confirm = String(fd.get('confirm') || '');
      if (!verifyPassword(current)) { sheetError(form, '当前密码不对。'); return; }
      if (next.length < 4) { sheetError(form, '新密码至少要有 4 位。'); return; }
      if (next !== confirm) { sheetError(form, '两次输入的新密码不一样。'); return; }
      const salt = makeSalt();
      state.meta.password = { salt: salt, hash: hashPassword(next, salt) };
      state.meta.hint = val('hint').slice(0, 40);
      saveState();
      closeSheet(true);
      toast('小屋换了一把新锁', '🔐');
      return;
    }
    if (type === 'comment') {
      const postId = form.dataset.post;
      const p = state.statuses.find(function (x) { return x.id === postId; });
      if (!p) return;
      const text = val('text');
      if (!text) return;
      p.comments = p.comments || [];
      p.comments.push({ id: uid('c'), author: session.activeUser, text: text, createdAt: Date.now() });
      saveState();
      form.reset();
      session.openComments.add(postId);
      refreshPage(true);
      toast('评论送到啦', '💬');
      return;
    }
  }

  /* =========================================================
     Events
     ========================================================= */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    if (!action) return;
    e.preventDefault();
    try {
      handleAction(action, el, e);
    } catch (err) {
      console.error(err);
      toast('刚刚卡了一下，再试一次', '🥺');
    }
  });

  document.addEventListener('submit', function (e) {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    try {
      handleForm(form.dataset.form, form);
    } catch (err) {
      console.error(err);
      sheetError(form, '保存的时候卡了一下，再试一次。');
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'import-file') {
      readImportFile(e.target).catch(function (err) {
        console.error(err);
        toast('读取备份失败，换一个文件试试', '🥺');
      });
      return;
    }
    const musicInput = e.target.closest('[data-music-input]');
    if (musicInput) { importMusicFiles(musicInput); return; }
    const multi = e.target.closest('[data-images-input]');
    if (multi) { onImagesSelected(multi); return; }
    const input = e.target.closest('[data-image-input]');
    if (input) onImageSelected(input);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && session.sheetOpen) {
      closeSheet();
      return;
    }
    if (e.key === 'Tab' && session.sheetOpen) {
      const sheet = $modal.querySelector('.sheet');
      if (!sheet) return;
      const nodes = Array.from(sheet.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]')).filter(function (n) {
        return n.offsetParent !== null;
      });
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* =========================================================
     Boot
     ========================================================= */
  function boot() {
    state = loadState();
    if (state) saveState();
    if (state && state.meta && state.meta.setupComplete) {
      session.activeUser = state.meta.activeUser === 'b' ? 'b' : 'a';
      renderLock();
    } else {
      state = null;
      renderSetup(1);
    }
    window.scrollTo(0, 0);
    setInterval(tickCountdowns, 1000);
  }

  boot();
})();
