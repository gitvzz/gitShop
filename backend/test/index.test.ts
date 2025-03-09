import { handleIssue } from '../src/issue';
import fs from 'fs';
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCf87XLVby+vQMs
j1Ll8/hX1X99FbSEdn1Oav7iHV1jrB9RkTRYTiNRr3WfM9tQU/jv3vhGyiNhL8uF
1sGUrI3KzOLyYtWI2M/7CMwfbiClWHQ0qXuhypNsRsfvjT7QmotTZqOqIFJZWOwW
RlIDJ/pl0OmgCIGR/7ygTFp2KZ6JStf1xs8lu7JDGlPb8CJdINh+NmqUcrWrACkM
p5wxkeiFohxAQTvvBBdVMVWeIaNbFB2ndm+bIxChKN1eSUqEGRwSVRQb3//gtuKm
bbcFEYBhySkI41Thj1wCwFdoW/JEQcTJ5g0cQ1Gj1keI8zG8z0QuJtyRJuKsVWST
7+8WsyEtAgMBAAECggEAGMjFCwWKck2hpRvCKcJ0tnts6TSzR3Eqt7tpf3TdsyOI
/h+56ihACG4KaN7lT9xAbulFiYZ/FpXheygMenKFoqkTo0uAMIJT27SAbdWny6cE
k+JiYe6ciu2pbkDHEmtX76uFlvIHgIkARUVOe5G2wWRZHER6ezpn/7iaWG6Dflyc
+P6bKHNzQF4wZFG2m7IVBktKDA2BFyvx4CLUun9NO2sQUnYFwyEu6mTVH3lLE88b
6mX2D6JG5vzcv9T3qSVSiGw29AQZNmovRsIEPw8TlEk5BGKayL7akbKX3rdepDTL
J5RUwqE7rYXBmxYLcBjbjdm63lZOTURaCOMlqilwWwKBgQDfJNNvbjWtmimKNmpK
uzgbEvh0vzEG8SL8+S2qm5CeILaq44mbdnCllOeeGplUC1EAO+AbL20aqsc/UsTO
VCOF4FT8o/lUniHzYKeaAGaor6j6rnaIzT3YW2TibiF0HiCjKqxZWGfT0wlhcCmO
+cAFsMeIAKc20DyXqwpqw5QhAwKBgQC3gO7mR8zH5YeBa7BugqtoWzArnzFxomWl
0eetKJxyNigdzuzbCrWaMI+2CRdZIvW683upxRdv8O79zaBjYM/X48XQcmiChEfg
YRkVHPPzigWpSACGmeFF2/2vBOUAgIU0YqfDZWN14XhHgbtQ61zDpFf0hsnhgh+3
kngRW0pmDwKBgQDTzIN3x9bhUWtOSbn39t4ZLJdxUKv7V9QK44SJ5CCPRqO7bj+F
tRTUxZJWyg5w7FDU9QARLaHUZva5zxkIcmpJPxXLuuQEghfdhwduMCVAxYKRdhkC
XjTucElAdqIAMjxuQynVoAjk0PGdb7WyhLHTdOje2Sfd6icpGmrHzZ2C+wKBgE1S
b9fqwzgr2GhJV0OJne5QFkEbSDtIoao4g3WsWheqCEdfLOCzZ4g8FCIxPHxbxc1r
0Vzc5p5NmHarkXyui4W9vVmzC6SLVroOUAJce9LQAsisxUPyTUEhjIiV+GS4wugq
9ePYsgs24XbIDITxV9o8Qq+PqDt0mCbC+gLeQ8AzAoGBAMKUZ/p3DvYjISt9aYjS
CxY3CK4qnfvdcJK7BwU1VfdgdBSjPPePWZhwgcH/z6TBsDir85Wf7okrRi5ra8rW
MkFc08OGkSKuZHl7rLlltm8+sLDzcoOFw2xkshXml0FWR9n2td93vI1Ji4YvlCnu
2wf1MuvbkBEBrUgZG/tYaNXb
-----END PRIVATE KEY-----`;

const mnemonic = "pistol sheriff climb know inside boss survey clinic coyote smile across lamp"

process.env.PRIVATE_KEY = privateKey;
process.env.WALLET_MNEMONIC = mnemonic;
process.env.MODE = 'test';
// 测试函数
const runTest = async () => {
  try {
    console.log("开始测试订单处理...");
    
    const context = {
      payload: {
        issue: {
          labels: [{ name: 'order' }],
          user: {
            login: 'gitvzz'
          },
          title: 'Order ORDER-20250309-LHOW2G',
          body: `# Order ORDER-20250309-LHOW2G

## Products
- [武夷岩茶](https://gitvzz.github.io/gitShop/#/product/rock-tea) x1
- [Telegram开发教学](https://gitvzz.github.io/gitShop/#/product/telegram-dev) x1
- [智能手机Pro](https://gitvzz.github.io/gitShop/#/product/smartphone-pro) x1

## Order Data
[ENCRYPTED_ORDER_DATA]
mVyVcUnHhgoTY923qq5dHtxDIu9IcqZDIq/WpMLWJSJdKruGhXZRRGLOhzU8qZlXLGYmC6yYxpFjFosfmnFAUnaWB+QsDr2Huq7R4mD9c1irOpiz4seiARy/pRFsgAM6bx/EJf98utVFVbmbDhNwmYu3n6CkCwpqPIA/mwL+GYU3OxXdp7At2GmDxvT1GSDap6z7jGoWcs1sFiaGZHtfUBog0VuR092+fAC9aJpPw3R3erOSr5m5rkHBsBcmC3hdlF5gohGqR+z8srqLuyd5Nbemie8KiRMenNr6D/k0mLdzTepErpfN/rDuc/OpvVdNpYh/4oyz3k+/O4hng9mNzQ==.voNuY7ZxnISLXvvEi6faCyu9DJTGkL/epNTnEG8/aFwbrCvz3qMjtOagUXwy4nyNvIQlNwMA1+mpASKGDkVMygWF7JcacGUiEGbGDoWqOPXejQbpPyQrgKhG/qOc3g8gIbhkk3x5H7gGzEIesWAJN3u7w72fjnx2FK4/3Me4y0Er9AaO6rm9zBao1DyL0fw0Iibua1S9d2WJ4yAwl4O2jVFEXXlf6MsDeidMmSakUz0n23kOE1crz1Olj75U+2G9NzOt6PJTC/BH4hY0vevIPILJn7f6E7PSEh+sJ9ff+cdcEd24/gDNDaLnTiYzJmg/RFgyh7ZnLagNn0DJNVl6DO9j7qbzoxWuAiZfEAspKbJsfgWVebuEmCN/RFQOwjvXzgYjWqZvp+a50gJXSdrNQZBjcO1NPZ4SbMLOxk7s7+mtNoDrAB9xnsUWK58WI15Aszc406SUfPiVt21+BDReShAKSu6u+t2vWz5lUA0n52eYFygiGRF/C+Do+1JREDs49nWOy4RgkIg7RQnFnCgrwaNIYTxenH2Uq7uNLThHeEonj05iLb0SaWyEwtUlobK52eOEDxOPBMCeihd3x+XclfPqBq2EX+zD3H/prv3o8txrg4F8ANjw30WBoeJfdic1adXrIaW3uUC3ZMaZSJg7s/PV+NuXc6PP+X26sez+5+l3Jp/Fvl5Eivu8llRT+oNT8Tq3uoBTGjAUuu7uoWWk/78vAURwroKM7ivD6bGzkIZpwbmkatbw8dctOwFUFovcszuLqMnkqR8jK1Y3CSwOAGcUhosz3+ugIb+Ogjd4PzY=
[/ENCRYPTED_ORDER_DATA]

## Shipping Data
[ENCRYPTED_SHIPPING_DATA]
PtOWV9Qw/87rRbceIbSOzzoNHKNuQ9qRUmWHR9FZp3cVlZ8ygp3O0pFPqgA2s2698DWYfMqLBNrI1tQub7iqf/9koROQF9IUMWFQyygXV+edPL13CEMfW5MveAvk0mi5EcYfDOt6yvO7zyInxonNvt4+iGzrLklLOS/+pqaSogexZ72rcMrjRoWtqukLjGWK4hFXCkK9bTG3/W4xyVoC/rLGBglyuayKRoy7yUxrLyqT9f6eVtZB3SC7j2gVgLndiSYkxKu4kFfxdY5eMKIu8uik0j+cKLn5ql1Vqlci6BiQyT/uXuGfRyOha0ZSQh6QPQ66veg1yyX7T+KguxFGLQ==.1cpL4he7tlpbMkw7pLzig5nAeGhdZzJCoieUf/AAabaCFdbdQU3oI9XwtSo6IF1WxwZcHHOO3zrKZu1UESNZmvCLTj+vhQhMzWj9WmRAS3/4OEuXJRrj7P2N9SPL9B+OZ8hunOQJxUwN0On2ZYeOpR5u8Pb86ABXXjdz3t/Khytn8u4n6hmSuSJhjZYoAYi1rslCqMzHdib2JVXG1FB8313qdymz4iDBOccCfXzC+FIB/ipFhjJzhuBvxyPqvRRxA+vz0HYznE2aPEtOdIfUD7LgVW+8NpgJ1hslFJoLKNOaJXN723/2eCtFxoLar07Y2YpSIOFnofaPAYLU5M/CLYHluK5ggEk2cq5hUwQ/dX0=
[/ENCRYPTED_SHIPPING_DATA]

---
*This order was generated automatically by GitShop. Please do not edit this issue manually.*
MD5:d8367e7c40270e5758de014b26657574`,
        }
      }
    };
    
    const result = await handleIssue(null, context);
    
    return result;
  } catch (error) {
    console.error("测试过程中出现错误:", error);
    throw error;
  }
}

const syncProducts = async () => {
  let categoryUrl = 'frontend/public/products/index.json'
  const path = require('path');
  const projectRoot = process.cwd(); // 获取当前工作目录
  categoryUrl = path.join(projectRoot, '..', categoryUrl);
  const category = JSON.parse(fs.readFileSync(categoryUrl, 'utf8'));
  const products = [] as any[];
  category.items.forEach((item: any) => {
    const productPath = path.join(projectRoot, '..', 'frontend/public/products', `${item.id}.json`);
    if (fs.existsSync(productPath)) {
      const list = JSON.parse(fs.readFileSync(productPath, 'utf8'));
      list.forEach((product: any) => {
        const value = {
          id: product.id,
          price: product.price,
          promotions: {}
        } as any
        if (product.merchant_id) {
          value['merchant_id'] = product.merchant_id;
        }
        const { discount_percent, tier_pricing, threshold_discounts } = product.promotions || {};
        if (discount_percent) {
          value['promotions']['discount_percent'] = discount_percent;
        }
        if (tier_pricing) {
          value['promotions']['tier_pricing'] = tier_pricing.map((t:any)=>({
            min_quantity: t.min_quantity,
            discount_percent: t.discount_percent
          })).filter((_t:any,index:number)=>index<2).sort((a:any,b:any)=>b.min_quantity-a.min_quantity);
        }
        if (threshold_discounts) {
          value['promotions']['threshold_discounts'] = threshold_discounts.map((t:any)=>({
            threshold: t.threshold,
            discount_amount: t.discount_amount
          })).filter((_t:any,index:number)=>index<2).sort((a:any,b:any)=>b.threshold-a.threshold);
        }
        products.push(value);
      })
    }
  })
  // 写入结果到 products.json
  const outputPath = path.join(projectRoot,'..','.github', 'workflows', 'data', 'products.json');
  console.log(outputPath);

  fs.writeFileSync(outputPath, JSON.stringify(products, null, 4));
  //console.log(products);
}

syncProducts()
// 执行测试
runTest().then(() => {
  console.log("测试完成");
  process.exit(0);
}).catch(error => {
  console.error("测试失败:", error);
  process.exit(1);
}); 