## ADDED Requirements

### Requirement: 全局状态管理
系统 SHALL 使用 Zustand 管理游戏全局状态，包括英雄数据、地图数据、资源加载状态和对话框状态。

#### Scenario: 英雄状态管理
- **WHEN** 玩家角色移动或改变方向
- **THEN** Zustand store 中的 heroData 状态更新，包括 facingDirection、initialPosition、initialFrame

#### Scenario: 地图状态管理
- **WHEN** 场景切换或地图加载
- **THEN** Zustand store 中的 mapData 状态更新，包括 mapKey 和 tilesets

#### Scenario: 资源加载状态管理
- **WHEN** 资源开始加载或加载完成
- **THEN** Zustand store 中的 loadedAssets 状态更新，追踪已加载的 fonts、atlases、images、maps、jsons

#### Scenario: 对话框状态管理
- **WHEN** 玩家与 NPC 对话
- **THEN** Zustand store 中的 dialog 状态更新，包括 messages、action、characterName

### Requirement: 状态选择器和设置器
系统 SHALL 提供类型安全的状态选择器（selectors）和设置器（setters），确保状态访问和修改的一致性。

#### Scenario: 选择器访问
- **WHEN** 场景代码需要读取状态
- **THEN** 使用预定义的选择器函数（如 selectHeroFacingDirection）获取状态

#### Scenario: 设置器更新
- **WHEN** 场景代码需要修改状态
- **THEN** 使用预定义的设置器函数（如 setHeroFacingDirection）更新状态

### Requirement: 状态持久化
系统 SHALL 在游戏会话期间保持状态，支持场景切换时状态传递。

#### Scenario: 场景切换状态保持
- **WHEN** 从森林场景切换到小镇场景
- **THEN** 英雄的位置和方向状态保持不变