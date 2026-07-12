# Proposal: Adopt Generative Agents Pattern

## Summary

引入 Stanford University Generative Agents 的核心流程 **Observation → Memory → Reflection → Planning → Action**，让宠物具备完整的感知-记忆-反思-规划-行动能力，实现更真实的自主行为模拟。

## Motivation

当前项目已实现基础的记忆系统和日程系统，但缺少 Generative Agents 特有的：
- **Observation**：主动感知环境变化和事件
- **Memory Stream**：按时间顺序的记忆流，支持检索和关联
- **Reflection**：从记忆中提炼更高层次的见解（不仅仅是总结）
- **Planning**：基于记忆和反思的目标导向规划
- **Action**：执行规划并产生新的观察

参考示例：天气很好 → 昨天没去森林 → 今天适合探险 → 去森林 → 探索森林

## Scope

**新增能力**：
- `observation-system`：观察系统
- `memory-stream`：记忆流系统
- `reflection-engine`：反思引擎
- `planning-engine`：规划引擎

**修改文件**：
- `backend/ai/observation.py`：新增观察系统
- `backend/ai/memory.py`：增强记忆流功能
- `backend/ai/reflection.py`：增强反思引擎
- `backend/ai/planning.py`：新增规划引擎
- `backend/ai/graph.py`：重构工作流为 OMRPA 流程
- `backend/models/observation.py`：新增观察模型
- `backend/models/plan.py`：新增计划模型

## Risks

- 完整的 Generative Agents 流程可能增加计算复杂度
- 需要与现有的 World Tick 机制协调
- 反思引擎需要平衡深度和性能

## Success Criteria

- 宠物能感知环境变化并生成观察
- 记忆流支持时间顺序检索和关联查询
- 反思引擎能从记忆中提炼洞察
- 规划引擎能基于记忆和反思制定行动计划
- 完整的 OMRPA 循环正常运行

## References

- Generative Agents 项目：https://github.com/langchain-ai/generative-agents
- 论文：《Generative Agents: Interactive Simulacra of Human Behavior》
- 核心流程：Observation → Memory → Reflection → Planning → Action