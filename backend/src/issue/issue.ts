import fs from 'fs';
import path from 'path';

export default class Issue {
    github: any;
    context: any;
    issue: any;
    issueBody: string;
    issueTitle: string;
    labels: any[];
    username: string;
    constructor(github: any, context: any) {
        this.github = github;
        this.context = context;
        this.issue = context.payload.issue;
        this.issueBody = this.issue.body || '';
        this.issueTitle = this.issue.title || '';
        this.labels = this.issue.labels || [];
        this.username = this.issue.user.login || '';
    }

    public getDistributor(): any[] {
        const projectRoot = process.cwd();
        let url = path.join(projectRoot, '_data/distributors.json');
        const data = JSON.parse(fs.readFileSync(url, 'utf8'));
        return data;
    }

    public async getFork(repoName:string){
        // 检查用户是否fork了当前仓库
        const _owner = this.context.repo.owner;
        const _repo = this.context.repo.repo;
        try {
            const response = await this.github.rest.repos.get({
                owner: this.username,
                repo: repoName
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

    async updateIssue(state?: string, labels?: string[]) {
        if(!this.github){
            console.log('updateIssue',state,labels);
            return;
        }
        if (state || labels) {
            const updateData: any = {};
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

    async createComment(body: string) {
        if(!this.github){
            console.log('createComment',body);
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