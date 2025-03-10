"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const utils_1 = require("../utils");
class Category {
    constructor(data, options) {
        this.locale = options === null || options === void 0 ? void 0 : options.locale;
        const strict = options === null || options === void 0 ? void 0 : options.strict;
        this.id = (0, utils_1.formatId)(data.id);
        this.name = (0, utils_1.formatStringOrObject)('name', data.name, true, strict ? [2, 20] : undefined);
        this.description = (0, utils_1.formatStringOrObject)('description', data.description, true, strict ? [5, 200] : undefined);
        this.image = (0, utils_1.formatImage)(data.image);
    }
    get displayName() {
        return this.name[this.locale || '_'] || Object.values(this.name)[0];
    }
    get displayDescription() {
        return this.description[this.locale || '_'] || Object.values(this.description)[0];
    }
    get json() {
        return {
            id: this.id,
            name: this.displayName,
            description: this.description,
            image: this.image
        };
    }
}
exports.Category = Category;
