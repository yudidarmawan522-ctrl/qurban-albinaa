const API_BASE = '/api';

async function fetchAPI(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        return { error: true, message: error.message };
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Helper to convert Image URL to Base64 for jsPDF
async function getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        img.onerror = error => reject(error);
        img.src = url;
    });
}

// PREMIUM RECEIPT GENERATOR
window.downloadReceipt = async (reg) => {
    if (!reg) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', [210, 148]); // A5 Landscape

    try {
        // Load Logos
        const logoAlBinaa = await getBase64ImageFromURL('img/logo_v2.png');
        const logoFarm = await getBase64ImageFromURL('img/farm_logo.png');

        // Draw Decorative Border
        doc.setDrawColor(0, 77, 64);
        doc.setLineWidth(1.5);
        doc.rect(5, 5, 200, 138); // Outer border
        doc.setLineWidth(0.5);
        doc.rect(7, 7, 196, 134); // Inner border

        // Header Background
        doc.setFillColor(0, 77, 64);
        doc.rect(7, 7, 196, 35, 'F');

        // Add Logos
        doc.addImage(logoAlBinaa, 'PNG', 12, 10, 25, 25);
        doc.addImage(logoFarm, 'PNG', 170, 10, 28, 25);

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('KWITANSI DIGITAL QURBAN', 105, 22, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Pondok Pesantren Al Binaa & Al Binaa Farm', 105, 30, { align: 'center' });
        doc.setFontSize(9);
        doc.text('Jl. Raya Pebayuran No.01, Bekasi, Jawa Barat', 105, 36, { align: 'center' });

        // Content Area
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`ID TRANSAKSI: #${reg.id.toString().padStart(6, '0')}`, 12, 52);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tanggal: ${new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 150, 52);

        doc.setDrawColor(200, 200, 200);
        doc.line(12, 56, 198, 56);

        // Details Table-like layout
        doc.setFontSize(12);
        doc.text('Telah terima dari', 12, 70);
        doc.setFont('helvetica', 'bold');
        doc.text(`:  ${reg.name.toUpperCase()}`, 50, 70);

        doc.setFont('helvetica', 'normal');
        doc.text('Nama Santri', 12, 80);
        doc.text(`:  ${reg.santri_name} (${reg.santri_class})`, 50, 80);

        doc.text('Uang Sejumlah', 12, 90);
        doc.setFillColor(240, 248, 245);
        doc.rect(50, 83, 148, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 105, 92);
        doc.text(`:  ${formatCurrency(reg.price)}`, 50, 90);

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text('Untuk Pembayaran', 12, 100);
        doc.text(`:  Pendaftaran Qurban ${reg.category} (${reg.type_label})`, 50, 100);
        doc.setFontSize(10);
        doc.text(`   Opsi: ${reg.purchase_type} | Metode: ${reg.payment_method}`, 50, 106);

        // QR Code for verification (Placeholder for "Edan" look)
        doc.setDrawColor(0, 77, 64);
        doc.rect(12, 112, 25, 25);
        doc.setFontSize(7);
        doc.text('Verified Digital', 12, 140);
        doc.text('Scan for Authenticity', 12, 143);

        // Footer / Signature
        doc.setFontSize(11);
        doc.text('Bekasi, ' + new Date().toLocaleDateString('id-ID'), 155, 115);
        doc.text('Panitia Qurban Al Binaa,', 155, 120);
        doc.setFont('helvetica', 'bold');
        doc.text('AL BINAA FARM TEAM', 155, 138);

        doc.save(`Kwitansi_Qurban_${reg.name}_${reg.id}.pdf`);
    } catch (err) {
        console.error('Receipt Error:', err);
        alert('Gagal membuat kwitansi. Pastikan semua library termuat.');
    }
};

// Global Clock Initialization
function initClock() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (!timeEl || !dateEl) return;

    setInterval(() => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('id-ID', { hour12: false });
        dateEl.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    initClock();
});
