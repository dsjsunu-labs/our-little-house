(function () {
  'use strict';

  /* =========================================================
     Constants
     ========================================================= */
  const APP_VERSION = '1.7.0';
  const DATA_VERSION = 1;
  const STORAGE_KEY = 'our-little-house.data.v1';
  /* 旧版本使用的键名，保留读取以便已有小屋的数据自动迁移。 */
  const LEGACY_STORAGE_KEY = 'kitty-house.data.v1';
  const DAY = 86400000;
  const MAX_IMAGE_EDGE = 1100;

  const MOODS = [
    { emoji: '🥰', label: '甜甜' },
    { emoji: '🫶', label: '想你' },
    { emoji: '😌', label: '松弛' },
    { emoji: '😴', label: '累趴' },
    { emoji: '😤', label: '气气' },
    { emoji: '🤤', label: '干饭' },
    { emoji: '🫥', label: '放空' },
    { emoji: '🥳', label: '庆祝' },
    { emoji: '😭', label: '委屈' },
    { emoji: '💪', label: '加油' },
    { emoji: '🌙', label: '晚安' },
    { emoji: '☕', label: '摸鱼' }
  ];

  const REACTIONS = ['🥰', '😘', '🫶', '🥺', '😤'];

  const STICKERS = [
    { emoji: '🫂', label: '抱抱' },
    { emoji: '😽', label: '亲亲' },
    { emoji: '🥺', label: '求求' },
    { emoji: '😤', label: '哼' },
    { emoji: '🥳', label: '耶' },
    { emoji: '😴', label: '困困' },
    { emoji: '🍚', label: '干饭' },
    { emoji: '💗', label: '贴贴' }
  ];

  const AVATAR_LIST = [
    { id: 'mochi', label: '团子' },
    { id: 'bunny', label: '软糖兔兔' },
    { id: 'bear', label: '焦糖熊熊' },
    { id: 'gray', label: '灰灰猫猫' }
  ];

  const REPORT_TYPES = [
    { type: '到家啦', emoji: '🏠', sub: '让你放心', text: '我到家啦，放心。' },
    { type: '吃饭啦', emoji: '🍚', sub: '有好好吃饭', text: '吃饭啦，今天也有好好吃饭。' },
    { type: '出门啦', emoji: '🚪', sub: '出发一下', text: '出门啦，会想你的。' },
    { type: '下班啦', emoji: '💼', sub: '往你身边走', text: '下班啦，正在往你身边走。' },
    { type: '睡觉啦', emoji: '🌙', sub: '晚安好梦', text: '准备睡啦，晚安。' },
    { type: '想你啦', emoji: '💗', sub: '突然想你', text: '突然很想你。' }
  ];

  const QUOTES = [
    '爱不是一直看着对方，是一起看向同一个方向。',
    '把普通的日子，过得浪漫一点。',
    '想和你把三餐四季，都过成纪念日。',
    '小小的事情，也想第一个告诉你。',
    '今天也没有惊天动地，只是很喜欢你。',
    '慢慢来，反正我们有一整个以后。',
    '所谓安心，是知道有个人一直在。',
    '和你在一起，连发呆都算正事。',
    '愿我们都做对方疲惫生活里的软垫。',
    '不需要每天完美，只需要每天在。'
  ];

  const WEATHER_MOODS = [
    '适合抱抱', '有一点点想你', '宜一起吃饭', '把窗帘拉开吧',
    '适合窝在沙发里', '今天的风很温柔', '宜说一句喜欢', '慢慢来就好'
  ];

  const DRAMA_RECS = [
    { title: '请回答1988', emoji: '📺', platform: '韩剧TV', total: 20, note: '又哭又笑的下饭剧，适合一起把纸巾递来递去。' },
    { title: '去有风的地方', emoji: '🌿', platform: '芒果TV', total: 40, note: '像在云南慢吞吞地住了一个月。' },
    { title: '春色寄情人', emoji: '💐', platform: '腾讯视频', total: 21, note: '成年人之间温柔又克制的靠近。' },
    { title: '想见你', emoji: '🎧', platform: '腾讯视频', total: 26, note: '跨越时间的想念，适合一口气讨论到半夜。' },
    { title: '孤单又灿烂的神：鬼怪', emoji: '🌌', platform: '韩剧TV', total: 16, note: '冬天最适合重温的浪漫。' },
    { title: '甄嬛传', emoji: '🪷', platform: '优酷', total: 76, note: '常住下饭清单，永远能接上台词。' }
  ];

  const ZODIACS = [
    { id: 'aries', name: '白羊座', en: 'Aries', symbol: '♈', emoji: '🐏', element: 'fire', range: '03.21 — 04.19', traits: ['直球', '热情', '行动派'] },
    { id: 'taurus', name: '金牛座', en: 'Taurus', symbol: '♉', emoji: '🐮', element: 'earth', range: '04.20 — 05.20', traits: ['稳定', '会生活', '嘴硬心软'] },
    { id: 'gemini', name: '双子座', en: 'Gemini', symbol: '♊', emoji: '👯', element: 'air', range: '05.21 — 06.21', traits: ['有趣', '好奇', '话题制造机'] },
    { id: 'cancer', name: '巨蟹座', en: 'Cancer', symbol: '♋', emoji: '🦀', element: 'water', range: '06.22 — 07.22', traits: ['温柔', '念旧', '很会照顾人'] },
    { id: 'leo', name: '狮子座', en: 'Leo', symbol: '♌', emoji: '🦁', element: 'fire', range: '07.23 — 08.22', traits: ['大方', '要面子', '护短'] },
    { id: 'virgo', name: '处女座', en: 'Virgo', symbol: '♍', emoji: '🌾', element: 'earth', range: '08.23 — 09.22', traits: ['细致', '可靠', '嘴上挑剔'] },
    { id: 'libra', name: '天秤座', en: 'Libra', symbol: '♎', emoji: '⚖️', element: 'air', range: '09.23 — 10.23', traits: ['会审美', '怕失衡', '好相处'] },
    { id: 'scorpio', name: '天蝎座', en: 'Scorpio', symbol: '♏', emoji: '🦂', element: 'water', range: '10.24 — 11.22', traits: ['专一', '敏锐', '爱得深'] },
    { id: 'sagittarius', name: '射手座', en: 'Sagittarius', symbol: '♐', emoji: '🏹', element: 'fire', range: '11.23 — 12.21', traits: ['自由', '乐观', '说走就走'] },
    { id: 'capricorn', name: '摩羯座', en: 'Capricorn', symbol: '♑', emoji: '🐐', element: 'earth', range: '12.22 — 01.19', traits: ['靠谱', '慢热', '默默规划'] },
    { id: 'aquarius', name: '水瓶座', en: 'Aquarius', symbol: '♒', emoji: '🫧', element: 'air', range: '01.20 — 02.18', traits: ['独特', '清醒', '需要空间'] },
    { id: 'pisces', name: '双鱼座', en: 'Pisces', symbol: '♓', emoji: '🐟', element: 'water', range: '02.19 — 03.20', traits: ['浪漫', '共情', '爱做梦'] }
  ];

  const ELEMENTS = {
    fire: { label: '火象', color: '#d66a72', soft: '#fbe0dd', emoji: '🔥', nature: '热烈、直接、靠行动确认爱' },
    earth: { label: '土象', color: '#a2784d', soft: '#f6ead8', emoji: '🌾', nature: '稳定、务实、把爱放进细节' },
    air: { label: '风象', color: '#7d79a8', soft: '#ece8f6', emoji: '🫧', nature: '轻盈、会聊、需要精神共振' },
    water: { label: '水象', color: '#5c8a91', soft: '#e2f0f0', emoji: '🌊', nature: '敏感、共情、用感受记住爱' }
  };

  const GOOD_FORTUNES = [
    '把想说的话直接说出口', '一起做一顿慢吞吞的晚饭', '散步时不看手机',
    '给对方带一杯热饮', '认真夸对方三句', '拍一张今天的合照',
    '把“谢谢”换成“有你真好”', '拥抱二十秒再各忙各的', '分享一首今天循环的歌',
    '一起把一个小愿望打上勾'
  ];
  const BAD_FORTUNES = [
    '翻旧账', '用冷战代替沟通', '在饿的时候讨论严肃问题',
    '拿别人和 TA 比较', '已读不回', '深夜做重大决定',
    '把“随便”当成回答', '在小事上争输赢', '假装自己不在意',
    '把情绪憋到第二天'
  ];
  const CAUTIONS = [
    '今天的小情绪容易被放大，先抱一下，再讲道理。',
    '你们对“及时回复”的期待可能不一样，直接说出你的需要。',
    '别用试探代替表达，想见就说想见。',
    '一个人想安静，一个人想靠近，先约定一个“我需要缓一缓”的暗号。',
    '计划赶不上变化时，先照顾感受，再讨论安排。',
    '不要把对方的付出当成理所当然，今天记得说一次谢谢。',
    '有点吃醋的时候，坦白比阴阳怪气更有用。',
    '忙起来也留一句“我在”，安全感就藏在这三个字里。'
  ];

  const AI_TYPES = {
    fire: {
      titles: ['热烈直球的小太阳', '嘴硬心软的爆米花', '一被夸就发光的小火苗'],
      tags: ['直球', '护短', '行动派', '情绪来得快'],
      desc: [
        '你是那种喜欢就会让对方知道的人，开心和在意都藏不太住。',
        '你不太擅长绕弯子，喜欢一个人就会想对 TA 好，也很容易被真诚打动。',
        '你身上有一股往前走的劲儿，遇到喜欢的人和事，会主动靠近。'
      ],
      quirk: [
        '被忽略的时候会先装作没事，等对方来发现。',
        '嘴上说“随便”，心里其实有一个很想要的答案。',
        '生气时语速会变快，但消气也快，最吃“好好哄”这一套。'
      ],
      love: [
        '你给爱的方式是行动，是“我来”，是第一时间站在对方那边。',
        '你需要被明确地选择、被大方地偏爱。',
        '对你来说，喜欢是藏不住的，也是需要回应的。'
      ]
    },
    earth: {
      titles: ['奶油系可靠小动物', '慢热但超长情的小树', '把爱放进细节的实干家'],
      tags: ['稳定', '长情', '细节控', '慢热'],
      desc: [
        '你不轻易许诺，但答应的事会认真做到。你的爱更像慢慢升温的热牛奶。',
        '你习惯把在意放进细节里：记得口味、记得日期、记得对方随口说过的话。',
        '你对关系有自己的节奏，不喜欢悬空的感觉，更喜欢确定和踏实。'
      ],
      quirk: [
        '明明很在意，却常常只说一句“都行”。',
        '会默默扣分，等攒够了才一次性说出来。',
        '不太会撒娇，但很吃对方主动靠近。'
      ],
      love: [
        '你给爱的方式是陪伴和照顾，是把日子一点点搭稳。',
        '你需要看得见的回应，和不会被轻易打乱的日常。',
        '对你来说，长久比轰烈更动人。'
      ]
    },
    air: {
      titles: ['轻盈会聊的小风筝', '脑内小剧场导演', '有点跳脱的浪漫观察员'],
      tags: ['会聊', '有趣', '需要空间', '脑洞大'],
      desc: [
        '你靠交流和共鸣确认关系，聊得来对你来说非常重要。',
        '你有很多小想法，喜欢把普通的事讲出好玩的角度，也很会接住别人的情绪。',
        '你需要一点自己的空间，但那不代表你不在意，恰恰相反，你在意精神上的靠近。'
      ],
      quirk: [
        '容易想很多，却不一定第一时间说。',
        '偶尔突然安静，其实是在整理自己的小宇宙。',
        '被误解时会先用玩笑挡一下，再认真解释。'
      ],
      love: [
        '你给爱的方式是分享，是把看到的世界第一时间发给对方。',
        '你需要被理解、被认真倾听，也需要呼吸的空间。',
        '对你来说，灵魂同频比形式浪漫更重要。'
      ]
    },
    water: {
      titles: ['软乎乎的情绪收藏家', '共情力满格的小海豚', '把爱藏进细节的月光'],
      tags: ['敏感', '共情', '浪漫', '记感受'],
      desc: [
        '你对情绪的感知很细，别人语气里的一点变化，你都能听出来。',
        '你很会照顾人，也很容易把对方的情绪背到自己身上。',
        '你相信感觉，很多答案不在道理里，而在那个拥抱的温度里。'
      ],
      quirk: [
        '会反复回放一句无心的话，然后自己悄悄难过。',
        '需要被确认，却常常不好意思直接问。',
        '嘴上说“没关系”，其实很希望对方再坚持一下。'
      ],
      love: [
        '你给爱的方式是共情和记得，是“我懂你”。',
        '你需要稳定的回应和温柔的表达，细节对你很重要。',
        '对你来说，被看见、被接住，就是最深的浪漫。'
      ]
    }
  };

  const ELEMENT_PAIR = {
    'fire-fire': 84, 'earth-earth': 86, 'air-air': 83, 'water-water': 88,
    'fire-air': 93, 'air-fire': 93, 'earth-water': 92, 'water-earth': 92,
    'fire-earth': 68, 'earth-fire': 68, 'air-water': 63, 'water-air': 63,
    'fire-water': 61, 'water-fire': 61, 'earth-air': 66, 'air-earth': 66
  };

  /* =========================================================
     Icons
     ========================================================= */
  const ICONS = {
    home: '<path d="M3.5 10.7 12 3.5l8.5 7.2"/><path d="M5.5 9.5v9a1.5 1.5 0 0 0 1.5 1.5h3v-5.5h4V20h3a1.5 1.5 0 0 0 1.5-1.5v-9"/>',
    report: '<path d="M20 11.5a7.6 7.6 0 0 1-8 7.5 8.5 8.5 0 0 1-3-.55L4 20l1.3-3.7A7.2 7.2 0 0 1 4 11.5 7.6 7.6 0 0 1 12 4a7.6 7.6 0 0 1 8 7.5Z"/><path d="m8.8 11.6 2 2 4.4-4.4"/>',
    food: '<path d="M4 11h16"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M8.4 7.7c0-1.3 1-1.7 1-3M12 7.7c0-1.4 1-1.8 1-3.4M15.6 7.7c0-1.3 1-1.7 1-3"/><path d="M3.5 11h17"/><path d="M7 18.5h10"/>',
    travel: '<path d="M21 3 3 10.5l6.2 2.3L11.5 19 15 13.5 21 3Z"/><path d="m9.2 12.8 4.3-4.3"/>',
    us: '<path d="M12 20s-7-4.3-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.7 12 20 12 20Z"/><path d="M8.5 6.2a2.5 2.5 0 0 1 2.4 1.8M15.5 6.2a2.5 2.5 0 0 0-2.4 1.8"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/><path d="M12 14.5v2"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    heart: '<path d="M20.5 5.5a5 5 0 0 0-7.1 0L12 6.9l-1.4-1.4a5 5 0 0 0-7.1 7.1L12 21l8.5-8.4a5 5 0 0 0 0-7.1Z"/>',
    comment: '<path d="M20 11.5a7.6 7.6 0 0 1-8 7.5 8.5 8.5 0 0 1-3-.55L4 20l1.3-3.7A7.2 7.2 0 0 1 4 11.5 7.6 7.6 0 0 1 12 4a7.6 7.6 0 0 1 8 7.5Z"/>',
    send: '<path d="m21 3-7.3 18-3.1-7.6L3 10.3 21 3Z"/><path d="m10.6 13.4 4.4-4.4"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 13h9.4l.8-13"/><path d="M10 11v5M14 11v5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 6.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.6 2.6L16.5 9"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    link: '<path d="M10.5 13.5a4.5 4.5 0 0 0 6.4 0l2.2-2.2a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M13.5 10.5a4.5 4.5 0 0 0-6.4 0l-2.2 2.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
    calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3v5M16.5 3v5M3.5 10.5h17"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.2 2"/>',
    mapPin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    camera: '<path d="M4 8h3l1.4-2h7.2L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 5-5 4 4 2.5-2.5L20 18"/>',
    sparkles: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m19 14 .7 2.1 2.1.7-2.1.7L19 20l-.7-2.5-2.1-.7 2.1-.7L19 14Z"/><path d="m5.5 14 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
    tv: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="m8 21 4-3 4 3M8.5 3.5 12 6l3.5-2.5"/>',
    video: '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.9l.06.06-2.4 2.4-.06-.06a1.7 1.7 0 0 0-1.9-.34 1.7 1.7 0 0 0-1 1.55V21h-3.4v-.08a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.9.34l-.06.06-2.4-2.4.06-.06A1.7 1.7 0 0 0 5 15a1.7 1.7 0 0 0-1.55-1H3.4v-3.4h.08A1.7 1.7 0 0 0 5 9.5a1.7 1.7 0 0 0-.34-1.9l-.06-.06 2.4-2.4.06.06A1.7 1.7 0 0 0 9 5.54h.06A1.7 1.7 0 0 0 10.1 4V3.9h3.4V4a1.7 1.7 0 0 0 1.05 1.55 1.7 1.7 0 0 0 1.9-.34l.06-.06 2.4 2.4-.06.06A1.7 1.7 0 0 0 18.5 9.5c.12.64.65 1.12 1.3 1.18h.08v3.4h-.08A1.7 1.7 0 0 0 19.4 15Z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l2 2M18 5l2 2"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
    upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>',
    shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.7 7.5 9 4.3-1.3 7.5-4.5 7.5-9V6L12 3Z"/><path d="m8.7 12 2.2 2.2 4.4-4.4"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/><path d="M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    logout: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"/><path d="M14 8l4 4-4 4M8 12h10"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.3 2.9M6.5 7.3C3.9 9 2.5 12 2.5 12S6 18 12 18a10 10 0 0 0 4.1-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 8A7 7 0 0 1 19 10.5M17.9 16A7 7 0 0 1 5 13.5"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    random: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6M4 4l5 5"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/>',
    tag: '<path d="M20 13 11 4H4v7l9 9 7-7Z"/><circle cx="7.5" cy="7.5" r="1.2"/>'
  };

  function icon(name, size) {
    const s = size || 20;
    const fillIcons = { heart: true, play: true };
    const attrs = fillIcons[name]
      ? 'fill="currentColor" stroke="none"'
      : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true" ' + attrs + '>' + (ICONS[name] || '') + '</svg>';
  }

  function bowSvg(className) {
    return '<svg class="' + (className || '') + '" viewBox="0 0 64 48" aria-hidden="true">' +
      '<path d="M31 22C20 8 3 11 6 26c2 12 18 9 25 0Z" fill="#e35d77"/>' +
      '<path d="M33 22c11-14 28-11 25 4-2 12-18 9-25 0Z" fill="#e35d77"/>' +
      '<path d="M17 19c5-3 10-1 13 4-5 5-11 5-15 0-1-2 0-3 2-4Z" fill="#f58ba0" opacity=".55"/>' +
      '<circle cx="32" cy="23" r="6.5" fill="#c9445f"/><circle cx="32" cy="23" r="2.4" fill="#f8c7d1"/>' +
      '<path d="M28 28c-3 5-5 10-4 15M36 28c3 5 5 10 4 15" fill="none" stroke="#c9445f" stroke-width="2.6" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* =========================================================
     Original mascots (inline SVG)
     ========================================================= */
  const AVATAR_CONFIGS = {
    mochi: { bg: '#eaf6ee', fur: '#fbe0c2', inner: '#ffc9b2', bow: '#6cc3a6', bowDeep: '#3f9c7e', kind: 'cat' },
    bunny: { bg: '#e4f2ea', fur: '#fff9ef', inner: '#ffd0d9', bow: '#8bb4d4', bowDeep: '#628eaf', kind: 'bunny' },
    bear: { bg: '#fff0d2', fur: '#d9a46e', inner: '#f2c99f', bow: '#7da6c5', bowDeep: '#5c829f', kind: 'bear' },
    gray: { bg: '#eee7f5', fur: '#bda9b1', inner: '#e6c8d1', bow: '#e8be58', bowDeep: '#c59b33', kind: 'cat' }
  };

  function starClipSvg(x, y, scale) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ') rotate(10)">' +
      '<path d="M0-12 3.9-4 12.6-2.7 6.2 3.3 7.8 11.7 0 7.6-7.8 11.7-6.2 3.3-12.6-2.7-3.9-4Z" fill="#f2c94f" stroke="#d8a93f" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="M0-7.4 2.4-2.5 7.7-1.7 3.8 2-4.6 7.2-3.8 1.1-7.7-1.7-2.4-2.5Z" fill="#ffe38f" opacity=".75"/>' +
      '</g>';
  }

  /* 原创小猫脸：奶油色虎斑猫，星星发夹 + 薄荷领巾，头心在 (50,59)。 */
  function catFace(c) {
    const ink = '#4a3a33';
    return '<path d="M26 42 17 14 43 28Z" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.7" stroke-linejoin="round"/>' +
      '<path d="M74 42 83 14 57 28Z" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.7" stroke-linejoin="round"/>' +
      '<path d="M29.5 37 22.5 21 37 29.5Z" fill="' + c.inner + '" opacity=".7"/>' +
      '<path d="M70.5 37 77.5 21 63 29.5Z" fill="' + c.inner + '" opacity=".7"/>' +
      '<ellipse cx="50" cy="59" rx="34" ry="29" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.7"/>' +
      '<path d="M41 35q3 7 2 12M50 34v14M59 35q-3 7-2 12" fill="none" stroke="' + c.inner + '" stroke-width="2.8" stroke-linecap="round" opacity=".8"/>' +
      '<ellipse cx="37" cy="57" rx="4.2" ry="5.6" fill="' + ink + '"/>' +
      '<ellipse cx="63" cy="57" rx="4.2" ry="5.6" fill="' + ink + '"/>' +
      '<circle cx="35.6" cy="55" r="1.3" fill="#fff" opacity=".9"/>' +
      '<circle cx="61.6" cy="55" r="1.3" fill="#fff" opacity=".9"/>' +
      '<ellipse cx="26" cy="66" rx="4.4" ry="2.6" fill="' + c.inner + '" opacity=".55"/>' +
      '<ellipse cx="74" cy="66" rx="4.4" ry="2.6" fill="' + c.inner + '" opacity=".55"/>' +
      '<path d="M46.5 64.5q3.5-2 7 0-3.5 4-7 0Z" fill="#ef8f9c"/>' +
      '<path d="M50 68v2M50 70q-2.4 1.8-4 0M50 70q2.4 1.8 4 0" fill="none" stroke="' + ink + '" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M16 57h15M15 64h15M17 71l14-3M84 57H69M85 64H70M83 71l-14-3" stroke="' + ink + '" stroke-width="1.4" stroke-linecap="round" opacity=".65"/>' +
      starClipSvg(73, 27, 1);
  }

  function avatarSvg(id) {
    const c = AVATAR_CONFIGS[id] || AVATAR_CONFIGS.mochi;
    const ink = '#5a4047';
    const eye = '#413034';
    const shine = '#fffdf9';
    const bow = function (x, y, rot, scale) {
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + scale + ')">' +
        '<path d="M0 2C-9-7-19-2-12 6-7 11-1 8 0 4Z" fill="' + c.bow + '"/>' +
        '<path d="M2 2C11-7 21-2 14 6 9 11 3 8 2 4Z" fill="' + c.bow + '"/>' +
        '<path d="M-1 6C-4 10-5 14-4 17M4 6C7 10 8 14 7 17" fill="none" stroke="' + c.bowDeep + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="1" cy="3" r="3.1" fill="' + c.bowDeep + '"/>' +
        '<circle cx="-0.2" cy="2" r="1" fill="#fff" opacity=".55"/>' +
        '</g>';
    };
    let face = '';
    if (c.kind === 'cat') {
      face = catFace(c);
    } else if (c.kind === 'bunny') {
      face = '<ellipse cx="35" cy="27" rx="9.5" ry="22" transform="rotate(-8 35 27)" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.5"/>' +
        '<ellipse cx="65" cy="27" rx="9.5" ry="22" transform="rotate(8 65 27)" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.5"/>' +
        '<ellipse cx="36" cy="26" rx="4" ry="14" transform="rotate(-8 36 26)" fill="' + c.inner + '" opacity=".64"/>' +
        '<ellipse cx="64" cy="26" rx="4" ry="14" transform="rotate(8 64 26)" fill="' + c.inner + '" opacity=".64"/>' +
        '<ellipse cx="50" cy="61" rx="31" ry="27" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.5"/>' +
        '<ellipse cx="38" cy="58" rx="4" ry="5" fill="' + eye + '"/>' +
        '<ellipse cx="62" cy="58" rx="4" ry="5" fill="' + eye + '"/>' +
        '<circle cx="36.7" cy="56" r="1.4" fill="' + shine + '"/>' +
        '<circle cx="60.7" cy="56" r="1.4" fill="' + shine + '"/>' +
        '<ellipse cx="31" cy="67" rx="4.5" ry="2.6" fill="' + c.inner + '" opacity=".55"/>' +
        '<ellipse cx="69" cy="67" rx="4.5" ry="2.6" fill="' + c.inner + '" opacity=".55"/>' +
        '<path d="M47 65C48.5 63.5 51.5 63.5 53 65 51.5 67.6 48.5 67.6 47 65Z" fill="#eaa0ad"/>' +
        '<path d="M50 68V69.5M50 69.5C48.5 71 47 70.2 46.3 69.4M50 69.5C51.5 71 53 70.2 53.7 69.4" fill="none" stroke="' + ink + '" stroke-width="1.4" stroke-linecap="round"/>' +
        bow(72, 29, 12, .92);
    } else {
      face = '<circle cx="27" cy="34" r="11.5" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.5"/>' +
        '<circle cx="73" cy="34" r="11.5" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.5"/>' +
        '<circle cx="27" cy="34" r="5" fill="' + c.inner + '" opacity=".62"/>' +
        '<circle cx="73" cy="34" r="5" fill="' + c.inner + '" opacity=".62"/>' +
        '<ellipse cx="50" cy="59" rx="32" ry="28" fill="' + c.fur + '" stroke="' + ink + '" stroke-width="2.5"/>' +
        '<ellipse cx="38" cy="56" rx="4" ry="5" fill="' + eye + '"/>' +
        '<ellipse cx="62" cy="56" rx="4" ry="5" fill="' + eye + '"/>' +
        '<circle cx="36.7" cy="54" r="1.4" fill="' + shine + '"/>' +
        '<circle cx="60.7" cy="54" r="1.4" fill="' + shine + '"/>' +
        '<ellipse cx="50" cy="67" rx="11" ry="7.5" fill="' + c.inner + '" opacity=".65"/>' +
        '<ellipse cx="50" cy="64.5" rx="3.2" ry="2.2" fill="' + eye + '"/>' +
        '<path d="M50 66.5V68.5M50 68.5C48.5 70 47 69.3 46.3 68.5M50 68.5C51.5 70 53 69.3 53.7 68.5" fill="none" stroke="' + ink + '" stroke-width="1.4" stroke-linecap="round"/>' +
        '<ellipse cx="29" cy="65" rx="4.2" ry="2.5" fill="' + c.inner + '" opacity=".5"/>' +
        '<ellipse cx="71" cy="65" rx="4.2" ry="2.5" fill="' + c.inner + '" opacity=".5"/>' +
        bow(72, 31, 12, .9);
    }
    return '<svg viewBox="0 0 100 100" role="img" aria-label="小屋头像">' +
      '<circle cx="50" cy="50" r="50" fill="' + c.bg + '"/>' +
      '<circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/>' +
      '<circle cx="35" cy="29" r="24" fill="#ffffff" opacity=".12"/>' +
      face +
      '</svg>';
  }

  function avatarHtml(user, cls) {
    return '<span class="avatar ' + (cls || '') + '">' + avatarSvg(user && user.avatar) + '</span>';
  }

  function avatarById(id, cls) {
    return '<span class="avatar ' + (cls || '') + '">' + avatarSvg(id) + '</span>';
  }

  /* 小屋的看门小猫「团子」：整只原创 SVG，无位图。 */
  function mascotSvg() {
    const c = AVATAR_CONFIGS.mochi;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="28 8 164 252" role="img" aria-label="小屋的小猫团子">' +
      '<ellipse cx="100" cy="243" rx="60" ry="11" fill="#d9b9a8" opacity=".38"/>' +
      '<path d="M150 196q30-4 28-40" fill="none" stroke="#f6cfa4" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="M177 162q3-6 1-10" fill="none" stroke="#fff8ec" stroke-width="13" stroke-linecap="round"/>' +
      '<ellipse cx="78" cy="225" rx="16" ry="9" fill="#fff8ec"/>' +
      '<ellipse cx="122" cy="225" rx="16" ry="9" fill="#fff8ec"/>' +
      '<path d="M64 122q0-12 14-16h44q14 4 14 16l14 78q-50 16-100 0Z" fill="#8fd6ba"/>' +
      '<path d="M50 200q50 16 100 0l-3 15q-47 14-94 0Z" fill="#fff8ec"/>' +
      '<path d="M64 122q36 12 72 0l3 13q-39 13-78 0Z" fill="#fff8ec"/>' +
      '<path d="M118 136q13 4 13 22l-11 2q0-14-9-18Z" fill="#fff8ec"/>' +
      '<ellipse cx="68" cy="172" rx="12" ry="9" fill="' + c.fur + '"/>' +
      '<ellipse cx="132" cy="172" rx="12" ry="9" fill="' + c.fur + '"/>' +
      '<g transform="translate(100 78) scale(1.35) translate(-50 -59)">' + catFace(c) + '</g>' +
      '</svg>';
  }

  function mascotFullHtml() {
    return '<img class="mascot-photo mascot-full" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(mascotSvg()) + '" alt="小屋的小猫团子">';
  }

  function constellationSvg(className) {
    return '<svg class="' + (className || '') + '" viewBox="0 0 120 90" aria-hidden="true" fill="none">' +
      '<path d="M8 69 31 43l20 12 20-31 20 16 20-23" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4" opacity=".65"/>' +
      '<g fill="currentColor"><circle cx="8" cy="69" r="2"/><circle cx="31" cy="43" r="2.8"/><circle cx="51" cy="55" r="1.8"/><circle cx="71" cy="24" r="3"/><circle cx="91" cy="40" r="1.8"/><circle cx="111" cy="17" r="2.3"/></g>' +
      '<path d="M64 12 66 17l5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="currentColor" opacity=".55"/>' +
      '</svg>';
  }

  function travelMapSvg() {
    return '<svg class="travel-map" viewBox="0 0 480 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none">' +
      '<g stroke="#9ab8a8" stroke-width="1" opacity=".42">' +
      '<path d="M-20 45c58-18 75 25 122 12s68-43 120-22 63 52 112 35 93-6 166 17"/>' +
      '<path d="M-12 75c60-15 72 19 118 9s67-37 118-17 64 43 112 29 92-4 156 14"/>' +
      '<path d="M-20 118c55-21 78 8 121-4s64-33 115-14 68 35 115 24 88-1 156 20"/>' +
      '<path d="M-20 160c56-17 76 9 120-2s66-29 114-10 66 29 113 20 92 2 160 21"/>' +
      '<path d="M-10 201c52-12 74 7 116-2s68-21 116-6 70 21 118 14 82 4 148 16"/>' +
      '</g>' +
      '<g stroke="#8aae9c" stroke-width=".7" opacity=".29">' +
      '<ellipse cx="90" cy="120" rx="74" ry="34" transform="rotate(-14 90 120)"/>' +
      '<ellipse cx="90" cy="120" rx="51" ry="21" transform="rotate(-14 90 120)"/>' +
      '<ellipse cx="380" cy="70" rx="60" ry="27" transform="rotate(17 380 70)"/>' +
      '<ellipse cx="380" cy="70" rx="38" ry="16" transform="rotate(17 380 70)"/>' +
      '</g>' +
      '<path d="M58 175C125 138 147 179 205 151s77-74 122-58 53 67 96 48" stroke="#d68c99" stroke-width="1.6" stroke-dasharray="3 6"/>' +
      '<g><circle cx="58" cy="175" r="4" fill="#d68c99"/><circle cx="58" cy="175" r="8" stroke="#d68c99" opacity=".3"/>' +
      '<path d="M323 87c0-15 20-15 20 0 0 11-10 20-10 20s-10-9-10-20Z" fill="#d68c99"/><circle cx="333" cy="87" r="3.2" fill="#fff8f2"/>' +
      '<path d="M204 151c0-13 18-13 18 0 0 10-9 18-9 18s-9-8-9-18Z" fill="#7fa892"/><circle cx="213" cy="151" r="2.8" fill="#fff8f2"/>' +
      '</g>' +
      '<g stroke="#b7a183" stroke-width="1" opacity=".7"><path d="M406 185v-24M406 161l-8 6M406 161l8 6"/></g>' +
      '<text x="416" y="197" fill="#a8947d" font-size="8" font-family="Arial" letter-spacing="2">N</text>' +
      '</svg>';
  }

  /* =========================================================
     DOM + session
     ========================================================= */
  const $app = document.getElementById('app');
  const $modal = document.getElementById('modal-root');
  const $toast = document.getElementById('toast-root');

  let state = null;
  const session = {
    unlocked: false,
    page: 'home',
    activeUser: 'a',
    feedFilter: 'all',
    foodType: 'restaurant',
    travelType: 'place',
    dramaFilter: 'all',
    memoryFilter: 'all',
    reportFilter: 'all',
    calendarMonth: dayKey().slice(0, 7),
    recapMonth: dayKey().slice(0, 7),
    checklistFilter: 'all',
    musicPlaying: false,
    openComments: new Set(),
    stickerFor: null,
    showAllFeed: false,
    tempImage: '',
    tempImages: [],
    sheetOpen: false,
    confirm: null,
    aiLoading: false,
    lastFocus: null,
    setup: {
      step: 1,
      password: '',
      hint: '',
      aName: '泡泡',
      bName: '小明',
      aBirth: '',
      bBirth: '',
      aAvatar: 'mochi',
      bAvatar: 'bunny',
      start: ''
    }
  };

  /* =========================================================
     Utilities
     ========================================================= */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function startOfDay(ts) {
    const d = new Date(ts || Date.now());
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function dayKey(ts) {
    const d = new Date(ts || Date.now());
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseDate(str) {
    if (!str) return null;
    const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  function fmtDate(ts) {
    const d = new Date(ts);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function fmtDateLong(ts) {
    const d = new Date(ts);
    const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · 周' + week;
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function fmtDateTime(ts) {
    return fmtDate(ts) + ' ' + fmtTime(ts);
  }

  function relTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < DAY) return Math.floor(diff / 3600000) + ' 小时前';
    if (diff < DAY * 7) return Math.floor(diff / DAY) + ' 天前';
    return fmtDate(ts);
  }

  function groupLabel(ts) {
    const today = startOfDay(Date.now());
    const target = startOfDay(ts);
    if (target === today) return '今天';
    if (target === today - DAY) return '昨天';
    if (target === today - DAY * 2) return '前天';
    return fmtDate(ts);
  }

  function getDayInfo() {
    const start = parseDate(state && state.meta && state.meta.start);
    if (!start) {
      return { count: 1, label: '从今天开始', nextDays: null, nextLabel: '把今天写成第一天', startYear: new Date().getFullYear(), isToday: false };
    }
    const startMs = startOfDay(start.getTime());
    const today = startOfDay(Date.now());
    const count = Math.max(1, Math.floor((today - startMs) / DAY) + 1);
    const next = new Date(today);
    next.setMonth(start.getMonth(), start.getDate());
    next.setHours(0, 0, 0, 0);
    if (next.getTime() < today) next.setFullYear(next.getFullYear() + 1);
    const nextDays = Math.round((next.getTime() - today) / DAY);
    let nextLabel;
    if (nextDays === 0) nextLabel = '今天是纪念日';
    else if (nextDays === 1) nextLabel = '明天是我们的纪念日';
    else nextLabel = '距离纪念日还有 ' + nextDays + ' 天';
    return { count: count, label: '第 ' + count + ' 天', nextDays: nextDays, nextLabel: nextLabel, startYear: start.getFullYear(), isToday: nextDays === 0 };
  }

  function quoteOfDay(offset) {
    return QUOTES[(hashString(dayKey() + 'quote') + (offset || 0)) % QUOTES.length];
  }

  function atmosphere() {
    return WEATHER_MOODS[hashString(dayKey() + 'weather') % WEATHER_MOODS.length];
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0);
  }

  function pick(list, seed, offset) {
    if (!list || !list.length) return '';
    const n = Math.abs((Number(seed) || 0) + (offset || 0));
    return list[n % list.length];
  }

  function seeded(seed) {
    let t = Math.abs(Number(seed) || 1) % 2147483647;
    if (t <= 0) t += 2147483646;
    return function () {
      t = (t * 16807) % 2147483647;
      return (t - 1) / 2147483646;
    };
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  function normalizeUrl(raw) {
    let s = String(raw || '').trim();
    if (!s) return '';
    const m = s.match(/https?:\/\/[^\s<>"']+/i);
    if (m) s = m[0];
    else if (/^(www\.|m\.|v\.|b23\.tv)/i.test(s)) s = 'https://' + s;
    else if (!/^[a-z][a-z0-9+.-]*:/i.test(s) && /^[\w-]+(\.[\w-]+)+/.test(s)) s = 'https://' + s;
    s = s.replace(/[，。！？；、]+$/g, '').replace(/[)\]}>]+$/g, '');
    try {
      const u = new URL(s);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
      return u.href;
    } catch (e) {
      return '';
    }
  }

  function platformOf(url) {
    const u = String(url || '').toLowerCase();
    if (/douyin\.com|iesdouyin\.com/.test(u)) return { id: 'douyin', label: '抖音', emoji: '🎵' };
    if (/weixin\.qq\.com|channels\.weixin\.qq\.com|finder\.video\.qq\.com|mp\.weixin\.qq\.com/.test(u)) return { id: 'wechat', label: '微信', emoji: '💬' };
    if (/bilibili\.com|b23\.tv/.test(u)) return { id: 'bilibili', label: 'B站', emoji: '📺' };
    if (/xiaohongshu\.com|xhslink\.com/.test(u)) return { id: 'xhs', label: '小红书', emoji: '📕' };
    if (/kuaishou\.com/.test(u)) return { id: 'kuaishou', label: '快手', emoji: '⚡' };
    if (/weibo\.com/.test(u)) return { id: 'weibo', label: '微博', emoji: '🌤️' };
    return { id: 'web', label: '链接', emoji: '🔗' };
  }

  function linkChip(url) {
    const p = platformOf(url);
    return '<a class="link-chip" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + p.emoji + ' ' + p.label + ' ' + icon('external', 9) + '</a>';
  }

  function copyLink(url) {
    const text = String(url || '');
    if (!text) { toast('还没有可以复制的链接', '🔗'); return; }
    const done = function () { toast('链接已复制，去 App 里打开吧', '🔗'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      if (done) done();
    } catch (e) {
      toast('复制失败，长按链接手动复制吧', '🥺');
    }
  }

  function haptic(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) { /* noop */ }
  }

  function toast(message, emoji) {
    if (!$toast) return;
    while ($toast.children.length > 2) $toast.removeChild($toast.firstElementChild);
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="t-emoji">' + (emoji || '🎀') + '</span><span>' + esc(message) + '</span>';
    $toast.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 250);
    }, 2400);
  }

  function heartBurst(x, y, emoji, count) {
    const symbols = ['💗', '💕', '🎀', '✨', '💖'];
    for (let i = 0; i < (count || 5); i++) {
      const el = document.createElement('span');
      el.className = 'heart-fly';
      el.textContent = Math.random() > 0.55 ? (emoji || pick(symbols, Date.now() + i)) : pick(symbols, Date.now() + i * 3);
      const dx = (Math.random() - 0.5) * 130;
      const dy = -40 - Math.random() * 80;
      el.style.left = (x || window.innerWidth / 2) + 'px';
      el.style.top = (y || window.innerHeight * 0.5) + 'px';
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
      el.style.setProperty('--rot', (Math.random() * 90 - 45) + 'deg');
      el.style.animationDelay = (Math.random() * 0.12) + 's';
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 1100);
    }
  }

  function confetti() {
    const colors = ['#e35d77', '#f8e5ad', '#d5e9df', '#e6daf1', '#f5c6d1'];
    for (let i = 0; i < 22; i++) {
      const el = document.createElement('i');
      el.className = 'confetti';
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.top = (Math.random() * 26 + 4) + 'vh';
      el.style.background = colors[i % colors.length];
      el.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
      el.style.setProperty('--dy', (Math.random() * 240 + 120) + 'px');
      el.style.animationDelay = (Math.random() * 0.16) + 's';
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 1500);
    }
  }

  /* =========================================================
     SHA-256 (local door lock only)
     ========================================================= */
  function sha256(input) {
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const bytes = new TextEncoder().encode(String(input));
    const bitLen = bytes.length * 8;
    const paddedLen = (((bytes.length + 8) >> 6) + 1) * 64;
    const padded = new Uint8Array(paddedLen);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
    view.setUint32(paddedLen - 4, bitLen >>> 0, false);
    const rotr = function (x, n) { return (x >>> n) | (x << (32 - n)); };
    const w = new Uint32Array(64);
    for (let offset = 0; offset < paddedLen; offset += 64) {
      for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(function (n) { return n.toString(16).padStart(8, '0'); }).join('');
  }

  function makeSalt() {
    try {
      const arr = new Uint8Array(12);
      crypto.getRandomValues(arr);
      return Array.from(arr).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }

  function hashPassword(password, salt) {
    /* 口令哈希沿用最初的命名空间，换掉会让已经设置过的小屋打不开。 */
    return sha256('kitty-house::' + salt + '::' + password);
  }

  function verifyPassword(password) {
    if (!state || !state.meta || !state.meta.password) return false;
    return hashPassword(password, state.meta.password.salt) === state.meta.password.hash;
  }

  /* =========================================================
     Data helpers
     ========================================================= */
  function user(id) {
    return (state && state.users && (state.users[id] || state.users.a)) || null;
  }

  function currentUser() { return user(session.activeUser); }
  function partner(id) { return user((id || session.activeUser) === 'a' ? 'b' : 'a'); }

  function sortedStatuses() {
    return (state.statuses || []).slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
  }

  function filteredStatuses() {
    const all = sortedStatuses();
    if (session.feedFilter === 'all') return all;
    return all.filter(function (p) { return p.author === session.feedFilter; });
  }

  function reportCountForDay(ts) {
    const k = dayKey(ts);
    return state.reports.filter(function (r) { return dayKey(r.createdAt) === k; }).length;
  }

  function sampleCount() {
    return ['statuses', 'reports', 'foods', 'travels', 'dramas', 'memories', 'events', 'todos', 'visits'].reduce(function (n, key) {
      return n + (state[key] || []).filter(function (x) { return x.sample; }).length;
    }, 0);
  }

  function storageSize() {
    try { return new Blob([JSON.stringify(state)]).size; } catch (e) { return JSON.stringify(state).length; }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      toast('小屋空间满了，删掉一些照片再试试', '🥺');
      return false;
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== DATA_VERSION || !data.users || !data.meta) return null;
      return ensureState(data);
    } catch (e) {
      return null;
    }
  }

  function defaultCountdowns(data) {
    const year = new Date().getFullYear();
    const list = [
      { title: '情人节', date: year + '-02-14', time: '00:00', repeat: 'yearly', emoji: '💌', note: '每年都要过' },
      { title: '白色情人节', date: year + '-03-14', time: '00:00', repeat: 'yearly', emoji: '🤍', note: '回礼的日子' },
      { title: '520', date: year + '-05-20', time: '00:00', repeat: 'yearly', emoji: '💗', note: '今天也要说喜欢你' },
      { title: '圣诞节', date: year + '-12-25', time: '00:00', repeat: 'yearly', emoji: '🎄', note: '一起拆礼物' },
      { title: '跨年', date: year + '-12-31', time: '23:59', repeat: 'yearly', emoji: '🎆', note: '明年也在一起' }
    ];
    const start = parseDate(data.meta && data.meta.start);
    if (start) {
      list.push({
        title: '在一起纪念日',
        date: year + '-' + pad(start.getMonth() + 1) + '-' + pad(start.getDate()),
        time: '00:00', repeat: 'yearly', emoji: '💞', note: '我们的小小周年'
      });
    }
    ['a', 'b'].forEach(function (id) {
      const u = data.users && data.users[id];
      const b = parseDate(u && u.birthday);
      if (b) {
        list.push({
          title: (u.name || (id === 'a' ? '泡泡' : '小明')) + '生日',
          date: year + '-' + pad(b.getMonth() + 1) + '-' + pad(b.getDate()),
          time: '00:00', repeat: 'yearly', emoji: id === 'a' ? '🎂' : '🎈', note: '生日快乐'
        });
      }
    });
    return list.map(function (x) {
      return Object.assign({ id: uid('cd'), author: 'a', createdAt: Date.now(), sample: true }, x);
    });
  }

  function ensureState(data) {
    data.statuses = Array.isArray(data.statuses) ? data.statuses : [];
    data.reports = Array.isArray(data.reports) ? data.reports : [];
    data.foods = Array.isArray(data.foods) ? data.foods : [];
    data.travels = Array.isArray(data.travels) ? data.travels : [];
    data.dramas = Array.isArray(data.dramas) ? data.dramas : [];
    data.memories = Array.isArray(data.memories) ? data.memories : [];
    data.events = Array.isArray(data.events) ? data.events : [];
    data.todos = Array.isArray(data.todos) ? data.todos : [];
    data.visits = Array.isArray(data.visits) ? data.visits : [];
    data.musicTracks = Array.isArray(data.musicTracks) ? data.musicTracks : [];
    data.countdowns = Array.isArray(data.countdowns) ? data.countdowns : [];
    data.meta = data.meta || {};
    data.meta.ai = data.meta.ai || null;
    data.meta.currentMusicId = data.meta.currentMusicId || 'builtin';
    data.meta.activeUser = data.meta.activeUser === 'b' ? 'b' : 'a';
    data.users = data.users || {};
    ['a', 'b'].forEach(function (id) {
      const u = data.users[id] || {};
      u.id = id;
      u.name = u.name || (id === 'a' ? '泡泡' : '小明');
      if (u.name === '小桃') u.name = '泡泡';
      if (u.name === '小满' || u.name === '阿澈') u.name = '小明';
      if (u.avatar === 'kitty') u.avatar = 'mochi';
      u.avatar = AVATAR_CONFIGS[u.avatar] ? u.avatar : (id === 'a' ? 'mochi' : 'bunny');
      u.birthday = u.birthday || '';
      u.mbti = u.mbti || '';
      u.now = u.now || { text: '', mood: '', activity: '', place: '', updatedAt: 0 };
      delete u.now.song;
      data.users[id] = u;
    });
    data.statuses.forEach(function (p) {
      p.reactions = p.reactions || {};
      p.comments = Array.isArray(p.comments) ? p.comments : [];
      p.images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      if (p.image && p.images.length === 0) p.images.push(p.image);
      delete p.image;
      p.mood = p.mood || '';
      p.activity = p.activity || '';
      p.place = p.place || '';
      delete p.song;
    });
    data.reports.forEach(function (r) { r.emoji = r.emoji || '💌'; });
    data.foods.forEach(function (f) { f.tags = Array.isArray(f.tags) ? f.tags : []; f.done = !!f.done; f.rating = Number(f.rating) || 0; });
    data.travels.forEach(function (t) { t.done = !!t.done; });
    data.dramas.forEach(function (d) {
      d.total = Number(d.total) || 0;
      if (d.status === 'watching') d.status = 'want';
      d.status = d.status === 'done' ? 'done' : 'want';
      delete d.watched;
    });
    data.memories.forEach(function (m) { m.url = m.url || ''; m.image = m.image || ''; });
    data.events.forEach(function (e) {
      e.date = e.date || dayKey();
      e.type = e.type || 'date';
      e.title = e.title || '一个小约定';
    });
    data.todos.forEach(function (t) {
      t.category = t.category || '生活';
      t.done = !!t.done;
    });
    data.visits.forEach(function (v) {
      v.city = v.city || '';
      v.date = v.date || dayKey();
    });
    data.countdowns.forEach(function (c) {
      c.date = c.date || dayKey();
      c.time = c.time || '00:00';
      c.repeat = c.repeat === 'once' ? 'once' : 'yearly';
      c.emoji = c.emoji || '💗';
      c.title = c.title || '一个重要的日子';
      c.note = c.note || '';
      c.author = c.author === 'b' ? 'b' : 'a';
    });
    if (!data.meta.countdownSeeded) {
      data.countdowns = defaultCountdowns(data);
      data.meta.countdownSeeded = true;
    }
    return data;
  }

  /* =========================================================
     Seed data
     ========================================================= */
  function buildSeedState(draft) {
    const now = Date.now();
    const start = draft.start || dayKey(now);
    const aName = (draft.aName || '泡泡').trim().slice(0, 12);
    const bName = (draft.bName || '小明').trim().slice(0, 12);
    const salt = makeSalt();
    return {
      version: DATA_VERSION,
      createdAt: now,
      updatedAt: now,
      meta: {
        setupComplete: true,
        start: start,
        activeUser: 'a',
        password: { salt: salt, hash: hashPassword(draft.password, salt) },
        hint: (draft.hint || '').trim().slice(0, 40),
        ai: null,
        currentMusicId: 'builtin',
        countdownSeeded: false
      },
      users: {
        a: {
          id: 'a', name: aName, birthday: draft.aBirth || '', mbti: '', avatar: draft.aAvatar || 'mochi',
          now: {
            text: '下班路上看到一朵像小猫爪子的云，今天也有好好想你。',
            mood: '🥰', activity: '在路上', place: '回家路上',
            updatedAt: now - 2 * 3600000, sample: true
          }
        },
        b: {
          id: 'b', name: bName, birthday: draft.bBirth || '', mbti: '', avatar: draft.bAvatar || 'bunny',
          now: {
            text: '把冰箱塞满了你爱喝的葡萄汽水，等你回家。',
            mood: '🫶', activity: '在家', place: '家',
            updatedAt: now - 52 * 60000, sample: true
          }
        }
      },
      statuses: [
        {
          id: 'seed_s1', author: 'b', text: '把冰箱塞满了你爱喝的葡萄汽水，等你回家。',
          mood: '🫶', activity: '在家', place: '家', image: '',
          createdAt: now - 52 * 60000, reactions: { '🥰': ['a'] },
          comments: [{ id: 'seed_c1', author: 'a', text: '马上到家！给我留一瓶', createdAt: now - 38 * 60000 }],
          sample: true
        },
        {
          id: 'seed_s2', author: 'a', text: '下班路上看到一朵像小猫爪子的云，今天也有好好想你。',
          mood: '🥰', activity: '在路上', place: '回家路上', image: '',
          createdAt: now - 2 * 3600000, reactions: { '😘': ['b'], '🫶': ['b'] },
          comments: [], sample: true
        }
      ],
      reports: [
        { id: 'seed_r1', author: 'a', type: '到家啦', emoji: '🏠', text: '我到家啦，放心。', createdAt: now - 3 * 3600000, sample: true },
        { id: 'seed_r2', author: 'b', type: '吃饭啦', emoji: '🍚', text: '吃饭啦，今天也有好好吃饭。', createdAt: now - 5 * 3600000, sample: true },
        { id: 'seed_r3', author: 'b', type: '睡觉啦', emoji: '🌙', text: '准备睡啦，晚安。', createdAt: now - 25 * 3600000, sample: true },
        { id: 'seed_r4', author: 'a', type: '想你啦', emoji: '💗', text: '突然很想你。', createdAt: now - 29 * 3600000, sample: true }
      ],
      foods: [
        {
          id: 'seed_f1', type: 'restaurant', title: '巷口那家奶油乌冬',
          note: '冬天第一口热汤，想和你分一碗。', tags: ['日料', '小店'],
          link: '', image: '', author: 'a', done: false, rating: 0, createdAt: now - DAY, sample: true
        },
        {
          id: 'seed_f2', type: 'dish', title: '番茄牛腩',
          note: '周末一起做，少放辣。', tags: ['家常菜'],
          link: '', image: '', author: 'b', done: false, rating: 0, createdAt: now - 2 * DAY, sample: true
        },
        {
          id: 'seed_f3', type: 'restaurant', title: '老街的草莓奶油蛋糕',
          note: '你说要坐在窗边，把最后一口留给我。', tags: ['甜品'],
          link: '', image: '', author: 'b', done: true, rating: 4, createdAt: now - 4 * DAY, sample: true
        }
      ],
      travels: [
        {
          id: 'seed_t1', category: 'place', title: '去阿那亚看一次日出',
          place: '秦皇岛 · 阿那亚', note: '带一杯热咖啡，五点起床。',
          link: '', image: '', author: 'a', done: false, createdAt: now - DAY, sample: true
        },
        {
          id: 'seed_t2', category: 'todo', title: '在海边放一次仙女棒',
          place: '青岛 · 小麦岛', note: '等一个风小的晚上。',
          link: '', image: '', author: 'b', done: false, createdAt: now - 2 * DAY, sample: true
        },
        {
          id: 'seed_t3', category: 'shop', title: '逛一遍景德镇的市集',
          place: '景德镇 · 陶溪川', note: '挑两只不一样的小碗。',
          link: '', image: '', author: 'a', done: true, createdAt: now - 5 * DAY, sample: true
        },
        {
          id: 'seed_t4', category: 'place', title: '住进一间有猫的民宿',
          place: '莫干山', note: '什么也不做，就发呆。',
          link: '', image: '', author: 'b', done: false, createdAt: now - 3 * DAY, sample: true
        }
      ],
      dramas: [
        {
          id: 'seed_d1', title: '去有风的地方', platform: '芒果TV', total: 40,
          status: 'want', note: '适合慢慢看，像在云南住了一个月。', emoji: '🌿',
          link: '', createdAt: now - 6 * DAY, sample: true
        },
        {
          id: 'seed_d2', title: '请回答1988', platform: '韩剧TV', total: 20,
          status: 'want', note: '又哭又笑的下饭剧，适合一起把纸巾递来递去。', emoji: '📺',
          link: '', createdAt: now - 7 * DAY, sample: true
        },
        {
          id: 'seed_d3', title: '春色寄情人', platform: '腾讯视频', total: 21,
          status: 'want', note: '成年人之间温柔又克制的靠近。', emoji: '💐',
          link: '', createdAt: now - 8 * DAY, sample: true
        }
      ],
      events: [
        {
          id: 'seed_ev1', title: '一起看一场电影', date: dayKey(now + 5 * DAY), type: 'date',
          note: '买焦糖爆米花，坐最后一排。', author: 'a', createdAt: now, sample: true
        },
        {
          id: 'seed_ev2', title: '给小明做番茄牛腩', date: dayKey(now + 2 * DAY), type: 'food',
          note: '少放辣，多放一点土豆。', author: 'b', createdAt: now, sample: true
        },
        {
          id: 'seed_ev3', title: '周末去公园散步', date: dayKey(now + 9 * DAY), type: 'date',
          note: '不带目的，走到哪里算哪里。', author: 'b', createdAt: now, sample: true
        }
      ],
      todos: [
        { id: 'seed_td1', title: '买情侣牙刷', category: '购物', note: '要一粉一蓝', done: false, author: 'a', createdAt: now, sample: true },
        { id: 'seed_td2', title: '一起洗碗', category: '家务', note: '', done: true, author: 'b', createdAt: now, sample: true },
        { id: 'seed_td3', title: '给阳台添一盆小植物', category: '生活', note: '好养一点的', done: false, author: 'b', createdAt: now, sample: true }
      ],
      countdowns: [],
      visits: [
        { id: 'seed_v1', city: '上海', note: '第一次一起坐地铁', date: '2025-05-01', author: 'a', createdAt: now, sample: true },
        { id: 'seed_v2', city: '杭州', note: '西湖边走了很久', date: '2025-08-16', author: 'b', createdAt: now, sample: true },
        { id: 'seed_v3', city: '景德镇', note: '挑了两只不一样的小碗', date: '2025-10-03', author: 'a', createdAt: now, sample: true },
        { id: 'seed_v4', city: '厦门', note: '海风很大的晚上', date: '2026-04-05', author: 'b', createdAt: now, sample: true }
      ],
      memories: [],
      musicTracks: []
    };
  }

  /* =========================================================
     Navigation / shell
     ========================================================= */
  function navPage() {
    if (['zodiac', 'dramas', 'memories', 'settings', 'recap', 'calendar', 'footprints', 'checklist', 'countdown'].indexOf(session.page) >= 0) return 'us';
    return session.page;
  }

  function enterApp() {
    state = ensureState(state);
    session.unlocked = true;
    session.activeUser = state.meta.activeUser === 'b' ? 'b' : 'a';
    session.page = 'home';
    session.feedFilter = 'all';
    session.openComments = new Set();
    session.stickerFor = null;
    session.showAllFeed = false;
    renderShell();
    window.scrollTo(0, 0);
  }

  function renderShell() {
    document.body.classList.remove('modal-open');
    $app.className = '';
    $app.innerHTML = '<div id="topbar"></div><main id="page" class="page"></main><nav id="bottom-nav"></nav>';
    renderTopbar();
    renderPage(false);
    renderNav();
  }

  function renderTopbar() {
    const host = document.getElementById('topbar');
    if (!host) return;
    const u = currentUser();
    host.innerHTML = '<header class="topbar">' +
      '<div class="brand"><span class="brand-mark">' + avatarSvg('mochi') + '</span>' +
      '<span class="brand-word"><b>OUR LITTLE HOUSE</b><small>PRIVATE FOR TWO</small></span></div>' +
      '<div class="top-actions">' +
      '<button class="identity" data-action="switch-user" aria-label="切换当前身份">' +
      avatarHtml(u, 'xs') + '<b>' + esc(u.name) + '</b>' + icon('chevronDown', 11) +
      '</button>' +
      '<button class="lock-btn" data-action="lock" aria-label="锁上小屋">' + icon('lock', 16) + '</button>' +
      '</div></header>';
  }

  function renderNav() {
    const host = document.getElementById('bottom-nav');
    if (!host) return;
    const active = navPage();
    const items = [
      { page: 'home', label: '小屋', icon: 'home' },
      { page: 'report', label: '报备', icon: 'report' },
      { page: 'food', label: '美食', icon: 'food' },
      { page: 'travel', label: '旅行', icon: 'travel' },
      { page: 'us', label: '我们', icon: 'us' }
    ];
    host.className = 'bottom-nav';
    host.innerHTML = items.map(function (it) {
      const on = active === it.page;
      return '<button class="nav-item' + (on ? ' active' : '') + '" data-action="nav" data-page="' + it.page + '"' + (on ? ' aria-current="page"' : '') + '>' +
        '<span class="nav-icon">' + icon(it.icon, 21) + '</span><span>' + it.label + '</span></button>';
    }).join('');
  }

  function navigate(page) {
    if (!page) return;
    closeSheet(true);
    session.page = page;
    session.stickerFor = null;
    renderTopbar();
    renderNav();
    renderPage(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function refreshPage(preserveScroll) {
    const y = window.scrollY;
    renderPage(!!preserveScroll);
    if (preserveScroll) window.scrollTo(0, y);
  }

  function renderPage() {
    const host = document.getElementById('page');
    if (!host) return;
    const pages = {
      home: renderHome,
      report: renderReportPage,
      food: renderFoodPage,
      travel: renderTravelPage,
      us: renderUsPage,
      zodiac: renderZodiacPage,
      dramas: renderDramaPage,
      memories: renderMemoryPage,
      settings: renderSettingsPage,
      recap: renderRecapPage,
      calendar: renderCalendarPage,
      footprints: renderFootprintsPage,
      checklist: renderChecklistPage,
      countdown: renderCountdownPage
    };
    const fn = pages[session.page] || renderHome;
    host.innerHTML = '<div class="page-inner">' + fn() + '</div>';
    host.classList.remove('page-anim');
    void host.offsetWidth;
    host.classList.add('page-anim');
  }

  function subhead(title, back, actions) {
    return '<div class="subhead">' +
      '<button class="back" data-action="nav" data-page="' + (back || 'us') + '" aria-label="返回">' + icon('arrowLeft', 17) + '</button>' +
      '<div class="titles"><span class="eyebrow">OUR LITTLE HOUSE</span><h1>' + esc(title) + '</h1></div>' +
      (actions ? '<div class="actions">' + actions + '</div>' : '') +
      '</div>';
  }

  function sectionHead(eyebrow, title, action) {
    return '<div class="section-head"><div><span class="eyebrow">' + eyebrow + '</span><h2>' + title + '</h2></div>' + (action || '') + '</div>';
  }

  /* =========================================================
     Lock / setup
     ========================================================= */
  function renderLock() {
    session.unlocked = false;
    $app.className = 'is-locked';
    const a = state ? user('a') : null;
    const b = state ? user('b') : null;
    const info = getDayInfo();
    $app.innerHTML = '<div class="lock-screen">' +
      '<div class="lock-deco bow">' + bowSvg('') + '</div>' +
      '<span class="lock-deco star1">✦</span><span class="lock-deco star2">✧</span><span class="lock-deco heart1">♡</span>' +
      '<div class="lock-deco doodle">' + constellationSvg('') + '</div>' +
      '<div class="lock-wrap">' +
      '<div class="lock-mascot">' + mascotFullHtml() + '</div>' +
      '<div class="lock-card" id="lock-card">' +
      '<div class="lock-kicker"><span class="eyebrow">WELCOME HOME</span><span class="lock-hearts">♡ ♡ ♡</span></div>' +
      '<h1>欢迎回家，<br><em>' + esc(a ? a.name : '泡泡') + '</em>。</h1>' +
      '<p class="lead">输入只有你们知道的暗号，' + esc(a ? a.name : '') + ' & ' + esc(b ? b.name : '') + ' 的小屋就开门啦。</p>' +
      '<form class="lock-form" data-form="unlock">' +
      '<label class="field"><span>小屋暗号</span><div class="password-wrap"><input type="password" name="password" autocomplete="current-password" placeholder="输入密码" maxlength="64" required><button type="button" class="password-toggle" data-action="toggle-password" aria-label="显示密码">' + icon('eye', 16) + '</button></div></label>' +
      '<div class="form-error" data-error></div>' +
      '<button class="btn btn-primary btn-block" type="submit">' + icon('key', 15) + ' 开门</button>' +
      '</form>' +
      '<div class="lock-actions"><button class="text-link" data-action="show-hint">忘记暗号？</button><span class="tiny">' + icon('shield', 11) + ' 只在这台设备里</span></div>' +
      (state && state.meta.hint ? '<div class="hint-box hidden" data-hint><b>小提示：</b>' + esc(state.meta.hint) + '</div>' : '') +
      '<div class="hint-box hidden" data-reset-box><b>还是想不起来？</b><br>密码无法找回，只能清空小屋重新开始。动态、照片和密码都会被删除。<br><button class="text-link" style="margin-top:7px" data-action="reset-from-lock">清空小屋，重新开始</button></div>' +
      '<div class="form-note">' + (info.nextLabel ? '在一起 ' + info.count + ' 天 · ' + esc(info.nextLabel) : '把普通的日子，过成我们的小日子') + '</div>' +
      '</div>' +
      '<div class="lock-footer"><div class="dots"><span class="dot on"></span><span class="dot"></span><span class="dot"></span></div>OUR LITTLE HOUSE · A TINY HOME FOR TWO</div>' +
      '</div></div>';
  }

  function renderSetup(step) {
    session.unlocked = false;
    $app.className = 'is-locked';
    const step1 = step === 1;
    $app.innerHTML = '<div class="lock-screen' + (step1 ? '' : ' setup-two') + '">' +
      '<div class="lock-deco bow">' + bowSvg('') + '</div>' +
      '<span class="lock-deco star1">✦</span><span class="lock-deco star2">✧</span><span class="lock-deco heart1">♡</span>' +
      '<div class="lock-wrap">' +
      '<div class="lock-mascot">' + (step1 ? mascotFullHtml() : avatarSvg('bunny')) + '</div>' +
      '<div class="lock-card" id="lock-card">' +
      '<div class="lock-kicker"><span class="eyebrow">' + (step1 ? 'FIRST HELLO' : 'NAME THE HOUSE') + '</span><span class="lock-hearts">♡ ♡ ♡</span></div>' +
      '<div class="setup-step"><i class="on"></i><i class="' + (step1 ? '' : 'on') + '"></i><span>' + (step1 ? '01 / 02' : '02 / 02') + '</span></div>' +
      (step1 ? setupPasswordHtml() : setupProfileHtml()) +
      '</div>' +
      '<div class="lock-footer"><div class="dots"><span class="dot on"></span><span class="dot' + (step1 ? '' : ' on') + '"></span><span class="dot"></span></div>OUR LITTLE HOUSE · A TINY HOME FOR TWO</div>' +
      '</div></div>';
  }

  function setupPasswordHtml() {
    return '<h1>先给小屋<br><em>上一把小锁。</em></h1>' +
      '<p class="lead">只属于你们两个人的秘密基地。设置一个暗号，以后每次进门都要用到它。</p>' +
      '<form class="lock-form" data-form="setup-password">' +
      '<label class="field"><span>设置密码（至少 4 位）</span><div class="password-wrap"><input type="password" name="password" autocomplete="new-password" placeholder="你们的专属暗号" minlength="4" maxlength="32" required><button type="button" class="password-toggle" data-action="toggle-password" aria-label="显示密码">' + icon('eye', 16) + '</button></div></label>' +
      '<label class="field"><span>再输一次</span><input type="password" name="confirm" autocomplete="new-password" placeholder="确认一下" minlength="4" maxlength="32" required></label>' +
      '<label class="field"><span>密码提示（选填）</span><input type="text" name="hint" placeholder="忘了可以看一眼的小提示" maxlength="40"></label>' +
      '<div class="form-error" data-error></div>' +
      '<button class="btn btn-primary btn-block" type="submit">下一步 · 给小屋起名字 ' + icon('chevronRight', 14) + '</button>' +
      '</form>' +
      '<div class="form-note">密码只保存在本机；它不是数据加密，但能挡住随手翻开的人。</div>';
  }

  function setupProfileHtml() {
    const d = session.setup;
    return '<h1>给小屋<em>贴上名字。</em></h1>' +
      '<p class="lead">写下你们的名字，选两只小动物，小屋就正式开始营业。</p>' +
      '<form class="lock-form" data-form="setup-profile">' +
      profileFieldsHtml(d.aName, d.bName, d.aBirth, d.bBirth, d.aAvatar, d.bAvatar, d.start) +
      '<div class="form-error" data-error></div>' +
      '<button class="btn btn-primary btn-block" type="submit">开启我们的小屋 ' + icon('sparkles', 15) + '</button>' +
      '<button class="btn btn-ghost btn-block btn-sm" type="button" data-action="setup-back">' + icon('arrowLeft', 12) + ' 返回上一步</button>' +
      '</form>' +
      '<div class="form-note">以后可以在「我们 → 小屋设置」里随时修改资料。</div>';
  }

  function profileFieldsHtml(aName, bName, aBirth, bBirth, aAvatar, bAvatar, start) {
    const avatars = function (prefix, selected) {
      return '<div class="avatar-picker">' + AVATAR_LIST.map(function (av) {
        return '<label class="avatar-choice"><input type="radio" name="' + prefix + 'Avatar" value="' + av.id + '"' + (selected === av.id ? ' checked' : '') + '><span>' + avatarById(av.id, '') + '</span></label>';
      }).join('') + '</div>';
    };
    return '<div class="profile-form-block"><h3>' + avatarById(aAvatar, 'xs') + ' 你</h3>' +
      '<div class="field-row"><label class="field"><span>名字</span><input type="text" name="aName" value="' + esc(aName) + '" maxlength="12" placeholder="泡泡" required></label>' +
      '<label class="field"><span>生日（星座用）</span><input type="date" name="aBirth" value="' + esc(aBirth) + '"></label></div>' +
      avatars('a', aAvatar) + '</div>' +
      '<div class="profile-form-block"><h3>' + avatarById(bAvatar, 'xs') + ' TA</h3>' +
      '<div class="field-row"><label class="field"><span>名字</span><input type="text" name="bName" value="' + esc(bName) + '" maxlength="12" placeholder="小明" required></label>' +
      '<label class="field"><span>生日（星座用）</span><input type="date" name="bBirth" value="' + esc(bBirth) + '"></label></div>' +
      avatars('b', bAvatar) + '</div>' +
      '<label class="field"><span>在一起的第一天（选填）</span><input type="date" name="start" value="' + esc(start) + '"><small>填了之后，小屋会帮你们数着日子。</small></label>';
  }

  function showFormError(form, message) {
    if (!form) return;
    const box = form.querySelector('[data-error]');
    if (box) box.textContent = message || '';
    const card = document.getElementById('lock-card');
    if (card) {
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
  }
