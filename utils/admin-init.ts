import { initializeDefaultAdmin } from './admin-auth';
import { initializeDefaultSettings } from './platform-settings';

export async function initializeAdminSystem(): Promise<void> {
  try {
    console.log('Initializing admin system...');

    // Initialize default admin user
    await initializeDefaultAdmin();

    // Initialize default platform settings
    await initializeDefaultSettings();

    console.log('Admin system initialized successfully!');
    console.log('');
    console.log('Default admin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password immediately after first login!');
    console.log('⚠️  This is a security risk if not changed.');

  } catch (error) {
    console.error('Failed to initialize admin system:', error);
    throw error;
  }
}

// Export for use in Next.js API routes or scripts
export default initializeAdminSystem;

// For direct execution
if (require.main === module) {
  initializeAdminSystem()
    .then(() => {
      console.log('Admin system initialization complete.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Admin system initialization failed:', error);
      process.exit(1);
    });
}
