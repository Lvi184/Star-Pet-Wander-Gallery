## ADDED Requirements

### Requirement: 统一Action Resolver
系统SHALL实现统一Action Resolver，所有玩家和AI的动作必须经过同一结算器。

#### Scenario: 玩家采集珍珠
- **WHEN** 玩家操控角色采集珍珠
- **THEN** 动作进入Action Resolver，生成EventRecord，珍珠进入背包

#### Scenario: AI采集珍珠
- **WHEN** AI自主采集珍珠
- **THEN** 动作进入同一Action Resolver，生成EventRecord，珍珠进入同一背包

#### Scenario: 动作合法性校验
- **WHEN** 玩家尝试执行非法动作（如在无资源区域采集）
- **THEN** Action Resolver拒绝动作并返回错误信息

### Requirement: EventRecord生成
Action Resolver SHALL为每个成功结算的动作生成EventRecord，包含cause_chain字段。

#### Scenario: 生成EventRecord
- **WHEN** 动作结算成功
- **THEN** 系统创建EventRecord，包含action_type、location、detail、cause_chain等字段

### Requirement: 状态一致性
Action Resolver SHALL确保CharacterState是角色当前权威状态，所有变更必须通过EventRecord追溯。

#### Scenario: 状态追溯
- **WHEN** 查询角色状态变化历史
- **THEN** 系统通过EventRecord序列还原完整状态变更路径