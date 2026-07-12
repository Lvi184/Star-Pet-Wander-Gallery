---
name: composition-patterns
description: 基于组件组合模式拆分复杂组件，优化结构与状态管理。重构宠物详情页、探险地图等复杂页面，提升代码可维护性，方便复赛功能扩展。
allowed-tools: Read, Edit, SearchCodebase
license: MIT
metadata:
  author: TRAE Skills
  version: "1.0"
---

组件组合模式重构工具。

**输入**: 用户指定要重构的复杂组件或页面

**重构策略**

1. **组件拆分原则**
   - 单一职责原则
   - 复用性优先
   - 状态提升合理
   - Props 传递最小化

2. **组合模式应用**
   - 容器组件与展示组件分离
   - HOC 高阶组件封装
   - 组合组件替代继承
   - Render Props 灵活复用

3. **状态管理优化**
   - 局部状态管理
   - Context 全局共享
   - 状态下沉到最小作用域

4. **代码结构优化**
   - 文件组织结构
   - 导出规范
   - 类型定义
   - 测试覆盖率

**Steps**

1. **分析目标组件**
   - 读取组件代码
   - 识别组件复杂度
   - 发现重复逻辑

2. **设计拆分方案**
   - 规划子组件职责
   - 定义组件接口
   - 设计状态流向

3. **执行重构**
   - 创建子组件
   - 修改父组件
   - 更新引用关系

**输出**

- 重构后的文件结构
- 组件拆分说明
- 使用示例

**使用示例**

```
@composition-patterns 重构宠物详情页
@composition-patterns 拆分探险地图组件
@composition-patterns 优化复杂页面结构
```