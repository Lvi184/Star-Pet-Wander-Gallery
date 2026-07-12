## Why

参考 StarPet 项目（https://github.com/Lvi184/StarPet.git），该项目与星宠漫游馆高度契合，涵盖宠物离线自主行为、AI叙事生成、轻量网页形态等核心功能。为了在 TRAE AI 创造力大赛中展示更完整的自主数字生命体能力，需要采纳 StarPet 的优秀设计和功能实现，提升项目的交互体验和叙事质量。

## What Changes

- 实现宠物离线自主探险逻辑（参考 StarPet 的 World Tick 机制）
- 增强 AI 叙事生成与日记系统（参考 StarPet 的叙事质量优化）
- 优化网页端宠物展示与交互设计（参考 StarPet 的前端设计）
- 添加离线时间模拟与事件批量处理
- 实现宠物状态实时变化与动画展示

## Capabilities

### New Capabilities

- `offline-exploration`: 宠物离线自主探险与时间模拟
- `narrative-system`: 增强版 AI 叙事生成与日记系统
- `web-ui`: 网页端宠物展示与交互优化

### Modified Capabilities

- 现有记忆系统：增强离线事件记录
- 现有行为链：添加批量事件处理
- 现有前端：优化宠物展示动画

## Impact

- 修改 `backend/ai/graph.py`: 添加离线时间推进节点
- 修改 `backend/ai/agents/behavior.py`: 添加离线探险逻辑
- 修改 `backend/ai/agents/narrative.py`: 增强日记生成质量
- 修改 `frontend/src/components/Pet/`: 优化宠物展示组件
- 修改 `frontend/src/components/Diary/`: 优化日记展示组件
- 新增 `backend/services/world_tick.py`: 世界时间推进服务
- 新增 `backend/models/event.py`: 事件数据模型