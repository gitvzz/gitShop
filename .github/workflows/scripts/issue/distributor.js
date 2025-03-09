"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const issue_1 = __importDefault(require("./issue"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class default_1 extends issue_1.default {
    constructor(github, context, tgTokenApi, repoName) {
        super(github, context, tgTokenApi);
        this.repoName = repoName;
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
        const user = await this.getFork(this.repoName);
        if (user === false) {
            await this.createComment(`You need to fork the repository to become a distributor. [Fork here](https://github.com/${owner}/${repo}/fork)`);
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        user.address = address;
        const data = this.getDistributor();
        const distributor = data.find((item) => item.username === user.username);
        if (distributor) {
            Object.assign(distributor, user);
        }
        else {
            data.push(user);
        }
        const projectRoot = process.cwd();
        const outputPath = path_1.default.join(projectRoot, '_data/distributors.json');
        fs_1.default.writeFileSync(outputPath, JSON.stringify(data, null, 4));
        const url = `https://${owner}.github.io/${repo}/#/?ref=${user.username}`;
        await this.createComment(`Distributor data updated. [Distribution Link](${url})`);
        await this.updateIssue('closed', ['distributor']);
        return { distributors: true };
    }
}
exports.default = default_1;
