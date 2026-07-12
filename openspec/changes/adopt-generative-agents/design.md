# Design: Generative Agents Pattern Integration

## Architecture Overview

```
Observation（观察）
    │
    ▼
Memory（记忆）
    │
    ▼
Reflection（反思）
    │
    ▼
Planning（规划）
    │
    ▼
Action（行动）
    │
    ▼
[生成新的 Observation，形成闭环]
```

### Generative Agents 完整流程

```
环境变化/事件发生
    │
    ▼
Observation Agent
    │  ├─ 感知天气变化
    │  ├─ 感知位置变化
    │  ├─ 感知其他宠物
    │  └─ 感知物品发现
    │
    ▼
Memory Stream
    │  ├─ 按时间顺序存储
    │  ├─ 支持关联检索
    │  └─ 计算重要度
    │
    ▼
Reflection Engine
    │  ├─ 从记忆中提炼洞察
    │  ├─ 发现模式和规律
    │  └─ 形成更高层次的知识
    │
    ▼
Planning Engine
    │  ├─ 设定目标
    │  ├─ 制定计划
    │  └─ 选择行动
    │
    ▼
Action Execution
    │  ├─ 执行探索
    │  ├─ 执行社交
    │  ├─ 执行休息
    │  └─ 生成新观察
```

## Core Concepts

### 1. Observation System（观察系统）

**观察类型**：
| 类型 | 说明 | 示例 |
|------|------|------|
| `weather` | 天气变化 | 天气变好了 |
| `location` | 位置变化 | 到达星光森林 |
| `pet` | 发现其他宠物 | 看到小星猫 |
| `item` | 发现物品 | 捡到星星碎片 |
| `event` | 事件发生 | 遇到下雨 |
| `status` | 状态变化 | 精力下降了 |

**观察属性**：
- `type`：观察类型
- `content`：观察内容
- `timestamp`：时间戳
- `importance`：重要度（0-1）
- `context`：上下文信息

**观察流程**：
1. World Tick 检测环境变化
2. Observation Agent 生成观察记录
3. 写入 Memory Stream

### 2. Memory Stream（记忆流）

参考 Generative Agents 的 Memory Stream 机制：

**核心特性**：
- **时间顺序**：按时间顺序存储所有观察和反思
- **关联检索**：支持根据关键词、类型、时间范围检索
- **重要度计算**：基于上下文和反思动态调整
- **记忆分类**：
  - `observation`：观察记忆
  - `reflection`：反思记忆
  - `plan`：计划记忆
  - `action`：行动记忆

**检索策略**：
- 时间加权：越近的记忆权重越高
- 重要度加权：重要的记忆权重越高
- 类型过滤：按类型检索

### 3. Reflection Engine（反思引擎）

参考 Generative Agents 的 Reflection 机制：

**反思问题模板**：
```
1. 从最近的观察中，我发现了什么模式？
2. 我学到了什么新东西？
3. 我应该改变什么行为？
4. 我未来应该追求什么目标？
```

**反思流程**：
1. 收集最近一段时间的观察和记忆
2. 识别模式和规律
3. 生成反思摘要
4. 写入长期记忆
5. 更新宠物性格和偏好

**反思触发条件**：
- 积累一定数量的观察（如10条）
- 经过一定时间（如4小时）
- 发生重要事件

### 4. Planning Engine（规划引擎）

**规划层次**：
| 层次 | 时间范围 | 内容 |
|------|----------|------|
| 长期规划 | 几天到几周 | 总体目标（如"成为探险家"） |
| 中期规划 | 一天 | 今日计划（如"今天去森林探险"） |
| 短期规划 | 几小时 | 当前任务（如"去东边探索"） |

**规划流程**：
1. 读取记忆和反思
2. 设定当前目标
3. 制定行动计划
4. 选择下一个行动

**决策因素**：
- 当前状态（精力、心情）
- 记忆中的偏好
- 反思中的洞察
- 日程约束

**示例流程**：
```
天气很好 → 观察
昨天没去森林 → 记忆
今天适合探险 → 反思
去森林探险 → 规划
出发去森林 → 行动
```

### 5. Action Execution（行动执行）

**行动类型**：
| 类型 | 说明 | 影响 |
|------|------|------|
| `explore` | 探索 | 发现物品、地点 |
| `social` | 社交 | 建立关系 |
| `rest` | 休息 | 恢复精力 |
| `move` | 移动 | 改变位置 |
| `collect` | 收集 | 获取物品 |

**行动结果**：
- 生成新的观察
- 更新宠物状态
- 修改记忆

## Data Models

### Observation Model

```python
class Observation(Base):
    __tablename__ = "observations"
    id = Column(Integer, primary_key=True)
    pet_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # weather/location/pet/item/event/status
    content = Column(String, nullable=False)
    importance = Column(Float, default=0.5)
    context = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### Plan Model

```python
class Plan(Base):
    __tablename__ = "plans"
    id = Column(String, primary_key=True)
    pet_id = Column(String, nullable=False, index=True)
    level = Column(String, default="daily")  # long_term/daily/hourly
    goal = Column(String, nullable=False)
    steps = Column(JSON, default=list)
    current_step = Column(Integer, default=0)
    status = Column(String, default="active")  # active/completed/failed
    priority = Column(Float, default=0.5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Memory Model Enhancement

```python
class Memory(Base):
    __tablename__ = "memories"
    id = Column(Integer, primary_key=True)
    pet_id = Column(String, nullable=False, index=True)
    content = Column(String, nullable=False)
    memory_type = Column(String, default="observation")  # observation/reflection/plan/action
    importance = Column(Float, default=0.5)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tags = Column(JSON, default=list)
    is_short_term = Column(Boolean, default=True)
    decay_rate = Column(Float, default=0.01)
    source_observation_id = Column(Integer, ForeignKey("observations.id"))  # 新增
```

## API Design

### Observation API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/observations` | GET | 获取观察列表 |
| `/pet/{pet_id}/observations` | POST | 添加观察 |
| `/pet/{pet_id}/observations/latest` | GET | 获取最新观察 |

### Plan API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/plans` | GET | 获取计划列表 |
| `/pet/{pet_id}/plans` | POST | 创建计划 |
| `/pet/{pet_id}/plans/current` | GET | 获取当前计划 |
| `/pet/{pet_id}/plans/{plan_id}` | PUT | 更新计划 |

### Reflection API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/reflection` | GET | 获取最新反思 |
| `/pet/{pet_id}/reflection/trigger` | POST | 触发反思 |
| `/pet/{pet_id}/reflection/history` | GET | 获取反思历史 |

## LangGraph Workflow

重构为完整的 OMRPA 流程：

```
observation → memory_store → reflect → plan → decide_action → execute_action → END
```

**节点说明**：

| 节点 | 功能 |
|------|------|
| `observation` | 观察环境变化，生成观察记录 |
| `memory_store` | 将观察写入记忆流 |
| `reflect` | 检查是否需要反思，生成反思摘要 |
| `plan` | 基于记忆和反思制定计划 |
| `decide_action` | 根据计划和状态决策下一个行动 |
| `execute_action` | 执行行动，生成新观察 |

**条件边**：

```
reflect → 是否需要反思？ → YES → 生成反思 → plan
                      → NO → plan

plan → 是否有计划？ → YES → decide_action
                   → NO → 根据日程和状态决策

execute_action → 是否生成新观察？ → YES → observation（循环）
                                → NO → END
```

## Frontend Integration

新增组件：
- `ObservationFeed`：观察流展示组件
- `PlanPanel`：计划展示面板
- `ReflectionViewer`：反思查看器
- `ActionHistory`：行动历史

## Implementation Notes

1. **观察触发时机**：每个 World Tick 开始时进行观察
2. **记忆流查询优化**：为 `pet_id`、`created_at`、`memory_type` 添加联合索引
3. **反思频率控制**：避免过于频繁的反思，设置最小间隔时间
4. **规划与日程协调**：规划引擎需考虑每日日程约束
5. **循环控制**：OMRPA 循环最多执行 N 次，避免无限循环