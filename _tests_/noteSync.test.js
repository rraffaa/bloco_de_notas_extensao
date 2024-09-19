import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Mock do Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    currentUser: null, // Simulação padrão
  }),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn().mockImplementation(() => Promise.resolve({
    exists: () => true,
    data: () => ({ note: 'Conteúdo da nota de teste' }),
  })),
}));

// Inicializa o Firebase apenas para garantir que o código de configuração está correto
const firebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'fake-auth-domain',
  projectId: 'fake-project-id',
  storageBucket: 'fake-storage-bucket',
  messagingSenderId: 'fake-sender-id',
  appId: 'fake-app-id',
  measurementId: 'fake-measurement-id',
};

initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

// Função de sincronização da nota
async function syncNote() {
  const noteContent = document.getElementById('note').innerHTML;
  const user = auth.currentUser;

  if (user) {
    await setDoc(doc(db, 'users', user.uid), { note: noteContent });
    console.log('Nota sincronizada com sucesso!');
  } else {
    console.log('Usuário não autenticado!');
  }
}

// Função para carregar a nota do Firebase
async function loadNoteFromFirebase() {
  const user = auth.currentUser;

  if (user) {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      document.getElementById('note').innerHTML = docSnap.data().note;
    }
  }
}

// Teste para sincronização e carregamento de nota
test('deve sincronizar e carregar a nota corretamente', async () => {
  document.body.innerHTML = `<div id="note"></div>`;
  const noteContent = 'Conteúdo da nota de teste';
  const user = { uid: 'User0' };
  auth.currentUser = user; // Simula o usuário autenticado

  // Espia o console.log
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  // Simula a sincronização
  await syncNote();
  expect(setDoc).toHaveBeenCalledWith(doc(db, 'users', user.uid), { note: noteContent });

  // Simula o carregamento da nota
  await loadNoteFromFirebase();
  const loadedContent = document.getElementById('note').innerHTML;

  expect(loadedContent).toBe(noteContent);

  // Restaura o spy
  logSpy.mockRestore();
});

test('deve retornar erro quando usuário não está autenticado', async () => {
  document.body.innerHTML = `<div id="note"></div>`;
  auth.currentUser = null; // Simula usuário não autenticado

  // Espia o console.log
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  await syncNote();
  expect(console.log).toHaveBeenCalledWith('Usuário não autenticado!');

  // Restaura o spy
  logSpy.mockRestore();
});

test('deve lidar com documento não encontrado no Firestore', async () => {
  document.body.innerHTML = `<div id="note"></div>`;

  // Simula Firestore não encontrando o documento
  getDoc.mockImplementation(() => Promise.resolve({
    exists: () => false
  }));

  await loadNoteFromFirebase();
  const loadedContent = document.getElementById('note').innerHTML;
  expect(loadedContent).toBe(''); // Verifica se o conteúdo permanece vazio
});
