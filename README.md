# GitShop

<div align="center">
  <img src="docs/images/logo.png" alt="GitShop Logo" width="200" height="auto" />
  <p>基于GitHub的无服务器电子商务解决方案，专为开发者设计</p>
  
  ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/gitvzz/gitShop/deploy.yml?label=部署状态)
  ![GitHub License](https://img.shields.io/github/license/gitvzz/gitShop)
  ![GitHub last commit](https://img.shields.io/github/last-commit/gitvzz/gitShop)
</div>

## 📋 项目简介

GitShop 是一个创新的电子商务平台，完全基于 GitHub 基础设施构建，无需额外服务器。它利用 GitHub Pages、Actions、Issues 和 Fork 等功能，实现了一个功能完整的交易系统，包括商品展示、订单处理、支付管理和分销系统。

## 🚀 项目演示

- **演示站点**: [https://gitvzz.github.io/gitShop/](https://gitvzz.github.io/gitShop/)
- **功能亮点**: 
  - 完全无服务器架构
  - 端到端加密的订单处理
  - 自动化的支付确认
  - 分销系统与佣金追踪

![GitShop 演示](docs/images/demo.png)

## ✨ 核心特性

- **无服务器架构**
  - 完全基于 GitHub 平台，无需额外服务器
  - 利用 GitHub Pages 托管前端
  - 使用 GitHub Issues 处理订单
  - 通过 GitHub Actions 自动化后端流程

- **安全加密系统**
  - 使用 RSA + AES 混合加密保护用户信息
  - 端到端加密确保数据传输安全
  - MD5 签名验证确保订单完整性

- **加密货币支付**
  - 支持 USDT 等加密货币支付
  - 确定性钱包地址生成
  - 自动化支付确认

- **分销系统**
  - 通过 Fork 项目参与分销
  - 自动追踪分销来源
  - 透明的佣金计算和分配

## 🔧 技术架构

### 前端技术栈
- Vue 3 + TypeScript
- Tailwind CSS
- Vite 构建工具

### 后端处理
- GitHub Actions + Node.js
- 混合加密 (RSA + AES)
- 确定性钱包生成

### 系统架构图
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  用户浏览器  │────▶│  GitHub Pages│────▶│ GitHub Issues│
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  支付确认   │◀────│ 加密货币网络 │◀────│ GitHub Actions│
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🏁 快速开始

### 前提条件
- GitHub 账户
- 基本的 Git 知识
- Node.js 环境（仅开发时需要）

### 安装步骤

1. **Fork 本项目**
   ```bash
   # 克隆到本地
   git clone https://github.com/YOUR_USERNAME/gitShop.git
   cd gitShop
   ```

2. **配置密钥**
   - 生成 RSA 密钥对
   - 创建钱包助记词（用于生成支付地址）

3. **设置 GitHub Secrets**
   - `PRIVATE_KEY`: RSA 私钥
   - `WALLET_MNEMONIC`: 钱包助记词

4. **配置前端环境变量**
   ```bash
   cd frontend
   cp .env.example .env
   # 编辑 .env 文件，添加公钥
   ```

5. **部署到 GitHub Pages**
   - 启用 GitHub Pages（设置为从 Actions 部署）
   - 推送代码到 main 分支，触发自动部署

## 📖 使用指南

### 商家使用流程
1. 按照上述步骤部署您的 GitShop 实例
2. 修改 `.github/workflows/data/products.json` 文件，添加您的商品信息
3. 推送更改，前端将自动更新
4. 通过 GitHub Issues 接收和处理订单

### 买家使用流程
1. 访问商店前端页面
2. 浏览并选择商品
3. 填写必要信息并提交订单
4. 按照指示完成支付
5. 等待商家处理订单

### 分销商使用流程
1. Fork 项目到您的 GitHub 账户
2. 系统自动为您生成唯一分销代码
3. 分享您的商店链接
4. 通过分销页面查看您的业绩和佣金

## 📁 项目结构

```
gitShop/
├── .github/                # GitHub 相关配置
│   └── workflows/          # GitHub Actions 工作流
│       ├── data/           # 产品数据
│       ├── scripts/        # 订单处理脚本
│       └── *.yml           # 工作流配置文件
├── docs/                   # 项目文档
│   ├── images/             # 文档图片
│   └── technical/          # 技术文档
├── frontend/               # 前端代码
│   ├── public/             # 静态资源
│   ├── src/                # 源代码
│   │   ├── components/     # Vue 组件
│   │   ├── store/          # 状态管理
│   │   ├── views/          # 页面视图
│   │   └── main.ts         # 入口文件
│   ├── .env.example        # 环境变量示例
│   └── package.json        # 依赖配置
└── README.md               # 项目说明
```

## 📚 开发文档

详细的技术文档可在 `docs/technical/` 目录下找到：

- [订单处理流程](docs/technical/order-processing.md)
- [加密机制](docs/technical/encryption.md)
- [钱包生成](docs/technical/wallet-generation.md)
- [分销系统](docs/technical/distribution-system.md)

## 🤝 贡献指南

我们欢迎各种形式的贡献，包括但不限于功能改进、bug 修复、文档更新等。

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

请确保您的代码符合项目的编码规范，并通过所有测试。

## 🔒 安全与隐私

- **数据加密**: 所有敏感信息使用 RSA + AES 混合加密
- **密钥管理**: 私钥存储在 GitHub Secrets 中，不会泄露
- **订单验证**: 使用 MD5 签名验证订单完整性
- **支付安全**: 通过区块链进行支付，透明且安全

如果您发现任何安全漏洞，请通过 Issues 报告，并标记为 "安全问题"。

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 📞 联系方式

- **项目维护者**: [GitVzz](https://github.com/gitvzz)
- **问题反馈**: 请通过 [GitHub Issues](https://github.com/gitvzz/gitShop/issues) 提交
- **社区交流**: [Telegram 群组](https://t.me/gitShop_community)

## 🙏 致谢

感谢所有为本项目做出贡献的开发者，以及以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node Forge](https://github.com/digitalbazaar/forge)
- [ethers.js](https://docs.ethers.io/)

---

<div align="center">
  <p>如果您觉得这个项目有用，请给它一个星标 ⭐️</p>
  <p>Made with ❤️ by GitVzz</p>
</div> 