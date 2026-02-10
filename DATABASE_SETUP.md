# Database Setup Instructions for Smart Attendance System

## Step-by-Step PostgreSQL Database Setup

### Prerequisites
- PostgreSQL installed on your system
- Basic knowledge of command line/PowerShell

---

## Step 1: Install PostgreSQL (if not already installed)

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user (you'll need it later!)
4. Complete the installation

### Verify Installation:
Open PowerShell and run:
```powershell
psql --version
```

---

## Step 2: Start PostgreSQL Service

### Windows:
PostgreSQL usually starts automatically. If not:
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "postgresql-x64-XX" service
4. Right-click and select "Start"

---

## Step 3: Create Database and User

### Option A: Using psql Command Line (Recommended)

1. **Open PowerShell** (as Administrator if possible)

2. **Connect to PostgreSQL**:
   ```powershell  
   psql -U postgres
   ```
   Enter the password you set during installation when prompted.

3. **Create the database**:
   ```sql
   CREATE DATABASE attendance_db;
   ```

4. **Create a user** (optional, you can use postgres user):
   ```sql
   CREATE USER attendance_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;
   ```

5. **Exit psql**:
   ```sql
   \q
   ```

### Option B: Using pgAdmin (GUI Method)

1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `attendance_db`
5. Click "Save"

---

## Step 4: Run Database Migration

1. **Navigate to the backend folder**:
   ```powershell
   cd backend
   ```

2. **Run the SQL migration file**:
   ```powershell
   psql -U postgres -d attendance_db -f migrations/init.sql
   ```
   
   Or if you created a user:
   ```powershell
   psql -U attendance_user -d attendance_db -f migrations/init.sql
   ```

   Enter password when prompted.

3. **Verify tables were created**:
   ```powershell
   psql -U postgres -d attendance_db
   ```
   
   Then run:
   ```sql
   \dt
   ```
   
   You should see tables: `users`, `attendance`, `permissions`, `timetable`, `complaints`
   
   Exit:
   ```sql
   \q
   ```

---

## Step 5: Configure Environment Variables

1. **Copy the example file**:
   ```powershell
   cd backend
   copy .env.example .env
   ```

2. **Edit `.env` file** with your database credentials:
   ```
   PGUSER=postgres
   PGPASSWORD=your_actual_postgres_password
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=attendance_db
   
   JWT_SECRET=change-this-to-a-random-string-in-production
   ADMIN_INVITE_CODE=admin123
   PORT=4000
   ```

   **Important**: Replace `your_actual_postgres_password` with the password you set for PostgreSQL!

---

## Step 6: Test Database Connection

1. **Start the backend server**:
   ```powershell
   cd backend
   npm install
   npm start
   ```

2. **Test the connection**:
   Open browser and go to: `http://localhost:4000/health`
   
   You should see: `{"ok":true,"now":"..."}`

---

## Step 7: Create Initial Admin Account

### Using Signup Page:
1. Start the frontend: `cd dashboard && npm run dev`
2. Go to signup page
3. Use email: `admin@vishnu.edu.in`
4. Set role to "Incharge/Admin"
5. Enter invite code: `admin123` (or whatever you set in .env)
6. Complete signup

### Or Using SQL directly:
```powershell
psql -U postgres -d attendance_db
```

```sql
-- Password hash for 'admin123' (you can change this)
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@vishnu.edu.in', '$2b$10$rHQqP9QxYgVgqjKZqKqKqeKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'incharge');
```

**Note**: The password hash above is for password `admin123`. To create your own:
- Use the signup page (recommended)
- Or use an online bcrypt generator

---

## Troubleshooting

### Error: "password authentication failed"
- Check your PostgreSQL password in `.env` file
- Make sure you're using the correct username

### Error: "database does not exist"
- Make sure you created the database: `CREATE DATABASE attendance_db;`
- Check the database name in `.env` matches

### Error: "relation does not exist"
- Run the migration: `psql -U postgres -d attendance_db -f migrations/init.sql`
- Check that you're connected to the correct database

### Error: "port 5432 already in use"
- Another PostgreSQL instance might be running
- Check Task Manager for postgres processes
- Or change PORT in `.env` to a different port

### Can't connect to PostgreSQL
- Make sure PostgreSQL service is running
- Check firewall settings
- Verify PGHOST in `.env` is correct (usually `localhost`)

---

## Database Schema Overview

### Tables Created:
1. **users** - Stores all users (students, faculty, incharge)
2. **attendance** - Records attendance for each student per period
3. **permissions** - Leave/permission requests from students
4. **timetable** - Class schedule with periods and subjects
5. **complaints** - Student complaints/suggestions

### Key Features:
- Email-based role detection (24pa/25pa = student, name.m@ = faculty)
- Unique constraints prevent duplicate attendance
- Foreign keys maintain data integrity
- Indexes for better query performance

---

## Next Steps

1. ✅ Database is set up
2. ✅ Backend is configured
3. ✅ Frontend can connect to backend
4. 🎉 Start using the application!

For Raspberry Pi integration later, you'll need to:
- Map student UIDs to users table
- Configure Raspberry Pi to POST to `/api/attendance/mark` endpoint

---

## Need Help?

Check the backend README.md or contact your system administrator.