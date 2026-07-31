# 天气 · Hourly Weather

基于访问者 IP 自动定位的实时天气网页，显示当前天气、逐小时预报和未来七天天气预报。天气数据每小时自动更新。

## 功能特性

- **IP 自动定位** — 根据 visitor 的 IP 地址判断所在城市（双重备用服务保障可用性）
- **当前天气** — 温度、体感温度、天气状况、湿度、风速、风向、紫外线、气压、降水量
- **逐小时预报** — 未来 24 小时温度、天气图标、降水概率
- **七天预报** — 每日最高/最低温度、天气状况、降水概率，带温度范围可视化条
- **日出日落** — 太阳位置弧线动态显示当前日照进度
- **动态主题** — 背景颜色随天气状况和昼夜自动切换（晴天/多云/雨天/雪天/雷暴/雾天，日间/夜间）
- **自动刷新** — 每小时自动获取最新天气数据；页面重新可见时也会检查是否需要刷新
- **响应式设计** — 完美适配桌面和移动端

## 天气数据来源

- **天气数据**：[Open-Meteo](https://open-meteo.com/) — 完全免费，无需 API Key，支持商用
- **IP 定位**：[ipapi.co](https://ipapi.co/)（主）+ [ipwho.is](https://ipwho.is/)（备）— 双重保障

## 本地运行

这是一个纯静态网站（HTML + CSS + JS），无需任何构建步骤。

```bash
# 方法一：直接用浏览器打开 index.html

# 方法二：启动本地服务器（推荐）
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 部署到 GitHub Pages（自动部署）

### 步骤一：创建 GitHub 仓库

1. 登录 GitHub，点击右上角 **+** → **New repository**
2. 仓库名随意（例如 `weather-app`），选择 **Public**
3. 点击 **Create repository**

### 步骤二：推送代码

```bash
# 在项目根目录执行
git init
git add .
git commit -m "初始化天气网页"
git branch -M main
git remote add origin https://github.com/你的用户名/weather-app.git
git push -u origin main
```

### 步骤三：启用 GitHub Pages

1. 进入仓库页面，点击 **Settings**
2. 左侧菜单选择 **Pages**
3. **Source** 选择 **GitHub Actions**（不是 Deploy from a branch）
4. 保存设置

### 步骤四：等待自动部署

- 推送代码后，GitHub Actions 会自动触发部署工作流
- 在仓库的 **Actions** 标签页可以查看部署进度
- 部署成功后，访问 `https://你的用户名.github.io/weather-app/` 即可看到网页

### 后续更新

每次向 `main` 分支推送代码，GitHub Actions 都会自动重新部署，无需任何手动操作。

## 项目结构

```
.
├── index.html              # 页面结构
├── style.css               # 样式（玻璃拟态 + 动态天气主题）
├── app.js                  # 核心逻辑（IP定位 + 天气API + 渲染 + 定时刷新）
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 自动部署工作流
└── README.md
```

## 技术栈

- 原生 HTML / CSS / JavaScript（无框架依赖）
- Open-Meteo 免费天气 API
- ipapi.co / ipwho.is 免费 IP 定位
- GitHub Actions + GitHub Pages 自动部署
- Google Fonts（Bricolage Grotesque + Manrope）

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）。需要支持 `backdrop-filter` 和 `fetch` API。
