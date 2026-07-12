## ADDED Requirements

### Requirement: 星宠小镇场景渲染
系统 SHALL 使用 Smallville 的瓦片地图资源渲染星宠小镇场景，包含完整的小镇布局和建筑。

#### Scenario: 小镇场景加载成功
- **WHEN** 用户点击星宠小镇按钮或按 T 键
- **THEN** 系统加载 Smallville 的 map.json 和 8 个瓦片集资源，渲染完整的小镇场景

#### Scenario: 多层地图结构
- **WHEN** 小镇场景加载完成
- **THEN** 地图包含 13 层（人行道、建筑、室内装饰等），呈现立体效果

### Requirement: 小镇地图完整性
系统 SHALL 复刻 Smallville 小镇的完整布局，包括冰淇淋店、图书馆、学校、商店等建筑。

#### Scenario: 建筑分布
- **WHEN** 小镇场景加载完成
- **THEN** 小镇包含冰淇淋店、图书馆、卧室、厨房、杂货店等建筑

#### Scenario: 室内装饰
- **WHEN** 玩家进入建筑内部
- **THEN** 室内显示家具、装饰品等细节

### Requirement: NPC 分布
系统 SHALL 在小镇场景中分布多个 NPC，包括店员、游客、管理员、老板等，位置合理分散。

#### Scenario: NPC 数量
- **WHEN** 小镇场景加载完成
- **THEN** 小镇中分布至少 6 个 NPC

#### Scenario: NPC 位置分散
- **WHEN** 小镇场景加载完成
- **THEN** NPC 分布在不同建筑和街道位置，避免聚集

### Requirement: 动画对象
系统 SHALL 在小镇场景中展示动画对象，包括学校旗帜、蹦床、鸽子等。

#### Scenario: 旗帜飘动
- **WHEN** 小镇场景加载完成
- **THEN** 学校旗帜持续飘动

#### Scenario: 蹦床弹跳
- **WHEN** 小镇场景加载完成
- **THEN** 蹦床显示弹跳动画

#### Scenario: 鸽子飞翔
- **WHEN** 小镇场景加载完成
- **THEN** 鸽子在广场上飞翔

### Requirement: 玩家角色控制
系统 SHALL 允许玩家使用键盘控制角色在小镇场景中移动，支持进入建筑内部。

#### Scenario: 小镇移动
- **WHEN** 用户按下移动键
- **THEN** 玩家角色在小镇街道上移动

#### Scenario: 进入建筑
- **WHEN** 玩家角色靠近建筑入口
- **THEN** 玩家可以进入建筑内部