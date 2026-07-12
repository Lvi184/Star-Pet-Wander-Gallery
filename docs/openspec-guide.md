# OpenSpec 使用指南

## 参考资料

- [OpenSpec 实战教程](https://houbb.github.io/2025/11/20/ai-sdd-06-openspec-inaction)
- [OpenSpec 官方文档](https://openspec.dev/)

---

## 一、什么是 OpenSpec

OpenSpec 是一个轻量级的**规范驱动开发框架**，专门为 AI 编程助手设计。

**核心理念**：在写代码之前，先让人类和 AI 就"要做什么"达成共识。

**主要解决的问题**：
- AI 代码结果与期望不一致
- AI 自作主张添加/忽略功能
- 上下文丢失导致需求遗忘
- 团队协作时沟通内容无法共享

---

## 二、安装步骤

### 2.1 安装 Node.js

```bash
# 验证 Node.js 版本（需 >= 20.19）
node --version
# 预期输出类似：v20.18.0
```

### 2.2 安装 OpenSpec

```bash
# 全局安装
npm install -g @fission-ai/openspec@latest

# 验证安装
openspec --version
# 当前最新版本：v0.16.0
```

### 2.3 初始化项目

```bash
cd your-project
openspec init
```

在选择菜单中选中你使用的 AI 工具（例如：TRAE、Claude Code、Other）。

**初始化后生成的文件结构**：

```
openspec/
├── AGENTS.md          # AI 的说明书（如何按规范工作）
├── project.md         # 项目介绍（技术栈、代码规范等）
├── config.yaml        # OpenSpec 配置
├── specs/             # 存放功能规范（已归档）
└── changes/           # 存放待实施的变更
```

---

## 三、核心工作流（3 个命令搞定）

| 阶段 | 命令 | 作用 |
|------|------|------|
| **规划** | `/openspec:proposal [描述]` | AI 创建 proposal + tasks + specs delta |
| **执行** | `/openspec:apply [name]` | AI 按 tasks.md 顺序写代码 |
| **归档** | `openspec archive [name]` | 合并 specs，归档历史 |

### 3.1 创建提案

**方式一：使用斜杠命令（推荐）**

```
/openspec:proposal 创建一个待办事项应用，包含：
1. 添加待办事项
2. 标记完成/未完成
3. 删除待办事项
4. localStorage 存储
```

**方式二：使用自然语言**

```
帮我创建一个 OpenSpec 变更提案，用于添加用户登录功能。
```

AI 会在 `openspec/changes/` 下生成变更提案文件夹，包含：
- `proposal.md` - 变更提案说明
- `design.md` - 设计文档
- `tasks.md` - 任务清单（按步骤执行）
- `specs/xxx/spec.md` - 功能规范

### 3.2 审查提案

创建提案后，审查以下文件：

1. **proposal.md** - 确认变更目的和影响范围
2. **tasks.md** - 确认任务清单是否完整合理
3. **specs/xxx/spec.md** - 确认需求描述是否准确

### 3.3 实施变更

```
/openspec:apply add-todo-features
```

AI 会按 `tasks.md` 的顺序执行任务。

### 3.4 验证与归档

```bash
# 验证格式
openspec validate --strict

# 归档（合并 specs，清理 changes）
openspec archive add-todo-features --yes
```

---

## 四、常用 CLI 命令

```bash
# 查看版本
openspec --version

# 查看活跃变更
openspec list

# 查看现有规范
openspec list --specs

# 查看变更详情
openspec show [name]

# 验证格式（严格模式）
openspec validate --strict

# 查看规范差异
openspec diff

# 非交互式归档
openspec archive --yes

# 更新配置
openspec update
```

---

## 五、在 TRAE 中使用

### 5.1 初始化

1. 在终端运行 `openspec init`
2. 选择 TRAE
3. 在 TRAE 中打开项目文件夹

### 5.2 使用流程

1. **打开 AI 聊天**：`Ctrl+L` / `Cmd+L`
2. **创建提案**：输入 `/openspec:proposal [描述]`
3. **审查文件**：在左侧文件树查看 `openspec/changes/`
4. **实施变更**：输入 `/openspec:apply [变更名]`
5. **验证归档**：终端运行 `openspec validate --strict` 和 `openspec archive [变更名] --yes`

### 5.3 提高上下文理解

```bash
# 使用 @codebase 命令让 AI 了解项目
@codebase

# 或选中代码后发起对话
```

---

## 六、规范格式（spec.md）

### 6.1 标准格式

```markdown
## ADDED Requirements

### Requirement: 需求名称
系统 SHALL/MUST 做什么

#### Scenario: 场景名称
- **WHEN** 触发条件
- **THEN** 预期结果
- **AND** 附加结果
```

### 6.2 编写原则

1. **每个需求至少包含一个场景**
2. **使用 SHALL/MUST** 表示强制需求（避免 should/may）
3. **场景必须使用 4 个 # 的标题格式**（`#### Scenario:`）
4. **编码前始终运行验证**：`openspec validate --strict`

---

## 七、项目上下文（project.md）

建议在 `openspec/project.md` 中填写以下内容：

- **技术栈**：语言 / 框架 / 主要库
- **代码约定**：命名规范、文件组织、注释风格
- **架构模式**：目录结构、模块划分、数据流
- **测试策略**：测试框架、覆盖率要求
- **外部依赖**：第三方服务、API 集成

---

## 八、常见问题与解决

### Q1：验证报错

**错误**：`Change must have at least one delta`
**解决**：确保 `changes/xxx/specs/` 下有 `.md` 文件，并包含操作标记（`## ADDED Requirements` 等）

**错误**：`Requirement must have at least one scenario`
**解决**：每个 Requirement 底下至少要有一个 `#### Scenario: 名称`

### Q2：AI 不按规范执行

1. 提醒它遵循 `openspec/AGENTS.md` 指引
2. 让 AI 重新读取 `AGENTS.md`
3. 使用斜杠命令而非纯自然语言

### Q3：团队协作

- 将 `openspec/` 目录纳入 Git
- 每个成员运行 `openspec update` 同步配置
- 代码 review 时同时 review 规范变更
- 保持 `project.md` 更新

### Q4：与其他工具配合

- **OpenSpec + ESLint/Prettier**（规范 vs 风格）
- **OpenSpec + Jest/Vitest**（Scenario 指导测试用例）
- **OpenSpec + Storybook**（规范描述行为，Storybook 展示）

---

## 九、工作流程建议

1. **规范优先**：先定义"做什么"，再讨论"怎么做"
2. **迭代审查**：创建提案后仔细审查再实施
3. **顺序实施**：按 `tasks.md` 的顺序执行，不要跳跃
4. **及时归档**：任务完成后尽快 `openspec archive`，保持 `changes/` 清洁

---

## 十、本项目示例

在星宠漫游馆项目中，已使用 OpenSpec 完成以下变更：

1. **add-todo-app** - 添加待办事项应用
2. **upgrade-to-langgraph-deepseek** - 升级到 LangGraph + DeepSeek API

查看路径：`openspec/changes/`