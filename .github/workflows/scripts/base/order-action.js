"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAction = void 0;
const issue_action_1 = require("./issue-action");
/**
 * 处理订单相关操作的基类
 * 提供订单相关的通用方法
 */
class OrderAction extends issue_action_1.IssueAction {
    /**
     * 检查Issue是否是订单
     */
    async isOrderIssue(issueNumber) {
        return this.hasLabel(issueNumber, 'order');
    }
    /**
     * 获取订单状态
     */
    async getOrderStatus(issueNumber) {
        const issue = await this.getIssue(issueNumber);
        const statusLabels = ['pending-payment', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
        for (const label of issue.labels) {
            if (statusLabels.includes(label.name)) {
                return label.name;
            }
        }
        return 'unknown';
    }
    /**
     * 更新订单状态
     */
    async updateOrderStatus(issueNumber, newStatus) {
        const statusLabels = {
            'pending-payment': ['pending-payment'],
            'paid': ['paid'],
            'processing': ['processing'],
            'shipped': ['shipped'],
            'delivered': ['delivered'],
            'completed': ['completed'],
            'cancelled': ['cancelled']
        };
        const removeLabels = {
            'pending-payment': [],
            'paid': ['pending-payment'],
            'processing': ['pending-payment', 'paid'],
            'shipped': ['processing'],
            'delivered': ['shipped'],
            'completed': ['delivered'],
            'cancelled': ['pending-payment', 'paid', 'processing', 'shipped', 'delivered']
        };
        // 验证状态是否有效
        if (!statusLabels[newStatus]) {
            throw new Error(`无效的订单状态: ${newStatus}`);
        }
        // 添加新状态标签
        await this.addLabels(issueNumber, statusLabels[newStatus]);
        // 移除旧状态标签
        if (removeLabels[newStatus]) {
            for (const label of removeLabels[newStatus]) {
                await this.removeLabel(issueNumber, label);
            }
        }
        this.log(`订单 #${issueNumber} 状态已更新为 ${newStatus}`);
    }
    /**
     * 解析订单数据
     */
    async parseOrderData(issueNumber) {
        const issue = await this.getIssue(issueNumber);
        return this.parseIssueBody(issue.body || '');
    }
    /**
     * 验证订单数据是否完整
     */
    validateOrderData(orderData) {
        const requiredFields = ['产品', '数量', '联系方式'];
        return requiredFields.every(field => !!orderData[field]);
    }
    /**
     * 生成订单通知消息
     */
    generateOrderNotification(issueNumber, status, orderData) {
        const statusMessages = {
            'pending-payment': '## 等待支付 💰\n\n请尽快完成支付。',
            'paid': '## 支付已确认 ✅\n\n您的订单已进入处理阶段。',
            'processing': '## 订单处理中 🔄\n\n我们已开始处理您的订单。',
            'shipped': '## 订单已发货 🚚\n\n您的订单已发货，请注意查收。',
            'delivered': '## 订单已送达 📦\n\n您的订单已送达，感谢您的购买！',
            'completed': '## 订单已完成 ✨\n\n您的订单已完成，感谢您的支持！',
            'cancelled': '## 订单已取消 ❌\n\n您的订单已取消。如有疑问，请联系客服。'
        };
        return statusMessages[status] || `## 订单状态更新\n\n订单状态已更新为: ${status}`;
    }
}
exports.OrderAction = OrderAction;
