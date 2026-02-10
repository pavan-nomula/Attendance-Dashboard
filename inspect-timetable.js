const db = require('./backend/db');
const fs = require('fs');

async function inspectTable() {
    try {
        const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'timetable'
      ORDER BY ordinal_position
    `);
        fs.writeFileSync('timetable_schema.json', JSON.stringify(res.rows, null, 2));
        console.log('Schema written to timetable_schema.json');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

inspectTable();
