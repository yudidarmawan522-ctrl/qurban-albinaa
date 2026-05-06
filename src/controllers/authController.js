const pool = require('../config/database');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan Password wajib diisi' });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Username tidak ditemukan' });
        }

        const user = rows[0];

        // In a real production app, use bcrypt to compare passwords.
        // For this basic Laragon setup, we do plain text comparison.
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Password salah' });
        }

        // Login successful
        res.json({ 
            success: true, 
            message: 'Login berhasil', 
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            } 
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

module.exports = { login };
