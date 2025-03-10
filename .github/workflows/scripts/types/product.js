"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const utils_1 = require("../utils");
class Product {
    constructor(data, options) {
        this.locale = options === null || options === void 0 ? void 0 : options.locale;
        const strict = options === null || options === void 0 ? void 0 : options.strict;
        this.id = (0, utils_1.formatId)(data.id);
        this.name = (0, utils_1.formatStringOrObject)('name', data.name, true, strict ? [2, 20] : undefined);
        this.currency = ((0, utils_1.isEmpty)(data.currency) || typeof data.currency !== 'string') ? 'USDT' : data.currency;
        this.merchant_id = data.merchant_id;
        this.price = (0, utils_1.is)(data.price, 'number') ? data.price : 0;
        if (this.price <= 0) {
            throw new Error('price is invalid');
        }
        this.description = (0, utils_1.formatStringOrObject)('description', data.description, true, strict ? [10, 500] : undefined);
        if ((0, utils_1.isEmpty)(data.images)) {
            throw new Error('images is required');
        }
        if (!(0, utils_1.is)(data.images, 'array')) {
            throw new Error('images is invalid');
        }
        this.images = data.images.map(utils_1.formatImage).filter((_, index) => index < 5);
        this.requires_shipping = (0, utils_1.is)(data.requires_shipping, 'boolean') ? data.requires_shipping : false;
        this.features = [];
        if (data.features) {
            if (!(0, utils_1.is)(data.features, 'array')) {
                throw new Error('features is invalid');
            }
            this.features = (data.features || []).filter((_, index) => index < 5).map(f => {
                return (0, utils_1.formatStringOrObject)('features', f, true, strict ? [2, 50] : undefined);
            });
        }
        this.stock = 0;
        if (this.requires_shipping) {
            if (!(0, utils_1.is)(data.stock, 'number')) {
                throw new Error('stock must be a number');
            }
            this.stock = data.stock >= 0 ? data.stock : 0;
        }
        this.rating = data.rating || 0;
        this.reviews = data.reviews || 0;
        if (data.distribution_percent && !(0, utils_1.is)(data.distribution_percent, 'number')) {
            throw new Error('distribution_percent is invalid');
        }
        this.distribution_percent = data.distribution_percent || 0;
        this.tags = [];
        if (data.tags) {
            if (!(0, utils_1.is)(data.tags, 'array')) {
                throw new Error('tags is invalid');
            }
            this.tags = (data.tags || []).filter((_, index) => index < 5).map(t => {
                return (0, utils_1.formatStringOrObject)('tags', t, true, strict ? [2, 20] : undefined);
            });
        }
        this.related_products = data.related_products || [];
        this.promotions = {};
        const promotions = data.promotions || {};
        if (promotions.discount_percent) {
            if (!(0, utils_1.is)(promotions.discount_percent, 'number')) {
                throw new Error('discount_percent is invalid');
            }
            this.promotions.discount_percent = promotions.discount_percent;
        }
        else if (promotions.tier_pricing) {
            if (!(0, utils_1.is)(promotions.tier_pricing, 'array')) {
                throw new Error('tier_pricing is invalid');
            }
            const tier_pricings = [];
            for (const tier of promotions.tier_pricing) {
                if (!(0, utils_1.is)(tier, 'object')) {
                    throw new Error('tier_pricing is invalid');
                }
                let { min_quantity, discount_percent, description } = tier;
                if (!(0, utils_1.is)(min_quantity, 'number')) {
                    throw new Error('min_quantity is invalid');
                }
                if (!(0, utils_1.is)(discount_percent, 'number')) {
                    throw new Error('discount_percent is invalid');
                }
                description = (0, utils_1.formatStringOrObject)('description', description, true, strict ? [2, 50] : undefined);
                tier_pricings.push({ min_quantity, discount_percent, description });
            }
            this.promotions.tier_pricing = tier_pricings.filter((_, index) => index < 2).sort((a, b) => b.min_quantity - a.min_quantity);
        }
        else if (promotions.threshold_discounts) {
            if (!(0, utils_1.is)(promotions.threshold_discounts, 'array')) {
                throw new Error('threshold_discounts is invalid');
            }
            const threshold_discounts = [];
            for (const x of promotions.threshold_discounts) {
                if (!(0, utils_1.is)(x, 'object')) {
                    throw new Error('threshold_discounts is invalid');
                }
                let { threshold, discount_amount, description } = x;
                if (!(0, utils_1.is)(threshold, 'number')) {
                    throw new Error('threshold is invalid');
                }
                if (!(0, utils_1.is)(discount_amount, 'number')) {
                    throw new Error('discount_amount is invalid');
                }
                description = (0, utils_1.formatStringOrObject)('description', description, true, strict ? [2, 50] : undefined);
                threshold_discounts.push({ threshold, discount_amount, description });
            }
            this.promotions.threshold_discounts = threshold_discounts.filter((_, index) => index < 2).sort((a, b) => b.threshold - a.threshold);
        }
    }
    get displayName() {
        return this.name[this.locale || '_'] || Object.values(this.name)[0];
    }
    get displayDescription() {
        return this.description[this.locale || '_'] || Object.values(this.description)[0];
    }
    get displayFeatures() {
        return this.features.map(f => f[this.locale || '_'] || Object.values(f)[0]);
    }
    get displayTags() {
        return this.tags.map(t => t[this.locale || '_'] || Object.values(t)[0]);
    }
    get json() {
        const data = {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            currency: this.currency,
            images: this.images,
            requires_shipping: this.requires_shipping,
            features: this.features,
            stock: this.stock,
            rating: this.rating,
            reviews: this.reviews,
            tags: this.tags,
            related_products: this.related_products,
            promotions: this.promotions,
            distribution_percent: this.distribution_percent,
            merchant_id: this.merchant_id
        };
        if (!this.merchant_id) {
            delete data.merchant_id;
        }
        return data;
    }
}
exports.Product = Product;
