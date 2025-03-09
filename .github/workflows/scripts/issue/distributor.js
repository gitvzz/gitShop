"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const issue_1 = __importDefault(require("./issue"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class default_1 extends issue_1.default {
    constructor(github, context, repoName) {
        super(github, context);
        this.repoName = repoName;
        console.log(this.repoName);
    }
    async checkFork() {
        // 检查用户是否fork了当前仓库
        const owner = this.context.repo.owner;
        const repo = this.context.repo.repo;
        try {
            const response = await this.github.rest.repos.get({
                owner: this.username,
                repo: this.repoName || 'gitshop11'
            });
            console.log(response.data);
            // 如果能获取到仓库信息且是fork
            if (response.data.fork) {
                // 进一步验证fork源是否为当前仓库
                const parent = response.data.parent;
                if (parent && parent.owner.login === owner && parent.name === repo) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            console.log(error);
            // 如果获取失败(仓库不存在等情况)返回false
            return false;
        }
    }
    getDistributor() {
        const projectRoot = process.cwd();
        let url = path_1.default.join(projectRoot, '_data/distributors.json');
        const data = JSON.parse(fs_1.default.readFileSync(url, 'utf8'));
        return data.find((item) => item.username === this.username);
    }
    async start() {
        const owner = this.context.repo.owner;
        const repo = this.context.repo.repo;
        const isFork = await this.checkFork();
        if (!isFork) {
            await this.createComment(`You need to fork the repository to become a distributor. [Fork here](https://github.com/${owner}/${repo}/fork)`);
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        const distributor = this.getDistributor();
    }
}
exports.default = default_1;
