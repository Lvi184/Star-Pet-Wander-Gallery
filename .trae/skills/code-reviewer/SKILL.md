---
name: code-reviewer
description: 全语言代码审查，覆盖安全漏洞、性能瓶颈、命名规范、异常处理，给出可落地修改方案。审查 LangGraph 宠物行为引擎、FastAPI 后端接口，提前规避逻辑bug，保障复赛代码质量。
allowed-tools: Bash(grep,find), Read, SearchCodebase, Grep
license: MIT
metadata:
  author: TRAE Skills
  version: "1.0"
---

全语言代码审查工具。

**输入**: 用户指定要审查的文件、目录或代码片段

**审查维度**

1. **安全漏洞检查**
   - SQL 注入风险
   - XSS 攻击风险
   - 敏感信息泄露
   - 权限验证缺失

2. **性能瓶颈分析**
   - 重复计算
   - 不必要的嵌套循环
   - 内存泄漏风险
   - 异步操作阻塞

3. **命名规范检查**
   - 变量/函数命名一致性
   - 类名采用 PascalCase
   - 函数名采用 camelCase
   - 常量采用 UPPER_CASE

4. **异常处理检查**
   - try-catch 完整性
   - 错误日志记录
   - 边界条件处理
   - 空值检查

5. **代码质量评估**
   - 代码复杂度
   - 重复代码
   - 注释完整性
   - 单元测试覆盖率

**Steps**

1. **收集代码信息**
   - 读取目标文件内容
   - 分析项目结构
   - 识别关键代码路径

2. **多维度审查**
   - 逐文件进行安全扫描
   - 分析性能热点
   - 检查代码规范

3. **生成审查报告**
   - 列出问题清单
   - 给出严重程度评级
   - 提供修复建议
   - 标注问题位置

**输出**

结构化审查报告，包含：
- 问题总数和分类统计
- 各问题详细描述和位置
- 具体修改建议
- 优先级排序

**使用示例**

```
@code-reviewer 审查 backend/ai/graph.py
@code-reviewer 审查 frontend/src 目录
@code-reviewer 审查宠物行为引擎代码
```