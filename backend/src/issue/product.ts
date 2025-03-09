import Issue from './issue';

export default class extends Issue {
    constructor(github: any, context: any) {
        super(github, context);
    }

    async start() {
        return 'product updated';
    }
}