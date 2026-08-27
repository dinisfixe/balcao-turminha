import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const { rows } = await pool.query('SELECT * FROM atendimentos ORDER BY id DESC LIMIT 100');
            return res.status(200).json(rows);
        }

        if (req.method === 'POST') {
            const { service_name, service_type, start_time, end_time, time_formatted, price } = req.body;
            if (!service_name || !price) {
                return res.status(400).json({ error: 'Dados em falta' });
            }
            const query = `INSERT INTO atendimentos (service_name, service_type, start_time, end_time, time_formatted, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const values = [service_name, service_type, start_time, end_time, time_formatted, price];
            const { rows } = await pool.query(query, values);
            return res.status(201).json(rows[0]);
        }

        if (req.method === 'DELETE') {
            await pool.query('DELETE FROM atendimentos');
            return res.status(200).json({ message: 'Histórico limpo com sucesso' });
        }

        return res.status(405).json({ error: 'Método não permitido' });
    } catch (error) {
        console.error('Erro no servidor:', error);
        return res.status(500).json({ error: error.message });
    }
}
