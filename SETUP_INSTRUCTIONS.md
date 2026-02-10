# Complete Setup Instructions - Smart Attendance Dashboard

## Quick Start Guide

Follow these steps to get your Smart Attendance Dashboard running:

---

## Part 1: Database Setup (PostgreSQL)

### 1. Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- Install with default settings
- **Remember your postgres password!**

### 2. Create Database
Open PowerShell and run:
```powershell
psql -U postgres
```
Enter your password, then:
```sql
CREATE DATABASE attendance_db;
\q
```

### 3. Run Migration
```powershell
cd backend
psql -U postgres -d attendance_db -f migrations/init.sql
```

---

## Part 2: Backend Setup

### 1. Install Dependencies
```powershell
cd backend
npm install
```

### 2. Configure Environment
```powershell
copy .env.example .env
```

Edit `.env` file:
- Set `PGPASSWORD` to your PostgreSQL password
- Set `JWT_SECRET` to any random string
- Set `ADMIN_INVITE_CODE` (default: admin123)

### 3. Start Backend Server
```powershell
npm start
```

Server should run on `http://localhost:4000`

Test: Open `http://localhost:4000/health` in browser

---

## Part 3: Frontend Setup

### 1. Install Dependencies
```powershell
cd dashboard
npm install
```

### 2. Configure API URL (Optional)
Create `dashboard/.env`:
```
VITE_API_URL=http://localhost:4000/api
```

### 3. Start Frontend
```powershell
npm run dev
```

Frontend should run on `http://localhost:5173` (or similar)

---

## Part 4: Create Your First Account

### Option 1: Signup Page (Recommended)
1. Go to `http://localhost:5173/signup`
2. Fill in details:
   - **For Student**: Use email like `24pa12345@vishnu.edu.in`
   - **For Faculty**: Use email like `naveen.m@vishnu.edu.in` + invite code
   - **For Incharge**: Use email like `admin@vishnu.edu.in` + invite code
3. Complete signup

### Option 2: SQL (Advanced)
See DATABASE_SETUP.md for SQL commands

---

## Email Pattern Rules

### Students:
- Pattern: `24paXXXXXX@vishnu.edu.in` or `25paXXXXXX@vishnu.edu.in`
- Example: `24pa12345@vishnu.edu.in`
- No invite code needed

### Faculty:
- Pattern: `name.m@vishnu.edu.in` or `p.mohith@vishnu.edu.in`
- Example: `naveen.m@vishnu.edu.in`
- **Requires invite code** (set in backend/.env)

### Incharge/Admin:
- Pattern: `admin@vishnu.edu.in` or any email with "admin" or "incharge"
- Example: `admin@vishnu.edu.in`
- **Requires invite code** (set in backend/.env)

---

## Testing the System

### 1. Test Login
- Go to login page
- Use your created account credentials
- Should redirect to appropriate dashboard

### 2. Test Student Dashboard
- View attendance percentage
- Submit permission request
- Submit complaint

### 3. Test Faculty Dashboard
- View live attendance feed
- Mark attendance manually
- Approve/reject permission requests

### 4. Test Incharge Dashboard
- View all students
- Manage permissions
- View reports

---

## Common Issues & Solutions

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` file exists and has correct password
- Check port 4000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 4000
- Check `VITE_API_URL` in dashboard/.env
- Check browser console for CORS errors

### Database connection error
- Verify PostgreSQL service is running
- Check password in `.env` matches PostgreSQL password
- Try: `psql -U postgres` to test connection

### Login fails
- Check email format matches role pattern
- Verify user exists in database
- Check backend logs for errors

---

## File Structure

```
Attendance Dashboard1 - Copy/
├── backend/
│   ├── .env                    # Database config (create from .env.example)
│   ├── index.js               # Main server file
│   ├── db.js                  # Database connection
│   ├── migrations/
│   │   └── init.sql          # Database schema
│   └── routes/               # API routes
├── dashboard/
│   ├── src/
│   │   ├── components/       # React components
│   │   └── services/
│   │       └── api.js        # API client
│   └── package.json
└── DATABASE_SETUP.md         # Detailed DB setup
```

---

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend running
3. ✅ Frontend running
4. ✅ Create accounts
5. 🎉 Start using the dashboard!

### Future: Raspberry Pi Integration
- Map student UIDs in Incharge dashboard
- Configure Raspberry Pi to POST to `/api/attendance/mark`
- See backend README.md for API details

---

## Support

For detailed database setup, see `DATABASE_SETUP.md`
For API documentation, see `backend/README.md`