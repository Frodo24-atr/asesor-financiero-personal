# Guía de Migración - De Calculadora a Asesor Financiero

Esta guía proporciona un roadmap detallado para migrar funcionalidades de la calculadora de cuotas al asesor financiero personal.

## 📋 Roadmap de Desarrollo

### Fase 1: Configuración de Ingresos ✅ (En Progreso)
- [x] Estructura base del proyecto
- [x] Configuración de TypeScript y Vite
- [ ] **Sistema de configuración de ingresos**
  - [ ] Selector quincenal/mensual
  - [ ] Formulario de captura de ingresos
  - [ ] Validación y almacenamiento
  - [ ] Vista previa de ingresos configurados

### Fase 2: Gestión de Gastos 🔄 (Siguiente)
- [ ] **Migrar sistema de productos → gastos**
  - [ ] Adaptar `addProduct()` → `addExpense()`
  - [ ] Categorización de gastos (vivienda, alimentación, transporte, etc.)
  - [ ] Campos adicionales: frecuencia, prioridad, tipo
  - [ ] Sistema de etiquetas y filtros avanzados

### Fase 3: Dashboard y Análisis 📊 (Futuro)
- [ ] **Expandir sistema de estadísticas**
  - [ ] Migrar `updateStats()` con nuevas métricas
  - [ ] Ratios de endeudamiento (deuda/ingreso)
  - [ ] Flujo de caja mensual/quincenal
  - [ ] Proyecciones de ahorro
- [ ] **Semáforo de salud financiera**
  - [ ] Algoritmo de evaluación de salud
  - [ ] Indicadores visuales por categoría
  - [ ] Recomendaciones automáticas

### Fase 4: Reportes Avanzados 📄 (Futuro)
- [ ] **Migrar y expandir sistema PDF**
  - [ ] Reutilizar `generatePDF()` base
  - [ ] Nuevas secciones: análisis de ingresos, ratios, proyecciones
  - [ ] Gráficos de tendencias en PDF
  - [ ] Recomendaciones personalizadas en reporte

### Fase 5: IA y Recomendaciones 🤖 (Avanzado)
- [ ] **Sistema de recomendaciones inteligentes**
  - [ ] Análisis de patrones de gasto
  - [ ] Sugerencias de optimización
  - [ ] Alertas proactivas
  - [ ] Metas de ahorro automáticas

## 🔄 Estrategia de Migración

### Funciones Base Reutilizables (Sin Cambios)
```javascript
// Estas funciones se pueden reutilizar directamente:
- formatCurrency()
- validatePositiveNumber()
- showModal()
- showLoading() / hideLoading()
- saveToLocalStorage() / loadFromLocalStorage()
- addPDFHeader() / addPDFFooter()
```

### Funciones a Adaptar
```javascript
// addProduct() → addExpense()
// Cambios necesarios:
// - Agregar campo "categoria"
// - Agregar campo "frecuencia" (mensual/quincenal/anual)
// - Agregar campo "prioridad" (esencial/importante/opcional)
// - Validaciones específicas para gastos

// updateStats() → updateFinancialAnalysis()
// Expansiones necesarias:
// - Incluir análisis de ingresos
// - Calcular ratios financieros
// - Proyecciones de flujo de caja
// - Indicadores de salud financiera

// generatePDF() → generateFinancialReport()
// Nuevas secciones:
// - Resumen de ingresos y configuración
// - Análisis de ratios de endeudamiento
// - Gráficos de distribución de gastos por categoría
// - Recomendaciones personalizadas
// - Proyecciones y metas
```

### Nuevas Funcionalidades Principales

#### 1. Sistema de Configuración de Ingresos
```javascript
class IncomeManager {
  constructor() {
    this.incomeType = 'monthly'; // 'monthly' | 'biweekly'
    this.incomeAmount = 0;
    this.additionalIncome = [];
  }
  
  setIncomeType(type) {
    // Cambiar entre quincenal/mensual
  }
  
  setMainIncome(amount) {
    // Configurar ingreso principal
  }
  
  addAdditionalIncome(source, amount, frequency) {
    // Agregar ingresos adicionales
  }
  
  calculateMonthlyIncome() {
    // Calcular ingresos totales mensuales
  }
}
```

#### 2. Análisis de Ratios Financieros
```javascript
class FinancialAnalyzer {
  calculateDebtToIncomeRatio(totalDebts, monthlyIncome) {
    // Ratio deuda/ingreso
  }
  
  calculateSavingsRate(savings, monthlyIncome) {
    // Tasa de ahorro
  }
  
  calculateFinancialHealthScore(ratios) {
    // Puntuación de salud financiera (0-100)
  }
  
  generateRecommendations(analysis) {
    // Recomendaciones basadas en análisis
  }
}
```

#### 3. Semáforo de Salud Financiera
```javascript
class HealthIndicator {
  evaluateFinancialHealth(income, expenses, debts, savings) {
    // Algoritmo de evaluación
    // Retorna: 'excellent' | 'good' | 'warning' | 'danger'
  }
  
  getRecommendationsByHealth(healthStatus) {
    // Recomendaciones específicas por estado
  }
}
```

## 🎨 Adaptación de Estilos

### Nuevos Colores para el Asesor
```scss
// Expandir paleta existente con:
$income-green: #22c55e;     // Verde para ingresos
$expense-red: #ef4444;      // Rojo para gastos
$savings-blue: #3b82f6;     // Azul para ahorros
$investment-purple: #8b5cf6; // Morado para inversiones

// Estados de salud financiera
$health-excellent: #059669;  // Verde excelente
$health-good: #10b981;       // Verde bueno
$health-warning: #f59e0b;    // Amarillo advertencia
$health-danger: #ef4444;     // Rojo peligro
```

### Nuevos Componentes UI
```scss
// Tarjetas de ingresos
.income-card {
  border-left: 4px solid $income-green;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}

// Indicadores de salud
.health-indicator {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  
  &.excellent { color: $health-excellent; }
  &.good { color: $health-good; }
  &.warning { color: $health-warning; }
  &.danger { color: $health-danger; }
}

// Semáforo visual
.financial-traffic-light {
  display: flex;
  gap: $spacing-2;
  
  .light {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    opacity: 0.3;
    
    &.active { opacity: 1; }
    &.green { background-color: $health-excellent; }
    &.yellow { background-color: $health-warning; }
    &.red { background-color: $health-danger; }
  }
}
```

## 📅 Cronograma Sugerido

### Semana 1-2: Configuración de Ingresos
- Implementar IncomeManager
- Crear UI para configuración de ingresos
- Validaciones y almacenamiento
- Tests básicos

### Semana 3-4: Gestión de Gastos
- Adaptar sistema de productos
- Implementar categorización
- Migrar funciones de estadísticas básicas

### Semana 5-6: Dashboard y Análisis
- Implementar FinancialAnalyzer
- Crear componentes de visualización
- Sistema de ratios y métricas

### Semana 7-8: Reportes y Salud Financiera
- Migrar y expandir sistema PDF
- Implementar semáforo de salud
- Sistema de recomendaciones básico

## 🔗 Referencias Cruzadas

### Desde la Calculadora
- **Repositorio**: [calculadora-cuotas](https://github.com/tuusuario/calculadora-cuotas)
- **Funciones clave**: Ver `reference/calculadora-functions.md`
- **Estilos base**: Ver `reference/calculadora-styles.md`

### Documentación de Apoyo
- **Chart.js**: Para gráficos avanzados de análisis financiero
- **jsPDF**: Para reportes expandidos con nuevas métricas
- **EmailJS**: Para notificaciones de salud financiera

## ⚡ Consejos de Migración

1. **Mantener compatibilidad**: Los datos existentes deben migrar sin problemas
2. **Iterativo**: Implementar funcionalidades de manera incremental
3. **Testing**: Probar cada migración antes de continuar
4. **Documentar**: Actualizar documentación con cada cambio
5. **Performance**: Optimizar nuevas funcionalidades desde el inicio
