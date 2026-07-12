# Design: Smallville Event System Integration

## Architecture Overview

```
节日/活动创建
    │
    ▼
通知所有宠物
    │
    ▼
宠物选择参加
    │
    ▼
活动进行中
    │  ├─ 互动事件
    │  ├─ 社交互动
    │  └─ 物品发现
    │
    ▼
集体故事生成
    │
    ▼
宠物获得共同记忆
```

### Smallville 活动流程

```
星球节日开始
    │
    ├─ 系统创建节日活动
    │
    ├─ 发送通知给所有宠物
    │     │
    │     ├─ 宠物A收到通知
    │     ├─ 宠物B收到通知
    │     └─ ...
    │
    ├─ 宠物选择参加
    │     │
    │     ├─ 宠物A参加
    │     ├─ 宠物B参加
    │     └─ ...
    │
    ├─ 活动进行
    │     │
    │     ├─ 宠物相遇
    │     ├─ 一起玩耍
    │     ├─ 完成任务
    │     └─ 获得奖励
    │
    └─ 活动结束
          │
          ├─ 生成集体故事
          ├─ 宠物获得记忆
          └─ 节日结束
```

## Core Concepts

### 1. Event System（活动系统）

**活动类型**：
| 类型 | 说明 | 示例 |
|------|------|------|
| `festival` | 节日活动 | 星光节、月圆节 |
| `party` | 聚会活动 | 生日派对、欢迎派对 |
| `exploration` | 探险活动 | 组队探险、寻宝 |
| `competition` | 竞技活动 | 赛跑比赛、捉迷藏 |
| `meeting` | 会议活动 | 宠物大会、社区会议 |

**活动状态**：
| 状态 | 说明 |
|------|------|
| `upcoming` | 即将开始 |
| `active` | 进行中 |
| `ended` | 已结束 |
| `cancelled` | 已取消 |

**活动属性**：
- `id`：活动ID
- `name`：活动名称
- `type`：活动类型
- `description`：活动描述
- `location`：活动地点
- `start_time`：开始时间
- `end_time`：结束时间
- `status`：活动状态
- `participants`：参与者列表
- `rewards`：奖励物品
- `tasks`：活动任务

**活动流程**：
1. 创建活动
2. 发送通知
3. 宠物报名
4. 活动开始
5. 活动进行
6. 活动结束
7. 生成故事

### 2. Festival System（节日系统）

**节日类型**：
| 节日 | 周期 | 说明 |
|------|------|------|
| `星光节` | 每月一次 | 庆祝星星最亮的夜晚 |
| `月圆节` | 每月一次 | 满月时的聚会 |
| `彩虹节` | 季节活动 | 春天第一场雨后 |
| `收获节` | 季节活动 | 秋天收获季节 |
| `新年庆典` | 年度活动 | 新年第一天 |

**节日规则**：
- 节日按固定周期自动生成
- 每个节日有独特的主题和活动
- 节日期间有特殊奖励和物品

**节日流程**：
1. 系统检测节日时间
2. 创建节日活动
3. 发送通知给所有宠物
4. 宠物参加节日活动
5. 节日结束，生成节日故事

### 3. Notification System（通知系统）

**通知类型**：
| 类型 | 说明 |
|------|------|
| `event_invitation` | 活动邀请 |
| `festival_notification` | 节日通知 |
| `friend_request` | 好友请求 |
| `story_update` | 故事更新 |
| `system_message` | 系统消息 |

**通知状态**：
| 状态 | 说明 |
|------|------|
| `unread` | 未读 |
| `read` | 已读 |
| `accepted` | 已接受 |
| `rejected` | 已拒绝 |

**通知流程**：
1. 系统生成通知
2. 存储通知到数据库
3. 宠物获取通知
4. 宠物处理通知（接受/拒绝）

### 4. Collective Story（集体故事）

**故事生成规则**：
- 基于活动期间所有宠物的互动
- 每个宠物获得个性化的故事版本
- 故事包含共同经历和个人感受

**故事内容**：
- 活动概述
- 个人经历
- 与其他宠物的互动
- 获得的物品和奖励
- 活动后的感受

## Data Models

### Event Model

```python
class Event(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String)
    location = Column(String)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="upcoming")
    participants = Column(JSON, default=list)
    rewards = Column(JSON, default=list)
    tasks = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Festival Model

```python
class Festival(Base):
    __tablename__ = "festivals"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String)
    cycle = Column(String, default="monthly")  # daily/weekly/monthly/seasonal/yearly
    next_date = Column(Date, nullable=False)
    event_id = Column(String, ForeignKey("events.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Notification Model

```python
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True)
    pet_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String)
    data = Column(JSON, default=dict)
    status = Column(String, default="unread")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
```

### Participation Model

```python
class Participation(Base):
    __tablename__ = "participations"
    id = Column(String, primary_key=True)
    pet_id = Column(String, nullable=False, index=True)
    event_id = Column(String, nullable=False, index=True)
    status = Column(String, default="joined")  # joined/attended/absent
    role = Column(String, default="participant")  # host/participant/guest
    arrived_at = Column(DateTime(timezone=True))
    left_at = Column(DateTime(timezone=True))
    tasks_completed = Column(JSON, default=list)
    rewards_claimed = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

## API Design

### Event API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/events` | GET | 获取活动列表 |
| `/events/{event_id}` | GET | 获取活动详情 |
| `/events` | POST | 创建活动 |
| `/events/{event_id}` | PUT | 更新活动 |
| `/events/{event_id}` | DELETE | 删除活动 |
| `/events/{event_id}/join` | POST | 参加活动 |
| `/events/{event_id}/leave` | POST | 离开活动 |
| `/events/{event_id}/participants` | GET | 获取参与者列表 |

### Festival API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/festivals` | GET | 获取节日列表 |
| `/festivals/{festival_id}` | GET | 获取节日详情 |
| `/festivals/upcoming` | GET | 获取即将到来的节日 |
| `/festivals/{festival_id}/trigger` | POST | 手动触发节日 |

### Notification API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/pet/{pet_id}/notifications` | GET | 获取通知列表 |
| `/pet/{pet_id}/notifications/{notification_id}` | GET | 获取通知详情 |
| `/pet/{pet_id}/notifications/{notification_id}` | PUT | 更新通知状态 |
| `/pet/{pet_id}/notifications/read-all` | POST | 标记全部已读 |

## Frontend Integration

新增组件：
- `EventCalendar`：活动日历组件
- `EventDetail`：活动详情组件
- `FestivalBanner`：节日横幅组件
- `NotificationCenter`：通知中心组件
- `ParticipationPanel`：参与面板组件

## Implementation Notes

1. **活动并发处理**：使用数据库事务保证参与者数据一致性
2. **节日时间检测**：在 World Tick 中检查节日时间，自动创建活动
3. **通知推送**：使用 WebSocket 推送实时通知
4. **集体故事生成**：基于参与者的互动记录生成个性化故事
5. **性能优化**：活动查询添加索引，避免全表扫描