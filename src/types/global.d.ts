// Global type declarations for external libraries
declare global {
  interface Window {
    financialAdvisor: FinancialAdvisor;
    jsPDF: {
      new (): any;
    };
    emailjs: any;
  }
}

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
