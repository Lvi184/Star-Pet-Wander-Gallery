## Why

当前项目已实现基础的宠物行为循环、离线探险、日记生成等功能，但缺少《星宠漫游馆_专业PRD_v3.0_完整版》定义的核心架构能力：Character统一角色模型、统一Action Resolver、命运系统（含Planner隔离）、风险事件链、死亡叙事机制、天道回溯系统、控制权切换与会话心跳。这些是实现"AI数字生命游戏"定位的关键，也是MVP演示的必要条件。

## What Changes

- **BREAKING** 将Pet模型升级为Character模型（PRD 15.3节），支持玩家/AI无缝切换
- 实现统一Action Resolver（PRD 9.1节），确保玩家和AI动作一致结算
- 实现PlayerController和AgentController（PRD 9.2-9.3节）
- 实现命运系统（PRD 10.1-10.2节），玩家可见命运等级，Planner不可见
- 实现风险事件链（PRD 10.3节），生成CauseChain可追溯原因
- 实现死亡叙事机制（PRD 10.4节），死亡是叙事节点而非游戏失败
- 实现天道回溯系统（PRD 10.5节），创建WorldlineBranch，旧分支保留为命运回响
- 实现控制权切换与会话心跳（PRD 9.1、9.4节）
- 实现Agent观察台（PRD 16.3节），向评委展示非随机AI行为

## Capabilities

### New Capabilities

- `character-model`: Character统一角色模型，替代Pet模型，支持controller_type、controller_version、health等字段（PRD 15.3节）
- `action-resolver`: 统一动作结算器，所有玩家和AI动作经过同一结算器生成EventRecord（PRD 9.1节）
- `destiny-system`: 命运系统，每日为区域生成命运等级，玩家可见，Planner不可见（PRD 10.1-10.2节）
- `risk-event-chain`: 风险事件链，生成CauseChain，支持受伤、死亡等多因素判定（PRD 10.3节）
- `death-mechanism`: 死亡叙事机制，三类死亡表现（牺牲/传说/星空）及死亡页面流程（PRD 10.4节）
- `rewind-system`: 天道回溯系统，基于WorldlineBranch创建新世界线，旧分支保留为命运回响（PRD 10.5节）
- `control-switch`: 控制权切换机制，支持player/agent/transitioning状态和会话心跳（PRD 9.1、9.4节）
- `agent-observer`: Agent观察台，展示Planner意图、规则结算、事件引用，证明AI行为非随机（PRD 16.3节）

### Modified Capabilities

- `langgraph-workflow`: 工作流需添加fate_check节点，确保Planner上下文不包含命运等级（PRD 10.1节约束）
- `memory-persistence`: 记忆系统需支持milestone标记和relationship关联（PRD 13.7节）
- `offline-exploration`: 离线探险需接入命运系统影响事件概率权重（PRD 10.2节）

## Impact

- **数据模型**: 新增Character、DestinyRecord、Checkpoint、WorldlineBranch、Biography等模型，Pet模型标记deprecated
- **控制器层**: 新增PlayerController、AgentController、ActionResolver
- **服务层**: 新增DestinySystem、RewindSystem、DeathSystem
- **LangGraph**: 工作流添加fate_check节点，Plan节点上下文隔离命运等级
- **前端**: 新增AgentObserver、DestinyDisplay、RewindTimeline组件
- **API**: 新增角色操控、命运查询、回溯操作等端点