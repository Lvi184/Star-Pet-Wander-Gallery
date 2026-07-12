# Narrative System - Spec

## ADDED Requirements

### Requirement: 日记生成

系统 SHALL 实现日记生成功能，根据宠物近期事件记录，调用 LLM 生成第一人称日记，支持多种性格语气。

#### Scenario: 根据事件生成日记
```
Given 宠物完成探险事件
When 系统调用日记生成
Then 收集近期事件记录
And 分析宠物当前心情和性格
And 调用 LLM 生成第一人称日记
And 根据性格调整语气风格
And 添加情感标签和关键词
```

#### Scenario: 无事件记录生成日常日记
```
Given 宠物近期无事件记录
When 系统调用日记生成
Then 生成日常心情记录
And 使用默认温和语气
```

### Requirement: 性格语气映射

系统 SHALL 实现性格语气映射，不同性格的宠物生成的日记语气不同，包括活泼、温柔、傲娇、深沉、调皮等。

#### Scenario: 活泼性格日记生成
```
Given 宠物性格为活泼
When 生成日记
Then 日记语气充满活力
And 使用感叹号和表情符号
```

#### Scenario: 温柔性格日记生成
```
Given 宠物性格为温柔
When 生成日记
Then 日记语气温柔细腻
And 使用比喻和拟人化表达
```

#### Scenario: 傲娇性格日记生成
```
Given 宠物性格为傲娇
When 生成日记
Then 日记语气口是心非
And 带点倔强和小脾气
```

### Requirement: 日记内容结构

系统 SHALL 实现完整的日记内容结构，包括日期、天气、心情、今天发生了什么、我的感受、明天想做等部分。

#### Scenario: 完整日记结构
```
Given 需要生成日记
When 系统生成日记内容
Then 包含日期、天气、心情
And 包含今天发生了什么
And 包含我的感受
And 包含明天想做
```

## MODIFIED Requirements

### Requirement: 现有叙事 Agent

现有叙事 Agent MUST 增强日记生成质量，参考 StarPet 优化 Prompt，支持多种性格语气，提升情感表达丰富度。

#### Scenario: 增强日记生成质量
```
Given 参考 StarPet 优化 Prompt
When 生成日记
Then 日记质量提升
And 支持多种性格语气
And 情感表达更丰富
```