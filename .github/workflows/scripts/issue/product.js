"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const issue_1 = __importDefault(require("./issue"));
class default_1 extends issue_1.default {
    constructor(github, context) {
        super(github, context);
    }
    async start() {
        return 'product updated';
    }
}
exports.default = default_1;
