## ADDED Requirements

### Requirement: petStore 接入真实 API

系统 SHALL 改造 petStore，初始化时调用 `GET /characters` 拉取宠物列表，选中宠物时调用 `GET /characters/{id}` 拉取详情。静态硬编码数据 SHALL 移除。

#### Scenario: 应用启动时加载宠物列表

- **WHEN** MainLayout 组件挂载
- **THEN** petStore 调用 `GET /characters`，将返回的宠物列表存入 `pets` 状态，默认选中第一只宠物

#### Scenario: API 请求失败时显示错误状态

- **WHEN** `GET /characters` 请求返回非 2xx 状态码
- **THEN** petStore 设置 `error` 状态，左栏显示「连接异常」提示与重试按钮

### Requirement: WebSocket 增量推送宠物状态

系统 SHALL 通过 WebSocket `/ws/{user_id}` 订阅宠物状态增量推送，收到 `pet_update` 事件时更新 petStore 中对应宠物的 mood、energy、health、current_region 字段。

#### Scenario: 后端 tick 推送宠物状态更新

- **WHEN** 后端世界 tick 完成后通过 WebSocket 推送 `{type: "pet_update", pet_id, mood, energy, current_region, diary}`
- **THEN** petStore 更新对应宠物的字段，若该宠物当前选中则右栏状态面板与中栏地图位置实时刷新

#### Scenario: WebSocket 断连后自动重连与轮询兜底

- **WHEN** WebSocket 连接断开
- **THEN** 系统显示「重连中」提示，启动 8 秒轮询兜底拉取 `GET /characters`，连接恢复后停止轮询并恢复 WebSocket 订阅

### Requirement: EventBus 联动 Phaser 场景

系统 SHALL 通过 EventBus 实现 React 面板与 Phaser 场景的双向通信：React → Phaser 发送 `spawn-pet`、`move-pet`、`control-switch`、`focus-pet` 事件；Phaser → React 发送 `scene-ready`、`pet-position-update`、`pet-activity` 事件。

#### Scenario: 选中宠物后地图摄像机跟随

- **WHEN** 用户在左栏选中一只宠物
- **THEN** React 通过 EventBus 发送 `focus-pet` 事件，Phaser 场景收到后将摄像机聚焦到该宠物位置

#### Scenario: 后端推送新位置后地图移动宠物精灵

- **WHEN** WebSocket 收到 `pet_update` 事件且 `current_region` 发生变化
- **THEN** petStore 通过 EventBus 发送 `move-pet` 事件，Phaser 场景将对应宠物精灵平滑移动到新区域

### Requirement: 控制权切换实时同步

系统 SHALL 在用户切换控制权后，通过 EventBus 通知 Phaser 场景切换交互模式：`player` 模式启用 WASD 控制，`agent` 模式禁用键盘控制由 AI 驱动移动。

#### Scenario: 切换到玩家接管模式

- **WHEN** 用户点击右栏「🎮 接管控制」按钮，调用 `POST /characters/{id}/controller` 成功
- **THEN** petStore 更新 `controller_type` 为 `player`，EventBus 发送 `control-switch` 事件，Phaser 场景启用键盘控制，右栏按钮变为「🤖 切换 AI」

#### Scenario: 宠物死亡时禁用控制权切换

- **WHEN** 宠物 `status` 为 `dead`
- **THEN** 控制权切换按钮禁用，显示灰色「已逝」状态，不响应点击
