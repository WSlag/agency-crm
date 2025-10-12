import { initializeDatabase } from './initializeDatabase';

console.log('Starting database initialization script...');

initializeDatabase()
  .then(() => {
    console.log('Database initialization completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during database initialization:', error);
    process.exit(1);
  });
