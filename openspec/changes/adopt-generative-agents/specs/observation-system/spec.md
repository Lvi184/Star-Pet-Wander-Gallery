# Observation System - Specification

## Description

Observation System 实现宠物的环境感知能力，让宠物能够感知天气变化、位置变化、发现其他宠物和物品，生成观察记录并写入记忆流。

## ADDED Requirements

### 1. Observation Types

系统 SHALL 支持以下观察类型：
- `weather`：天气变化观察
- `location`：位置变化观察
- `pet`：发现其他宠物观察
- `item`：发现物品观察
- `event`：事件发生观察
- `status`：状态变化观察

#### Scenario: 天气变化观察

```
Given 宠物在星光森林
When 天气从晴朗变为下雨
Then 系统生成 weather 类型观察
And 观察内容为"天气变下雨了"
And 观察重要度为 0.6
```

### 2. Observation Generation

系统 SHALL 在每个 World Tick 开始时生成观察记录。

#### Scenario: World Tick 触发观察

```
Given 宠物上次观察是10分钟前
When World Tick 执行
Then 系统检测环境变化
And 生成至少1条观察记录
And 观察写入记忆流
```

### 3. Observation API

系统 SHALL 提供以下 API 端点：
- `GET /pet/{pet_id}/observations`：获取观察列表
- `POST /pet/{pet_id}/observations`：添加观察
- `GET /pet/{pet_id}/observations/latest`：获取最新观察

#### Scenario: 获取观察列表

```
Given 宠物有5条观察记录
When 调用 GET /pet/{pet_id}/observations
Then 返回5条观察记录
And 按时间倒序排列
```

### 4. Observation Model

系统 SHALL 创建 Observation 数据模型，包含以下字段：
- `id`：主键
- `pet_id`：宠物ID
- `type`：观察类型
- `content`：观察内容
- `importance`：重要度
- `context`：上下文信息
- `created_at`：创建时间

#### Scenario: 观察数据持久化

```
Given 系统生成1条观察记录
When 观察写入数据库
Then 数据库中有对应记录
And 记录包含所有必填字段
```

## ACCEPTANCE CRITERIA

- [x] 系统支持6种观察类型
- [x] World Tick 自动生成观察记录
- [x] 观察记录按时间顺序存储
- [x] 观察 API 正常响应
- [x] 观察数据持久化到数据库