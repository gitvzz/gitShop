# GitShop 分销商跟踪系统

本目录包含用于跟踪和管理GitShop分销商（通过Fork项目的用户）的GitHub Actions工作流。

## 工作流文件说明

### 1. fork-tracker.yml

**用途**：跟踪仓库的Fork事件，记录分销商信息。

**触发条件**：
- 仓库被Fork时（通过repository_dispatch事件模拟）
- 仓库被Star时（作为潜在Fork的检测机制）
- 手动触发（用于测试或初始化）

**功能**：
- 记录Fork用户的GitHub用户名
- 记录Fork时间
- 设置初始状态为"pending"（未生效）
- 设置钱包地址为null
- 将信息保存到`data/distributors.json`文件

**手动触发选项**：
- `initialize`：设置为`true`时，将获取所有现有Fork并初始化分销商数据

### 2. fork-status-checker.yml

**用途**：定期检查分销商Fork仓库的状态，更新活跃状态。

**触发条件**：
- 每周一凌晨2点自动运行
- 手动触发（用于测试或立即检查）

**功能**：
- 只检查有钱包地址且状态为active或inactive的分销商
- 检查每个符合条件的分销商的Fork仓库是否仍然存在
- 更新分销商状态（active/deleted/inactive）
- 记录最后检查时间
- 更新`data/distributors.json`文件

**手动触发选项**：
- `check_specific_user`：指定要检查的特定用户名，留空则检查所有用户

## 分销商状态说明

分销商在系统中可能有以下状态：

- **pending**：初始状态，表示用户已Fork但尚未提交钱包地址，未生效
- **active**：Fork仓库存在且活跃，已提交钱包地址
- **deleted**：Fork仓库已被删除，但曾经是有效分销商
- **inactive**：Fork仓库存在但长时间不活跃（目前未使用，预留）

## 数据文件格式

分销商数据保存在`data/distributors.json`文件中，格式如下：

```json
[
  {
    "username": "user1",
    "forked_at": "2023-01-01T12:00:00Z",
    "status": "active",
    "last_checked": "2023-01-10T08:30:00Z",
    "wallet": "0x1234567890abcdef1234567890abcdef12345678"
  },
  {
    "username": "user2",
    "forked_at": "2023-02-15T09:45:00Z",
    "status": "pending",
    "last_checked": "2023-02-20T14:20:00Z",
    "wallet": null
  }
]
```

## 使用方法

### 初始化分销商数据

如果您是第一次设置此系统，或需要重新初始化分销商数据：

1. 转到GitHub仓库的"Actions"选项卡
2. 选择"Fork Tracker"工作流
3. 点击"Run workflow"
4. 将"initialize"设置为"true"
5. 点击"Run workflow"按钮

这将获取所有现有Fork并创建初始分销商数据，所有分销商初始状态为"pending"。

### 检查特定用户状态

如果您需要立即检查特定分销商的状态：

1. 转到GitHub仓库的"Actions"选项卡
2. 选择"Fork Status Checker"工作流
3. 点击"Run workflow"
4. 在"check_specific_user"字段中输入用户名
5. 点击"Run workflow"按钮

注意：只有状态为"active"或"inactive"且已提交钱包地址的分销商才会被检查。

### 查看分销商统计信息

每次运行状态检查后，工作流日志中会显示分销商统计信息：
- 有钱包地址的活跃分销商数量
- 有钱包地址的已删除分销商数量
- 有钱包地址的不活跃分销商数量
- 待处理分销商数量（无钱包地址或状态为pending）
- 总分销商数量

## 分销商激活流程

1. 用户Fork项目后，系统自动记录其信息，初始状态为"pending"
2. 用户需要通过特定格式的Issue提交钱包地址
3. （待实现）系统检测到有效的钱包地址提交后，更新用户状态为"active"
4. 只有状态为"active"的分销商才能获得分销佣金

## 注意事项

1. 这些工作流需要`GITHUB_TOKEN`权限来访问GitHub API
2. 由于GitHub API限制，大量Fork的检查可能需要较长时间
3. 为避免API速率限制，检查过程中添加了延迟
4. 工作流使用`[skip ci]`标记提交，以避免触发不必要的CI运行 