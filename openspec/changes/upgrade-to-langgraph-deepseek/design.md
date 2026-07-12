## Context

当前项目的 Agent 架构基于纯 Python 状态机模拟 LangGraph，未接入真实 LLM 服务。为了在 TRAE AI 创造力大赛中展示完整的自主数字生命体能力，需要升级为真实 LangGraph + DeepSeek API。

## Goals / Non-Goals

**Goals:**
- 使用真实 LangGraph StateGraph 替换模拟状态机
- 接入 DeepSeek API 实现 AI 驱动的 Agent 决策
- 实现记忆系统 SQLite 持久化
- 添加 API 重试机制和规则引擎回退
- 实现完整的 Observation→Memory→Reflection→Planning→Action 流程

**Non-Goals:**
- 实现多宠物社交系统（Phase 2）
- 实现学习与经验系统（Phase 3）
- 前端交互优化（Phase 4）
- 生产环境部署（Phase 5）

## Decisions

### Technology Stack

- **LangGraph**: 使用 langgraph.StateGraph 实现 Agent 工作流
- **LangChain**: 使用 langchain_openai.ChatOpenAI 兼容模式调用 DeepSeek
- **DeepSeek API**: 使用 deepseek-chat 模型进行决策和叙事生成
- **SQLite**: 使用 SQLAlchemy ORM 进行记忆持久化

### Data Model

**Memory Model:**
```python
class Memory(Base):
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(String, index=True)
    content = Column(String)
    memory_type = Column(String)  # short_term | long_term
    importance = Column(Float, default=0.5)
    created_at = Column(DateTime)
    tags = Column(JSON)
```

### LangGraph State

```python
class PetGraphState(TypedDict):
    pet_id: str
    pet_state: dict
    plan: str
    action: str
    experiences: list
    memories: list
    reflection: dict
    diary: dict
    image_prompt: str
```

### API Configuration

- `DEEPSEEK_API_KEY`: API 密钥（从 .env 读取）
- `DEEPSEEK_BASE_URL`: API 基础 URL，默认 `https://api.deepseek.com/v1`
- `MAX_RETRIES`: 最大重试次数（默认 3）
- `TIMEOUT`: 超时时间（默认 30 秒）

### Fallback Strategy

当 API 不可用时，系统自动切换到规则引擎模式：
- Planner: 使用规则引擎生成决策
- Reflection: 使用规则引擎生成总结
- Narrative: 使用规则引擎生成日记

## Risks / Trade-offs

- **API 延迟**: DeepSeek API 调用可能存在延迟 → 缓存结果，异步执行
- **API 费用**: 使用 API 会产生费用 → 提供规则引擎回退，用户可选择是否启用
- **记忆数据量**: 长期记忆可能增长过大 → 限制最大数量，定期清理
- **JSON 解析失败**: API 返回格式可能不规范 → 添加解析容错和 fallback

## Migration Plan

1. 安装依赖：`pip install langgraph langchain langchain-openai`
2. 创建记忆数据模型和数据库迁移
3. 修改 memory.py 添加 SQLite 持久化
4. 修改 behavior.py 和 narrative.py 接入 DeepSeek API
5. 修改 graph.py 使用真实 LangGraph
6. 配置 .env 文件
7. 测试完整流程

## Implementation Deviations

### 技术栈调整

1. **API 调用方式**: 设计中计划使用 `langchain_openai.ChatOpenAI` 兼容模式调用 DeepSeek API，但实际实现使用 `httpx` 直接调用。原因：环境中安装 langchain 存在网络代理配置问题，使用 httpx 更直接且无需额外依赖。

2. **LangGraph 回退方案**: 设计中计划使用真实 `langgraph.StateGraph`，但实际实现中包含 `SimpleGraph` 回退方案。原因：langgraph 包安装失败（环境代理 SSL 问题），SimpleGraph 提供了相同的 API 接口，安装 langgraph 后会自动切换。

3. **PetGraphState 结构**: 设计中的 PetGraphState 包含 `pet_state`, `plan`, `experiences` 等字段，实际实现调整为更扁平化的结构，包含 `pet_id`, `pet_name`, `species`, `personality`, `current_location`, `mood`, `energy`, `inventory`, `behavior_chain`, `memory_summary`, `reflection`, `diary_title`, `diary_text`, `scene_image_url`, `step_count`, `max_steps`。

### 环境配置

4. **API Base URL**: 当前使用 `http://api.deepseek.com/v1` 而非 `https://`。这是临时配置，用于绕过环境代理 SSL 问题。生产环境应恢复为 `https://`。
