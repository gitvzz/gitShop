"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueAction = void 0;
const base_action_1 = require("./base-action");
/**
 * 处理Issue相关操作的基类
 * 提供Issue相关的通用方法
 */
class IssueAction extends base_action_1.BaseAction {
    /**
     * 获取当前Issue编号
     */
    getIssueNumber() {
        const issueNumber = this.getInput('issue-number');
        return issueNumber ? parseInt(issueNumber) : this.context.issue.number;
    }
    /**
     * 添加Issue评论
     */
    async addComment(issueNumber, body) {
        await this.octokit.rest.issues.createComment({
            ...this.context.repo,
            issue_number: issueNumber,
            body
        });
        this.debug(`已添加评论到Issue #${issueNumber}`);
    }
    /**
     * 添加Issue标签
     */
    async addLabels(issueNumber, labels) {
        await this.octokit.rest.issues.addLabels({
            ...this.context.repo,
            issue_number: issueNumber,
            labels
        });
        this.debug(`已添加标签 [${labels.join(', ')}] 到Issue #${issueNumber}`);
    }
    /**
     * 移除Issue标签
     */
    async removeLabel(issueNumber, label) {
        try {
            await this.octokit.rest.issues.removeLabel({
                ...this.context.repo,
                issue_number: issueNumber,
                name: label
            });
            this.debug(`已从Issue #${issueNumber} 移除标签 ${label}`);
        }
        catch (error) {
            this.debug(`移除标签 ${label} 失败，可能不存在`);
        }
    }
    /**
     * 获取Issue详情
     */
    async getIssue(issueNumber) {
        const { data } = await this.octokit.rest.issues.get({
            ...this.context.repo,
            issue_number: issueNumber
        });
        return data;
    }
    /**
     * 更新Issue
     */
    async updateIssue(issueNumber, options) {
        await this.octokit.rest.issues.update({
            ...this.context.repo,
            issue_number: issueNumber,
            ...options
        });
        this.debug(`已更新Issue #${issueNumber}`);
    }
    /**
     * 检查Issue是否有特定标签
     */
    async hasLabel(issueNumber, label) {
        const issue = await this.getIssue(issueNumber);
        return issue.labels.some((l) => l.name === label);
    }
    /**
     * 解析Issue内容中的键值对
     * 格式: 键: 值
     */
    parseIssueBody(body) {
        const result = {};
        const lines = body.split('\n');
        for (const line of lines) {
            const match = line.match(/^\s*(.+?)\s*:\s*(.+)\s*$/);
            if (match) {
                result[match[1].trim()] = match[2].trim();
            }
        }
        return result;
    }
}
exports.IssueAction = IssueAction;
