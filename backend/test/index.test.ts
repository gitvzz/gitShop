import { handleIssue } from '../src/issue';
import { syncProducts } from '../src/sync-products';

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
          title: 'Order ORDER-20250309-QIVV6X',
          body: `# Order ORDER-20250309-QIVV6X
Distributor ID: netferes

## Products
- [武夷岩茶](https://gitvzz.github.io/gitShop/#/product/rock-tea?ref=netferes) x1
- [Telegram开发教学1](https://gitvzz.github.io/gitShop/#/product/telegram-dev?ref=netferes) x2
- [智能手机Pro](https://gitvzz.github.io/gitShop/#/product/smartphone-pro?ref=netferes) x1

## Order Data
[ENCRYPTED_ORDER_DATA]
afRESCjSV3ob8bZQvCQ7iWNJ+33Th9PLGRhaLr8fUH1yZLN5Qe2I4itXf7/bmWUN5KYsl2E39i9Sm7z+C3mQdnci2qMlNqQpYNAp8aQxnoU3i3MHY+5v/gvRLta1JEBLueRAFMaupGCCIe9L0+QVDs82yqg5T4DWq+yFfSbniXcj3IQGyYZ5C5kteDKIE7BLKzBRlxGiaj67/C4VkIwKwzj7pmKdx6wbf3/NmlWgSTAOnEC6HLP/6YzSM03/z5mwNcIpVrlnSgF1SJ7SzabbopgOBZ8Tu5ywZ0LRCL5djH3HNwAQ83mMoD/gmqE/XxOAzKr2T0xlnznHiPOksMB0GQ==.+j0f7zb/K3ZLuMUaKE1VVW1DTlMUL2B0au4+7A9vhVo3CcB/tO5bAY/zC8OvYMqn0R1F82KsQF5fXeH2w922neWClcgn2USrl8yVyp+He0ddHoWPCXBgoTyJagp9MvKkFmuVCR9GKcxS5+00/JaupARY0grpkjS4iLJ4Ltx6L3bnwagleEUpX36IRl5L276hvOXrlOlQs93r5LZlonCc9VLsPOI+wB4jXEiDaOUtEax0jFA6fRZuMGD4RBnVlvOJODiK6rM3aL7CqNNN0xtn7dsA/kVtmmTOOkZPCAMnduAcLdmDi/F6awxxmiJ8eUWII/AMilPXMlYF0exQvejwtwSm2aP5SNgGGsTA4slb+m+k8v1pyW2A0h+OibHCiIItfuJ6to/qW3NRzCyAAmH+FXpaTMhCDJ2QlXodDvtt9tC7URP920tuw49n+NK3rue3+FsNJ/OIB2UQqO1Bz+3GsRtpwcYRtXNyeuKnxnZGXRhypyd6YuuImOoE1hVTrlyrmESMBxP2z51rpsdjVCWyT5AS76pLR8Dr1q1hUC++LsKtxBArzag68fo2A7XM6MatLyoXLf3nRW9JaTX/FUrBTgKPx6/DISYujFSn2cazXF2LabB27Z/O+8s4SHiqnZ5Q0Wr4Dyo8rs7cRfNdTEMnVznjMn/xGwvKoJON/hxzy/dM5hJOKvEEYCN9Gv52tw+wmg73QNTGKFRtVI6LtTO06fM8fZe3anifdUNvdaAGHHEdZnq+i8E9TAGK3jmrGDmvPLWLfQ1AVz8tttlhk/cIMZV0l8/NCEVyDYxX0SIZ+B87i/VwIeMkPYexI0bpBjSFwRgqspgAeNoYkCwwhpNjSA8OYoDTBhLmDfReLHedXsNm0veBgFoA2l6ze66165OnmJjfhSWcWYdk2x+QDy8t9ZRP24uVJK0YTlMfxu9SHyeb4ehnyGIExXLY/n0gshzlHqcYd5S3Zy5lnF8KBqtT/9QDf9DCV4wIUOY/khl/TnaxX507yyTM0RNgbKRIBqcB
[/ENCRYPTED_ORDER_DATA]

## Shipping Data
[ENCRYPTED_SHIPPING_DATA]
A22lTMWsd3Ihs8GjZxW6SNuUQO3Xxx/5jUNDVrTnEinppoG0SmFdVWMnIpJC8cDqZf+vyrJqZmsjADcWPTMn2+KH+Eu6bYGnc6n1n4xX1mpKfO8idRGTZgtuwrA36OU8b05JfFqBFqlEQTcMYfAs7yZ2yDu47RokeR0HJijMbwsEKUH20iztpzLmAM8w6QTNpIl4/Sr1mIP53XqqCsnjOXQ8ICHOquS1faYyCv/ibitZ2gfy6ARCyrUnB6+7amIPNSSH/NMKCLimj+XKR0xaNl5byMYdEkZFhzFP9gh7SsRQyktntTQPLt0bu4gzecHK1fkHmFNxaLtEtSUnYxpQpw==.s1aYjKmXYmySlXrZKFmWtRHwIkzXpXIh9HtZYGhlzucupQqmLDKKN3ymeQlDgXNb33PW6kOO1D92heGw4erhEo5aUtQpYtsYS8qEexLhh1VO2Mh7dNUQ1ZEzV6OyDUQaKePRTNKHdZUCAxxFeL8Gcz1RZQS+49KIk9p/OICAh/0pGGbaaxB5G1Y0Wfq74NdIqombBmaTg/LlLO9b4kjcn/ZyZmfuWg8LHSphl/uWwrnRNJCOjrUmubsDPB5UKj+9tI5FiARLqlHgwMKfvpCdK4nO+Uiyi1LuQajFrmbhj8lqFZL39c1GYOCTMQv7swUvRwT9tN6FH6sGX8akNuK2i0maMUYa/l3x3+Y3e00wTNM=
[/ENCRYPTED_SHIPPING_DATA]

---
*This order was generated automatically by GitShop. Please do not edit this issue manually.*
MD5:7f5d82ff9f936e53166d32e0d485b51b`,
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

syncProducts()
// 执行测试
runTest().then(() => {
  console.log("测试完成");
  process.exit(0);
}).catch(error => {
  console.error("测试失败:", error);
  process.exit(1);
}); 

import bs58 from 'bs58'
// 将以太坊地址转换为Tron地址的函数
function toBase58CheckAddress(ethAddress:string) {
  // 引入所需的库
  const crypto = require('crypto');
  //const bs58 = require('bs58');
  
  
  // 移除0x前缀（如果有）
  let hexAddress = ethAddress.startsWith('0x') ? ethAddress.slice(2) : ethAddress;
  
  // 添加Tron地址前缀41
  hexAddress = '41' + hexAddress;
  
  // 将十六进制字符串转换为Buffer
  const addressBytes = Buffer.from(hexAddress, 'hex');
  
  // 第一次SHA256哈希
  const hash1 = crypto.createHash('sha256').update(addressBytes).digest();
  
  // 第二次SHA256哈希
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  
  // 取前4个字节作为校验和
  const checksum = hash2.slice(0, 4);
  
  // 连接地址和校验和
  const addressWithChecksum = Buffer.concat([addressBytes, checksum]);
  // Base58编码
  const base58Address = bs58.encode(addressWithChecksum);
  
  return base58Address;
}

// 示例使用
/* const ethAddress = '0x44E05b79817b4A1829c1aC8598F3416a93666666';
const tronAddress = toBase58CheckAddress(ethAddress);
console.log(tronAddress); */