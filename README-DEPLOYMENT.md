# Dochi ICP App - Deployment Guide

## Quick Start for New Users

### Prerequisites
- Install [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- Have Node.js 18+ installed
- Use Chrome or Firefox (avoid Safari/Mullvad Browser)

### Easy Deployment

```bash
# Method 1: Use the deployment script
./deploy.sh

# Method 2: Manual deployment
dfx start --clean --background
dfx deploy
```

### If Deployment Fails

If you see compatibility errors, use the clean start method:

```bash
dfx stop
dfx start --clean
dfx deploy
```

### Common Issues & Solutions

#### 1. "Compatibility error [M0170]"
**Solution:** Use clean start
```bash
dfx start --clean
```

#### 2. "Candid interface compatibility check failed"
**Solution:** Type "yes" when prompted, or use:
```bash
dfx deploy --upgrade-unchanged
```

#### 3. WebAuthn/Authentication Errors
**Solution:** 
- Use Chrome or Firefox
- Avoid privacy browsers (Safari, Mullvad, Tor)
- Access Internet Identity directly first: `http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`

### Your App URL

After successful deployment:
```
http://localhost:4943/?canisterId=[your-frontend-canister-id]
```

Get your canister ID:
```bash
dfx canister id dochi_frontend
```

### Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Multiple Motoko canisters
  - `login_backend` - User authentication
  - `todo_backend` - Todo/Notes management  
  - `calendar_backend` - Calendar functionality
  - `focus_backend` - Focus tracking
- **Authentication**: Internet Identity

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to local replica
dfx deploy

# Deploy to IC mainnet
dfx deploy --network ic
```

### Troubleshooting

- **Port 4943 busy**: `dfx stop` then `dfx start`
- **Build fails**: `npm install` in both root and `src/dochi_frontend`
- **Authentication broken**: Clear browser cache, use different browser
- **Canisters not responding**: `dfx start --clean`

### Security Notes

⚠️ **This app has known security vulnerabilities for development:**
- Focus backend lacks authentication
- Missing input validation in several places
- Admin functions publicly accessible

**Do not deploy to production without fixing security issues.**