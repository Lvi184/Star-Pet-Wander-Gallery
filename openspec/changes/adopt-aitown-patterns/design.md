# Design: AI Town Patterns Integration

## Architecture Overview

```
用户下线
    │
    ▼
世界时间推进（World Tick）
    │
    ▼
每日日程检查（Morning/Afternoon/Evening）
    │
    ▼
Planner Agent 根据日程决策
    │
    ├── 早晨 → Explore Agent 探险
    │
    ├── 下午 → Social Agent 社交
    │
    └── 晚上 → 休息 + Reflection Agent 反思
    │
    ▼
Memory Agent 写入分层记忆
    │
    ├── 短期记忆（< 24小时）
    │
    └── 长期记忆（> 24小时）
    │
    ▼
Story Agent 生成漫游日记
    │
    ▼
用户上线查看今天发生的一切
```

## Core Concepts

### 1. 分层记忆系统（Memory Layering）

参考 AI Town 的 Memory 机制：

**短期记忆**（Short-term Memory）：
- 存储最近24小时的经历
- 用于当前决策
- 自动过期

**长期记忆**（Long-term Memory）：
- 存储超过24小时的重要经历
- 用于性格形成和长期决策
- 按重要度和时间加权检索

**记忆类型**：
- `event`：事件记忆（探险、发现物品）
- `social`：社交记忆（与其他宠物的互动）
- `reflection`：反思记忆（每日总结）
- `experience`：经验记忆（学习到的知识）

### 2. 每日日程系统（Daily Schedule）

参考 AI Town 的 Daily Schedule 机制：

| 时间段 | 活动类型 | 概率权重 | 说明 |
|--------|----------|----------|------|
| 06:00-10:00 | 早晨探索 | 0.7 | 高探索欲望，精力充沛 |
| 10:00-14:00 | 上午社交 | 0.5 | 中等社交欲望 |
| 14:00-18:00 | 下午探索 | 0.6 | 继续探险或休息 |
| 18:00-22:00 | 晚上休息 | 0.8 | 精力下降，倾向休息 |
| 22:00-06:00 | 深度睡眠 | 0.95 | 强制休息，恢复精力 |

**日程决策流程**：
1. 获取当前时间
2. 匹配时间段对应的活动类型
3. 结合宠物状态（精力、心情）调整概率
4. Planner Agent 做出最终决策

### 3. 每日反思机制（Reflection）

参考 AI Town 的 Reflection 机制：

**反思问题**：
- 今天最大的收获是什么？
- 今天最开心的事情是什么？
- 今天遇到了什么挑战？
- 明天想去哪里探索？

**反思流程**：
1. 收集当天所有事件
2. Reflection Agent 生成反思总结
3. 将反思写入长期记忆
4. 更新宠物性格和偏好

### 4. NPC 社交系统（Social System）

参考 AI Town 的 NPC 社交机制：

**社交事件类型**：
- `meet`：相遇
- `chat`：对话
- `play`：玩耍
- `help`：互助
- `compete`：竞争

**关系系统**：
- 宠物之间建立友谊/敌对关系
- 关系值范围：-100 到 100
- 关系影响社交行为和日记内容

## Data Models

### Memory Model Enhancement

```python
class Memory(Base):
    __tablename__ = "memories"
    id = Column(Integer, primary_key=True)
    pet_id = Column(String, nullable=False, index=True)
    content = Column(String, nullable=False)
    memory_type = Column(String, default="event")  # event/social/reflection/experience
    importance = Column(Float, default=0.5)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tags = Column(JSON, default=list)
    is_short_term = Column(Boolean, default=True)  # 新增：是否短期记忆
    decay_rate = Column(Float, default=0.01)  # 新增：衰减率
```

### Schedule Model

```python
class DailySchedule(Base):
    __tablename__ = "daily_schedules"
    id = Column(Integer, primary_key=True)
    pet_id = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    activities = Column(JSON, default=list)  # 当天活动列表
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### Relationship Model

```python
class Relationship(Base):
    __tablename__ = "relationships"
    id = Column(Integer, primary_key=True)
    pet_id = Column(String, nullable=False, index=True)
    target_pet_id = Column(String, nullable=False, index=True)
    relationship_type = Column(String, default="neutral")  # friend/neutral/enemy
    affinity = Column(Float, default=0.0)  # -100 到 100
    last_interaction = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

## API Design

### Memory API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/memory/short-term` | GET | 获取短期记忆 |
| `/pet/{pet_id}/memory/long-term` | GET | 获取长期记忆 |
| `/pet/{pet_id}/memory` | POST | 添加记忆 |
| `/pet/{pet_id}/memory/summary` | GET | 获取记忆摘要（时间加权） |

### Schedule API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/schedule` | GET | 获取今日日程 |
| `/pet/{pet_id}/schedule/generate` | POST | 生成新日程 |

### Social API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/relationships` | GET | 获取关系列表 |
| `/pet/{pet_id}/social/meet` | POST | 触发社交相遇 |
| `/pet/{pet_id}/social/chat` | POST | 生成社交对话 |

## LangGraph Workflow Enhancement

新增节点：
- `schedule_check`：日程检查节点
- `social_step`：社交节点
- `reflect_step`：反思节点（已有，增强）

工作流：
```
offline_sync → schedule_check → planner → [explore/social/rest] → reflect → narrate → END
```

## Frontend Integration

新增组件：
- `SchedulePanel`：日程展示面板
- `MemoryViewer`：记忆查看器
- `SocialPanel`：社交关系面板

## Implementation Notes

1. **记忆分层查询优化**：为 `is_short_term` 和 `created_at` 添加联合索引
2. **日程与 World Tick 协调**：每个 Tick 开始时检查日程
3. **社交并发处理**：使用数据库事务保证一致性
4. **反思触发时机**：每天22:00后首次 Tick 时触发