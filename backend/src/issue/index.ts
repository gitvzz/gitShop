import Order from './order';
import Product from './product'

const handleIssue = async (github: any, context: any) => {
    const labels = (context.payload.issue.labels || []).map((label: any) => label.name);
    if (labels.includes('order')) {
        await new Order(github,context, process.env.PRIVATE_KEY as string, process.env.WALLET_MNEMONIC as string).start();
    }else if(labels.includes('product')){
        await new Product(github,context).start();
    }
}

export { handleIssue };