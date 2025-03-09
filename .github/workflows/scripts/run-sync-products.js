// 导入编译后的 syncProducts 函数
const { syncProducts } = require('./backend/src/sync-products');

// 执行函数并处理错误
syncProducts().catch(err => {
    console.error('同步产品数据时出错:', err);
    process.exit(1);
}); 