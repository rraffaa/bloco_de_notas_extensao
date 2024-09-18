// Função para gerar uma chave de criptografia
async function generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // Função para converter uma string para um ArrayBuffer
  function stringToArrayBuffer(str) {
    return new TextEncoder().encode(str);
  }
  
  // Função para converter um ArrayBuffer para uma string
  function arrayBufferToString(buffer) {
    return new TextDecoder().decode(buffer);
  }
  
  // Função para criptografar o texto
  export async function encrypt(text, key) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Vetor de inicialização aleatório
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(text)
    );
    
    return {
      iv: arrayBufferToString(iv),
      content: arrayBufferToString(encryptedContent)
    };
  }
  
  // Função para descriptografar o texto
  export async function decrypt(encrypted, key) {
    const decoder = new TextDecoder();
    const iv = stringToArrayBuffer(encrypted.iv);
    const content = stringToArrayBuffer(encrypted.content);
    
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      content
    );
    
    return decoder.decode(decryptedContent);
  }
  