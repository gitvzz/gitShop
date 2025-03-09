// 应用配置文件

interface Config {
  // GitHub 相关配置
  github: {
    username: string;
    repository: string;
    branch: string;
  };
  // 其他全局配置
  app: {
    name: string;
    version: string;
    publicKey: string;
  };
}

// 默认配置
const config: Config = {
  github: {
    username: import.meta.env.VITE_GITHUB_USERNAME || 'gitvzz',
    repository: import.meta.env.VITE_GITHUB_REPOSITORY || 'gitShop',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  },
  app: {
    name: 'GitShop',
    version: '1.0.0',
    publicKey: import.meta.env.VITE_PUBLIC_KEY || ''
  }
};

export default config; 