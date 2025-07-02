// Global type declarations for external libraries
declare global {
  interface Window {
    financialAdvisor: FinancialAdvisor;
    jsPDF: any;
    emailjs: any;
  }
  
  const jsPDF: any;
  const emailjs: any;
}

export {};
