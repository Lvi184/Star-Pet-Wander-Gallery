## ADDED Requirements

### Requirement: cosmos 配色体系

系统 SHALL 在 Tailwind 配置中新增 cosmos（紫）、jade（玉）、gold（金）三套色阶（50-950），作为主舞台主色调。背景 SHALL 使用 cosmos-950 深紫，文字使用白色与 cosmos-300 紫灰。

#### Scenario: 主舞台应用 cosmos 配色

- **WHEN** MainLayout 渲染
- **THEN** 背景为 cosmos-950，顶部栏与底部栏边框为 cosmos-800，标题文字使用 cosmos 渐变（cosmos-400 到 gold-400）

### Requirement: 玻璃态面板样式

系统 SHALL 提供 `.glass` 与 `.glass-dark` 工具类实现玻璃态面板：半透明背景 + backdrop-filter blur + 紫色边框。所有左栏、右栏、横幅面板 SHALL 应用玻璃态样式。

#### Scenario: 面板叠加在地图上方

- **WHEN** 左栏 PetListPanel 与右栏状态面板渲染在 Phaser 地图上方
- **THEN** 面板背景为 `rgba(30,27,75,0.6)` + 12px backdrop-blur，地图内容透过面板可见

#### Scenario: 低端设备降级为纯色

- **WHEN** 运行时检测到 `navigator.hardwareConcurrency < 4` 或 `deviceMemory < 4`
- **THEN** 面板降级为 `.glass-fallback` 纯色背景（`rgba(15,10,30,0.9)`），移除 backdrop-filter

### Requirement: 星空背景

系统 SHALL 在主舞台底层渲染星空背景，使用 CSS radial-gradient 生成静态星点，不依赖图片资源。

#### Scenario: 主舞台底层显示星空

- **WHEN** MainLayout 挂载
- **THEN** 底层渲染 `.starfield` 伪元素，包含 10 个 radial-gradient 星点与深紫渐变背景，`pointer-events: none` 不拦截交互

### Requirement: 命运等级颜色映射

系统 SHALL 为命运等级（1-5）定义颜色映射：1 灰、2 翠、3 蓝、4 紫、5 金。状态面板中的命运等级显示 SHALL 使用对应颜色。

#### Scenario: 帝命等级显示金色

- **WHEN** 宠物 `destiny_level` 为 5
- **THEN** 状态面板的命运等级标签显示为金色（gold-400），文字为「✦ 帝命命格 Lv.5」

#### Scenario: 平凡等级显示灰色

- **WHEN** 宠物 `destiny_level` 为 1
- **THEN** 状态面板的命运等级标签显示为灰色（gray-400），文字为「✦ 平凡命格 Lv.1」

### Requirement: 心情 emoji 映射

系统 SHALL 为宠物心情状态定义 emoji 映射：happy 😊、calm 😌、excited 🤩、sad 😢、curious 🧐。状态面板与漫游志 SHALL 使用对应 emoji。

#### Scenario: 心情为 happy 时显示笑脸

- **WHEN** 宠物 `mood` 字段为 `happy`
- **THEN** 状态面板头像区显示 😊 emoji

### Requirement: 属性条动画

系统 SHALL 为生命、心情、灵力属性条实现平滑过渡动画，数值变化时宽度在 700ms 内过渡，并叠加光泽扫过动画。

#### Scenario: 生命值变化时属性条平滑过渡

- **WHEN** 宠物 health 从 80 变为 50
- **THEN** 生命条宽度在 700ms 内从 80% 过渡到 50%，过渡期间有光泽扫过效果

### Requirement: 环境事件视觉反馈

系统 SHALL 复用 EnvironmentFXSystem 在 Phaser 场景中渲染环境事件粒子特效，当 WorldEventBanner 轮播到某事件时，中栏地图 SHALL 同步触发对应粒子效果。

#### Scenario: 流星雨事件触发粒子

- **WHEN** WorldEventBanner 轮播到「流星雨」事件
- **THEN** EnvironmentFXSystem 在中栏地图上层渲染流星粒子下落效果，持续至事件轮播结束

### Requirement: 滚动条美化

系统 SHALL 美化所有面板的滚动条：4px 宽度、cosmos-800 轨道、cosmos-500 滑块，hover 时滑块变亮。

#### Scenario: 右栏漫游志滚动

- **WHEN** 漫游志内容超出右栏高度
- **THEN** 显示美化后的滚动条，拖动滑块可滚动查看历史日记
