# Reflection Engine - Specification

## Description

Reflection Engine 从记忆流中提炼更高层次的见解，发现模式和规律，形成知识，并影响宠物的行为决策。

## ADDED Requirements

### 1. Reflection Generation

系统 SHALL 从观察和记忆中生成反思摘要。

#### Scenario: 反思生成

```
Given 宠物最近有10条观察记录
When 触发反思
Then 系统识别模式和规律
And 生成反思摘要
And 反思写入长期记忆
```

### 2. Reflection Questions

系统 SHALL 使用以下反思问题模板：
1. 从最近的观察中，我发现了什么模式？
2. 我学到了什么新东西？
3. 我应该改变什么行为？
4. 我未来应该追求什么目标？

#### Scenario: 反思问题应用

```
Given 宠物观察到"每次下雨森林里会有蘑菇"
When 系统应用反思问题"我学到了什么新东西？"
Then 生成反思"下雨后森林里会长蘑菇，可以去采集"
And 更新宠物知识
```

### 3. Reflection Triggers

系统 SHALL 在以下条件触发反思：
- 积累一定数量的观察（如10条）
- 经过一定时间（如4小时）
- 发生重要事件

#### Scenario: 观察数量触发反思

```
Given 宠物已有9条观察记录
When 生成第10条观察记录
Then 自动触发反思
And 生成反思摘要
```

### 4. Reflection Impact

系统 SHALL 将反思结果应用到宠物性格和偏好。

#### Scenario: 反思影响行为

```
Given 宠物反思"我喜欢探索森林"
When 制定计划
Then 计划优先选择探索活动
And 宠物行为倾向探索
```

### 5. Reflection API

系统 SHALL 提供以下 API 端点：
- `GET /pet/{pet_id}/reflection`：获取最新反思
- `POST /pet/{pet_id}/reflection/trigger`：触发反思
- `GET /pet/{pet_id}/reflection/history`：获取反思历史

#### Scenario: 手动触发反思

```
Given 宠物有5条观察记录
When 调用 POST /pet/{pet_id}/reflection/trigger
Then 系统立即生成反思
And 返回反思结果
```

## ACCEPTANCE CRITERIA

- [x] 系统能从记忆中生成反思摘要
- [x] 支持4个反思问题模板
- [x] 三种触发条件正常工作
- [x] 反思影响宠物行为决策
- [x] 反思 API 正常响应