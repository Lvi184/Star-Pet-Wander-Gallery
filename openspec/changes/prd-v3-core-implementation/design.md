## Context

当前项目已实现基础的宠物行为循环、离线探险、日记生成等功能，技术栈为 FastAPI + SQLite + SQLAlchemy + LangGraph/SimpleGraph + DeepSeek API。但缺少《星宠漫游馆_专业PRD_v3.0_完整版》定义的核心架构能力：Character统一角色模型、统一Action Resolver、命运系统、风险事件链、死亡叙事机制、天道回溯系统、控制权切换与会话心跳。

**PRD 基线**: 星宠漫游馆_专业PRD_v3.0_完整版.docx
**核心定位**: AI数字生命游戏 —— 一个持续运行的山海世界，每只灵兽都是拥有自主意识的数字生命

## Goals / Non-Goals

**Goals:**
- 实现Character模型替换Pet模型，支持player/agent/transitioning三种控制类型
- 实现统一Action Resolver，确保玩家和AI动作一致结算
- 实现命运系统，玩家可见命运等级，Planner不可见（信息隔离）
- 实现风险事件链和CauseChain可追溯原因
- 实现死亡叙事机制，死亡是叙事节点而非游戏失败
- 实现天道回溯系统，创建WorldlineBranch，旧分支保留为命运回响
- 实现控制权切换与会话心跳机制
- 实现Agent观察台，向评委展示非随机AI行为

**Non-Goals:**
- 战斗系统完整实现（MVP后置）
- 修炼系统完整实现（MVP后置）
- 社交系统完整实现（NPC社交已实现，玩家-玩家社交后置）
- 完整的前端UI/UX设计（只实现核心功能组件）
- 生产环境部署优化（Docker、性能优化等）

## Decisions

### Decision 1: Character模型设计
**选择**: 创建新的Character模型，Pet模型标记deprecated并提供迁移路径
**理由**: 
- Character模型需要新增controller_type、controller_version、health、status等字段
- 直接修改Pet模型会破坏现有API兼容性
- 保留Pet模型可平滑迁移现有数据
**替代方案**: 
- 直接修改Pet模型：风险高，可能破坏现有功能
- 创建并行模型：维护成本高

### Decision 2: Action Resolver实现
**选择**: 创建独立的ActionResolver服务，PlayerController和AgentController都调用它
**理由**: 
- 确保玩家和AI动作经过同一结算逻辑
- 所有变更都生成EventRecord，支持状态追溯
- 便于后续扩展规则引擎
**替代方案**: 
- 各自实现结算逻辑：状态不一致风险
- 继承共享基类：耦合度高

### Decision 3: 命运系统隔离
**选择**: DestinySystem作为独立服务，Planner调用时不传递命运等级
**理由**: 
- PRD明确要求：Planner不得接收区域命运等级
- 制造玩家与灵兽的信息差，增加守护意义
- 命运等级只在前端展示和事件概率计算时使用
**替代方案**: 
- 传递命运等级但标记为不可见：风险高，可能泄露
- 命运系统嵌入规则引擎：耦合度高

### Decision 4: WorldlineBranch实现
**选择**: 使用branch_id区分不同世界线，Checkpoint保存完整状态快照
**理由**: 
- 不是简单数据库回滚，而是创建新世界线
- 旧分支保留为命运回响，供用户回顾
- 支持多轮回溯，每条世界线独立演化
**替代方案**: 
- 数据库快照：恢复成本高，不支持并行世界线
- 事件重放：计算复杂，不保证确定性

### Decision 5: 控制权切换
**选择**: 使用transitioning中间态+version号防并发
**理由**: 
- 防止AI和玩家同时操作同一角色
- transitioning状态确保安全交接
- version号检测并发冲突
**替代方案**: 
- 直接切换：并发风险
- 锁机制：性能开销大

### Decision 6: Agent观察台实现
**选择**: 前端组件+后端日志记录，实时展示决策链路
**理由**: 
- 向评委证明AI行为不是随机生成
- 展示Planner意图、规则结算、事件引用
- 可作为调试工具使用
**替代方案**: 
- 纯后端日志：不便于实时观察
- 纯前端模拟：不真实

## Risks / Trade-offs

### Risk 1: 数据迁移风险
[风险] Character模型替换Pet模型可能导致数据丢失
→ **缓解**: 保留Pet模型，创建迁移脚本，测试环境验证

### Risk 2: 命运信息泄露
[风险] Planner可能间接获取命运等级信息
→ **缓解**: 严格控制Planner输入上下文，不包含命运字段；代码审查确认

### Risk 3: 回溯性能问题
[风险] 大量世界线分支可能导致数据库膨胀
→ **缓解**: 限制每日回溯次数；定期清理旧分支；只保留命运回响摘要

### Risk 4: 并发控制问题
[风险] 控制权切换过程中可能出现竞态条件
→ **缓解**: 使用transitioning中间态；version号递增；数据库事务保护

### Risk 5: LLM调用成本
[风险] 频繁的Planner/Reflection/Narrative调用可能导致API费用过高
→ **缓解**: 规则Tick与叙事Tick分离；限制每日LLM调用次数；Demo模式降低频率

## Migration Plan

### 步骤1: 数据模型迁移
- 创建Character、DestinyRecord、Checkpoint、WorldlineBranch、Biography模型
- 创建迁移脚本将Pet数据迁移到Character
- Pet模型标记deprecated

### 步骤2: 控制器层实现
- 创建PlayerController和AgentController
- 创建ActionResolver统一结算器
- 测试玩家和AI动作一致性

### 步骤3: 世界引擎增强
- 创建DestinySystem（含Planner隔离）
- 创建RewindSystem（WorldlineBranch）
- 创建DeathSystem（CauseChain+死亡叙事）

### 步骤4: LangGraph工作流更新
- 添加fate_check节点
- Plan节点上下文隔离命运等级
- 测试完整工作流

### 步骤5: 前端组件实现
- 创建AgentObserver组件
- 创建DestinyDisplay组件
- 创建RewindTimeline组件
- 更新现有组件适配Character模型

### 步骤6: API端点更新
- 新增角色操控API
- 新增命运查询API
- 新增回溯操作API
- 更新现有API适配Character模型

### 回滚策略
- 保留Pet模型和旧API端点
- 配置开关控制新旧系统切换
- 数据库备份前进行迁移

## Open Questions

1. 人格六维属性的初始值范围和影响权重需要进一步细化
2. 风险事件链的具体概率计算规则需要确定
3. 回溯点的具体时间间隔和数量需要确定
4. Agent观察台的UI设计细节需要用户确认