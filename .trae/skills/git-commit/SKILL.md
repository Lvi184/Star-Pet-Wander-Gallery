---
name: git-commit
description: 自动分析代码变更，按规范生成提交信息，自动暂存并安全提交。管理项目版本迭代，全程保留开发记录，符合大赛「作品使用 TRAE 创作」的留痕要求。
allowed-tools: Bash(git)
license: MIT
metadata:
  author: TRAE Skills
  version: "1.0"
---

自动生成规范的 Git 提交信息。

**输入**: 用户要求提交代码，或无明确输入时自动检测当前变更

**Steps**

1. **检查当前工作区状态**
   ```bash
   git status
   ```

2. **获取变更详情**
   ```bash
   git diff --cached --name-only 2>/dev/null || git diff --name-only
   ```

3. **分析变更类型**
   - 新增文件 → feat: 或 docs:
   - 修改文件 → fix: 或 feat: 或 refactor:
   - 删除文件 → chore:
   - 配置文件 → config:

4. **生成提交信息**
   根据变更内容自动生成符合 Conventional Commits 规范的提交信息：
   ```
   <type>(<scope>): <description>

   <body>
   ```

5. **自动暂存并提交**
   ```bash
   git add -A
   git commit -m "<generated message>"
   ```

**输出**

- 显示生成的提交信息
- 显示提交结果
- 提醒用户变更已记录

**使用示例**

```
@git-commit 提交当前变更
@git-commit 提交修复宠物状态更新的bug
@git-commit feat: 添加宠物社交功能
```