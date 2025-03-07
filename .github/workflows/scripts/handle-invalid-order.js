/**
 * 处理验证失败的订单
 * 
 * @param {object} github GitHub API客户端
 * @param {object} context GitHub Actions上下文
 * @param {object} result 订单验证结果
 * @returns {Promise<void>}
 */
module.exports = async (github, context, result) => {
  let errorMessage = `## 订单验证失败\n\n${result.message}`;
  
  if (result.errors && result.errors.length > 0) {
    errorMessage += '\n\n### 错误详情:\n';
    for (const error of result.errors) {
      errorMessage += `- ${error}\n`;
    }
  }
  
  errorMessage += '\n\n此订单无法处理，请通过GitShop网站重新提交订单。';
  
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: errorMessage
  });
  
  await github.rest.issues.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    state: 'closed',
    labels: ['invalid-order']
  });
}; 