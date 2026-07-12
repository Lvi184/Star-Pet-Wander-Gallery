## 第一刀：青丘地图 + 灵兽移动

- [ ] 1.1 Fork `top-down-react-phaser-game-template`
- [ ] 1.2 创建青丘Scene（QingQiuScene.ts），使用Kenney森林+草地素材
- [ ] 1.3 实现灵兽精灵（PlayerSprite.ts）
- [ ] 1.4 实现WASD+虚拟摇杆移动
- [ ] 1.5 实现地图碰撞检测

## 第二刀：接后端 + 状态同步

- [ ] 2.1 连接FastAPI后端
- [ ] 2.2 创建Character数据模型（含controller_type、controller_version、health、status、personality六维）
- [ ] 2.3 创建EventRecord模型添加cause_chain字段
- [ ] 2.4 实现角色状态同步（HP/心情/位置）
- [ ] 2.5 创建漫游志页面（RoamingLog.tsx）
- [ ] 2.6 实现事件时间线展示

## 第三刀：控制权切换

- [ ] 3.1 创建PlayerController（玩家在线控制器）
- [ ] 3.2 创建AgentController（AI离线控制器）
- [ ] 3.3 创建ActionResolver（统一动作结算器）
- [ ] 3.4 实现PlayerController调用ActionResolver
- [ ] 3.5 实现AgentController调用ActionResolver
- [ ] 3.6 实现在线/离线状态切换（transitioning中间态）
- [ ] 3.7 实现角色级锁与版本号防并发
- [ ] 3.8 实现"模拟离线"按钮（Demo模式）

## 第四刀：Planner接DeepSeek + AI自主

- [ ] 4.1 添加fate_check节点到LangGraph工作流
- [ ] 4.2 更新Plan节点确保上下文不包含命运等级
- [ ] 4.3 添加control_handover节点（控制权切换）
- [ ] 4.4 实现Planner Agent（不含命运等级）
- [ ] 4.5 实现AI自主决策流程（ActionIntent → Resolver）
- [ ] 4.6 AI自主探索闭环验证

## 第五刀：危险事件 + CauseChain

- [ ] 5.1 创建DeathSystem（死亡叙事系统）
- [ ] 5.2 实现CauseChain生成（风险事件原因链）
- [ ] 5.3 实现死亡判定逻辑（多因素结果）
- [ ] 5.4 实现受伤状态机（normal → injured → critical）
- [ ] 5.5 更新OfflineReport组件展示死亡叙事和CauseChain

## 第六刀：命运系统

- [ ] 6.1 创建DestinySystem（命运系统）
- [ ] 6.2 创建DestinyRecord数据模型（区域命运记录）
- [ ] 6.3 实现每日命运等级生成
- [ ] 6.4 实现Planner上下文隔离（命运等级不泄露给Agent）
- [ ] 6.5 更新explore_step接入命运系统影响事件概率
- [ ] 6.6 创建DestinyDisplay组件（展示区域命运等级）
- [ ] 6.7 更新WorldMap组件显示命运等级和危险警告

## 第七刀：天道回溯

- [ ] 7.1 创建RewindSystem（天道回溯系统）
- [ ] 7.2 创建Checkpoint数据模型（存档点）
- [ ] 7.3 创建WorldlineBranch数据模型（世界线分支）
- [ ] 7.4 实现Checkpoint保存机制
- [ ] 7.5 实现WorldlineBranch创建（回溯时创建新世界线）
- [ ] 7.6 实现命运回响生成（旧分支摘要）
- [ ] 7.7 创建RewindTimeline组件（回溯时间轴选择）
- [ ] 7.8 创建Biography数据模型（传记）

## 第八刀：完整Demo + Agent观察台

- [ ] 8.1 实现三类死亡叙事（牺牲/传说/星空）
- [ ] 8.2 创建AgentObserver组件（展示Planner意图、规则结算、事件引用）
- [ ] 8.3 创建角色操控API（/api/character/{char_id}/action）
- [ ] 8.4 创建命运查询API（/api/destiny/{region_id}）
- [ ] 8.5 创建回溯操作API（/api/rewind/{char_id}）
- [ ] 8.6 创建控制权切换API（/api/character/{char_id}/control）
- [ ] 8.7 创建心跳API（/api/character/{char_id}/heartbeat）
- [ ] 8.8 创建Agent观察台API（/api/agent/observer/{char_id}）
- [ ] 8.9 测试MVP演示脚本（10分钟演示流程）

## 第九刀：数据迁移 + 生产优化

- [ ] 9.1 创建数据迁移脚本将Pet数据迁移到Character
- [ ] 9.2 Pet模型标记deprecated
- [ ] 9.3 更新现有宠物API适配Character模型
- [ ] 9.4 测试Character模型数据迁移
- [ ] 9.5 Docker容器化部署
- [ ] 9.6 服务重启后状态可恢复验证