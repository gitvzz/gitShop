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
    }
    async checkFork() {
        // 检查用户是否fork了当前仓库
        const _owner = this.context.repo.owner;
        const _repo = this.context.repo.repo;
        try {
            const response = await this.github.rest.repos.get({
                owner: this.username,
                repo: this.repoName
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
    getDistributor() {
        const projectRoot = process.cwd();
        let url = path_1.default.join(projectRoot, '_data/distributors.json');
        const data = JSON.parse(fs_1.default.readFileSync(url, 'utf8'));
        return data;
    }
    async start() {
        const address = this.issueBody.replace(/^.*\n/, '');
        if (!/^T[a-zA-Z0-9]{33}$/.test(address) && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            await this.createComment('A Tron or BSC chain wallet address must be provided');
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        const owner = this.context.repo.owner;
        const repo = this.context.repo.repo;
        const user = await this.checkFork();
        if (user === false) {
            await this.createComment(`You need to fork the repository to become a distributor. [Fork here](https://github.com/${owner}/${repo}/fork)`);
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        user.address = address;
        console.log(user);
        const data = this.getDistributor();
        const distributor = data.find((item) => item.username === user.username);
        if (distributor) {
            Object.assign(distributor, user);
        }
        else {
            data.push(user);
        }
        console.log(data);
        const projectRoot = process.cwd();
        const outputPath = path_1.default.join(projectRoot, '_data/distributors.json');
        fs_1.default.writeFileSync(outputPath, JSON.stringify(data, null, 4));
        await this.createComment(`Distributor data updated. [Distribution Link](https://${owner}.github.io/${repo}/)`);
        await this.updateIssue('closed', ['distributor']);
        return 'distributors updated';
    }
}
exports.default = default_1;
