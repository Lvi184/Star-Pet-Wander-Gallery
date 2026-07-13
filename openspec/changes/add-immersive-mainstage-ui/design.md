## Context

项目「星宠漫游馆」定位为自主生命体（Autonomous Digital Life），后端已完整实现 LangGraph 工作流、Character 双控制器（PlayerController/AgentController）、命运系统、天道回溯、死亡叙事、六域图论结构、资源引力场、环境事件池、灵兽社交网络等核心能力。

当前前端采用传统多页面导航（[App.tsx](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/App.tsx) 含 7 个 nav 项：首页/探索/世界线/日记/地图/互动/待办），导致：
- 核心卖点「灵兽在六域自主漫游」散落在不同页面，无法一眼看到
- [Home.tsx](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/pages/Home/Home.tsx) 大量硬编码假数据，依赖 `/assets` 图片资源
- Phaser 地图在 `/map` 独立页面，与状态面板、漫游志割裂
- 丰富的后端能力（环境事件、社交网络、引力场）无可视化出口

技术栈：React 18 + TypeScript + Vite + Phaser 3 + Zustand + Tailwind CSS。已有资产包括 [GameEngine.tsx](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/GameEngine.tsx)、[eventBus.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/eventBus.ts)、[RealmChunkManager.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/systems/RealmChunkManager.ts)、[EnvironmentFXSystem.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/systems/EnvironmentFXSystem.ts) 等。

参考资源：已克隆 [phaserjs/template-react-ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/资源/参考游戏/template-react-ts) 官方模板，其 EventBus 双向通信模式与 PhaserGame ref 转发模式可借鉴。

## Goals / Non-Goals

**Goals:**
- 将前端重构为单页沉浸式三栏主舞台，Phaser 六域地图成为中栏主舞台
- 打通实时数据流：petStore 接真实 API，WebSocket/SSE 推送增量，Phaser 场景通过 EventBus 联动
- 补齐缺失组件：星宠名册、世界事件横幅、宠物创建页、控制权切换 UI
- 统一 cosmos 紫色玻璃态视觉主题
- 复用现有前端资产（GameEngine、EventBus、各 systems、各组件），不推倒重来
- 让比赛演示时「自主生命体在六域漫游」的体验即时成立

**Non-Goals:**
- 不改动后端代码（复用现有 API 与 WebSocket 接口）
- 不整体替换 Vite 项目结构为 phaserjs/template-react-ts 模板
- 不引入新的 UI 框架（继续用 React + Tailwind，不引入 MUI）
- 不实现移动端适配（聚焦桌面端沉浸式体验）
- 不重写 Phaser 场景逻辑（复用现有 GameScene / RealmChunkManager）
- 不实现完整的离线报告回放（保留 OfflineReport 组件但不在主舞台展示）

## Decisions

### 决策 1：单页三栏布局而非多页面导航

**选择**：将 [App.tsx](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/App.tsx) 重构为单页 `MainLayout`，采用「顶部横幅 + 左栏名册 + 中栏地图 + 右栏状态日记 + 底部状态栏」布局。

**理由**：自主生命体的核心体验是「看到宠物在世界里活着」，多页面导航会割裂这一体验。三栏布局让地图、状态、日记同时可见，符合 AI Town、Generative Agents 论文中的「观察世界」交互范式。

**备选方案**：
- 保持多页面但加全局状态栏 → 仍需切换页面才能看地图，体验割裂
- 双栏（地图 + 侧边面板）→ 名册无处安放，多宠物切换困难

### 决策 2：复用 GameEngine 作为中栏，通过 EventBus 双向通信

**选择**：中栏直接嵌入现有 [GameEngine.tsx](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/GameEngine.tsx)，通过 [eventBus.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/game/eventBus.ts) 与 React 面板通信。

**理由**：GameEngine 已集成 RealmChunkManager（六域分块加载）、SocialFlockingSystem（社交力引导）、GravityRenderSystem（引力线渲染）、EnvironmentFXSystem（环境粒子）、WebGLOptimizerPlugin（渲染优化），无需重写。借鉴 template-react-ts 的 EventBus 模式即可打通双向通信。

**备选方案**：
- 新写一个轻量 Scene 只画六域节点图 → 丢失现有渲染优化与社交/引力可视化
- 用 React 重画地图 → 性能差，丢失 Phaser 物理与粒子能力

### 决策 3：petStore 改为 API 驱动 + WebSocket 增量推送

**选择**：改造 [petStore.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/stores/petStore.ts)，初始化时拉取 `GET /characters` 列表，WebSocket 推送 `pet_update` 事件增量更新状态，轮询作为兜底（8s）。

**理由**：后端已有 [websocket_manager.py](file:///e:/兴趣/全民宠物（星宠漫游馆）/backend/services/websocket_manager.py) 和 `/ws/{user_id}` 接口，以及 [useSSE.ts](file:///e:/兴趣/全民宠物（星宠漫游馆）/frontend/src/hooks/useSSE.ts) hook。WebSocket 增量推送比纯轮询实时性高、开销低。

**备选方案**：
- 纯轮询（8s）→ 实时性差，宠物移动有明显延迟
- 纯 SSE → 单向推送，无法承载控制权切换等双向操作

### 决策 4：次级功能降级为抽屉模态

**选择**：天道回溯、世界线、待办等功能从主导航移除，改为通过主舞台右上角图标按钮触发的抽屉/模态。

**理由**：这些功能属于「偶发查看」而非「持续观察」，占据主导航会分散注意力。抽屉模态保留访问入口但不干扰主舞台沉浸感。

**备选方案**：
- 保留在次级导航栏 → 占用屏幕空间，破坏沉浸感
- 完全删除入口 → 功能不可达

### 决策 5：cosmos 紫色玻璃态主题，Tailwind 配置实现

**选择**：在 Tailwind 配置中新增 cosmos（紫）/jade（玉）/gold（金）三套色阶，配合 `.glass` / `.glass-dark` 工具类实现玻璃态面板。

**理由**：项目世界观为「山海灵境」，紫金色系契合星空与灵气主题。玻璃态（backdrop-filter blur）能在 Phaser 地图上方叠加面板而不完全遮挡地图，增强空间纵深感。

**备选方案**：
- 沿用现有 clay/brown 像素风 → 与 Phaser 六域渲染风格冲突
- 引入 MUI 主题 → 增加 bundle 体积，与 Tailwind 并存混乱

## Risks / Trade-offs

- **[风险] 三栏布局在窄屏下拥挤** → 中栏地图设最小宽度，左右栏可折叠；Non-Goal 已声明不适配移动端
- **[风险] WebSocket 断连导致状态停滞** → 轮询兜底（8s），断连时显示「重连中」提示，恢复后自动同步
- **[风险] petStore 重构破坏现有组件依赖** → 保持 store 的公开 API 形状（currentPet、roamingLogs 等），新增字段而非删除；逐步迁移组件
- **[权衡] 玻璃态 backdrop-filter 在低端设备性能差** → 提供 `.glass-fallback` 纯色降级，通过 CSS 媒体查询或运行时检测切换
- **[权衡] 次级功能降级为模态后可达性降低** → 抽屉入口放右上角显著位置，配快捷键（如 R 打开回溯）
- **[风险] Home.tsx 硬编码资源路径迁移后失效** → 逐步替换为程序化生成贴图或 API 数据，保留旧资源路径作降级

## Migration Plan

1. **阶段 1（主舞台）**：新建 `MainLayout.tsx`，先不删除旧页面路由，新旧并存直到主舞台可用
2. **阶段 2（数据流）**：改造 petStore，添加 API 调用与 WebSocket 订阅，旧静态数据保留为 fallback
3. **阶段 3（补组件）**：新增 PetListPanel、WorldEventBanner、PetCreatePage、ControlSwitchButton
4. **阶段 4（视觉）**：引入 cosmos 主题，逐步替换现有组件样式，最后删除旧 Home.tsx 与多页面导航

**回滚策略**：每阶段独立提交，若主舞台出现问题，回滚路由到旧 App.tsx 即可恢复多页面导航。

## Open Questions

- 宠物创建页是否需要支持「上传自定义外观」？当前假设仅选择预设种族，外观由后端生成
- 抽屉模态的快捷键映射是否需要可配置？当前假设固定快捷键（R=回溯，W=世界线，T=待办）
- 玻璃态降级阈值如何判定？当前假设通过 `navigator.hardwareConcurrency` 与 `deviceMemory` 启发式判断
