import { spawn } from 'child_process';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

/**
 * Claude Code MCP Server
 * Provides REST API endpoints for Claude Code integration
 * Part of the 10000x amplification distributed AI agent architecture
 */
class ClaudeCodeMCPServer {
  constructor() {
    this.app = express();
    this.port = process.env.MCP_PORT || 3001;
    this.activeTasks = new Map();
    this.serverStartTime = new Date();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    
    this.app.use(cors({
      origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(','),
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing with size limits
    this.app.use(express.json({ 
      limit: process.env.MAX_REQUEST_SIZE || '10mb',
      strict: true
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: process.env.MAX_REQUEST_SIZE || '10mb'
    }));

    // Request logging
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      const userAgent = req.get('User-Agent') || 'unknown';
      console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip} - ${userAgent}`);
      next();
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error(`[${new Date().toISOString()}] ERROR:`, err);
      
      if (err.type === 'entity.too.large') {
        return res.status(413).json({
          error: 'Request entity too large',
          message: 'The request payload is too large'
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const uptime = Date.now() - this.serverStartTime.getTime();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime_ms: uptime,
        active_tasks: this.activeTasks.size,
        version: '1.0.0',
        service: 'claude-code-mcp'
      });
    });

    // Root endpoint - API info
    this.app.get('/', (req, res) => {
      res.json({
        service: 'Claude Code MCP Server',
        version: '1.0.0',
        description: 'Distributed AI agent architecture - 10000x amplification',
        endpoints: {
          health: 'GET /health',
          analyze: 'POST /claude-code/analyze',
          execute: 'POST /claude-code/execute',
          status: 'GET /claude-code/status',
          task: 'GET /claude-code/task/:taskId'
        },
        uptime_ms: Date.now() - this.serverStartTime.getTime()
      });
    });

    // Claude Code analyze endpoint
    this.app.post('/claude-code/analyze', async (req, res) => {
      try {
        const { project_path, analysis_type = 'structure' } = req.body;
        
        if (!project_path) {
          return res.status(400).json({ 
            error: 'Bad Request',
            message: 'project_path is required' 
          });
        }

        const validAnalysisTypes = ['structure', 'health', 'dependencies', 'issues'];
        if (!validAnalysisTypes.includes(analysis_type)) {
          return res.status(400).json({
            error: 'Bad Request',
            message: `analysis_type must be one of: ${validAnalysisTypes.join(', ')}`
          });
        }

        console.log(`[ANALYZE] Starting analysis: ${analysis_type} for ${project_path}`);

        const result = await this.executeClaudeCode('analyze', [
          `--type=${analysis_type}`,
          `/workspace/projects/${project_path}`
        ]);

        console.log(`[ANALYZE] Completed analysis for ${project_path}`);

        res.json({
          status: 'success',
          analysis_type,
          project_path,
          results: result.output,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('[ANALYZE] Error:', error.message);
        res.status(500).json({
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Claude Code execute endpoint
    this.app.post('/claude-code/execute', async (req, res) => {
      try {
        const { task_description, project_path, context, priority = 'medium' } = req.body;
        
        if (!task_description || !project_path) {
          return res.status(400).json({ 
            error: 'Bad Request',
            message: 'task_description and project_path are required' 
          });
        }

        const validPriorities = ['low', 'medium', 'high', 'critical'];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({
            error: 'Bad Request',
            message: `priority must be one of: ${validPriorities.join(', ')}`
          });
        }

        const taskId = uuidv4();
        const taskInfo = {
          task_description,
          project_path,
          context: context || '',
          priority,
          status: 'running',
          started_at: new Date().toISOString()
        };

        this.activeTasks.set(taskId, taskInfo);

        console.log(`[EXECUTE] Starting task ${taskId}: ${task_description}`);

        // Execute task
        try {
          const result = await this.executeClaudeCode('execute', [
            `--task="${task_description}"`,
            `--context="${context || ''}"`,
            `--priority=${priority}`,
            `/workspace/projects/${project_path}`
          ]);

          const completedTask = {
            ...taskInfo,
            status: 'completed',
            completed_at: new Date().toISOString(),
            results: result.output
          };

          this.activeTasks.set(taskId, completedTask);

          console.log(`[EXECUTE] Completed task ${taskId}`);

          res.json({
            status: 'completed',
            task_id: taskId,
            task_description,
            project_path,
            results: result.output,
            timestamp: new Date().toISOString()
          });
        } catch (execError) {
          const failedTask = {
            ...taskInfo,
            status: 'failed',
            failed_at: new Date().toISOString(),
            error: execError.message
          };

          this.activeTasks.set(taskId, failedTask);
          throw execError;
        }
      } catch (error) {
        console.error('[EXECUTE] Error:', error.message);
        res.status(500).json({
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Status endpoint
    this.app.get('/claude-code/status', async (req, res) => {
      try {
        const result = await this.executeClaudeCode('--version');
        
        const taskSummary = {
          total: this.activeTasks.size,
          running: Array.from(this.activeTasks.values()).filter(t => t.status === 'running').length,
          completed: Array.from(this.activeTasks.values()).filter(t => t.status === 'completed').length,
          failed: Array.from(this.activeTasks.values()).filter(t => t.status === 'failed').length
        };

        res.json({
          status: 'operational',
          claude_code_version: result.output.trim(),
          server_uptime_ms: Date.now() - this.serverStartTime.getTime(),
          tasks: taskSummary,
          container_health: 'healthy',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('[STATUS] Error:', error.message);
        res.status(500).json({
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Task status endpoint
    this.app.get('/claude-code/task/:taskId', (req, res) => {
      const { taskId } = req.params;
      const task = this.activeTasks.get(taskId);
      
      if (!task) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Task not found' 
        });
      }
      
      res.json({
        task_id: taskId,
        ...task,
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        available_endpoints: [
          'GET /',
          'GET /health',
          'POST /claude-code/analyze',
          'POST /claude-code/execute',
          'GET /claude-code/status',
          'GET /claude-code/task/:taskId'
        ]
      });
    });
  }

  async executeClaudeCode(command, args = []) {
    return new Promise((resolve, reject) => {
      console.log(`[CLAUDE-CODE] Executing: claude-code ${command} ${args.join(' ')}`);
      
      const process = spawn('claude-code', [command, ...args], {
        cwd: '/workspace',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          HOME: '/home/claude',
          PATH: '/home/claude/.npm-global/bin:' + process.env.PATH
        }
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`[CLAUDE-CODE] Success: ${command}`);
          resolve({ success: true, output: stdout, error: null });
        } else {
          console.error(`[CLAUDE-CODE] Failed: ${command} (exit code: ${code})`);
          console.error(`[CLAUDE-CODE] Stderr: ${stderr}`);
          reject(new Error(`Claude Code failed with exit code ${code}: ${stderr || stdout}`));
        }
      });

      process.on('error', (err) => {
        console.error(`[CLAUDE-CODE] Process error: ${err.message}`);
        reject(new Error(`Failed to start claude-code: ${err.message}`));
      });

      // Timeout handling
      const timeout = parseInt(process.env.CLAUDE_CODE_TIMEOUT) || 300000; // 5 minutes
      const timeoutId = setTimeout(() => {
        console.warn(`[CLAUDE-CODE] Timeout after ${timeout}ms, killing process`);
        process.kill('SIGTERM');
        reject(new Error(`Claude Code operation timed out after ${timeout}ms`));
      }, timeout);

      process.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
  }

  start() {
    const host = process.env.MCP_HOST || '0.0.0.0';
    this.app.listen(this.port, host, () => {
      console.log(`🚀 Claude Code MCP Server running on ${host}:${this.port}`);
      console.log(`📊 Health check: http://${host}:${this.port}/health`);
      console.log(`📚 API docs: http://${host}:${this.port}/`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ Ready for 10000x amplification!`);
    });
  }
}

// Start server
const server = new ClaudeCodeMCPServer();
server.start();

export default ClaudeCodeMCPServer;
