# Offline Exploration - Spec

## ADDED Requirements

### Requirement: World Tick 机制

系统 SHALL 实现 World Tick 机制，当用户离线后上线时，根据离线时长批量生成宠物行为事件，并更新宠物状态。

#### Scenario: 用户离线后上线同步事件
```
Given 用户上次在线时间为 2026-07-11 10:00:00
And 当前时间为 2026-07-11 11:00:00
When 用户调用同步接口
Then 系统计算离线时长为 3600 秒
And 系统生成 5 个离线事件
And 系统更新宠物状态
And 返回所有离线事件列表
```

#### Scenario: 离线时间过长限制事件数
```
Given 用户离线超过 24 小时
When 用户调用同步接口
Then 系统限制最大生成事件数为 20
And 返回 20 个离线事件
```

#### Scenario: 宠物精力过低自动休息
```
Given 宠物当前精力为 10
When 系统生成离线事件
Then 宠物自动进入休息模式
And 精力恢复 +20
```

### Requirement: 事件类型

系统 SHALL 支持多种事件类型，包括探索、发现、休息、收集等，每种事件类型有不同的触发条件和状态变化。

#### Scenario: 探索事件生成
```
Given 宠物精力 > 30
When 系统生成探索事件
Then 宠物精力 -10
And 宠物心情 +5
And 生成探索详情描述
```

#### Scenario: 发现事件生成
```
Given 宠物正在探索
When 系统随机触发发现事件（30%概率）
Then 宠物心情 +10
And 生成发现物品描述
```

#### Scenario: 收集事件生成
```
Given 宠物正在探索
When 系统随机触发收集事件（20%概率）
Then 宠物获得物品
And 物品添加到背包
```

### Requirement: 状态衰减规则

系统 SHALL 实现状态衰减规则，宠物的精力和心情会随时间自然衰减，好奇心会随时间增长。

#### Scenario: 精力自然衰减
```
Given 当前时间推进 1 小时
When 宠物未进行任何活动
Then 宠物精力 -5
```

#### Scenario: 心情自然衰减
```
Given 当前时间推进 1 小时
When 宠物未进行任何活动
Then 宠物心情 -3
```

## MODIFIED Requirements

### Requirement: 现有记忆系统

现有记忆系统 MUST 增强，支持离线事件记录，将离线事件记录到短期记忆，并将事件摘要记录到长期记忆。

#### Scenario: 离线事件记录到记忆
```
Given 系统生成离线事件
When 事件完成后
Then 事件记录到短期记忆
And 事件摘要记录到长期记忆
```

### Requirement: 现有行为链

现有行为链 MUST 支持批量事件处理，事件按时间顺序排列，每个事件影响宠物状态。

#### Scenario: 批量事件处理
```
Given 系统需要处理多个离线事件
When 生成事件链
Then 事件按时间顺序排列
And 每个事件影响宠物状态
```