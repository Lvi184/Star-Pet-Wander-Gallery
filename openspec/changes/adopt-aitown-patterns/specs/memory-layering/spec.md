# Capability: Memory Layering System

## Summary

实现 AI Town 风格的分层记忆系统，将宠物记忆分为短期记忆和长期记忆，支持时间加权检索和自动过期。

## ADDED Requirements

### Requirement: 记忆分层定义

系统 SHALL 实现以下两种记忆类型：

**短期记忆**（Short-term Memory）：
- 存储最近 24 小时的经历
- 用于当前决策
- 24小时后自动转换为长期记忆或删除

**长期记忆**（Long-term Memory）：
- 存储超过 24 小时的重要经历
- 用于性格形成和长期决策
- 按重要度和时间加权检索

#### Scenario: 记忆分层存储

**Given** 宠物在早晨探险发现了一颗星星碎片  
**When** 系统记录该事件  
**Then** 事件首先存储为短期记忆  
**And** 24小时后自动转换为长期记忆（如果重要度 >= 0.6）

### Requirement: 记忆类型分类

系统 SHALL 定义以下记忆类型：

- `event`：事件记忆（探险、发现物品）
- `social`：社交记忆（与其他宠物的互动）
- `reflection`：反思记忆（每日总结）
- `experience`：经验记忆（学习到的知识）

#### Scenario: 记忆类型分类

**Given** 宠物与另一只宠物进行了对话  
**When** 系统记录该社交事件  
**Then** 记忆类型标记为 `social`  
**And** 重要度根据对话内容自动设置（友好对话：0.4，争执：0.6）

### Requirement: 记忆衰减机制

系统 SHALL 实现记忆衰减机制：

- 短期记忆：无衰减
- 长期记忆：每天衰减 `decay_rate`（默认 0.01）
- 记忆重要度低于 0.1 时自动删除

#### Scenario: 记忆衰减

**Given** 一条长期记忆重要度为 0.8，衰减率为 0.01  
**When** 经过 30 天  
**Then** 重要度衰减至 0.5（0.8 - 30 * 0.01 = 0.5）  
**And** 记忆仍然保留

### Requirement: 时间加权检索

系统 SHALL 实现时间加权的记忆检索：

- 最近记忆权重更高
- 重要记忆权重更高
- 检索公式：`score = importance * (1 - age_factor)`

#### Scenario: 时间加权检索

**Given** 宠物需要做决策  
**When** 系统检索相关记忆  
**Then** 最近的重要记忆排在前面  
**And** 陈旧的不重要记忆排在后面

### Requirement: 记忆 API

系统 SHALL 提供以下 API 端点：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/memory/short-term` | GET | 获取短期记忆 |
| `/pet/{pet_id}/memory/long-term` | GET | 获取长期记忆 |
| `/pet/{pet_id}/memory` | POST | 添加记忆 |
| `/pet/{pet_id}/memory/summary` | GET | 获取记忆摘要（时间加权） |

#### Scenario: 获取短期记忆

**Given** 宠物 ID 为 "pet-001"  
**When** 调用 GET /pet/pet-001/memory/short-term  
**Then** 返回最近 24 小时内的记忆列表

### Requirement: 记忆数据模型增强

系统 SHALL 在 Memory 数据模型中添加以下字段：

- `is_short_term`：是否短期记忆（Boolean）
- `decay_rate`：衰减率（Float）

#### Scenario: 数据模型查询

**Given** 数据库已存储分层记忆  
**When** 查询短期记忆  
**Then** 使用 `is_short_term = True` 过滤  
**And** 使用 `created_at >= now() - 24h` 过滤

## MODIFIED Requirements

### Requirement: 记忆系统逻辑

系统 SHALL 修改记忆系统逻辑：

- 添加记忆时自动判断存储为短期或长期
- 每天凌晨自动执行记忆转换（短期→长期）
- 执行记忆衰减计算
- 删除重要度过低的记忆

#### Scenario: 每日记忆维护

**Given** 时间为 00:00（新的一天开始）  
**When** 系统执行每日记忆维护  
**Then** 超过 24 小时的短期记忆转换为长期记忆  
**And** 长期记忆执行衰减计算  
**And** 重要度 < 0.1 的记忆被删除

### Requirement: LangGraph 工作流

系统 SHALL 在 LangGraph 工作流中增强记忆相关节点：

- Planner Agent 查询短期记忆用于决策
- Reflection Agent 将反思写入长期记忆
- Narrative Agent 使用长期记忆生成个性化日记

#### Scenario: 记忆驱动决策

**Given** 宠物需要决定明天去哪里探险  
**When** Planner Agent 进行决策  
**Then** 查询短期记忆获取最近经历  
**And** 查询长期记忆获取性格偏好  
**And** 综合两者做出决策

## Acceptance Criteria

- [ ] 记忆系统支持短期/长期分层存储
- [ ] 短期记忆 24 小时后自动转换
- [ ] 长期记忆按衰减率自动衰减
- [ ] 记忆检索支持时间加权排序
- [ ] 记忆 API 端点正常响应
- [ ] 每日记忆维护任务正常执行