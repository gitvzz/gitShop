import forge from 'node-forge';

export function md5(str:string){
    return forge.md.md5.create().update(str).digest().toHex()
}

export function encrypt(data:object,pub_key:string){
    // 将数据转为 JSON 字符串
  const jsonData = JSON.stringify(data);
  
  // 生成随机 AES 密钥
  const aesKey = forge.random.getBytesSync(16); // 128位密钥
  
  // 使用 AES 加密数据
  const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
  const iv = forge.random.getBytesSync(16);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(jsonData, 'utf8'));
  cipher.finish();
  const encryptedData = cipher.output.getBytes();
  
  // 使用 RSA 加密 AES 密钥
  const publicKey = forge.pki.publicKeyFromPem(pub_key);
  const encryptedKey = publicKey.encrypt(aesKey);
  
  // 编码为 Base64
  const encryptedKeyBase64 = forge.util.encode64(encryptedKey);
  const encryptedDataBase64 = forge.util.encode64(iv + encryptedData);
  
  // 返回格式：encryptedKey.encryptedData
  return encryptedKeyBase64 + '.' + encryptedDataBase64;
}

