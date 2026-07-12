# Proposal: Adopt AI Town Patterns

## Summary

将 AI Town 的核心机制引入星宠漫游馆，包括：分层记忆系统（长期记忆 + 短期记忆）、每日日程系统（早晨探索 → 下午社交 → 晚上休息）、以及每日反思机制。

## Motivation

当前项目已实现基础的离线探险和日记系统，但缺乏 AI Town 特有的：
- 记忆分层：短期记忆用于当前决策，长期记忆用于性格形成
- 日程驱动：宠物按时间自动执行不同活动
- 每日反思：睡前总结当天经历，影响次日行为

## Scope

**新增能力**：
- `daily-schedule`：每日日程系统
- `memory-layering`：分层记忆系统
- `npc-social`：NPC社交系统

**修改文件**：
- `backend/ai/memory.py`：添加长期/短期记忆分层
- `backend/ai/agents/behavior.py`：添加日程规划逻辑
- `backend/models/memory.py`：添加记忆类型字段
- `backend/ai/graph.py`：添加日程决策节点
- `backend/ai/agents/social.py`：新增社交 Agent
- `backend/models/relationship.py`：新增关系模型

## Risks

- 记忆分层可能增加查询复杂度，需优化索引
- 日程系统需要与现有 World Tick 机制协调
- 社交系统需要处理多宠物并发问题

## Success Criteria

- 宠物按日程自动执行活动（早晨探索、下午社交、晚上休息）
- 记忆系统支持短期/长期分层存储和检索
- 每日反思机制正常工作，影响次日决策
- NPC 社交对话生成正常

## References

- AI Town 项目：https://github.com/a16z-infra/ai-town
- Generative Agents 论文：Observation → Memory → Reflection → Planning → Action