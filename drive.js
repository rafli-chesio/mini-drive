import { auth, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, uploadString, listAll, getDownloadURL, deleteObject, uploadBytes, getMetadata } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

let currentUser;
let currentPath = ''; // '' artinya di root

// --- Langsung daftarkan Event Listeners ---
const newFolderBtn = document.getElementById('new-folder-btn');
const newFolderModal = document.getElementById('new-folder-modal');
const closeModalBtn = document.querySelector('#new-folder-modal .close-btn');
const createFolderConfirmBtn = document.getElementById('create-folder-confirm-btn');
const uploadFileBtn = document.getElementById('upload-file-btn');
const uploadFileModal = document.getElementById('upload-file-modal');
const closeUploadModalBtn = document.querySelector('#upload-file-modal .close-btn');
const uploadConfirmBtn = document.getElementById('upload-confirm-btn');
const logoutBtn = document.getElementById('logout-btn');

newFolderBtn.onclick = () => newFolderModal.style.display = 'flex';
closeModalBtn.onclick = () => newFolderModal.style.display = 'none';
createFolderConfirmBtn.onclick = createFolder;
uploadFileBtn.onclick = showUploadModal;
closeUploadModalBtn.onclick = () => uploadFileModal.style.display = 'none';
uploadConfirmBtn.onclick = uploadFiles;
logoutBtn.onclick = logout;


onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user;
        document.getElementById('user-email').textContent = user.email;
        renderCurrentPath();
    } else {
        window.location.href = "index.html";
    }
});

// --- Helper Functions ---
function showSpinner() { document.getElementById('spinner-overlay').style.display = 'flex'; }
function hideSpinner() { document.getElementById('spinner-overlay').style.display = 'none'; }
function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {'png':'fas fa-file-image','jpg':'fas fa-file-image','jpeg':'fas fa-file-image','gif':'fas fa-file-image','pdf':'fas fa-file-pdf','doc':'fas fa-file-word','docx':'fas fa-file-word','xls':'fas fa-file-excel','xlsx':'fas fa-file-excel','ppt':'fas fa-file-powerpoint','pptx':'fas fa-file-powerpoint','zip':'fas fa-file-archive','rar':'fas fa-file-archive','tar':'fas fa-file-archive','gz':'fas fa-file-archive','mp3':'fas fa-file-audio','wav':'fas fa-file-audio','mp4':'fas fa-file-video','mov':'fas fa-file-video','avi':'fas fa-file-video','js':'fab fa-js-square','html':'fab fa-html5','css':'fab fa-css3-alt','py':'fab fa-python','java':'fab fa-java','cs':'fab fa-microsoft','txt':'fas fa-file-alt','json':'fas fa-file-code','sh':'fas fa-terminal'};
    return iconMap[extension] || 'fas fa-file';
}

// --- Fungsi Utama ---
async function renderCurrentPath() {
    showSpinner();
    const fullPath = `files/${currentUser.uid}/${currentPath}`;
    const pathRef = ref(storage, fullPath);
    const tableBody = document.getElementById('file-table-body');
    const placeholder = document.getElementById('placeholder-text');
    tableBody.innerHTML = '';
    placeholder.style.display = 'block';
    placeholder.textContent = "Memuat...";

    try {
        const res = await listAll(pathRef);
        let items = [];
        for (const folderRef of res.prefixes) {
            items.push({ name: folderRef.name, fullPath: folderRef.fullPath, isFolder: true, updated: new Date().toISOString() });
        }
        if (currentPath !== '') { // Hanya tampilkan file jika di dalam folder
            for (const itemRef of res.items) {
                if (itemRef.name === '.keep') continue;
                const metadata = await getMetadata(itemRef);
                items.push({ ...metadata, isFolder: false });
            }
        }

        if (items.length === 0) {
            placeholder.textContent = currentPath === '' ? "Belum ada folder. Buat folder baru untuk memulai." : "Folder ini kosong.";
        } else {
            placeholder.style.display = 'none';
        }

        if (currentPath !== '') {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.innerHTML = `<td colspan="4" class="back-row"><i class="fas fa-arrow-left"></i> Kembali ke My Drive</td>`;
            tr.onclick = () => { currentPath = ''; renderCurrentPath(); };
            tableBody.appendChild(tr);
        }

        for (const item of items) {
            const tr = document.createElement('tr');
            let downloadButtonHTML = '';
            if (!item.isFolder) {
                const url = await getDownloadURL(ref(storage, item.fullPath));
                downloadButtonHTML = `<a href="${url}" target="_blank" class="action-btn" title="Unduh"><i class="fas fa-download"></i></a>`;
            }

            tr.innerHTML = `
                <td class="file-name-cell"><i class="file-icon ${item.isFolder ? 'fas fa-folder' : getFileIcon(item.name)}"></i> ${item.name}</td>
                <td>${new Date(item.updated).toLocaleDateString('id-ID')}</td>
                <td>${item.isFolder ? '—' : formatBytes(item.size)}</td>
                <td class="action-buttons">
                    ${downloadButtonHTML}
                    <button title="Hapus" class="delete-btn action-btn"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            if (item.isFolder) {
                tr.style.cursor = 'pointer';
                tr.onclick = (e) => {
                    if (!e.target.closest('.action-btn')) {
                        currentPath = item.name;
                        renderCurrentPath();
                    }
                };
            }
            
            tr.querySelector('.delete-btn').onclick = (e) => {
                e.stopPropagation();
                deleteItem(item);
            };

            tableBody.appendChild(tr);
        }
    } catch (err) {
        console.error("Gagal memuat file:", err);
        placeholder.textContent = "Gagal memuat file. Coba refresh halaman.";
    } finally {
        hideSpinner();
    }
}

function createFolder() {
    const folderName = document.getElementById('folderNameInput').value.trim();
    if (!folderName) return alert("Nama folder tidak boleh kosong!");

    const folderRef = ref(storage, `files/${currentUser.uid}/${folderName}/.keep`);
    showSpinner();
    uploadString(folderRef, "").then(() => {
        document.getElementById('folderNameInput').value = "";
        document.getElementById('new-folder-modal').style.display = 'none';
        renderCurrentPath();
    });
}

async function showUploadModal() {
    const select = document.getElementById('folder-destination-select');
    select.innerHTML = '';
    const rootRef = ref(storage, `files/${currentUser.uid}/`);
    const res = await listAll(rootRef);

    if (res.prefixes.length === 0) {
        return alert("Anda harus membuat folder terlebih dahulu sebelum mengunggah file!");
    }

    res.prefixes.forEach(folderRef => {
        const option = document.createElement('option');
        option.value = folderRef.name;
        option.textContent = folderRef.name;
        select.appendChild(option);
    });
    document.getElementById('upload-file-modal').style.display = 'flex';
}

function uploadFiles() {
    const files = document.getElementById('file-upload-input').files;
    const folder = document.getElementById('folder-destination-select').value;
    if (files.length === 0 || !folder) return;

    showSpinner();
    const uploadPromises = Array.from(files).map(file => {
        const fileRef = ref(storage, `files/${currentUser.uid}/${folder}/${file.name}`);
        return uploadBytes(fileRef, file);
    });

    Promise.all(uploadPromises).then(() => {
        document.getElementById('upload-file-modal').style.display = 'none';
        if (currentPath === folder) {
            renderCurrentPath();
        } else {
            hideSpinner();
        }
    }).catch(err => {
        alert("Gagal mengunggah file.");
        hideSpinner();
    });
}

async function deleteItem(item) {
    const itemName = item.name;
    const confirmMessage = item.isFolder ? `Yakin mau hapus folder '${itemName}' beserta semua isinya?` : `Yakin mau hapus file '${itemName}'?`;
    if (!confirm(confirmMessage)) return;

    showSpinner();
    try {
        if (item.isFolder) {
            const folderRef = ref(storage, item.fullPath);
            const res = await listAll(folderRef);
            const deletePromises = res.items.map(fileRef => deleteObject(fileRef));
            await Promise.all(deletePromises);
            // Hapus juga folder itu sendiri (dengan menghapus file .keep jika ada)
            const keepFileRef = ref(storage, `${item.fullPath}/.keep`);
            await deleteObject(keepFileRef).catch(() => {});
        } else {
            const fileRef = ref(storage, item.fullPath);
            await deleteObject(fileRef);
        }
        renderCurrentPath();
    } catch (err) {
        alert("Gagal menghapus item.");
        hideSpinner();
    }
}

function logout() {
    signOut(auth);
}