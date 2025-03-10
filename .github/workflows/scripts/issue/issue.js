"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Issue {
    constructor(github, context, tgTokenApi) {
        this.github = github;
        this.context = context;
        this.issue = context.payload.issue;
        this.issueBody = this.issue.body || '';
        this.issueTitle = this.issue.title || '';
        this.labels = this.issue.labels || [];
        this.username = this.issue.user.login || '';
        this.tgTokenApi = tgTokenApi;
    }
    getDistributor() {
        const projectRoot = process.cwd();
        let url = path_1.default.join(projectRoot, '_data/distributors.json');
        const data = JSON.parse(fs_1.default.readFileSync(url, 'utf8'));
        return data;
    }
    sendTgMessage(chat_id, message) {
        try {
            const url = `https://api.telegram.org/bot${this.tgTokenApi}/sendMessage`;
            const payload = { "chat_id": chat_id, "text": message, "parse_mode": "HTML", "link_preview_options": { "is_disabled": true } };
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        }
        catch (e) {
            console.log(e);
        }
    }
    async getFork(repoName) {
        // 检查用户是否fork了当前仓库
        const _owner = this.context.repo.owner;
        const _repo = this.context.repo.repo;
        try {
            const response = await this.github.rest.repos.get({
                owner: this.username,
                repo: repoName
            });
            const { owner, full_name, fork, parent } = response.data;
            // 如果能获取到仓库信息且是fork
            if (fork && parent.owner.login === _owner && parent.name === _repo) {
                // 进一步验证fork源是否为当前仓库
                return {
                    id: owner.id,
                    username: owner.login,
                    avatar_url: owner.avatar_url,
                    full_name: `https://github.com/${full_name}`
                };
            }
            return false;
        }
        catch (error) {
            console.log(error);
            // 如果获取失败(仓库不存在等情况)返回false
            return false;
        }
    }
    async updateIssue(state, labels) {
        if (!this.github) {
            console.log('updateIssue', state, labels);
            return;
        }
        if (state || labels) {
            const updateData = {};
            if (state) {
                updateData.state = state;
            }
            if (labels) {
                updateData.labels = labels;
            }
            await this.github.rest.issues.update({
                owner: this.context.repo.owner,
                repo: this.context.repo.repo,
                issue_number: this.context.issue.number,
                ...updateData
            });
        }
    }
    async createComment(body) {
        if (!this.github) {
            console.log('createComment', body);
            return;
        }
        await this.github.rest.issues.createComment({
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            issue_number: this.context.issue.number,
            body: body
        });
    }
}
exports.default = Issue;
