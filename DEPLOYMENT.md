# 部署指南

## 部署到GitHub Pages

### 步骤1: 创建GitHub仓库

1. 登录GitHub账号
2. 点击右上角的 "+" 号,选择 "New repository"
3. 填写仓库信息:
   - Repository name: `csgo-tradeup-calculator`
   - Description: CS:GO 2汰换合同期望收益计算器
   - Public (公开仓库)
   - 勾选 "Add a README file" (可选)
4. 点击 "Create repository"

### 步骤2: 推送代码到GitHub

在项目目录中执行以下命令:

```bash
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/your-username/csgo-tradeup-calculator.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: CS:GO Trade-Up Calculator"

# 推送到GitHub
git push -u origin main
```

如果你的默认分支是 `master` 而不是 `main`,请使用:
```bash
git push -u origin master
```

### 步骤3: 启用GitHub Pages

1. 进入你的GitHub仓库页面
2. 点击 "Settings" (设置)
3. 在左侧菜单中找到 "Pages"
4. 在 "Source" 部分:
   - Branch: 选择 `main` (或 `master`)
   - Folder: 选择 `/ (root)`
5. 点击 "Save"
6. 等待几分钟,页面会显示你的网站URL

### 步骤4: 访问你的网站

部署完成后,你的网站将在以下地址可用:
```
https://your-username.github.io/csgo-tradeup-calculator/
```

## 配置Steam API

由于浏览器的CORS安全策略,直接从前端调用Steam API会遇到跨域问题。以下是几种解决方案:

### 方案A: 使用公共CORS代理 (最简单)

修改 `js/api.js` 文件:

```javascript
const CORS_PROXY = 'https://corsproxy.io/?';
const STEAM_API_URL = CORS_PROXY + encodeURIComponent('https://steamcommunity.com/market/priceoverview/');
```

**优点**: 简单快速
**缺点**: 依赖第三方服务,可能不稳定

### 方案B: 使用第三方价格API (推荐)

#### 1. 注册Steam APIs
访问 https://steamapis.com/ 并注册账号获取API密钥

#### 2. 修改 `js/api.js`:
```javascript
const STEAM_APIS_KEY = 'your-api-key-here';
const API_URL = `https://api.steamapis.com/market/item/730/{item}?api_key=${STEAM_APIS_KEY}`;
```

#### 3. 在GitHub仓库设置中添加Secrets
- 进入 Settings > Secrets and variables > Actions
- 添加 `STEAM_API_KEY`
- 使用GitHub Actions在构建时注入API密钥

### 方案C: 搭建自己的后端代理 (最稳定)

#### 1. 创建Node.js后端

创建 `server/index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/api/price/:itemName', async (req, res) => {
    try {
        const itemName = req.params.itemName;
        const response = await axios.get(
            `https://steamcommunity.com/market/priceoverview/`,
            {
                params: {
                    appid: 730,
                    currency: 23,
                    market_hash_name: itemName
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

#### 2. 部署后端到云服务

可选的免费部署平台:
- **Vercel**: https://vercel.com/
- **Netlify Functions**: https://www.netlify.com/
- **Railway**: https://railway.app/
- **Render**: https://render.com/

#### 3. 更新前端API地址

在 `js/api.js` 中:
```javascript
const API_BASE_URL = 'https://your-backend.vercel.app/api';
```

## 部署到Vercel (替代方案)

Vercel提供更好的性能和CDN支持:

### 安装Vercel CLI
```bash
npm i -g vercel
```

### 部署
```bash
vercel
```

按照提示完成部署,Vercel会自动配置域名和SSL证书。

## 部署到Netlify

### 方法1: 通过Git连接

1. 访问 https://app.netlify.com/
2. 点击 "New site from Git"
3. 选择你的GitHub仓库
4. 配置构建设置 (静态站点可以使用默认设置)
5. 点击 "Deploy site"

### 方法2: 手动上传

1. 在项目根目录创建 `netlify.toml`:
```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. 使用Netlify CLI部署:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 自定义域名

如果你有自己的域名:

### GitHub Pages
1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为你的域名: `csgo.yourdomain.com`
3. 在域名DNS设置中添加CNAME记录指向: `your-username.github.io`

### Vercel/Netlify
1. 在平台控制面板中点击 "Add custom domain"
2. 按照提示配置DNS记录

## 性能优化

### 1. 启用缓存
在 `index.html` 的 `<head>` 中添加:
```html
<meta http-equiv="Cache-Control" content="max-age=3600">
```

### 2. 压缩资源
使用工具压缩JS和CSS:
```bash
npm install -g terser clean-css-cli
terser js/main.js -o js/main.min.js
cleancss -o css/style.min.css css/style.css
```

### 3. 使用CDN
将JavaScript库改为CDN链接,提高加载速度。

## 监控和分析

### 添加Google Analytics

在 `index.html` 的 `</head>` 前添加:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 故障排查

### 页面显示404
- 确认GitHub Pages已启用
- 检查仓库是否为Public
- 等待5-10分钟让部署生效

### API请求失败
- 检查浏览器控制台的错误信息
- 确认CORS代理或API密钥配置正确
- 检查Steam市场是否可访问

### 样式未加载
- 检查CSS文件路径是否正确
- 确认文件名大小写匹配
- 清除浏览器缓存

## 更新网站

修改代码后更新网站:

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

GitHub Pages会自动重新部署,通常在1-2分钟内生效。

## 安全建议

1. **不要**在前端代码中硬编码API密钥
2. 使用环境变量存储敏感信息
3. 定期更新依赖包(如果使用了)
4. 启用HTTPS (GitHub Pages和Vercel/Netlify默认提供)

## 获取帮助

如果遇到问题:
1. 查看GitHub Issues
2. 阅读GitHub Pages文档
3. 检查浏览器开发者工具的控制台输出

---

祝部署顺利! 🚀

