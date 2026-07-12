## Why

当前项目的游戏引擎架构较为简单，场景逻辑与状态管理耦合紧密，资源加载缺乏统一管线。参考项目 `top-down-react-phaser-game-template` 提供了成熟的架构模式，包括 Zustand 全局状态管理、sceneHelpers 工具函数分离、LoadAssetsScene 动态资源加载等，引入这些模式可以显著提升代码可维护性、性能和扩展性。

## What Changes

- 引入 Zustand 状态管理库，替换当前通过 React refs 传递数据的方式
- 创建 sceneHelpers 工具函数，分离场景逻辑到独立模块
- 实现 LoadAssetsScene 资源加载管线，支持按需加载和缓存
- 重构 ForestScene 和 TownScene，采用新的架构模式
- 优化游戏尺寸计算和响应式适配逻辑
- 实现通过地图对象（如门）触发场景切换的机制

## Capabilities

### New Capabilities
- `zustand-state-management`: 使用 Zustand 管理游戏全局状态（英雄数据、地图数据、资源加载状态、对话框状态）
- `scene-helpers`: 工具函数集合，分离场景创建、英雄移动、碰撞检测等逻辑
- `load-assets-scene`: 资源加载场景，支持按需加载地图、图集、图片和字体，带进度条
- `map-object-interaction`: 通过地图对象（门、物品、敌人）触发交互事件

### Modified Capabilities
- 无

## Impact

- **前端代码**: 重构 `frontend/src/game/` 目录结构，新增 `zustand/`、`utils/`、`hooks/` 目录
- **依赖**: 添加 `zustand` 和 `is-mobile` 依赖
- **场景文件**: 重写 `ForestScene.ts` 和 `TownScene.ts`，采用新的架构模式
- **资源加载**: 修改资源加载逻辑，支持动态加载和缓存