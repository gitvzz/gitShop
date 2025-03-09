import fs from 'fs';
import path from 'path';

export const syncProducts = async () => {
    // 获取当前工作目录
    const projectRoot = process.cwd();
    
    const categoryUrl = path.join(projectRoot, 'frontend/public/products/index.json');
    
    const category = JSON.parse(fs.readFileSync(categoryUrl, 'utf8'));
    const products = [] as any[];
    
    category.items.forEach((item: any) => {
        const productPath = path.join(projectRoot, 'frontend/public/products', `${item.id}.json`);
        if (fs.existsSync(productPath)) {
            const list = JSON.parse(fs.readFileSync(productPath, 'utf8'));
            list.forEach((product: any) => {
                const value = {
                    id: product.id,
                    price: product.price,
                    promotions: {}
                } as any
                if (product.merchant_id) {
                    value['merchant_id'] = product.merchant_id;
                }
                const { discount_percent, tier_pricing, threshold_discounts } = product.promotions || {};
                if (discount_percent) {
                    value['promotions']['discount_percent'] = discount_percent;
                }
                if (tier_pricing) {
                    value['promotions']['tier_pricing'] = tier_pricing.map((t: any) => ({
                        min_quantity: t.min_quantity,
                        discount_percent: t.discount_percent
                    })).filter((_t: any, index: number) => index < 2).sort((a: any, b: any) => b.min_quantity - a.min_quantity);
                }
                if (threshold_discounts) {
                    value['promotions']['threshold_discounts'] = threshold_discounts.map((t: any) => ({
                        threshold: t.threshold,
                        discount_amount: t.discount_amount
                    })).filter((_t: any, index: number) => index < 2).sort((a: any, b: any) => b.threshold - a.threshold);
                }
                products.push(value);
            })
        }
    });
    
    // 确保data目录存在
    const dataDir = path.join(projectRoot, '_data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    
    // 写入结果到 products.json
    const outputPath = path.join(projectRoot,  '_data/products.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 4));
    
}

// 自动执行函数（当直接运行此脚本时）
if (require.main === module) {
    syncProducts().catch(err => {
        console.error('同步商品价格时出错:', err);
        process.exit(1);
    });
}

