# Capability: Daily Schedule System

## Summary

实现 AI Town 风格的每日日程系统，宠物根据时间段自动执行不同活动（早晨探索、下午社交、晚上休息）。

## ADDED Requirements

### Requirement: 日程时间段定义

系统 SHALL 定义以下时间段和对应的活动类型：

| 时间段 | 活动类型 | 概率权重 |
|--------|----------|----------|
| 06:00-10:00 | 早晨探索 | 0.7 |
| 10:00-14:00 | 上午社交 | 0.5 |
| 14:00-18:00 | 下午探索 | 0.6 |
| 18:00-22:00 | 晚上休息 | 0.8 |
| 22:00-06:00 | 深度睡眠 | 0.95 |

#### Scenario: 早晨探险

**Given** 时间为 08:00，宠物精力为 80，心情为 70  
**When** 系统进行日程决策  
**Then** 宠物有 70% 概率选择探险活动，30% 概率选择其他活动

### Requirement: 日程决策流程

系统 SHALL 在每个 World Tick 开始时执行日程检查：

1. 获取当前游戏时间
2. 匹配时间段对应的活动类型
3. 结合宠物状态（精力、心情）调整概率
4. Planner Agent 根据调整后的概率做出最终决策

#### Scenario: 状态影响决策

**Given** 时间为 09:00（早晨探索时间段），宠物精力为 20，心情为 30  
**When** 系统进行日程决策  
**Then** 探险概率降低至 30%，休息概率提升至 60%

### Requirement: 日程数据持久化

系统 SHALL 创建 DailySchedule 数据模型，存储宠物每日活动计划：

- `pet_id`：宠物ID
- `date`：日期
- `activities`：当天活动列表（JSON）
- `created_at`：创建时间

#### Scenario: 日程生成与查询

**Given** 新的一天开始（00:00）  
**When** 系统为宠物生成当日日程  
**Then** 日程包含早晨探索、下午社交、晚上休息三个主要活动  
**And** 日程数据持久化到数据库

### Requirement: 日程 API

系统 SHALL 提供以下 API 端点：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/schedule` | GET | 获取今日日程 |
| `/pet/{pet_id}/schedule/generate` | POST | 生成新日程 |

#### Scenario: 获取日程

**Given** 宠物 ID 为 "pet-001"  
**When** 调用 GET /pet/pet-001/schedule  
**Then** 返回包含当日活动列表的 JSON 响应

### Requirement: 深度睡眠机制

系统 SHALL 在 22:00-06:00 时间段强制宠物进入深度睡眠状态：

- 深度睡眠期间宠物无法进行探险或社交活动
- 深度睡眠每小时恢复 20 点精力
- 深度睡眠期间心情缓慢恢复

#### Scenario: 深度睡眠恢复

**Given** 时间为 23:00，宠物精力为 30  
**When** 宠物进入深度睡眠  
**Then** 1小时后（00:00）精力恢复至 50  
**And** 心情恢复 5 点

## MODIFIED Requirements

### Requirement: LangGraph 工作流

系统 SHALL 在 LangGraph 工作流中添加 `schedule_check` 节点：

- `schedule_check` 节点位于 `offline_sync` 和 `plan` 节点之间
- 负责根据当前时间确定推荐活动类型
- 将推荐活动类型传递给 Planner Agent

#### Scenario: 工作流集成

**Given** LangGraph 工作流已初始化  
**When** 添加 schedule_check 节点  
**Then** 工作流变为：offline_sync → schedule_check → plan → explore/social/rest

## Acceptance Criteria

- [ ] 宠物按时间段自动选择活动类型
- [ ] 宠物状态（精力、心情）影响活动选择概率
- [ ] 每日日程数据持久化到数据库
- [ ] 日程 API 端点正常响应
- [ ] 深度睡眠期间宠物无法进行活动
- [ ] 深度睡眠正常恢复精力和心情