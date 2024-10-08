// Funções de Criptografia e Descriptografia
const encryptionKey = 'your-secret-key'; // Utilize uma chave segura e gerada de forma segura

function encryptText(text) {
    return CryptoJS.AES.encrypt(text, encryptionKey).toString();
}

function decryptText(encryptedText) {
    const bytes = CryptoJS.AES.decrypt(encryptedText, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function createNote(title, content, encrypted = false) {
    chrome.storage.local.get('savedNotes', (result) => {
        let notes = result.savedNotes || [];
        const noteContent = encrypted ? encryptText(content) : content;
        notes.push({ title: title, content: noteContent, encrypted: encrypted });
        chrome.storage.local.set({ 'savedNotes': notes }, () => {
            console.log('Nota criada e armazenada com sucesso!');
        });
    });
}

function openNote(index) {
    chrome.storage.local.get('savedNotes', (result) => {
        let notes = result.savedNotes || [];
        if (notes[index]) {
            const note = notes[index];
            const content = note.encrypted ? decryptText(note.content) : note.content;
            document.getElementById('note').innerHTML = content;
            console.log(`Nota '${note.title}' carregada.`);
        } else {
            alert('Nenhuma nota encontrada com esse índice');
        }
    });
}

function editNote(index, newContent) {
    chrome.storage.local.get('savedNotes', (result) => {
        let notes = result.savedNotes || [];
        if (notes[index]) {
            notes[index].content = encryptText(newContent); // Criptografa o novo conteúdo
            chrome.storage.local.set({ 'savedNotes': notes }, () => {
                console.log('Nota editada com sucesso!');
            });
        } else {
            alert('Nota não encontrada');
        }
    });
}

function deleteNote(index) {
    chrome.storage.local.get('savedNotes', (result) => {
        let notes = result.savedNotes || [];
        if (notes[index]) {
            notes.splice(index, 1); // Remove a nota
            chrome.storage.local.set({ 'savedNotes': notes }, () => {
                console.log('Nota excluída com sucesso!');
            });
        } else {
            alert('Nota não encontrada');
        }
    });
}

// Funções de Autenticação
function authenticateUser(callback) {
    const password = prompt('Digite sua senha para acessar a extensão:');
    chrome.storage.local.get('authPassword', (result) => {
        if (result.authPassword === password) {
            callback();
        } else {
            alert('Senha incorreta');
        }
    });
}

function setAuthentication() {
    const password = prompt('Defina uma nova senha para acessar a extensão:');
    chrome.storage.local.set({ 'authPassword': password }, () => {
        alert('Senha definida com sucesso!');
    });
}

function checkAuthentication() {
    chrome.storage.local.get('authPassword', (result) => {
        if (!result.authPassword) {
            setAuthentication();
        } else {
            authenticateUser(() => {
                // Permite acesso à funcionalidade da extensão
            });
        }
    });
}

// Função para aplicar estilos
function applyStyle(style, value = null) {
    if (value) {
        document.execCommand(style, false, value);
    } else {
        document.execCommand(style, false, null);
    }
}

// Função para encontrar texto
function findText() {
    let searchTerm = prompt('Digite o texto a ser encontrado:');
    let bodyText = document.getElementById('note').innerText;
    let searchIndex = bodyText.indexOf(searchTerm);
    if (searchIndex !== -1) {
        let range = document.createRange();
        let selection = window.getSelection();
        range.setStart(document.getElementById('note').firstChild, searchIndex);
        range.setEnd(document.getElementById('note').firstChild, searchIndex + searchTerm.length);
        selection.removeAllRanges();
        selection.addRange(range);
        alert('Texto encontrado e selecionado.');
    } else {
        alert('Texto não encontrado.');
    }
}

// Função para substituir texto
function replaceText() {
    let searchTerm = prompt('Digite o texto a ser substituído:');
    let replaceTerm = prompt('Digite o texto de substituição:');
    let content = document.getElementById('note').innerHTML;
    let newContent = content.replace(new RegExp(searchTerm, 'g'), replaceTerm);
    document.getElementById('note').innerHTML = newContent;
    alert('Texto substituído.');
}

// Função para carregar a última nota
function loadLastNote() {
    chrome.storage.local.get('savedNotes', (result) => {
        let notes = result.savedNotes || [];
        if (notes.length > 0) {
            let lastNote = notes[notes.length - 1];
            const content = lastNote.encrypted ? decryptText(lastNote.content) : lastNote.content;
            document.getElementById('note').innerHTML = content;
            console.log(`Última nota carregada: '${lastNote.title}'`);
        }
    });
}

// Função para abrir arquivo
function openFile() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';

    inputElement.onchange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            document.getElementById('note').innerHTML = reader.result;
        };
        reader.readAsText(file);
    };

    inputElement.click();
}

// Função para salvar arquivo
function saveFile() {
    const content = document.getElementById('note').innerHTML;
    const blob = new Blob([content], { type: 'text/plain' });
    const anchor = document.createElement('a');

    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'minha_nota.txt';
    anchor.click();
}

// Inicializa o script após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function () {
    checkAuthentication(); // Verifica e solicita autenticação ao iniciar

    // Adiciona ouvintes de eventos para o menu "Arquivo"
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(1)').addEventListener('click', () => chrome.tabs.create({ url: 'about:blank' }));
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(2)').addEventListener('click', () => chrome.windows.create({ url: 'about:blank' }));
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(3)').addEventListener('click', openFile); // Atualizado
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(4)').addEventListener('click', saveFile); // Atualizado
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(5)').addEventListener('click', () => alert('Função de salvar como não implementada'));
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(6)').addEventListener('click', () => alert('Função de salvar todos os arquivos não implementada'));
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(7)').addEventListener('click', () => chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.tabs.remove(tabs[0].id)));
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(8)').addEventListener('click', () => chrome.windows.getCurrent(window => chrome.windows.remove(window.id)));
    document.querySelector('.menu-item:nth-child(1) .submenu-item:nth-child(9)').addEventListener('click', () => alert('Função de sair não implementada'));

    // Adiciona ouvintes de eventos para o menu "Editar"
    document.querySelector('.menu-item:nth-child(2) .submenu-item:nth-child(1)').addEventListener('click', () => document.execCommand('undo')); // Pode ser substituído por uma lógica personalizada
    document.querySelector('.menu-item:nth-child(2) .submenu-item:nth-child(2)').addEventListener('click', () => document.execCommand('cut')); // Pode ser substituído por uma lógica personalizada
    document.querySelector('.menu-item:nth-child(2) .submenu-item:nth-child(3)').addEventListener('click', () => document.execCommand('copy')); // Pode ser substituído por uma lógica personalizada
    document.querySelector('.menu-item:nth-child(2) .submenu-item:nth-child(4)').addEventListener('click', () => document.execCommand('paste')); // Pode ser substituído por uma lógica personalizada
    document.querySelector('.menu-item:nth-child(2) .submenu-item:nth-child(5)').addEventListener('click', () => document.execCommand('delete')); // Pode ser substituído por uma lógica personalizada
    document.querySelector('.menu-item:nth-child(2) .submenu-item:nth-child(6)').addEventListener('click', findText);
    document.querySelector('.menu-item:nth-child(2) .submenu-item:nth-child(7)').addEventListener('click', replaceText);
    document.querySelector('.menu-item:nth-child(2) .submenu-item:nth-child(8)').addEventListener('click', () => {
        let selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let range = selection.getRangeAt(0);
            range.selectNodeContents(document.getElementById('note'));
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    // Configura o editor de texto
    document.getElementById('bold-btn').addEventListener('click', () => applyStyle('bold'));
    document.getElementById('italic-btn').addEventListener('click', () => applyStyle('italic'));
    document.getElementById('font-color-btn').addEventListener('click', () => applyStyle('foreColor', prompt('Digite a cor da fonte (em hexadecimal):')));
    document.getElementById('bg-color-btn').addEventListener('click', () => applyStyle('backColor', prompt('Digite a cor de fundo (em hexadecimal):')));

    // Carrega a última nota se disponível
    loadLastNote();
});

// Placeholder para simular a autenticação Firebase
function firebaseLoginSimulation() {
    console.log("Simulação de login com Firebase");
    let authenticated = confirm("Simular autenticação com Firebase?");
    if (authenticated) {
        console.log("Usuário autenticado");
        return true;
    } else {
        console.log("Autenticação falhou");
        return false;
    }
}

// Chamada de simulação na inicialização da aplicação
if (firebaseLoginSimulation()) {
    // Usuário autenticado, prosseguir com a aplicação
    console.log("Autenticação bem-sucedida. Carregando a aplicação...");
} else {
    // Encerrar a aplicação ou exibir mensagem de erro
    alert("Erro de autenticação. Encerrando aplicação.");
}
