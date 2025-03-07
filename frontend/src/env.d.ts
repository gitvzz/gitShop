/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_USERNAME: string;
  readonly VITE_GITHUB_REPOSITORY: string;
  readonly VITE_GITHUB_BRANCH: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 