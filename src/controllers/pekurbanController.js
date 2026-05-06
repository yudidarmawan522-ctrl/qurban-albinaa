const pool = require('../config/database');

const getRegistrations = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

const createRegistration = async (req, res) => {
    try {
        const { name, santri_name, santri_class, phone, type_id, purchase_type, animal_no, payment_method, notes, penyembelih, status } = req.body;
        const proof_image = req.file ? `/uploads/proofs/${req.file.filename}` : null;

        if (!name || !santri_name || !phone || !type_id) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const [typeRows] = await pool.query('SELECT * FROM animal_types WHERE id = ?', [type_id]);
        if (typeRows.length === 0) {
            return res.status(404).json({ message: 'Qurban type not found' });
        }
        const qurbanType = typeRows[0];

        let group_info = null;
        const animal_no_final = animal_no || 1;

        if (purchase_type === 'Patungan') {
            const [groupRows] = await pool.query(
                'SELECT COUNT(*) as current_count FROM registrations WHERE type_id = ? AND animal_no = ? AND purchase_type = "Patungan"',
                [type_id, animal_no_final]
            );
            const count = (groupRows[0].current_count || 0) + 1;
            group_info = count >= 7 ? "Full" : `Menunggu ${7 - count} Orang Lagi`;
        }

        const id = 'REG-' + Date.now();
        const category = qurbanType.category;
        const type_label = qurbanType.type;
        const price = purchase_type === 'Patungan' ? qurbanType.price_per_share : qurbanType.price;
        const penyembelih_final = penyembelih || '-';
        const status_final = status || 'Pending';

        const query = `
            INSERT INTO registrations 
            (id, name, santri_name, santri_class, phone, type_id, purchase_type, animal_no, group_status, category, type_label, price, payment_method, notes, penyembelih, status, proof_image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(query, [
            id, name, santri_name, santri_class, phone, type_id, purchase_type, animal_no_final, group_info, category, type_label, price, payment_method, notes, penyembelih_final, status_final, proof_image
        ]);

        const [newReg] = await pool.query('SELECT * FROM registrations WHERE id = ?', [id]);
        res.status(201).json(newReg[0]);
    } catch (error) {
        console.error('Error creating registration:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

const updateRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        
        if (req.file) {
            updates.proof_image = `/uploads/proofs/${req.file.filename}`;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);

        const query = `UPDATE registrations SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        const [updatedReg] = await pool.query('SELECT * FROM registrations WHERE id = ?', [id]);
        res.json(updatedReg[0]);
    } catch (error) {
        console.error('Error updating registration:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

const deleteRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM registrations WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { getRegistrations, createRegistration, updateRegistration, deleteRegistration };
