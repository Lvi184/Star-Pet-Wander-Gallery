# Capability: NPC Social System

## Summary

实现 AI Town 风格的 NPC 社交系统，宠物之间可以相遇、对话、建立友谊或敌对关系。

## ADDED Requirements

### Requirement: 社交事件类型

系统 SHALL 定义以下社交事件类型：

- `meet`：相遇
- `chat`：对话
- `play`：玩耍
- `help`：互助
- `compete`：竞争

#### Scenario: 社交事件生成

**Given** 宠物 A 和宠物 B 在同一个区域  
**When** 系统检测到它们相遇  
**Then** 生成 `meet` 事件  
**And** 记录相遇地点和时间

### Requirement: 关系系统

系统 SHALL 实现宠物间的关系系统：

- 宠物之间建立友谊/敌对关系
- 关系值范围：-100 到 100
- 关系影响社交行为和日记内容

#### Scenario: 关系建立

**Given** 宠物 A 和宠物 B 进行了友好对话  
**When** 对话结束  
**Then** 它们之间的关系值增加 10  
**And** 如果关系值 >= 50，关系类型变为 `friend`

### Requirement: 关系数据模型

系统 SHALL 创建 Relationship 数据模型：

- `pet_id`：宠物ID
- `target_pet_id`：目标宠物ID
- `relationship_type`：关系类型（friend/neutral/enemy）
- `affinity`：亲密度（-100 到 100）
- `last_interaction`：最后互动时间

#### Scenario: 关系查询

**Given** 宠物 ID 为 "pet-001"  
**When** 查询关系列表  
**Then** 返回该宠物与其他宠物的关系数据  
**And** 按亲密度排序

### Requirement: 社交对话生成

系统 SHALL 实现社交对话生成机制：

- Social Agent 根据双方性格和关系生成对话内容
- 对话分为多个轮次，直到达成共识或结束
- 对话结果影响关系值

#### Scenario: 对话生成

**Given** 宠物 A（性格：活泼）和宠物 B（性格：温柔）相遇  
**When** 系统生成对话  
**Then** 宠物 A 使用活泼的语气发起对话  
**And** 宠物 B 使用温柔的语气回应  
**And** 对话结束后关系值发生变化

### Requirement: 社交事件链

系统 SHALL 实现社交事件链：

```
宠物相遇 → 对话 → 决定共同行动 → 生成社交事件链
```

#### Scenario: 社交事件链

**Given** 宠物 A 和宠物 B 相遇并进行对话  
**When** 它们决定一起探险  
**Then** 生成事件链：meet → chat → explore_together  
**And** 每个事件记录到双方的记忆中

### Requirement: 社交 API

系统 SHALL 提供以下 API 端点：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/relationships` | GET | 获取关系列表 |
| `/pet/{pet_id}/social/meet` | POST | 触发社交相遇 |
| `/pet/{pet_id}/social/chat` | POST | 生成社交对话 |

#### Scenario: 触发社交相遇

**Given** 宠物 ID 为 "pet-001"，目标宠物 ID 为 "pet-002"  
**When** 调用 POST /pet/pet-001/social/meet?target=pet-002  
**Then** 生成相遇事件  
**And** 返回事件详情和关系变化

### Requirement: 社交记忆

系统 SHALL 将社交事件写入社交记忆：

- 每次社交互动生成一条 `social` 类型的记忆
- 记忆内容包含互动对象、互动类型和结果
- 社交记忆用于性格形成和未来社交决策

#### Scenario: 社交记忆存储

**Given** 宠物 A 和宠物 B 进行了玩耍  
**When** 系统记录该事件  
**Then** 生成 `social` 类型记忆  
**And** 记忆内容包含："和宠物 B 在草地上玩耍，玩得很开心"

## MODIFIED Requirements

### Requirement: LangGraph 工作流

系统 SHALL 在 LangGraph 工作流中添加社交相关节点：

- `social_step`：社交节点，处理宠物间互动
- `reflect_step`：增强反思节点，包含社交反思
- `narrate_step`：增强叙事节点，包含社交日记

#### Scenario: 社交工作流

**Given** 下午时间段（社交时间段）  
**When** Planner Agent 决定进行社交活动  
**Then** 工作流进入 `social_step` 节点  
**And** 生成社交事件链  
**And** 社交事件写入记忆

### Requirement: 日程系统

系统 SHALL 在日程系统中增加社交活动类型：

- 上午（10:00-14:00）：社交概率 0.5
- 下午（14:00-18:00）：社交概率 0.3

#### Scenario: 日程社交

**Given** 时间为 11:00（上午社交时间段）  
**When** 系统进行日程决策  
**Then** 宠物有 50% 概率选择社交活动  
**And** 如果有好友在附近，社交概率提升至 70%

### Requirement: 日记生成

系统 SHALL 在日记生成中包含社交内容：

- Narrative Agent 使用社交记忆生成日记
- 日记内容根据关系类型和对话内容变化
- 好友互动生成积极日记，敌对互动生成消极日记

#### Scenario: 社交日记

**Given** 宠物 A 今天和好友宠物 B 一起探险  
**When** Narrative Agent 生成日记  
**Then** 日记包含与好友互动的内容  
**And** 语气积极友好

## Acceptance Criteria

- [ ] 宠物间可以相遇并生成社交事件
- [ ] 关系系统正常工作，支持友谊/敌对关系
- [ ] 社交对话生成正常，支持多轮对话
- [ ] 社交事件链生成正常
- [ ] 社交 API 端点正常响应
- [ ] 社交记忆正常存储和检索
- [ ] 社交内容正常出现在日记中