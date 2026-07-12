## ADDED Requirements

### Requirement: 风险事件链生成
系统SHALL为每个风险事件生成CauseChain（原因链），包含所有影响因素。

#### Scenario: 生成CauseChain
- **WHEN** 触发风险事件
- **THEN** 系统生成CauseChain，如"灾难命运+低精力+夜间进入幽都+未携带照明护符"

#### Scenario: 原因链追溯
- **WHEN** 用户查看事件详情
- **THEN** 系统显示完整CauseChain

### Requirement: 多因素死亡判定
系统SHALL确保死亡必须是多因素结果，禁止单次随机数直接导致死亡。

#### Scenario: 多因素死亡
- **WHEN** 角色遭遇严重事件且处于脆弱状态
- **THEN** 系统判定死亡

#### Scenario: 单次事件不死
- **WHEN** 角色仅遭遇单次普通风险事件
- **THEN** 系统不判定死亡

### Requirement: 角色反应机制
系统SHALL允许角色在风险事件中做出反应（逃跑/求助/坚持/使用物品）。

#### Scenario: 逃跑反应
- **WHEN** 角色遭遇风险事件且精力充足
- **THEN** 角色可以选择逃跑减少伤害

#### Scenario: 使用物品
- **WHEN** 角色遭遇风险事件且背包有护符
- **THEN** 角色可以使用护符降低风险