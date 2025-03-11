"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAction = void 0;
const github = __importStar(require("@actions/github"));
const base_action_1 = require("./base/base-action");
const utils = __importStar(require("./utils"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * 处理订单的Action类
 */
class OrderAction extends base_action_1.BaseAction {
    async execute() {
        try {
            const context = github.context;
            const eventName = context.eventName;
            const action = context.payload.action;
            this.log(`处理事件: ${eventName} - ${action}`);
            if (eventName === 'issues') {
                if (action === 'opened') {
                    // 处理新创建的Issue
                    await this.handleNewIssue();
                }
                else if (action === 'edited') {
                    // 处理编辑的Issue
                    await this.handleEditedIssue();
                }
            }
            else if (eventName === 'issue_comment') {
                // 处理Issue评论
                await this.handleIssueComment();
            }
        }
        catch (error) {
            //this.fail(`处理订单失败: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * 处理新创建的Issue
     */
    async handleNewIssue() {
        const issue = github.context.payload.issue;
        if (!issue) {
            this.fail('无法获取Issue信息');
            return;
        }
        this.log(`处理新Issue: #${issue.number} - ${issue.title}`);
        // 验证Issue内容
        const orderData = await this.validateIssueContent(issue);
        if (orderData) {
            // 处理订单逻辑
            await this.processOrder(issue, orderData);
            // 如果验证通过，保存原始内容并添加标签
            await this.saveOriginalContent(issue);
            await this.addIssueToProject(issue.number, 5);
            const chatid = process.env.CHAT_ID;
            if (!chatid)
                return;
            let text = `GitHub User:${github.context.repo.owner}`;
            text += `\nIssue: ${issue.html_url}`;
            text += `\n订单：${JSON.stringify(orderData)}`;
            /* if(shippingData){
                text += `\n收货信息：${JSON.stringify(shippingData)}`
            } */
            //text += `\n钱包地址：\n- TRON:${walletResult.tron}\n- BSC:${walletResult.bsc}\n- 钱包路径:${walletResult.path}`
            utils.send_message(process.env.TG_TOKEN_API, parseInt(chatid), text);
        }
    }
    /**
     * 处理编辑的Issue
     */
    async handleEditedIssue() {
        const issue = github.context.payload.issue;
        const sender = github.context.payload.sender;
        if (!issue) {
            this.fail('无法获取Issue信息');
            return;
        }
        if (sender.login === github.context.repo.owner) {
            return;
        }
        this.log(`处理编辑的Issue: #${issue.number} - ${issue.title}`);
        // 检查Issue是否已经被验证
        const isRestored = await this.restoreOriginalContent(issue);
        if (isRestored) {
            // 添加警告评论
            await this.addEditWarningComment(issue.number);
        }
        else {
            // 如果Issue尚未被验证，重新验证
            const orderData = await this.validateIssueContent(issue);
            if (orderData) {
                // 处理订单逻辑
                await this.processOrder(issue, orderData);
                // 如果验证通过，保存原始内容并添加标签
                await this.saveOriginalContent(issue);
            }
        }
    }
    /**
     * 处理Issue评论
     */
    async handleIssueComment() {
        const comment = github.context.payload.comment;
        const issue = github.context.payload.issue;
        if (!comment || !issue) {
            this.fail('无法获取评论或Issue信息');
            return;
        }
        this.log(`处理Issue评论: #${issue.number} - ${comment.id}`);
        // 处理评论逻辑
        await this.processComment(issue, comment);
    }
    /**
     * 验证订单数据
     */
    validateOrderData(orderData) {
        // 获取当前工作目录
        const projectRoot = process.cwd();
        let total = 0;
        for (const item of orderData.items) {
            let _path = path.join(projectRoot, `products/${item.category_id}/${item.id}.json`);
            if (!fs.existsSync(_path)) {
                throw new Error(`${item.name} 商品不存在`);
            }
            const product = JSON.parse(fs.readFileSync(_path, 'utf8'));
            if (product.merchant_id !== item.merchant_id) {
                throw new Error(`${item.name} 商户不一致`);
            }
            if (product.price.toFixed(2) !== item.price) {
                throw new Error(`${item.name} 商品价格不一致`);
            }
            let amount = 0;
            let type = '';
            const quantity = item.quantity;
            const { discount_percent, tier_pricing, threshold_discounts } = product.promotions;
            if (discount_percent) {
                amount = (product.price * discount_percent / 100) * quantity;
                type = 'discount_percent';
            }
            else if (tier_pricing) {
                const tier_item = tier_pricing.find(({ min_quantity }) => {
                    return quantity >= min_quantity;
                });
                if (tier_item) {
                    amount = product.price * quantity * (tier_item.discount_percent / 100);
                    type = 'tier_pricing';
                }
            }
            else if (threshold_discounts) {
                const threshold_item = threshold_discounts.find(({ threshold }) => {
                    return (quantity * product.price) >= threshold;
                });
                if (threshold_item) {
                    amount = threshold_item.discount_amount;
                    type = 'threshold_discount';
                }
            }
            total += product.price * quantity - amount;
            if (amount === 0 && !utils.isEmpty(item.promotions)) {
                throw new Error(`${item.name} 优惠金额不一致!`);
            }
            else if (amount > 0 && (amount.toFixed(2) !== item.promotions.amount || type !== item.promotions.type)) {
                throw new Error(`${item.name} 优惠金额不一致`);
            }
        }
        if (total.toFixed(2) !== orderData.summary.total) {
            throw new Error(`订单总金额不一致`);
        }
    }
    /**
     * 验证Issue内容
     */
    async validateIssueContent(issue) {
        // 这里实现您的验证逻辑
        const title = issue.title || '';
        const body = issue.body || '';
        if (!/^Order ORDER-\d{8}-[A-Z0-9]{6}$/.test(title)) {
            this.fail(`订单标题不正确`);
            await this.createComment(issue.number, { body: '订单标题不正确', state: 'closed', labels: ['invalid'] });
            return false;
        }
        const encryptedDataRegex = /\[ENCRYPTED_ORDER_DATA\]\s*([\s\S]*?)\s*\[\/ENCRYPTED_ORDER_DATA\]/;
        const encryptedDataMatch = body.match(encryptedDataRegex);
        if (!encryptedDataMatch) {
            this.fail(`订单内容不正确`);
            await this.createComment(issue.number, { body: '订单内容不正确', state: 'closed', labels: ['invalid'] });
            return false;
        }
        const signatureRegex = /MD5:([a-f0-9]{32})/i;
        let signatureMatch = body.match(signatureRegex);
        if (signatureMatch) {
            const signature = signatureMatch[1];
            const contentWithoutSignature = body.replace(/\nMD5:[a-f0-9]{32}/i, '');
            const contentToSign = title + contentWithoutSignature;
            const calculatedSignature = utils.md5(contentToSign);
            signatureMatch = calculatedSignature === signature;
        }
        if (!signatureMatch) {
            this.fail(`订单签名无效`);
            await this.createComment(issue.number, { body: '订单签名无效', state: 'closed', labels: ['invalid'] });
            return false;
        }
        const shippingDataRegex = /\[ENCRYPTED_SHIPPING_DATA\]\s*([\s\S]*?)\s*\[\/ENCRYPTED_SHIPPING_DATA\]/;
        const shippingDataMatch = body.match(shippingDataRegex);
        if (shippingDataMatch) {
            try {
                utils.decrypt(shippingDataMatch[1].trim(), process.env.PRIVATE_KEY);
            }
            catch (e) {
                this.fail(`收货信息解密失败:${e.message}`);
                await this.createComment(issue.number, { body: `收货信息解密失败`, state: 'closed', labels: ['invalid'] });
                return false;
            }
        }
        let orderData = null;
        try {
            orderData = utils.decrypt(encryptedDataMatch[1].trim(), process.env.PRIVATE_KEY);
            try {
                this.validateOrderData(orderData);
            }
            catch (e) {
                this.fail(`订单数据验证失败:${e.message}`);
                await this.createComment(issue.number, { body: `订单数据验证失败:${e.message}`, state: 'closed', labels: ['invalid'] });
                return false;
            }
        }
        catch (e) {
            this.fail(`订单解密失败:${e.message}`);
            await this.createComment(issue.number, { body: `订单解密失败:${e.message}`, state: 'closed', labels: ['invalid'] });
            return false;
        }
        return orderData;
    }
    /**
     * 保存Issue的原始内容
     */
    async saveOriginalContent(issue) {
        const issueNumber = issue.number;
        const originalContent = issue.body || '';
        const content = Buffer.from(originalContent).toString('base64');
        const res = await this.octokit.rest.repos.createOrUpdateFileContents({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            path: `.github/verified-issues/${issueNumber}.txt`,
            message: `保存Issue #${issueNumber}的原始内容`,
            content
        });
        //console.log('保存Issue #${issueNumber}的原始内容', res.data)
    }
    /**
     * 恢复Issue的原始内容
     */
    async restoreOriginalContent(issue) {
        const issueNumber = issue.number;
        const path = `.github/verified-issues/${issueNumber}.txt`;
        try {
            const fileData = await this.octokit.rest.repos.getContent({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                path: path
            });
            if ('content' in fileData.data) {
                const content = Buffer.from(fileData.data.content, 'base64').toString();
                // 更新Issue内容
                await this.octokit.rest.issues.update({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    issue_number: issueNumber,
                    body: content
                });
                this.log(`已从文件恢复Issue #${issueNumber}的原始内容`);
                return true;
            }
            else {
                this.warn(`从文件恢复Issue #${issueNumber}的原始内容失败: 文件不存在`);
                return false;
            }
        }
        catch (error) {
            this.warn(`从文件恢复Issue #${issueNumber}的原始内容失败: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
    /**
     * 创建评论
     * @param issueNumber
     * @param data
     */
    async createComment(issueNumber, data) {
        if (typeof data === 'string') {
            data = { body: data };
        }
        if (utils.has(data, 'body')) {
            if (data.body) {
                const repo = github.context.repo.repo;
                await this.octokit.rest.issues.createComment({
                    owner: github.context.repo.owner,
                    repo,
                    issue_number: issueNumber,
                    body: `${data.body}\n\n---\n*此回复由${repo}系统自动生成*`
                });
                delete data.body;
            }
        }
        if (!utils.isEmpty(data)) {
            await this.octokit.rest.issues.update({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: issueNumber,
                ...data
            });
        }
    }
    /**
     * 添加编辑警告的评论
     */
    async addEditWarningComment(issueNumber) {
        const repo = github.context.repo.repo;
        const comment = `
## ⚠️ 警告：已验证的订单不可修改

您尝试修改已验证的订单内容。系统已自动恢复原始内容。

如需添加更多信息或有任何问题，请通过评论与我们联系，而不是修改原始Issue。

---
*此回复由${repo}系统自动生成*
`;
        await this.octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo,
            issue_number: issueNumber,
            body: comment
        });
        this.log(`已添加编辑警告评论到Issue #${issueNumber}`);
    }
    async addIssueToProject(issueNumber, projectNumber) {
        // 使用此功能需要设置有权限的token
        try {
            // 1. 获取项目ID和Issue的Node ID (需要使用GraphQL API)
            const query = `
        query {
          repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
            issue(number: ${issueNumber}) {
              id
            }
          }
          projectV2(number: ${projectNumber}) {
            id
          }
        }
      `;
            const response = await this.octokit.graphql(query);
            const issueId = response.repository.issue.id;
            const projectId = response.user.projectV2.id;
            // 2. 将Issue添加到项目中
            const mutation = `
        mutation {
          addProjectV2ItemById(input: {
            projectId: "${projectId}",
            contentId: "${issueId}"
          }) {
            item {
              id
            }
          }
        }
      `;
            const addResponse = await this.octokit.graphql(mutation);
            this.log(`已将Issue #${issueNumber}添加到项目 #${projectNumber}`);
            const itemId = addResponse.addProjectV2ItemById.item.id;
            // 3. 获取项目的状态字段ID和可用选项
            const fieldsQuery = `
      query {
        user(login: "${github.context.repo.owner}") {
          projectV2(number: ${projectNumber}) {
            fields(first: 20) {
              nodes {
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;
            /* console.log('fieldsQuery',fieldsQuery)
            const fieldsResponse: any = await this.octokit.graphql(fieldsQuery);
            console.log('fieldsResponse',fieldsResponse)
            // 找到状态字段
            const statusField = fieldsResponse.user.projectV2.fields.nodes.find(
              (field: any) => field.name === "Status"
            );
            console.log('statusField',statusField)
            // 找到指定状态选项
            const statusOption = statusField.options.find(
              (option: any) => option.name === statusName
            );*/
            /* {
              id: 'PVTSSF_lAHOCf8MVs4A0DQuzgpvn-Q',
              name: 'Status',
              options: [
                { id: 'f75ad846', name: 'Todo' },
                { id: '47fc9ee4', name: 'In Progress' },
                { id: '98236657', name: 'Done' }
              ]
            } */
            const statusField = { id: 'PVTSSF_lAHOCf8MVs4A0DQuzgpvn-Q' };
            const statusOption = { id: 'f75ad846', name: 'Todo' };
            // 4. 更新项目项的状态
            const updateMutation = `
        mutation {
          updateProjectV2ItemFieldValue(input: {
            projectId: "${projectId}",
            itemId: "${itemId}",
            fieldId: "${statusField.id}",
            value: {
              singleSelectOptionId: "${statusOption.id}"
            }
          }) {
            projectV2Item {
              id
            }
          }
        }
      `;
            const res = await this.octokit.graphql(updateMutation);
            console.log('res', res);
            this.log(`已将Issue #${issueNumber} 状态设置为 ${statusOption.name}`);
        }
        catch (error) {
            this.warn(`将Issue添加到项目失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 处理订单逻辑
     */
    async processOrder(issue, orderData) {
        // 这里实现您的订单处理逻辑
        // 例如，解析订单信息，创建订单记录，发送通知等
        this.log(`处理订单: #${issue.number}`);
        const wallet = utils.generateWallet(issue.user.login, process.env.WALLET_MNEMONIC);
        const { tron, bsc, path } = wallet;
        const now = new Date();
        const paymentDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const formattedDeadline = paymentDeadline.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' UTC';
        // 构建回复内容
        let replyBody = `## 您的订单已成功提交！\n\n`;
        replyBody += `### 订单信息\n`;
        replyBody += `- 订单ID: ${orderData.orderId}\n`;
        replyBody += `- 订单总额: ${orderData.summary.total} USDT\n`;
        replyBody += `- 创建时间: ${new Date(orderData.timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' UTC'}\n\n`;
        replyBody += `### 支付信息\n`;
        replyBody += `- 支付币种: USDT\n`;
        replyBody += `- 支付金额: ${orderData.summary.total} USDT\n`;
        replyBody += `- 收款地址: \n  - BSC:\`${bsc}\`\n  - TRON:\`${tron}\`\n  - 钱包路径: \`${path}\`\n`;
        replyBody += `- 支付截止时间: ${formattedDeadline}\n\n`;
        replyBody += `### 支付说明\n`;
        replyBody += `1. 请在支付截止时间前完成转账\n`;
        replyBody += `2. 请确保转账金额准确，不要多付或少付\n`;
        replyBody += `3. 转账时请正确选择网络\n`;
        replyBody += `4. 转账完成后，请在此Issue下回复转账交易ID\n\n`;
        replyBody += `### 注意事项\n`;
        replyBody += `- 如果在支付截止时间内未收到付款，订单将自动取消\n`;
        replyBody += `- 收到付款后，我们将尽快处理您的订单\n`;
        replyBody += `- 如有任何问题，请在此Issue下留言`;
        await this.createComment(issue.number, { body: replyBody, labels: ['order-processing'] });
        //await this.addIssueToProject(issue.number, 5);
    }
    /**
     * 处理评论逻辑
     */
    async processComment(issue, comment) {
        // 这里实现您的评论处理逻辑
        // 例如，解析评论内容，更新订单状态等
        this.log(`处理评论: #${comment.id} on Issue #${issue.number}`);
        // 示例：检查评论是否包含特定命令
        const commentBody = comment.body || '';
        if (commentBody.includes('/status')) {
            // 回复订单状态
            await this.replyWithOrderStatus(issue.number, comment.id);
        }
        else if (commentBody.includes('/cancel')) {
            // 处理取消订单请求
            await this.handleCancelRequest(issue.number, comment.id);
        }
    }
    /**
     * 回复订单状态
     */
    async replyWithOrderStatus(issueNumber, commentId) {
        const statusComment = `
## 订单状态

当前状态: **处理中**

预计完成时间: 1-2个工作日

---
*此状态更新由自动化系统生成*
`;
        await this.octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: issueNumber,
            body: statusComment
        });
        this.log(`已回复订单状态到Issue #${issueNumber}`);
    }
    /**
     * 处理取消订单请求
     */
    async handleCancelRequest(issueNumber, commentId) {
        const cancelComment = `
## 取消订单请求已收到

我们已收到您的取消订单请求。请确认是否要取消此订单：

- 回复 \`/confirm-cancel\` 确认取消
- 回复 \`/keep-order\` 保留订单

---
*此消息由自动化系统生成*
`;
        await this.octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: issueNumber,
            body: cancelComment
        });
        this.log(`已回复取消订单请求到Issue #${issueNumber}`);
    }
}
exports.OrderAction = OrderAction;
// 执行Action
if (require.main === module) {
    const action = new OrderAction();
    action.execute().catch(error => {
        console.error('Action执行失败:', error);
        process.exit(1);
    });
}
