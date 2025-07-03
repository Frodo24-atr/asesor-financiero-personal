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

export {};
