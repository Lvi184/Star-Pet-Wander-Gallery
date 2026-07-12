# Tasks: Adopt Smallville Event System

## Phase 1: Event System

### Task 1.1: 创建 Event 数据模型
**文件**: `backend/models/event.py`
- 创建 Event 模型（id, name, type, description, location, start_time, end_time, status, participants, rewards, tasks）
- 创建 Participation 模型（id, pet_id, event_id, status, role, tasks_completed, rewards_claimed）

### Task 1.2: 创建 Event Service
**文件**: `backend/services/event_service.py`
- 实现创建活动功能
- 实现更新活动功能
- 实现删除活动功能
- 实现查询活动列表功能
- 实现查询活动详情功能
- 实现参加活动功能
- 实现离开活动功能

### Task 1.3: 创建 Event Router
**文件**: `backend/routers/event.py`
- 添加 GET /events 端点
- 添加 GET /events/{event_id} 端点
- 添加 POST /events 端点
- 添加 PUT /events/{event_id} 端点
- 添加 DELETE /events/{event_id} 端点
- 添加 POST /events/{event_id}/join 端点
- 添加 POST /events/{event_id}/leave 端点

### Task 1.4: 创建 Event Agent
**文件**: `backend/ai/agents/event.py`
- 实现活动互动生成
- 实现活动任务生成
- 实现活动奖励发放

## Phase 2: Festival System

### Task 2.1: 创建 Festival 数据模型
**文件**: `backend/models/festival.py`
- 创建 Festival 模型（id, name, type, description, cycle, next_date, event_id）

### Task 2.2: 创建 Festival Service
**文件**: `backend/services/festival_service.py`
- 实现节日自动生成
- 实现节日周期管理
- 实现节日查询
- 实现手动触发节日

### Task 2.3: 创建 Festival Router
**文件**: `backend/routers/festival.py`
- 添加 GET /festivals 端点
- 添加 GET /festivals/{festival_id} 端点
- 添加 GET /festivals/upcoming 端点
- 添加 POST /festivals/{festival_id}/trigger 端点

### Task 2.4: 集成 World Tick
**文件**: `backend/services/world_tick.py`
- 在每次 Tick 中检查节日时间
- 自动创建节日活动

## Phase 3: Notification System

### Task 3.1: 创建 Notification 数据模型
**文件**: `backend/models/notification.py`
- 创建 Notification 模型（id, pet_id, type, title, content, data, status, created_at, read_at）

### Task 3.2: 创建 Notification Service
**文件**: `backend/services/notification_service.py`
- 实现发送通知功能
- 实现获取通知列表功能
- 实现获取通知详情功能
- 实现更新通知状态功能
- 实现标记全部已读功能

### Task 3.3: 添加 Notification API
**文件**: `backend/routers/pet.py`
- 添加 GET /pet/{pet_id}/notifications 端点
- 添加 GET /pet/{pet_id}/notifications/{notification_id} 端点
- 添加 PUT /pet/{pet_id}/notifications/{notification_id} 端点
- 添加 POST /pet/{pet_id}/notifications/read-all 端点

## Phase 4: Collective Story

### Task 4.1: 实现故事生成逻辑
**文件**: `backend/services/event_service.py`
- 实现活动故事生成
- 实现个性化故事生成
- 实现故事保存为记忆

### Task 4.2: 添加故事 API
**文件**: `backend/routers/event.py`
- 添加 GET /events/{event_id}/story 端点
- 添加 POST /events/{event_id}/story/generate 端点

## Phase 5: Integration

### Task 5.1: 更新 database.py
**文件**: `backend/database.py`
- 注册新模型（Event, Festival, Notification, Participation）

### Task 5.2: 更新 main.py
**文件**: `backend/main.py`
- 注册新路由（event, festival）

### Task 5.3: 测试验证
- 测试活动创建和参加流程
- 测试节日自动生成
- 测试通知发送和处理
- 测试集体故事生成