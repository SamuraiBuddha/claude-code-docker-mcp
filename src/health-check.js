import http from 'http';

/**
 * Health Check Script for Claude Code MCP Server
 * Used by Docker health checks and monitoring systems
 */

const healthCheck = () => {
  const options = {
    hostname: 'localhost',
    port: process.env.MCP_PORT || 3001,
    path: '/health',
    method: 'GET',
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) * 1000 || 5000,
    headers: {
      'User-Agent': 'HealthCheck/1.0'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        if (res.statusCode === 200) {
          const healthData = JSON.parse(data);
          
          // Validate response structure
          if (healthData.status === 'healthy') {
            console.log(`✅ Health check passed - Status: ${healthData.status}, Uptime: ${healthData.uptime_ms}ms`);
            process.exit(0);
          } else {
            console.error(`❌ Health check failed - Unexpected status: ${healthData.status}`);
            process.exit(1);
          }
        } else {
          console.error(`❌ Health check failed - HTTP ${res.statusCode}: ${data}`);
          process.exit(1);
        }
      } catch (parseError) {
        console.error(`❌ Health check failed - Invalid JSON response: ${parseError.message}`);
        console.error(`Response: ${data}`);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Health check failed - Request error: ${error.message}`);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error(`❌ Health check failed - Request timed out after ${options.timeout}ms`);
    req.destroy();
    process.exit(1);
  });

  req.end();
};

// Enhanced health check for container environments
const containerHealthCheck = () => {
  // Check if we're in a container environment
  const isContainer = process.env.DOCKER_CONTAINER || 
                     process.env.KUBERNETES_SERVICE_HOST || 
                     process.platform === 'linux';

  if (isContainer) {
    console.log('🐳 Running container health check...');
    
    // Additional container-specific checks
    try {
      // Check if Claude Code is available
      import('child_process').then(({ spawn }) => {
        const claudeCodeCheck = spawn('which', ['claude-code'], {
          stdio: 'pipe'
        });

        claudeCodeCheck.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Claude Code binary found');
            healthCheck();
          } else {
            console.error('❌ Claude Code binary not found in PATH');
            process.exit(1);
          }
        });

        claudeCodeCheck.on('error', (error) => {
          console.error(`❌ Error checking Claude Code: ${error.message}`);
          process.exit(1);
        });
      });
    } catch (error) {
      console.error(`❌ Container health check failed: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('🖥️  Running standard health check...');
    healthCheck();
  }
};

// Run appropriate health check
containerHealthCheck();
