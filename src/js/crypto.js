import crypto from 'crypto';

export async function encrypt(text, key, iv) {
  try {
    // Certifique-se de que key e iv são objetos Buffer ou Uint8Array
    if (!(key instanceof Buffer) || !(iv instanceof Buffer)) {
      throw new TypeError('Key and IV must be Buffer instances');
    }

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      content: encrypted,
      tag: tag.toString('hex')
    };
  } catch (error) {
    throw new Error(`Erro ao criptografar: ${error.message}`);
  }
}

export async function decrypt(encrypted, key, iv) {
  try {
    // Certifique-se de que key e iv são objetos Buffer ou Uint8Array
    if (!(key instanceof Buffer) || !(iv instanceof Buffer)) {
      throw new TypeError('Key and IV must be Buffer instances');
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
    let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Erro ao descriptografar: ${error.message}`);
  }
}
