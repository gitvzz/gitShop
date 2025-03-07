# GitShop 订单处理工作流

本文档详细描述了GitShop平台的订单处理工作流，包括订单提交、验证、支付处理和订单完成的整个流程。

## 1. 订单处理流程概述

GitShop采用基于GitHub Issues的订单处理系统，主要流程如下：

1. 用户在购物车中选择商品并结算
2. 系统生成订单数据并使用RSA和AES混合加密
3. 系统创建GitHub Issue，包含加密的订单数据
4. GitHub Actions工作流解密订单数据并验证
5. 验证通过后，生成支付信息并回复到Issue中
6. 用户完成支付并在Issue中回复交易ID
7. 系统验证支付并处理订单
8. 订单完成后，系统更新Issue状态

整个流程利用GitHub的基础设施，无需专门的后端服务器，同时通过加密和验证机制确保订单数据的安全性和完整性。

## 2. 订单提交流程

### 2.1 前端订单生成

用户在前端完成商品选择和结算操作后，系统会执行以下步骤：

1. 生成唯一的订单ID
2. 收集订单商品信息和价格数据
3. 计算订单摘要（小计、折扣、总计）
4. 使用RSA和AES混合加密订单数据
5. 如有实物商品，加密收货信息
6. 生成订单内容的MD5签名
7. 创建GitHub Issue URL，包含加密的订单数据

### 2.2 GitHub Issue结构

订单Issue包含以下部分：

1. **标题**：`Order: [订单ID]`
2. **正文**：
   - 订单摘要信息（明文）
   - 商品列表（明文）
   - 加密的订单数据（使用RSA和AES混合加密）
   - 加密的收货信息（如果有实物商品）
   - MD5签名（用于验证内容完整性）

## 3. 订单验证流程

当新的Issue创建后，GitHub Actions工作流会自动触发，执行以下验证步骤：

### 3.1 Issue类型检查

首先，系统会检查Issue是否为订单Issue：

1. 检查Issue标题是否以"Order:"开头
2. 检查Issue正文是否包含加密的订单数据
3. 如果不是订单Issue，系统会关闭Issue并添加说明

### 3.2 订单数据解密

对于有效的订单Issue，系统会执行以下解密步骤：

1. 提取加密的订单数据和收货信息
2. 使用存储在GitHub Secrets中的私钥解密数据
3. 解析解密后的JSON数据

### 3.3 订单数据验证

系统会对解密后的订单数据进行全面验证：

1. 验证MD5签名，确保订单内容完整性
2. 加载商品数据库（`.github/workflows/data/products/`）
3. 验证每个商品的价格是否与数据库一致
4. 重新计算每个商品的折扣，并与订单中的折扣比较
5. 重新计算订单摘要，并与订单中的摘要比较

如果验证失败，系统会在Issue中回复详细的错误信息，并关闭Issue。

## 4. 支付处理流程

### 4.1 生成支付信息

对于验证通过的订单，系统会执行以下步骤：

1. 基于用户名生成确定性的钱包路径
2. 使用存储在GitHub Secrets中的助记词生成钱包地址
3. 计算支付截止时间（当前时间 + 48小时）
4. 在Issue中回复支付信息，包括：
   - 订单信息摘要
   - 支付金额和收款地址
   - 支付截止时间和说明
   - 收货信息确认（如有）
5. 更新Issue标签为"pending-payment"

### 4.2 支付确认

用户完成支付后，需要在Issue中回复交易ID。系统会监听Issue的评论，当检测到可能的交易ID时，会执行以下步骤：

1. 验证交易ID的有效性
2. 检查交易金额是否匹配订单金额
3. 检查收款地址是否匹配生成的地址
4. 确认交易已完成并且不可逆转

### 4.3 订单处理

支付确认后，系统会根据订单类型执行不同的处理流程：

1. **数字商品**：
   - 生成访问链接或激活码
   - 在Issue中回复访问信息
   - 更新Issue标签为"completed"

2. **实物商品**：
   - 通知商家处理订单
   - 在Issue中回复物流信息
   - 更新Issue标签为"shipping"

## 5. 工作流实现

### 5.1 GitHub Actions工作流文件

订单处理工作流定义在`.github/workflows/order-processing.yml`文件中，主要包含以下步骤：

```yaml
name: 订单处理工作流

on:
  issues:
    types: [opened]

jobs:
  process-order:
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v3

      - name: 设置Node.js环境
        uses: actions/setup-node@v3
        with:
          node-version: '16'

      - name: 安装依赖
        run: |
          npm install crypto-js
          npm install jsencrypt
          npm install ethers@5.7.2
          npm install md5

      # 检查Issue是否为订单
      - name: 检查Issue是否为订单
        id: check_order
        uses: actions/github-script@v6
        with:
          script: |
            # 检查逻辑...

      # 处理非订单Issue
      - name: 处理非订单Issue
        if: fromJSON(steps.check_order.outputs.result).isOrder == false
        uses: actions/github-script@v6
        with:
          script: |
            # 处理逻辑...

      # 解密和验证订单数据
      - name: 解密和验证订单数据
        if: fromJSON(steps.check_order.outputs.result).isOrder == true
        id: decrypt_order
        uses: actions/github-script@v6
        with:
          script: |
            # 解密和验证逻辑...

      # 处理验证失败的订单
      - name: 处理验证失败的订单
        if: fromJSON(steps.decrypt_order.outputs.result).success == false
        uses: actions/github-script@v6
        with:
          script: |
            # 处理逻辑...

      # 生成钱包地址
      - name: 创建钱包生成脚本
        if: fromJSON(steps.decrypt_order.outputs.result).success == true
        run: |
          # 创建脚本...

      - name: 生成钱包地址
        if: fromJSON(steps.decrypt_order.outputs.result).success == true
        id: generate_wallet
        run: node generate-wallet.js
        env:
          WALLET_MNEMONIC: ${{ secrets.WALLET_MNEMONIC }}

      # 回复订单确认
      - name: 回复订单确认
        if: fromJSON(steps.decrypt_order.outputs.result).success == true
        uses: actions/github-script@v6
        with:
          script: |
            # 回复逻辑...
```

### 5.2 钱包地址生成

系统使用确定性钱包生成方法，基于用户名创建唯一的钱包路径：

```javascript
// 获取提交issue的用户名
const username = process.env.GITHUB_ACTOR;

// 将用户名转换为数字
let numericValue = '';
for (let i = 0; i < username.length; i++) {
  numericValue += username.charCodeAt(i).toString();
}

// 确保数字不超过路径的限制
const maxIndexValue = 2147483647; // 2^31 - 1
const pathIndices = [];
let currentIndex = 0;

// 将数字分割成多个部分以适应路径
while (currentIndex < numericValue.length) {
  const part = numericValue.substring(currentIndex, currentIndex + 9);
  const indexValue = parseInt(part, 10) % maxIndexValue;
  pathIndices.push(indexValue);
  currentIndex += 9;
}

// 生成路径
const path = `m/44'/60'/${pathIndices[0] || 0}'/${pathIndices[1] || 0}/${pathIndices[2] || 0}`;

// 使用助记词生成钱包
const mnemonic = process.env.WALLET_MNEMONIC;
const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
```

这种方法确保同一用户每次生成的钱包地址都相同，便于跟踪和管理。

## 6. 安全考虑

### 6.1 数据安全

- 订单数据使用RSA和AES混合加密，保护敏感信息
- 私钥存储在GitHub Secrets中，不会暴露在代码或日志中
- MD5签名确保订单内容完整性，防止篡改

### 6.2 支付安全

- 使用确定性钱包生成，确保收款地址的可追溯性
- 助记词存储在GitHub Secrets中，确保钱包安全
- 交易验证确保支付金额和收款地址正确

### 6.3 潜在风险和缓解措施

1. **订单伪造**：
   - 风险：用户可能绕过网站直接提交Issue
   - 缓解：严格的订单验证确保只有有效订单才会被处理

2. **支付欺诈**：
   - 风险：用户可能提供虚假的交易ID
   - 缓解：自动验证交易ID的有效性和交易状态

3. **私钥泄露**：
   - 风险：私钥可能被泄露导致订单数据被解密
   - 缓解：定期轮换密钥对，限制私钥访问权限

## 7. 总结

GitShop的订单处理工作流利用GitHub平台的功能，实现了一个无需专门后端服务器的电子商务解决方案。通过GitHub Actions、加密技术和确定性钱包生成，系统能够安全地处理订单数据、验证支付和管理订单状态。

这种设计既保持了开源透明性，又提供了必要的安全保障，适合小型电子商务项目和开源商店使用。 