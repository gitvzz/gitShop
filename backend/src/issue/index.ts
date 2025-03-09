import Order from './order';
import Product from './product'
import Distributor from './distributor'

const distributorTitleRegex = /^Distributor #([a-zA-Z0-9-_]+)$/i;

const handleIssue = async (github: any, context: any) => {
    //const labels = (context.payload.issue.labels || []).map((label: any) => label.name);
    const title = context.payload.issue.title;
    if (/^Order ORDER-\d{8}-[A-Z0-9]{6}$/.test(title)) {
        await new Order(github,context, process.env.PRIVATE_KEY as string, process.env.WALLET_MNEMONIC as string).start();
        return {order:true};
    }else if(title.toLowerCase()==='product' || title.toLowerCase()==='category'){
        return await new Product(github,context,title.toLowerCase()).start();
    }else if(distributorTitleRegex.test(title)){
        const match = title.match(distributorTitleRegex);
        return await new Distributor(github,context, match[1]).start();
    }
}


export { handleIssue };