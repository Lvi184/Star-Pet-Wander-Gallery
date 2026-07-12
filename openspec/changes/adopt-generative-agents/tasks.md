# Tasks: Adopt Generative Agents Pattern

## Phase 1: Observation System

### Task 1.1: 创建 Observation 数据模型

- 文件: `backend/models/observation.py`
- 描述: 创建 Observation 模型，包含 type、content、importance、context 字段
- 状态: pending

### Task 1.2: 实现 Observation Agent

- 文件: `backend/ai/observation.py`
- 描述: 实现观察生成逻辑，支持6种观察类型，在 World Tick 时触发
- 状态: pending

### Task 1.3: 添加 Observation API 端点

- 文件: `backend/routers/pet.py`
- 描述: 添加 GET/POST /pet/{pet_id}/observations 端点
- 状态: pending

## Phase 2: Memory Stream Enhancement

### Task 2.1: 增强 Memory 模型

- 文件: `backend/models/memory.py`
- 描述: 添加 source_observation_id 字段，支持记忆关联
- 状态: pending

### Task 2.2: 实现记忆流功能

- 文件: `backend/ai/memory.py`
- 描述: 增强记忆流存储、关联检索、时间加权排序
- 状态: pending

### Task 2.3: 添加记忆检索 API

- 文件: `backend/routers/pet.py`
- 描述: 添加按类型、关键词、时间范围检索记忆的端点
- 状态: pending

## Phase 3: Reflection Engine

### Task 3.1: 实现反思引擎

- 文件: `backend/ai/reflection.py`
- 描述: 实现反思生成逻辑，支持4个反思问题模板
- 状态: pending

### Task 3.2: 实现反思触发机制

- 文件: `backend/ai/reflection.py`
- 描述: 实现观察数量、时间、重要事件三种触发条件
- 状态: pending

### Task 3.3: 添加 Reflection API 端点

- 文件: `backend/routers/pet.py`
- 描述: 添加 GET/POST /pet/{pet_id}/reflection 端点
- 状态: pending

## Phase 4: Planning Engine

### Task 4.1: 创建 Plan 数据模型

- 文件: `backend/models/plan.py`
- 描述: 创建 Plan 模型，支持长期/中期/短期规划
- 状态: pending

### Task 4.2: 实现规划引擎

- 文件: `backend/ai/planning.py`
- 描述: 实现基于记忆和反思的规划逻辑，支持多层规划
- 状态: pending

### Task 4.3: 添加 Plan API 端点

- 文件: `backend/routers/pet.py`
- 描述: 添加 GET/POST/PUT /pet/{pet_id}/plans 端点
- 状态: pending

## Phase 5: LangGraph Workflow Integration

### Task 5.1: 重构工作流为 OMRPA

- 文件: `backend/ai/graph.py`
- 描述: 重构 LangGraph 工作流为完整的 OMRPA 流程
- 状态: pending

### Task 5.2: 添加 observation 和 plan 节点

- 文件: `backend/ai/graph.py`
- 描述: 添加 observation、plan、decide_action、execute_action 节点
- 状态: pending

## Phase 6: Frontend Integration

### Task 6.1: 添加观察流组件

- 文件: `frontend/src/components/ObservationFeed.jsx`
- 描述: 展示宠物观察记录的实时流
- 状态: pending

### Task 6.2: 添加计划面板组件

- 文件: `frontend/src/components/PlanPanel.jsx`
- 描述: 展示当前计划和执行进度
- 状态: pending

### Task 6.3: 添加反思查看器组件

- 文件: `frontend/src/components/ReflectionViewer.jsx`
- 描述: 展示反思历史和洞察
- 状态: pending

## Phase 7: Testing & Validation

### Task 7.1: 测试 OMRPA 循环

- 描述: 验证完整的 Observation → Memory → Reflection → Planning → Action 循环
- 状态: pending

### Task 7.2: 验证 API 端点

- 描述: 测试所有新增 API 端点
- 状态: pending

## Task Priority

| Priority | Tasks |
|----------|-------|
| High | 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2 |
| Medium | 2.3, 3.3, 4.3, 6.1, 6.2, 6.3 |
| Low | 7.1, 7.2 |

## Dependencies

- Phase 1 必须先完成（观察是记忆的来源）
- Phase 2 依赖 Phase 1（记忆流存储观察）
- Phase 3 依赖 Phase 2（反思基于记忆）
- Phase 4 依赖 Phase 2 和 Phase 3（规划基于记忆和反思）
- Phase 5 依赖所有后端 Phase
- Phase 6 依赖所有后端 Phase