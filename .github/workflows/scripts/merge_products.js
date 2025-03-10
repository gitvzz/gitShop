"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const types_1 = require("./types");
function default_1(sourceDir, targetDir) {
    // 检查源目录是否存在
    if (!(0, fs_1.existsSync)(sourceDir)) {
        throw new Error('products 目录不存在！');
    }
    // 遍历根目录下的所有文件夹
    const files = (0, fs_1.readdirSync)(sourceDir);
    const categories = files.filter(file => {
        const filePath = path_1.default.join(sourceDir, file);
        return (0, fs_1.statSync)(filePath).isDirectory();
    });
    const result = [];
    for (const category of categories) {
        const categoryPath = path_1.default.join(sourceDir, category);
        const categoryFile = path_1.default.join(categoryPath, '_.json');
        if (!(0, fs_1.existsSync)(categoryFile)) {
            continue;
        }
        const categoryData = JSON.parse((0, fs_1.readFileSync)(categoryFile, 'utf8'));
        const categoryJson = new types_1.Category(categoryData, { strict: false }).json;
        const files = (0, fs_1.readdirSync)(categoryPath);
        const products = files.filter(file => {
            const filePath = path_1.default.join(categoryPath, file);
            return file !== '_.json' && file.endsWith('.json') && (0, fs_1.statSync)(filePath).isFile();
        });
        for (const file of products) {
            const productPath = path_1.default.join(categoryPath, file);
            const productData = JSON.parse((0, fs_1.readFileSync)(productPath, 'utf8'));
            const productJson = new types_1.Product(productData, { strict: false }).json;
            if (!categoryJson.products) {
                categoryJson.products = [];
            }
            categoryJson.products.push(productJson);
        }
        if (categoryJson.products.length > 0) {
            result.push(categoryJson);
        }
    }
    (0, fs_1.writeFileSync)(targetDir, JSON.stringify(result, null, 2));
    return result;
}
