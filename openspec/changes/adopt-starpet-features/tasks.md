# Tasks

## Phase 1: Offline Exploration

### Task 1.1: Create PetEvent data model
- File: `backend/models/event.py`
- Status: completed
- Description: 创建 PetEvent 数据模型，包含事件类型、位置、详情、状态变化等字段

### Task 1.2: Implement World Tick service
- File: `backend/services/world_tick.py`
- Status: completed
- Description: 实现世界时间推进服务，处理离线时间计算和事件生成

### Task 1.3: Add offline sync API endpoint
- File: `backend/routers/pet.py`
- Status: completed
- Description: 添加 `/api/pet/{pet_id}/sync` 接口，同步离线事件

### Task 1.4: Update LangGraph with offline processing node
- File: `backend/ai/graph.py`
- Status: completed
- Description: 在 LangGraph 中添加离线处理节点，支持批量事件生成

## Phase 2: Narrative System

### Task 2.1: Enhance diary generation quality
- File: `backend/ai/agents/narrative.py`
- Status: completed
- Description: 参考 StarPet 优化日记生成 Prompt，支持多种性格语气

### Task 2.2: Add diary generation API endpoint
- File: `backend/routers/diary.py`
- Status: completed
- Description: 添加日记生成和获取接口

### Task 2.3: Create PetDiary data model
- File: `backend/models/diary.py`
- Status: completed
- Description: 创建日记数据模型，支持标签、图片等字段（已存在，无需修改）

## Phase 3: Web UI

### Task 3.1: Implement PetDisplay component with animations
- File: `frontend/src/components/Pet/PetDisplay.tsx`
- Status: completed
- Description: 实现宠物展示组件，包含动画状态机

### Task 3.2: Implement StatusPanel component
- File: `frontend/src/components/Status/StatusPanel.tsx`
- Status: completed
- Description: 实现状态面板组件，实时显示宠物状态

### Task 3.3: Implement EventLog component
- File: `frontend/src/components/Event/EventLog.tsx`
- Status: completed
- Description: 实现事件日志组件，展示近期发生的事件

### Task 3.4: Implement DiaryTimeline component
- File: `frontend/src/components/Diary/DiaryTimeline.tsx`
- Status: completed
- Description: 实现日记时间线组件，按时间线展示宠物日记

### Task 3.5: Add SSE real-time updates
- File: `frontend/src/hooks/usePetStream.ts`
- Status: partial
- Description: 添加 SSE 实时推送钩子，接收宠物状态变化（后端已有基础实现）

### Task 3.6: Implement offline report popup
- File: `frontend/src/components/OfflineReport/OfflineReport.tsx`
- Status: completed
- Description: 实现离线报告弹窗，展示用户离线期间发生的事件

## Phase 4: Integration & Testing

### Task 4.1: Integrate offline events with memory system
- File: `backend/ai/memory.py`
- Status: pending
- Description: 将离线事件记录到记忆系统，支持时间加权检索

### Task 4.2: Add database migrations
- File: `backend/alembic/versions/xxx_add_event_diary_models.py`
- Status: pending
- Description: 创建数据库迁移脚本，添加事件和日记表

### Task 4.3: Write unit tests for offline exploration
- File: `backend/tests/test_offline_exploration.py`
- Status: pending
- Description: 编写离线探险单元测试

### Task 4.4: Write unit tests for narrative system
- File: `backend/tests/test_narrative.py`
- Status: pending
- Description: 编写叙事系统单元测试

### Task 4.5: End-to-end testing
- Status: pending
- Description: 测试完整离线流程，从用户下线到上线查看离线报告