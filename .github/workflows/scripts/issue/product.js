"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const issue_1 = __importDefault(require("./issue"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class default_1 extends issue_1.default {
    constructor(github, context, type) {
        super(github, context);
        this.type = type;
    }
    async getCategoryData() {
        const projectRoot = process.cwd();
        let url = path_1.default.join(projectRoot, 'frontend/public/products/index.json');
        const data = JSON.parse(fs_1.default.readFileSync(url, 'utf8'));
        return data.items;
    }
    async getProductData(category_id) {
        const projectRoot = process.cwd();
        let url = path_1.default.join(projectRoot, `frontend/public/products/${category_id}.json`);
        const data = JSON.parse(fs_1.default.readFileSync(url, 'utf8'));
        return data;
    }
    async saveProductData(data) {
        let { id, name, description, price, images, category_id, requires_shipping, features, stock, tags, related_products, promotions } = data;
        if (!id || !name || !description || !price || !images || !category_id) {
            return { success: false, message: 'Invalid product data' };
        }
        if (typeof id !== 'string' || /^[\w-]{3,15}$/.test(id)) {
            return { success: false, message: 'Invalid product id' };
        }
        if (typeof name !== 'string' || name.length < 3 || name.length > 20) {
            return { success: false, message: 'Invalid product name' };
        }
        if (typeof description !== 'string' || description.length < 3 || description.length > 1000) {
            return { success: false, message: 'Invalid product description' };
        }
        if (typeof price !== 'number' || price <= 0 || price > 1000000) {
            return { success: false, message: 'Invalid product price' };
        }
        if (typeof images !== 'object' || !Array.isArray(images) || images.length === 0) {
            return { success: false, message: 'Invalid product images' };
        }
        if (typeof category_id !== 'string' || /^[\w-]{3,15}$/.test(category_id)) {
            return { success: false, message: 'Invalid product category id' };
        }
        if (requires_shipping !== undefined && typeof requires_shipping !== 'boolean') {
            return { success: false, message: 'Invalid product requires_shipping' };
        }
        if (features !== undefined && (!Array.isArray(features) || features.length === 0)) {
            return { success: false, message: 'Invalid product features' };
        }
        if (stock !== undefined && (typeof stock !== 'number' || stock < 0 || stock > 1000000)) {
            return { success: false, message: 'Invalid product stock' };
        }
        if (tags !== undefined && (!Array.isArray(tags) || tags.length === 0)) {
            return { success: false, message: 'Invalid product tags' };
        }
        if (related_products !== undefined && (!Array.isArray(related_products) || related_products.length === 0)) {
            return { success: false, message: 'Invalid product related_products' };
        }
        if (promotions !== undefined && typeof promotions !== 'object') {
            return { success: false, message: 'Invalid product promotions' };
        }
        if (images.some((image) => typeof image !== 'object' || !image.src || !image.alt || typeof image.src !== 'string' || !/^https?:\/\/[^\s]+$/.test(image.src) || typeof image.alt !== 'string' || image.alt.length < 3 || image.alt.length > 100)) {
            return { success: false, message: 'Invalid product images' };
        }
        const category_list = await this.getCategoryData();
        const category = category_list.find((item) => item.id === category_id);
        if (!category) {
            return { success: false, message: 'Category not found' };
        }
        const product_list = await this.getProductData(category_id);
        const item = product_list.find((item) => item.id === id);
        if (item) {
            return { success: false, message: 'Product already exists' };
        }
        const product = {
            id,
            name,
            description,
            price,
            currency: 'USDT',
            images: images.filter((_, index) => index < 5).map((image) => ({ src: image.src, alt: image.alt })),
            category_id,
            requires_shipping,
            features,
            stock,
            reviews: 0,
            rating: 0,
            tags,
            related_products,
            promotions,
            merchant_id: this.username
        };
        product_list.push(product);
        const projectRoot = process.cwd();
        const outputPath = path_1.default.join(projectRoot, `frontend/public/products/${category_id}.json`);
        fs_1.default.writeFileSync(outputPath, JSON.stringify(product_list, null, 4));
        const url = `https://${this.context.repo.owner}.github.io/${this.context.repo.repo}/#/product/${product.id}`;
        return { success: true, message: `Product saved successfully. [${product.name}](${url})` };
    }
    async saveCategoryData(data) {
        const { id, name, description, image } = data;
        if (!id || !name || !description || !image) {
            return { success: false, message: 'Invalid category data' };
        }
        if (typeof id !== 'string' || /^[\w-]{3,15}$/.test(id)) {
            return { success: false, message: 'Invalid category id' };
        }
        if (typeof name !== 'string' || name.length < 3 || name.length > 20) {
            return { success: false, message: 'Invalid category name' };
        }
        if (typeof description !== 'string' || description.length < 3 || description.length > 1000) {
            return { success: false, message: 'Invalid category description' };
        }
        if (typeof image !== 'object' || !image.src || !image.alt) {
            return { success: false, message: 'Invalid category image' };
        }
        if (typeof image.src !== 'string' || !/^https?:\/\/[^\s]+$/.test(image.src)) {
            return { success: false, message: 'Invalid category image source' };
        }
        if (typeof image.alt !== 'string' || image.alt.length < 3 || image.alt.length > 100) {
            return { success: false, message: 'Invalid category image alt' };
        }
        const category_list = await this.getCategoryData();
        if (category_list.find((item) => item.id === id)) {
            return { success: false, message: 'Category already exists' };
        }
        else {
            category_list.push(data);
        }
        const projectRoot = process.cwd();
        const outputPath = path_1.default.join(projectRoot, 'frontend/public/products/index.json');
        fs_1.default.writeFileSync(outputPath, JSON.stringify(category_list, null, 4));
        return { success: true, message: 'Category saved successfully\n\nPlease continue to add products of this category' };
    }
    async start() {
        if (this.type !== 'product' && this.type !== 'category') {
            await this.createComment('Invalid issue title');
            await this.updateIssue('closed', ['invalid']);
            return {};
        }
        const data = this.getDistributor();
        const distributor = data.find((item) => item.username === this.username);
        if (!distributor) {
            await this.createComment('You must become a distributor before you can list products.');
            await this.updateIssue('closed', ['invalid']);
            return {};
        }
        try {
            let result = { success: false, message: 'Unknown error' };
            if (this.type === 'product') {
                result = await this.saveProductData(JSON.parse(this.issueBody));
            }
            else {
                result = await this.saveCategoryData(JSON.parse(this.issueBody));
            }
            if (result.success) {
                await this.createComment(result.message);
                await this.updateIssue('closed', ['success']);
                if (this.type === 'product') {
                    return { products: true };
                }
                else {
                    return { category: true };
                }
            }
            else {
                await this.createComment(result.message);
                await this.updateIssue('closed', ['invalid']);
                return {};
            }
        }
        catch (e) {
            await this.createComment(`Invalid product data: ${e.message}`);
            await this.updateIssue('closed', ['invalid']);
            return {};
        }
    }
}
exports.default = default_1;
