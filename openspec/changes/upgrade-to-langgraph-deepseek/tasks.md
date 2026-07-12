## 1. 依赖安装

- [x] 1.1 安装 langgraph、langchain、langchain-openai 依赖
- [x] 1.2 更新 requirements.txt

## 2. 数据模型

- [x] 2.1 创建 Memory 数据模型 (`backend/models/memory.py`)
- [x] 2.2 数据库迁移，创建 memory 表

## 3. 记忆系统持久化

- [x] 3.1 修改 `memory.py` 添加 SQLite 持久化
- [x] 3.2 实现时间加权记忆检索
- [x] 3.3 实现短期/长期记忆分离
- [x] 3.4 实现记忆反射摘要

## 4. API 配置

- [x] 4.1 创建 `.env` 文件模板
- [x] 4.2 修改 `config.py` 添加 API 配置和重试策略
- [x] 4.3 实现 DeepSeek API 调用封装

## 5. Agent 接入 DeepSeek

- [x] 5.1 修改 `behavior.py` Planner Agent 接入 DeepSeek API
- [x] 5.2 修改 `behavior.py` Reflection Agent 接入 DeepSeek API
- [x] 5.3 修改 `narrative.py` Narrative Agent 接入 DeepSeek API
- [x] 5.4 添加规则引擎回退逻辑

## 6. LangGraph 重构

- [x] 6.1 修改 `graph.py` 使用真实 langgraph.StateGraph
- [x] 6.2 定义 PetGraphState TypedDict 和 Annotated reducers
- [x] 6.3 注册所有 Agent 节点
- [x] 6.4 实现条件路由（add_conditional_edges）

## 7. 测试验证

- [x] 7.1 测试完整流程（Planning → Action → Memory → Reflection → Narrative）
- [x] 7.2 测试 API 调用和 JSON 解析
- [x] 7.3 测试记忆持久化和检索
- [x] 7.4 测试规则引擎回退