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
  
  if (!result.isOrder) {
    if (result.hasOrderLabel) {
      title = '无效订单格式';
      message = `此Issue带有order标签，但不符合GitShop订单格式要求。\n\n${result.message}\n\n请通过GitShop网站提交订单，或移除order标签后重新提交问题反馈。`;
    } else {
      // 如果不是订单且没有order标签，不做处理
      return;
    }
  } else if (!result.isValid) {
    if (result.signatureValid === false) {
      title = 'MD5签名验证失败';
      message = `${result.message}\n\n计算得到的签名: ${result.calculatedSignature}\n提供的签名: ${result.providedSignature}\n\n此订单可能被篡改，无法处理。请通过GitShop网站重新提交订单。`;
    } else {
      title = '无效订单Issue';
      message = `${result.message}\n\n此Issue格式不正确，无法处理。请通过GitShop网站提交订单。`;
    }
  }
  
  // 如果没有设置标题和消息，说明不需要处理
  if (!title || !message) {
    return;
  }
  
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: `## ${title}\n\n${message}`
  });
  
  await github.rest.issues.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    state: 'closed',
    labels: ['invalid']
  });
}; 