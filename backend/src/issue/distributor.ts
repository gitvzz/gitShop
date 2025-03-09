import Issue from './issue';
import path from 'path';
import fs from 'fs';
export default class extends Issue {
    private repoName: string;
    constructor(github: any, context: any, repoName: string) {
        super(github, context);
        this.repoName = repoName;
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
        const user:any = await this.getFork(this.repoName);
        if(user === false){
            await this.createComment(`You need to fork the repository to become a distributor. [Fork here](https://github.com/${owner}/${repo}/fork)`);
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        user.address = address;
        const data = this.getDistributor();
        const distributor = data.find((item:any) => item.username === user.username);
        if(distributor){
            Object.assign(distributor,user);
        }else{
            data.push(user);
        }
        const projectRoot = process.cwd();
        const outputPath = path.join(projectRoot,  '_data/distributors.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 4));
        const url = `https://${owner}.github.io/${repo}/#/?ref=${user.username}`;
        await this.createComment(`Distributor data updated. [Distribution Link](${url})`);
        await this.updateIssue('closed', ['distributor']);
        return {distributors:true};
    }
}