
# 🐙 GitHub Repository Setup Guide

Complete step-by-step guide for setting up your GitHub repository for the Sully Booking System.

## 🎯 Overview

This guide covers:
- Repository creation and initial setup
- Branch protection and workflow setup
- GitHub Actions for enhanced CI/CD
- Security and access configuration

## 📁 Step 1: Repository Creation

### Option A: GitHub Web Interface

1. **Go to GitHub**: Visit [github.com](https://github.com)
2. **Create Repository**:
   - Click the "+" icon → "New repository"
   - Repository name: `sully-booking-system`
   - Description: "Professional booking system for restaurants and venues"
   - Visibility: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license

3. **Note the Repository URL**: Save it for the next step

### Option B: GitHub CLI (if you have it installed)

```bash
# Install GitHub CLI (optional)
# macOS: brew install gh
# Windows: winget install GitHub.cli
# Linux: Follow instructions at cli.github.com

# Create repository
gh auth login
gh repo create sully-booking-system --private --description "Professional booking system for restaurants and venues"
```

## 💻 Step 2: Local Git Setup

### Initialize Git Repository

```bash
# Navigate to project directory
cd /home/ubuntu/sully-booking-system

# Initialize git (if not already done)
git init

# Check current status
git status
```

### Configure Git (if first time)

```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

### Add and Commit Files

```bash
# Add all files (respecting .gitignore)
git add .

# Check what will be committed
git status

# Create initial commit
git commit -m "Initial commit: Sully Booking System ready for deployment

- Added Next.js 14 booking system with TypeScript
- Configured Netlify deployment pipeline
- Added comprehensive documentation
- Set up database migration guides
- Implemented Netlify Functions architecture"
```

## 🔗 Step 3: Connect to GitHub

### Add Remote Repository

```bash
# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/sully-booking-system.git

# Verify remote was added
git remote -v
```

### Push to GitHub

```bash
# Create and switch to main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**Troubleshooting**: If you get authentication errors:
- Use a Personal Access Token instead of password
- Or set up SSH keys (recommended for frequent use)

## 🔐 Step 4: Security Setup

### Personal Access Token (Recommended)

1. **Generate Token**: 
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Click "Generate new token" (classic)
   - Select scopes: `repo`, `workflow`
   - Copy the token (save it securely!)

2. **Use Token for Authentication**:
   ```bash
   # When prompted for password, use the token instead
   git push origin main
   ```

### SSH Keys (Alternative)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Copy this output to GitHub → Settings → SSH keys
```

## 🛡️ Step 5: Repository Configuration

### Branch Protection Rules

1. **Go to Repository Settings**: 
   - Repository → Settings → Branches
   
2. **Add Rule for `main` branch**:
   - Branch name pattern: `main`
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Restrict pushes that create files larger than 100MB

### Repository Secrets (for future CI/CD)

Go to Repository → Settings → Secrets and variables → Actions

Add these secrets (you'll need them later):
- `DATABASE_URL` - Your production database URL
- `JWT_SECRET` - Your production JWT secret
- `STRIPE_SECRET_KEY` - Your live Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

## 🚀 Step 6: Optional GitHub Actions

### Basic CI/CD Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: app/package.json
    
    - name: Install dependencies
      run: |
        cd app
        npm ci
    
    - name: Run linting
      run: |
        cd app
        npm run lint
    
    - name: Type checking
      run: |
        cd app
        npx tsc --noEmit
    
    - name: Run tests (if you have any)
      run: |
        cd app
        # npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Netlify
      run: echo "Deployment handled by Netlify GitHub integration"
```

### Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/app"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

## 📋 Step 7: Repository Maintenance

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-booking-system
git push -u origin feature/new-booking-system

# Make changes, commit, and push
git add .
git commit -m "Add new booking feature"
git push

# Create pull request on GitHub
# Merge to main after review
```

### Keeping Fork Updated (if applicable)

```bash
# If this is a fork, keep it updated
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## ✅ Verification Checklist

- [ ] Repository created on GitHub
- [ ] Local git repository initialized
- [ ] All files committed (check `git status`)
- [ ] Remote origin added and verified
- [ ] Successfully pushed to GitHub
- [ ] Repository settings configured
- [ ] Branch protection rules set up (optional)
- [ ] Repository secrets added (optional)
- [ ] GitHub Actions workflow added (optional)

## 🔧 Troubleshooting

### Common Issues

#### "Repository not found" error
```bash
# Check remote URL
git remote -v

# Update remote URL if needed
git remote set-url origin https://github.com/YOUR_USERNAME/sully-booking-system.git
```

#### Large file warnings
```bash
# Check for large files
find . -size +50M -type f

# Remove from git if needed
git rm --cached large-file.ext
echo "large-file.ext" >> .gitignore
```

#### Authentication failures
- Use Personal Access Token instead of password
- Or set up SSH keys
- Check if 2FA is enabled on your account

### Getting Help

- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **Git Documentation**: [git-scm.com/doc](https://git-scm.com/doc)
- **Community**: GitHub Community Forum

## 🎉 Next Steps

After completing this setup:

1. **Connect to Netlify**: Follow the deployment guide
2. **Set up database**: Use the database migration guide
3. **Configure environment variables**: In both GitHub and Netlify
4. **Test deployment**: Verify everything works end-to-end

---

**Success!** 🎉 Your GitHub repository is now ready for Netlify deployment!
