import Issue from './issue';
import path from 'path';
import fs from 'fs';
export default class extends Issue {
    private repoName: string;
    constructor(github: any, context: any, repoName: string) {
        super(github, context);
        this.repoName = repoName;
        console.log(this.repoName);
    }

    private async checkFork(){
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
        } catch (error) {
            console.log(error);
            // 如果获取失败(仓库不存在等情况)返回false
            return false;
        }
    }

    private getDistributor() {
        const projectRoot = process.cwd();
        let url = path.join(projectRoot, '_data/distributors.json');
        const data = JSON.parse(fs.readFileSync(url, 'utf8'));
        return data.find((item: any) => item.username === this.username);
    }

    async start() {
        const owner = this.context.repo.owner;
        const repo = this.context.repo.repo;
        const isFork = await this.checkFork();
        if(!isFork){
            await this.createComment(`You need to fork the repository to become a distributor. [Fork here](https://github.com/${owner}/${repo}/fork)`);
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        const distributor = this.getDistributor();
    }
}