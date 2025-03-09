# GitShop 后端

这是 GitShop 项目的后端部分，使用 TypeScript 开发。

## 项目结构

```
backend/
├── src/                  # 源代码目录
│   ├── index.ts          # 入口文件
│   ├── types.ts          # 类型定义
│   ├── utils.ts          # 工具函数
│   └── services.ts       # 服务类
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
└── README.md             # 项目说明
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

构建后的文件将输出到 `.github/workflows/scripts` 目录。

## 类型定义

项目中定义了多种类型，包括：

- `Product`: 商品类型
- `Category`: 分类类型
- `Order`: 订单类型
- `OrderItem`: 订单项类型
- `User`: 用户类型

## 服务类

项目中实现了以下服务类：

- `ProductService`: 商品服务，提供商品的增删改查功能
- `OrderService`: 订单服务，提供订单的创建和管理功能 