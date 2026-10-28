# 我们的小屋 · Our Little House

一个**单文件**的双人私密小屋。状态、报备、美食、旅行、月度回忆、共享日历、共同清单、足迹、星座和一起看的剧，都收在同一个 `index.html` 里。双击就能打开，数据只存在你自己的浏览器。

> A private little home for two, in one self-contained HTML file. No server, no account, no tracking — everything lives in your own browser.

![小屋首页](preview.png)
![第一次进入](preview-setup.png)

更多预览：[我们](preview-us.png) · [月度回忆](preview-recap.png)

## 快速开始

| 方式 | 步骤 |
| --- | --- |
| 电脑 | 下载仓库 → 双击 `index.html`（Chrome / Edge / Safari） |
| 在线 | 打开 GitHub Pages：`https://dsjsunu.github.io/our-little-house/` |
| 手机 | `python -m http.server 8000` 或 `npx serve`，手机连同一 Wi-Fi 访问电脑局域网 IP |

第一次打开会让你设置一个暗号、写两个人的名字、选两只小动物。完成后就可以开始记录。

## 功能

- **此刻**：文字、心情、在干嘛、地点、照片，双人身份一键切换。
- **动态**：最多 9 张照片、5 种表情回应、评论、贴纸；可按人筛选。
- **专属报备**：6 个快捷按钮（到家 / 吃饭 / 出门 / 下班 / 睡觉 / 想你），自定义文字，本周次数与连续天数。
- **美食口袋**：想吃的店 / 想做的菜，评分、标签、链接、一键打卡。
- **旅行手帐**：想去的地方 / 想做的事 / 想逛的，手绘等高线地图与路线拼贴。
- **月度回忆**：自动汇总当月动态、照片、报备、美食、旅行与剧集，生成杂志风 Zine，可复制文字或打印成 PDF。
- **倒计时 & 历史上的今天**：内置情人节、520、圣诞、跨年、纪念日和生日，支持自定义；自动翻出往年同一天的事。
- **共享日历**：月视图 + 约会 / 吃饭 / 旅行 / 纪念日 / 其他。
- **共同清单**：生活 / 购物 / 家务 / 其他，两个人一起打勾。
- **足迹地图**：手绘中国地图，按时间连线，仅作纪念示意。
- **我们**：星座、今日宜忌、默契指数、本地生成的「AI 性格小报告」、一起看的剧、回忆胶囊。
- **小屋设置**：资料、头像、生日、MBTI、纪念日、密码、备份导出 / 恢复、清空示例、重置。

视觉上是一整套手帐拼贴：奶油卡片、格纹纸、胶带、邮票、手绘地图，配 `prefers-reduced-motion` 适配、安全区适配与键盘 / 焦点陷阱。

## 数据与隐私

- 所有内容保存在本机浏览器 `localStorage`（键名 `our-little-house.data.v1`）和 IndexedDB（照片）。
- 密码以「随机盐 + SHA-256」保存，不是明文；但它只是进门的验证，**不是数据加密**。
- 没有任何网络请求，内容不会上传服务器；外链只有点击时才打开。
- 清除浏览器数据、换浏览器、换设备都会丢数据；重要内容请用「备份导出」保存 JSON。
- 这是**单机版**：两台设备各自独立，不会实时同步。想两端共享，需要自己接一个后端。

## 已知限制

- 「AI 性格报告」是本地规则 + 随机种子生成的，不联网，仅供娱乐。
- 抖音 / 视频号 / B 站链接只保存地址，不内嵌播放。
- 微信聊天记录无法读取，也不提供自动导入。
- 星座按公历生日计算太阳星座，不含上升 / 月亮 / 星盘。
- 足迹地图是手绘方位图，不接地图 SDK，也不代表完整行政边界。

## 项目结构

```text
our-little-house/
├─ index.html      # 构建产物：单文件应用，直接打开这个
├─ build.mjs       # 把 src/ 拼回 index.html（零依赖，Node 18+）
├─ src/
│  ├─ shell.html
│  ├─ styles.css
│  ├─ 01-base.js   # 状态、存储、头像与吉祥物、锁屏与初始化
│  ├─ 02-home.js
│  ├─ 03-pages.js
│  ├─ 03b-countdown.js
│  ├─ 04-sheets.js
│  └─ 05-handlers.js
└─ preview*.png
```

修改源码后运行：

```bash
node build.mjs
```

会重新生成 `index.html`。没有 npm 依赖，也不需要 Python。

## 素材与许可

- 小猫「团子」、兔子、小熊、灰猫和所有页面插画都是项目内的**原创 SVG**，不含任何第三方角色图片。
- 足迹地图轮廓由 [Natural Earth](https://www.naturalearthdata.com/) 1:110m 公共领域数据简化而来。
- 代码以 [MIT](LICENSE) 许可发布，可自由使用、修改、发布，包括商用。

## English

A single-file, local-only "little house for two": statuses, check-ins, food wishlist, travel journal, monthly zine, shared calendar, checklist, footprints, countdowns, and a light local "personality report". All data stays in your browser; there is no backend and no network call. Original SVG mascots, no third-party character assets. MIT licensed.

---

愿你们的日子，被好好收在这里。
