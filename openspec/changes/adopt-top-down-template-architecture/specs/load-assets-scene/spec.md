## ADDED Requirements

### Requirement: 动态资源加载
系统 SHALL 提供 LoadAssetsScene，支持按需加载地图、图集、图片和字体资源。

#### Scenario: 加载地图资源
- **WHEN** LoadAssetsScene 收到 mapKey 参数
- **THEN** 加载对应地图的 JSON 文件和关联的瓦片集资源

#### Scenario: 加载图集资源
- **WHEN** LoadAssetsScene 收到 atlases 参数
- **THEN** 加载对应图集的 JSON 和 PNG 文件

#### Scenario: 加载图片资源
- **WHEN** LoadAssetsScene 收到 images 参数
- **THEN** 加载对应图片文件

#### Scenario: 加载字体资源
- **WHEN** LoadAssetsScene 收到 fonts 参数
- **THEN** 预加载字体并等待字体加载完成

### Requirement: 资源缓存
系统 SHALL 缓存已加载的资源，避免重复加载。

#### Scenario: 已加载资源跳过
- **WHEN** 尝试加载已存在于缓存中的资源
- **THEN** 跳过加载，直接使用缓存

#### Scenario: 缓存更新
- **WHEN** 资源加载完成
- **THEN** 更新 Zustand store 中的 loadedAssets 状态

### Requirement: 加载进度条
系统 SHALL 在资源加载过程中显示进度条。

#### Scenario: 显示进度条
- **WHEN** LoadAssetsScene 开始加载资源
- **THEN** 显示加载进度条

#### Scenario: 更新进度
- **WHEN** 资源加载进度变化
- **THEN** 更新进度条显示

#### Scenario: 隐藏进度条
- **WHEN** 所有资源加载完成
- **THEN** 销毁进度条并启动下一个场景

### Requirement: 场景切换触发
系统 SHALL 在资源加载完成后自动启动目标场景。

#### Scenario: 直接切换
- **WHEN** 没有字体需要加载时
- **THEN** 立即启动下一个场景

#### Scenario: 等待字体
- **WHEN** 有字体需要加载时
- **THEN** 等待 document.fonts.ready 后启动下一个场景