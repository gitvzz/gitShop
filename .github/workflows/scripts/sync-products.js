"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncProducts = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const syncProducts = async () => {
    // 获取当前工作目录
    const projectRoot = process.cwd();
    const categoryUrl = path_1.default.join(projectRoot, 'frontend/public/products/index.json');
    console.log(`尝试读取文件: ${categoryUrl}`);
    console.log(`当前工作目录: ${projectRoot}`);
    console.log(`目录内容: ${fs_1.default.readdirSync(projectRoot).join(', ')}`);
    console.log(`frontend 目录内容: ${fs_1.default.existsSync(path_1.default.join(projectRoot, 'frontend')) ? fs_1.default.readdirSync(path_1.default.join(projectRoot, 'frontend')).join(', ') : '目录不存在'}`);
    const category = JSON.parse(fs_1.default.readFileSync(categoryUrl, 'utf8'));
    const products = [];
    category.items.forEach((item) => {
        const productPath = path_1.default.join(projectRoot, 'frontend/public/products', `${item.id}.json`);
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
    const dataDir = path_1.default.join(projectRoot, '_data');
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir);
    }
    // 写入结果到 products.json
    const outputPath = path_1.default.join(projectRoot, '_data', 'products.json');
    console.log(`写入结果到: ${outputPath}`);
    fs_1.default.writeFileSync(outputPath, JSON.stringify(products, null, 4));
};
exports.syncProducts = syncProducts;
// 自动执行函数（当直接运行此脚本时）
if (require.main === module) {
    (0, exports.syncProducts)().catch(err => {
        console.error('同步产品数据时出错:', err);
        process.exit(1);
    });
}
