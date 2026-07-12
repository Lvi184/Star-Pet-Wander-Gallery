## Context

参考 StarPet 项目（https://github.com/Lvi184/StarPet.git），该项目在宠物离线自主行为、AI叙事生成、网页端交互设计等方面有优秀实现。本变更旨在采纳 StarPet 的核心功能，将星宠漫游馆升级为更完整的自主数字生命体系统。

## Goals / Non-Goals

**Goals:**
- 实现宠物离线自主探险逻辑（World Tick 机制）
- 增强 AI 叙事生成质量（情感化日记、多样化叙事风格）
- 优化网页端宠物展示与交互（动画状态机、实时状态变化）
- 添加离线时间模拟与事件批量处理
- 实现宠物状态可视化与进度追踪

**Non-Goals:**
- 实现复杂3D渲染（保持轻量网页形态）
- 添加社交网络分享功能
- 实现多平台移动端适配

## Decisions

### Technology Stack

- **后端**: FastAPI + SQLite + SQLAlchemy（保持现有技术栈）
- **Agent**: LangGraph + DeepSeek API（保持现有技术栈）
- **前端**: React + Vite + TailwindCSS（保持现有技术栈）
- **动画**: CSS动画 + React状态管理实现宠物状态切换

### World Tick 机制

参考 StarPet 的离线时间推进机制：
1. 用户下线时记录时间戳
2. 用户上线时计算离线时长
3. 根据离线时长批量生成宠物行为事件
4. 每次 Tick 推进游戏时间，更新宠物状态

### 事件数据模型

```python
class PetEvent(Base):
    id = Column(Integer, primary_key=True)
    pet_id = Column(String, index=True)
    event_type = Column(String)  # explore, discover, meet, collect, rest, social
    location = Column(String)
    detail = Column(String)
    timestamp = Column(DateTime)
    mood_change = Column(Float, default=0)
    energy_change = Column(Float, default=0)
    items_found = Column(JSON, default=list)
```

### 前端交互设计

参考 StarPet 的轻量网页形态：
- 宠物状态面板：实时显示心情、精力、位置
- 动画状态机：idle、walking、exploring、sleeping、eating
- 事件日志：展示近期发生的事件
- 日记展示：按时间线展示宠物日记

## Risks / Trade-offs

- **离线事件数量**: 长时间离线可能生成大量事件 → 限制单次最大事件数（如20个）
- **动画性能**: 复杂动画可能影响页面性能 → 使用CSS动画替代Canvas渲染
- **API调用频率**: 批量事件生成可能频繁调用API → 添加缓存和批量处理

## Migration Plan

1. 创建事件数据模型和数据库迁移
2. 实现 World Tick 服务
3. 修改 LangGraph 添加离线处理节点
4. 增强叙事生成质量
5. 优化前端宠物展示组件
6. 测试完整离线流程