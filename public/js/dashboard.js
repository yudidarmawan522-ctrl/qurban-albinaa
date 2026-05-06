// Global Chart Instances
let trendChartInstance = null;
let distChartInstance = null;
let cachedTypes = [];
let globalRegistrationsData = []; // Store data for export

async function loadDashboardData() {
    const refreshBtn = document.getElementById('btn-refresh');
    const refreshIcon = refreshBtn ? refreshBtn.querySelector('i') : null;

    if (refreshIcon) refreshIcon.classList.add('fa-spin');
    
    try {
        const [registrations, types, settings] = await Promise.all([
            fetchAPI('/registrations'),
            fetchAPI('/types'),
            fetchAPI('/settings')
        ]);

        cachedTypes = types;
        globalRegistrationsData = registrations;

        // Update Stats
        document.getElementById('total-registrations').textContent = registrations.length;
        
        let totalSapiEkor = 0;
        registrations.forEach(r => {
            if (r.category === 'SAPI') {
                if (r.purchase_type === 'Patungan') totalSapiEkor += (1/7);
                else totalSapiEkor += 1;
            }
        });
        totalSapiEkor = Math.ceil(totalSapiEkor);
        
        const dombaOrdered = registrations.filter(r => r.category === 'DOMBA').length;
        const sapiPatunganCount = registrations.filter(r => r.category === 'SAPI' && r.purchase_type === 'Patungan').length;
        const lunasRegs = registrations.filter(r => r.status === 'Confirmed');
        const pendingRegs = registrations.filter(r => r.status === 'Pending');

        const totalFundsLunas = lunasRegs.reduce((sum, reg) => sum + parseFloat(reg.price), 0);
        const totalFundsPending = pendingRegs.reduce((sum, reg) => sum + parseFloat(reg.price), 0);

        document.getElementById('total-funds-lunas').textContent = formatCurrency(totalFundsLunas);
        document.getElementById('total-funds-pending').textContent = 'Pending: ' + formatCurrency(totalFundsPending);
        
        document.getElementById('ordered-sapi').textContent = totalSapiEkor;
        document.getElementById('ordered-domba').textContent = dombaOrdered;
        if (document.getElementById('sapi-patungan-count')) {
            document.getElementById('sapi-patungan-count').textContent = sapiPatunganCount;
        }

        // Progress Logic
        const targetSapi = settings.target_sapi || 30;
        const targetDomba = settings.target_domba || 300;
        
        const sapiProgress = Math.min((totalSapiEkor / targetSapi) * 100, 100);
        const dombaProgress = Math.min((dombaOrdered / targetDomba) * 100, 100);
        
        document.getElementById('progress-sapi').style.width = sapiProgress + '%';
        document.getElementById('progress-domba').style.width = dombaProgress + '%';
        document.getElementById('target-sapi-label').textContent = `Target: ${targetSapi} Ekor`;
        document.getElementById('target-domba-label').textContent = `Target: ${targetDomba} Ekor`;

        // Recent Table
        const tableBody = document.querySelector('#recent-table tbody');
        tableBody.innerHTML = ''; 
        registrations.slice(0, 10).forEach(reg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${reg.name}</strong></td>
                <td>${reg.santri_name || '-'}</td>
                <td>${reg.santri_class || '-'}</td>
                <td>${reg.category} - ${reg.type_label}</td>
                <td style="text-align: center;">
                    ${reg.proof_image ? `
                        <button class="btn-view-proof" onclick="viewProof('${reg.proof_image}')" style="background: #e3f2fd; color: #1565c0; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                            <i class="fas fa-image"></i> Lihat
                        </button>
                    ` : '<span style="color: #ccc; font-size: 0.8rem;">Tidak ada</span>'}
                </td>
                <td><span class="badge ${reg.status === 'Pending' ? 'badge-pending' : 'badge-confirmed'}">${reg.status}</span></td>
                <td>
                    <button onclick="handleReceiptDownload('${reg.id}')" style="background: #004d40; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-file-pdf"></i> Kwitansi
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        updateTrendChart(registrations);
        updateDistChart(registrations);

    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    } finally {
        if (refreshIcon) {
            setTimeout(() => refreshIcon.classList.remove('fa-spin'), 500);
        }
    }
}

// Wrapper for global receipt function
window.handleReceiptDownload = (id) => {
    const reg = globalRegistrationsData.find(r => r.id == id);
    if (reg) window.downloadReceipt(reg);
};

// Global function for proof viewing
window.viewProof = (url) => {
    const modal = document.getElementById('modal-image-view');
    const img = document.getElementById('full-proof-img');
    img.src = url;
    modal.style.display = 'block';
};

function updateTrendChart(registrations) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    if (trendChartInstance) trendChartInstance.destroy();

    const labels = [];
    const sapiData = [];
    const dombaData = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        labels.push(dateStr);
        
        const dayRegs = registrations.filter(r => {
            const regDate = new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            return regDate === dateStr;
        });
        
        sapiData.push(dayRegs.filter(r => r.category === 'SAPI').length);
        dombaData.push(dayRegs.filter(r => r.category === 'DOMBA').length);
    }

    trendChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Sapi', data: sapiData, backgroundColor: '#004d40', borderRadius: 5 },
                { label: 'Domba', data: dombaData, backgroundColor: '#fb8c00', borderRadius: 5 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
            }
        }
    });
}

function updateDistChart(registrations) {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;

    if (distChartInstance) distChartInstance.destroy();

    const sapiCount = registrations.filter(r => r.category === 'SAPI').length;
    const dombaCount = registrations.filter(r => r.category === 'DOMBA').length;
    
    document.getElementById('dist-total').textContent = registrations.length;

    distChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sapi', 'Domba'],
            datasets: [{
                data: [sapiCount, dombaCount],
                backgroundColor: ['#004d40', '#fb8c00'],
                hoverOffset: 10,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setInterval(loadDashboardData, 5000);

    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadDashboardData();
        });
    }

    // Export Excel Button
    const exportBtn = document.querySelector('.btn-export i.fa-file-export')?.parentElement || document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.onclick = (e) => {
            e.preventDefault();
            if (typeof XLSX === 'undefined') {
                alert('Library Export sedang dimuat, silakan coba sesaat lagi.');
                return;
            }
            const wb = XLSX.utils.book_new();
            const data = globalRegistrationsData.map(r => ({
                'ID': r.id,
                'Nama Mudhohi': r.name,
                'Santri': r.santri_name,
                'Kelas': r.santri_class,
                'WhatsApp': r.phone,
                'Tipe': r.type_label,
                'Opsi': r.purchase_type,
                'Harga': r.price,
                'Metode': r.payment_method,
                'Status': r.status
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Data Pekurban');
            XLSX.writeFile(wb, 'Data_Pekurban_AlBinaa.xlsx');
        };
    }

    // Modal & Form Logic
    const modal = document.getElementById('modal-input');
    const btnManual = document.getElementById('btn-manual-input');
    const closeBtn = document.querySelector('.close-modal');
    const adminForm = document.getElementById('admin-input-form');
    const typeSelect = document.getElementById('admin-type');

    if (btnManual) {
        btnManual.onclick = () => {
            modal.style.display = "block";
            if (typeSelect && typeSelect.options.length === 0) {
                cachedTypes.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.id;
                    opt.textContent = `${t.category} - ${t.type} (${t.weight})`;
                    typeSelect.appendChild(opt);
                });
            }
        };
    }

    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    
    // Close image modal
    const imageModal = document.getElementById('modal-image-view');
    const closeImageBtn = document.querySelector('.close-image-modal');
    if (closeImageBtn) closeImageBtn.onclick = () => imageModal.style.display = "none";

    window.onclick = (e) => { 
        if (e.target == modal) modal.style.display = "none"; 
        if (e.target == imageModal) imageModal.style.display = "none";
    };

    if (adminForm) {
        adminForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const btnSubmit = adminForm.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Menyimpan...';

            const formData = new FormData();
            formData.append('name', document.getElementById('admin-name').value);
            formData.append('phone', document.getElementById('admin-phone').value);
            formData.append('santri_name', document.getElementById('admin-santri').value);
            formData.append('santri_class', document.getElementById('admin-class').value);
            formData.append('type_id', document.getElementById('admin-type').value);
            formData.append('purchase_type', document.getElementById('admin-purchase-type').value);
            formData.append('payment_method', document.getElementById('admin-payment-method').value);
            formData.append('penyembelih', document.getElementById('admin-penyembelih').value);
            formData.append('notes', document.getElementById('admin-notes').value);
            formData.append('status', 'Confirmed');

            const proofFile = document.getElementById('admin-proof').files[0];
            if (proofFile) {
                formData.append('proof_image', proofFile);
            }

            try {
                const res = await fetch('/api/registrations', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();

                if (!result.error) {
                    alert('Data berhasil disimpan!');
                    modal.style.display = "none";
                    loadDashboardData();
                    adminForm.reset();
                } else {
                    alert('Gagal menyimpan data: ' + result.message);
                }
            } catch (err) {
                console.error('Error saving manual input:', err);
                alert('Kesalahan sistem: ' + (err.message || 'Koneksi ke database terputus.'));
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fas fa-save"></i> SIMPAN DATA PENDAFTARAN';
            }
        };
    }
});
