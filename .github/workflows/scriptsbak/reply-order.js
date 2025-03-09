/**
 * 回复订单确认
 * 
 * @param {object} github GitHub API客户端
 * @param {object} context GitHub Actions上下文
 * @param {object} orderResult 订单验证结果
 * @param {string} walletAddress 生成的钱包地址
 * @param {string} walletPath 生成的钱包路径
 * @returns {Promise<void>}
 */
module.exports = async (github, context, orderData, walletAddress, walletPath) => {
  
  // 计算支付截止时间（当前时间 + 48小时）
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
  if(!github){
    return replyBody;
  }
  // 发送回复
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: replyBody
  });
  
  // 更新Issue标签
  await github.rest.issues.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    labels: ['order', 'pending-payment']
  });
};