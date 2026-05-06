const pool = require('../src/config/database');

async function checkStats() {
    try {
        const [registrations] = await pool.query('SELECT * FROM registrations');
        console.log('Total Registrations:', registrations.length);
        
        let totalSapiEkor = 0;
        registrations.forEach(r => {
            if (r.category === 'SAPI') {
                if (r.purchase_type === 'Patungan') totalSapiEkor += (1/7);
                else totalSapiEkor += 1;
            }
        });
        totalSapiEkor = Math.ceil(totalSapiEkor);
        
        const dombaOrdered = registrations.filter(r => r.category === 'DOMBA').length;
        
        console.log('Sapi (Ekor):', totalSapiEkor);
        console.log('Domba (Ekor):', dombaOrdered);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStats();
