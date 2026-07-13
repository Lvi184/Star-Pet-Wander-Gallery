## 1. 样式系统基础设施

- [x] 1.1 在 `tailwind.config.js` 新增 cosmos（紫）/jade（玉）/gold（金）三套色阶（50-950）
- [x] 1.2 在 `index.css` 添加 `.glass`、`.glass-dark`、`.glass-fallback` 玻璃态工具类
- [x] 1.3 添加 `.starfield` 星空背景样式（radial-gradient 星点 + 深紫渐变）
- [x] 1.4 添加 `.text-gradient`、`.bar-shine`、命运等级颜色、心情颜色工具类
- [x] 1.5 美化滚动条（4px 宽度、cosmos-800 轨道、cosmos-500 滑块）

## 2. petStore 实时数据流改造

- [x] 2.1 改造 `stores/petStore.ts`，新增 `pets` 列表与 `selected` 选中状态字段
- [x] 2.2 实现 `fetchPets()` 调用 `GET /characters` 拉取宠物列表，默认选中第一只
- [x] 2.3 接入 WebSocket `/ws/{user_id}`，监听 `pet_update` 事件增量更新宠物字段
- [x] 2.4 实现 WebSocket 断连检测、自动重连与 8 秒轮询兜底机制
- [x] 2.5 添加 `error` 与 `loading` 状态，供面板显示连接异常与重试
- [x] 2.6 实现 `switchController(id, mode)` 调用 `POST /characters/{id}/controller`

## 3. EventBus 双向通信打通

- [x] 3.1 扩展 `game/eventBus.ts` 事件类型定义（spawn-pet/move-pet/control-switch/focus-pet/scene-ready/pet-position-update/pet-activity）
- [x] 3.2 在 Phaser GameScene 中订阅 `focus-pet` 事件实现摄像机跟随
- [x] 3.3 在 Phaser GameScene 中订阅 `move-pet` 事件实现宠物精灵平滑移动
- [x] 3.4 在 Phaser GameScene 中订阅 `control-switch` 事件切换 WASD 键盘控制启用/禁用
- [x] 3.5 在 Phaser GameScene 中订阅 `spawn-pet` 事件生成宠物精灵
- [x] 3.6 在 React 侧订阅 `scene-ready` 与 `pet-position-update` 事件

## 4. MainLayout 主舞台布局

- [x] 4.1 创建 `pages/MainLayout/MainLayout.tsx` 组件骨架（顶部/左/中/右/底部五区域）
- [x] 4.2 中栏嵌入 `GameEngine.tsx` 作为 Phaser 地图主舞台
- [x] 4.3 实现左右栏折叠按钮与状态管理，折叠时中栏扩展
- [x] 4.4 实现窄屏（<1024px）自动折叠左右栏，中栏保持最小 640px
- [x] 4.5 创建底部状态栏（区域名称、世界纪元、选中宠物、署名）
- [x] 4.6 重构 `App.tsx` 路由：`/` 指向 MainLayout，`/create` 指向 PetCreatePage
- [x] 4.7 旧路由（/explore /worldline /diary /map /interact /todo）重定向到 `/`

## 5. 星宠名册左栏面板

- [x] 5.1 创建 `components/PetListPanel/PetListPanel.tsx`
- [x] 5.2 渲染宠物列表项（种族 emoji、名称、血条、控制权标记），按 created_at 降序
- [x] 5.3 实现血条颜色随 health 变化（>60 绿、30-60 黄、<30 红）与 700ms 过渡动画
- [x] 5.4 实现选中高亮（边框 + 背景）与 onClick 回调更新 petStore.selected
- [x] 5.5 实现死亡宠物 50% 透明度 + 「已逝」标记 + 不可选中
- [x] 5.6 实现控制权标记实时更新（WebSocket 推送 controller_type 变化时）
- [x] 5.7 顶部「+ 召唤」按钮导航到 `/create`
- [x] 5.8 空状态引导（🌌 还没有星宠 + 召唤第一只按钮）

## 6. 顶部世界事件横幅

- [x] 6.1 创建 `components/WorldEventBanner/WorldEventBanner.tsx`
- [x] 6.2 调用 `GET /world/events/active` 拉取活跃事件，30 秒轮询刷新
- [x] 6.3 实现 4 秒轮播切换事件（名称 + 描述），右侧显示序号 `1/3`
- [x] 6.4 无活跃事件时横幅隐藏，顶部栏仅显示 Logo 与宠物数量
- [x] 6.5 轮播事件时通过 EventBus 触发 EnvironmentFXSystem 对应粒子效果

## 7. 右栏状态与漫游志整合

- [x] 7.1 改造 `components/CharacterStatus/CharacterStatus.tsx` 适配三栏右栏宽度（新建 RightPanel 替代）
- [x] 7.2 实现命运等级颜色映射（1 灰/2 翠/3 蓝/4 紫/5 金）与命格名称
- [x] 7.3 实现心情 emoji 映射（happy😊/calm😌/excited🤩/sad😢/curious🧐）
- [x] 7.4 实现属性条（生命/心情/灵力）700ms 平滑过渡 + 光泽扫过动画
- [x] 7.5 创建控制权切换按钮（🎮 接管 / 🤖 切换 AI），死亡时禁用
- [x] 7.6 改造 `components/DiaryTimeline/DiaryTimeline.tsx` 适配右栏下半区
- [x] 7.7 宠物未选中时显示「请选择一只宠物」占位

## 8. 宠物创建页

- [x] 8.1 创建 `pages/PetCreate/PetCreatePage.tsx`
- [x] 8.2 实现种族选择卡片网格（狐狸🦊/龙族🐉/凤凰🦅/灵龟🐢 等），含性格描述
- [x] 8.3 实现性格配置步骤（预设标签 + 自定义输入框 50 字限制）
- [x] 8.4 实现侧边宠物预览（种族精灵 + 名称实时更新）
- [x] 8.5 实现名称输入与校验（2-8 字，不符显示错误提示）
- [x] 8.6 实现「召唤」按钮调用 `POST /characters`，加载态防重复提交
- [x] 8.7 创建成功后导航 `/`、刷新列表、选中新宠物、摄像机聚焦
- [x] 8.8 创建失败显示错误提示，按钮恢复可点击
- [x] 8.9 「取消」按钮导航回 `/` 不提交

## 9. 次级功能抽屉化

- [x] 9.1 创建 `components/Drawer/Drawer.tsx` 通用抽屉容器（右侧滑出 + 遮罩 + 关闭）
- [x] 9.2 主舞台右上角添加图标按钮组（回溯/世界线/待办）
- [x] 9.3 天道回溯抽屉复用 `components/RewindPanel/RewindPanel.tsx`
- [x] 9.4 世界线抽屉复用 `pages/Worldline/Worldline.tsx` 内容
- [x] 9.5 待办抽屉复用 `pages/Todo/TodoPage.tsx` 内容
- [x] 9.6 绑定快捷键（R=回溯、W=世界线、T=待办），输入框聚焦时禁用

## 10. 视觉降级与性能

- [x] 10.1 实现运行时检测 `navigator.hardwareConcurrency` 与 `deviceMemory`，低端设备降级 `.glass-fallback`
- [x] 10.2 验证 EnvironmentFXSystem 粒子在 WorldEventBanner 轮播时正确触发与停止
- [x] 10.3 验证 WebGL 优化在六域分块加载下的帧率（WebGLOptimizerPlugin）

## 11. 清理与验证

- [x] 11.1 删除旧 `pages/Home/Home.tsx` 及其硬编码假数据
- [x] 11.2 删除 `App.tsx` 中的多页面 nav 导航与旧路由
- [x] 11.3 端到端验证：启动后端 + 前端，确认主舞台三栏渲染、WebSocket 推送、控制权切换、宠物创建全流程可用
- [ ] 11.4 回滚验证：确认 git 提交粒度允许回滚到多页面导航版本
- [x] 11.5 运行 `openspec validate add-immersive-mainstage-ui` 验证变更完整性
