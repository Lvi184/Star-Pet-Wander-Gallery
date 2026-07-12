# Web UI - Spec

## ADDED Requirements

### Requirement: 宠物动画状态机

系统 SHALL 实现宠物动画状态机，支持 idle、walking、exploring、sleeping、eating、happy、sad 等多种状态，每种状态有对应的动画效果。

#### Scenario: idle 状态动画
```
Given 宠物无操作
When 进入 idle 状态
Then 播放轻微呼吸动画
And 尾巴摆动动画
```

#### Scenario: walking 状态动画
```
Given 宠物移动中
When 进入 walking 状态
Then 播放走路循环动画
And 移动到目标位置
```

#### Scenario: sleeping 状态动画
```
Given 宠物精力 < 20
When 进入 sleeping 状态
Then 播放闭眼睡觉动画
And 轻微鼾声效果
```

#### Scenario: happy 状态动画
```
Given 宠物心情 > 80
When 进入 happy 状态
Then 播放跳跃动画
And 转圈动画
```

#### Scenario: sad 状态动画
```
Given 宠物心情 < 30
When 进入 sad 状态
Then 播放垂头丧气动画
And 眼泪汪汪效果
```

### Requirement: 状态面板

系统 SHALL 实现状态面板，实时显示宠物的心情、精力、位置和当前行为，支持动态更新。

#### Scenario: 实时显示心情条
```
Given 宠物心情变化
When 状态面板更新
Then 心情条颜色从红到绿变化
And 数值实时更新
```

#### Scenario: 实时显示精力条
```
Given 宠物精力变化
When 状态面板更新
Then 精力条颜色从黄到蓝变化
And 数值实时更新
```

#### Scenario: 显示当前位置和状态
```
Given 宠物位置或状态变化
When 状态面板更新
Then 显示当前区域名称
And 显示当前行为描述
```

### Requirement: 事件日志

系统 SHALL 实现事件日志组件，展示宠物近期发生的事件，按时间倒序排列，支持点击查看详情。

#### Scenario: 展示近期事件
```
Given 宠物发生新事件
When 事件日志更新
Then 事件按时间倒序排列
And 显示图标、地点、时间
And 支持点击查看详情
```

### Requirement: 日记时间线

系统 SHALL 实现日记时间线组件，按时间线展示宠物日记，支持日历视图选择日期，点击卡片查看完整日记。

#### Scenario: 日历视图选择日期
```
Given 用户选择日期
When 日历视图更新
Then 高亮选中日期
And 显示该日期的日记列表
```

#### Scenario: 日记卡片展示
```
Given 宠物存在日记记录
When 日记时间线渲染
Then 展示日记标题、心情标签、预览内容
And 支持点击查看完整日记
```

## MODIFIED Requirements

### Requirement: 现有前端组件

现有前端组件 MUST 优化宠物展示动画，参考 StarPet 前端设计，提升动画效果流畅度和状态切换自然度。

#### Scenario: 优化宠物展示动画
```
Given 参考 StarPet 前端设计
When 优化宠物展示组件
Then 动画效果更流畅
And 状态切换更自然
And 用户体验提升
```