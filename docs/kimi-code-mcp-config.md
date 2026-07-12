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

# Claude AI MCP 配置

## 概述

通过 Anthropic API 调用 Claude AI 的 MCP 服务器配置。

## 环境信息

- **MCP 配置路径**: `C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\`
- **依赖**: 需要配置 `ANTHROPIC_API_KEY` 环境变量
- **默认模型**: `claude-3-sonnet-20240229`

## 配置步骤

### 1. 创建 MCP 目录

```bash
mkdir -p "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\tools"
```

### 2. 创建 SERVER_METADATA.json

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\SERVER_METADATA.json" << 'EOF'
{
  "server_name": "mcp_claude",
  "command": "python",
  "args": ["C:\\Users\\jiaendu\\.trae-cn\\mcps\\s_全民宠物_星宠漫游馆_-5a93f713\\solo_agent\\mcp_claude\\claude_server.py"],
  "env": {
    "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
  }
}
EOF
```

### 3. 创建 Claude 服务器脚本

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\claude_server.py" << 'EOF'
import sys
import json
import http.client
import os

API_KEY = os.environ.get("ANTHROPIC_API_KEY")
BASE_URL = "api.anthropic.com"
API_VERSION = "2023-06-01"
MODEL = "claude-3-sonnet-20240229"


def call_claude(prompt):
    if not API_KEY:
        return json.dumps({"error": "ANTHROPIC_API_KEY environment variable not set"})

    try:
        conn = http.client.HTTPSConnection(BASE_URL)
        
        payload = json.dumps({
            "model": MODEL,
            "max_tokens": 4096,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
        
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
            "anthropic-version": API_VERSION
        }
        
        conn.request("POST", "/v1/messages", payload, headers)
        response = conn.getresponse()
        data = response.read().decode("utf-8")
        conn.close()
        
        result = json.loads(data)
        
        if "content" in result and result["content"]:
            content = result["content"][0]["text"]
            return json.dumps({"response": content, "model": MODEL})
        else:
            return json.dumps({"error": "Invalid response from API", "raw": data})
            
    except Exception as e:
        return json.dumps({"error": str(e)})


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No prompt provided"}))
        return
    
    prompt = " ".join(sys.argv[1:])
    result = call_claude(prompt)
    print(result)


if __name__ == "__main__":
    main()
EOF
```

### 4. 创建工具配置文件

#### claude_prompt.json - AI 提示工具

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\tools\claude_prompt.json" << 'EOF'
{
  "name": "claude_prompt",
  "description": "Send a prompt to Claude AI (Anthropic) for intelligent response.",
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string",
        "description": "The prompt to send to Claude AI."
      }
    },
    "required": ["prompt"]
  },
  "returns": {
    "type": "string",
    "description": "Claude's response"
  }
}
EOF
```

#### claude_code.json - 代码生成工具

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\tools\claude_code.json" << 'EOF'
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
  },
  "returns": {"type": "string", "description": "Generated code"}
}
EOF
```

#### claude_writer.json - 写作辅助工具

```bash
cat > "C:\Users\jiaendu\.trae-cn\mcps\s_全民宠物_星宠漫游馆_-5a93f713\solo_agent\mcp_claude\tools\claude_writer.json" << 'EOF'
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
  },
  "returns": {"type": "string", "description": "Generated text"}
}
EOF
```

## 使用方法

### 配置 API Key

```bash
# 设置环境变量（Windows PowerShell）
$env:ANTHROPIC_API_KEY = "your_api_key_here"

# 永久设置（Windows）
setx ANTHROPIC_API_KEY "your_api_key_here"
```

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

# 验证 API Key
echo $env:ANTHROPIC_API_KEY
```

## 注意事项

1. **API Key**: 需要在 Anthropic 官网获取 API Key
2. **网络要求**: 确保网络连通性
3. **费用**: 使用 Claude API 会产生费用，请留意用量
4. **模型选择**: 当前默认使用 claude-3-sonnet，可在 claude_server.py 中修改

## 相关链接

- **Anthropic 官网**: https://www.anthropic.com
- **Claude API 文档**: https://docs.anthropic.com/claude/reference/getting-started-with-the-api
