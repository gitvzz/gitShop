/**
 * 检查Issue是否为有效订单
 * 
 * @param {object} context GitHub Actions上下文
 * @returns {object} 检查结果
 */
module.exports = async (context) => {
  // 获取Issue内容
  const issueBody = context.payload.issue.body || '';
  const issueTitle = context.payload.issue.title || '';
  
  // 清理字符串，移除控制字符
  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  };
  
  const cleanIssueBody = cleanString(issueBody);
  const cleanIssueTitle = cleanString(issueTitle);
  
  // 检查是否为订单Issue
  const isOrderTitle = cleanIssueTitle.startsWith('Order:');
  
  // 提取加密的订单数据
  let encryptedOrderData = null;
  const orderDataMatch = cleanIssueBody.match(/\[ENCRYPTED_ORDER_DATA\]([\s\S]*?)\[\/ENCRYPTED_ORDER_DATA\]/);
  if (orderDataMatch && orderDataMatch[1]) {
    encryptedOrderData = orderDataMatch[1].trim();
  }
  
  // 提取加密的收货信息
  let encryptedShippingData = null;
  const shippingDataMatch = cleanIssueBody.match(/\[ENCRYPTED_SHIPPING_DATA\]([\s\S]*?)\[\/ENCRYPTED_SHIPPING_DATA\]/);
  if (shippingDataMatch && shippingDataMatch[1]) {
    encryptedShippingData = shippingDataMatch[1].trim();
  }
  
  // 提取签名
  let providedSignature = null;
  const signatureMatch = cleanIssueBody.match(/## Signature\s*\`([a-f0-9]{32})\`/i);
  if (signatureMatch && signatureMatch[1]) {
    providedSignature = signatureMatch[1].trim();
  }
  
  // 如果不是订单标题或没有加密数据，则不是订单
  if (!isOrderTitle || !encryptedOrderData) {
    return {
      isOrder: false,
      isValid: false,
      message: '不是有效的订单Issue格式'
    };
  }
  
  // 验证签名
  let signatureValid = null;
  let calculatedSignature = null;
  
  if (providedSignature) {
    try {
      // 计算签名的内容应该是去除签名部分的Issue内容
      const contentToSign = cleanIssueTitle + cleanIssueBody.split('## Signature')[0].trim();
      
      // 计算MD5签名
      const crypto = require('crypto');
      calculatedSignature = crypto.createHash('md5').update(contentToSign).digest('hex');
      
      // 比较签名
      signatureValid = calculatedSignature.toLowerCase() === providedSignature.toLowerCase();
    } catch (error) {
      console.error('计算签名时出错:', error);
      signatureValid = false;
    }
  }
  
  // 返回检查结果
  return {
    isOrder: true,
    isValid: signatureValid === true,
    signatureValid,
    providedSignature,
    calculatedSignature,
    encryptedOrderData,
    encryptedShippingData,
    message: signatureValid === false ? '订单签名验证失败' : (signatureValid === null ? '订单缺少签名' : '订单格式有效')
  };
}; 
