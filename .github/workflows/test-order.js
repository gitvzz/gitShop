/**
 * 订单处理测试脚本
 * 
 * 此脚本用于测试订单处理流程，包括解密和验证订单数据
 */

// 导入所需模块
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../frontend/.env') });
const checkOrder = require('./scripts/check-order');
const decryptOrder = require('./scripts/decrypt-order');
const generateWallet = require('./scripts/generate-wallet');
const replyOrder = require('./scripts/reply-order');
// 模拟GitHub Actions上下文
const mockContext = {
  payload: {
    issue: {
      title: 'Order ORDER-20250307-D4P2NM',
      body: `# Order ORDER-20250307-D4P2NM
Distributor ID: lingang

## Products
- [武夷岩茶](https://github.com/gitvzz/gitShop/#/product/rock-tea?ref=lingang) x1

## Order Data
\`\`\`
[ENCRYPTED_ORDER_DATA]
GMBbdehev3RykcMrjYq/PjAWmFxyF5fs/HtBG29leKV3YtE3iDsO4lzojx4/wvASRjmLu5qBZMa0mp7XB6/NMDJioKRcLD58Y3HDfc4zgjf/eMxQ2JxElh7KBEk4GnlzqAKT9h0aqkO+4HqUaz8+Y8Fh0QsoQ3I7BqI9GzEr8KXGeNRhPrUnwRhJ9TdzvegtMrLYb7hWjaWq3t9Dz2vbY6wmANNOJ4Jya3URcOR3BS6z7UR0JEQ9uxWw435m35j+JztgoKpBoFW+Ik1ce+8Xt/j1ImnG7cexTdKHTzxRDEct55C/cOrWOSC78NDUglHAfz4oZbL2+CKn4iKS/0VJ4g==.36xpX2KO7SCkYHD5x9D+97OuLISfWTDPhqfzXv8ZuSIH8DfkSfAkU0VPxQ8MMdOuooDvphhsPWsqSDqJOayoP290m5MHT2AzolCGMZ+v33C32D5wEucjATPtIEb0Qtsr5c+cCpidzARKn+KzWpWvLOCqOt/5gZiDJFnFVapRYsRRAj/ISEGUc0qT3j/P9zZlpk9Uuvng76jsqn+RA1FpcVeue8N9gGsVkeGJtAxT+CM5g08kfq+nM6Ll5UWVr9ZHXk0OUtPb/ehvp7tcojApUz+aWYtloDNTAFwDRuaCjJW5T9+swHZvX+Aj6LGijArRirRBmjJlOLLtaAasvLpZrJQF+T//JvVzwWVkKxZUqgevrqOMSeKNvqXDMEYQM7RpqHDyc7ZOtooMM9LJoeqnJwBKOyO+j1/6JDmuuCJgCzY=
[/ENCRYPTED_ORDER_DATA]
\`\`\`

## Shipping Data
\`\`\`
[ENCRYPTED_SHIPPING_DATA]
SPbDR3BHbyk5jK1tcfBQM/0cmPGka08MIsdB9ne8hFcu+RF57bbmu/7WANym8pZzETV2MgqkNGkjUNz9pRInztG+23Earh11dFbgr9hzFusHNo6usHYsoI/ruvHTVWrETJTy419Bqtm6mXCDJTcb9iIkrZ8tztihaal/pwluxIoLEBpdtf865xbWqS4ovRKNRdXodsBt9dqgYXObWq19N1TZNBYY+UWzIQaUC7Rtf6N7ygD9+mKazmfhgR3QHOAx0Q1aZjJUsTwSiJMcY0fOCPCzGmA/r5dOWVUNKPaAcA+gT7LY1Am22imsowUPBN/waefjOPzzKbGhKC1AuPcMEg==.PYrHMnp+KFAuLY5M2MFIPc6RoeADWCbKrQYmZ2kAW/0LODEOpr+od43av11p+BlRP5hCsjrG5+joGdwNTNzfPwHGCJhINvPoI8OIYl379/FLYLdaGtsDC+53tTwK0+PbNdiXAjw90pAS5srNRJijArjE9bcySrckH4R0EiQ8/C4t1OfInutpRxSDWdGwgTkDQhgKE9a95Lr9/KhOyotV5sw5xX0/IZtD7nqpxGmmceLkKUwtz0tjRbu3nFh8C64N/1LhF0d6uyXr+09wvOwZ9owERWCpxjTkHOTWNDhTvB8PualjwcvHhiInGhYH8vvOC9w8dpmHTq4/l6hqCoylsVMLg/VmGmcpGLWBp/IPsZHfEOBHie/437pb0thwFIbn
[/ENCRYPTED_SHIPPING_DATA]
\`\`\`

---
*This order was generated automatically by GitShop. Please do not edit this issue manually.*
## MD5:\`12bd3f03153864528ed5b56a206d4d91\`
`,
      labels: [{ name: 'order' }]
    }
  }
};


async function mockCheckOrder(){
    let res = await checkOrder(mockContext)
    if(!res.isOrder || !res.isValid){
        console.log('订单验证失败')
        console.log(res)
        return
    }
    const privateKey = process.env.VITE_PRIVATE_KEY;
    const productsDatabase = JSON.parse(fs.readFileSync('.github/workflows/data/products.json', 'utf8'))
    res = await decryptOrder(res,privateKey,productsDatabase)
    if(!res.success){
        console.log('订单解密失败',res.message)
        console.log(res)
        return
    }
    const orderData = res.orderData

    const mnemonic = process.env.VITE_WALLET_MNEMONIC;
    const username = 'gitvzz';
    const wallet = generateWallet(username,mnemonic)

    const replyBody = await replyOrder(null,mockContext,orderData,wallet.walletAddress,wallet.walletPath)
    console.log(replyBody)
}
mockCheckOrder()