## ADDED Requirements

### Requirement: 地图对象交互
系统 SHALL 支持通过地图对象（门、物品、敌人）触发交互事件。

#### Scenario: 门触发场景切换
- **WHEN** 玩家靠近地图中的门对象
- **THEN** 触发场景切换到目标地图，玩家出现在指定位置

#### Scenario: 物品拾取
- **WHEN** 玩家接触物品对象（金币、水晶等）
- **THEN** 物品被拾取，添加到玩家背包

#### Scenario: 敌人交互
- **WHEN** 玩家靠近敌人对象并按空格键
- **THEN** 触发战斗或对话交互

### Requirement: 动作碰撞器
系统 SHALL 使用动作碰撞器检测玩家与可交互对象的接触。

#### Scenario: 动作碰撞器更新
- **WHEN** 玩家移动或改变方向
- **THEN** 动作碰撞器位置更新到玩家前方

#### Scenario: 碰撞检测
- **WHEN** 动作碰撞器与可交互对象接触
- **THEN** 显示交互提示

### Requirement: 交互提示
系统 SHALL 在玩家靠近可交互对象时显示交互提示。

#### Scenario: 靠近提示
- **WHEN** 玩家靠近可交互对象
- **THEN** 显示按空格键交互的提示

#### Scenario: 交互触发
- **WHEN** 玩家在提示显示时按空格键
- **THEN** 触发对应交互事件