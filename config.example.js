// API配置示例文件
// 复制此文件为 config.js 并填入你的API密钥

const API_CONFIG = {
    // Steam APIs 密钥 (https://steamapis.com/)
    steamApisKey: 'YOUR_STEAM_APIS_KEY_HERE',
    
    // CORS代理设置
    corsProxy: 'https://corsproxy.io/?',
    
    // 使用哪个API源
    // 选项: 'steam_direct', 'steam_apis', 'simulated'
    apiSource: 'simulated',
    
    // 缓存设置
    cacheEnabled: true,
    cacheExpiry: 5 * 60 * 1000, // 5分钟
    
    // 请求限流设置 (毫秒)
    requestDelay: 1500,
    
    // 货币设置
    currency: 'CNY', // CNY, USD, EUR等
    currencyCode: 23, // Steam货币代码 (23=CNY)
    
    // 调试模式
    debug: true
};

// 如果在浏览器环境中
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
}

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

