## ADDED Requirements

### Requirement: NPC 对话触发
系统 SHALL 在玩家靠近 NPC 时显示对话提示，按空格键触发对话。

#### Scenario: 靠近 NPC 显示提示
- **WHEN** 玩家角色靠近 NPC（距离小于设定阈值）
- **THEN** 屏幕上方显示对话提示文字和空格键图标

#### Scenario: 按空格触发对话
- **WHEN** 玩家在对话提示显示时按下空格键
- **THEN** 弹出对话框，显示 NPC 的对话内容

### Requirement: 对话框显示
系统 SHALL 以美观的对话框形式显示 NPC 的对话内容，支持多行文本。

#### Scenario: 对话框样式
- **WHEN** 对话触发
- **THEN** 屏幕底部显示半透明背景的对话框，包含 NPC 名称和对话内容

#### Scenario: 多行对话
- **WHEN** NPC 对话内容超过一行
- **THEN** 对话框自动换行显示所有内容

### Requirement: 对话内容管理
系统 SHALL 为每个 NPC 配置独特的对话内容，体现角色个性。

#### Scenario: 不同 NPC 不同对话
- **WHEN** 玩家与不同 NPC 对话
- **THEN** 每个 NPC 显示独特的对话内容

#### Scenario: 随机对话
- **WHEN** 玩家多次与同一 NPC 对话
- **THEN** NPC 可能显示不同的对话内容

### Requirement: 对话关闭
系统 SHALL 在玩家再次按空格键或移动远离 NPC 时关闭对话框。

#### Scenario: 按空格关闭
- **WHEN** 对话框显示时玩家按下空格键
- **THEN** 对话框关闭

#### Scenario: 移动关闭
- **WHEN** 玩家角色移动远离 NPC
- **THEN** 对话框自动关闭