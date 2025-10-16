document.addEventListener('DOMContentLoaded', () => {
    // === Konstanta Fisika (dalam satuan SI) ===
    const hbar = 1.054571817e-34; // J.s
    const electronMass = 9.1093837e-31; // kg
    
    // === Faktor Konversi ===
    const eV_to_Joule = 1.60218e-19; // 1 eV = 1.602... x 10^-19 J
    const Angstrom_to_Meter = 1e-10; // 1 Å = 10^-10 m

    // === Elemen-elemen HTML ===
    const form = document.getElementById('calculatorForm');
    const potentialTypeSelect = document.getElementById('potentialType');
    const widthInputContainer = document.getElementById('widthInputContainer');
    const resultsDiv = document.getElementById('results');
    const reflectionResultSpan = document.getElementById('reflectionResult');
    const transmissionResultSpan = document.getElementById('transmissionResult');
    const noteP = document.getElementById('note');

    // === Event Listener untuk mengubah tampilan form ===
    potentialTypeSelect.addEventListener('change', () => {
        if (potentialTypeSelect.value === 'kotak') {
            widthInputContainer.classList.remove('hidden');
        } else {
            widthInputContainer.classList.add('hidden');
        }
    });

    // === Event Listener untuk kalkulasi saat form disubmit ===
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Mencegah halaman reload

        // === Ambil nilai input dan konversi ke satuan SI ===
        const E_eV = parseFloat(document.getElementById('energy').value);
        const V0_eV = parseFloat(document.getElementById('potentialHeight').value);
        
        const E = E_eV * eV_to_Joule;
        const V0 = V0_eV * eV_to_Joule;

        if (E <= 0) {
            alert("Energi (E) harus lebih besar dari 0.");
            return;
        }
        
        if (E === V0) {
            alert("Kalkulasi tidak valid untuk kasus E = V₀. Silakan masukkan nilai yang sedikit berbeda.");
            return;
        }

        let R = 0, T = 0; // Inisialisasi Koefisien Refleksi (R) dan Transmisi (T)
        let note = "";

        // === Logika Perhitungan ===
        if (potentialTypeSelect.value === 'tangga') {
            if (E > V0) {
                const k1 = Math.sqrt(2 * electronMass * E) / hbar;
                const k2 = Math.sqrt(2 * electronMass * (E - V0)) / hbar;
                R = Math.pow((k1 - k2) / (k1 + k2), 2);
                T = (4 * k1 * k2) / Math.pow(k1 + k2, 2);
                note = "Karena E > V₀, partikel memiliki energi cukup untuk melewati potensial, namun mekanika kuantum menunjukkan sebagian masih direfleksikan.";
            } else { // E < V0
                R = 1;
                T = 0;
                note = "Karena E < V₀, partikel tidak memiliki energi cukup dan direfleksikan seluruhnya (refleksi total).";
            }
        } else { // Potensial 'kotak'
            const L_A = parseFloat(document.getElementById('barrierWidth').value);
            if (isNaN(L_A) || L_A <= 0) {
                alert("Lebar kotak (L) harus diisi dan lebih besar dari 0.");
                return;
            }
            const L = L_A * Angstrom_to_Meter;
            
            if (E > V0) {
                const k1 = Math.sqrt(2 * electronMass * E) / hbar;
                const k2 = Math.sqrt(2 * electronMass * (E - V0)) / hbar;
                const denominator = 1 + (Math.pow(V0, 2) * Math.pow(Math.sin(k2 * L), 2)) / (4 * E * (E - V0));
                T = 1 / denominator;
                R = 1 - T;
                note = "Terjadi resonansi transmisi. Walaupun E > V₀, probabilitas transmisi bisa kurang dari 100% tergantung lebar L.";
            } else { // E < V0 (Quantum Tunneling)
                const alpha = Math.sqrt(2 * electronMass * (V0 - E)) / hbar;
                const denominator = 1 + (Math.pow(V0, 2) * Math.pow(Math.sinh(alpha * L), 2)) / (4 * E * (V0 - E));
                T = 1 / denominator;
                R = 1 - T;
                note = "Ini adalah fenomena penerowongan kuantum (Quantum Tunneling)! Secara klasik mustahil, namun partikel memiliki probabilitas untuk 'menembus' penghalang.";
            }
        }

        // === Tampilkan Hasil ===
        reflectionResultSpan.textContent = (R * 100).toFixed(4);
        transmissionResultSpan.textContent = (T * 100).toFixed(4);
        noteP.textContent = note;
        resultsDiv.classList.remove('hidden');
    });
});