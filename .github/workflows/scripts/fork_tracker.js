"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForkTrackerAction = void 0;
const base_action_1 = require("./base/base-action");
class ForkTrackerAction extends base_action_1.BaseAction {
    async execute() {
    }
}
exports.ForkTrackerAction = ForkTrackerAction;
// 执行Action
if (require.main === module) {
    const action = new ForkTrackerAction();
    action.execute().catch(error => {
        console.error('Action执行失败:', error);
        process.exit(1);
    });
}
