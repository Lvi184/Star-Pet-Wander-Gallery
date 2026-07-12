# Tasks

## Phase 1: Daily Schedule System

### Task 1.1: Enhance Memory model with layering fields
- File: `backend/models/memory.py`
- Status: pending
- Description: 添加 `is_short_term` 和 `decay_rate` 字段

### Task 1.2: Implement Memory layering logic
- File: `backend/ai/memory.py`
- Status: pending
- Description: 实现短期/长期记忆分层存储和检索逻辑

### Task 1.3: Create DailySchedule model
- File: `backend/models/schedule.py`
- Status: pending
- Description: 创建每日日程数据模型

### Task 1.4: Implement Schedule service
- File: `backend/services/schedule_service.py`
- Status: pending
- Description: 实现日程生成和检查服务

### Task 1.5: Add schedule_check node to LangGraph
- File: `backend/ai/graph.py`
- Status: pending
- Description: 在 LangGraph 工作流中添加日程检查节点

### Task 1.6: Add schedule API endpoints
- File: `backend/routers/pet.py`
- Status: pending
- Description: 添加 `/pet/{pet_id}/schedule` 和 `/pet/{pet_id}/schedule/generate` 接口

## Phase 2: Memory Layering System

### Task 2.1: Implement memory decay mechanism
- File: `backend/ai/memory.py`
- Status: pending
- Description: 实现长期记忆衰减机制

### Task 2.2: Implement daily memory maintenance
- File: `backend/services/memory_maintenance.py`
- Status: pending
- Description: 实现每日凌晨记忆转换和清理任务

### Task 2.3: Implement time-weighted memory retrieval
- File: `backend/ai/memory.py`
- Status: pending
- Description: 实现时间加权的记忆检索

### Task 2.4: Add memory API endpoints
- File: `backend/routers/pet.py`
- Status: pending
- Description: 添加短期/长期记忆获取接口

## Phase 3: NPC Social System

### Task 3.1: Create Relationship model
- File: `backend/models/relationship.py`
- Status: pending
- Description: 创建宠物关系数据模型

### Task 3.2: Implement Social Agent
- File: `backend/ai/agents/social.py`
- Status: pending
- Description: 实现社交对话生成 Agent

### Task 3.3: Add social_step to LangGraph
- File: `backend/ai/graph.py`
- Status: pending
- Description: 在 LangGraph 工作流中添加社交节点

### Task 3.4: Add social API endpoints
- File: `backend/routers/pet.py`
- Status: pending
- Description: 添加关系查询和社交互动接口

### Task 3.5: Integrate social into diary generation
- File: `backend/ai/agents/narrative.py`
- Status: pending
- Description: 在日记生成中包含社交内容

## Phase 4: Frontend Integration

### Task 4.1: Implement SchedulePanel component
- File: `frontend/src/components/Schedule/SchedulePanel.tsx`
- Status: pending
- Description: 实现日程展示面板

### Task 4.2: Implement MemoryViewer component
- File: `frontend/src/components/Memory/MemoryViewer.tsx`
- Status: pending
- Description: 实现记忆查看器

### Task 4.3: Implement SocialPanel component
- File: `frontend/src/components/Social/SocialPanel.tsx`
- Status: pending
- Description: 实现社交关系面板

## Phase 5: Testing & Integration

### Task 5.1: Write unit tests for schedule system
- File: `backend/tests/test_schedule.py`
- Status: pending
- Description: 编写日程系统单元测试

### Task 5.2: Write unit tests for memory layering
- File: `backend/tests/test_memory_layering.py`
- Status: pending
- Description: 编写分层记忆单元测试

### Task 5.3: Write unit tests for social system
- File: `backend/tests/test_social.py`
- Status: pending
- Description: 编写社交系统单元测试

### Task 5.4: End-to-end testing
- Status: pending
- Description: 测试完整流程，从日程决策到社交互动到日记生成