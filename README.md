# Claude Code Docker MCP

🚀 **Distributed AI Agent Architecture for 10000x Amplification**

A containerized Claude Code environment with MCP (Model Context Protocol) server integration. This project enables systematic infrastructure for distributed AI agents working in parallel coordination.

## 🎯 Philosophy

> "Careful architecture beats rushed implementation" - Jordan Ehrig

This project embodies systematic infrastructure development, preventing technical debt while enabling genuine productivity amplification through specialized AI coordination.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLAUDE (MELCHIOR)                  │
│                  ┌─────────────────┐                   │
│                  │  MCP Tools      │                   │
│                  │  Ecosystem      │                   │
│                  └─────────┬───────┘                   │
└──────────────────────────────┼───────────────────────────┘
                              │
                    ┌─────────┴───────────┐
                    │   Claude Code MCP   │
                    │   (This Project)    │
                    └─────────┬───────────┘
                              │
┌─────────────────────────────┼───────────────────────────┐
│             DOCKER CONTAINER                           │
│  ┌──────────────────────────┼─────────────────────────┐  │
│  │        MCP SERVER        │                         │  │
│  │                          ▼                         │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │           CLAUDE CODE ENGINE                │   │  │
│  │  │                                             │   │  │
│  │  │  • Project Analysis                         │   │  │
│  │  │  • Multi-file Implementation               │   │  │
│  │  │  • Recursive Debugging                     │   │  │
│  │  │  • Comprehensive Refactoring               │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Mounted Volumes: /workspace -> Host Project Directories  │
└───────────────────────────────────────────────────────────┘
```

## ⚡ Amplification Architecture

### Current Workflow Evolution
```
L1 (10x):   Memory → Sequential → Store
L2 (100x):  Memory → Sequential → Sandbox → Store  
L3 (1000x): Memory → Sequential → (Parallel: Sandbox + LocalLLM) → Store
L4 (10000x): Memory → Sequential → (Parallel: Sandbox + LocalLLM + ClaudeCode) → Store
```

### Agent Specialization
- **MELCHIOR (Claude):** Conductor & Architect - Planning, coordination, high-level decisions
- **CLAUDE CODE:** Coding Specialist - Project-wide context, recursive resolution, comprehensive implementation
- **LOCAL LLM:** Research Sidekick - Domain knowledge, parallel analysis, validation
- **SANDBOXES:** Computation Engine - Heavy processing, testing, data analysis

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Anthropic API key
- Windows with Docker Desktop (Claude Code requires Linux container)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SamuraiBuddha/claude-code-docker-mcp.git
   cd claude-code-docker-mcp
   ```

2. **Configure environment**
   ```bash
   cp .env.template .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Create project directories**
   ```bash
   mkdir -p projects logs
   ```

4. **Build and start**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:3001/health
   ```

## 📚 API Endpoints

### Health Check
```bash
GET /health
# Returns: server status, uptime, active tasks
```

### Project Analysis
```bash
POST /claude-code/analyze
{
  "project_path": "my-project",
  "analysis_type": "structure|health|dependencies|issues"
}
```

### Task Execution
```bash
POST /claude-code/execute
{
  "task_description": "Add error handling to main file",
  "project_path": "my-project",
  "context": "Express.js application with TypeScript",
  "priority": "medium"
}
```

### Status Check
```bash
GET /claude-code/status
# Returns: Claude Code version, task summary, system health
```

### Task Monitoring
```bash
GET /claude-code/task/:taskId
# Returns: detailed task status and results
```

## 🛡️ Security Features

- **Container Security:** Non-root user, limited capabilities, resource limits
- **API Security:** Rate limiting, input validation, CORS policies, security headers
- **Secret Management:** Environment-based configuration, no secrets in images
- **Network Security:** Localhost binding, isolated container networking

## 📁 Project Structure

```
claude-code-docker-mcp/
├── .env.template          # Environment configuration template
├── .gitignore            # Comprehensive exclusions (secrets, logs, etc.)
├── secrets.md            # Secret management protocols
├── SECURITY.md           # Security policy and incident response
├── Dockerfile            # Multi-stage container build
├── docker-compose.yml    # Service orchestration with security
├── src/
│   ├── mcp-server.js     # Main MCP server implementation
│   ├── health-check.js   # Container health monitoring
│   └── package.json      # Node.js dependencies
├── projects/             # Mount point for project access
├── logs/                 # Container logs
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | required | Your Anthropic API key |
| `MCP_PORT` | 3001 | MCP server port |
| `MCP_HOST` | 127.0.0.1 | Bind address (localhost only) |
| `CLAUDE_CODE_LOG_LEVEL` | info | Logging verbosity |
| `CLAUDE_CODE_TIMEOUT` | 300000 | Task timeout in milliseconds |
| `CONTAINER_MEMORY_LIMIT` | 2g | Docker memory limit |
| `CONTAINER_CPU_LIMIT` | 1.0 | Docker CPU limit |

### Volume Mounts

- `./projects:/workspace/projects:rw` - Project file access
- `./logs:/workspace/logs:rw` - Container logs

## 🚀 Usage Examples

### Analyze Project Structure
```bash
curl -X POST http://localhost:3001/claude-code/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "project_path": "my-webapp",
    "analysis_type": "structure"
  }'
```

### Implement Feature
```bash
curl -X POST http://localhost:3001/claude-code/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task_description": "Add user authentication with JWT tokens",
    "project_path": "my-webapp",
    "context": "Express.js REST API with MongoDB",
    "priority": "high"
  }'
```

### Debug Issues
```bash
curl -X POST http://localhost:3001/claude-code/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task_description": "Fix memory leak in user session management",
    "project_path": "my-webapp",
    "context": "Memory usage increases over time, suspect session storage",
    "priority": "critical"
  }'
```

## 📊 Monitoring

### Health Checks
- Docker health check every 30 seconds
- HTTP endpoint monitoring
- Claude Code binary verification
- Resource usage tracking

### Logging
- Structured JSON logging
- Request/response tracking
- Claude Code execution logs
- Error handling and reporting

## 🔄 Development Phases

### ✅ Phase 1: Proof of Concept
- [x] Basic Dockerfile with Claude Code installation
- [x] Container startup and health verification
- [x] Simple command execution test
- [x] Volume mounting validation

### ✅ Phase 2: Basic MCP Server
- [x] MCP server framework implementation
- [x] Health check and status endpoints
- [x] Basic error handling and logging
- [x] Container networking configuration

### ✅ Phase 3: Core Functionality
- [x] `claude_code_analyze` function implementation
- [x] `claude_code_execute` function implementation
- [x] Request validation and sanitization
- [x] Comprehensive error handling

### 🎯 Phase 4: Integration Testing
- [ ] Integration with existing MCP ecosystem
- [ ] Real project testing scenarios
- [ ] Performance benchmarking
- [ ] Tool chain validation

### 🎯 Phase 5: Production Hardening
- [ ] Security audit and hardening
- [ ] Resource optimization
- [ ] Monitoring and alerting
- [ ] Documentation and runbooks

## 🤝 Contributing

Contributions are welcome! Please read our security policy and follow the systematic development approach:

1. Fork the repository
2. Create a feature branch
3. Test thoroughly in isolation
4. Submit pull request with detailed description

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/SamuraiBuddha/claude-code-docker-mcp/issues)
- **Security:** See SECURITY.md for vulnerability reporting
- **Documentation:** Check the `/docs` directory for detailed guides

## 🔗 Related Projects

- [CORTEX-AI-Orchestrator-v2](https://github.com/SamuraiBuddha/CORTEX-AI-Orchestrator-v2) - n8n-based AI orchestration
- [tool-combo-chains](https://github.com/SamuraiBuddha/tool-combo-chains) - Memory × Sequential × Sandbox architecture

---

**🎯 Ready to unlock 10000x amplification through distributed AI coordination!** 🚀

*Built with systematic infrastructure principles by Jordan Ehrig for the MAGI distributed AI architecture.*