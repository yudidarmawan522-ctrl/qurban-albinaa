document.addEventListener('DOMContentLoaded', async () => {
    // Load Stats & Data
    const [registrations, types] = await Promise.all([
        fetchAPI('/registrations'),
        fetchAPI('/types')
    ]);

    // Update Stats
    document.getElementById('total-registrations').textContent = registrations.length;
    
    const totalFunds = registrations.reduce((sum, reg) => sum + reg.price, 0);
    document.getElementById('total-funds').textContent = formatCurrency(totalFunds);

    const sapiOrdered = registrations.filter(r => r.category === 'SAPI').length;
    const dombaOrdered = registrations.filter(r => r.category === 'DOMBA').length;

    document.getElementById('ordered-sapi').textContent = sapiOrdered;
    document.getElementById('ordered-domba').textContent = dombaOrdered;

    // Recent Table
    const tableBody = document.querySelector('#recent-table tbody');
    registrations.slice(-10).reverse().forEach(reg => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${reg.name}</strong></td>
            <td>${reg.santri_name || '-'}</td>
            <td>${reg.santri_class || '-'}</td>
            <td>${reg.category} - ${reg.type_label}</td>
            <td>${reg.penyembelih || '-'}</td>
            <td><span class="badge ${reg.status === 'Pending' ? 'badge-pending' : 'badge-confirmed'}">${reg.status}</span></td>
        `;
        tableBody.appendChild(tr);
    });

    // Chart Logic - TREND CHART (Line)
    const initTrendChart = () => {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        // Group by Date
        const dateGroups = {};
        registrations.forEach(reg => {
            const date = new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            dateGroups[date] = (dateGroups[date] || 0) + 1;
        });

        const labels = Object.keys(dateGroups);
        const data = Object.values(dateGroups);

        // Gradient
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 77, 64, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 77, 64, 0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pendaftaran',
                    data: data,
                    borderColor: '#004d40',
                    borderWidth: 4,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#004d40',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
    };

    // Chart Logic - DISTRIBUTION CHART (Doughnut)
    const initDistChart = () => {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;

        const sapiCount = registrations.filter(r => r.category === 'SAPI').length;
        const dombaCount = registrations.filter(r => r.category === 'DOMBA').length;
        
        document.getElementById('dist-total').textContent = registrations.length;

        new Chart(ctx, {
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
    };

    initTrendChart();
    initDistChart();

    // Modal & Other Logic
    const modal = document.getElementById('modal-input');
    const btnManual = document.getElementById('btn-manual-input');
    const closeBtn = document.querySelector('.close-modal');
    const adminForm = document.getElementById('admin-input-form');
    const typeSelect = document.getElementById('admin-type');

    if (btnManual) {
        btnManual.onclick = () => {
            modal.style.display = "block";
            if (typeSelect.options.length === 0) {
                types.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.id;
                    opt.textContent = `${t.category} - ${t.type} (${t.weight})`;
                    typeSelect.appendChild(opt);
                });
            }
        };
    }

    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

    // Real-time Clock
    const updateClock = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
        const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        if (document.getElementById('clock-time')) document.getElementById('clock-time').textContent = timeStr;
        if (document.getElementById('clock-date')) document.getElementById('clock-date').textContent = dateStr;
    };
    setInterval(updateClock, 1000);
    updateClock();
});
