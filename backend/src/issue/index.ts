import Order from './order';
import Product from './product'
import Distributor from './distributor'

const distributorTitleRegex = /^Distributor #([a-zA-Z0-9-_]+)$/i;

const handleIssue = async (github: any, context: any) => {
    //const labels = (context.payload.issue.labels || []).map((label: any) => label.name);
    const title = context.payload.issue.title;
    const tgTokenApi = process.env.TG_TOKEN_API as string;
    if (/^Order ORDER-\d{8}-[A-Z0-9]{6}$/.test(title)) {
        await new Order(github,context, tgTokenApi, process.env.PRIVATE_KEY as string, process.env.WALLET_MNEMONIC as string).start();
        return {order:true};
    }else if(title.toLowerCase()==='product' || title.toLowerCase()==='category'){
        return await new Product(github,context, tgTokenApi,title.toLowerCase()).start();
    }else if(distributorTitleRegex.test(title)){
        const match = title.match(distributorTitleRegex);
        return await new Distributor(github,context, tgTokenApi, match[1]).start();
    }else{
        return {}
    }
}


export { handleIssue };