# Kimi Code MCP 配置文档

## 概述

本文档记录了将 Kimi Code CLI 配置为 TRAE MCP 服务器的完整步骤和使用方法。

## 环境信息

- **Kimi Code 路径**: `C:\Users\jiaendu\.kimi-code\bin\kimi.exe`
- **MCP 配置路径**: `C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_kimi_code\`

## 配置步骤

### 1. 创建 MCP 目录

```bash
mkdir -p "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_kimi_code\tools"
```

### 2. 创建 SERVER_METADATA.json

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_kimi_code\SERVER_METADATA.json" << 'EOF'
{
  "server_name": "mcp_kimi_code",
  "command": "C:\\Users\\jiaendu\\.kimi-code\\bin\\kimi.exe",
  "args": ["acp"],
  "env": {}
}
EOF
```

### 3. 创建工具配置文件

#### kimi_prompt.json - AI 提示工具

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_kimi_code\tools\kimi_prompt.json" << 'EOF'
{
  "name": "kimi_prompt",
  "description": "Send a prompt to Kimi Code AI for intelligent response. Use this for code generation, debugging, analysis, and other AI-powered tasks.",
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string",
        "description": "The prompt to send to Kimi Code AI. Be specific about what you want."
      }
    },
    "required": ["prompt"]
  },
  "returns": {
    "type": "string",
    "description": "The AI's response to the prompt"
  }
}
EOF
```

#### kimi_session.json - 会话管理工具

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_kimi_code\tools\kimi_session.json" << 'EOF'
{
  "name": "kimi_session",
  "description": "Resume or continue a Kimi Code session for extended tasks. Use this for multi-step code generation or debugging sessions.",
  "parameters": {
    "type": "object",
    "properties": {
      "session_id": {
        "type": "string",
        "description": "Optional session ID to resume. If not provided, continues the previous session."
      }
    },
    "required": []
  },
  "returns": {
    "type": "string",
    "description": "The session response"
  }
}
EOF
```

#### kimi_server.json - 服务器启动工具

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_kimi_code\tools\kimi_server.json" << 'EOF'
{
  "name": "kimi_server",
  "description": "Start the local Kimi server for web UI access. This runs in the background.",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "returns": {
    "type": "string",
    "description": "Server status message"
  }
}
EOF
```

## 使用方法

### 在 TRAE 中调用 Kimi Code

#### 方式一：使用 run_mcp 工具

```python
# 发送提示给 Kimi AI
run_mcp(
    server_name="mcp_kimi_code",
    tool_name="kimi_prompt",
    args={"prompt": "帮我生成一个 Python 函数"}
)

# 恢复会话
run_mcp(
    server_name="mcp_kimi_code",
    tool_name="kimi_session",
    args={"session_id": "your_session_id"}
)

# 启动服务器
run_mcp(
    server_name="mcp_kimi_code",
    tool_name="kimi_server",
    args={}
)
```

### Kimi Code CLI 常用命令

```bash
# 查看帮助
kimi.exe --help

# 登录认证（首次使用必须）
kimi.exe login

# 发送一次性提示
kimi.exe -p "帮我生成代码"

# 启动本地服务器
kimi.exe server

# 打开 Web UI
kimi.exe web

# 继续上次会话
kimi.exe -c

# 使用指定模型
kimi.exe -m deepseek-chat

# 导出会话
kimi.exe export <sessionId>
```

## 配置验证

```bash
# 验证 kimi.exe 路径
ls "C:\Users\jiaendu\.kimi-code\bin\"

# 验证 MCP 配置文件
ls "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_kimi_code\"
```

## 注意事项

1. **首次使用**：需要先运行 `kimi.exe login` 进行设备认证
2. **网络要求**：确保网络连通性，Kimi Code 需要连接云端服务
3. **会话管理**：使用 `-c` 参数可以继续上次的工作会话
4. **模型选择**：默认使用配置文件中的模型，可通过 `-m` 参数指定其他模型

## 相关链接

- **Kimi Code 文档**: https://moonshotai.github.io/kimi-code/
- **项目文档**: `../改进计划.md`
- **记录日志**: `../记录日志.md`

---

# Claude AI MCP 配置（讯飞模型替代）

## 概述

通过 Anthropic API 兼容接口调用 Claude AI 的 MCP 服务器配置，使用讯飞 Maas Coding API 作为后端模型服务。

## 环境信息

- **MCP 配置路径**: `C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\`
- **API 密钥**: `ANTHROPIC_AUTH_TOKEN`（讯飞平台 token）
- **API Base URL**: `https://maas-coding-api.cn-huabei-1.xf-yun.com/anthropic`
- **默认模型**: `astron-code-latest`

## 配置步骤

### 1. 创建 MCP 目录

```bash
mkdir -p "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\tools"
```

### 2. 创建 SERVER_METADATA.json

```json
{
  "server_name": "mcp_claude",
  "description": "Claude AI MCP Server (Xunfei ModelScope)"
}
```

### 3. 创建 Claude 服务器脚本（claude_server.py）

```python
import sys
import json
import os
import http.client
import ssl
from urllib.parse import urlparse

API_KEY = os.environ.get("ANTHROPIC_AUTH_TOKEN", os.environ.get("ANTHROPIC_API_KEY"))
BASE_URL = os.environ.get("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-3-sonnet-20240229")
API_VERSION = "2023-06-01"

parsed_url = urlparse(BASE_URL)
HOST = parsed_url.hostname
PORT = parsed_url.port or 443
PATH_PREFIX = parsed_url.path.rstrip('/')

TOOLS = [
    {
        "name": "claude_prompt",
        "description": "Send a prompt to Claude AI for intelligent response.",
        "parameters": {
            "type": "object",
            "properties": {"prompt": {"type": "string", "description": "The prompt to send to Claude AI."}},
            "required": ["prompt"]
        }
    },
    {
        "name": "claude_code",
        "description": "Get code generation help from Claude AI.",
        "parameters": {
            "type": "object",
            "properties": {
                "language": {"type": "string", "description": "Programming language"},
                "task": {"type": "string", "description": "What you want to do"},
                "code": {"type": "string", "description": "Existing code (optional)"}
            },
            "required": ["language", "task"]
        }
    },
    {
        "name": "claude_writer",
        "description": "Get writing assistance from Claude AI.",
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {"type": "string", "description": "Topic to write about"},
                "style": {"type": "string", "description": "Writing style"},
                "length": {"type": "string", "description": "Desired length"}
            },
            "required": ["topic"]
        }
    }
]


def call_claude(prompt):
    if not API_KEY:
        return {"error": "ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY environment variable not set"}

    try:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        conn = http.client.HTTPSConnection(HOST, PORT, context=context)
        
        payload = json.dumps({
            "model": MODEL,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}]
        })
        
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
            "anthropic-version": API_VERSION
        }
        
        full_path = f"{PATH_PREFIX}/v1/messages" if PATH_PREFIX else "/v1/messages"
        conn.request("POST", full_path, payload, headers)
        response = conn.getresponse()
        data = response.read().decode("utf-8")
        conn.close()
        
        result = json.loads(data)
        
        if "content" in result and result["content"]:
            content = result["content"][0]["text"]
            return {"response": content, "model": MODEL}
        else:
            return {"error": "Invalid response from API", "raw": data}
            
    except Exception as e:
        return {"error": str(e)}


def handle_request(request):
    method = request.get("method")
    params = request.get("params", {})
    request_id = request.get("id")

    response = {"jsonrpc": "2.0", "id": request_id}

    if method == "initialize":
        response["result"] = {"name": "mcp_claude", "description": "Claude AI MCP Server", "version": "1.0.0"}
    elif method == "tools/list":
        response["result"] = TOOLS
    elif method == "tools/call":
        tool_name = params.get("name")
        tool_params = params.get("arguments", {})

        if tool_name == "claude_prompt":
            prompt = tool_params.get("prompt", "")
            result = call_claude(prompt)
            response["result"] = {"content": json.dumps(result)}
        elif tool_name == "claude_code":
            language = tool_params.get("language", "")
            task = tool_params.get("task", "")
            code = tool_params.get("code", "")
            prompt = f"请帮我用{language}语言实现以下功能：{task}"
            if code:
                prompt += f"\n现有代码：\n{code}"
            result = call_claude(prompt)
            response["result"] = {"content": json.dumps(result)}
        elif tool_name == "claude_writer":
            topic = tool_params.get("topic", "")
            style = tool_params.get("style", "")
            length = tool_params.get("length", "")
            prompt = f"请以{style}风格写一篇关于'{topic}'的文章，长度要求：{length}"
            result = call_claude(prompt)
            response["result"] = {"content": json.dumps(result)}
        else:
            response["error"] = {"code": -32601, "message": f"Method not found: {tool_name}"}
    else:
        response["error"] = {"code": -32601, "message": f"Method not found: {method}"}

    return response


def main():
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            line = line.strip()
            if not line:
                continue
            try:
                request = json.loads(line)
                response = handle_request(request)
                print(json.dumps(response), flush=True)
            except json.JSONDecodeError:
                print(json.dumps({"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}}), flush=True)
        except EOFError:
            break


if __name__ == "__main__":
    main()
```

### 4. 创建工具配置文件

#### claude_prompt.json - AI 提示工具

```json
{
  "name": "claude_prompt",
  "description": "Send a prompt to Claude AI for intelligent response.",
  "arguments": {
    "type": "object",
    "properties": {
      "prompt": {"type": "string", "description": "The prompt to send to Claude AI."}
    },
    "required": ["prompt"],
    "additionalProperties": false,
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

#### claude_code.json - 代码生成工具

```json
{
  "name": "claude_code",
  "description": "Get code generation help from Claude AI.",
  "arguments": {
    "type": "object",
    "properties": {
      "language": {"type": "string", "description": "Programming language"},
      "task": {"type": "string", "description": "What you want to do"},
      "code": {"type": "string", "description": "Existing code (optional)"}
    },
    "required": ["language", "task"],
    "additionalProperties": false,
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

#### claude_writer.json - 写作辅助工具

```json
{
  "name": "claude_writer",
  "description": "Get writing assistance from Claude AI.",
  "arguments": {
    "type": "object",
    "properties": {
      "topic": {"type": "string", "description": "Topic to write about"},
      "style": {"type": "string", "description": "Writing style"},
      "length": {"type": "string", "description": "Desired length"}
    },
    "required": ["topic"],
    "additionalProperties": false,
    "$schema": "http://json-schema.org/draft-07/schema#"
  }
}
```

## 使用方法

### 配置环境变量（系统级）

需要先设置系统级环境变量，TRAE 启动 MCP 服务器时才能访问：

```powershell
# 永久设置（Windows，需要重启 TRAE 生效）
setx ANTHROPIC_AUTH_TOKEN "<your-xunfei-auth-token>"
setx ANTHROPIC_BASE_URL "https://maas-coding-api.cn-huabei-1.xf-yun.com/anthropic"
setx ANTHROPIC_MODEL "astron-code-latest"
```

> **注意**: 从 `~/.claude/settings.json` 文件中获取 `ANTHROPIC_AUTH_TOKEN` 的值

### 在 TRAE 中调用 Claude AI

```python
# 发送提示
run_mcp(
    server_name="mcp_claude",
    tool_name="claude_prompt",
    args={"prompt": "帮我生成一个 Python 函数"}
)

# 代码生成
run_mcp(
    server_name="mcp_claude",
    tool_name="claude_code",
    args={"language": "Python", "task": "创建一个待办事项管理器"}
)

# 写作辅助
run_mcp(
    server_name="mcp_claude",
    tool_name="claude_writer",
    args={"topic": "AI宠物应用的设计思路", "style": "creative", "length": "medium"}
)
```

## 配置验证

```bash
# 验证配置文件
ls "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\"

# 测试服务器初始化
echo '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' | python "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\claude_server.py"

# 测试工具列表
echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":2}' | python "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\claude_server.py"
```bash
# 测试 API 调用（需先设置环境变量）
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"claude_prompt","arguments":{"prompt":"Hello"}},"id":3}' | python "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\claude_server.py"
```

## 测试结果

| 测试项 | 状态 | 说明 |
|--------|------|------|
| `initialize` | ✅ | 服务器初始化正常 |
| `tools/list` | ✅ | 工具列表返回正常 |
| `claude_prompt` | ✅ | 成功调用讯飞模型，返回中文问候语 |
| `claude_code` | ✅ | 成功生成 Python 计算器代码 |

## 注意事项

1. **API Key**: 使用讯飞 Maas Coding 平台的 token，配置在 `~/.claude/settings.json` 中
2. **网络要求**: 确保网络连通性，支持 SSL 连接
3. **模型**: 当前使用 `astron-code-latest`，可通过 `ANTHROPIC_MODEL` 环境变量修改
4. **SSL 证书**: 由于讯飞 API 证书问题，服务器已禁用 SSL 证书验证

## 相关链接

- **讯飞 Maas Coding**: https://maas.xfyun.cn/
- **Claude Code 配置**: `~/.claude/settings.json`
