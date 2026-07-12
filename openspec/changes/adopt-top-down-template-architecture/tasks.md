## 1. 依赖安装和基础结构

- [ ] 1.1 安装 zustand 和 is-mobile 依赖
- [ ] 1.2 创建常量文件 constants.ts（TILE_WIDTH、TILE_HEIGHT、方向常量、精灵名称等）
- [ ] 1.3 创建 Zustand store（store.ts）
- [ ] 1.4 创建 heroData 状态和选择器/设置器
- [ ] 1.5 创建 mapData 状态和选择器/设置器
- [ ] 1.6 创建 loadedAssets 状态和选择器/设置器
- [ ] 1.7 创建 dialog 状态和选择器/设置器
- [ ] 1.8 创建 game 状态和选择器/设置器

## 2. 工具函数实现

- [ ] 2.1 创建通用工具函数 utils.ts（getSelectorData、createInteractiveGameObject 等）
- [ ] 2.2 创建 Phaser 工具函数 phaser.ts（calculateGameSize、getScenesModules、asyncLoader 等）
- [ ] 2.3 创建 handleCreateControls 函数
- [ ] 2.4 创建 handleCreateGroups 函数
- [ ] 2.5 创建 handleCreateMap 函数
- [ ] 2.6 创建 handleCreateHero 函数
- [ ] 2.7 创建 handleObjectsLayer 函数
- [ ] 2.8 创建 handleConfigureCamera 函数
- [ ] 2.9 创建 handleCreateHeroAnimations 函数
- [ ] 2.10 创建 handleHeroMovement 函数
- [ ] 2.11 创建 changeScene 函数

## 3. 资源加载场景

- [ ] 3.1 创建 BootScene（启动场景）
- [ ] 3.2 创建 MainMenuScene（主菜单场景）
- [ ] 3.3 创建 LoadAssetsScene（资源加载场景）
- [ ] 3.4 实现地图资源动态加载
- [ ] 3.5 实现图集资源动态加载
- [ ] 3.6 实现图片资源动态加载
- [ ] 3.7 实现字体资源动态加载
- [ ] 3.8 实现资源缓存机制
- [ ] 3.9 实现加载进度条

## 4. 场景重构

- [ ] 4.1 重构 ForestScene，使用新的架构模式
- [ ] 4.2 重构 TownScene，使用新的架构模式
- [ ] 4.3 更新 GameEngine 组件，集成 Zustand 和新场景
- [ ] 4.4 更新 Explore.tsx，使用 Zustand 状态
- [ ] 4.5 实现地图对象交互（门、物品、敌人）
- [ ] 4.6 实现动作碰撞器系统

## 5. 测试和验证

- [ ] 5.1 测试 Zustand 状态管理功能
- [ ] 5.2 测试资源加载和缓存功能
- [ ] 5.3 测试场景切换功能
- [ ] 5.4 测试玩家移动和动画功能
- [ ] 5.5 测试 NPC 对话交互功能
- [ ] 5.6 测试碰撞检测功能
- [ ] 5.7 测试地图对象交互功能
- [ ] 5.8 测试窗口 resize 自适应功能