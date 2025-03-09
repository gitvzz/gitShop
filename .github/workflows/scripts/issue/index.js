"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIssue = void 0;
const order_1 = __importDefault(require("./order"));
const product_1 = __importDefault(require("./product"));
const distributor_1 = __importDefault(require("./distributor"));
const handleIssue = async (github, context) => {
    //const labels = (context.payload.issue.labels || []).map((label: any) => label.name);
    const title = context.payload.issue.title;
    if (/^Order ORDER-\d{8}-[A-Z0-9]{6}$/.test(title)) {
        await new order_1.default(github, context, process.env.PRIVATE_KEY, process.env.WALLET_MNEMONIC).start();
    }
    else if (title === 'Product put on shelves') {
        await new product_1.default(github, context).start();
    }
    else if (title === 'Become a Distributor') {
        await new distributor_1.default(github, context).start();
    }
};
exports.handleIssue = handleIssue;
