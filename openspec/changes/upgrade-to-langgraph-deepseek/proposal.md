## Why

当前项目的 Agent 架构基于纯 Python 状态机模拟 LangGraph，未接入真实 LLM 服务，无法充分展示自主数字生命体的核心能力。为了在 TRAE AI 创造力大赛中展示完整的 Agent 决策流程，需要将架构升级为真实 LangGraph + DeepSeek API，实现 AI 驱动的宠物自主行为、记忆管理和叙事生成。

## What Changes

- 将纯 Python 状态机替换为真实 LangGraph StateGraph
- 接入 DeepSeek API，实现 AI 驱动的 Planner、Reflection、Narrative Agent
- 实现记忆系统 SQLite 持久化（时间加权记忆、短期/长期记忆分离）
- 添加 API 超时重试机制和规则引擎回退方案
- 实现完整的 Observation→Memory→Reflection→Planning→Action 流程

## Capabilities

### New Capabilities

- `langgraph-workflow`: 基于真实 LangGraph 的 Agent 状态机工作流
- `deepseek-integration`: DeepSeek API 接入与调用封装
- `memory-persistence`: 记忆系统 SQLite 持久化与检索优化

### Modified Capabilities

- 无

## Impact

- 修改 `backend/ai/graph.py`: 重构为真实 LangGraph StateGraph
- 修改 `backend/ai/memory.py`: 添加 SQLite 持久化
- 修改 `backend/ai/agents/behavior.py`: 接入 DeepSeek API
- 修改 `backend/ai/agents/narrative.py`: 接入 DeepSeek API
- 修改 `backend/config.py`: 添加 API 配置和重试策略
- 新增 `backend/models/memory.py`: 记忆数据模型
- 新增 `backend/.env`: DeepSeek API Key 配置
