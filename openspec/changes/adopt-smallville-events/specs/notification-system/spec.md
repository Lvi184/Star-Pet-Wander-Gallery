# Notification System - Specification

## Description

Notification System 实现通知管理功能，支持发送、接收、处理通知，宠物可以查看和响应通知。

## ADDED Requirements

### Requirement: Notification Sending

系统 SHALL 支持发送活动邀请和节日通知。

#### Scenario: 发送活动邀请

```
Given 创建了新活动
When 系统发送活动邀请通知
Then 系统为所有宠物创建通知记录
And 系统设置通知类型为 event_invitation
And 系统设置通知状态为 unread
```

### Requirement: Notification Viewing

系统 SHALL 支持宠物查看通知列表。

#### Scenario: 查看通知

```
Given 宠物有未读通知
When 宠物查看通知列表
Then 系统返回所有通知
And 系统按创建时间倒序排列
And 系统标记通知为已读
```

### Requirement: Notification Response

系统 SHALL 支持宠物接受或拒绝邀请。

#### Scenario: 接受邀请

```
Given 宠物收到活动邀请通知
When 宠物接受邀请
Then 系统更新通知状态为 accepted
And 系统将宠物加入活动参与者列表
```

### Requirement: Notification Batch Processing

系统 SHALL 支持批量标记通知为已读。

#### Scenario: 标记全部已读

```
Given 宠物有多个未读通知
When 宠物标记全部已读
Then 系统将所有通知状态更新为 read
And 系统设置 read_at 字段
```

## ACCEPTANCE CRITERIA

- [ ] 活动邀请正常发送
- [ ] 节日通知正常发送
- [ ] 通知列表正常显示
- [ ] 通知响应正常处理
- [ ] 批量标记已读正常工作