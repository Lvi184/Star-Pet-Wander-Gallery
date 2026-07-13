## ADDED Requirements

### Requirement: 星宠名册列表展示

系统 SHALL 在左栏显示星宠名册面板，列出所有宠物（来自 `GET /characters`），每项显示种族 emoji、名称、生命值血条、控制权状态标记。当前选中宠物 SHALL 高亮显示。

#### Scenario: 展示宠物列表

- **WHEN** petStore 加载完成 `pets` 列表
- **THEN** 左栏渲染每个宠物项，按 `created_at` 降序排列，每项包含种族 emoji、名称、生命值血条（颜色随 health 变化：>60 绿、30-60 黄、<30 红）、控制权标记（🎮 玩家控制 / 🤖 AI 漫游）

#### Scenario: 选中宠物高亮

- **WHEN** 用户点击列表中某只宠物
- **THEN** 该项添加高亮边框与背景，petStore 更新 `selected` 状态，右栏与中栏同步切换到该宠物

#### Scenario: 死亡宠物半透明显示

- **WHEN** 宠物 `status` 为 `dead`
- **THEN** 列表项以 50% 透明度渲染，名称后追加「已逝」标记，不可选中

### Requirement: 召唤新宠物入口

系统 SHALL 在名册顶部提供「+ 召唤」按钮，点击后导航到 `/create` 宠物创建页。

#### Scenario: 点击召唤按钮跳转创建页

- **WHEN** 用户点击「+ 召唤」按钮
- **THEN** 系统导航到 `/create` 路由，显示 PetCreatePage

### Requirement: 空状态引导

系统 SHALL 在宠物列表为空时显示空状态引导，提示召唤第一只宠物。

#### Scenario: 无宠物时显示引导

- **WHEN** `pets` 列表为空且非加载中
- **THEN** 左栏显示「🌌 还没有星宠」提示与「召唤第一只」按钮，点击跳转 `/create`

### Requirement: 控制权状态实时标记

系统 SHALL 在列表项上实时反映控制权变化，当 WebSocket 推送 `controller_type` 变化时立即更新标记。

#### Scenario: AI 接管后标记更新

- **WHEN** WebSocket 推送某宠物 `controller_type` 从 `player` 变为 `agent`
- **THEN** 列表项的控制权标记从 🎮 变为 🤖，无需刷新页面

### Requirement: 血条颜色随生命值变化

系统 SHALL 根据宠物 `health` 值动态渲染血条颜色：>60 绿色、30-60 黄色、<30 红色，数值变化时 SHALL 有过渡动画。

#### Scenario: 生命值下降触发颜色变化

- **WHEN** WebSocket 推送宠物 health 从 70 降至 25
- **THEN** 血条颜色从绿色过渡到红色，宽度在 700ms 内平滑收缩到 25%
