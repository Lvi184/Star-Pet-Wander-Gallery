## 1. 资源准备

- [x] 1.1 从 AI Town 复制森林地图资源（tilemap.json、rpg-tileset.png）到 public/assets/game/forest/
- [x] 1.2 从 AI Town 复制动画精灵资源到 public/assets/game/forest/sprites/
- [x] 1.3 从 Smallville 复制小镇地图资源（map.json）到 public/assets/game/town/
- [x] 1.4 从 Smallville 复制 8 个瓦片集到 public/assets/game/town/tilesets/
- [x] 1.5 从 Smallville 复制 NPC 精灵图（bob、adam、amelia、alex）到 public/assets/game/town/sprites/
- [x] 1.6 验证所有资源路径和文件名正确性

## 2. 场景基础架构

- [x] 2.1 创建 ForestScene.ts 文件，实现青丘森林场景类
- [x] 2.2 在 ForestScene 中加载 AI Town 瓦片地图和瓦片集
- [x] 2.3 创建 TownScene.ts 文件，实现星宠小镇场景类
- [x] 2.4 在 TownScene 中加载 Smallville 地图和 8 个瓦片集
- [x] 2.5 配置 Phaser 相机跟随玩家角色
- [x] 2.6 配置场景背景颜色和渲染模式

## 3. 玩家角色控制

- [x] 3.1 在 ForestScene 中创建玩家精灵，配置移动动画
- [x] 3.2 实现 WASD 和方向键控制玩家移动
- [x] 3.3 在 TownScene 中创建玩家精灵，配置移动动画
- [x] 3.4 实现玩家移动速度和加速度控制
- [x] 3.5 实现玩家停止时的待机动画

## 4. NPC 系统

- [x] 4.1 在 ForestScene 中添加多个 NPC 和怪物精灵
- [x] 4.2 在 TownScene 中添加 6 个以上 NPC，位置合理分散
- [x] 4.3 配置 NPC 精灵动画（待机、呼吸等）
- [x] 4.4 实现玩家靠近 NPC 时显示对话提示
- [x] 4.5 实现按空格键触发对话框
- [x] 4.6 为每个 NPC 配置独特的对话内容

## 5. 碰撞检测

- [x] 5.1 在 ForestScene 中配置地图碰撞层
- [x] 5.2 实现玩家与地图边界的碰撞检测
- [x] 5.3 实现玩家与建筑物和障碍物的碰撞检测
- [x] 5.4 在 TownScene 中配置地图碰撞层
- [x] 5.5 实现小镇建筑和墙壁的碰撞检测
- [x] 5.6 测试碰撞检测效果，确保无法穿墙

## 6. 场景切换

- [x] 6.1 修改 GameEngine.tsx，使用 forwardRef 暴露 switchScene 方法
- [x] 6.2 在 Explore.tsx 侧边栏添加「星宠小镇」按钮
- [x] 6.3 实现侧边栏按钮点击切换场景
- [x] 6.4 实现 T 键切换到小镇、E 键切换到森林
- [x] 6.5 实现场景切换通知提示
- [x] 6.6 测试场景切换双向功能

## 7. 动画效果

- [x] 7.1 在 ForestScene 中实现篝火燃烧动画
- [x] 7.2 实现风车旋转动画
- [x] 7.3 实现瀑布流动动画
- [x] 7.4 实现星星闪烁动画
- [x] 7.5 在 TownScene 中实现学校旗帜飘动动画
- [x] 7.6 实现蹦床弹跳动画
- [x] 7.7 实现鸽子飞翔动画

## 8. 测试验证

- [x] 8.1 测试青丘森林场景加载和渲染
- [x] 8.2 测试星宠小镇场景加载和渲染
- [x] 8.3 测试玩家移动和动画
- [x] 8.4 测试 NPC 对话交互
- [x] 8.5 测试碰撞检测
- [x] 8.6 测试场景切换功能
- [x] 8.7 测试窗口 resize 自适应
- [x] 8.8 修复发现的问题和 bug