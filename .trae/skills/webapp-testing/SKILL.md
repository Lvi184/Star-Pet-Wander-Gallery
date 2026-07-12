---
name: webapp-testing
description: 基于 Playwright 自动生成前端自动化测试脚本，支持功能验证、界面调试、截图对比。网页 Demo 提交前，自动测试宠物状态面板、漫游日记、交互按钮，保证提交版本稳定可用。
allowed-tools: Bash(npx,playwright), Read, Shell
license: MIT
metadata:
  author: TRAE Skills
  version: "1.0"
---

前端自动化测试工具，基于 Playwright。

**输入**: 用户指定要测试的页面或功能模块

**测试能力**

1. **功能验证**
   - 页面加载测试
   - 按钮点击测试
   - 表单提交测试
   - 数据展示验证

2. **界面调试**
   - 元素定位验证
   - 样式一致性检查
   - 响应式布局测试
   - 组件渲染验证

3. **截图对比**
   - 页面快照保存
   - 视觉回归测试
   - 跨版本对比

4. **性能测试**
   - 首屏加载时间
   - 组件渲染耗时
   - 接口响应时间

**Steps**

1. **检查 Playwright 环境**
   ```bash
   npx playwright --version
   ```

2. **生成测试脚本**
   根据用户输入自动生成对应的测试用例：
   - 宠物状态面板测试
   - 漫游日记时间线测试
   - 星球探索地图测试
   - 交互按钮功能测试

3. **执行测试**
   ```bash
   npx playwright test
   ```

4. **生成测试报告**
   ```bash
   npx playwright show-report
   ```

**输出**

- 测试执行结果
- 失败用例详情
- 性能指标
- 截图对比结果

**使用示例**

```
@webapp-testing 测试宠物状态面板
@webapp-testing 测试漫游日记页面
@webapp-testing 运行所有前端测试
```