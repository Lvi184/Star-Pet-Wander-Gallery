## Why

后端已全面实现自主生命体能力（LangGraph 工作流、Character 双控制器、命运/回溯/死亡系统、六域图论、社交网络、环境事件），但前端仍是 7 页导航式布局，核心卖点「灵兽在六域自主漫游」散落在不同页面，用户上线后无法一眼看到宠物的生命状态。需要将前端重构为单页沉浸式主舞台，让「自主生命体」的体验在比赛演示中即时成立。

## What Changes

- **BREAKING**: 将 [App.tsx](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/App.tsx) 从多页面导航重构为单页沉浸式三栏主舞台（`MainLayout`），Phaser 六域地图成为中栏主舞台，状态面板与漫游志整合到右栏
- 新增星宠名册左栏面板（`PetListPanel`），支持多宠物切换、血条展示、选中高亮
- 新增顶部世界事件横幅（`WorldEventBanner`），轮播后端 `/world/events/active` 事件
- 新增宠物创建页面（`PetCreatePage`），选择灵兽种族与性格后调用 `POST /characters`
- 新增控制权切换 UI，玩家可一键在「玩家接管 / AI 漫游」间切换，联动后端 `/characters/{id}/controller`
- 改造 [petStore.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/stores/petStore.ts) 接入真实 API，用 WebSocket/SSE 推送宠物位置、状态、日记增量，Phaser 场景通过 EventBus 实时反映后端 tick 结果
- 次级功能（天道回溯、世界线、待办）从主导航降级为抽屉式模态，不占用主视图
- 引入 cosmos 紫色玻璃态视觉主题（Tailwind 配色 + 玻璃态面板 + 星空背景 + 命运等级颜色映射）
- 复用 [EnvironmentFXSystem.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/systems/EnvironmentFXSystem.ts) 做环境事件的视觉反馈

## Capabilities

### New Capabilities
- `immersive-main-layout`: 单页沉浸式三栏主舞台布局——顶部世界事件横幅 + 左栏星宠名册 + 中栏 Phaser 六域地图主舞台 + 右栏状态与漫游志 + 底部状态栏，次级功能降级为抽屉模态
- `realtime-data-sync`: 实时数据流同步——petStore 接入真实 API、WebSocket/SSE 增量推送宠物位置与状态、Phaser 场景通过 EventBus 联动后端 tick 结果
- `pet-roster-panel`: 星宠名册左栏面板——多宠物列表、血条展示、选中高亮、控制权状态标记、召唤入口
- `pet-creation-flow`: 宠物创建流程——种族选择、性格配置、预览、提交后端创建并跳转主舞台
- `cosmos-visual-theme`: cosmos 紫色玻璃态视觉主题——Tailwind 配色体系、玻璃态面板样式、星空背景、命运等级与心情颜色映射、复用环境事件粒子特效

### Modified Capabilities
<!-- 无现有主规格，所有能力均为新增 -->

## Impact

- **前端路由**: [App.tsx](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/App.tsx) 路由结构重构，`/` 成为沉浸式主舞台，次级功能改为模态路由
- **前端状态**: [petStore.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/stores/petStore.ts) 从静态数据改为 API 驱动 + 实时推送，新增宠物列表与选中状态管理
- **前端组件**: 新增 `MainLayout`、`PetListPanel`、`WorldEventBanner`、`PetCreatePage`、`ControlSwitchButton`；改造 `CharacterStatus`、`DiaryTimeline` 适配三栏布局
- **Phaser 集成**: [GameEngine.tsx](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/GameEngine.tsx) 作为中栏主舞台，通过 [eventBus.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/eventBus.ts) 与 React 面板双向通信
- **样式系统**: 引入 Tailwind cosmos/jade/gold 配色主题与玻璃态工具类
- **后端依赖**: 复用现有 `GET /characters`、`POST /characters`、`POST /characters/{id}/controller`、`GET /world/events/active`、WebSocket `/ws/{user_id}` 接口，无需后端改动
- **参考资源**: [template-react-ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/资源/参考游戏/template-react-ts) 的 EventBus 模式与 PhaserGame ref 转发模式可借鉴，但不整体替换 Vite 项目
