## ADDED Requirements

### Requirement: Agent观察台展示
系统SHALL实现Agent观察台，向评委展示AI行为的可审计链路。

#### Scenario: 展示Planner意图
- **WHEN** 打开Agent观察台
- **THEN** 系统显示Planner输入摘要和ActionIntent输出

#### Scenario: 展示规则结算
- **WHEN** 查看观察台详情
- **THEN** 系统显示规则引擎的结算过程和结果

#### Scenario: 展示事件引用
- **WHEN** 查看Narrative生成过程
- **THEN** 系统显示Narrative引用的EventRecord ID

### Requirement: 证明非随机性
Agent观察台SHALL证明AI行为不是随机生成，而是基于规则和记忆的决策。

#### Scenario: 决策链路追踪
- **WHEN** 用户追踪一次AI决策
- **THEN** 系统展示从输入→Planner→Resolver→EventRecord的完整链路

#### Scenario: 记忆引用展示
- **WHEN** Planner决策时引用记忆
- **THEN** 系统高亮显示被引用的记忆条目

### Requirement: 实时更新
Agent观察台SHALL实时更新AI决策过程，供评委现场观察。

#### Scenario: 实时刷新
- **WHEN** AI执行新动作
- **THEN** 观察台自动更新显示最新决策信息