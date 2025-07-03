# Secret Management Protocol

**Project:** claude-code-docker-mcp  
**Created:** 2025-07-03T22:27:00Z  
**Last Updated:** 2025-07-03T22:27:00Z  

## Secret Inventory

| Secret Name | Type | Rotation Schedule | Last Rotated | Next Due | Owner |
|-------------|------|------------------|---------------|----------|--------|
| ANTHROPIC_API_KEY | External API | 90 days | 2025-07-03 | 2025-10-01 | Jordan |
| MCP_API_KEY | Internal API | 180 days | 2025-07-03 | 2026-01-01 | Jordan |
| DOCKER_REGISTRY_TOKEN | Container Registry | 90 days | TBD | TBD | Jordan |

## Access Control

### Who Has Access
- **Production secrets:** Jordan Ehrig only
- **Development secrets:** Development team
- **Container secrets:** Docker daemon (runtime only)

### Secret Storage Locations
- **Development:** Local .env files (git-ignored)
- **Production:** Docker secrets / environment variables
- **Backup:** Secure password manager (1Password/Bitwarden)

## Rotation Procedures

### Anthropic API Keys
1. Generate new API key in Anthropic Console
2. Update .env file with new key
3. Rebuild and restart containers
4. Test Claude Code functionality
5. Revoke old key in Anthropic Console
6. Update this documentation

### Internal API Keys  
1. Generate new random key (minimum 32 chars)
2. Update environment configuration
3. Restart MCP server
4. Test authentication if enabled
5. Update this documentation

### Container Registry Tokens
1. Generate new token in registry dashboard
2. Update CI/CD pipeline secrets
3. Test container build and push
4. Revoke old token
5. Update this documentation

## Incident Response

### If Secret is Compromised
1. **IMMEDIATE:** Rotate the compromised secret
2. **IMMEDIATE:** Revoke old secret if possible
3. **Within 1 hour:** Audit access logs
4. **Within 4 hours:** Document incident below
5. **Within 24 hours:** Review and improve security measures

### Emergency Contacts
- **Primary:** Jordan Ehrig - jordan@ehrig.dev
- **Backup:** MAGI System Administrator

## Security Checklist

- [ ] All secrets in .env files are git-ignored
- [ ] No secrets in source code or Dockerfiles
- [ ] Production secrets stored securely
- [ ] Regular rotation schedule followed
- [ ] Access limited to necessary personnel only
- [ ] Audit trail maintained for secret access
- [ ] Backup of secrets in secure password manager

## Incident Log

### 2025-07-03: Initial Setup
- **Type:** Setup
- **Action:** Created initial secret management protocols
- **Status:** Complete
- **Notes:** All security templates deployed

---

## Quick Reference

### Generate Secure API Key
```bash
# Generate 32-character random key
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check for Exposed Secrets
```bash
# Scan for potential secrets in codebase
grep -r "sk-" . --exclude-dir=node_modules
grep -r "api[_-]key" . --exclude-dir=node_modules
grep -r "secret" . --exclude-dir=node_modules
```

### Environment Security Validation
```bash
# Ensure .env is not tracked
git check-ignore .env

# Verify .gitignore covers secrets
grep -E "\.env|secret|key" .gitignore
```
