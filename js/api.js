// Steam Market API 集成
// 注意: 由于CORS限制,实际使用时可能需要使用代理服务器

const STEAM_API = {
    // Steam Community Market API 端点
    baseUrl: 'https://steamcommunity.com/market',
    
    // CS:GO 的 App ID
    appId: 730,
    
    // 货币代码 (CNY = 人民币)
    currency: 23, // 23 = CNY
    
    // API 限流控制
    requestDelay: 1500, // 每次请求间隔1.5秒
    lastRequestTime: 0,

    // 价格缓存
    priceCache: {},
    cacheExpiry: 5 * 60 * 1000, // 5分钟过期
};

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 等待API限流
async function waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - STEAM_API.lastRequestTime;
    if (timeSinceLastRequest < STEAM_API.requestDelay) {
        await delay(STEAM_API.requestDelay - timeSinceLastRequest);
    }
    STEAM_API.lastRequestTime = Date.now();
}

// 获取物品价格
async function getSkinPrice(skinName, wear = '') {
    // 构建市场名称
    let marketHashName = skinName;
    if (wear) {
        marketHashName += ` (${wear})`;
    }
    
    // 检查缓存
    const cacheKey = marketHashName;
    if (STEAM_API.priceCache[cacheKey]) {
        const cached = STEAM_API.priceCache[cacheKey];
        if (Date.now() - cached.timestamp < STEAM_API.cacheExpiry) {
            return cached.price;
        }
    }

    try {
        await waitForRateLimit();
        
        // 由于CORS限制,这里使用备用方案: Steam API代理或模拟数据
        // 实际部署时,建议使用后端代理或第三方API服务
        
        // 使用CSGOFloat等第三方API作为备选
        const price = await fetchPriceFromAlternativeAPI(marketHashName);
        
        // 缓存价格
        STEAM_API.priceCache[cacheKey] = {
            price,
            timestamp: Date.now()
        };
        
        return price;
    } catch (error) {
        console.error(`获取 ${marketHashName} 价格失败:`, error);
        // 返回模拟价格用于演示
        return getSimulatedPrice(skinName);
    }
}

// 使用第三方API获取价格 (CSGOFloat, CSGO Backpack等)
async function fetchPriceFromAlternativeAPI(marketHashName) {
    try {
        // 方案1: 使用 Steam Market API (需要代理)
        // const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=23&market_hash_name=${encodeURIComponent(marketHashName)}`;
        
        // 方案2: 使用第三方价格API
        // 例如: csgobackpack.net, csgo-trader, steamapis.com
        const url = `https://api.steamapis.com/market/item/730/${encodeURIComponent(marketHashName)}?api_key=YOUR_API_KEY`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('API请求失败');
        }
        
        const data = await response.json();
        
        // 解析价格 (不同API返回格式不同)
        if (data.median_price) {
            return parsePrice(data.median_price);
        } else if (data.lowest_price) {
            return parsePrice(data.lowest_price);
        }
        
        throw new Error('无法解析价格数据');
    } catch (error) {
        console.error('第三方API获取失败:', error);
        throw error;
    }
}

// 解析价格字符串 (如 "¥ 12.34" -> 12.34)
function parsePrice(priceString) {
    if (typeof priceString === 'number') {
        return priceString;
    }
    // 移除货币符号和空格,提取数字
    const match = priceString.replace(/[^\d.]/g, '');
    return parseFloat(match) || 0;
}

// 生成模拟价格 (用于演示和测试)
function getSimulatedPrice(skinName) {
    // 根据武器类型和稀有度生成合理的模拟价格
    const hash = skinName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // 基础价格范围
    let basePrice = 0.5;
    let variance = 2.0;
    
    // 根据武器类型调整价格
    if (skinName.includes('AK-47') || skinName.includes('M4A4') || skinName.includes('M4A1-S')) {
        basePrice = 10;
        variance = 50;
    } else if (skinName.includes('AWP')) {
        basePrice = 15;
        variance = 100;
    } else if (skinName.includes('Desert Eagle') || skinName.includes('USP-S') || skinName.includes('Glock-18')) {
        basePrice = 3;
        variance = 15;
    }
    
    // 使用哈希值生成伪随机价格
    const randomFactor = (hash % 100) / 100;
    const price = basePrice + (randomFactor * variance);
    
    return Math.round(price * 100) / 100; // 保留两位小数
}

// 批量获取皮肤价格
async function getBatchPrices(skinNames, wear = 'Field-Tested') {
    const prices = {};
    const total = skinNames.length;
    
    for (let i = 0; i < skinNames.length; i++) {
        const skinName = skinNames[i];
        try {
            prices[skinName] = await getSkinPrice(skinName, wear);
            
            // 更新进度
            if (window.updateLoadingProgress) {
                window.updateLoadingProgress((i + 1) / total * 100);
            }
        } catch (error) {
            console.error(`获取 ${skinName} 价格失败:`, error);
            prices[skinName] = 0;
        }
    }
    
    return prices;
}

// 获取武器箱价格
async function getCasePrice(caseName) {
    return await getSkinPrice(caseName, '');
}

// 刷新所有价格数据
async function refreshAllPrices() {
    STEAM_API.priceCache = {};
    console.log('价格缓存已清空');
}

// 导出API函数
window.SteamAPI = {
    getSkinPrice,
    getBatchPrices,
    getCasePrice,
    refreshAllPrices,
    getSimulatedPrice
};

