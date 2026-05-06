const net = require('net');
const port = 3306;
const host = '127.0.0.1';

const client = new net.Socket();
client.setTimeout(2000);

client.connect(port, host, () => {
    console.log(`✅ Port ${port} is OPEN on ${host}`);
    client.destroy();
});

client.on('error', (err) => {
    console.log(`❌ Port ${port} is CLOSED on ${host}: ${err.message}`);
});

client.on('timeout', () => {
    console.log(`❌ Port ${port} connection TIMED OUT`);
    client.destroy();
});
