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