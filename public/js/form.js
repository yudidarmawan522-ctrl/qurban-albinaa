document.addEventListener('DOMContentLoaded', async () => {
    const animalTypesContainer = document.getElementById('animal-types-container');
    const selectedTypeIdInput = document.getElementById('selected-type-id');
    const purchaseTypeSelect = document.getElementById('purchase_type');
    const animalNoContainer = document.getElementById('animal-no-container');
    const qurbanForm = document.getElementById('qurban-form');
    const orderSummary = document.getElementById('order-summary');

    let allTypes = [];

    // 1. Fetch Animal Types
    try {
        allTypes = await fetchAPI('/types');
        animalTypesContainer.innerHTML = '';
        allTypes.forEach(type => {
            const card = document.createElement('div');
            card.className = 'animal-card';
            card.innerHTML = `
                <div style="height: 120px; overflow: hidden; border-radius: 10px; margin-bottom: 1rem;">
                    <img src="img/${type.category.toLowerCase()}_new.png" alt="${type.type}" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <h4 style="font-weight: 800; color: var(--primary);">${type.type}</h4>
                <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">${type.weight}</p>
                <div class="price">${formatCurrency(type.price)}</div>
            `;
            card.onclick = () => {
                document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedTypeIdInput.value = type.id;
                updateSummary();
            };
            animalTypesContainer.appendChild(card);
        });
    } catch (err) {
        console.error('Failed to load types:', err);
    }

    // 2. Handle Opsi Pembelian Toggle
    purchaseTypeSelect.onchange = () => {
        if (purchaseTypeSelect.value === 'Patungan') {
            animalNoContainer.style.display = 'block';
        } else {
            animalNoContainer.style.display = 'none';
        }
        updateSummary();
    };

    function updateSummary() {
        const typeId = selectedTypeIdInput.value;
        const type = allTypes.find(t => t.id == typeId);
        if (!type) return;

        orderSummary.style.display = 'block';
        document.getElementById('summary-animal').textContent = `${type.category} - ${type.type}`;
        document.getElementById('summary-option').textContent = purchaseTypeSelect.value;
        
        const finalPrice = purchaseTypeSelect.value === 'Patungan' ? type.price_per_share : type.price;
        document.getElementById('summary-price').textContent = formatCurrency(finalPrice);
    }

    // 3. Form Submission with FormData
    qurbanForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const typeId = selectedTypeIdInput.value;
        if (!typeId) {
            alert('Silakan pilih jenis hewan qurban terlebih dahulu!');
            return;
        }

        const btnSubmit = document.getElementById('btn-submit');
        const btnText = document.getElementById('btn-text');
        btnSubmit.disabled = true;
        btnText.textContent = 'MENGIRIM...';

        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('phone', document.getElementById('phone').value);
        formData.append('santri_name', document.getElementById('santri_name').value);
        formData.append('santri_class', document.getElementById('santri_class').value);
        formData.append('type_id', typeId);
        formData.append('purchase_type', purchaseTypeSelect.value);
        formData.append('animal_no', document.getElementById('animal_no').value);
        formData.append('payment_method', document.getElementById('payment_method').value);
        formData.append('penyembelih', document.getElementById('penyembelih').value);
        formData.append('notes', document.getElementById('notes').value);

        const proofFile = document.getElementById('proof_image').files[0];
        if (proofFile) {
            formData.append('proof_image', proofFile);
        }

        try {
            const response = await fetch('/api/registrations', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (!result.error) {
                showSuccessMessage(result);
            } else {
                alert('Gagal: ' + result.message);
                btnSubmit.disabled = false;
                btnText.textContent = 'KIRIM PENDAFTARAN';
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('Terjadi kesalahan sistem. Silakan coba lagi.');
            btnSubmit.disabled = false;
            btnText.textContent = 'KIRIM PENDAFTARAN';
        }
    };

    function showSuccessMessage(reg) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center; border-radius: 30px; padding: 3rem;">
                <div style="width: 80px; height: 80px; background: #e8f5e9; color: #2e7d32; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1.5rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="color: var(--primary); font-weight: 800; margin-bottom: 0.5rem;">Pendaftaran Berhasil!</h2>
                <p style="color: #666; margin-bottom: 2rem;">Barakallahu lakum. Pendaftaran Anda dengan ID <strong>#${reg.id}</strong> telah kami terima.</p>
                
                <div style="background: #f8fafc; border-radius: 20px; padding: 1.5rem; text-align: left; margin-bottom: 2rem; border: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #888;">Mudhohi:</span>
                        <strong style="color: var(--primary);">${reg.name}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #888;">Hewan:</span>
                        <strong>${reg.category} - ${reg.type_label}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #888;">Total:</span>
                        <strong style="color: #c62828; font-size: 1.2rem;">${formatCurrency(reg.price)}</strong>
                    </div>
                </div>

                <div style="display: grid; gap: 1rem;">
                    <button onclick="window.location.reload()" class="btn-primary" style="width: 100%; padding: 1rem; border-radius: 15px;">
                        SELESAI
                    </button>
                    <a href="https://wa.me/6281234567890?text=Assalamualaikum, Saya ${reg.name} mengonfirmasi pendaftaran Qurban #${reg.id}" 
                       target="_blank" style="text-decoration: none; color: #25d366; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fab fa-whatsapp"></i> KONFIRMASI VIA WHATSAPP
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
});
