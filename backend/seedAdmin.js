const { User } = require('./models');
const { testConnection } = require('./config/dbconnection');

const seedAdmin = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@storerating.com' } 
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Active:', existingAdmin.is_active);
      return;
    }
    
    // Create admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@storerating.com',
      password: 'Admin123!',
      address: '123 Admin Street, Admin City, AC 12345',
      role: 'admin',
      is_active: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@storerating.com');
    console.log('Password: Admin123!');
    console.log('Role:', adminUser.role);
    
    // Also create some demo users
    const demoUsers = [
      {
        name: 'John Customer Demo User',
        email: 'john.admin.created@example.com',
        password: 'Password123!',
        address: '456 Customer Lane, Customer City, CC 67890',
        role: 'normal_user'
      },
      {
        name: 'Jane Store Owner Demo User',
        email: 'jane.store.admin@example.com',
        password: 'Password123!',
        address: '789 Store Avenue, Store City, SC 11111',
        role: 'store_owner'
      }
    ];
    
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Demo user created: ${userData.email}`);
      } else {
        console.log(`ℹ️  Demo user already exists: ${userData.email}`);
      }
    }
    
    console.log('\n🎉 All demo accounts are ready!');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@storerating.com / Admin123!');
    console.log('Store Owner: jane.store.admin@example.com / Password123!');
    console.log('Customer: john.admin.created@example.com / Password123!');
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    process.exit(0);
  }
};

seedAdmin();