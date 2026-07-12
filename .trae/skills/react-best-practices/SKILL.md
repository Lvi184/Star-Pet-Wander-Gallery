---
name: react-best-practices
description: React 项目专项审查，做性能分析、结构优化、最佳实践修正。优化前端组件重复渲染、状态管理混乱等问题，提升宠物状态实时更新、日记加载的流畅度。
allowed-tools: Read, SearchCodebase, Grep
license: MIT
metadata:
  author: TRAE Skills
  version: "1.0"
---

React 项目专项审查与优化工具。

**输入**: 用户指定要审查的 React 组件、页面或整个前端项目

**审查维度**

1. **性能优化检查**
   - 组件不必要重渲染
   - useState/useEffect 依赖项问题
   - 未使用 memo、useMemo、useCallback
   - 列表渲染缺少 key

2. **状态管理检查**
   - 状态拆分不合理
   - 全局状态滥用
   - Context 使用不当
   - 状态更新逻辑复杂

3. **组件结构优化**
   - 组件职责不单一
   - Props 传递层级过深
   - 重复代码未提取
   - 条件渲染逻辑混乱

4. **代码规范检查**
   - Hooks 使用规范
   - TypeScript 类型定义
   - 命名约定
   - 文件结构组织

**Steps**

1. **分析项目结构**
   - 读取 tsconfig.json
   - 分析组件目录结构
   - 检查状态管理方案

2. **逐文件审查**
   - 读取组件代码
   - 识别性能问题
   - 发现最佳实践违反

3. **生成优化建议**
   - 列出问题清单
   - 提供具体修复方案
   - 给出重构建议

**输出**

结构化优化报告，包含：
- 性能问题和优化方案
- 状态管理建议
- 组件重构指导
- TypeScript 改进建议

**使用示例**

```
@react-best-practices 审查 PetAvatar 组件
@react-best-practices 优化前端状态管理
@react-best-practices 审查整个前端项目
```