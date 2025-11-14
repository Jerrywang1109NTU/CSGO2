// 汰换合同期望收益计算器

class TradeUpCalculator {
    constructor() {
        this.inputSkins = [];
        this.outputPossibilities = [];
        this.results = null;
    }

    // 设置输入皮肤
    setInputSkins(skins) {
        if (skins.length !== 10) {
            throw new Error('汰换合同需要恰好10个皮肤');
        }

        // 检查品质是否相同
        const qualities = new Set(skins.map(s => s.quality));
        if (qualities.size !== 1) {
            throw new Error('所有输入皮肤必须是相同品质');
        }

        this.inputSkins = skins;
        this.outputPossibilities = getPossibleOutputs(skins);
    }

    // 计算总成本
    calculateTotalCost() {
        return this.inputSkins.reduce((sum, skin) => sum + (skin.price || 0), 0);
    }

    // 计算期望产出价值
    async calculateExpectedValue() {
        if (this.outputPossibilities.length === 0) {
            return 0;
        }

        let expectedValue = 0;
        
        // 获取所有产出物品的价格
        for (const output of this.outputPossibilities) {
            if (!output.price) {
                // 获取价格 (使用Field-Tested磨损)
                output.price = await window.SteamAPI.getSkinPrice(output.name, 'Field-Tested');
            }
            
            // 期望价值 = 价格 × 概率
            const contribution = output.price * output.probability;
            expectedValue += contribution;
            
            // 保存贡献值用于显示
            output.expectedContribution = contribution;
        }

        return expectedValue;
    }

    // 计算完整的期望收益分析
    async calculateExpectedProfit() {
        const totalCost = this.calculateTotalCost();
        const expectedValue = await this.calculateExpectedValue();
        const profit = expectedValue - totalCost;
        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        this.results = {
            totalCost,
            expectedValue,
            profit,
            roi,
            outputs: this.outputPossibilities.map(output => ({
                name: output.name,
                quality: output.quality,
                price: output.price || 0,
                probability: output.probability,
                expectedContribution: output.expectedContribution || 0,
                collectionName: output.collectionName
            }))
        };

        return this.results;
    }

    // 获取最佳产出 (价格最高)
    getBestOutput() {
        if (this.outputPossibilities.length === 0) return null;
        return this.outputPossibilities.reduce((best, current) => 
            (current.price || 0) > (best.price || 0) ? current : best
        );
    }

    // 获取最差产出 (价格最低)
    getWorstOutput() {
        if (this.outputPossibilities.length === 0) return null;
        return this.outputPossibilities.reduce((worst, current) => 
            (current.price || 0) < (worst.price || 0) ? current : worst
        );
    }

    // 计算盈亏平衡概率
    calculateBreakEvenProbability() {
        const totalCost = this.calculateTotalCost();
        let breakEvenProb = 0;

        for (const output of this.outputPossibilities) {
            if ((output.price || 0) >= totalCost) {
                breakEvenProb += output.probability;
            }
        }

        return breakEvenProb * 100; // 转换为百分比
    }

    // 获取详细分析报告
    getDetailedReport() {
        if (!this.results) {
            throw new Error('请先调用 calculateExpectedProfit()');
        }

        const bestOutput = this.getBestOutput();
        const worstOutput = this.getWorstOutput();
        const breakEvenProb = this.calculateBreakEvenProbability();

        return {
            ...this.results,
            bestOutput: bestOutput ? {
                name: bestOutput.name,
                price: bestOutput.price || 0,
                probability: bestOutput.probability
            } : null,
            worstOutput: worstOutput ? {
                name: worstOutput.name,
                price: worstOutput.price || 0,
                probability: worstOutput.probability
            } : null,
            breakEvenProbability: breakEvenProb,
            inputSkins: this.inputSkins.map(s => ({
                name: s.name,
                price: s.price || 0,
                quality: s.quality
            }))
        };
    }

    // 比较多个汰换合同方案
    static compareContracts(contracts) {
        return contracts.map(contract => ({
            inputs: contract.inputSkins.map(s => s.name),
            roi: contract.results?.roi || 0,
            profit: contract.results?.profit || 0,
            breakEvenProb: contract.calculateBreakEvenProbability()
        })).sort((a, b) => b.roi - a.roi);
    }

    // 寻找最优汰换方案 (基于给定的可用皮肤)
    static async findOptimalTradeUp(availableSkins, quality) {
        // 筛选指定品质的皮肤
        const filteredSkins = availableSkins.filter(s => s.quality === quality);
        
        if (filteredSkins.length < 10) {
            throw new Error('可用皮肤数量不足');
        }

        // 按价格排序,选择最便宜的10个
        const sorted = filteredSkins.sort((a, b) => (a.price || 0) - (b.price || 0));
        const selectedSkins = sorted.slice(0, 10);

        const calculator = new TradeUpCalculator();
        calculator.setInputSkins(selectedSkins);
        await calculator.calculateExpectedProfit();

        return calculator;
    }
}

// 格式化货币
function formatCurrency(amount) {
    return '¥' + amount.toFixed(2);
}

// 格式化百分比
function formatPercent(value) {
    return value.toFixed(2) + '%';
}

// 格式化概率
function formatProbability(prob) {
    return (prob * 100).toFixed(2) + '%';
}

// 导出计算器
window.TradeUpCalculator = TradeUpCalculator;
window.formatCurrency = formatCurrency;
window.formatPercent = formatPercent;
window.formatProbability = formatProbability;

