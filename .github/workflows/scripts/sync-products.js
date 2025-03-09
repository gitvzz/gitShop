"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncProducts = void 0;
const fs_1 = __importDefault(require("fs"));
const syncProducts = async () => {
    let categoryUrl = 'frontend/public/products/index.json';
    const path = require('path');
    const projectRoot = process.cwd(); // 获取当前工作目录
    categoryUrl = path.join(projectRoot, '..', categoryUrl);
    const category = JSON.parse(fs_1.default.readFileSync(categoryUrl, 'utf8'));
    const products = [];
    category.items.forEach((item) => {
        const productPath = path.join(projectRoot, '..', 'frontend/public/products', `${item.id}.json`);
        if (fs_1.default.existsSync(productPath)) {
            const list = JSON.parse(fs_1.default.readFileSync(productPath, 'utf8'));
            list.forEach((product) => {
                const value = {
                    id: product.id,
                    price: product.price,
                    promotions: {}
                };
                if (product.merchant_id) {
                    value['merchant_id'] = product.merchant_id;
                }
                const { discount_percent, tier_pricing, threshold_discounts } = product.promotions || {};
                if (discount_percent) {
                    value['promotions']['discount_percent'] = discount_percent;
                }
                if (tier_pricing) {
                    value['promotions']['tier_pricing'] = tier_pricing.map((t) => ({
                        min_quantity: t.min_quantity,
                        discount_percent: t.discount_percent
                    })).filter((_t, index) => index < 2).sort((a, b) => b.min_quantity - a.min_quantity);
                }
                if (threshold_discounts) {
                    value['promotions']['threshold_discounts'] = threshold_discounts.map((t) => ({
                        threshold: t.threshold,
                        discount_amount: t.discount_amount
                    })).filter((_t, index) => index < 2).sort((a, b) => b.threshold - a.threshold);
                }
                products.push(value);
            });
        }
    });
    // 确保data目录存在
    const dataDir = path.join(projectRoot, '..', '_data');
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir);
    }
    // 写入结果到 products.json
    const outputPath = path.join(projectRoot, '..', '_data', 'products.json');
    fs_1.default.writeFileSync(outputPath, JSON.stringify(products, null, 4));
    
};
exports.syncProducts = syncProducts;
