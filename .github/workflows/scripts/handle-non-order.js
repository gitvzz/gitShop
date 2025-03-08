/**
 * 处理非订单Issue或签名无效Issue
 * 
 * @param {object} context GitHub Actions上下文
 * @param {object} github GitHub API客户端
 * @param {object} result 检查订单的结果
 * @returns {Promise<void>}
 */
module.exports = async (context, github, result) => {
  let title, message;
  
  try {
    console.log('处理非订单Issue，参数：', JSON.stringify({
      isOrder: result.isOrder,
      hasOrderLabel: result.hasOrderLabel,
      isValid: result.isValid,
      signatureValid: result.signatureValid
    }));
    
    if (!result.isOrder) {
      if (result.hasOrderLabel) {
        title = '无效订单格式';
        message = `此Issue带有order标签，但不符合GitShop订单格式要求。\n\n${result.message || '格式不正确'}\n\n请通过GitShop网站提交订单，或移除order标签后重新提交问题反馈。`;
      } else {
        // 如果不是订单且没有order标签，不做处理
        console.log('不是订单且没有order标签，不做处理');
        return;
      }
    } else if (!result.isValid) {
      if (result.signatureValid === false) {
        title = 'MD5签名验证失败';
        message = `${result.message || '签名验证失败'}\n\n计算得到的签名: ${result.calculatedSignature || '未知'}\n提供的签名: ${result.providedSignature || '未知'}\n\n此订单可能被篡改，无法处理。请通过GitShop网站重新提交订单。`;
      } else {
        title = '无效订单Issue';
        message = `${result.message || '订单格式不正确'}\n\n此Issue格式不正确，无法处理。请通过GitShop网站提交订单。`;
      }
    }
    
    // 如果没有设置标题和消息，说明不需要处理
    if (!title || !message) {
      console.log('没有设置标题和消息，不做处理');
      return;
    }
    
    console.log(`准备添加评论：${title}`);
    
    try {
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: `## ${title}\n\n${message}`
      });
      
      console.log('评论添加成功，准备关闭Issue');
      
      await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        state: 'closed',
        labels: ['invalid']
      });
      
      console.log('Issue已关闭并标记为invalid');
    } catch (apiError) {
      console.error('API调用失败：', apiError.message);
      console.error('状态码：', apiError.status);
      console.error('响应数据：', JSON.stringify(apiError.response?.data));
      throw apiError;
    }
  } catch (error) {
    console.error('处理非订单Issue时出错：', error);
    throw error;
  }
}; 