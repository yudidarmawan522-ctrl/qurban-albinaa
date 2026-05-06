const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`   AL BINAA QURBAN SYSTEM IS ONLINE   `);
    console.log(`   URL: http://localhost:${PORT}        `);
    console.log(`========================================`);
});
