import forge from 'node-forge';
import fs from 'fs';
import { generateWallet } from '../generate-wallet';
import Issue from './issue';
import path from 'path';

const md5 = (str: string) => {
    return forge.md.md5.create().update(str).digest().toHex()
}

const decrypt = (data: string, pub_key: string) => {
    const [encryptedKeyBase64, encryptedDataBase64] = data.split('.');

    // Base64 解码
    const encryptedKey = forge.util.decode64(encryptedKeyBase64);
    const encryptedDataWithIv = forge.util.decode64(encryptedDataBase64);

    // 提取 IV (前16字节) 和加密数据
    const iv = encryptedDataWithIv.substring(0, 16);
    const encryptedData = encryptedDataWithIv.substring(16);

    // 使用 RSA 解密 AES 密钥
    const privateKey = forge.pki.privateKeyFromPem(pub_key);
    const aesKey = privateKey.decrypt(encryptedKey);

    // 使用 AES 解密数据
    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({ iv: iv });
    decipher.update(forge.util.createBuffer(encryptedData));
    decipher.finish();
    const decryptedData = decipher.output.toString();
    return JSON.parse(decryptedData);
}

export default class extends Issue {
    private privateKey: string;
    private mnemonic: string;
    private username: string;

    constructor(github: any, context: any, privateKey: string, mnemonic: string) {
        super(github, context);
        this.privateKey = privateKey;
        this.mnemonic = mnemonic;
        this.username = this.issue.user.login;
    }

    private async checkSignature() {
        const signatureRegex = /MD5:([a-f0-9]{32})/i;
        const signatureMatch = this.issueBody.match(signatureRegex);
        if (signatureMatch) {
            const signature = signatureMatch[1];
            const contentWithoutSignature = this.issueBody.replace(/\nMD5:[a-f0-9]{32}/i, '');
            const contentToSign = this.issueTitle + contentWithoutSignature;
            const calculatedSignature = md5(contentToSign);
            if (calculatedSignature === signature) {
                return true;
            }
        }
        await this.createComment('订单签名无效');
        await this.updateIssue('closed', ['invalid']);
        return false;
    }

    private async decryptOrderData(encryptedData: string) {
        try {
            return decrypt(encryptedData, this.privateKey);
        } catch (e: any) {
            await this.createComment(`订单解密失败:${e.message}`);
            await this.updateIssue('closed', ['invalid']);
            return false;
        }
    }

    private async decryptShippingData() {
        const shippingDataRegex = /\[ENCRYPTED_SHIPPING_DATA\]\s*([\s\S]*?)\s*\[\/ENCRYPTED_SHIPPING_DATA\]/;
        const shippingDataMatch = this.issueBody.match(shippingDataRegex);
        if (!shippingDataMatch) {
            return null;
        }
        const encryptedShippingData = shippingDataMatch[1].trim();
        try {
            return decrypt(encryptedShippingData, this.privateKey);
        } catch (e: any) {
            await this.createComment(`收货信息解密失败:${e.message}`);
            await this.updateIssue('closed', ['invalid']);
            return false;
        }
    }

    private promotions(source: any, product: any) {
        let amount = 0
        let type = ''
        const quantity = source.quantity;
        //console.log(product.promotions)
        const { discount_percent, tier_pricing, threshold_discounts } = product.promotions;
        if (discount_percent) {
            amount = (product.price * discount_percent / 100) * quantity
            type = 'discount_percent'
        } else if (tier_pricing) {
            // 阶梯价格优惠
            const tier_item = tier_pricing.find(({ min_quantity }: any) => {
                return quantity >= min_quantity
            })
            if (tier_item) {
                amount = product.price * quantity * (tier_item.discount_percent / 100)
                type = 'tier_pricing'
            }
        } else if (threshold_discounts) {
            // 满减优惠
            const threshold_item = threshold_discounts.find(({ threshold }: any) => {
                return (quantity * product.price) >= threshold
            })
            if (threshold_item) {
                amount = threshold_item.discount_amount
                type = 'threshold_discount'
            }
        }
        if (amount === 0) {
            return {}
        } else {
            return { amount: amount.toFixed(2), type }
        }
    }

    private validateOrderData(data: any) {
        //console.log(data);
        // 获取当前工作目录
        const projectRoot = process.cwd();
        let url = path.join(projectRoot, '_data/products.json');
        
        if (process.env.MODE === 'test') {
            // 在测试环境中，可能需要特殊处理路径
            console.log(`测试环境: 当前工作目录 ${projectRoot}`);
            // 检查文件是否存在
            if (!fs.existsSync(url)) {
                console.log(`文件不存在: ${url}，尝试其他路径`);
                // 尝试其他可能的路径
                const altPath = path.join(projectRoot, '..', '_data/products.json');
                if (fs.existsSync(altPath)) {
                    url = altPath;
                    console.log(`找到文件: ${url}`);
                } else {
                    console.log(`文件也不存在: ${altPath}`);
                }
            }
        }
        
        const products = JSON.parse(fs.readFileSync(url, 'utf8'));
        //console.log(products);
        data.items.forEach((item: any) => {
            const product = products.find((p: any) => p.id === item.id);
            if (!product) {
                throw new Error(`${item.name} 商品不存在`);
            }
            if (product.merchant_id !== item.merchant_id) {
                throw new Error(`${item.name} 商户不一致`);
            }
            if (product.price.toFixed(2) !== item.price) {
                throw new Error(`${item.name} 商品价格不一致`);
            }
            const input = item.promotions
            const { amount, type } = this.promotions(item, product);
            if (input.amount !== amount || input.type !== type) {
                throw new Error(`${item.name} 优惠金额不一致`);
            }
            //console.log(item.name,input,amount,type);
        })
    }

    private response(orderData: any, walletAddress: string) {
        const now = new Date();
        const paymentDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const formattedDeadline = paymentDeadline.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' UTC';

        // 构建回复内容
        let replyBody = `## 您的订单已成功提交！\n\n`;

        replyBody += `### 订单信息\n`;
        replyBody += `- 订单ID: ${orderData.orderId}\n`;
        replyBody += `- 订单总额: ${orderData.summary.total} USDT\n`;
        replyBody += `- 创建时间: ${new Date(orderData.timestamp).toLocaleString()}\n\n`;

        replyBody += `### 支付信息\n`;
        replyBody += `- 支付币种: USDT (TRC20)\n`;
        replyBody += `- 支付金额: ${orderData.summary.total} USDT\n`;
        replyBody += `- 收款地址: \`${walletAddress}\`\n`;
        replyBody += `- 支付截止时间: ${formattedDeadline}\n\n`;

        replyBody += `### 支付说明\n`;
        replyBody += `1. 请在支付截止时间前完成转账\n`;
        replyBody += `2. 请确保转账金额准确，不要多付或少付\n`;
        replyBody += `3. 转账时请使用TRC20网络\n`;
        replyBody += `4. 转账完成后，请在此Issue下回复转账交易ID\n\n`;

        replyBody += `### 注意事项\n`;
        replyBody += `- 如果在支付截止时间内未收到付款，订单将自动取消\n`;
        replyBody += `- 收到付款后，我们将尽快处理您的订单\n`;
        replyBody += `- 如有任何问题，请在此Issue下留言\n\n`;

        replyBody += `---\n*此回复由GitShop系统自动生成*`;
        return replyBody;
    }

    async start() {
        const titleRegex = /^Order ORDER-\d{8}-[A-Z0-9]{6}$/;

        const encryptedDataRegex = /\[ENCRYPTED_ORDER_DATA\]\s*([\s\S]*?)\s*\[\/ENCRYPTED_ORDER_DATA\]/;
        const isTitleValid = titleRegex.test(this.issueTitle);
        const encryptedDataMatch = this.issueBody.match(encryptedDataRegex);
        const encryptedData = encryptedDataMatch ? encryptedDataMatch[1].trim() : '';

        if (!isTitleValid || !encryptedDataMatch) {
            await this.createComment('订单不符合规则');
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        if (!await this.checkSignature()) {
            return;
        }
        const orderData = await this.decryptOrderData(encryptedData);
        if (!orderData) {
            return;
        }

        const shippingData = await this.decryptShippingData();
        if (shippingData === false) {
            return;
        }

        try {
            this.validateOrderData(orderData);
        } catch (e: any) {
            await this.createComment(`订单数据验证失败:${e.message}`);
            await this.updateIssue('closed', ['invalid']);
            return;
        }
        const walletResult = generateWallet(this.username, this.mnemonic);
        const message = this.response(orderData, walletResult.address);
        await this.createComment(message);
    }
}