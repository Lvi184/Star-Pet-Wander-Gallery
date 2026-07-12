## Why

当前项目的探索界面缺乏真实游戏场景感，用户反馈自行设计的地图效果不佳。参考项目 AI Town 和 Smallville 提供了高质量的瓦片地图、NPC 分布、交互系统和动画效果，复用这些资源可以快速提升游戏体验，避免重复开发。

## What Changes

- 复用 AI Town 的森林场景地图（tilemap.json + rpg-tileset.png）作为青丘森林场景
- 复用 Smallville 的小镇场景地图（map.json + 8个瓦片集）作为星宠小镇场景
- 复用 AI Town 的动画精灵资源（篝火、风车、瀑布、星星闪烁）
- 复用 Smallville 的 NPC 精灵图（bob、adam、amelia、alex）和动画配置
- 实现 NPC 对话系统（靠近 NPC 按空格触发对话）
- 实现场景切换系统（侧边栏按钮 + 键盘快捷键）
- 实现物理碰撞检测（建筑物边界、墙壁）

## Capabilities

### New Capabilities
- `forest-scene`: 青丘森林场景，包含 AI Town 地图、动画精灵、NPC 和怪物
- `town-scene`: 星宠小镇场景，包含 Smallville 小镇地图、建筑、室内装饰、NPC
- `npc-dialog-system`: NPC 对话交互系统，支持靠近对话和对话框显示
- `scene-switching`: 场景切换系统，支持侧边栏按钮和键盘快捷键切换
- `physics-collision`: 物理碰撞系统，支持地图边界和建筑物碰撞

### Modified Capabilities
- 无

## Impact

- **前端代码**: 修改 `frontend/src/game/GameEngine.tsx`、`frontend/src/pages/Explore/Explore.tsx`
- **新增文件**: `frontend/src/game/scenes/ForestScene.ts`、`frontend/src/game/scenes/TownScene.ts`
- **资源文件**: 复制 AI Town 和 Smallville 的地图数据、瓦片集、精灵图到 `frontend/public/assets/game/`
- **依赖**: 已依赖 Phaser.js，无需新增依赖