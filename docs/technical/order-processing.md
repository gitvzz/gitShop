# GitShop 订单处理流程技术文档

本文档详细描述了GitShop平台的订单处理流程，包括订单数据结构、价格计算、加密解密和校验逻辑。

## 1. 订单处理流程概述

GitShop采用基于GitHub Issues的订单处理系统，主要流程如下：

1. 用户在购物车中选择商品并结算
2. 系统生成订单数据并使用RSA公钥加密
3. 系统创建GitHub Issue，包含加密的订单数据
4. GitHub Actions工作流解密订单数据并验证
5. 验证通过后，生成支付信息并回复到Issue中

整个流程利用GitHub的基础设施，无需专门的后端服务器，同时通过加密和验证机制确保订单数据的安全性和完整性。

## 2. 订单数据结构

### 2.1 订单对象结构

```typescript
interface OrderData {
  orderId: string;                // 订单唯一ID
  items: OrderItem[];            // 订单商品列表
  summary: OrderSummary;         // 订单摘要（价格信息）
  distributor_id: string | null; // 分销商ID（如果有）
  created_at: string;            // 创建时间（ISO格式）
}

interface OrderItem {
  id: string;                    // 商品ID
  name: string;                  // 商品名称
  price: number;                 // 商品原价
  quantity: number;              // 购买数量
  appliedDiscount: Discount | null; // 应用的折扣信息
}

interface OrderSummary {
  subtotal: string;              // 小计（原价总和）
  discount: string;              // 折扣总额
  total: string;                 // 最终支付金额
}

interface Discount {
  type: 'percent' | 'tier' | 'threshold'; // 折扣类型
  value: number;                 // 折扣值（百分比或金额）
  min_quantity?: number;         // 最小数量（阶梯定价）
  threshold?: number;            // 阈值（满额折扣）
}
```

### 2.2 GitHub Issue 结构

GitHub Issue包含以下部分：

1. **标题**：`Order: [订单ID]`
2. **正文**：
   - 订单摘要信息（明文）
   - 商品列表（明文）
   - 加密的订单数据（使用RSA和AES混合加密）
   - 加密的收货信息（如果有实物商品）
   - MD5签名（用于验证内容完整性）

## 3. 价格和折扣计算

### 3.1 折扣类型

GitShop支持三种类型的商品折扣：

1. **直接百分比折扣**：对商品价格直接应用固定百分比的折扣
2. **阶梯定价**：基于购买数量的折扣，数量越多折扣越大
3. **满额折扣**：基于商品总价的折扣，总价达到特定阈值时减去固定金额

### 3.2 折扣计算逻辑

以下是折扣计算的核心代码：

```typescript
// 计算商品折扣
computeItemDiscount(item: CartProduct) {
  let amount = 0;
  let appliedDiscount = null;
  
  if (item.promotions) {
    // 1. 直接百分比折扣
    if (item.promotions.discount_percent) {
      amount = item.price * item.quantity * item.promotions.discount_percent / 100;
      appliedDiscount = {
        type: 'percent',
        value: item.promotions.discount_percent
      };
    }
    
    // 2. 阶梯定价
    else if (item.promotions.tier_pricing) {
      const tiers = [...item.promotions.tier_pricing].sort((a, b) => b.min_quantity - a.min_quantity);
      
      for (const tier of tiers) {
        if (item.quantity >= tier.min_quantity) {
          amount = item.price * item.quantity * tier.discount_percent / 100;
          appliedDiscount = {
            type: 'tier',
            value: tier.discount_percent,
            min_quantity: tier.min_quantity
          };
          break;
        }
      }
    }
    
    // 3. 满额折扣
    else if (item.promotions.threshold_discounts) {
      const itemTotal = item.price * item.quantity;
      const thresholds = [...item.promotions.threshold_discounts].sort((a, b) => b.threshold - a.threshold);
      
      for (const threshold of thresholds) {
        if (itemTotal >= threshold.threshold) {
          amount = threshold.discount_amount;
          appliedDiscount = {
            type: 'threshold',
            value: threshold.discount_amount,
            threshold: threshold.threshold
          };
          break;
        }
      }
    }
  }
  
  return { amount, appliedDiscount };
}
```

### 3.3 订单摘要计算

订单摘要包含三个关键值：

```typescript
// 小计：所有选中商品的原价总和
const selectedSubtotal = selectedItems.value.reduce((total, item) => {
  return total + item.price * item.quantity
}, 0).toFixed(2);

// 折扣：所有选中商品的折扣总和
const selectedPromotions = selectedItems.value.reduce((total, item) => {
  const {amount} = store.computeItemDiscount(item);
  return total + amount;
}, 0).toFixed(2);

// 总计：小计减去折扣
const selectedTotal = (parseFloat(selectedSubtotal) - parseFloat(selectedPromotions)).toFixed(2);
```

## 4. 加密与解密

### 4.1 加密机制

GitShop使用RSA和AES混合加密保护订单数据：

1. **混合加密**：
   - 使用AES对数据进行加密（高效处理大量数据）
   - 使用RSA对AES密钥进行加密（安全传输密钥）

2. **加密流程**：
   - 生成随机AES密钥
   - 使用AES密钥加密订单数据
   - 使用RSA公钥加密AES密钥
   - 组合加密后的密钥和数据

### 4.2 加密实现

```typescript
// 使用混合加密方法加密数据
encryptData(data: any) {
  // 将数据转换为JSON字符串
  const jsonStr = JSON.stringify(data);
  
  // 生成随机AES密钥
  const aesKey = CryptoJS.lib.WordArray.random(16).toString();
  
  // 使用AES加密数据
  const encryptedData = CryptoJS.AES.encrypt(jsonStr, aesKey).toString();
  
  // 使用RSA公钥加密AES密钥
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(this.publicKey);
  const encryptedKey = encryptor.encrypt(aesKey);
  
  // 返回格式：RSA加密的AES密钥 + "." + AES加密的数据
  const result = `${encryptedKey}.${encryptedData}`;
  return result;
}
```

### 4.3 解密实现（GitHub Actions中）

```javascript
// 使用混合加密方法解密数据
function decryptData(encryptedString, privateKey) {
  try {
    // 分离加密的密钥和数据
    const [encryptedKey, encryptedData] = encryptedString.split('.');
    
    // 使用RSA私钥解密AES密钥
    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(privateKey);
    const aesKey = decryptor.decrypt(encryptedKey);
    
    if (!aesKey) {
      throw new Error('Failed to decrypt AES key');
    }
    
    // 使用AES密钥解密数据
    const bytes = CryptoJS.AES.decrypt(encryptedData, aesKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    // 解析JSON数据
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}
```

## 5. 订单验证

### 5.1 验证流程

GitHub Actions中的订单验证流程：

1. 解密订单数据
2. 加载商品数据库（`/.github/workflows/data/products.json`）
3. 重新计算每个商品的折扣
4. 重新计算订单摘要
5. 比较计算结果与订单中的数据

### 5.2 验证实现

```javascript
// 验证订单数据
function validateOrder(orderData, productsDatabase) {
  // 验证结果
  const validationResult = {
    valid: true,
    errors: []
  };
  
  // 验证每个商品
  for (const item of orderData.items) {
    // 从数据库中获取商品信息
    const productInfo = productsDatabase.find(p => p.id === item.id);
    
    if (!productInfo) {
      validationResult.valid = false;
      validationResult.errors.push(`Product not found: ${item.id}`);
      continue;
    }
    
    // 验证价格
    if (productInfo.price !== item.price) {
      validationResult.valid = false;
      validationResult.errors.push(`Price mismatch for ${item.id}: ${item.price} vs ${productInfo.price}`);
    }
    
    // 重新计算折扣
    const calculatedDiscount = computeItemDiscount({
      ...productInfo,
      quantity: item.quantity
    });
    
    // 验证折扣
    if (JSON.stringify(calculatedDiscount.appliedDiscount) !== JSON.stringify(item.appliedDiscount)) {
      validationResult.valid = false;
      validationResult.errors.push(`Discount mismatch for ${item.id}`);
    }
  }
  
  // 重新计算订单摘要
  const calculatedSummary = calculateOrderSummary(orderData.items, productsDatabase);
  
  // 验证订单摘要
  if (calculatedSummary.subtotal !== orderData.summary.subtotal ||
      calculatedSummary.discount !== orderData.summary.discount ||
      calculatedSummary.total !== orderData.summary.total) {
    validationResult.valid = false;
    validationResult.errors.push('Order summary mismatch');
  }
  
  return validationResult;
}

// 计算订单摘要
function calculateOrderSummary(items, productsDatabase) {
  let subtotal = 0;
  let discount = 0;
  
  for (const item of items) {
    // 计算小计
    subtotal += item.price * item.quantity;
    
    // 计算折扣
    const productInfo = productsDatabase.find(p => p.id === item.id);
    if (productInfo) {
      const { amount } = computeItemDiscount({
        ...productInfo,
        quantity: item.quantity
      });
      discount += amount;
    }
  }
  
  // 计算总计
  const total = subtotal - discount;
  
  return {
    subtotal: subtotal.toFixed(2),
    discount: discount.toFixed(2),
    total: total.toFixed(2)
  };
}
```

## 6. 安全考虑

### 6.1 安全机制

GitShop的订单处理系统包含以下安全机制：

1. **RSA和AES混合加密**：保护敏感订单数据和收货信息
2. **MD5签名验证**：确保订单内容完整性
3. **双重校验**：前端和后端使用相同逻辑计算价格和折扣
4. **GitHub身份验证**：订单通过GitHub Issues提交，需要GitHub账户

### 6.2 潜在风险

尽管有上述安全机制，系统仍存在一些潜在风险：

1. **订单伪造**：用户可以绕过网站直接提交Issue，但需要通过验证才能被视为有效订单
2. **重放攻击**：攻击者可能复制之前的有效订单数据，创建新Issue
3. **分销商ID伪造**：攻击者可能尝试修改分销商ID，将佣金引导到自己账户

### 6.3 风险缓解

针对上述风险，可采取以下缓解措施：

1. **订单唯一性检查**：验证订单ID和创建时间的唯一性
2. **分销商验证**：验证分销商ID是否存在于已注册的分销商列表中
3. **订单状态跟踪**：维护已处理订单的数据库，防止重复处理

## 7. 订单提交实现

以下是`submitOrder`方法的核心实现：

```typescript
submitOrder(items: CartProduct[], summary: {subtotal: string, discount: string, total: string}, shippingInfo?: any) {
  // 生成订单ID
  const orderId = this.generateOrderId();
  
  // 准备订单数据
  const orderData = {
    orderId,
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      appliedDiscount: this.computeItemDiscount(item).appliedDiscount
    })),
    summary,
    distributor_id: this.distributor_id || null,
    created_at: new Date().toISOString()
  };
  
  // 加密订单数据
  const encryptedOrderData = this.encryptData(orderData);
  
  // 如果有收货信息，加密收货信息
  let encryptedShippingData = null;
  if (shippingInfo) {
    encryptedShippingData = this.encryptData(shippingInfo);
  }
  
  // 创建Issue标题
  const issueTitle = `Order: ${orderId}`;
  
  // 创建Issue正文
  let issueBody = `# Order: ${orderId}

## Order Summary
- Order ID: ${orderId}
- Created: ${new Date().toLocaleString()}
- Subtotal: ${summary.subtotal}
- Discount: ${summary.discount}
- Total: ${summary.total}
`;

  // 如果有分销商ID，添加到正文
  if (this.distributor_id) {
    issueBody += `- Distributor: ${this.distributor_id}\n`;
  }

  // 添加商品列表
  const productList = items.map(item => {
    return `- ${item.name} x ${item.quantity} @ ${item.price} = ${(item.price * item.quantity).toFixed(2)}`;
  }).join('\n');

  issueBody += `
## Products
${productList}

## Order Data
\`\`\`
[ENCRYPTED_ORDER_DATA]
${encryptedOrderData}
[/ENCRYPTED_ORDER_DATA]
\`\`\`
`;

  // 如果有收货信息，添加到正文
  if (encryptedShippingData) {
    issueBody += `
## Shipping Data
\`\`\`
[ENCRYPTED_SHIPPING_DATA]
${encryptedShippingData}
[/ENCRYPTED_SHIPPING_DATA]
\`\`\`
`;
  }
  
  // 添加说明信息
  issueBody += `
---
*This order was generated automatically by GitShop. Please do not edit this issue manually.*
`;

  // 生成订单内容的MD5签名
  const contentToSign = issueTitle + issueBody;
  const signature = CryptoJS.MD5(contentToSign).toString();
  
  // 将签名添加到issueBody
  issueBody += `
## Signature
\`${signature}\`
`;

  // 创建GitHub Issue URL
  const encodedBody = encodeURIComponent(issueBody);
  const encodedTitle = encodeURIComponent(issueTitle);
  const issueUrl = `${this.githubUrl}/issues/new?title=${encodedTitle}&labels=order&body=${encodedBody}`;
  
  return {orderId, issueUrl, issueTitle, issueBody};
}
```

## 8. 总结

GitShop的订单处理系统利用GitHub平台的功能，实现了一个无需专门后端服务器的电子商务解决方案。通过RSA和AES混合加密和严格的验证机制，确保了订单数据的安全性和完整性。

虽然用户可以绕过网站直接提交Issue，但系统的验证机制确保只有符合要求的订单才会被处理。这种设计既保持了开源透明性，又提供了必要的安全保障。

在实际部署中，应确保私钥的安全存储，并定期更新商品数据库，以保持价格和促销信息的一致性。 