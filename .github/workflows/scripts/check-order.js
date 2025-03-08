/**
 * 检查Issue是否为有效订单
 * 
 * @param {object} context GitHub Actions上下文
 * @returns {object} 检查结果
 */
module.exports = async (context) => {
  try {
    // 检查 context 和 issue 是否存在
    if (!context || !context.payload || !context.payload.issue) {
      console.log('无效的上下文或Issue不存在');
      return {
        isOrder: false,
        isValid: false,
        signatureValid: false,
        message: 'Issue不存在或无效'
      };
    }
    
    // 获取Issue内容
    const issueBody = context.payload.issue.body || '';
    const issueTitle = context.payload.issue.title || '';
    
    console.log('处理Issue标题:', issueTitle);
    
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
      console.log('不是订单Issue: 标题或加密数据不符合要求');
      return {
        isOrder: false,
        isValid: false,
        signatureValid: false,
        message: '不是有效的订单Issue格式'
      };
    }
    
    // 验证签名
    let signatureValid = false;
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
        console.log('签名验证结果:', signatureValid, '计算签名:', calculatedSignature, '提供签名:', providedSignature);
      } catch (error) {
        console.error('计算签名时出错:', error);
        signatureValid = false;
      }
    } else {
      console.log('未提供签名');
    }
    
    // 返回检查结果
    const result = {
      isOrder: true,
      isValid: signatureValid === true,
      signatureValid: signatureValid,
      providedSignature: providedSignature || '',
      calculatedSignature: calculatedSignature || '',
      encryptedOrderData: encryptedOrderData || '',
      encryptedShippingData: encryptedShippingData || '',
      message: signatureValid === false ? '订单签名验证失败' : (providedSignature === null ? '订单缺少签名' : '订单格式有效')
    };
    
    console.log('返回结果:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('检查订单时发生错误:', error);
    return {
      isOrder: false,
      isValid: false,
      signatureValid: false,
      message: `检查订单时发生错误: ${error.message}`
    };
  }
}; 
