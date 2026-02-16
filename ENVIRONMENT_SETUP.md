# Environment Setup Guide

## Backend Environment Variables

The backend requires a `.env` file in the `backend/` directory. Use the `.env.example` as a template:

```bash
cd backend
cp .env.example .env
```

### Required Variables

- **PORT**: Server port (default: 5000)
- **MONGODB_URI**: MongoDB connection string
  - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=AppName`
  - For local MongoDB: `mongodb://localhost:27017/draftly`
- **JWT_SECRET**: Strong random secret for JWT tokens
  - Generate with: `openssl rand -base64 64`
  - **NEVER** commit this to git
- **ALLOWED_ORIGINS**: Comma-separated allowed CORS origins
  - Development: `http://localhost:3000`
  - Production: Add your production domain
- **NODE_ENV**: Environment mode (`development` or `production`)

### Security Notes

> [!CAUTION]
> - **Never** commit `.env` files to version control
> - **Always** use strong, randomly generated secrets
> - **Rotate** MongoDB credentials if they were exposed
> - Use different credentials for development and production

---

## Frontend Environment Variables

The frontend requires a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

### Variables

- **REACT_APP_API_URL**: Backend API URL
  - Local development: `http://localhost:5000`
  - Docker: Leave empty (uses proxy in package.json)
  - Production: Your production API domain

---

## First-Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SahanjithD/Draftly.git
   cd Draftly
   ```

2. **Set up backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual values
   npm install
   ```

3. **Set up frontend**
   ```bash
   cd ../frontend
   cp .env.example .env
   # Edit .env if needed
   npm install
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

---

## Docker Setup

When using Docker, environment variables are handled differently:

- Backend: Uses `.env` file or environment variables in docker-compose.yml
- Frontend: Uses proxy configuration in package.json

---

## Troubleshooting

### "JWT malformed" error
- Verify JWT_SECRET is set in backend `.env`
- Ensure it's the same secret used to sign tokens

### CORS errors
- Check ALLOWED_ORIGINS in backend `.env`
- Ensure frontend origin is included
- For Docker, include `http://frontend:3000`

### MongoDB connection failed
- Verify MONGODB_URI format
- Check database credentials
- Ensure IP address is whitelisted (Atlas)
