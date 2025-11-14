// CS:GO 2 武器箱和皮肤数据配置
const CSGO_DATA = {
    // 品质等级定义
    qualities: {
        consumer: { name: '消费级', nextQuality: 'industrial', color: '#b0c3d9' },
        industrial: { name: '工业级', nextQuality: 'mil-spec', color: '#5e98d9' },
        'mil-spec': { name: '军规级', nextQuality: 'restricted', color: '#4b69ff' },
        restricted: { name: '受限', nextQuality: 'classified', color: '#8847ff' },
        classified: { name: '保密', nextQuality: 'covert', color: '#d32ce6' },
        covert: { name: '隐秘', nextQuality: null, color: '#eb4b4b' }
    },

    // 武器箱及其包含的武器
    collections: {
        'dreams_and_nightmares': {
            name: '美梦与噩梦武器箱',
            marketName: 'Dreams %26 Nightmares Case',
            skins: {
                'mil-spec': [
                    'MP9 | Starlight Protector',
                    'Dual Berettas | Melondrama',
                    'G3SG1 | Dream Glade',
                    'MAC-10 | Ensnared',
                    'PP-Bizon | Space Cat',
                    'MAG-7 | BI83 Spectrum',
                    'XM1014 | Zombie Offensive'
                ],
                'restricted': [
                    'FAMAS | Rapid Eye Movement',
                    'MP7 | Abyssal Apparition',
                    'USP-S | Ticket to Hell',
                    'Dual Berettas | Dezastre',
                    'CZ75-Auto | Circaetus'
                ],
                'classified': [
                    'M4A4 | Temukau',
                    'AK-47 | Nightwish',
                    'MP5-SD | Necro Jr.'
                ],
                'covert': [
                    'AWP | Duality',
                    'M4A1-S | Night Terror'
                ]
            }
        },
        'revolution': {
            name: '革命武器箱',
            marketName: 'Revolution Case',
            skins: {
                'mil-spec': [
                    'Tec-9 | Rebel',
                    'P250 | Re.built',
                    'R8 Revolver | Crazy 8',
                    'Galil AR | Destroyer',
                    'P90 | Neoqueen',
                    'Sawed-Off | Analog Input',
                    'MAC-10 | Sakkaku'
                ],
                'restricted': [
                    'M4A4 | Etch Lord',
                    'Zeus x27 | Olympus',
                    'AUG | Momentum',
                    'SG 553 | Cyberforce',
                    'AWP | Devourer'
                ],
                'classified': [
                    'FAMAS | Rapid Eye Movement',
                    'Glock-18 | Umbral Rabbit',
                    'P2000 | Wicked Sick'
                ],
                'covert': [
                    'AK-47 | Head Shot',
                    'M4A1-S | Emphorosaur-S'
                ]
            }
        },
        'recoil': {
            name: '反冲武器箱',
            marketName: 'Recoil Case',
            skins: {
                'mil-spec': [
                    'Negev | Drop Me',
                    'MP9 | Mount Fuji',
                    'P250 | Re.built',
                    'Sawed-Off | Kiss♥Love',
                    'M249 | Downtown',
                    'Glock-18 | Winterized',
                    'Dual Berettas | Flora Carnivora'
                ],
                'restricted': [
                    'AWP | Chromatic Aberration',
                    'AK-47 | Ice Coaled',
                    'USP-S | Printstream',
                    'P90 | Vent Rush',
                    'MAC-10 | Copper Borre'
                ],
                'classified': [
                    'M4A4 | Poly Mag',
                    'UMP-45 | Wild Child',
                    'Desert Eagle | Ocean Drive'
                ],
                'covert': [
                    'AWP | Chromatic Aberration',
                    'AK-47 | Ice Coaled'
                ]
            }
        },
        'kilowatt': {
            name: '千瓦武器箱',
            marketName: 'Kilowatt Case',
            skins: {
                'mil-spec': [
                    'Nova | Dark Sigil',
                    'M249 | Emerald Poison Dart',
                    'Tec-9 | Slag',
                    'P250 | Cyber Shell',
                    'UMP-45 | Motorized',
                    'Five-SeveN | Hybrid Hunter',
                    'MAC-10 | Light Box'
                ],
                'restricted': [
                    'M4A1-S | Black Lotus',
                    'Glock-18 | Block-18',
                    'USP-S | Cyrex',
                    'Zeus x27 | Cryo',
                    'Sawed-Off | Analog Input'
                ],
                'classified': [
                    'AUG | Lexicon',
                    'AWP | Duality',
                    'Dual Berettas | Hideout'
                ],
                'covert': [
                    'Zeus x27 | Olympus',
                    'AK-47 | Inheritance'
                ]
            }
        }
    },

    // 开箱概率 (标准CS:GO概率)
    caseProbabilities: {
        'mil-spec': 0.7992,      // 79.92%
        'restricted': 0.1598,    // 15.98%
        'classified': 0.0320,    // 3.20%
        'covert': 0.0064,        // 0.64%
        'knife': 0.0026          // 0.26% (刀/手套)
    },

    // 汰换合同规则
    tradeUpRules: {
        requiredItems: 10,
        sameQualityRequired: true,
        // 产出概率根据输入物品的来源武器箱计算
        // 每个武器箱的贡献比例 = 该箱子的物品数量 / 总物品数量
        calculateOutputProbability: (inputs) => {
            const collectionCount = {};
            inputs.forEach(item => {
                collectionCount[item.collection] = (collectionCount[item.collection] || 0) + 1;
            });
            
            const probabilities = {};
            for (const [collection, count] of Object.entries(collectionCount)) {
                probabilities[collection] = count / inputs.length;
            }
            return probabilities;
        }
    }
};

// 获取下一品质等级
function getNextQuality(currentQuality) {
    return CSGO_DATA.qualities[currentQuality]?.nextQuality || null;
}

// 获取所有武器箱列表
function getAllCollections() {
    return Object.entries(CSGO_DATA.collections).map(([id, data]) => ({
        id,
        name: data.name,
        marketName: data.marketName
    }));
}

// 获取指定武器箱的指定品质的所有皮肤
function getSkinsFromCollection(collectionId, quality) {
    const collection = CSGO_DATA.collections[collectionId];
    if (!collection || !collection.skins[quality]) {
        return [];
    }
    return collection.skins[quality].map(name => ({
        name,
        quality,
        collection: collectionId,
        collectionName: collection.name
    }));
}

// 获取可能的产出物品
function getPossibleOutputs(inputSkins) {
    const inputQuality = inputSkins[0].quality;
    const outputQuality = getNextQuality(inputQuality);
    
    if (!outputQuality) {
        return [];
    }

    // 计算每个武器箱的贡献概率
    const collectionProbabilities = CSGO_DATA.tradeUpRules.calculateOutputProbability(inputSkins);
    
    // 获取所有可能的产出物品
    const outputs = [];
    for (const [collectionId, probability] of Object.entries(collectionProbabilities)) {
        const skins = getSkinsFromCollection(collectionId, outputQuality);
        if (skins.length > 0) {
            // 每个物品在该武器箱中的概率均等
            const itemProbability = probability / skins.length;
            skins.forEach(skin => {
                outputs.push({
                    ...skin,
                    probability: itemProbability
                });
            });
        }
    }
    
    return outputs;
}

