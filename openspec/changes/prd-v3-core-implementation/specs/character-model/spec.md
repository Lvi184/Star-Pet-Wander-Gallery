## ADDED Requirements

### Requirement: Character模型替换Pet模型
系统SHALL使用Character模型替代Pet模型，支持player/agent/transitioning三种控制类型。

#### Scenario: 创建新角色
- **WHEN** 用户创建灵兽
- **THEN** 系统创建Character记录，初始controller_type为agent

#### Scenario: 查看角色状态
- **WHEN** 用户查询角色状态
- **THEN** 系统返回包含controller_type、controller_version、health、personality等字段的完整状态

### Requirement: 人格六维属性
Character模型SHALL包含好奇/谨慎/社交/同理/坚持/冒险六个维度的人格属性（0-100）。

#### Scenario: 人格影响行为倾向
- **WHEN** Planner Agent决策时
- **THEN** 系统考虑人格六维属性计算行为倾向分数

### Requirement: 角色状态机
系统SHALL维护角色状态机：normal → injured → critical → dead。

#### Scenario: 状态转换
- **WHEN** 角色health降至30以下
- **THEN** 状态转换为injured

#### Scenario: 死亡判定
- **WHEN** 角色health降至0
- **THEN** 状态转换为dead并触发死亡叙事