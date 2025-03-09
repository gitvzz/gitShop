"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIssue = void 0;
const order_1 = __importDefault(require("./order"));
const product_1 = __importDefault(require("./product"));
const distributor_1 = __importDefault(require("./distributor"));
const distributorTitleRegex = /^Distributor #([a-zA-Z0-9-_]+)$/i;
const handleIssue = async (github, context) => {
    //const labels = (context.payload.issue.labels || []).map((label: any) => label.name);
    const title = context.payload.issue.title;
    if (/^Order ORDER-\d{8}-[A-Z0-9]{6}$/.test(title)) {
        await new order_1.default(github, context, process.env.PRIVATE_KEY, process.env.WALLET_MNEMONIC).start();
        return { order: true };
    }
    else if (title.toLowerCase() === 'product' || title.toLowerCase() === 'category') {
        return await new product_1.default(github, context, title.toLowerCase()).start();
    }
    else if (distributorTitleRegex.test(title)) {
        const match = title.match(distributorTitleRegex);
        return await new distributor_1.default(github, context, match[1]).start();
    }
};
exports.handleIssue = handleIssue;
