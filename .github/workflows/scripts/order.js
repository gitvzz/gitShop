"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAction = void 0;
const issue_action_1 = require("./base/issue-action");
/**
 * 订单处理
 */
class OrderAction extends issue_action_1.IssueAction {
    async execute() {
        try {
            this.log('开始处理新订单...');
            console.log(this.context.payload);
        }
        catch (error) {
            this.fail(`处理新订单时出错: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.OrderAction = OrderAction;
if (require.main === module) {
    const action = new OrderAction();
    action.execute().catch(error => {
        console.error('Action执行失败:', error);
        process.exit(1);
    });
}
