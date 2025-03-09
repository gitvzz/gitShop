"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIssue = void 0;
const order_1 = __importDefault(require("./order"));
const product_1 = __importDefault(require("./product"));
const handleIssue = async (github, context) => {
    const labels = (context.payload.issue.labels || []).map((label) => label.name);
    if (labels.includes('order')) {
        await new order_1.default(github, context, process.env.PRIVATE_KEY, process.env.WALLET_MNEMONIC).start();
    }
    else if (labels.includes('product')) {
        await new product_1.default(github, context).start();
    }
};
exports.handleIssue = handleIssue;
