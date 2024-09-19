import { encrypt, decrypt } from '../src/js/crypto.js';

const originalText = 'Texto de teste';

test('deve criptografar o texto corretamente', async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  const encrypted = await encrypt(originalText, key);
  expect(encrypted).toHaveProperty('iv');
  expect(encrypted).toHaveProperty('content');
  expect(typeof encrypted.iv).toBe('string');
  expect(typeof encrypted.content).toBe('string');
});

test('deve descriptografar o texto corretamente', async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  const encrypted = await encrypt(originalText, key);
  const decryptedText = await decrypt(encrypted, key);
  expect(decryptedText).toBe(originalText);
});

test('deve retornar erro para descriptografia com chave incorreta', async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  const encrypted = await encrypt(originalText, key);
  const fakeKey = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  try {
    await decrypt(encrypted, fakeKey);
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/Erro ao descriptografar/);
  }
});
