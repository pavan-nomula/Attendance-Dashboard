# How to Run Database Schema - Step by Step

## Quick Steps to Fix Backend Database Errors

### Step 1: Open PostgreSQL

```powershell
psql -U postgres
```

Enter your PostgreSQL password when prompted.

### Step 2: Create Database (if not exists)

```sql
CREATE DATABASE attendance_db;
```

### Step 3: Connect to Database

```sql
\c attendance_db
```

### Step 4: Run the Schema

**Option A: If database is empty (fresh start):**
```sql
\i backend/migrations/init.sql
```

**Option B: From command line (easier):**
```powershell
# Exit psql first (type \q)
psql -U postgres -d attendance_db -f backend/migrations/init.sql
```

**Option C: If you have existing tables and want to fix them:**
```powershell
psql -U postgres -d attendance_db -f backend/migrations/fix_schema.sql
```

### Step 5: Verify Tables Were Created

```sql
\dt
```

You should see:
- users
- attendance
- permissions
- timetable
- complaints

### Step 6: Check Table Structure

```sql
\d users
```

### Step 7: Test the Connection

```sql
SELECT COUNT(*) FROM users;
```

Should return: `count: 0` or `count: 1` (if admin user was created)

### Step 8: Exit PostgreSQL

```sql
\q
```

## Complete Command Sequence (Copy-Paste)

```powershell
# Step 1: Connect to PostgreSQL
psql -U postgres

# Step 2: Inside psql, run:
CREATE DATABASE attendance_db;
\c attendance_db
\i backend/migrations/init.sql
\dt
\q
```

Or from PowerShell directly:

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE attendance_db;"

# Run schema
psql -U postgres -d attendance_db -f backend/migrations/init.sql
```

## If You Get Errors

### Error: "database already exists"
- Skip CREATE DATABASE step
- Just run: `psql -U postgres -d attendance_db -f backend/migrations/init.sql`

### Error: "relation already exists"
- Tables already exist
- Use fix_schema.sql instead:
  ```powershell
  psql -U postgres -d attendance_db -f backend/migrations/fix_schema.sql
  ```

### Error: "permission denied"
- Make sure you're using the postgres user
- Or use a user with CREATE privileges

### Error: "could not connect to server"
- Make sure PostgreSQL service is running
- Check if port 5432 is correct

## After Running Schema

1. ✅ Restart backend server
2. ✅ Test: `http://localhost:4000/health`
3. ✅ Try creating user from dashboard

## Generate Admin Password Hash (Optional)

If you want to create admin user with custom password:

```powershell
cd backend
node scripts/generate_password_hash.js admin123
```

This will output a hash you can use in SQL.

## Quick Test

After running schema, test in backend:

```powershell
cd backend
npm start
```

Then open browser: `http://localhost:4000/health`

Should return: `{"ok":true,"now":"..."}`

If it works, your database is set up correctly! ✅