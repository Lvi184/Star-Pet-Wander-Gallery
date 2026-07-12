## Context

当前项目使用 React + Phaser.js 构建游戏探索界面，已实现基本的玩家移动、场景切换和 NPC 对话功能。参考项目 `top-down-react-phaser-game-template` 提供了更成熟的架构模式，包括：

1. Zustand 全局状态管理（替代 React refs）
2. sceneHelpers 工具函数分离模式
3. LoadAssetsScene 动态资源加载管线
4. map-object-interaction 地图对象交互系统

当前架构的主要问题：
- 场景类过于庞大，逻辑耦合紧密
- 状态通过 React refs 传递，缺乏统一管理
- 资源加载在每个场景中重复进行
- 缺乏标准化的地图对象交互机制

## Goals / Non-Goals

**Goals:**
- 引入 Zustand 状态管理，统一管理游戏状态
- 创建 sceneHelpers 工具函数，分离场景逻辑
- 实现 LoadAssetsScene，支持按需加载和缓存
- 重构场景类，采用新的架构模式
- 保持现有功能不变（玩家移动、场景切换、NPC 对话）

**Non-Goals:**
- 不修改后端 API
- 不引入新的游戏玩法
- 不重新设计 UI 布局
- 不修改瓦片地图数据

## Decisions

### 1. Zustand 状态管理

**决策：** 使用 Zustand 作为全局状态管理库，替代当前通过 React refs 和 useState 传递数据的方式。

**理由：**
- Zustand 轻量级，学习曲线平缓
- 支持选择器（selectors）模式，性能优化
- 类型安全，适合 TypeScript 项目
- 模板项目已验证此方案的有效性

**状态结构：**
```typescript
{
  heroData: { facingDirection, initialPosition, initialFrame, inventory }
  mapData: { mapKey, tilesets }
  loadedAssets: { fonts, atlases, images, maps, jsons }
  dialog: { messages, action, characterName }
  game: { width, height, zoom, cameraSizeUpdateCallbacks }
}
```

### 2. sceneHelpers 工具函数

**决策：** 创建独立的工具函数模块，分离场景创建、英雄移动、碰撞检测等逻辑。

**理由：**
- 场景类不再臃肿，职责单一
- 工具函数可复用，便于测试
- 代码结构清晰，易于维护

**工具函数清单：**
- handleCreateControls: 创建键盘控制
- handleCreateGroups: 创建游戏对象分组
- handleCreateMap: 创建瓦片地图
- handleCreateHero: 创建玩家精灵
- handleObjectsLayer: 处理地图对象层
- handleConfigureCamera: 配置相机
- handleCreateHeroAnimations: 创建英雄动画
- handleHeroMovement: 管理英雄移动

### 3. LoadAssetsScene 资源加载

**决策：** 实现独立的资源加载场景，支持按需加载和缓存。

**理由：**
- 避免每次场景切换重复加载资源
- 支持加载进度条显示
- 统一资源加载入口，便于管理

**实现方式：**
- 接收 nextScene 和 assets 参数
- 根据 assets 参数加载地图、图集、图片、字体
- 缓存已加载资源到 Zustand store
- 加载完成后自动启动下一个场景

### 4. 场景重构

**决策：** 重写 ForestScene 和 TownScene，采用新的架构模式。

**理由：**
- 与模板项目保持一致的代码风格
- 场景类只负责生命周期管理，具体逻辑委托给工具函数
- 便于后续扩展新场景

**重构策略：**
- 保留现有功能逻辑
- 将逻辑迁移到 sceneHelpers
- 使用 Zustand 获取和更新状态

## Risks / Trade-offs

### 风险：类型转换问题

**风险：** 模板项目是 JavaScript，当前项目是 TypeScript，迁移时可能出现类型错误。

**缓解措施：**
- 为所有工具函数添加 TypeScript 类型定义
- 逐步迁移，每次只修改一个模块
- 运行 TypeScript 检查确保类型正确

### 风险：状态管理冲突

**风险：** Zustand 状态与 Phaser 内部状态可能不一致。

**缓解措施：**
- 将 Phaser 作为视图层，状态唯一来源是 Zustand
- 场景初始化时从 Zustand 读取状态
- 状态变化时通过 Zustand 设置器更新

### 风险：资源加载路径问题

**风险：** 动态 import 资源路径在 Vite 下可能失效。

**缓解措施：**
- 使用模板项目的 asyncLoader 模式
- 确保资源文件在 assets 目录下
- 添加资源存在性检查

### 风险：性能影响

**风险：** Zustand 的选择器可能引入额外开销。

**缓解措施：**
- 使用 memo 优化选择器
- 只在必要时订阅状态变化
- 保持状态结构简单

## Migration Plan

### 阶段 1：依赖安装和基础结构

1. 安装 zustand 和 is-mobile 依赖
2. 创建 Zustand store 和状态定义
3. 创建常量文件

### 阶段 2：工具函数实现

1. 创建 sceneHelpers 工具函数
2. 创建通用工具函数（utils）
3. 创建 Phaser 工具函数

### 阶段 3：资源加载场景

1. 创建 LoadAssetsScene
2. 创建 BootScene
3. 创建 MainMenuScene

### 阶段 4：场景重构

1. 重构 ForestScene
2. 重构 TownScene
3. 更新 GameEngine 组件

### 阶段 5：测试和验证

1. 测试状态管理功能
2. 测试资源加载功能
3. 测试场景切换功能
4. 测试玩家移动和交互功能

## Open Questions

1. 是否需要保留现有的 React UI 组件（背包、通知等），还是迁移到 ReactWrapper 模式？
2. 是否需要实现虚拟游戏手柄（VirtualGamepad）支持移动端？
3. 是否需要实现国际化支持（React Intl）？