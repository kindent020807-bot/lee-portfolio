# Lee Portfolio Starter (Static)

这是一个**零框架、纯静态**的个人网站模板：
- 结构清晰：About / Projects / Experience / Skills / Contact
- 支持**中英切换** + **深浅色主题**
- 所有内容集中在 `content.json`，你只要改内容，不用改结构
- 可部署到 GitHub Pages / Vercel / 任意静态托管

## 1) 本地预览（推荐）

因为浏览器对 `fetch('./content.json')` 有限制，**直接双击打开 index.html 可能会报错**。
建议用任意本地静态服务器：

### 方案A：Python（最简单）
在项目根目录执行：

```bash
python -m http.server 8000
```

然后打开：
`http://localhost:8000`

### 方案B：VS Code Live Server
安装 Live Server 扩展，然后右键 `index.html` -> Open with Live Server。

## 2) 你需要替换/补充的文件

- `content.json`：你的个人信息、项目、经历、技能（主要改这个）
- `assets/resume.pdf`：你的简历 PDF（改名为 resume.pdf 放进去即可）
- `assets/avatar.svg`：头像（可换成 png/jpg，记得改 index.html 中路径）
- `assets/favicon.svg`：网站图标

## 3) 部署建议

### GitHub Pages
1. 新建仓库，把这些文件推上去
2. Settings -> Pages -> Deploy from branch
3. 选择 `main` 分支根目录
4. 等页面生成即可

### Vercel
1. Import 你的 Git 仓库
2. Framework 选择 “Other”
3. Build command 留空（静态）
4. Output directory 选择根目录

## 4) 推荐你给我的材料（越全越快）

你后面把资料发我，我们就能把占位内容替换成真实版本，并做“质感升级”。

- 最新简历（PDF / Word / 文本都行）
- 作品集：项目清单（每个项目：背景、目标、你的角色、关键动作、结果数据、截图/链接）
- 你希望的定位：例如“增长产品经理 / UX设计师 / 数据产品 / 全栈工程师 …”
- 目标行业/岗位（方便我把内容对齐成招聘方语言）
- 你喜欢的风格：极简、偏科技、偏商务、偏创意（一个方向即可）

> 你发来资料后，我会把每个项目写成“故事 + 指标 + 方法论”，并把页面排版打磨到可直接投递。
