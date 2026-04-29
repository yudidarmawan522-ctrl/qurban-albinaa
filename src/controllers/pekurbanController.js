const { readDB, writeDB } = require('../config/database');

const getRegistrations = (req, res) => {
    const db = readDB();
    res.json(db.registrations);
};

const createRegistration = (req, res) => {
    const db = readDB();
    const { name, santri_name, santri_class, phone, type_id, purchase_type, animal_no, payment_method, notes, penyembelih } = req.body;

    if (!name || !santri_name || !phone || !type_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const qurbanType = db.types.find(t => t.id === type_id);
    if (!qurbanType) {
        return res.status(404).json({ message: 'Qurban type not found' });
    }

    let group_info = null;

    // Handle Patungan Grouping
    if (purchase_type === 'Patungan') {
        const inv = db.inventory[type_id] || [];
        const animal = inv.find(a => a.no === animal_no);
        if (animal && animal.slots) {
            const emptySlot = animal.slots.findIndex(s => s === null);
            if (emptySlot !== -1) {
                animal.slots[emptySlot] = name;
                const count = animal.slots.filter(s => s !== null).length;
                group_info = count === 7 ? "Full" : `Menunggu ${7 - count} Orang Lagi`;
            }
        }
    }

    const newRegistration = {
        id: 'REG-' + Date.now(),
        name,
        santri_name,
        santri_class,
        phone,
        type_id,
        purchase_type,
        animal_no: animal_no,
        group_status: group_info,
        category: qurbanType.category,
        type_label: qurbanType.type,
        price: purchase_type === 'Patungan' ? qurbanType.price_per_share : qurbanType.price,
        payment_method,
        notes,
        penyembelih: penyembelih || '-',
        status: 'Pending',
        created_at: new Date().toISOString()
    };

    db.registrations.push(newRegistration);
    writeDB(db);

    res.status(201).json(newRegistration);
};

module.exports = { getRegistrations, createRegistration };
