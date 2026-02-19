import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Ensure CLIENT_URL doesn't have a trailing slash
const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

const io = new Server(httpServer, {
    cors: {
        origin: clientUrl,
        methods: ["GET", "POST", "DELETE"]
    }
});

app.use(cors({
    origin: clientUrl,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"]
}));
app.use(express.json());

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not defined in .env");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test DB connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to CockroachDB');
    release();
});

// Create files table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title STRING NOT NULL,
    subject STRING NOT NULL,
    semester STRING NOT NULL,
    year STRING NOT NULL,
    file_url STRING NOT NULL,
    file_name STRING NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    user_id STRING NOT NULL
  );
`;

pool.query(createTableQuery)
    .then(() => console.log("Files table created or already exists"))
    .catch(err => console.error("Error creating files table", err));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Routes

// Get all files
app.get('/api/files', async (req, res) => {
    try {
        const { userId } = req.query;
        let query = 'SELECT * FROM files ORDER BY created_at DESC';
        let params = [];

        if (userId) {
            query = 'SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC';
            params = [userId];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Save file metadata
app.post('/api/files', async (req, res) => {
    const { title, subject, semester, year, fileUrl, fileName, userId } = req.body;

    if (!title || !subject || !semester || !year || !fileUrl || !fileName || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
      INSERT INTO files (title, subject, semester, year, file_url, file_name, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const values = [title, subject, semester, year, fileUrl, fileName, userId];
        const result = await pool.query(query, values);

        // Emit event to all connected clients
        io.emit('files_updated', { action: 'upload', file: result.rows[0] });

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save file metadata' });
    }
});

// Delete file
app.delete('/api/files/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID required for deletion security' });
    }

    try {
        // Check ownership
        const fileResult = await pool.query('SELECT user_id FROM files WHERE id = $1', [id]);

        if (fileResult.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        if (fileResult.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this file' });
        }

        await pool.query('DELETE FROM files WHERE id = $1', [id]);

        // Emit event to all connected clients
        io.emit('files_updated', { action: 'delete', id });

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Change app.listen to httpServer.listen
httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
