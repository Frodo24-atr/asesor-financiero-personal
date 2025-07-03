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

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'ahorro' | 'deuda' | 'inversion' | 'compra' | 'emergencia';
  priority: 'alta' | 'media' | 'baja';
  description?: string;
  createdAt: string;
}

interface AnalysisMetrics {
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  expenseGrowthTrend: number;
  topExpenseCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyProjection: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
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
  goals: Goal[];
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
      goals: [],
      monthlyIncome: 0,
      monthlyExpenses: 0,
      disposableIncome: 0,
      debtRatio: 0,
    };

    this.init();
  }

  private init(): void {
    this.loadFromStorage();
    this.setupEventListeners();
    this.setupGoalsForm();
    this.updateUI();
    this.initializeEmailJS();
    this.setupNumberFormatting();
  }

  private setupEventListeners(): void {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach((tab) => {
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

    // Load sample data button
    const sampleDataBtn = document.getElementById('load-sample-data');
    if (sampleDataBtn) {
      sampleDataBtn.addEventListener('click', () => this.loadSampleData());
    }

    // Projection controls - Auto-update on selection change
    const projectionRangeSelect = document.getElementById(
      'projection-range'
    ) as HTMLSelectElement;
    if (projectionRangeSelect) {
      projectionRangeSelect.addEventListener('change', () =>
        this.updateProjectionWithRange()
      );
    }

    // Income configuration
    this.setupIncomeForm();

    // Expenses form
    this.setupExpensesForm();
  }

  private switchTab(tabName: string): void {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach((tab) => {
      tab.classList.remove('active');
    });

    // Show target tab
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // Update nav buttons
    document.querySelectorAll('.nav-tab').forEach((btn) => {
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
    const incomeForm = document.getElementById(
      'income-form'
    ) as HTMLFormElement;
    if (!incomeForm) return;

    // Handle frequency change
    const frequencyInputs = document.querySelectorAll(
      'input[name="income-frequency"]'
    );
    const frequencyLabel = document.getElementById('income-frequency-label');

    frequencyInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (frequencyLabel) {
          frequencyLabel.textContent =
            target.value === 'monthly' ? '(Mensual)' : '(Quincenal)';
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
    const expenseForm = document.getElementById(
      'expense-form'
    ) as HTMLFormElement;
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

  private setupGoalsForm(): void {
    const goalForm = document.getElementById('goal-form') as HTMLFormElement;
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addGoal();
      });
    }

    // Set minimum date to today
    const goalDateInput = document.getElementById(
      'goal-date'
    ) as HTMLInputElement;
    if (goalDateInput) {
      const today = new Date().toISOString().split('T')[0];
      goalDateInput.min = today;
    }
  }

  private handleIncomeSubmission(): void {
    const form = document.getElementById('income-form') as HTMLFormElement;
    const formData = new FormData(form);

    const frequency = formData.get('income-frequency') as string;
    const amount = this.parseArgentineNumber(
      (formData.get('income-amount') as string) || '0'
    );
    const additionalIncome = this.parseArgentineNumber(
      (formData.get('additional-income') as string) || '0'
    );

    if (amount <= 0) {
      this.showNotification('Por favor ingresa un monto válido', 'error');
      return;
    }

    const incomeConfig: IncomeConfig = {
      type: frequency === 'monthly' ? 'mensual' : 'quincenal',
      amount: amount + additionalIncome,
      frequency: 1,
    };

    this.addIncome(incomeConfig);
    this.showIncomePreview();
    this.showNotification(
      'Configuración de ingresos guardada exitosamente',
      'success'
    );
  }

  private handleExpenseSubmission(): void {
    const form = document.getElementById('expense-form') as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('expense-name') as string;
    const category = formData.get('expense-category') as string;
    const amount = this.parseArgentineNumber(
      (formData.get('expense-amount') as string) || '0'
    );
    const frequency = formData.get('expense-frequency') as string;
    const priority = formData.get('expense-priority') as string;

    if (!name || !category || amount <= 0) {
      this.showNotification(
        'Por favor completa todos los campos requeridos',
        'error'
      );
      return;
    }

    const expense = {
      name,
      category,
      amount,
      frequency: this.mapFrequencyToInternal(frequency),
      type:
        priority === 'essential' ? ('fijo' as const) : ('variable' as const),
    };

    this.addExpense(expense);
    this.updateExpensesList();
    this.updateCategoryFilter();
    form.reset();
    this.showNotification('Gasto agregado exitosamente', 'success');
  }

  private addGoal(): void {
    const nameInput = document.getElementById('goal-name') as HTMLInputElement;
    const amountInput = document.getElementById(
      'goal-amount'
    ) as HTMLInputElement;
    const currentInput = document.getElementById(
      'goal-current'
    ) as HTMLInputElement;
    const dateInput = document.getElementById('goal-date') as HTMLInputElement;
    const categorySelect = document.getElementById(
      'goal-category'
    ) as HTMLSelectElement;
    const prioritySelect = document.getElementById(
      'goal-priority'
    ) as HTMLSelectElement;
    const descriptionInput = document.getElementById(
      'goal-description'
    ) as HTMLTextAreaElement;

    // Validation
    if (
      !nameInput.value.trim() ||
      !amountInput.value ||
      !dateInput.value ||
      !categorySelect.value ||
      !prioritySelect.value
    ) {
      this.showNotification(
        '⚠️ Por favor complete todos los campos obligatorios',
        'error'
      );
      return;
    }

    const targetAmount = this.parseArgentineNumber(amountInput.value);
    const currentAmount = this.parseArgentineNumber(currentInput.value) || 0;

    if (targetAmount <= 0) {
      this.showNotification('⚠️ El monto objetivo debe ser mayor a 0', 'error');
      return;
    }

    if (currentAmount > targetAmount) {
      this.showNotification(
        '⚠️ El monto actual no puede ser mayor al objetivo',
        'error'
      );
      return;
    }

    const targetDate = new Date(dateInput.value);
    const today = new Date();
    if (targetDate <= today) {
      this.showNotification(
        '⚠️ La fecha objetivo debe ser en el futuro',
        'error'
      );
      return;
    }

    // Create new goal
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: nameInput.value.trim(),
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      targetDate: dateInput.value,
      category: categorySelect.value as Goal['category'],
      priority: prioritySelect.value as Goal['priority'],
      description: descriptionInput.value.trim(),
      createdAt: new Date().toISOString(),
    };

    this.data.goals.push(newGoal);
    this.saveToStorage();
    this.updateGoalsUI();
    this.clearGoalForm();

    this.showNotification('✅ Meta creada exitosamente', 'success');
  }

  private mapFrequencyToInternal(
    frequency: string
  ): 'diario' | 'semanal' | 'quincenal' | 'mensual' {
    const mapping = {
      daily: 'diario' as const,
      weekly: 'semanal' as const,
      biweekly: 'quincenal' as const,
      monthly: 'mensual' as const,
      yearly: 'mensual' as const,
      'one-time': 'mensual' as const,
    };
    return mapping[frequency as keyof typeof mapping] || 'mensual';
  }

  private previewIncome(): void {
    const form = document.getElementById('income-form') as HTMLFormElement;
    const formData = new FormData(form);

    const frequency = formData.get('income-frequency') as string;
    const amount = this.parseArgentineNumber(
      (formData.get('income-amount') as string) || '0'
    );
    const additionalIncome = this.parseArgentineNumber(
      (formData.get('additional-income') as string) || '0'
    );

    if (amount <= 0) {
      this.showNotification(
        'Por favor ingresa un monto para la vista previa',
        'error'
      );
      return;
    }

    const totalIncome = amount + additionalIncome;
    const monthlyIncome =
      frequency === 'monthly' ? totalIncome : totalIncome * 2;

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
      return total + expense.amount * multiplier;
    }, 0);
  }

  private getFrequencyMultiplier(frequency: string): number {
    const multipliers = {
      diario: 30,
      semanal: 4.33,
      quincenal: 2,
      mensual: 1,
      yearly: 1 / 12,
      'one-time': 0,
    };
    return multipliers[frequency as keyof typeof multipliers] || 1;
  }

  private convertToMonthly(amount: number, frequency: string): number {
    return amount * this.getFrequencyMultiplier(frequency);
  }

  private calculateFinancialHealth(): FinancialHealth {
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const disposableIncome = monthlyIncome - monthlyExpenses;
    const debtRatio =
      monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

    let score = 100;
    let status: FinancialHealth['status'] = 'excelente';
    let color = '#10b981';
    let icon = '🟢';
    const recommendations: string[] = [];

    if (debtRatio > 80) {
      score = Math.round(Math.max(0, 100 - (debtRatio - 80) * 5));
      status = 'malo';
      color = '#ef4444';
      icon = '🔴';
      recommendations.push(
        'Tu ratio de endeudamiento es muy alto. Considera reducir gastos.'
      );
      recommendations.push('Busca fuentes adicionales de ingresos.');
    } else if (debtRatio > 60) {
      score = Math.round(Math.max(20, 100 - (debtRatio - 60) * 2));
      status = 'regular';
      color = '#f59e0b';
      icon = '🟡';
      recommendations.push(
        'Tu ratio de endeudamiento es moderado. Revisa gastos no esenciales.'
      );
    } else if (debtRatio > 40) {
      score = Math.round(Math.max(60, 100 - (debtRatio - 40) * 1));
      status = 'bueno';
      color = '#06b6d4';
      icon = '🔵';
      recommendations.push(
        'Estás en una buena posición financiera. Considera ahorrar más.'
      );
    } else {
      recommendations.push(
        '¡Excelente gestión financiera! Considera invertir tu excedente.'
      );
    }

    if (disposableIncome < 0) {
      recommendations.push(
        'Tienes un déficit mensual. Revisa urgentemente tus gastos.'
      );
    } else if (disposableIncome < monthlyIncome * 0.1) {
      recommendations.push(
        'Tu margen de ahorro es muy bajo. Intenta aumentar tus ingresos o reducir gastos.'
      );
    }

    return { score, status, color, icon, recommendations };
  }

  private updateUI(): void {
    this.updateDashboard();
    this.updateHealthIndicator();
    this.updateExpensesList();
    this.updateGoalsUI();
    this.updateAnalysisUI();

    // Reaplicar formateo después de actualizar el contenido
    setTimeout(() => {
      this.applyNumberFormattingToInputs();
    }, 100);
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
      balanceSubtitle.textContent =
        disposableIncome >= 0 ? 'Superávit' : 'Déficit';

      // Update color based on balance
      const balanceCard = balanceElement.closest('.card') as HTMLElement;
      if (balanceCard) {
        balanceCard.style.borderLeftColor =
          disposableIncome >= 0 ? '#10b981' : '#ef4444';
      }
    }

    // Update debt ratio card
    const ratioElement = document.getElementById('debt-ratio');
    const ratioSubtitle = document.getElementById('ratio-subtitle');
    if (ratioElement && ratioSubtitle) {
      const debtRatio =
        monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
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
    if (healthText)
      healthText.textContent = `Estado: ${health.status.charAt(0).toUpperCase() + health.status.slice(1)}`;
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

    container.innerHTML = this.data.expenses
      .map((expense) => this.renderExpenseItem(expense))
      .join('');
  }

  private renderExpenseItem(expense: Expense): string {
    const categoryIcons = {
      housing: '🏠',
      food: '🍕',
      transport: '🚗',
      health: '🏥',
      education: '📚',
      entertainment: '🎬',
      shopping: '🛍️',
      services: '⚡',
      savings: '💰',
      debt: '💳',
      other: '📦',
    };

    const priorityColors = {
      fijo: '#ef4444',
      variable: '#10b981',
    };

    const monthlyAmount =
      expense.amount * this.getFrequencyMultiplier(expense.frequency);

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
      housing: 'Vivienda',
      food: 'Alimentación',
      transport: 'Transporte',
      health: 'Salud',
      education: 'Educación',
      entertainment: 'Entretenimiento',
      shopping: 'Compras',
      services: 'Servicios',
      savings: 'Ahorros',
      debt: 'Deudas',
      other: 'Otros',
    };
    return names[category as keyof typeof names] || 'Otros';
  }

  private getFrequencyLabel(frequency: string): string {
    const labels = {
      diario: 'Diario',
      semanal: 'Semanal',
      quincenal: 'Quincenal',
      mensual: 'Mensual',
    };
    return labels[frequency as keyof typeof labels] || 'Mensual';
  }

  private updateCategoryFilter(): void {
    const filter = document.getElementById(
      'category-filter'
    ) as HTMLSelectElement;
    if (!filter) return;

    const categories = [...new Set(this.data.expenses.map((e) => e.category))];
    const currentValue = filter.value;

    filter.innerHTML = '<option value="">Todas las categorías</option>';
    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = `${this.getCategoryIcon(category)} ${this.getCategoryName(category)}`;
      filter.appendChild(option);
    });

    filter.value = currentValue;
  }

  private getCategoryIcon(category: string): string {
    const icons = {
      housing: '🏠',
      food: '🍕',
      transport: '🚗',
      health: '🏥',
      education: '📚',
      entertainment: '🎬',
      shopping: '🛍️',
      services: '⚡',
      savings: '💰',
      debt: '💳',
      other: '📦',
    };
    return icons[category as keyof typeof icons] || '📦';
  }

  private filterExpenses(): void {
    const categoryFilter = document.getElementById(
      'category-filter'
    ) as HTMLSelectElement;
    const priorityFilter = document.getElementById(
      'priority-filter'
    ) as HTMLSelectElement;

    if (!categoryFilter || !priorityFilter) return;

    const categoryValue = categoryFilter.value;
    const priorityValue = priorityFilter.value;

    const expenseItems = document.querySelectorAll('.expense-item');

    expenseItems.forEach((item) => {
      const itemCategory = item.getAttribute('data-category');
      const itemPriority = item.getAttribute('data-priority');

      const matchesCategory = !categoryValue || itemCategory === categoryValue;
      const matchesPriority =
        !priorityValue ||
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
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Funciones para formateo de números argentinos
  private formatArgentineNumber(value: string): string {
    if (!value) return '';

    // Remover caracteres no numéricos excepto comas y puntos
    let cleanValue = value.replace(/[^\d,\.]/g, '');

    // Evitar múltiples comas
    const commaCount = (cleanValue.match(/,/g) || []).length;
    if (commaCount > 1) {
      const firstCommaIndex = cleanValue.indexOf(',');
      cleanValue =
        cleanValue.substring(0, firstCommaIndex + 1) +
        cleanValue.substring(firstCommaIndex + 1).replace(/,/g, '');
    }

    // Si hay coma, separar parte entera y decimal
    const parts = cleanValue.split(',');
    let integerPart = parts[0] || '';
    let decimalPart = parts[1] || '';

    // Remover puntos de la parte entera para limpiar
    integerPart = integerPart.replace(/\./g, '');

    // Limitar a 15 dígitos para evitar números excesivamente grandes
    if (integerPart.length > 15) {
      integerPart = integerPart.substring(0, 15);
    }

    // Si la parte entera tiene más de 3 dígitos, agregar puntos cada 3 dígitos
    if (integerPart.length > 3) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    // Combinar parte entera y decimal
    let result = integerPart;
    if (parts.length > 1) {
      // Limitar parte decimal a 2 dígitos
      decimalPart = decimalPart.substring(0, 2);
      result += ',' + decimalPart;
    }

    return result;
  }

  private parseArgentineNumber(value: string): number {
    // Convertir formato argentino a número
    // Ejemplo: "1.500,75" -> 1500.75
    if (!value) return 0;

    let cleanValue = value.toString();

    // Si hay coma, es el separador decimal
    if (cleanValue.includes(',')) {
      const parts = cleanValue.split(',');
      const integerPart = parts[0].replace(/\./g, ''); // Remover puntos (separadores de miles)
      const decimalPart = parts[1] || '0';
      cleanValue = integerPart + '.' + decimalPart;
    } else {
      // Solo remover puntos si no hay coma
      cleanValue = cleanValue.replace(/\./g, '');
    }

    return parseFloat(cleanValue) || 0;
  }

  private setupNumberFormatting(): void {
    // Aplicar formateo a todos los campos numéricos
    this.applyNumberFormattingToInputs();

    // Observar nuevos elementos que se agregan dinámicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const newInputs = element.querySelectorAll(
              'input[type="number"], input.numeric-input, input[data-format="currency"]'
            );
            this.applyFormattingToElements(newInputs);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private applyNumberFormattingToInputs(): void {
    const numericInputs = document.querySelectorAll(
      'input[type="number"], input.numeric-input, input[data-format="currency"]'
    );
    this.applyFormattingToElements(numericInputs);
  }

  private applyFormattingToElements(inputs: NodeListOf<Element>): void {
    inputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;

      // Evitar aplicar formateo múltiples veces
      if (inputElement.classList.contains('formatted-number')) {
        return;
      }

      // Cambiar tipo a text para permitir formateo
      inputElement.type = 'text';
      inputElement.classList.add('formatted-number');

      // Permitir solo caracteres numéricos, puntos, comas y espacios
      inputElement.addEventListener('keypress', (e) => {
        const char = String.fromCharCode(e.which);
        if (!/[0-9\.,\s]/.test(char)) {
          e.preventDefault();
        }
      });

      // Evento de entrada (mientras escribe)
      inputElement.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const cursorPosition = target.selectionStart || 0;
        const oldValue = target.value;
        const newValue = this.formatArgentineNumber(target.value);

        target.value = newValue;

        // Ajustar posición del cursor solo si el valor cambió
        if (newValue !== oldValue) {
          const lengthDiff = newValue.length - oldValue.length;
          const newCursorPosition = Math.max(0, cursorPosition + lengthDiff);
          target.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      });

      // Evento de pegado
      inputElement.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = (
          e.clipboardData || (window as any).clipboardData
        ).getData('text');
        const target = e.target as HTMLInputElement;
        target.value = this.formatArgentineNumber(paste);
      });

      // Validación en blur
      inputElement.addEventListener('blur', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = this.formatArgentineNumber(target.value);
      });
    });
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

  private async waitForJsPDF(timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      // Si ya está cargado, resolver inmediatamente
      if (window.jsPDF && typeof window.jsPDF === 'function') {
        console.log('jsPDF ya está disponible');
        resolve();
        return;
      }

      console.log('Esperando a que jsPDF se cargue...');
      let attempts = 0;
      const maxAttempts = timeout / 200; // Check every 200ms

      const checkLibrary = () => {
        attempts++;
        console.log(
          `Intento ${attempts}/${maxAttempts} - Verificando jsPDF...`
        );

        if (window.jsPDF && typeof window.jsPDF === 'function') {
          console.log('✅ jsPDF disponible después de', attempts * 200, 'ms');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.log('❌ Timeout esperando jsPDF después de', timeout, 'ms');
          reject(
            new Error(`Timeout waiting for jsPDF to load after ${timeout}ms`)
          );
        } else {
          setTimeout(checkLibrary, 200);
        }
      };

      checkLibrary();
    });
  }

  private async generatePDF(): Promise<void> {
    try {
      // Verificar si hay datos para exportar
      const monthlyIncome = this.calculateMonthlyIncome();
      const monthlyExpenses = this.calculateMonthlyExpenses();

      if (monthlyIncome === 0 && monthlyExpenses === 0) {
        this.showNotification(
          '⚠️ No hay datos financieros para exportar. Configure sus ingresos y gastos primero.',
          'info'
        );
        return;
      }

      // Mostrar indicador de carga
      this.showNotification('📊 Generando reporte PDF...', 'info');

      // Esperar a que jsPDF se cargue si es necesario
      await this.waitForJsPDF();

      // Verificar si jsPDF está disponible
      if (!window.jsPDF) {
        throw new Error(
          'jsPDF library failed to load. Please check your internet connection and refresh the page.'
        );
      }

      // Crear instancia de jsPDF
      const doc = new window.jsPDF();

      // Configuración del documento
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      // Header con gradiente simulado
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('💰 Reporte Financiero Personal', margin, 25);

      // Fecha del reporte
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const reportDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Generado el: ${reportDate}`, margin, 38);

      currentY = 65;

      // Reset color del texto para el contenido
      doc.setTextColor(0, 0, 0);

      // Resumen Financiero
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('📊 Resumen Financiero', margin, currentY);
      currentY += 20;

      // Calcular valores actuales
      const disposableIncome = monthlyIncome - monthlyExpenses;
      const debtRatio =
        monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

      // Datos del resumen
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      const summaryData = [
        {
          label: '💰 Ingresos Mensuales:',
          value: this.formatCurrency(monthlyIncome),
          color: [16, 185, 129],
        },
        {
          label: '💸 Gastos Mensuales:',
          value: this.formatCurrency(monthlyExpenses),
          color: [239, 68, 68],
        },
        {
          label: '💵 Ingreso Disponible:',
          value: this.formatCurrency(disposableIncome),
          color: disposableIncome >= 0 ? [16, 185, 129] : [239, 68, 68],
        },
        {
          label: '📊 Ratio de Endeudamiento:',
          value: `${debtRatio.toFixed(1)}%`,
          color:
            debtRatio < 30
              ? [16, 185, 129]
              : debtRatio < 50
                ? [245, 158, 11]
                : [239, 68, 68],
        },
      ];

      summaryData.forEach(({ label, value, color }) => {
        // Etiqueta
        doc.setTextColor(0, 0, 0);
        doc.text(label, margin, currentY);

        // Valor con color
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(value, margin + 100, currentY);

        doc.setFont('helvetica', 'normal');
        currentY += 10;
      });

      currentY += 15;

      // Evaluación de Salud Financiera
      const health = this.calculateFinancialHealth();
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('🏥 Evaluación de Salud Financiera', margin, currentY);
      currentY += 20;

      // Estado de salud
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Puntuación: ${health.score}/100`, margin, currentY);
      currentY += 10;

      // Estado con color
      const statusColors = {
        excelente: [16, 185, 129],
        bueno: [34, 197, 94],
        regular: [245, 158, 11],
        malo: [239, 68, 68],
      };
      const statusColor = statusColors[health.status] || [128, 128, 128];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`Estado: ${health.status.toUpperCase()}`, margin, currentY);
      currentY += 20;

      // Lista de Gastos por Categoría (solo si hay gastos)
      if (this.data.expenses.length > 0) {
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text('📋 Desglose de Gastos', margin, currentY);
        currentY += 20;

        // Agrupar gastos por categoría
        const expensesByCategory = this.data.expenses.reduce(
          (acc, expense) => {
            if (!acc[expense.category]) {
              acc[expense.category] = 0;
            }
            acc[expense.category] += this.convertToMonthly(
              expense.amount,
              expense.frequency
            );
            return acc;
          },
          {} as Record<string, number>
        );

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        Object.entries(expensesByCategory)
          .sort(([, a], [, b]) => b - a) // Ordenar por monto descendente
          .forEach(([category, amount]) => {
            const categoryEmojis = {
              housing: '🏠',
              food: '🍕',
              transport: '🚗',
              health: '🏥',
              education: '📚',
              entertainment: '🎬',
              shopping: '🛍️',
              services: '⚡',
              savings: '💰',
              debt: '💳',
              other: '📦',
            };

            const emoji =
              categoryEmojis[category as keyof typeof categoryEmojis] || '📦';
            const categoryNames = {
              housing: 'Vivienda',
              food: 'Alimentación',
              transport: 'Transporte',
              health: 'Salud',
              education: 'Educación',
              entertainment: 'Entretenimiento',
              shopping: 'Compras',
              services: 'Servicios',
              savings: 'Ahorros',
              debt: 'Deudas',
              other: 'Otros',
            };
            const categoryName =
              categoryNames[category as keyof typeof categoryNames] || category;

            doc.text(`${emoji} ${categoryName}:`, margin, currentY);
            doc.text(this.formatCurrency(amount), margin + 100, currentY);

            // Agregar porcentaje del total
            const percentage = ((amount / monthlyExpenses) * 100).toFixed(1);
            doc.setTextColor(128, 128, 128);
            doc.text(`(${percentage}%)`, margin + 140, currentY);
            doc.setTextColor(0, 0, 0);

            currentY += 8;
          });

        currentY += 15;
      }

      // Recomendaciones
      if (health.recommendations.length > 0) {
        // Verificar si necesitamos una nueva página
        if (currentY > pageHeight - 100) {
          doc.addPage();
          currentY = margin;
        }

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text('💡 Recomendaciones', margin, currentY);
        currentY += 20;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        health.recommendations.forEach((recommendation, index) => {
          // Verificar si necesitamos una nueva página
          if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = margin;
          }

          const lines = doc.splitTextToSize(
            `${index + 1}. ${recommendation}`,
            pageWidth - 2 * margin
          );

          lines.forEach((line: string) => {
            doc.text(line, margin, currentY);
            currentY += 6;
          });
          currentY += 4;
        });
      }

      // Footer en todas las páginas
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
          'Asesor Financiero Personal - Reporte generado automáticamente',
          margin,
          pageHeight - 15
        );

        doc.text(
          `Página ${i} de ${totalPages}`,
          pageWidth - margin - 30,
          pageHeight - 15
        );
      }

      // Generar nombre del archivo
      const fileName = `reporte-financiero-${new Date().toISOString().split('T')[0]}.pdf`;

      // Guardar el PDF
      doc.save(fileName);

      // Mostrar notificación de éxito
      this.showNotification(
        '📄 ¡Reporte PDF generado exitosamente!',
        'success'
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.showNotification('❌ Error al generar el reporte PDF', 'error');
    }
  }

  // Método de debug para verificar jsPDF
  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void {
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
    actionsEl.innerHTML =
      actions ||
      '<button class="btn btn-primary" onclick="window.financialAdvisor.closeModal()">Cerrar</button>';

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
      id: Date.now().toString(),
    };
    this.data.expenses.push(newExpense);
    this.saveToStorage();
    this.updateUI();
  }

  public removeExpense(id: string): void {
    this.data.expenses = this.data.expenses.filter(
      (expense) => expense.id !== id
    );
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
    const expense = this.data.expenses.find((e) => e.id === id);
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
    const expense = this.data.expenses.find((e) => e.id === id);
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

  // Goals Management Methods
  private updateGoalsUI(): void {
    this.renderGoals();
    this.updateGoalsSummary();
  }

  private clearGoalForm(): void {
    const form = document.getElementById('goal-form') as HTMLFormElement;
    if (form) {
      form.reset();
    }
  }

  private renderGoals(): void {
    const container = document.getElementById('goals-container');
    if (!container) return;

    if (this.data.goals.length === 0) {
      container.innerHTML = `
        <div class="no-data-message">
          <span class="icon">🎯</span>
          <p>Aún no has creado ninguna meta financiera</p>
          <p>Usa el formulario de arriba para crear tu primera meta</p>
        </div>
      `;
      return;
    }

    // Sort goals by priority and then by target date
    const sortedGoals = [...this.data.goals].sort((a, b) => {
      const priorityOrder = { alta: 0, media: 1, baja: 2 };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return (
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );
    });

    container.innerHTML = sortedGoals
      .map((goal) => this.createGoalCard(goal))
      .join('');
  }

  private createGoalCard(goal: Goal): string {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const daysRemaining = Math.ceil(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Category info
    const categoryInfo = {
      ahorro: { icon: '💰', name: 'Ahorro General', color: '#10b981' },
      deuda: { icon: '💳', name: 'Eliminar Deuda', color: '#ef4444' },
      inversion: { icon: '📈', name: 'Inversión', color: '#3b82f6' },
      compra: { icon: '🛍️', name: 'Compra Importante', color: '#8b5cf6' },
      emergencia: { icon: '🛡️', name: 'Fondo de Emergencia', color: '#f59e0b' },
    };

    const category = categoryInfo[goal.category];

    // Days remaining status
    let daysStatus = 'normal';
    if (daysRemaining <= 30) daysStatus = 'urgent';
    else if (daysRemaining <= 90) daysStatus = 'soon';

    const isCompleted = progress >= 100;

    return `
      <div class="goal-card ${isCompleted ? 'completed' : ''}">
        <div class="goal-header">
          <div class="goal-category" style="background: ${category.color}20; color: ${category.color};">
            ${category.icon} ${category.name}
          </div>
          <div class="goal-priority ${goal.priority}">
            ${goal.priority}
          </div>
        </div>
        
        <div class="goal-info">
          <h4>${goal.name}</h4>
          ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
          
          <div class="goal-progress">
            <div class="progress-header">
              <div class="progress-amounts">
                ${this.formatCurrency(goal.currentAmount)} / ${this.formatCurrency(goal.targetAmount)}
              </div>
              <div class="progress-percentage">
                ${progress.toFixed(1)}%
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
          </div>
          
          <div class="goal-meta">
            <div class="goal-date">
              📅 ${targetDate.toLocaleDateString('es-ES')}
            </div>
            <div class="days-remaining ${daysStatus}">
              ${daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Vencida'}
            </div>
          </div>
          
          ${
            !isCompleted
              ? `
            <div class="goal-remaining">
              <strong>Faltan: ${this.formatCurrency(remaining)}</strong>
            </div>
          `
              : `
            <div class="goal-completed">
              🎉 <strong>¡Meta completada!</strong>
            </div>
          `
          }
        </div>
        
        <div class="goal-actions">
          <button class="btn btn-outline" onclick="window.financialAdvisor.updateGoalAmount('${goal.id}')">
            💰 Actualizar Monto
          </button>
          <button class="btn btn-outline" onclick="window.financialAdvisor.editGoal('${goal.id}')">
            ✏️ Editar
          </button>
          <button class="btn btn-danger" onclick="window.financialAdvisor.deleteGoal('${goal.id}')">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
  }

  private updateGoalsSummary(): void {
    const summaryContainer = document.getElementById('goals-summary');
    if (!summaryContainer) return;

    if (this.data.goals.length === 0) {
      summaryContainer.style.display = 'none';
      return;
    }

    summaryContainer.style.display = 'block';

    const totalGoals = this.data.goals.length;
    const completedGoals = this.data.goals.filter(
      (goal) => goal.currentAmount >= goal.targetAmount
    ).length;
    const totalTarget = this.data.goals.reduce(
      (sum, goal) => sum + goal.targetAmount,
      0
    );
    const totalCurrent = this.data.goals.reduce(
      (sum, goal) => sum + goal.currentAmount,
      0
    );
    const totalProgress =
      totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    const totalGoalsEl = document.getElementById('total-goals');
    const completedGoalsEl = document.getElementById('completed-goals');
    const totalTargetEl = document.getElementById('total-target');
    const totalProgressEl = document.getElementById('total-progress');

    if (totalGoalsEl) totalGoalsEl.textContent = totalGoals.toString();
    if (completedGoalsEl)
      completedGoalsEl.textContent = completedGoals.toString();
    if (totalTargetEl)
      totalTargetEl.textContent = this.formatCurrency(totalTarget);
    if (totalProgressEl)
      totalProgressEl.textContent = `${totalProgress.toFixed(1)}%`;
  }

  public updateGoalAmount(goalId: string): void {
    const goal = this.data.goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = prompt(
      `Actualizar monto para "${goal.name}"\nMonto actual: ${this.formatCurrency(goal.currentAmount)}\nMonto objetivo: ${this.formatCurrency(goal.targetAmount)}\n\nIngrese el nuevo monto actual:`,
      goal.currentAmount.toString()
    );

    if (newAmount === null) return;

    const amount = this.parseArgentineNumber(newAmount);
    if (isNaN(amount) || amount < 0) {
      this.showNotification('⚠️ Monto inválido', 'error');
      return;
    }

    if (amount > goal.targetAmount) {
      const confirm = window.confirm(
        `El monto ingresado (${this.formatCurrency(amount)}) es mayor al objetivo (${this.formatCurrency(goal.targetAmount)}).\n¿Desea continuar? Esto marcará la meta como completada.`
      );
      if (!confirm) return;
    }

    goal.currentAmount = amount;
    this.saveToStorage();
    this.updateGoalsUI();

    if (amount >= goal.targetAmount) {
      this.showNotification(
        '🎉 ¡Felicidades! Has completado tu meta',
        'success'
      );
    } else {
      this.showNotification('✅ Monto actualizado exitosamente', 'success');
    }
  }

  public editGoal(goalId: string): void {
    // For now, just show a message - full edit functionality can be added later
    console.log('Edit goal:', goalId); // Temporary to avoid unused parameter warning
    this.showNotification('🚧 Función de edición en desarrollo', 'info');
  }

  public deleteGoal(goalId: string): void {
    const goal = this.data.goals.find((g) => g.id === goalId);
    if (!goal) return;

    const confirm = window.confirm(
      `¿Está seguro de que desea eliminar la meta "${goal.name}"?\nEsta acción no se puede deshacer.`
    );

    if (!confirm) return;

    this.data.goals = this.data.goals.filter((g) => g.id !== goalId);
    this.saveToStorage();
    this.updateGoalsUI();

    this.showNotification('✅ Meta eliminada exitosamente', 'success');
  }

  // Analysis Methods
  private calculateAnalysisMetrics(): AnalysisMetrics {
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const disposableIncome = monthlyIncome - monthlyExpenses;

    // Savings Rate
    const savingsRate =
      monthlyIncome > 0 ? (disposableIncome / monthlyIncome) * 100 : 0;

    // Debt to Income Ratio
    const debtToIncomeRatio =
      monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

    // Emergency Fund (assuming savings are emergency fund for now)
    const emergencyFundMonths =
      monthlyExpenses > 0 ? Math.max(0, disposableIncome) / monthlyExpenses : 0;

    // Expense Growth Trend (placeholder - would need historical data)
    const expenseGrowthTrend = 0; // This would require historical tracking

    // Top Expense Categories
    const categoryTotals = this.data.expenses.reduce(
      (acc, expense) => {
        const monthlyAmount = this.convertToMonthly(
          expense.amount,
          expense.frequency
        );
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += monthlyAmount;
        return acc;
      },
      {} as Record<string, number>
    );

    const topExpenseCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly Projection - use current setting or default to 6 months
    const rangeSelect = document.getElementById(
      'projection-range'
    ) as HTMLSelectElement;
    const projectionMonths = rangeSelect ? parseInt(rangeSelect.value) : 6;
    const monthlyProjection =
      this.calculateProjectionForMonths(projectionMonths);

    return {
      savingsRate,
      debtToIncomeRatio,
      emergencyFundMonths,
      expenseGrowthTrend,
      topExpenseCategories,
      monthlyProjection,
    };
  }

  private updateAnalysisUI(): void {
    const metrics = this.calculateAnalysisMetrics();

    // Update metrics cards
    this.updateMetricCard(
      'savings-rate',
      metrics.savingsRate,
      '%',
      this.getSavingsRateStatus(metrics.savingsRate)
    );
    this.updateMetricCard(
      'debt-income-ratio',
      metrics.debtToIncomeRatio,
      '%',
      this.getDebtRatioStatus(metrics.debtToIncomeRatio)
    );
    this.updateMetricCard(
      'emergency-fund',
      metrics.emergencyFundMonths,
      ' meses',
      this.getEmergencyFundStatus(metrics.emergencyFundMonths)
    );
    this.updateMetricCard(
      'expense-trend',
      metrics.expenseGrowthTrend,
      '%',
      'info'
    );

    // Update charts and analysis
    this.updateTopCategoriesChart(metrics.topExpenseCategories);

    // Use current projection range setting
    const rangeSelect = document.getElementById(
      'projection-range'
    ) as HTMLSelectElement;
    const months = rangeSelect ? parseInt(rangeSelect.value) : 6;
    const projection = this.calculateProjectionForMonths(months);
    this.updateProjectionChart(projection);

    this.updateAnalysisRecommendations(metrics);
  }

  private updateMetricCard(
    elementId: string,
    value: number,
    suffix: string,
    status: string
  ): void {
    const valueElement = document.getElementById(elementId);
    const statusElement = document.getElementById(
      elementId
        .replace('rate', 'status')
        .replace('ratio', 'status')
        .replace('fund', 'status')
        .replace('trend', 'status')
    );

    if (valueElement) {
      valueElement.textContent = `${value.toFixed(1)}${suffix}`;
    }

    if (statusElement) {
      // Remove existing status classes
      statusElement.className = 'metric-status';
      statusElement.classList.add(status);

      const statusText = {
        excellent: 'Excelente',
        good: 'Bueno',
        warning: 'Revisar',
        danger: 'Crítico',
        info: 'Información',
      };

      statusElement.textContent =
        statusText[status as keyof typeof statusText] || 'Sin datos';
    }
  }

  private getSavingsRateStatus(rate: number): string {
    if (rate >= 20) return 'excellent';
    if (rate >= 10) return 'good';
    if (rate >= 5) return 'warning';
    return 'danger';
  }

  private getDebtRatioStatus(ratio: number): string {
    if (ratio <= 30) return 'excellent';
    if (ratio <= 50) return 'good';
    if (ratio <= 70) return 'warning';
    return 'danger';
  }

  private getEmergencyFundStatus(months: number): string {
    if (months >= 6) return 'excellent';
    if (months >= 3) return 'good';
    if (months >= 1) return 'warning';
    return 'danger';
  }

  private updateTopCategoriesChart(
    categories: AnalysisMetrics['topExpenseCategories']
  ): void {
    const container = document.getElementById('top-categories-chart');
    if (!container) return;

    if (categories.length === 0) {
      container.innerHTML = `
        <div class="no-data-message">
          <span class="icon">📊</span>
          <p>Configure sus gastos para ver el análisis de categorías</p>
        </div>
      `;
      return;
    }

    const categoryNames = {
      housing: '🏠 Vivienda',
      food: '🍕 Alimentación',
      transport: '🚗 Transporte',
      health: '🏥 Salud',
      education: '📚 Educación',
      entertainment: '🎬 Entretenimiento',
      shopping: '🛍️ Compras',
      services: '⚡ Servicios',
      savings: '💰 Ahorros',
      debt: '💳 Deudas',
      other: '📦 Otros',
    };

    const topCategories = categories.slice(0, 5);

    container.innerHTML = `
      <div class="categories-list">
        ${topCategories
          .map(
            (cat) => `
          <div class="category-item">
            <div class="category-info">
              <span class="category-name">${categoryNames[cat.category as keyof typeof categoryNames] || cat.category}</span>
              <span class="category-amount">${this.formatCurrency(cat.amount)}</span>
            </div>
            <div class="category-bar">
              <div class="category-fill" style="width: ${cat.percentage}%"></div>
            </div>
            <div class="category-percentage">${cat.percentage.toFixed(1)}%</div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private updateProjectionChart(
    projection: AnalysisMetrics['monthlyProjection']
  ): void {
    const container = document.getElementById('projection-chart');
    if (!container) return;

    if (
      projection.length === 0 ||
      projection.every((p) => p.income === 0 && p.expenses === 0)
    ) {
      container.innerHTML = `
        <div class="no-data-message">
          <span class="icon">📈</span>
          <p>Configure sus ingresos y gastos para ver las proyecciones</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="projection-table">
        <div class="table-header">
          <div class="header-cell">Mes</div>
          <div class="header-cell">Ingresos</div>
          <div class="header-cell">Gastos</div>
          <div class="header-cell">Balance</div>
          <div class="header-cell">Ahorro Acumulado</div>
        </div>
        ${projection
          .map((p, index) => {
            // Calculate accumulated savings up to this month
            const accumulatedSavings = projection
              .slice(0, index + 1)
              .reduce((sum, month) => sum + month.balance, 0);

            return `
          <div class="table-row">
            <div class="table-cell">${p.month}</div>
            <div class="table-cell income">${this.formatCurrency(p.income)}</div>
            <div class="table-cell expense">${this.formatCurrency(p.expenses)}</div>
            <div class="table-cell balance ${p.balance >= 0 ? 'positive' : 'negative'}">
              ${this.formatCurrency(p.balance)}
            </div>
            <div class="table-cell accumulated ${accumulatedSavings >= 0 ? 'positive' : 'negative'}">
              ${this.formatCurrency(accumulatedSavings)}
            </div>
          </div>
        `;
          })
          .join('')}
      </div>
    `;
  }

  // NEW - Dynamic projection update method
  private updateProjectionWithRange(): void {
    const rangeSelect = document.getElementById(
      'projection-range'
    ) as HTMLSelectElement;
    if (!rangeSelect) return;

    const months = parseInt(rangeSelect.value);
    const projection = this.calculateProjectionForMonths(months);
    this.updateProjectionChart(projection);

    // Add highlight animation to the projection container
    const container = document.getElementById('projection-chart');
    if (container) {
      container.classList.add('projection-updated');
      setTimeout(() => {
        container.classList.remove('projection-updated');
      }, 600);
    }

    // Show feedback notification with details
    const timeLabel =
      months === 12 ? '1 año' : months === 24 ? '2 años' : `${months} meses`;
    this.showNotification(
      `📈 Proyección actualizada para ${timeLabel}`,
      'success'
    );
  }

  // NEW - Calculate projection for specific number of months
  private calculateProjectionForMonths(
    months: number
  ): AnalysisMetrics['monthlyProjection'] {
    const monthlyIncome = this.calculateMonthlyIncome();
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const disposableIncome = monthlyIncome - monthlyExpenses;

    const projection = [];
    const currentDate = new Date();

    for (let i = 0; i < months; i++) {
      const projectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + i,
        1
      );
      const month = projectedDate.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      });

      projection.push({
        month,
        income: monthlyIncome,
        expenses: monthlyExpenses,
        balance: disposableIncome,
      });
    }

    return projection;
  }

  // Analysis recommendations
  private updateAnalysisRecommendations(metrics: AnalysisMetrics): void {
    const container = document.getElementById('analysis-recommendations');
    if (!container) return;

    const recommendations = this.generateAnalysisRecommendations(metrics);

    if (recommendations.length === 0) {
      container.innerHTML =
        '<div class="no-data-message"><span class="icon">🤔</span><p>Las recomendaciones aparecerán cuando haya datos financieros disponibles</p></div>';
      return;
    }

    container.innerHTML = recommendations
      .map(
        (rec) => `
      <div class="recommendation-item">
        <div class="recommendation-type">${rec.type}</div>
        <div class="recommendation-text">${rec.text}</div>
        <div class="recommendation-impact">${rec.impact}</div>
      </div>
    `
      )
      .join('');
  }

  private generateAnalysisRecommendations(
    metrics: AnalysisMetrics
  ): Array<{ type: string; text: string; impact: string }> {
    const recommendations = [];

    // Savings Rate Recommendations
    if (metrics.savingsRate < 10) {
      recommendations.push({
        type: 'AHORRO',
        text: 'Su tasa de ahorro es baja. Intente aumentar sus ahorros reduciendo gastos no esenciales.',
        impact: 'Impacto: Mejorar estabilidad financiera a largo plazo',
      });
    }

    // Debt Ratio Recommendations
    if (metrics.debtToIncomeRatio > 50) {
      recommendations.push({
        type: 'DEUDAS',
        text: 'Su ratio de deuda es alto. Considere estrategias para reducir gastos o aumentar ingresos.',
        impact:
          'Impacto: Reducir estrés financiero y mejorar capacidad de ahorro',
      });
    }

    // Emergency Fund Recommendations
    if (metrics.emergencyFundMonths < 3) {
      recommendations.push({
        type: 'FONDO EMERGENCIA',
        text: 'Su fondo de emergencia es insuficiente. Intente ahorrar para cubrir al menos 3-6 meses de gastos.',
        impact: 'Impacto: Mayor seguridad ante imprevistos financieros',
      });
    }

    // Category-specific recommendations
    if (metrics.topExpenseCategories.length > 0) {
      const topCategory = metrics.topExpenseCategories[0];
      if (topCategory.percentage > 40 && topCategory.category !== 'housing') {
        recommendations.push({
          type: 'CATEGORÍA PRINCIPAL',
          text: `Los gastos en ${topCategory.category} representan ${topCategory.percentage.toFixed(1)}% de sus gastos. Revise si puede optimizar esta categoría.`,
          impact:
            'Impacto: Potencial reducción significativa de gastos mensuales',
        });
      }
    }

    return recommendations;
  }

  // Cargar datos de ejemplo diferentes cada vez (tipos corregidos y categorías válidas)
  private _sampleDataIndex = 0;
  private _sampleDataSets = [
    {
      income: { amount: 3500, type: 'mensual' as const, frequency: 1 },
      expenses: [
        {
          id: '1',
          name: 'Alquiler',
          amount: 1200,
          frequency: 'mensual' as const,
          category: 'housing',
          type: 'fijo' as const,
        },
        {
          id: '2',
          name: 'Supermercado',
          amount: 400,
          frequency: 'mensual' as const,
          category: 'food',
          type: 'variable' as const,
        },
        {
          id: '3',
          name: 'Transporte público',
          amount: 80,
          frequency: 'mensual' as const,
          category: 'transport',
          type: 'fijo' as const,
        },
        {
          id: '4',
          name: 'Seguro médico',
          amount: 150,
          frequency: 'mensual' as const,
          category: 'health',
          type: 'fijo' as const,
        },
        {
          id: '5',
          name: 'Netflix',
          amount: 15,
          frequency: 'mensual' as const,
          category: 'entertainment',
          type: 'fijo' as const,
        },
      ],
      goals: [
        {
          id: '1',
          name: 'Fondo de Emergencia',
          targetAmount: 10000,
          currentAmount: 2500,
          targetDate: '2025-12-31',
          category: 'emergencia' as const,
          priority: 'alta' as const,
          description:
            'Ahorrar para cubrir 6 meses de gastos en caso de emergencia',
          createdAt: '2025-01-01',
        },
        {
          id: '2',
          name: 'Vacaciones en Europa',
          targetAmount: 5000,
          currentAmount: 1200,
          targetDate: '2026-07-01',
          category: 'compra' as const,
          priority: 'media' as const,
          description: 'Viaje de 2 semanas por Europa',
          createdAt: '2025-01-01',
        },
      ],
    },
    {
      income: { amount: 5000, type: 'mensual' as const, frequency: 1 },
      expenses: [
        {
          id: '1',
          name: 'Hipoteca',
          amount: 1800,
          frequency: 'mensual' as const,
          category: 'housing',
          type: 'fijo' as const,
        },
        {
          id: '2',
          name: 'Comida',
          amount: 600,
          frequency: 'mensual' as const,
          category: 'food',
          type: 'variable' as const,
        },
        {
          id: '3',
          name: 'Auto',
          amount: 300,
          frequency: 'mensual' as const,
          category: 'transport',
          type: 'fijo' as const,
        },
        {
          id: '4',
          name: 'Colegio',
          amount: 400,
          frequency: 'mensual' as const,
          category: 'education',
          type: 'fijo' as const,
        },
        {
          id: '5',
          name: 'Gimnasio',
          amount: 50,
          frequency: 'mensual' as const,
          category: 'health',
          type: 'fijo' as const,
        },
      ],
      goals: [
        {
          id: '1',
          name: 'Comprar Auto Nuevo',
          targetAmount: 15000,
          currentAmount: 3000,
          targetDate: '2026-03-01',
          category: 'compra' as const,
          priority: 'alta' as const,
          description: 'Ahorro para auto nuevo',
          createdAt: '2025-01-01',
        },
        {
          id: '2',
          name: 'Fondo Universitario',
          targetAmount: 20000,
          currentAmount: 5000,
          targetDate: '2028-09-01',
          category: 'ahorro' as const,
          priority: 'alta' as const,
          description: 'Ahorro para universidad de los hijos',
          createdAt: '2025-01-01',
        },
      ],
    },
    {
      income: { amount: 2500, type: 'mensual' as const, frequency: 1 },
      expenses: [
        {
          id: '1',
          name: 'Renta',
          amount: 900,
          frequency: 'mensual' as const,
          category: 'housing',
          type: 'fijo' as const,
        },
        {
          id: '2',
          name: 'Comida',
          amount: 350,
          frequency: 'mensual' as const,
          category: 'food',
          type: 'variable' as const,
        },
        {
          id: '3',
          name: 'Transporte',
          amount: 60,
          frequency: 'mensual' as const,
          category: 'transport',
          type: 'fijo' as const,
        },
        {
          id: '4',
          name: 'Internet',
          amount: 40,
          frequency: 'mensual' as const,
          category: 'utilities',
          type: 'fijo' as const,
        },
        {
          id: '5',
          name: 'Cine',
          amount: 30,
          frequency: 'mensual' as const,
          category: 'entertainment',
          type: 'variable' as const,
        },
      ],
      goals: [
        {
          id: '1',
          name: 'Ahorro Vacaciones',
          targetAmount: 2000,
          currentAmount: 500,
          targetDate: '2025-11-01',
          category: 'ahorro' as const,
          priority: 'media' as const,
          description: 'Vacaciones familiares',
          createdAt: '2025-01-01',
        },
        {
          id: '2',
          name: 'Laptop Nueva',
          targetAmount: 1200,
          currentAmount: 200,
          targetDate: '2025-10-01',
          category: 'compra' as const,
          priority: 'baja' as const,
          description: 'Actualizar equipo de trabajo',
          createdAt: '2025-01-01',
        },
      ],
    },
  ];

  public loadSampleData(): void {
    // Rotar entre los diferentes ejemplos
    const data = this._sampleDataSets[this._sampleDataIndex];
    this._sampleDataIndex =
      (this._sampleDataIndex + 1) % this._sampleDataSets.length;
    this.data.income = { ...data.income };
    this.data.expenses = data.expenses.map((e) => ({ ...e }));
    this.data.goals = data.goals.map((g) => ({ ...g }));
    this.saveToStorage();
    this.updateUI();

    // Actualizar formularios con datos formateados
    this.populateFormsWithSampleData(data);

    this.showNotification(
      '✅ Datos de ejemplo cargados (variante diferente)',
      'success'
    );
  }

  private populateFormsWithSampleData(data: any): void {
    // Llenar formulario de ingresos
    const incomeAmountInput = document.getElementById(
      'income-amount'
    ) as HTMLInputElement;
    const additionalIncomeInput = document.getElementById(
      'additional-income'
    ) as HTMLInputElement;

    if (incomeAmountInput && data.income) {
      incomeAmountInput.value = this.formatArgentineNumber(
        data.income.amount.toString()
      );
    }

    if (additionalIncomeInput) {
      additionalIncomeInput.value = '';
    }

    // Aplicar formateo a todos los campos después de un pequeño delay
    setTimeout(() => {
      this.applyNumberFormattingToInputs();
    }, 50);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.financialAdvisor = new FinancialAdvisor();
});
