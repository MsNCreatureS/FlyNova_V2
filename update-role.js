const db = require('./server/config/database');

(async () => {
  try {
    console.log('Updating va_members roles...');
    
    // Update owner role
    await db.query("UPDATE va_members SET role = 'Owner' WHERE role = 'owner'");
    console.log('✅ Updated owner -> Owner');
    
    // Update admin role
    await db.query("UPDATE va_members SET role = 'Admin' WHERE role = 'admin'");
    console.log('✅ Updated admin -> Admin');
    
    // Update member role
    await db.query("UPDATE va_members SET role = 'Member' WHERE role = 'member'");
    console.log('✅ Updated member -> Member');
    
    // Show results
    const [members] = await db.query('SELECT * FROM va_members');
    console.log('\nCurrent members:');
    console.log(JSON.stringify(members, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
