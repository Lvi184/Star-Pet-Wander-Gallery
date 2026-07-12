## ADDED Requirements

### Requirement: 地图边界碰撞
系统 SHALL 在玩家角色到达地图边界时阻止继续移动。

#### Scenario: 到达左边界
- **WHEN** 玩家角色移动到地图左边界
- **THEN** 角色无法继续向左移动

#### Scenario: 到达右边界
- **WHEN** 玩家角色移动到地图右边界
- **THEN** 角色无法继续向右移动

#### Scenario: 到达上边界
- **WHEN** 玩家角色移动到地图上边界
- **THEN** 角色无法继续向上移动

#### Scenario: 到达下边界
- **WHEN** 玩家角色移动到地图下边界
- **THEN** 角色无法继续向下移动

### Requirement: 建筑物碰撞
系统 SHALL 在玩家角色遇到建筑物时阻止进入，实现物理碰撞检测。

#### Scenario: 建筑外墙碰撞
- **WHEN** 玩家角色移动到建筑外墙位置
- **THEN** 角色无法穿过墙壁

#### Scenario: 室内墙壁碰撞
- **WHEN** 玩家角色在室内移动遇到墙壁
- **THEN** 角色无法穿过室内墙壁

#### Scenario: 障碍物碰撞
- **WHEN** 玩家角色遇到地图上的障碍物（树木、岩石等）
- **THEN** 角色无法穿过障碍物

### Requirement: 碰撞层配置
系统 SHALL 使用瓦片地图的碰撞层配置实现精确的碰撞检测。

#### Scenario: 碰撞层加载
- **WHEN** 场景加载时
- **THEN** 系统读取地图的碰撞层数据，创建碰撞体

#### Scenario: 碰撞体类型
- **WHEN** 碰撞检测执行时
- **THEN** 使用 Phaser Arcade Physics 的静态碰撞体检测玩家与地图的碰撞