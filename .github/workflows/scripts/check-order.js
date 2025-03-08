/**
 * 检查Issue是否为订单
 * 
 * 此脚本检查GitHub Issue是否为有效的订单格式，并提取加密的订单数据
 */

const forge = require('node-forge');

module.exports = async function checkOrder(context) {
  try {
    const issue = context.payload.issue;
    
    // 检查Issue是否存在
    if (!issue) {
      return {
        isOrder: false,
        isValid: false,
        signatureValid: false,
        message: '不是有效的Issue'
      };
    }
    
    const issueBody = issue.body || '';
    const issueTitle = issue.title || '';
    
    // 检查标题是否符合订单格式
    const titleRegex = /^Order ORDER-\d{8}-[A-Z0-9]{6}$/;
    const isTitleValid = titleRegex.test(issueTitle);
    
    if (!isTitleValid) {
      return {
        isOrder: false,
        isValid: false,
        signatureValid: false,
        message: '标题不符合订单格式'
      };
    }
    
    // 检查是否包含加密的订单数据
    const encryptedDataRegex = /\[ENCRYPTED_ORDER_DATA\]\s*([\s\S]*?)\s*\[\/ENCRYPTED_ORDER_DATA\]/;
    const encryptedDataMatch = issueBody.match(encryptedDataRegex);
    
    if (!encryptedDataMatch) {
      return {
        isOrder: true,
        isValid: false,
        signatureValid: false,
        message: '未找到加密的订单数据'
      };
    }
    
    const encryptedOrderData = encryptedDataMatch[1].trim();
    
    // 检查是否包含加密的收货信息
    const shippingDataRegex = /\[ENCRYPTED_SHIPPING_DATA\]\s*([\s\S]*?)\s*\[\/ENCRYPTED_SHIPPING_DATA\]/;
    const shippingDataMatch = issueBody.match(shippingDataRegex);
    
    let encryptedShippingData = null;
    if (shippingDataMatch) {
      encryptedShippingData = shippingDataMatch[1].trim();
    }
    
    // 检查是否包含MD5签名
    const signatureRegex = /## MD5:\s*`([a-f0-9]{32})`/i;
    const signatureMatch = issueBody.match(signatureRegex);
    
    if (!signatureMatch) {
      return {
        isOrder: true,
        isValid: false,
        signatureValid: false,
        message: '未找到订单签名'
      };
    }
    
    const signature = signatureMatch[1];
    
    // 验证MD5签名 - 使用与前端相同的方法
    // 1. 移除签名部分
    const contentWithoutSignature = issueBody.replace(/\n## MD5:\s*`[a-f0-9]{32}`/i, '');
    
    // 2. 拼接标题和内容，与前端保持一致
    const contentToSign = issueTitle + contentWithoutSignature;
    
    // 3. 使用CryptoJS.MD5计算签名，与前端保持一致
    const calculatedSignature = forge.md.md5.create().update(contentToSign).digest().toHex()
    
    const signatureValid = calculatedSignature === signature;
    
    if (!signatureValid) {
      return {
        isOrder: true,
        isValid: false,
        signatureValid: false,
        message: '订单签名无效',
        calculatedSignature,
        providedSignature: signature
      };
    }
    
    // 检查是否有分销商ID
    const distributorRegex = /Distributor ID: ([a-zA-Z0-9_-]+)/;
    const distributorMatch = issueBody.match(distributorRegex);
    let distributorId = null;
    
    if (distributorMatch) {
      distributorId = distributorMatch[1];
    }
    
    // 所有检查通过，返回有效订单
    return {
      isOrder: true,
      isValid: true,
      signatureValid: true,
      encryptedOrderData,
      encryptedShippingData,
      signature,
      distributorId,
      issueTitle,
      issueBody
    };
    
  } catch (error) {
    console.error(`检查订单时出错: ${error.message}`);
    return {
      isOrder: false,
      isValid: false,
      signatureValid: false,
      message: `检查订单时出错: ${error.message}`
    };
  }
}; 
