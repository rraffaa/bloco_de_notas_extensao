// Importa os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Configuração do Firebase fictícia
const isDevelopment = true; // Altere para false quando estiver usando configurações reais

const firebaseConfig = isDevelopment ? {
    apiKey: "exemplo-api-key",
    authDomain: "exemplo-auth-domain",
    projectId: "exemplo-project-id",
    storageBucket: "exemplo-storage-bucket",
    messagingSenderId: "exemplo-sender-id",
    appId: "exemplo-app-id",
    measurementId: "exemplo-measurement-id"
} : {
    apiKey: "real-api-key",
    authDomain: "real-auth-domain",
    projectId: "real-project-id",
    storageBucket: "real-storage-bucket",
    messagingSenderId: "real-sender-id",
    appId: "real-app-id",
    measurementId: "real-measurement-id"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

// Função para sincronizar nota com Firebase
async function syncNote() {
    const noteContent = document.getElementById('note').innerHTML;

    // Usuário fictício "User0"
    const user = { uid: "User0" };

    await setDoc(doc(db, 'users', user.uid), { note: noteContent });
    console.log('Nota sincronizada com sucesso para o usuário fictício User0!');
}

// Função para carregar nota do Firebase
async function loadNoteFromFirebase() {
    // Usuário fictício "User0"
    const user = { uid: "User0" };

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        document.getElementById('note').innerHTML = docSnap.data().note;
    } else {
        console.log('Nenhuma nota encontrada para o usuário fictício User0.');
    }
}

// Função para aplicar estilo ao texto selecionado
function applyStyle(tag) {
    let selection = window.getSelection();
    if (selection.rangeCount > 0) {
        let range = selection.getRangeAt(0);
        let selectedText = range.extractContents();

        let element = document.createElement(tag);
        element.appendChild(selectedText);
        range.insertNode(element);

        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Função para recuperar e exibir notas salvas
function loadSavedNotes() {
    chrome.storage.local.get(['notes'], function(result) {
        const notes = result.notes || [];
        const notesContainer = document.getElementById('notes-container');
        notesContainer.innerHTML = ''; // Limpa o container antes de adicionar as notas

        notes.forEach((note, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Nota ${index + 1}: ${note}`;

            // Adiciona um ícone de exclusão ao lado da nota
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.className = 'delete-btn';
            deleteButton.dataset.index = index;
            deleteButton.addEventListener('click', function() {
                deleteNote(index);
            });

            listItem.appendChild(deleteButton);
            notesContainer.appendChild(listItem);
        });
    });
}

// Função para excluir uma nota
function deleteNote(index) {
    chrome.storage.local.get(['notes'], function(result) {
        const notes = result.notes || [];
        if (index >= 0 && index < notes.length) {
            notes.splice(index, 1); // Remove a nota do array
            chrome.storage.local.set({ notes: notes }, function() {
                console.log('Nota excluída com sucesso!');
                loadSavedNotes(); // Atualiza a lista de notas após exclusão
            });
        }
    });
}

// Função para realizar backup automático
async function autoBackup() {
    const noteContent = document.getElementById('note').innerHTML;

    // Usuário fictício "User0"
    const user = { uid: "User0" };

    // Obtém a data e hora atual para identificar a versão do backup
    const timestamp = new Date().toISOString();
    const backupDocRef = doc(db, 'users', user.uid, 'backups', timestamp);

    await setDoc(backupDocRef, { note: noteContent });
    console.log('Backup automático realizado com sucesso!');
}

// Inicializa o script após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function () {
    const noteDiv = document.getElementById('note');
    const boldButton = document.getElementById('bold-btn');
    const italicButton = document.getElementById('italic-btn');
    const colorPicker = document.getElementById('color-picker');
    const saveButton = document.getElementById('save-btn'); // Novo botão "Salvar Nota"

    // Carrega a nota ao iniciar
    loadNoteFromFirebase();
    loadSavedNotes(); // Carrega as notas salvas ao iniciar

    // Configura ouvintes de eventos para salvar nota
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(4)').addEventListener('click', syncNote);
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(6)').addEventListener('click', syncNote); // Salvar tudo

    // Botão de negrito
    boldButton.addEventListener('click', function () {
        applyStyle('b');
    });

    // Botão de itálico
    italicButton.addEventListener('click', function () {
        applyStyle('i');
    });

    // Alterar cor da fonte
    colorPicker.addEventListener('change', function () {
        let selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let range = selection.getRangeAt(0);
            let selectedText = range.extractContents();

            let span = document.createElement('span');
            span.style.color = colorPicker.value;
            span.appendChild(selectedText);

            range.insertNode(span);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    // Salvar nota automaticamente ao modificar o conteúdo
    noteDiv.addEventListener('input', syncNote);

    // Adiciona o ouvinte de eventos para o botão "Salvar Nota"
    saveButton.addEventListener('click', function () {
        syncNote();
        const noteContent = noteDiv.innerHTML;
        chrome.storage.local.get(['notes'], function(result) {
            const notes = result.notes || [];
            notes.push(noteContent);
            chrome.storage.local.set({ notes: notes }, function() {
                console.log('Notas salvas com sucesso!');
                loadSavedNotes(); // Atualiza a lista de notas após salvar
            });
        });
    });

    // Agendar backup automático a cada 30 minutos
    setInterval(autoBackup, 30 * 60 * 1000); // 30 minutos em milissegundos
});
