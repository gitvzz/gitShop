# GitShop 商品数据结构文档

本文档详细描述了GitShop平台的商品数据结构，包括分类数据和商品数据的格式、字段说明及其关系。

## 1. 数据文件组织

GitShop的商品数据存储在`frontend/public/products`目录下，主要包含以下文件：

- `index.json`：存储所有商品分类信息
- `tea.json`：茶叶分类下的所有商品
- `learning.json`：学艺分类下的所有商品
- 其他分类文件...

## 2. 分类数据结构

分类数据存储在`index.json`文件中，采用JSON格式。

### 2.1 文件结构

| 字段 | 类型 | 说明 |
|------|------|------|
| items | 数组 | 分类项目列表 |
| metadata | 对象 | 元数据信息 |

### 2.2 分类项目结构

每个分类项目包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | 字符串 | 是 | 分类唯一标识符，用于关联商品 |
| name | 字符串或对象 | 是 | 分类名称，可以是多语言对象 |
| description | 字符串或对象 | 是 | 分类描述，可以是多语言对象 |
| image | 字符串 | 是 | 分类图片路径 |

### 2.3 多语言支持

对于支持多语言的字段，可以使用以下两种格式：

1. **字符串格式**：直接提供单一语言的值
   ```json
   "name": "学艺"
   ```

2. **对象格式**：提供多语言版本
   ```json
   "name": {
     "en": "Tea",
     "zh": "茶叶"
   }
   ```

### 2.4 示例

```json
{
  "items": [
    {
      "id": "tea",
      "name": {
        "en": "Tea",
        "zh": "茶叶"
      },
      "product_type": "physical",
      "description": {
        "zh": "精选优质茶叶，源自天然茶园",
        "en": "Select high-quality tea, sourced from natural tea gardens"
      },
      "image": "/assets/categories/tea.png"
    }
  ],
  "metadata": {
    "last_updated": "2023-05-01",
    "version": "1.0.0"
  }
}
```

## 3. 商品数据结构

商品数据按分类存储在`products`目录下的对应JSON文件中。

### 3.1 基本结构

每个商品文件包含一个商品对象数组，每个商品对象包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | 字符串 | 是 | 商品唯一标识符 |
| name | 字符串或对象 | 是 | 商品名称，支持多语言 |
| description | 字符串或对象 | 是 | 商品描述，支持多语言 |
| price | 数字 | 是 | 商品价格 |
| currency | 字符串 | 是 | 货币单位，必须是"USDT" |
| images | 数组 | 是 | 商品图片列表 |
| requires_shipping | 布尔值 | 否 | 是否需要物流配送 |
| features | 数组 | 是 | 商品特点列表，支持多语言 |
| stock | 数字 | 是 | 库存数量 |
| rating | 数字 | 是 | 商品评分（0-5） |
| reviews | 数字 | 是 | 评价数量 |
| tags | 字符串数组 | 否 | 商品标签 |
| related_products | 字符串数组 | 否 | 相关商品ID列表 |
| promotions | 对象 | 否 | 促销信息 |
| merchant_id | 字符串 | 否 | 商家ID |

### 3.2 图片结构

图片可以是简单的字符串路径，也可以是包含更多信息的对象：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| src | 字符串 | 是 | 图片URL或路径 |
| alt | 字符串 | 是 | 图片替代文本 |

### 3.3 促销信息结构

促销信息支持三种类型的折扣：

| 字段 | 类型 | 说明 |
|------|------|------|
| discount_percent | 数字 | 直接百分比折扣 |
| tier_pricing | 数组 | 阶梯定价折扣 |
| threshold_discounts | 数组 | 满额折扣 |

#### 3.3.1 阶梯定价结构

| 字段 | 类型 | 说明 |
|------|------|------|
| min_quantity | 数字 | 最小购买数量 |
| discount_percent | 数字 | 折扣百分比 |
| description | 字符串或对象 | 折扣描述，支持多语言 |

#### 3.3.2 满额折扣结构

| 字段 | 类型 | 说明 |
|------|------|------|
| threshold | 数字 | 满额阈值 |
| discount_amount | 数字 | 折扣金额 |
| description | 字符串或对象 | 折扣描述，支持多语言 |

### 3.4 示例

#### 3.4.1 实物商品示例

```json
{
  "id": "rock-tea",
  "name": {
    "en": "Rock Tea",
    "zh": "武夷岩茶"
  },
  "description": {
    "en": "Produced in the Wuyi Mountains of Fujian...",
    "zh": "产自福建武夷山的优质岩茶，口感醇厚，香气持久..."
  },
  "price": 288,
  "currency": "USDT",
  "images": [
    {
      "src": "https://img1.baidu.com/it/u=2288590788,3996478196&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
      "alt": "Two each of gray, white, and black shirts laying flat."
    }
  ],
  "requires_shipping": true,
  "features": [
    "产自武夷山核心产区",
    {
      "en": "Traditional craftsmanship",
      "zh": "传统工艺制作"
    }
  ],
  "stock": 50,
  "rating": 4.8,
  "reviews": 36,
  "tags": ["岩茶", "乌龙茶", "礼盒"],
  "promotions": {
    "threshold_discounts": [
      {
        "threshold": 300,
        "discount_amount": 30,
        "description": "满300减30"
      }
    ]
  }
}
```

#### 3.4.2 数字商品示例

```json
{
  "id": "telegram-dev",
  "name": "Telegram开发教学",
  "description": "专业的Telegram机器人和应用开发教学服务...",
  "price": 198,
  "currency": "USDT",
  "images": ["/assets/products/telegram-dev.png"],
  "features": [
    "10次一对一在线指导",
    "实战项目开发"
  ],
  "stock": 10,
  "rating": 4.9,
  "reviews": 18,
  "tags": ["Telegram", "开发", "教学", "机器人"],
  "promotions": {
    "tier_pricing": [
      {
        "min_quantity": 2,
        "discount_percent": 5,
        "description": {"zh":"购买2个课程享95折","en":"Buy 2 courses get 5% off"}
      }
    ]
  },
  "merchant_id": "lingang"
}
```

## 4. 数据关系

### 4.1 分类与商品的关系

- 通过index.json中的分类ID创建相应的商品json文件
- 一个分类可以包含多个商品，一个商品只能属于一个分类

### 4.2 商品之间的关系

- 商品可以通过`related_products`字段关联到其他相关商品
- 关联是通过商品ID进行的，可以跨分类关联

## 5. 数据处理流程

1. 前端加载`index.json`获取所有分类信息
2. 根据用户选择的分类，加载对应的商品文件（如`tea.json`）
3. 处理多语言字段，根据当前语言环境显示对应的文本
4. 计算商品折扣价格（如果有促销信息）
5. 显示商品列表和详情

## 6. 注意事项

1. 所有ID应保持唯一性，避免冲突
2. 多语言字段应提供所有支持的语言版本
3. 图片路径应确保正确，可以使用相对路径或完整URL
4. 价格和折扣计算应保持前后端一致
5. 商品数据更新后应更新`metadata`中的`last_updated`字段 