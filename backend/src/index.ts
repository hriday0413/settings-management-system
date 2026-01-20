import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'settings_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database table
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        uid VARCHAR(255) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    client.release();
  }
};

// Helper function to generate unique ID
const generateUID = (): string => {
  return `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// CREATE - POST /settings
app.post('/settings', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const uid = generateUID();
    
    const result = await pool.query(
      'INSERT INTO settings (uid, data) VALUES ($1, $2) RETURNING *',
      [uid, JSON.stringify(data)]
    );
    
    const setting = result.rows[0];
    res.status(201).json({
      uid: setting.uid,
      data: setting.data,
      created_at: setting.created_at,
      updated_at: setting.updated_at
    });
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({ error: 'Failed to create setting' });
  }
});

// READ ALL - GET /settings (with pagination)
app.get('/settings', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM settings');
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Get paginated results
    const result = await pool.query(
      'SELECT * FROM settings ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    const settings = result.rows.map(row => ({
      uid: row.uid,
      data: row.data,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    res.json({
      data: settings,
      pagination: {
        page,
        limit,
        total_count: totalCount,
        total_pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// READ ONE - GET /settings/:uid
app.get('/settings/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM settings WHERE uid = $1',
      [uid]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    const setting = result.rows[0];
    res.json({
      uid: setting.uid,
      data: setting.data,
      created_at: setting.created_at,
      updated_at: setting.updated_at
    });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// UPDATE - PUT /settings/:uid
app.put('/settings/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const data = req.body;
    
    const result = await pool.query(
      'UPDATE settings SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE uid = $2 RETURNING *',
      [JSON.stringify(data), uid]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    const setting = result.rows[0];
    res.json({
      uid: setting.uid,
      data: setting.data,
      created_at: setting.created_at,
      updated_at: setting.updated_at
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// DELETE - DELETE /settings/:uid
app.delete('/settings/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    
    await pool.query('DELETE FROM settings WHERE uid = $1', [uid]);
    
    // Idempotent - always return 204 even if nothing was deleted
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

// Start server
const startServer = async () => {
  await initDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();