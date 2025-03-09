import Issue from './issue';
import path from 'path';
import fs from 'fs';

export default class extends Issue {
    private type: 'product' | 'category';
    constructor(github: any, context: any,tgTokenApi: string, type: 'product' | 'category') {
        super(github, context,tgTokenApi);
        this.type = type;
    }

    private async getCategoryData() {
        const projectRoot = process.cwd();
        let url = path.join(projectRoot, 'frontend/public/products/index.json');
        const data = JSON.parse(fs.readFileSync(url, 'utf8'));
        return data;
    }

    private async getProductData(category_id: string) {
        const projectRoot = process.cwd();
        let url = path.join(projectRoot, `frontend/public/products/${category_id}.json`);
        if(!fs.existsSync(url)){
            return [];
        }
        const data = JSON.parse(fs.readFileSync(url, 'utf8'));
        return data;
    }

    private async saveProductData(data: any) {
        let { id, name, description, price,
            images, category_id, requires_shipping,
            features, stock, tags,
            related_products, promotions
        } = data;
        if (!id || !name || !description || !price || !images || !category_id) {
            return { success: false, message: 'Invalid product data' };
        }
        if (typeof id !== 'string' || !/^[\w-]{3,15}$/.test(id)) {
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
        if (typeof category_id !== 'string' || !/^[\w-]{3,15}$/.test(category_id)) {
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
        if (images.some((image: any) => typeof image !== 'object' || !image.src || !image.alt || typeof image.src !== 'string' || !/^https?:\/\/[^\s]+$/.test(image.src) || typeof image.alt !== 'string' || image.alt.length < 3 || image.alt.length > 100)) {
            return { success: false, message: 'Invalid product images' };
        }
        const category_list = await this.getCategoryData();
        const category = category_list.find((item: any) => item.id === category_id);
        if (!category) {
            return { success: false, message: 'Category not found' };
        }
        let product_list = await this.getProductData(category_id);
        if (product_list) {
            const item = product_list.find((item: any) => item.id === id);
            if (item) {
                return { success: false, message: 'Product already exists' };
            }
        }
        const product = {
            id,
            name,
            description,
            price,
            currency: 'USDT',
            images: images.filter((_, index) => index < 5).map((image: any) => ({ src: image.src, alt: image.alt })),
            category_id,
            requires_shipping,
            features,
            stock,
            reviews: 0,
            rating: 0,
            tags,
            related_products: related_products || [],
            promotions,
            merchant_id: this.username
        }
        if (product_list) {
            product_list.push(product);
        } else {
            product_list = [product];
        }
        const projectRoot = process.cwd();
        const outputPath = path.join(projectRoot, `frontend/public/products/${category_id}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(product_list, null, 4));
        const url = `https://${this.context.repo.owner}.github.io/${this.context.repo.repo}/#/product/${product.id}`;
        return { success: true, message: `Product saved successfully. [${product.name}](${url})` };
    }

    private async saveCategoryData(data: any) {
        const { id, name, description, image } = data;
        if (!id || !name || !description || !image) {
            return { success: false, message: 'Invalid category data' };
        }
        if (typeof id !== 'string' || !/^[\w-]{3,15}$/.test(id)) {
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
        if (category_list.find((item: any) => item.id === id)) {
            return { success: false, message: 'Category already exists' };
        } else {
            category_list.push(data);
        }
        const projectRoot = process.cwd();
        const outputPath = path.join(projectRoot, 'frontend/public/products/index.json');
        fs.writeFileSync(outputPath, JSON.stringify(category_list, null, 4));
        return { success: true, message: 'Category saved successfully\n\nPlease continue to add products of this category' };
    }

    async start() {
        if (this.type !== 'product' && this.type !== 'category') {
            await this.createComment('Invalid issue title');
            await this.updateIssue('closed', ['invalid']);
            return {};
        }
        const data = this.getDistributor();
        const distributor = data.find((item: any) => item.username === this.username);
        if (!distributor) {
            await this.createComment('You must become a distributor before you can list products.');
            await this.updateIssue('closed', ['invalid']);
            return {};
        }
        try {
            let result = { success: false, message: 'Unknown error' };
            if (this.type === 'product') {
                result = await this.saveProductData(JSON.parse(this.issueBody));
            } else {
                result = await this.saveCategoryData(JSON.parse(this.issueBody));
            }
            if (result.success) {
                await this.createComment(result.message);
                await this.updateIssue('closed', ['success']);
                return { products: true };
            } else {
                await this.createComment(result.message);
                await this.updateIssue('closed', ['invalid']);
                return {};
            }
        } catch (e: any) {
            await this.createComment(`Invalid product data: ${e.message}`);
            await this.updateIssue('closed', ['invalid']);
            return {};
        }
    }
}
