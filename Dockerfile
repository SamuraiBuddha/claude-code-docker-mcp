# Multi-stage build for Claude Code MCP Container
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl \
    bash

# Create non-root user early
RUN addgroup -g 1001 claude && \
    adduser -D -s /bin/sh -u 1001 -G claude claude

# Claude Code installation stage
FROM base AS claude-code-installer

# Switch to claude user for installation
USER claude
WORKDIR /home/claude

# Install Claude Code globally in user space
ENV NPM_CONFIG_PREFIX=/home/claude/.npm-global
ENV PATH=$PATH:/home/claude/.npm-global/bin

RUN npm install -g @anthropic-ai/claude-code

# Verify installation
RUN claude-code --version

# Production stage
FROM base AS production

# Copy Claude user and npm global installation
COPY --from=claude-code-installer --chown=claude:claude /home/claude /home/claude

# Set up environment for claude user
USER claude
ENV NPM_CONFIG_PREFIX=/home/claude/.npm-global
ENV PATH=$PATH:/home/claude/.npm-global/bin

# Set working directory
WORKDIR /workspace
USER root
RUN mkdir -p /workspace/projects /workspace/logs && \
    chown -R claude:claude /workspace
USER claude

# Copy MCP server source
COPY --chown=claude:claude src/ /workspace/src/

# Install MCP server dependencies
WORKDIR /workspace/src
RUN npm install

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node health-check.js

# Expose MCP server port
EXPOSE 3001

# Start MCP server
CMD ["node", "mcp-server.js"]
