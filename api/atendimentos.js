const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { rows } = await pool.query('SELECT * FROM atendimentos ORDER BY id DESC LIMIT 50');
            return res.status(200).json(rows);
        }
        if (req.method === 'POST') {
            const { service_name, service_type, start_time, end_time, time_formatted, price } = req.body;
            const query = `INSERT INTO atendimentos (service_name, service_type, start_time, end_time, time_formatted, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const values = [service_name, service_type, start_time, end_time, time_formatted, price];
            const { rows } = await pool.query(query, values);
            return res.status(201).json(rows[0]);
        }
        if (req.method === 'DELETE') {
            await pool.query('DELETE FROM atendimentos');
            return res.status(200).json({ message: 'Histórico limpo' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
