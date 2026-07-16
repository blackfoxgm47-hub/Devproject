const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get next sequence number
async function getNextSequence() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const [rows] = await connection.query('SELECT last_sequence FROM sequence_counter WHERE id = 1 FOR UPDATE');
        const lastSequence = rows[0].last_sequence;
        const nextSequence = lastSequence + 1;
        
        await connection.query('UPDATE sequence_counter SET last_sequence = ? WHERE id = 1', [nextSequence]);
        
        await connection.commit();
        return nextSequence;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// API Routes

// Get all hatching records
app.get('/api/records', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM hatching_records ORDER BY timestamp DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

// Get single record by ID
app.get('/api/records/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM hatching_records WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching record:', error);
        res.status(500).json({ error: 'Failed to fetch record' });
    }
});

// Create new hatching record
app.post('/api/records', async (req, res) => {
    try {
        const {
            timestamp,
            start_prod_time,
            cabinet_rows,
            summary,
            passed_cabinets,
            total_cabinets,
            hatch_time
        } = req.body;

        const sequenceNumber = await getNextSequence();

        const [result] = await pool.query(
            'INSERT INTO hatching_records (sequence_number, timestamp, start_prod_time, cabinet_rows, summary, passed_cabinets, total_cabinets, hatch_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [sequenceNumber, timestamp, start_prod_time, JSON.stringify(cabinet_rows), summary, passed_cabinets, total_cabinets, hatch_time]
        );

        const [newRecord] = await pool.query('SELECT * FROM hatching_records WHERE id = ?', [result.insertId]);
        res.status(201).json(newRecord[0]);
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ error: 'Failed to create record' });
    }
});

// Update hatching record
app.put('/api/records/:id', async (req, res) => {
    try {
        const {
            timestamp,
            start_prod_time,
            cabinet_rows,
            summary,
            passed_cabinets,
            total_cabinets,
            hatch_time
        } = req.body;

        await pool.query(
            'UPDATE hatching_records SET timestamp = ?, start_prod_time = ?, cabinet_rows = ?, summary = ?, passed_cabinets = ?, total_cabinets = ?, hatch_time = ? WHERE id = ?',
            [timestamp, start_prod_time, JSON.stringify(cabinet_rows), summary, passed_cabinets, total_cabinets, hatch_time, req.params.id]
        );

        const [updatedRecord] = await pool.query('SELECT * FROM hatching_records WHERE id = ?', [req.params.id]);
        if (updatedRecord.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(updatedRecord[0]);
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Failed to update record' });
    }
});

// Delete hatching record
app.delete('/api/records/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM hatching_records WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

// Delete all records
app.delete('/api/records', async (req, res) => {
    try {
        await pool.query('DELETE FROM hatching_records');
        await pool.query('UPDATE sequence_counter SET last_sequence = 0 WHERE id = 1');
        res.json({ message: 'All records deleted successfully' });
    } catch (error) {
        console.error('Error deleting all records:', error);
        res.status(500).json({ error: 'Failed to delete all records' });
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access from other devices: http://YOUR_IP:${port}`);
});
