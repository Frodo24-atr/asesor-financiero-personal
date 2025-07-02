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

    // Income configuration (placeholder for future implementation)
    this.setupIncomeForm();
    
    // Expenses form (placeholder for future implementation)
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
    const includeBonuses = formData.get('include-bonuses') === 'on';
    
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
      'yearly': 'mensual' as const, // Convert yearly to monthly equivalent
      'one-time': 'mensual' as const // Treat one-time as monthly for calculation
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
    
    // Close modal handlers
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

  public closeModal(): void {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  public editExpense(id: string): void {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return;
    
    // For now, just show the expense details in a modal
    // In a full implementation, this would open an edit form
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
    this.updateExpensesList();
    this.updateCategoryFilter();
    this.closeModal();
    this.showNotification('Gasto eliminado exitosamente', 'success');
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.financialAdvisor = new FinancialAdvisor();
});
