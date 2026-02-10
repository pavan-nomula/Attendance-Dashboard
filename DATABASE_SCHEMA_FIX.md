# Database Schema Fix Guide

## Complete Schema Code

The complete, fixed database schema is in `backend/migrations/init.sql`

## How to Apply the Schema

### Option 1: Fresh Database (Recommended for New Setup)

1. **Connect to PostgreSQL:**
   ```powershell
   psql -U postgres
   ```

2. **Create Database (if not exists):**
   ```sql
   CREATE DATABASE attendance_db;
   \c attendance_db
   ```

3. **Run the Schema:**
   ```sql
   \i backend/migrations/init.sql
   ```
   Or from command line:
   ```powershell
   psql -U postgres -d attendance_db -f backend/migrations/init.sql
   ```

### Option 2: Fix Existing Database

If you already have tables and want to fix them:

```powershell
psql -U postgres -d attendance_db -f backend/migrations/fix_schema.sql
```

## Schema Structure

### Tables Created:

1. **users** - All system users
   - id (Primary Key)
   - name, email (unique), password_hash
   - role (student/faculty/incharge/admin)
   - uid (for Raspberry Pi)
   - created_at

2. **attendance** - Attendance records
   - Links to users (student_id)
   - date, period_id, status (P/A)
   - marked_at, source
   - Unique constraint on (student_id, date, period_id)

3. **permissions** - Leave requests
   - Links to users (student_id, faculty_id)
   - reason, start_date, end_date
   - status (pending/approved/rejected)

4. **timetable** - Class schedule
   - day_of_week (0-6), period_id
   - start_time, end_time, subject
   - faculty_id, location

5. **complaints** - Student complaints
   - Links to users (student_id)
   - message, status (pending/resolved/dismissed)

### Indexes Created:

- Performance indexes on frequently queried columns
- Foreign key indexes
- Unique constraint indexes

## Verify Schema

After running the schema, verify it worked:

```sql
-- Connect to database
psql -U postgres -d attendance_db

-- List all tables
\dt

-- Check users table structure
\d users

-- Check if indexes exist
\di

-- Test query
SELECT COUNT(*) FROM users;
```

## Common Issues Fixed

1. ✅ **Missing location column** in timetable
2. ✅ **Incomplete password hash** in seed data
3. ✅ **Missing indexes** for performance
4. ✅ **Foreign key constraints** properly set
5. ✅ **Unique constraints** on attendance
6. ✅ **Proper data types** for all columns

## Reset Database (If Needed)

⚠️ **WARNING: This will delete all data!**

```sql
-- Connect to database
psql -U postgres -d attendance_db

-- Drop all tables
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run init.sql again
\i backend/migrations/init.sql
```

## After Running Schema

1. ✅ Restart backend server
2. ✅ Test with: `http://localhost:4000/health`
3. ✅ Try creating a user from Incharge dashboard
4. ✅ Check backend terminal for any errors

## Troubleshooting

### Error: "relation does not exist"
- Tables weren't created
- Run `init.sql` again

### Error: "duplicate key value"
- Data already exists
- Use `fix_schema.sql` instead

### Error: "permission denied"
- Check PostgreSQL user permissions
- Make sure user has CREATE privileges

### Error: "column does not exist"
- Run `fix_schema.sql` to add missing columns

## Need Help?

Check backend terminal logs for specific error messages and share them for further assistance.