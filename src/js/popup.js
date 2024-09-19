// Importa os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
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

// Função para exibir mensagem de feedback
function showFeedback(message) {
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.textContent = message;
    feedbackDiv.style.display = 'block';
    setTimeout(() => {
        feedbackDiv.style.display = 'none';
    }, 5000); // A mensagem desaparece após 5 segundos
}

// Função para login
async function login(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuário autenticado com sucesso!');
        showFeedback('Login bem-sucedido!');
        loadNoteFromFirebase(); // Carregar nota após autenticação bem-sucedida
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        showFeedback('Erro ao autenticar!');
    }
}

// Função para logout
async function logout() {
    try {
        await signOut(auth);
        console.log('Usuário desautenticado com sucesso!');
        showFeedback('Logout bem-sucedido!');
        document.getElementById('note').innerHTML = ''; // Limpar nota ao deslogar
    } catch (error) {
        console.error('Erro ao desautenticar:', error);
        showFeedback('Erro ao desautenticar!');
    }
}

// Função para sincronizar nota com Firebase
async function syncNote() {
    const noteContent = document.getElementById('note').innerHTML;

    // Usuário autenticado
    const user = auth.currentUser;
    if (user) {
        await setDoc(doc(db, 'users', user.uid), { note: noteContent });
        console.log('Nota sincronizada com sucesso para o usuário:', user.uid);
        showFeedback('Nota sincronizada com sucesso!');
    } else {
        console.error('Usuário não autenticado');
        showFeedback('Usuário não autenticado!');
    }
}

// Função para carregar nota do Firebase
async function loadNoteFromFirebase() {
    // Usuário autenticado
    const user = auth.currentUser;
    if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            document.getElementById('note').innerHTML = docSnap.data().note;
        } else {
            console.log('Nenhuma nota encontrada para o usuário:', user.uid);
        }
    } else {
        console.error('Usuário não autenticado');
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

// Função para aplicar destaque ao texto selecionado
function applyHighlight() {
    let selection = window.getSelection();
    if (selection.rangeCount > 0) {
        let range = selection.getRangeAt(0);
        let selectedText = range.extractContents();

        let span = document.createElement('span');
        span.style.backgroundColor = 'yellow'; // Cor de destaque
        span.appendChild(selectedText);

        range.insertNode(span);

        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Função para alterar a cor do texto selecionado
function applyColor(color) {
    let selection = window.getSelection();
    if (selection.rangeCount > 0) {
        let range = selection.getRangeAt(0);
        let selectedText = range.extractContents();

        let span = document.createElement('span');
        span.style.color = color;
        span.appendChild(selectedText);

        range.insertNode(span);

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
                showFeedback('Nota excluída com sucesso!');
                loadSavedNotes(); // Atualiza a lista de notas após exclusão
            });
        }
    });
}

// Função para realizar backup automático
async function autoBackup() {
    const noteContent = document.getElementById('note').innerHTML;

    // Usuário autenticado
    const user = auth.currentUser;
    if (user) {
        // Obtém a data e hora atual para identificar a versão do backup
        const timestamp = new Date().toISOString();
        const backupDocRef = doc(db, 'users', user.uid, 'backups', timestamp);

        await setDoc(backupDocRef, { note: noteContent });
        console.log('Backup automático realizado com sucesso!');
    } else {
        console.error('Usuário não autenticado');
    }
}

// Inicializa o script após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function () {
    const noteDiv = document.getElementById('note');
    const boldButton = document.getElementById('bold-btn');
    const italicButton = document.getElementById('italic-btn');
    const underlineButton = document.getElementById('underline-btn');
    const strikeButton = document.getElementById('strike-btn');
    const highlightButton = document.getElementById('highlight-btn');
    const colorPicker = document.getElementById('color-picker');
    const saveButton = document.getElementById('save-btn'); // Novo botão "Salvar Nota"
    const loginButton = document.getElementById('login-btn');
    const logoutButton = document.getElementById('logout-btn');

    // Configura ouvintes de eventos para login e logout
    loginButton.addEventListener('click', () => login('email@example.com', 'password'));
    logoutButton.addEventListener('click', logout);

    // Carrega a nota ao iniciar
    loadSavedNotes(); // Carrega as notas salvas ao iniciar

    // Configura ouvintes de eventos para salvar nota
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(4)').addEventListener('click', syncNote);
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(6)').addEventListener('click', syncNote); // Salvar tudo

       // Botão de negrito
       boldButton.addEventListener('click', () => applyStyle('strong'));

       // Botão de itálico
       italicButton.addEventListener('click', () => applyStyle('em'));
   
       // Botão de sublinhado
       underlineButton.addEventListener('click', () => applyStyle('u'));
   
       // Botão de texto riscado
       strikeButton.addEventListener('click', () => applyStyle('s'));
   
       // Botão de destaque
       highlightButton.addEventListener('click', applyHighlight);
   
       // Seletor de cor
       colorPicker.addEventListener('change', (event) => applyColor(event.target.value));
   
       // Configura o botão "Salvar Nota"
       saveButton.addEventListener('click', syncNote);
   
       // Configura ouvintes de eventos para login e logout
       loginButton.addEventListener('click', () => login('email@example.com', 'password'));
       logoutButton.addEventListener('click', logout);
   
       // Carrega a nota do Firebase ao iniciar
       loadNoteFromFirebase();
   
       // Carrega as notas salvas ao iniciar
       loadSavedNotes();
   
       // Configura backup automático a cada 30 minutos
       setInterval(autoBackup, 1800000); // 30 minutos em milissegundos
   });
   
