/**
 * 解密和验证订单数据
 * 
 * @param {object} result 检查订单的结果
 * @param {string} privateKey RSA私钥
 * @param {array} productsDatabase 商品数据库
 * @returns {object} 解密和验证结果
 */
module.exports = async (result, privateKey, productsDatabase) => {
  const forge = require('node-forge');
  
  // 解密订单数据函数
  function decryptData(encryptedString, pri_key) {
    // 分离加密的密钥和数据
    const [encryptedKeyBase64, encryptedDataBase64] = encryptedString.split('.');
    
    // Base64 解码
    const encryptedKey = forge.util.decode64(encryptedKeyBase64);
    const encryptedDataWithIv = forge.util.decode64(encryptedDataBase64);
    
    // 提取 IV (前16字节) 和加密数据
    const iv = encryptedDataWithIv.substring(0, 16);
    const encryptedData = encryptedDataWithIv.substring(16);
    
    // 使用 RSA 解密 AES 密钥
    const privateKey = forge.pki.privateKeyFromPem(pri_key);
    const aesKey = privateKey.decrypt(encryptedKey);
    
    // 使用 AES 解密数据
    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(encryptedData));
    decipher.finish();
    const decryptedData = decipher.output.toString();
    
    // 解析 JSON
    return JSON.parse(decryptedData);
  }
  
  
  // 安全的数值比较函数，避免浮点数精度问题
  function safeNumberCompare(a, b) {
    // 将两个值转换为固定精度的字符串进行比较
    const aStr = typeof a === 'string' ? a : Number(a).toFixed(2);
    const bStr = typeof b === 'string' ? b : Number(b).toFixed(2);
    
    // 移除可能的前导零和尾随零，但保留小数点后两位
    const normalizeNumber = (str) => {
      // 确保有两位小数
      const parts = str.split('.');
      if (parts.length === 1) return `${parts[0]}.00`;
      if (parts[1].length === 1) return `${parts[0]}.${parts[1]}0`;
      return `${parts[0]}.${parts[1].substring(0, 2)}`;
    };
    
    return normalizeNumber(aStr) === normalizeNumber(bStr);
  }
  
  // 计算商品折扣
  function computeItemDiscount(item, productInfo) {
    let amount = 0;
    let appliedDiscount = null;
    
    // 确保价格是数字类型用于计算
    const itemPrice = parseFloat(item.price);
    const itemQuantity = parseInt(item.quantity);
    
    if (productInfo.promotions) {
      // 1. 直接百分比折扣
      if (productInfo.promotions.discount_percent) {
        amount = itemPrice * itemQuantity * productInfo.promotions.discount_percent / 100;
        appliedDiscount = {
          type: 'percent',
          value: productInfo.promotions.discount_percent
        };
      }
      
      // 2. 阶梯定价
      else if (productInfo.promotions.tier_pricing) {
        // 按min_quantity降序排序，以便先匹配最高折扣
        const tiers = [...productInfo.promotions.tier_pricing].sort((a, b) => b.min_quantity - a.min_quantity);
        
        for (const tier of tiers) {
          if (itemQuantity >= tier.min_quantity) {
            amount = itemPrice * itemQuantity * tier.discount_percent / 100;
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
      else if (productInfo.promotions.threshold_discounts) {
        const itemTotal = itemPrice * itemQuantity;
        // 按threshold降序排序，以便先匹配最高门槛的折扣
        const thresholds = [...productInfo.promotions.threshold_discounts].sort((a, b) => b.threshold - a.threshold);
        
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
    
    // 返回固定精度的金额和折扣信息
    return { 
      amount: Number(amount.toFixed(2)), 
      appliedDiscount 
    };
  }
  
  // 计算订单摘要
  function calculateOrderSummary(items, productsDatabase) {
    let subtotal = 0;
    let discount = 0;
    
    for (const item of items) {
      // 确保价格和数量是数字类型用于计算
      const itemPrice = parseFloat(item.price);
      const itemQuantity = parseInt(item.quantity);
      
      // 计算小计
      subtotal += itemPrice * itemQuantity;
      
      // 计算折扣
      const productInfo = productsDatabase.find(p => p.id === item.id);
      if (productInfo) {
        const { amount } = computeItemDiscount(item, productInfo);
        discount += amount;
      }
    }
    
    // 计算总计
    const total = subtotal - discount;
    
    // 返回固定精度的字符串
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2)
    };
  }
  
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
        validationResult.errors.push(`商品不存在: ${item.id}`);
        continue;
      }
      
      // 验证价格 - 核心验证点
      // 使用安全的数值比较，避免浮点数精度问题
      if (!safeNumberCompare(item.price, productInfo.price)) {
        validationResult.valid = false;
        validationResult.errors.push(`商品价格不匹配 ${item.id}: ${item.price} vs ${productInfo.price}`);
      }

      if((productInfo.distributor_id && productInfo.distributor_id!==item.distributor_id) || (!productInfo.distributor_id && item.distributor_id)){
        validationResult.valid = false;
        validationResult.errors.push(`商品分销商不匹配 ${item.id}: ${item.distributor_id} vs ${productInfo.distributor_id}`);
      }
      if((productInfo.merchant_id && productInfo.merchant_id!==item.merchant_id) || (!productInfo.merchant_id && item.merchant_id)){
        validationResult.valid = false;
        validationResult.errors.push(`商品商户不匹配 ${item.id}: ${item.merchant_id} vs ${productInfo.merchant_id}`);
      }
      
      // 重新计算折扣 - 核心验证点
      const calculatedDiscount = computeItemDiscount(item, productInfo);
      
      // 验证折扣 - 需要考虑类型转换
      // 订单中可能没有appliedDiscount或者格式不同，需要进行兼容处理
      let isDiscountValid = true;
      if (item.appliedDiscount) {
        // 如果订单中有折扣信息，进行比较
        if (calculatedDiscount.appliedDiscount) {
          // 比较折扣类型和值
          if (item.appliedDiscount.type !== calculatedDiscount.appliedDiscount.type) {
            isDiscountValid = false;
          } else {
            // 根据折扣类型比较具体值
            switch (item.appliedDiscount.type) {
              case 'percent':
                isDiscountValid = safeNumberCompare(item.appliedDiscount.value, calculatedDiscount.appliedDiscount.value);
                break;
              case 'tier':
                isDiscountValid = safeNumberCompare(item.appliedDiscount.value, calculatedDiscount.appliedDiscount.value) &&
                                 parseInt(item.appliedDiscount.min_quantity) === calculatedDiscount.appliedDiscount.min_quantity;
                break;
              case 'threshold':
                isDiscountValid = safeNumberCompare(item.appliedDiscount.value, calculatedDiscount.appliedDiscount.value) &&
                                 safeNumberCompare(item.appliedDiscount.threshold, calculatedDiscount.appliedDiscount.threshold);
                break;
              default:
                // 如果类型为空或其他值，且计算出的折扣也为null，则视为有效
                isDiscountValid = !calculatedDiscount.appliedDiscount;
            }
          }
        } else {
          // 计算出的折扣为null，但订单中有折扣信息
          isDiscountValid = false;
        }
      } else {
        // 订单中没有折扣信息，计算出的折扣也应该为null
        isDiscountValid = !calculatedDiscount.appliedDiscount;
      }
      
      if (!isDiscountValid) {
        validationResult.valid = false;
        validationResult.errors.push(`商品折扣不匹配 ${item.id}: 计算得到 ${JSON.stringify(calculatedDiscount.appliedDiscount)}, 订单中为 ${JSON.stringify(item.appliedDiscount)}`);
      }
    }
    
    // 重新计算订单摘要 - 核心验证点
    const calculatedSummary = calculateOrderSummary(orderData.items, productsDatabase);
    
    // 验证订单摘要 - 使用安全的数值比较
    if (!safeNumberCompare(calculatedSummary.subtotal, orderData.summary.subtotal) ||
        !safeNumberCompare(calculatedSummary.discount, orderData.summary.discount) ||
        !safeNumberCompare(calculatedSummary.total, orderData.summary.total)) {
      validationResult.valid = false;
      validationResult.errors.push(`订单摘要不匹配: 计算得到 ${JSON.stringify(calculatedSummary)}, 订单中为 ${JSON.stringify(orderData.summary)}`);
    }
    
    return validationResult;
  }
  
  try {
    // 解密订单数据
    const orderData = decryptData(result.encryptedOrderData, privateKey);
    
    if (!orderData) {
      return {
        success: false,
        message: '订单数据解密失败'
      };
    }
    
    // 验证订单数据
    const validationResult = validateOrder(orderData, productsDatabase);
    
    if (!validationResult.valid) {
      return {
        success: false,
        message: '订单数据验证失败',
        errors: validationResult.errors
      };
    }
    
    // 解密收货信息（如果有）
    let shippingInfo = null;
    if (result.encryptedShippingData) {
      shippingInfo = decryptData(result.encryptedShippingData, privateKey);
      if (!shippingInfo) {
        return {
          success: false,
          message: '收货信息解密失败'
        };
      }
    }
    
    return {
      success: true,
      orderData,
      shippingInfo
    };
  } catch (error) {
    console.error('处理订单时出错:', error);
    return {
      success: false,
      message: `处理订单时出错: ${error.message}`
    };
  }
}; 