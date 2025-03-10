"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductAction = void 0;
const base_action_1 = require("./base/base-action");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const merge_products_1 = __importDefault(require("./merge_products"));
const fs_1 = require("fs");
/**
 * 处理商品相关操作的Action类
 */
class ProductAction extends base_action_1.BaseAction {
    async execute() {
        try {
            // 合并商品数据
            const result = await this.merge();
            // 生成商品数据摘要
            await this.summary(result);
            // 提交商品摘要到仓库
            const hasChanges = await this.commitProductsToRepo();
            // 如果有变更并成功提交，触发部署工作流
            if (hasChanges) {
                await this.triggerDeployWorkflow();
            }
            this.log('商品数据处理完成');
        }
        catch (error) {
            this.fail(`处理商品数据失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 合并商品数据
     */
    async merge() {
        this.log('开始合并商品数据');
        const sourceDir = path.resolve(process.cwd(), 'products');
        const targetDir = `${sourceDir}/_.json`;
        const result = (0, merge_products_1.default)(sourceDir, targetDir);
        const data = { category_count: 0, product_count: 0 };
        for (const item of result) {
            data.category_count++;
            data.product_count += item.products.length;
        }
        this.log(`合并商品数据完成，分类数量：${data.category_count} 商品数量：${data.product_count}`);
        this.log(`商品数据已保存到 ${targetDir}`);
        return result;
    }
    /**
     * 生成商品数据摘要
     */
    async summary(categories) {
        this.log('开始生成商品数据摘要');
        const products = [];
        categories.forEach((category) => {
            category.products.forEach((product) => {
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
                else if (tier_pricing) {
                    value['promotions']['tier_pricing'] = tier_pricing.map((t) => ({
                        min_quantity: t.min_quantity,
                        discount_percent: t.discount_percent
                    }));
                }
                else if (threshold_discounts) {
                    value['promotions']['threshold_discounts'] = threshold_discounts.map((t) => ({
                        threshold: t.threshold,
                        discount_amount: t.discount_amount
                    })).filter((_t, index) => index < 2).sort((a, b) => b.threshold - a.threshold);
                }
                products.push(value);
            });
        });
        const target = path.resolve(process.cwd(), 'products/.summary.json');
        (0, fs_1.writeFileSync)(target, JSON.stringify(products, null, 4));
        this.log(`商品数据摘要已保存到 ${target}`);
    }
    /**
     * 提交商品价格到仓库
     * @returns 是否有变更需要提交
     */
    async commitProductsToRepo() {
        this.log('准备提交商品价格到仓库...');
        try {
            // 配置Git
            this.log('配置Git用户信息');
            (0, child_process_1.execSync)('git config --local user.email "action@github.com"', { stdio: 'pipe' });
            (0, child_process_1.execSync)('git config --local user.name "GitHub Action"', { stdio: 'pipe' });
            // 添加商品数据文件
            this.log('添加商品摘要文件到暂存区');
            (0, child_process_1.execSync)('git add products/.summary.json', { stdio: 'pipe' });
            // 检查是否有变更需要提交
            let hasChanges = false;
            try {
                (0, child_process_1.execSync)('git diff --staged --quiet', { stdio: 'pipe' });
                this.log('.summary.json 没有变化，跳过提交');
            }
            catch (error) {
                // 如果命令返回非零退出码，表示有变更
                hasChanges = true;
                // 提交更改
                this.log('提交更改');
                (0, child_process_1.execSync)('git commit -m "自动更新商品摘要"', { stdio: 'pipe' });
                // 强制推送更改
                this.log('强制推送更改到仓库...');
                (0, child_process_1.execSync)('git push --force', { stdio: 'pipe' });
                this.log('成功强制更新并提交 .summary.json');
            }
            return hasChanges;
        }
        catch (error) {
            throw new Error(`提交商品摘要失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 触发部署工作流
     */
    async triggerDeployWorkflow() {
        this.log('正在触发部署工作流...');
        try {
            // 使用GitHub CLI触发部署工作流
            const command = 'gh workflow run deploy.yml -f deploy_message="商品更新后的自动部署"';
            // 确保GITHUB_TOKEN环境变量可用
            const token = process.env.GITHUB_TOKEN;
            if (!token) {
                throw new Error('缺少GITHUB_TOKEN环境变量');
            }
            // 执行命令
            const env = { ...process.env, GITHUB_TOKEN: token };
            (0, child_process_1.execSync)(command, { env, stdio: 'pipe' });
            this.log('成功触发部署工作流');
        }
        catch (error) {
            throw new Error(`触发部署工作流失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.ProductAction = ProductAction;
// 执行Action
if (require.main === module) {
    const action = new ProductAction();
    action.execute().catch(error => {
        console.error('Action执行失败:', error);
        process.exit(1);
    });
}
