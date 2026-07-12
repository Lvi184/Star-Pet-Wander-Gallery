## ADDED Requirements

### Requirement: WorldlineBranch创建
系统SHALL在回溯时创建新的WorldlineBranch，而非简单回滚数据库。

#### Scenario: 创建新世界线
- **WHEN** 用户触发天道回溯
- **THEN** 系统创建新的WorldlineBranch，分配新的branch_id

#### Scenario: 恢复到Checkpoint
- **WHEN** 回溯执行
- **THEN** 系统恢复角色到Checkpoint状态，使用新分支种子重新演算

### Requirement: 旧分支保留为命运回响
系统SHALL将旧分支保留为"命运回响"摘要，供用户回顾。

#### Scenario: 命运回响生成
- **WHEN** 创建新世界线后
- **THEN** 系统为旧分支生成"命运回响"摘要

#### Scenario: 查看命运回响
- **WHEN** 用户查看天道页面
- **THEN** 系统显示所有历史分支的命运回响

### Requirement: 回溯限制
系统SHALL限制每天最多1次回溯，消耗天道点数。

#### Scenario: 回溯次数限制
- **WHEN** 用户当天已使用1次回溯
- **THEN** 系统拒绝再次回溯

#### Scenario: 回溯点选择
- **WHEN** 用户选择回溯点
- **THEN** 系统提供"昨日开始"、"重大风险前"、"死亡前最近安全点"三个选项