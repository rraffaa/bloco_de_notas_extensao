import { encrypt, decrypt } from '../src/js/crypto.js';

// Dados de teste
const originalText = 'Texto de teste';
const key = await crypto.subtle.generateKey(
  {
    name: 'AES-GCM',
    length: 256,
  },
  true,
  ['encrypt', 'decrypt']
);

test('deve criptografar o texto corretamente', async () => {
  const encrypted = await encrypt(originalText, key);
  
  expect(encrypted).toHaveProperty('iv');
  expect(encrypted).toHaveProperty('content');
  expect(typeof encrypted.iv).toBe('string');
  expect(typeof encrypted.content).toBe('string');
});

test('deve descriptografar o texto corretamente', async () => {
  const encrypted = await encrypt(originalText, key);
  const decryptedText = await decrypt(encrypted, key);
  
  expect(decryptedText).toBe(originalText);
});

test('deve retornar erro para descriptografia com chave incorreta', async () => {
  const encrypted = await encrypt(originalText, key);
  const fakeKey = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  const decryptedText = await decrypt(encrypted, fakeKey);
  
  expect(decryptedText).not.toBe(originalText);
});

test('deve lançar erro ao tentar criptografar com chave inválida', async () => {
  const invalidKey = null;
  await expect(encrypt(originalText, invalidKey)).rejects.toThrow();
});
