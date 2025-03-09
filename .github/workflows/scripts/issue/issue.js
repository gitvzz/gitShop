"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Issue {
    constructor(github, context) {
        this.github = github;
        this.context = context;
        this.issue = context.payload.issue;
        this.issueBody = this.issue.body || '';
        this.issueTitle = this.issue.title || '';
        this.labels = this.issue.labels || [];
        this.username = this.issue.user.login || '';
    }
    async start() {
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
