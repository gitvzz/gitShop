import { ethers } from 'ethers';

export const generateWallet = (username: string, mnemonic: string) => {
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
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, walletPath);

    // 返回钱包地址和路径
    return {
        address: wallet.address,
        path: walletPath
    };
}
