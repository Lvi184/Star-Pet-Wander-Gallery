# Memory Stream - Specification

## Description

Memory Stream 实现按时间顺序存储的记忆流，支持关联检索、重要度计算和类型过滤，是 Generative Agents 的核心数据结构。

## ADDED Requirements

### 1. Memory Stream Storage

系统 SHALL 按时间顺序存储所有观察、反思、计划和行动记忆。

#### Scenario: 记忆流存储

```
Given 宠物生成观察"天气变好了"
And 宠物生成反思"今天适合探险"
And 宠物生成计划"去森林探险"
When 所有记忆写入记忆流
Then 记忆流按时间顺序排列
And 包含观察、反思、计划三种类型
```

### 2. Memory Retrieval

系统 SHALL 支持根据关键词、类型、时间范围检索记忆。

#### Scenario: 按类型检索

```
Given 记忆流中有10条观察记忆和5条反思记忆
When 按类型"observation"检索
Then 返回10条观察记忆
And 按时间倒序排列
```

### 3. Importance Calculation

系统 SHALL 基于上下文和反思动态调整记忆重要度。

#### Scenario: 重要度调整

```
Given 宠物有记忆"捡到星星碎片"（重要度0.5）
When 反思引擎发现这是稀有物品
Then 重要度调整为0.8
And 记忆标记为重要
```

### 4. Memory Types

系统 SHALL 支持以下记忆类型：
- `observation`：观察记忆
- `reflection`：反思记忆
- `plan`：计划记忆
- `action`：行动记忆

#### Scenario: 记忆分类

```
Given 宠物执行探索行动
When 行动完成
Then 生成 action 类型记忆
And 关联到对应的观察和计划
```

### 5. Time-Weighted Retrieval

系统 SHALL 支持时间加权检索，越近的记忆权重越高。

#### Scenario: 时间加权排序

```
Given 宠物有3条记忆：
  - 10分钟前："发现小花"（重要度0.5）
  - 1小时前："遇到小雨"（重要度0.7）
  - 1天前："捡到星星"（重要度0.9）
When 检索最近记忆
Then 排序结果考虑时间和重要度
And 最近的记忆优先级更高
```

## ACCEPTANCE CRITERIA

- [x] 记忆流按时间顺序存储
- [x] 支持按类型、关键词、时间范围检索
- [x] 重要度动态调整
- [x] 支持4种记忆类型
- [x] 时间加权检索正常工作