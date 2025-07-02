// Types and Interfaces
interface IncomeConfig {
  type: 'quincenal' | 'mensual';
  amount: number;
  frequency: number;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'fijo' | 'variable';
  frequency: 'diario' | 'semanal' | 'quincenal' | 'mensual';
}

interface FinancialHealth {
  score: number;
  status: 'excelente' | 'bueno' | 'regular' | 'malo';
  color: string;
  icon: string;
  recommendations: string[];
}

interface FinancialData {
  income: IncomeConfig | null;
  expenses: Expense[];
  monthlyIncome: number;
  monthlyExpenses: number;
  disposableIncome: number;
  debtRatio: number;
}

class FinancialAdvisor {
  private data: FinancialData;

  constructor() {
    this.data = {
      income: null,
      expenses: [],
      monthlyIncome: 0,
      monthlyExpenses: 0,
      disposableIncome: 0,
      debtRatio: 0
    };
    
    this.init();
  }

  private init(): void {
    this.loadFromStorage();
    this.setupEventListeners();
    this.updateUI();
    this.initializeEmailJS();
  }

  private setupEventListeners(): void {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab;
        if (tabName) {
          this.switchTab(tabName);
        }
      });
    });

    // Theme toggle
    const themeToggle = document.getElementById('toggle-theme');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Export report
    const exportBtn = document.getElementById('export-report');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.generatePDF());
    }

    // Income configuration
    this.setupIncomeForm();
    
    // Expenses form
    this.setupExpensesForm();
  }

  private switchTab(tabName: string): void {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });

    // Show target tab
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // Update nav buttons
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  private toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update theme icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  private setupIncomeForm(): void {
    const incomeForm = document.getElementById('income-form') as HTMLFormElement;
    if (!incomeForm) return;

    // Handle frequency change
    const frequencyInputs = document.querySelectorAll('input[name="income-frequency"]');
    const frequencyLabel = document.getElementById('income-frequency-label');
    
    frequencyInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (frequencyLabel) {
          frequencyLabel.textContent = target.value === 'monthly' ? '(Mensual)' : '(Quincenal)';
        }
      });
    });

    // Handle form submission
    incomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleIncomeSubmission();
    });

    // Preview button
    const previewBtn = document.getElementById('preview-income');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => this.previewIncome());
    }
  }

  private setupExpensesForm(): void {
    const expenseForm = document.getElementById('expense-form') as HTMLFormElement;
    if (!expenseForm) return;

    // Handle form submission
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleExpenseSubmission();
    });

    // Setup category filter options
    this.updateCategoryFilter();
    
    // Handle filter changes
    const categoryFilter = document.getElementById('category-filter');
    const priorityFilter = document.getElementById('priority-filter');
    
    if (categoryFilter && priorityFilter) {
      categoryFilter.addEventListener('change', () => this.filterExpenses());
      priorityFilter.addEventListener('change', () => this.filterExpenses());
    }
  }

  private handleIncomeSubmission(): void {
    const form = document.getElementById('income-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const frequency = formData.get('income-frequency') as string;
    const amount = parseFloat(formData.get('income-amount') as string || '0');
    const additionalIncome = parseFloat(formData.get('additional-income') as string || '0');
    
    if (amount <= 0) {
      this.showNotification('Por favor ingresa un monto válido', 'error');
      return;
    }

    const incomeConfig: IncomeConfig = {
      type: frequency === 'monthly' ? 'mensual' : 'quincenal',
      amount: amount + additionalIncome,
      frequency: 1
    };

    this.addIncome(incomeConfig);
    this.showIncomePreview();
    this.showNotification('Configuración de ingresos guardada exitosamente', 'success');
  }

  private handleExpenseSubmission(): void {
    const form = document.getElementById('expense-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const name = formData.get('expense-name') as string;
    const category = formData.get('expense-category') as string;
    const amount = parseFloat(formData.get('expense-amount') as string || '0');
    const frequency = formData.get('expense-frequency') as string;
    const priority = formData.get('expense-priority') as string;
    
    if (!name || !category || amount <= 0) {
      this.showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const expense = {
      name,
      category,
      amount,
      frequency: this.mapFrequencyToInternal(frequency),
      type: priority === 'essential' ? 'fijo' as const : 'variable' as const
    };

    this.addExpense(expense);
    this.updateExpensesList();
    this.updateCategoryFilter();
    form.reset();
    this.showNotification('Gasto agregado exitosamente', 'success');
  }

  private mapFrequencyToInternal(frequency: string): 'diario' | 'semanal' | 'quincenal' | 'mensual' {
    const mapping = {
      'daily': 'diario' as const,
      'weekly': 'semanal' as const,
      'biweekly': 'quincenal' as const,
      'monthly': 'mensual' as const,
      'yearly': 'mensual' as const,
      'one-time': 'mensual' as const
    };
    return mapping[frequency as keyof typeof mapping] || 'mensual';
  }

  private previewIncome(): void {
    const form = document.getElementById('income-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const frequency = formData.get('income-frequency') as string;
    const amount = parseFloat(formData.get('income-amount') as string || '0');
    const additionalIncome = parseFloat(formData.get('additional-income') as string || '0');
    
    if (amount <= 0) {
      this.showNotification('Por favor ingresa un monto para la vista previa', 'error');
      return;
    }

    const totalIncome = amount + additionalIncome;
    const monthlyIncome = frequency === 'monthly' ? totalIncome : totalIncome * 2;
    
    const message = `
      <strong>Vista Previa de Ingresos:</strong><br>
      Ingreso ${frequency === 'monthly' ? 'Mensual' : 'Quincenal'}: ${this.formatCurrency(amount)}<br>
      ${additionalIncome > 0 ? `Ingresos Adicionales: ${this.formatCurrency(additionalIncome)}<br>` : ''}
      <strong>Total Mensual: ${this.formatCurrency(monthlyIncome)}</strong>
    `;
    
    this.showModal('Vista Previa de Ingresos', message);
  }

  private showIncomePreview(): void {
    const summaryDiv = document.getElementById('income-summary');
    const breakdownDiv = document.getElementById('income-breakdown');
    
    if (!summaryDiv || !breakdownDiv || !this.data.income) return;
    
    const monthlyIncome = this.calculateMonthlyIncome();
    
    breakdownDiv.innerHTML = `
      <div class="income-item">
        <span class="income-label">Tipo de Ingreso:</span>
        <span class="income-value">${this.data.income.type.charAt(0).toUpperCase() + this.data.income.type.slice(1)}</span>
      </div>
      <div class="income-item">
        <span class="income-label">Monto por Período:</span>
        <span class="income-value">${this.formatCurrency(this.data.income.amount)}</span>
      </div>
      <div class="income-item total">
        <span class="income-label"><strong>Total Mensual:</strong></span>
        <span class="income-value"><strong>${this.formatCurrency(monthlyIncome)}</strong></span>
      </div>
    `;
    
    summaryDiv.style.display = 'block';
  }

  private calculateMonthlyIncome(): number {
    if (!this.data.income) return 0;

    const { type, amount, frequency } = this.data.income;
    
    if (type === 'mensual') {
      return amount * frequency;
    } else if (type === 'quincenal') {
      return amount * frequency * 2;
    }
    
    return 0;
  }

  private calculateMonthlyExpenses(): number {
    return this.data.expenses.reduce((total, expense) => {
      const multiplier = this.getFrequencyMultiplier(expense.frequency);
      return total + (expense.amount * multiplier);
    }, 0);
  }

  private getFrequencyMultiplier(frequency: string): number {
    const multipliers = {
      'diario': 30,
      'semanal': 4.33,
      'quincenal': 2,
      'mensual': 1
    };
    return multipliers[frequency as keyof typeof multipliers] || 1;
  }

  private calculateFinancialHealth(): FinancialHealth {
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const disposableIncome = monthlyIncome - monthlyExpenses;
    const debtRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

    let score = 100;
    let status: FinancialHealth['status'] = 'excelente';
    let color = '#10b981';
    let icon = '🟢';
    const recommendations: string[] = [];

    if (debtRatio > 80) {
      score = Math.max(0, 100 - (debtRatio - 80) * 5);
      status = 'malo';
      color = '#ef4444';
      icon = '🔴';
      recommendations.push('Tu ratio de endeudamiento es muy alto. Considera reducir gastos.');
      recommendations.push('Busca fuentes adicionales de ingresos.');
    } else if (debtRatio > 60) {
      score = Math.max(20, 100 - (debtRatio - 60) * 2);
      status = 'regular';
      color = '#f59e0b';
      icon = '🟡';
      recommendations.push('Tu ratio de endeudamiento es moderado. Revisa gastos no esenciales.');
    } else if (debtRatio > 40) {
      score = Math.max(60, 100 - (debtRatio - 40) * 1);
      status = 'bueno';
      color = '#06b6d4';
      icon = '🔵';
      recommendations.push('Estás en una buena posición financiera. Considera ahorrar más.');
    } else {
      recommendations.push('¡Excelente gestión financiera! Considera invertir tu excedente.');
    }

    if (disposableIncome < 0) {
      recommendations.push('Tienes un déficit mensual. Revisa urgentemente tus gastos.');
    } else if (disposableIncome < monthlyIncome * 0.1) {
      recommendations.push('Tu margen de ahorro es muy bajo. Intenta aumentar tus ingresos o reducir gastos.');
    }

    return { score, status, color, icon, recommendations };
  }

  private updateUI(): void {
    this.updateDashboard();
    this.updateHealthIndicator();
    this.updateExpensesList();
  }

  private updateDashboard(): void {
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const disposableIncome = monthlyIncome - monthlyExpenses;

    // Update income card
    const incomeElement = document.getElementById('total-income');
    const incomeSubtitle = document.getElementById('income-subtitle');
    if (incomeElement && incomeSubtitle) {
      incomeElement.textContent = this.formatCurrency(monthlyIncome);
      incomeSubtitle.textContent = this.data.income 
        ? `${this.data.income.type} - ${this.data.income.frequency}x`
        : 'No configurado';
    }

    // Update expenses card
    const expensesElement = document.getElementById('total-expenses');
    const expensesSubtitle = document.getElementById('expenses-subtitle');
    if (expensesElement && expensesSubtitle) {
      expensesElement.textContent = this.formatCurrency(monthlyExpenses);
      expensesSubtitle.textContent = `${this.data.expenses.length} gastos registrados`;
    }

    // Update balance card
    const balanceElement = document.getElementById('disposable-income');
    const balanceSubtitle = document.getElementById('balance-subtitle');
    if (balanceElement && balanceSubtitle) {
      balanceElement.textContent = this.formatCurrency(disposableIncome);
      balanceSubtitle.textContent = disposableIncome >= 0 ? 'Superávit' : 'Déficit';
      
      // Update color based on balance
      const balanceCard = balanceElement.closest('.card') as HTMLElement;
      if (balanceCard) {
        balanceCard.style.borderLeftColor = disposableIncome >= 0 ? '#10b981' : '#ef4444';
      }
    }

    // Update debt ratio card
    const ratioElement = document.getElementById('debt-ratio');
    const ratioSubtitle = document.getElementById('ratio-subtitle');
    if (ratioElement && ratioSubtitle) {
      const debtRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
      ratioElement.textContent = `${debtRatio.toFixed(1)}%`;
      
      let ratioStatus = 'Excelente';
      if (debtRatio > 80) ratioStatus = 'Crítico';
      else if (debtRatio > 60) ratioStatus = 'Alto';
      else if (debtRatio > 40) ratioStatus = 'Moderado';
      
      ratioSubtitle.textContent = ratioStatus;
    }
  }

  private updateHealthIndicator(): void {
    const health = this.calculateFinancialHealth();
    
    const healthIcon = document.querySelector('.health-icon');
    const healthText = document.querySelector('.health-text');
    const healthScore = document.getElementById('health-score');
    
    if (healthIcon) healthIcon.textContent = health.icon;
    if (healthText) healthText.textContent = `Estado: ${health.status.charAt(0).toUpperCase() + health.status.slice(1)}`;
    if (healthScore) healthScore.textContent = `${health.score}/100`;
    
    // Update indicator background color
    const indicator = document.getElementById('health-indicator');
    if (indicator) {
      indicator.style.borderLeft = `4px solid ${health.color}`;
    }
  }

  private updateExpensesList(): void {
    const container = document.getElementById('expenses-container');
    if (!container) return;
    
    if (this.data.expenses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>No hay gastos registrados</h3>
          <p>Comienza agregando tus gastos para obtener un análisis detallado</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.data.expenses.map(expense => this.renderExpenseItem(expense)).join('');
  }

  private renderExpenseItem(expense: Expense): string {
    const categoryIcons = {
      'housing': '🏠',
      'food': '🍕',
      'transport': '🚗',
      'health': '🏥',
      'education': '📚',
      'entertainment': '🎬',
      'shopping': '🛍️',
      'services': '⚡',
      'savings': '💰',
      'debt': '💳',
      'other': '📦'
    };
    
    const priorityColors = {
      'fijo': '#ef4444',
      'variable': '#10b981'
    };
    
    const monthlyAmount = expense.amount * this.getFrequencyMultiplier(expense.frequency);
    
    return `
      <div class="expense-item" data-category="${expense.category}" data-priority="${expense.type}">
        <div class="expense-main">
          <div class="expense-header">
            <span class="expense-icon">${categoryIcons[expense.category as keyof typeof categoryIcons] || '📦'}</span>
            <div class="expense-info">
              <h4 class="expense-name">${expense.name}</h4>
              <span class="expense-category">${this.getCategoryName(expense.category)}</span>
            </div>
            <div class="expense-priority" style="color: ${priorityColors[expense.type]}">
              ${expense.type === 'fijo' ? '🔴 Esencial' : '🟢 Variable'}
            </div>
          </div>
          <div class="expense-details">
            <div class="expense-amount">
              <span class="amount-value">${this.formatCurrency(expense.amount)}</span>
              <span class="amount-frequency">${this.getFrequencyLabel(expense.frequency)}</span>
            </div>
            <div class="expense-monthly">
              <span class="monthly-label">Mensual:</span>
              <span class="monthly-value">${this.formatCurrency(monthlyAmount)}</span>
            </div>
          </div>
        </div>
        <div class="expense-actions">
          <button class="btn-icon edit" onclick="window.financialAdvisor.editExpense('${expense.id}')" title="Editar">
            ✏️
          </button>
          <button class="btn-icon delete" onclick="window.financialAdvisor.confirmDeleteExpense('${expense.id}')" title="Eliminar">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  private getCategoryName(category: string): string {
    const names = {
      'housing': 'Vivienda',
      'food': 'Alimentación',
      'transport': 'Transporte',
      'health': 'Salud',
      'education': 'Educación',
      'entertainment': 'Entretenimiento',
      'shopping': 'Compras',
      'services': 'Servicios',
      'savings': 'Ahorros',
      'debt': 'Deudas',
      'other': 'Otros'
    };
    return names[category as keyof typeof names] || 'Otros';
  }

  private getFrequencyLabel(frequency: string): string {
    const labels = {
      'diario': 'Diario',
      'semanal': 'Semanal',
      'quincenal': 'Quincenal',
      'mensual': 'Mensual'
    };
    return labels[frequency as keyof typeof labels] || 'Mensual';
  }

  private updateCategoryFilter(): void {
    const filter = document.getElementById('category-filter') as HTMLSelectElement;
    if (!filter) return;
    
    const categories = [...new Set(this.data.expenses.map(e => e.category))];
    const currentValue = filter.value;
    
    filter.innerHTML = '<option value="">Todas las categorías</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = `${this.getCategoryIcon(category)} ${this.getCategoryName(category)}`;
      filter.appendChild(option);
    });
    
    filter.value = currentValue;
  }

  private getCategoryIcon(category: string): string {
    const icons = {
      'housing': '🏠',
      'food': '🍕',
      'transport': '🚗',
      'health': '🏥',
      'education': '📚',
      'entertainment': '🎬',
      'shopping': '🛍️',
      'services': '⚡',
      'savings': '💰',
      'debt': '💳',
      'other': '📦'
    };
    return icons[category as keyof typeof icons] || '📦';
  }

  private filterExpenses(): void {
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;
    const priorityFilter = document.getElementById('priority-filter') as HTMLSelectElement;
    
    if (!categoryFilter || !priorityFilter) return;
    
    const categoryValue = categoryFilter.value;
    const priorityValue = priorityFilter.value;
    
    const expenseItems = document.querySelectorAll('.expense-item');
    
    expenseItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      const itemPriority = item.getAttribute('data-priority');
      
      const matchesCategory = !categoryValue || itemCategory === categoryValue;
      const matchesPriority = !priorityValue || 
        (priorityValue === 'essential' && itemPriority === 'fijo') ||
        (priorityValue === 'important' && itemPriority === 'variable') ||
        (priorityValue === 'optional' && itemPriority === 'variable');
      
      if (matchesCategory && matchesPriority) {
        (item as HTMLElement).style.display = 'block';
      } else {
        (item as HTMLElement).style.display = 'none';
      }
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('financialAdvisorData', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('financialAdvisorData');
      if (saved) {
        this.data = { ...this.data, ...JSON.parse(saved) };
      }
      
      // Load theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      const themeIcon = document.querySelector('.theme-icon');
      if (themeIcon) {
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  private initializeEmailJS(): void {
    // Initialize EmailJS with your public key
    if (typeof window.emailjs !== 'undefined') {
      window.emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key
    }
  }

  private async generatePDF(): Promise<void> {
    try {
      if (typeof window.jsPDF === 'undefined') {
        throw new Error('jsPDF library not loaded');
      }

      const { jsPDF } = window;
      const doc = new jsPDF();
      
      // Document setup
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;
      
      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte Financiero Personal', margin, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const reportDate = new Date().toLocaleDateString('es-AR');
      doc.text(`Generado el: ${reportDate}`, margin, 35);
      
      currentY = 60;
      
      // Reset text color for content
      doc.setTextColor(0, 0, 0);
      
      // Financial Summary
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen Financiero', margin, currentY);
      currentY += 15;
      
      const monthlyIncome = this.calculateMonthlyIncome();
      const monthlyExpenses = this.calculateMonthlyExpenses();
      const disposableIncome = monthlyIncome - monthlyExpenses;
      const debtRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const summaryData = [
        ['Ingresos Mensuales:', this.formatCurrency(monthlyIncome)],
        ['Gastos Mensuales:', this.formatCurrency(monthlyExpenses)],
        ['Ingreso Disponible:', this.formatCurrency(disposableIncome)],
        ['Ratio de Endeudamiento:', `${debtRatio.toFixed(1)}%`]
      ];
      
      summaryData.forEach(([label, value]) => {
        doc.text(label, margin, currentY);
        doc.text(value, margin + 80, currentY);
        currentY += 8;
      });
      
      currentY += 10;
      
      // Health Assessment
      const health = this.calculateFinancialHealth();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Evaluacion de Salud Financiera', margin, currentY);
      currentY += 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Puntuacion: ${health.score}/100 - ${health.status.toUpperCase()}`, margin, currentY);
      currentY += 15;
      
      // Recommendations
      if (health.recommendations.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Recomendaciones:', margin, currentY);
        currentY += 10;
        
        doc.setFont('helvetica', 'normal');
        health.recommendations.forEach((recommendation, index) => {
          const lines = doc.splitTextToSize(`${index + 1}. ${recommendation}`, pageWidth - 2 * margin);
          lines.forEach((line: string) => {
            doc.text(line, margin, currentY);
            currentY += 6;
          });
          currentY += 2;
        });
      }
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Asesor Financiero Personal - Reporte generado automaticamente', 
               margin, pageHeight - 10);
      
      // Save the PDF
      doc.save(`reporte-financiero-${reportDate.replace(/\//g, '-')}.pdf`);
      
      this.showNotification('Reporte PDF generado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.showNotification('Error al generar el reporte PDF', 'error');
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'};
      color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  private showModal(title: string, content: string, actions?: string): void {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const contentEl = document.getElementById('modal-content');
    const actionsEl = document.getElementById('modal-actions');
    
    if (!overlay || !titleEl || !contentEl || !actionsEl) return;
    
    titleEl.textContent = title;
    contentEl.innerHTML = content;
    actionsEl.innerHTML = actions || '<button class="btn btn-primary" onclick="window.financialAdvisor.closeModal()">Cerrar</button>';
    
    overlay.style.display = 'flex';
    
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal();
    }
    
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closeModal();
      }
    };
  }

  // Public methods
  public addIncome(config: IncomeConfig): void {
    this.data.income = config;
    this.saveToStorage();
    this.updateUI();
  }

  public addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    this.data.expenses.push(newExpense);
    this.saveToStorage();
    this.updateUI();
  }

  public removeExpense(id: string): void {
    this.data.expenses = this.data.expenses.filter(expense => expense.id !== id);
    this.saveToStorage();
    this.updateUI();
  }

  public closeModal(): void {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  public editExpense(id: string): void {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return;
    
    const content = `
      <div class="expense-details-modal">
        <p><strong>Nombre:</strong> ${expense.name}</p>
        <p><strong>Categoría:</strong> ${this.getCategoryName(expense.category)}</p>
        <p><strong>Monto:</strong> ${this.formatCurrency(expense.amount)}</p>
        <p><strong>Frecuencia:</strong> ${this.getFrequencyLabel(expense.frequency)}</p>
        <p><strong>Tipo:</strong> ${expense.type === 'fijo' ? 'Esencial' : 'Variable'}</p>
      </div>
    `;
    
    this.showModal('Detalles del Gasto', content);
  }

  public confirmDeleteExpense(id: string): void {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return;
    
    const content = `
      <p>¿Estás seguro de que deseas eliminar el gasto "<strong>${expense.name}</strong>"?</p>
      <p>Esta acción no se puede deshacer.</p>
    `;
    
    const actions = `
      <button class="btn btn-outline" onclick="window.financialAdvisor.closeModal()">Cancelar</button>
      <button class="btn btn-danger" onclick="window.financialAdvisor.deleteExpense('${id}')">Eliminar</button>
    `;
    
    this.showModal('Confirmar Eliminación', content, actions);
  }

  public deleteExpense(id: string): void {
    this.removeExpense(id);
    this.closeModal();
    this.showNotification('Gasto eliminado exitosamente', 'success');
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.financialAdvisor = new FinancialAdvisor();
});
