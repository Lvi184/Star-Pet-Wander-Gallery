## ADDED Requirements

### Requirement: 每日命运等级生成
系统SHALL每天为每个区域生成命运等级（普通/幸运/危险/灾难）。

#### Scenario: 生成每日命运
- **WHEN** 世界时间进入新的一天
- **THEN** DestinySystem为所有区域生成当日命运等级

#### Scenario: 命运等级查询
- **WHEN** 玩家查看天道页面
- **THEN** 系统显示各区域当前命运等级

### Requirement: Planner上下文隔离
系统SHALL确保Planner Agent的上下文中不包含区域命运等级信息。

#### Scenario: Planner看不到命运
- **WHEN** Planner Agent决策时
- **THEN** 输入上下文中不包含命运等级字段

#### Scenario: 玩家可见命运
- **WHEN** 玩家查看地图
- **THEN** 危险区域显示警告标识

### Requirement: 命运影响事件概率
系统SHALL根据区域命运等级调整事件概率权重。

#### Scenario: 危险区域高风险事件
- **WHEN** 角色进入危险等级区域
- **THEN** 系统提高风险事件触发概率

#### Scenario: 幸运区域高收益事件
- **WHEN** 角色进入幸运等级区域
- **THEN** 系统提高发现稀有物品概率