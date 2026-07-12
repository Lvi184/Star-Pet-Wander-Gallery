## ADDED Requirements

### Requirement: 场景创建工具函数
系统 SHALL 提供工具函数集合，分离场景创建逻辑到独立模块。

#### Scenario: 创建地图
- **WHEN** 场景初始化时调用 handleCreateMap
- **THEN** 根据 Zustand 中的 mapKey 和 tilesets 创建瓦片地图和碰撞层

#### Scenario: 创建英雄
- **WHEN** 场景初始化时调用 handleCreateHero
- **THEN** 根据 Zustand 中的英雄初始状态创建玩家精灵

#### Scenario: 创建控制
- **WHEN** 场景初始化时调用 handleCreateControls
- **THEN** 创建键盘控制（WASD、方向键、空格键）

#### Scenario: 创建分组
- **WHEN** 场景初始化时调用 handleCreateGroups
- **THEN** 创建游戏对象分组（sprites、enemies、items、mapLayers）

### Requirement: 英雄移动工具函数
系统 SHALL 提供 handleHeroMovement 函数，管理玩家角色的移动逻辑。

#### Scenario: 方向键移动
- **WHEN** 用户按下方向键或 WASD
- **THEN** handleHeroMovement 更新英雄速度、播放对应动画、更新朝向状态

#### Scenario: 停止移动
- **WHEN** 用户释放所有移动键
- **THEN** handleHeroMovement 停止动画，显示待机动画帧

#### Scenario: 对话时禁止移动
- **WHEN** 对话框显示时
- **THEN** handleHeroMovement 忽略移动输入

### Requirement: 对象层处理工具函数
系统 SHALL 提供 handleObjectsLayer 函数，处理地图中的游戏对象（敌人、物品、门等）。

#### Scenario: 加载敌人
- **WHEN** 地图对象层包含敌人对象
- **THEN** handleObjectsLayer 创建敌人精灵并添加到 enemies 分组

#### Scenario: 加载物品
- **WHEN** 地图对象层包含物品对象（金币、水晶、钥匙等）
- **THEN** handleObjectsLayer 创建物品精灵并添加到 items 分组

#### Scenario: 门交互
- **WHEN** 玩家靠近门对象
- **THEN** handleObjectsLayer 创建碰撞检测，触发场景切换

### Requirement: 相机配置工具函数
系统 SHALL 提供 handleConfigureCamera 函数，配置相机跟随和边界。

#### Scenario: 相机跟随
- **WHEN** 场景初始化时调用 handleConfigureCamera
- **THEN** 相机开始跟随玩家角色

#### Scenario: 相机边界
- **WHEN** 场景初始化时调用 handleConfigureCamera
- **THEN** 相机设置边界限制，防止超出地图范围

#### Scenario: 窗口 resize 时更新相机
- **WHEN** 窗口大小变化时
- **THEN** handleConfigureCamera 重新配置相机边界