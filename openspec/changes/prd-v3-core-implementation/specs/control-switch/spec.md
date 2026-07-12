## ADDED Requirements

### Requirement: 控制权切换机制
系统SHALL实现player/agent/transitioning三种控制状态的无缝切换。

#### Scenario: 用户接管角色
- **WHEN** 用户点击"与它同行"
- **THEN** 系统进入transitioning状态，等待AI动作完成后切换到player

#### Scenario: 用户交还AI
- **WHEN** 用户点击"让它自己去吧"
- **THEN** 系统记录ControlHandoverEvent，切换到agent状态

### Requirement: 角色级锁与版本号
系统SHALL实现角色级控制权锁与版本号，防止并发操作。

#### Scenario: 并发保护
- **WHEN** 两个会话同时尝试操控同一角色
- **THEN** 系统拒绝后到的请求，返回版本冲突错误

#### Scenario: 版本号递增
- **WHEN** 控制权切换完成
- **THEN** 系统递增controller_version

### Requirement: 会话心跳机制
系统SHALL实现客户端会话心跳，超时后自动释放控制权。

#### Scenario: 心跳超时
- **WHEN** 客户端超过阈值未发送心跳
- **THEN** 系统将角色设为可交接状态

#### Scenario: Demo模式模拟离线
- **WHEN** 用户点击"模拟离线"按钮
- **THEN** 系统立即触发AI接管流程