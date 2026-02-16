# MongoDB Setup Instructions

The application is currently configured to use **MongoDB Atlas**. However, the connection is failing due to a DNS or Network issue (Host not found).

## Option 1: Fix MongoDB Atlas Connection (Recommended)

1. **Check Whitelist**: Log in to MongoDB Atlas and ensure your current IP address is whitelisted.
2. **Double Check URI**: Ensure the `MONGODB_URI` in `backend/.env` is correct and doesn't have extra spaces or hidden characters.
3. **Network Check**: If you are on a restricted network (like a company or college WiFi), they might be blocking MongoDB Atlas domains. Try a different network or a VPN if possible.

## Option 2: Use Local MongoDB (Fallback)

If you cannot reach Atlas, you can run MongoDB locally:

1. **Install MongoDB Community Server**: [Download here](https://www.mongodb.com/try/download/community)
2. **Update `.env`**: Change the `MONGODB_URI` in `backend/.env` to:
   ```
   MONGODB_URI=mongodb://localhost:27017/smart_attendance
   ```
3. **Restart Backend**:
   ```powershell
   cd backend
   npm run dev
   ```

## Option 3: Use MongoDB Compass for Diagnostics

Install [MongoDB Compass](https://www.mongodb.com/products/compass) and try to connect using the same URI. If Compass can't connect, the application won't be able to either.

---

### Verification
After fixing the connection, visit:
`http://localhost:4000/health`

It should show:
`{"ok":true, "database":"Connected", ...}`
