import Issue from './issue';
import path from 'path';
import fs from 'fs';
export default class extends Issue {
    private repoName: string;
    constructor(github: any, context: any, repoName: string) {
        super(github, context);
        this.repoName = repoName;
    }

    private async checkFork(){
        // 检查用户是否fork了当前仓库
        const _owner = this.context.repo.owner;
        const _repo = this.context.repo.repo;
        try {
            const response = await this.github.rest.repos.get({
                owner: this.username,
                repo: this.repoName
            });
            const {owner,full_name,fork,parent} = response.data;
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
        } catch (error) {
            console.log(error);
            // 如果获取失败(仓库不存在等情况)返回false
            return false;
        }
    }

    private getDistributor(): any[] {
        const projectRoot = process.cwd();
        let url = path.join(projectRoot, '_data/distributors.json');
        const data = JSON.parse(fs.readFileSync(url, 'utf8'));
        return data;
    }

    async start() {
        const address = this.issueBody.replace(/^.*\n/, '');
        if(!/^T[a-zA-Z0-9]{33}$/.test(address) && !/^0x[a-fA-F0-9]{40}$/.test(address) ){
            await this.createComment('A Tron or BSC chain wallet address must be provided');
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        const owner = this.context.repo.owner;
        const repo = this.context.repo.repo;
        const user:any = await this.checkFork();
        if(user === false){
            await this.createComment(`You need to fork the repository to become a distributor. [Fork here](https://github.com/${owner}/${repo}/fork)`);
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        user.address = address;
        console.log(user);
        const data = this.getDistributor();
        const distributor = data.find((item:any) => item.username === user.username);
        if(distributor){
            Object.assign(distributor,user);
        }else{
            data.push(user);
        }
        console.log(data);
        const projectRoot = process.cwd();
        const outputPath = path.join(projectRoot,  '_data/distributors.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 4));
        await this.createComment(`Distributor data updated. [Distribution Link](https://${owner}.github.io/${repo}/)`);
        await this.updateIssue('closed', ['distributor']);
        return {distributors:true};
    }
}