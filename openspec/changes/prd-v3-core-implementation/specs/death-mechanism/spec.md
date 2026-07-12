## ADDED Requirements

### Requirement: 三类死亡叙事
系统SHALL实现三类死亡表现：牺牲故事、传说故事、星空故事。

#### Scenario: 牺牲死亡
- **WHEN** 角色因救援行为死亡
- **THEN** 系统生成牺牲故事叙事，强调行为意义

#### Scenario: 传说死亡
- **WHEN** 角色是长期著名探险者
- **THEN** 系统生成传说故事叙事，强调世界留下痕迹（墓碑）

#### Scenario: 星空死亡
- **WHEN** 角色是普通生命
- **THEN** 系统生成星空故事叙事，强调温柔告别（化作星星）

### Requirement: 死亡页面流程
系统SHALL实现死亡页面流程：讲述发生了什么 → 说明可追溯原因 → 提供选择（回溯/阅读最后一天）。

#### Scenario: 死亡页面展示
- **WHEN** 角色死亡
- **THEN** 页面展示死亡叙事、CauseChain、回溯选项

#### Scenario: 回溯选择
- **WHEN** 用户选择回溯
- **THEN** 系统触发RewindSystem创建新世界线

### Requirement: 死亡不是游戏失败
系统SHALL将死亡视为叙事节点，而非游戏结束。

#### Scenario: 死亡后可回溯
- **WHEN** 角色死亡
- **THEN** 用户仍可使用天道回溯改变命运