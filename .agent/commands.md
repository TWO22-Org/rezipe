# Common Commands Reference

**Version**: 1.0  
**Last Updated**: 2026-01-13

Quick reference for commands used in the rezipe project. Update as project tooling evolves.

---

## Beads (Task Management)

```bash
# Initialize beads in repo (run once)
bd init

# List ready tasks (no open blockers)
bd ready

# Create new task
bd create "Task title" -p <priority>
bd create "Task title" --blocks bd-<parent-id>  # With dependency

# Update task
bd update bd-<task-id> --status <todo|in-progress|blocked|done>
bd update bd-<task-id> --description "Updated description"
bd update bd-<task-id> --blocks bd-<blocked-id>  # Add blocker

# Close task
bd close bd-<task-id>

# View task details
bd show bd-<task-id>

# List all tasks
bd list

# Search tasks
bd search "keyword"
```

---

## Development

### Backend (adjust based on tech stack)

```bash
# Install dependencies
npm install
# or
go mod download

# Start dev server
npm run dev
# or
go run cmd/server/main.go

# Run tests
npm test
# or
go test ./...

# Run specific test
npm test -- --grep "recipe search"
# or
go test -run TestSearchRecipes

# Lint
npm run lint
# or
golangci-lint run

# Type check
npm run typecheck
# or (for Go, type checking is automatic)

# Build
npm run build
# or
go build -o bin/server cmd/server/main.go
```

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test SearchBar.test.tsx

# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build

# Preview production build
npm run preview
```

---

## Testing Scripts

```bash
# Run all tests (backend + frontend)
./.agent/scripts/run-tests.sh

# Run backend tests only
./.agent/scripts/run-backend-tests.sh

# Run frontend tests only
./.agent/scripts/run-frontend-tests.sh

# Run integration tests
./.agent/scripts/run-integration-tests.sh

# Run e2e tests
./.agent/scripts/run-e2e-tests.sh
```

---

## Git

```bash
# Check status
git status

# Create feature branch
git checkout -b feature/bd-<task-id>-<feature-name>

# Stage changes
git add <file>
git add .  # Stage all changes

# Commit with conventional commit format
git commit -m "feat: description (bd-<task-id>, #<issue-id>)

Co-Authored-By: Warp <agent@warp.dev>"

# Push branch
git push origin feature/bd-<task-id>-<feature-name>

# Pull latest from main
git checkout main
git pull origin main

# View log
git --no-pager log --oneline -10

# View diff
git --no-pager diff
git --no-pager diff --staged

# View file history
git --no-pager log --follow -- <file>
```

---

## GitHub CLI

```bash
# Create issue
gh issue create --title "Title" --body "Body" --label "feature"

# View issue
gh issue view <issue-number>

# Comment on issue
gh issue comment <issue-number> --body "Comment text"

# Close issue
gh issue close <issue-number>

# List issues
gh issue list

# Create PR
gh pr create \
  --title "feat: feature name (closes #<issue>)" \
  --body "Description

PRD: docs/prd/features/feature.md
Beads: bd-<task-id>
Issue: #<issue-id>"

# View PR
gh pr view <pr-number>

# Comment on PR
gh pr comment <pr-number> --body "Comment"

# Review PR
gh pr review <pr-number> --approve
gh pr review <pr-number> --request-changes --body "Feedback"

# Merge PR
gh pr merge <pr-number> --squash
gh pr merge <pr-number> --merge

# List PRs
gh pr list
```

---

## Database (adjust based on database choice)

### PostgreSQL

```bash
# Connect to database
psql -U <user> -d <database>

# Run migration
npm run migrate:up
# or
go run cmd/migrate/main.go up

# Rollback migration
npm run migrate:down
# or
go run cmd/migrate/main.go down

# Seed database
npm run db:seed
# or
go run cmd/seed/main.go
```

### MongoDB

```bash
# Connect to database
mongosh <connection-string>

# Run migration
npm run migrate
```

---

## Docker

```bash
# Build image
docker build -t rezipe-backend .
docker build -t rezipe-frontend -f frontend/Dockerfile .

# Run container
docker run -p 8080:8080 rezipe-backend

# Docker Compose
docker-compose up
docker-compose up -d  # Detached mode
docker-compose down
docker-compose logs -f  # Follow logs

# Clean up
docker system prune -a
```

---

## Cloud Deployment

### Using deployment scripts

```bash
# Deploy to staging
./.agent/scripts/deploy-staging.sh

# Deploy to production
./.agent/scripts/deploy-production.sh

# Check deployment status
./.agent/scripts/check-deployment.sh
```

### Manual deployment (adjust based on cloud provider)

```bash
# AWS
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/rezipe:latest

# GCP
gcloud auth configure-docker
docker push gcr.io/<project-id>/rezipe:latest

# Deploy to Kubernetes
kubectl apply -f .agent/cloud-code/kubernetes/
kubectl rollout status deployment/rezipe-backend
```

---

## Utilities

### Check code quality

```bash
# Check test coverage (backend)
go test -cover ./...
# or
npm run test:coverage

# Check test coverage (frontend)
npm run test:coverage

# Security audit
npm audit
# or
go list -json -m all | nancy sleuth
```

### Performance profiling

```bash
# Backend profiling (Go)
go test -bench=. -benchmem -cpuprofile=cpu.prof
go tool pprof cpu.prof

# Frontend profiling
npm run build -- --profile
```

### Documentation

```bash
# Generate API docs
npm run docs:generate
# or
swag init  # For Go Swagger

# Serve docs locally
npm run docs:serve
```

---

## Agent-Specific Commands

### Reflection

```bash
# Trigger reflection on a skill
/reflect [skill-name]

# Examples:
/reflect tdd-backend
/reflect code-review
/reflect api-design
```

### Context Management

```bash
# Read PRD
cat docs/prd/features/<feature>.md

# Read ADR
cat docs/adr/<number>-<title>.md

# Read conventions
cat docs/context/conventions.md

# Read reflection log
cat .agent/reflection-log.md

# Read skills
cat .agent/skills.md
```

---

## Troubleshooting

### Clear caches

```bash
# Node modules
rm -rf node_modules
npm install

# Go build cache
go clean -cache -modcache

# Docker
docker system prune -a
```

### Reset development environment

```bash
# Reset database
npm run db:reset
# or
./.agent/scripts/reset-db.sh

# Reset all (careful!)
./.agent/scripts/reset-dev.sh
```

---

## Environment Variables

Common environment variables (check `.env.example` for full list):

```bash
# Development
export NODE_ENV=development
export DATABASE_URL=postgresql://user:pass@localhost:5432/rezipe_dev
export API_PORT=8080

# Testing
export NODE_ENV=test
export DATABASE_URL=postgresql://user:pass@localhost:5432/rezipe_test

# Production
export NODE_ENV=production
export DATABASE_URL=<prod-url>
export API_SECRET=<secret>
```

---

## Project-Specific Commands

*This section should be updated as project-specific tooling is added.*

### Setup

```bash
# Initial project setup
./.agent/scripts/setup-dev.sh
```

### Common workflows

```bash
# Full development workflow
./.agent/scripts/dev-workflow.sh

# Pre-commit checks
./.agent/scripts/pre-commit.sh
```

---

## Tips

1. **Use script wrappers** when available (in `.agent/scripts/`) rather than raw commands
2. **Check README** for project-specific variations
3. **Update this file** when adding new commands or scripts
4. **Use `--help`** flag to explore command options: `bd --help`, `gh --help`, etc.

---

## Version History

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0     | 2026-01-13 | Initial commands reference |

---

*End of commands reference.*
