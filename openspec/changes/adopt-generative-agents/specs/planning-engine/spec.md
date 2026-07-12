# Planning Engine - Specification

## Description

Planning Engine 基于记忆和反思制定行动计划，支持长期、中期、短期三个层次的规划，并驱动宠物的行为决策。

## ADDED Requirements

### 1. Planning Levels

系统 SHALL 支持三个层次的规划：
- **长期规划**：几天到几周，总体目标
- **中期规划**：一天，今日计划
- **短期规划**：几小时，当前任务

#### Scenario: 多层规划

```
Given 宠物长期目标是"成为探险家"
When 制定今日计划
Then 中期规划为"今天去森林探险"
And 短期规划为"先去东边探索"
```

### 2. Planning Process

系统 SHALL 遵循以下规划流程：
1. 读取记忆和反思
2. 设定当前目标
3. 制定行动计划
4. 选择下一个行动

#### Scenario: 基于记忆规划

```
Given 记忆：天气很好
And 记忆：昨天没去森林
And 反思：今天适合探险
When 制定计划
Then 目标为"去森林探险"
And 计划步骤为["出发去森林", "探索森林", "收集物品"]
```

### 3. Decision Factors

系统 SHALL 考虑以下决策因素：
- 当前状态（精力、心情）
- 记忆中的偏好
- 反思中的洞察
- 日程约束

#### Scenario: 状态影响规划

```
Given 宠物精力值为20（很低）
When 制定计划
Then 计划优先选择休息活动
And 探索活动概率降低
```

### 4. Plan Execution

系统 SHALL 执行计划并跟踪进度。

#### Scenario: 计划执行跟踪

```
Given 计划有3个步骤
When 完成第1步
Then 当前步骤更新为1
And 计划状态为进行中
When 完成所有步骤
Then 计划状态更新为已完成
```

### 5. Plan API

系统 SHALL 提供以下 API 端点：
- `GET /pet/{pet_id}/plans`：获取计划列表
- `POST /pet/{pet_id}/plans`：创建计划
- `GET /pet/{pet_id}/plans/current`：获取当前计划
- `PUT /pet/{pet_id}/plans/{plan_id}`：更新计划

#### Scenario: 获取当前计划

```
Given 宠物有活跃的日计划
When 调用 GET /pet/{pet_id}/plans/current
Then 返回当前活跃计划
And 包含目标和进度
```

### 6. Plan Model

系统 SHALL 创建 Plan 数据模型，包含以下字段：
- `id`：主键
- `pet_id`：宠物ID
- `level`：规划层次
- `goal`：目标
- `steps`：步骤列表
- `current_step`：当前步骤
- `status`：状态
- `priority`：优先级
- `created_at`：创建时间
- `updated_at`：更新时间

#### Scenario: 计划数据持久化

```
Given 系统创建1条计划记录
When 计划写入数据库
Then 数据库中有对应记录
And 记录包含所有必填字段
```

## ACCEPTANCE CRITERIA

- [x] 支持三个层次的规划
- [x] 规划流程基于记忆和反思
- [x] 决策考虑状态、偏好、洞察、日程
- [x] 计划执行进度跟踪
- [x] 计划 API 正常响应
- [x] 计划数据持久化