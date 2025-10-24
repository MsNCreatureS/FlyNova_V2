require('dotenv').config();
const db = require('./server/config/database');

const setSuperAdmin = async () => {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('\n❌ Usage: node set-super-admin.js <email>');
      console.log('Example: node set-super-admin.js admin@flynova.com\n');
      process.exit(1);
    }

    const email = args[0];

    // Check if user exists
    const [users] = await db.query('SELECT id, username, email, is_super_admin FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      console.log(`\n❌ User with email "${email}" not found.\n`);
      process.exit(1);
    }

    const user = users[0];

    if (user.is_super_admin) {
      console.log(`\n✅ User "${user.username}" (${user.email}) is already a Super Admin.\n`);
      process.exit(0);
    }

    // Set user as super admin
    await db.query('UPDATE users SET is_super_admin = TRUE WHERE id = ?', [user.id]);

    console.log('\n✅ SUCCESS!');
    console.log(`User "${user.username}" (${user.email}) has been promoted to Super Admin.\n`);
    console.log('🔐 This user now has access to the Super Admin Dashboard at /superadmin\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting super admin:', error.message);
    process.exit(1);
  }
};

setSuperAdmin();
