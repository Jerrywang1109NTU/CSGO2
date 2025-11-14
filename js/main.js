// 主应用逻辑

let availableSkins = [];
let selectedSkins = [];
let currentCalculator = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('CS:GO 2 汰换合同计算器已启动');
    
    // 初始化UI
    initializeUI();
    
    // 加载武器箱列表
    loadCollections();
    
    // 模拟数据加载过程
    await simulateDataLoading();
    
    // 隐藏加载画面,显示主内容
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    
    // 更新最后更新时间
    updateLastUpdateTime();
});

// 初始化UI事件监听
function initializeUI() {
    // 搜索按钮
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    
    // 清空选择按钮
    document.getElementById('clear-selection-btn').addEventListener('click', clearSelection);
    
    // 计算按钮
    document.getElementById('calculate-btn').addEventListener('click', calculateTradeUp);
    
    // 品质选择变化
    document.getElementById('quality-select').addEventListener('change', () => {
        clearSelection();
        availableSkins = [];
        updateAvailableSkinsDisplay();
    });
}

// 加载武器箱列表
function loadCollections() {
    const select = document.getElementById('collection-select');
    const collections = getAllCollections();
    
    collections.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.id;
        option.textContent = collection.name;
        select.appendChild(option);
    });
}

// 模拟数据加载
async function simulateDataLoading() {
    const loadingText = document.querySelector('#loading p');
    
    const steps = [
        '正在连接Steam市场...',
        '正在获取武器箱数据...',
        '正在加载皮肤信息...',
        '正在准备计算器...'
    ];
    
    for (const step of steps) {
        loadingText.textContent = step;
        await delay(500);
    }
}

// 搜索可用皮肤
async function handleSearch() {
    const quality = document.getElementById('quality-select').value;
    const collectionId = document.getElementById('collection-select').value;
    
    if (!collectionId) {
        alert('请选择一个武器箱');
        return;
    }
    
    // 显示加载状态
    const searchBtn = document.getElementById('search-btn');
    const originalText = searchBtn.textContent;
    searchBtn.textContent = '加载中...';
    searchBtn.disabled = true;
    
    try {
        // 获取皮肤列表
        const skins = getSkinsFromCollection(collectionId, quality);
        
        if (skins.length === 0) {
            alert('该武器箱中没有该品质的皮肤');
            return;
        }
        
        // 获取价格
        const skinNames = skins.map(s => s.name);
        const prices = await window.SteamAPI.getBatchPrices(skinNames);
        
        // 合并数据
        availableSkins = skins.map(skin => ({
            ...skin,
            price: prices[skin.name] || 0
        }));
        
        // 显示结果
        updateAvailableSkinsDisplay();
        
    } catch (error) {
        console.error('搜索失败:', error);
        alert('获取皮肤数据失败,请稍后重试');
    } finally {
        searchBtn.textContent = originalText;
        searchBtn.disabled = false;
    }
}

// 更新可用皮肤显示
function updateAvailableSkinsDisplay() {
    const container = document.getElementById('available-skins');
    
    if (availableSkins.length === 0) {
        container.innerHTML = '<p class="placeholder">没有找到皮肤</p>';
        return;
    }
    
    container.innerHTML = '';
    
    availableSkins.forEach((skin, index) => {
        const card = createSkinCard(skin, index);
        card.addEventListener('click', () => selectSkin(skin, card));
        container.appendChild(card);
    });
}

// 创建皮肤卡片
function createSkinCard(skin, index) {
    const card = document.createElement('div');
    card.className = 'skin-card';
    card.dataset.index = index;
    
    // 简化的皮肤图片占位符
    const qualityColor = CSGO_DATA.qualities[skin.quality].color;
    
    card.innerHTML = `
        <div style="width: 100%; height: 100px; background: linear-gradient(135deg, ${qualityColor}22, ${qualityColor}44); display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 10px;">
            <span style="font-size: 2em;">🔫</span>
        </div>
        <div class="skin-name">${skin.name}</div>
        <div class="skin-price">${formatCurrency(skin.price)}</div>
        <div class="skin-quality quality-${skin.quality}">${CSGO_DATA.qualities[skin.quality].name}</div>
    `;
    
    return card;
}

// 选择皮肤
function selectSkin(skin, cardElement) {
    if (selectedSkins.length >= 10) {
        alert('已经选择了10个皮肤,请先清空选择');
        return;
    }
    
    // 添加到已选择列表
    selectedSkins.push({...skin});
    
    // 更新UI
    cardElement.classList.add('selected');
    updateSelectedSkinsDisplay();
    updateCalculateButton();
}

// 更新已选择皮肤显示
function updateSelectedSkinsDisplay() {
    const container = document.getElementById('selected-skins');
    const countSpan = document.getElementById('selected-count');
    
    countSpan.textContent = selectedSkins.length;
    
    if (selectedSkins.length === 0) {
        container.innerHTML = '<p class="placeholder">请从上方选择10个相同品质的皮肤</p>';
        return;
    }
    
    container.innerHTML = '';
    
    selectedSkins.forEach((skin, index) => {
        const card = createSkinCard(skin, index);
        card.addEventListener('click', () => deselectSkin(index));
        container.appendChild(card);
    });
}

// 取消选择皮肤
function deselectSkin(index) {
    selectedSkins.splice(index, 1);
    
    // 更新UI
    updateSelectedSkinsDisplay();
    updateCalculateButton();
    
    // 移除可用皮肤列表中的选中状态
    document.querySelectorAll('#available-skins .skin-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// 清空选择
function clearSelection() {
    selectedSkins = [];
    updateSelectedSkinsDisplay();
    updateCalculateButton();
    
    // 移除所有选中状态
    document.querySelectorAll('.skin-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 隐藏结果
    document.getElementById('results-section').style.display = 'none';
}

// 更新计算按钮状态
function updateCalculateButton() {
    const btn = document.getElementById('calculate-btn');
    btn.disabled = selectedSkins.length !== 10;
}

// 计算汰换合同
async function calculateTradeUp() {
    if (selectedSkins.length !== 10) {
        alert('请选择恰好10个皮肤');
        return;
    }
    
    const btn = document.getElementById('calculate-btn');
    const originalText = btn.textContent;
    btn.textContent = '计算中...';
    btn.disabled = true;
    
    try {
        // 创建计算器
        currentCalculator = new TradeUpCalculator();
        currentCalculator.setInputSkins(selectedSkins);
        
        // 计算期望收益
        const results = await currentCalculator.calculateExpectedProfit();
        
        // 显示结果
        displayResults(results);
        
        // 滚动到结果区域
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('计算失败:', error);
        alert('计算失败: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// 显示计算结果
function displayResults(results) {
    const section = document.getElementById('results-section');
    section.style.display = 'block';
    
    // 更新汇总数据
    document.getElementById('total-cost').textContent = formatCurrency(results.totalCost);
    document.getElementById('expected-value').textContent = formatCurrency(results.expectedValue);
    
    const profitElement = document.getElementById('profit');
    profitElement.textContent = formatCurrency(results.profit);
    profitElement.style.color = results.profit >= 0 ? '#27ae60' : '#e74c3c';
    
    const roiElement = document.getElementById('roi');
    roiElement.textContent = formatPercent(results.roi);
    roiElement.style.color = results.roi >= 0 ? '#27ae60' : '#e74c3c';
    
    // 更新产出物品表格
    const tbody = document.getElementById('output-tbody');
    tbody.innerHTML = '';
    
    // 按价格降序排列
    const sortedOutputs = [...results.outputs].sort((a, b) => b.price - a.price);
    
    sortedOutputs.forEach(output => {
        const row = document.createElement('tr');
        
        const qualityName = CSGO_DATA.qualities[output.quality].name;
        const qualityClass = `quality-${output.quality}`;
        
        row.innerHTML = `
            <td>${output.name}</td>
            <td><span class="${qualityClass}">${qualityName}</span></td>
            <td>${formatCurrency(output.price)}</td>
            <td>${formatProbability(output.probability)}</td>
            <td>${formatCurrency(output.expectedContribution)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// 更新最后更新时间
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('last-update').textContent = timeString;
}

// 工具函数: 延迟
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

