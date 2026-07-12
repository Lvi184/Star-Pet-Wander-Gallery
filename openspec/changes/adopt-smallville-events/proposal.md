# Proposal: Adopt Smallville Event System

## Summary

引入 Smallville 的 NPC 活动系统和节日机制，让星宠世界能够举办各种活动和节日，所有宠物可以收到通知、一起参加，并产生共同的故事。

## Motivation

当前项目已实现基础的宠物社交和记忆系统，但缺少 Smallville 特有的：
- **活动系统**：小镇/星球级别的活动组织和管理
- **节日机制**：周期性的星球节日，所有宠物共同参与
- **活动通知**：宠物收到活动邀请和通知
- **集体故事**：活动中产生的共同经历和故事

参考 Smallville 的核心模式：星球节日 → 所有宠物收到通知 → 一起参加 → 产生故事

## Scope

**新增能力**：
- `event-system`：活动系统
- `festival-system`：节日系统
- `notification-system`：通知系统
- `collective-story`：集体故事生成

**修改文件**：
- `backend/models/event.py`：新增活动数据模型
- `backend/models/festival.py`：新增节日数据模型
- `backend/models/notification.py`：新增通知数据模型
- `backend/services/event_service.py`：新增活动服务
- `backend/services/festival_service.py`：新增节日服务
- `backend/ai/agents/event.py`：新增活动 Agent
- `backend/routers/event.py`：新增活动路由
- `backend/routers/festival.py`：新增节日路由

## Risks

- 活动系统需要处理多宠物并发参与
- 节日机制需要与时间系统协调
- 集体故事生成需要平衡个性化和一致性

## Success Criteria

- 系统支持创建和管理星球活动
- 宠物能收到活动通知并选择参加
- 节日自动生成并定期举办
- 活动参与者产生共同的故事和记忆
- 活动 API 正常响应

## References

- Smallville 项目：https://github.com/joonspk-research/generative_agents
- Generative Agents 论文：《Generative Agents: Interactive Simulacra of Human Behavior》
- 核心模式：星球节日 → 所有宠物收到通知 → 一起参加 → 产生故事