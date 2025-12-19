import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './db/index.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Test DB connection before starting server
await testConnection();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
