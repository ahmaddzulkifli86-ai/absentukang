// Konstanta Harga
const HARGA_TUKANG = 220000;
const HARGA_KENEK = 150000;

// GitHub API Configuration
const GITHUB_TOKEN = 'ghp_YOUR_TOKEN_HERE'; // Akan diisi user
const REPO_OWNER = 'ahmaddzulkifli86-ai';
const REPO_NAME = 'absentukang';
const DATA_FILE = 'data.json';
const SALDO_FILE = 'saldo.json';

// Data penyimpanan
let dataAbsensi = [];
let saldoTersedia = 0;
let lastSyncTime = null;

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Set tanggal input ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
    
    // Load data dari cloud
    loadDataFromCloud();
    
    // Update perhitungan ketika input berubah
    document.getElementById('jumlahTukang').addEventListener('input', updateSummary);
    document.getElementById('jumlahKenek').addEventListener('input', updateSummary);
    
    // Auto sync setiap 10 detik
    setInterval(syncDataFromCloud, 10000);
});

// Inisialisasi GitHub Token
function initGitHubToken() {
    const token = localStorage.getItem('githubToken');
    if (!token) {
        const userToken = prompt('Masukkan GitHub Personal Access Token Anda:\n\nBuat token di: https://github.com/settings/tokens\n- Pilih scopes: repo (full control of private repositories)');
        if (userToken) {
            localStorage.setItem('githubToken', userToken);
            return userToken;
        }
    }
    return token;
}

// Load data dari Cloud (GitHub)
async function loadDataFromCloud() {
    try {
        const token = initGitHubToken();
        if (!token) {
            showNotification('Mohon setup GitHub token terlebih dahulu', 'warning');
            loadDataFromLocal();
            return;
        }
        
        // Load absensi data
        const absensiResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
            {
                headers: { 'Authorization': `token ${token}` }
            }
        );
        
        if (absensiResponse.ok) {
            const absensiData = await absensiResponse.json();
            const decodedContent = atob(absensiData.content);
            const parsedData = JSON.parse(decodedContent);
            dataAbsensi = parsedData.data || [];
        }
        
        // Load saldo data
        const saldoResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${SALDO_FILE}`,
            {
                headers: { 'Authorization': `token ${token}` }
            }
        );
        
        if (saldoResponse.ok) {
            const saldoData = await saldoResponse.json();
            const decodedContent = atob(saldoData.content);
            const parsedData = JSON.parse(decodedContent);
            saldoTersedia = parsedData.saldo || 0;
        }
        
        tampilkanTabel();
        updateSaldoDisplay();
        updateSyncStatus();
    } catch (error) {
        console.log('Cloud sync error:', error);
        loadDataFromLocal();
    }
}

// Sync data dari cloud
async function syncDataFromCloud() {
    try {
        const token = localStorage.getItem('githubToken');
        if (!token) return;
        
        const absensiResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
            {
                headers: { 'Authorization': `token ${token}` }
            }
        );
        
        if (absensiResponse.ok) {
            const absensiData = await absensiResponse.json();
            const decodedContent = atob(absensiData.content);
            const parsedData = JSON.parse(decodedContent);
            const cloudData = parsedData.data || [];
            
            // Cek jika ada perubahan di cloud
            if (JSON.stringify(cloudData) !== JSON.stringify(dataAbsensi)) {
                dataAbsensi = cloudData;
                tampilkanTabel();
            }
        }
        
        const saldoResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${SALDO_FILE}`,
            {
                headers: { 'Authorization': `token ${token}` }
            }
        );
        
        if (saldoResponse.ok) {
            const saldoData = await saldoResponse.json();
            const decodedContent = atob(saldoData.content);
            const parsedData = JSON.parse(decodedContent);
            const cloudSaldo = parsedData.saldo || 0;
            
            if (cloudSaldo !== saldoTersedia) {
                saldoTersedia = cloudSaldo;
                updateSaldoDisplay();
            }
        }
        
        updateSyncStatus();
    } catch (error) {
        console.log('Sync error:', error);
    }
}

// Simpan data ke Cloud (GitHub)
async function saveDataToCloud() {
    try {
        const token = localStorage.getItem('githubToken');
        if (!token) {
            showNotification('GitHub token tidak ditemukan', 'warning');
            saveDataToLocal();
            return;
        }
        
        // Save absensi data
        const absensiContent = JSON.stringify({
            data: dataAbsensi,
            lastUpdate: new Date().toISOString()
        }, null, 2);
        
        // Get SHA untuk update
        const checkResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
            {
                headers: { 'Authorization': `token ${token}` }
            }
        );
        
        let sha = null;
        if (checkResponse.ok) {
            const fileData = await checkResponse.json();
            sha = fileData.sha;
        }
        
        // Upload absensi
        await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update absensi data',
                    content: btoa(absensiContent),
                    sha: sha
                })
            }
        );
        
        // Save saldo data
        const saldoContent = JSON.stringify({
            saldo: saldoTersedia,
            lastUpdate: new Date().toISOString()
        }, null, 2);
        
        const saldoCheckResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${SALDO_FILE}`,
            {
                headers: { 'Authorization': `token ${token}` }
            }
        );
        
        let saldoSha = null;
        if (saldoCheckResponse.ok) {
            const saldoData = await saldoCheckResponse.json();
            saldoSha = saldoData.sha;
        }
        
        // Upload saldo
        await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${SALDO_FILE}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update saldo data',
                    content: btoa(saldoContent),
                    sha: saldoSha
                })
            }
        );
        
        updateSyncStatus();
        showNotification('Data tersimpan ke cloud', 'success');
    } catch (error) {
        console.error('Cloud save error:', error);
        showNotification('Gagal menyimpan ke cloud, disimpan lokal', 'warning');
        saveDataToLocal();
    }
}

// Load data dari Local (Backup)
function loadDataFromLocal() {
    const saved = localStorage.getItem('dataAbsensi');
    const saldo = localStorage.getItem('saldoTersedia');
    
    if (saved) {
        dataAbsensi = JSON.parse(saved);
        tampilkanTabel();
    }
    
    if (saldo) {
        saldoTersedia = parseInt(saldo);
    }
    
    updateSaldoDisplay();
}

// Simpan data lokal
function saveDataToLocal() {
    localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
    localStorage.setItem('saldoTersedia', saldoTersedia);
}

// Update tampilan sync status
function updateSyncStatus() {
    lastSyncTime = new Date();
    const timeString = lastSyncTime.toLocaleTimeString('id-ID');
    document.getElementById('lastSync').textContent = `⏱️ Terakhir: ${timeString}`;
    document.getElementById('syncStatus').textContent = '🟢 Sinkron';
}

// Update ringkasan perhitungan
function updateSummary() {
    const jumlahTukang = parseInt(document.getElementById('jumlahTukang').value) || 0;
    const jumlahKenek = parseInt(document.getElementById('jumlahKenek').value) || 0;
    
    const biayaTukang = jumlahTukang * HARGA_TUKANG;
    const biayaKenek = jumlahKenek * HARGA_KENEK;
    const totalBiaya = biayaTukang + biayaKenek;
    
    document.getElementById('biayaTukang').textContent = formatRupiah(biayaTukang);
    document.getElementById('biayaKenek').textContent = formatRupiah(biayaKenek);
    document.getElementById('totalBiaya').textContent = formatRupiah(totalBiaya);
}

// Format angka ke Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(angka);
}

// Tambah saldo
function tambahSaldo() {
    const inputElement = document.getElementById('tambahSaldoInput');
    const jumlah = parseInt(inputElement.value) || 0;
    
    if (jumlah <= 0) {
        alert('Mohon masukkan jumlah saldo yang valid');
        return;
    }
    
    saldoTersedia += jumlah;
    saveDataToLocal();
    saveDataToCloud();
    updateSaldoDisplay();
    inputElement.value = '';
    
    showNotification('Saldo berhasil ditambahkan', 'success');
}

// Update tampilan saldo
function updateSaldoDisplay() {
    const totalPengeluaran = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    const sisaSaldo = saldoTersedia - totalPengeluaran;
    
    document.getElementById('saldoTersedia').textContent = formatRupiah(saldoTersedia);
    document.getElementById('totalPengeluaran').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('sisaSaldo').textContent = formatRupiah(sisaSaldo);
    
    // Ubah warna sisa saldo berdasarkan kondisi
    const sisaSaldoElement = document.getElementById('sisaSaldo');
    if (sisaSaldo < 0) {
        sisaSaldoElement.style.color = '#dc2626';
    } else if (sisaSaldo === 0) {
        sisaSaldoElement.style.color = '#f59e0b';
    } else {
        sisaSaldoElement.style.color = '#2563eb';
    }
}

// Tambah data absensi
function tambahData() {
    const tanggal = document.getElementById('tanggal').value;
    const jumlahTukang = parseInt(document.getElementById('jumlahTukang').value) || 0;
    const jumlahKenek = parseInt(document.getElementById('jumlahKenek').value) || 0;
    
    if (!tanggal) {
        alert('Mohon pilih tanggal');
        return;
    }
    
    if (jumlahTukang === 0 && jumlahKenek === 0) {
        alert('Mohon masukkan jumlah tukang atau kenek');
        return;
    }
    
    const biayaTukang = jumlahTukang * HARGA_TUKANG;
    const biayaKenek = jumlahKenek * HARGA_KENEK;
    const totalBiaya = biayaTukang + biayaKenek;
    
    // Cek saldo cukup
    const totalPengeluaranSekarang = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    if (saldoTersedia < totalPengeluaranSekarang + totalBiaya) {
        alert('Saldo tidak cukup!\nSaldo tersedia: ' + formatRupiah(saldoTersedia) + '\nKebutuhan: ' + formatRupiah(totalPengeluaranSekarang + totalBiaya));
        return;
    }
    
    // Cek apakah tanggal sudah ada
    const indexExist = dataAbsensi.findIndex(item => item.tanggal === tanggal);
    
    if (indexExist !== -1) {
        if (confirm('Tanggal ' + tanggal + ' sudah ada. Ingin ganti data?')) {
            dataAbsensi[indexExist] = {
                tanggal,
                jumlahTukang,
                jumlahKenek,
                biayaTukang,
                biayaKenek,
                totalBiaya
            };
        } else {
            return;
        }
    } else {
        dataAbsensi.push({
            tanggal,
            jumlahTukang,
            jumlahKenek,
            biayaTukang,
            biayaKenek,
            totalBiaya
        });
    }
    
    dataAbsensi.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    
    saveDataToLocal();
    saveDataToCloud();
    tampilkanTabel();
    updateSaldoDisplay();
    resetForm();
    
    showNotification('Data berhasil ditambahkan! Sisa saldo: ' + formatRupiah(saldoTersedia - dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0)), 'success');
}

// Tampilkan tabel absensi
function tampilkanTabel() {
    const isiTabel = document.getElementById('isiTabel');
    const pesanKosong = document.getElementById('pesanKosong');
    
    if (dataAbsensi.length === 0) {
        isiTabel.innerHTML = '';
        pesanKosong.style.display = 'block';
        return;
    }
    
    pesanKosong.style.display = 'none';
    isiTabel.innerHTML = dataAbsensi.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.jumlahTukang}</td>
            <td>${item.jumlahKenek}</td>
            <td>${formatRupiah(item.biayaTukang)}</td>
            <td>${formatRupiah(item.biayaKenek)}</td>
            <td><strong>${formatRupiah(item.totalBiaya)}</strong></td>
            <td>
                <button class="btn-delete" onclick="hapusData(${index})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

// Format tanggal
function formatTanggal(tanggal) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', options);
}

// Hapus data berdasarkan index
function hapusData(index) {
    if (confirm('Yakin ingin menghapus data ini?')) {
        dataAbsensi.splice(index, 1);
        saveDataToLocal();
        saveDataToCloud();
        tampilkanTabel();
        updateSaldoDisplay();
        showNotification('Data berhasil dihapus', 'info');
    }
}

// Hapus semua data
function hapusSemua() {
    if (confirm('Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
        dataAbsensi = [];
        saveDataToLocal();
        saveDataToCloud();
        tampilkanTabel();
        updateSaldoDisplay();
        resetForm();
        showNotification('Semua data berhasil dihapus', 'warning');
    }
}

// Reset form
function resetForm() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
    document.getElementById('jumlahTukang').value = 0;
    document.getElementById('jumlahKenek').value = 0;
    updateSummary();
}

// Export ke CSV
function exportCSV() {
    if (dataAbsensi.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }
    
    let csv = 'Sistem Absensi Tukang & Kenek\n';
    csv += 'Tanggal Export,' + new Date().toLocaleString('id-ID') + '\n';
    csv += 'Saldo Tersedia,' + saldoTersedia + '\n\n';
    csv += 'No,Tanggal,Tukang,Kenek,Biaya Tukang,Biaya Kenek,Total\n';
    
    dataAbsensi.forEach((item, index) => {
        csv += `${index + 1},"${item.tanggal}",${item.jumlahTukang},${item.jumlahKenek},${item.biayaTukang},${item.biayaKenek},${item.totalBiaya}\n`;
    });
    
    const totalTukang = dataAbsensi.reduce((sum, item) => sum + item.biayaTukang, 0);
    const totalKenek = dataAbsensi.reduce((sum, item) => sum + item.biayaKenek, 0);
    const grandTotal = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    const sisaSaldo = saldoTersedia - grandTotal;
    
    csv += '\n,Total:,,,' + totalTukang + ',' + totalKenek + ',' + grandTotal + '\n';
    csv += '\n,Sisa Saldo:' + sisaSaldo + '\n';
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Absensi_Tukang_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('File berhasil didownload', 'success');
}

// Tampilkan notifikasi
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
        max-width: 400px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Tambah animasi CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);