"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWallet = void 0;
const ethers_1 = require("ethers");
const crypto = require('crypto');
const bs58 = require('bs58');
const toBase58CheckAddress = (ethAddress) => {
    // 移除0x前缀（如果有）
    let hexAddress = ethAddress.startsWith('0x') ? ethAddress.slice(2) : ethAddress;
    // 添加Tron地址前缀41
    hexAddress = '41' + hexAddress;
    // 将十六进制字符串转换为Buffer
    const addressBytes = Buffer.from(hexAddress, 'hex');
    // 第一次SHA256哈希
    const hash1 = crypto.createHash('sha256').update(addressBytes).digest();
    // 第二次SHA256哈希
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    // 取前4个字节作为校验和
    const checksum = hash2.slice(0, 4);
    // 连接地址和校验和
    const addressWithChecksum = Buffer.concat([addressBytes, checksum]);
    // Base58编码
    const base58Address = bs58.default.encode(addressWithChecksum);
    return base58Address;
};
const generateWallet = (username, mnemonic) => {
    // 将用户名转换为数字
    let numericValue = '';
    for (let i = 0; i < username.length; i++) {
        numericValue += username.charCodeAt(i).toString();
    }
    // 确保数字不超过路径的限制
    const maxIndexValue = 2147483647; // 2^31 - 1
    const pathIndices = [];
    let currentIndex = 0;
    // 将数字分割成多个部分以适应路径
    while (currentIndex < numericValue.length) {
        const part = numericValue.substring(currentIndex, currentIndex + 9); // 每部分最多9位
        const indexValue = parseInt(part, 10) % maxIndexValue;
        pathIndices.push(indexValue);
        currentIndex += 9;
    }
    // 生成确定性钱包路径
    const walletPath = `m/44'/60'/${pathIndices[0] || 0}'/${pathIndices[1] || 0}/${pathIndices[2] || 0}`;
    // 从助记词生成钱包
    const wallet = ethers_1.ethers.Wallet.fromMnemonic(mnemonic, walletPath);
    const tronAddress = toBase58CheckAddress(wallet.address);
    // 返回钱包地址和路径
    return {
        bsc: wallet.address,
        tron: tronAddress,
        path: walletPath
    };
};
exports.generateWallet = generateWallet;
