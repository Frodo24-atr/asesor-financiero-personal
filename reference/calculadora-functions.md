# Funciones Clave de la Calculadora de Cuotas

Este documento contiene las funciones principales de la calculadora que pueden ser reutilizadas en el asesor financiero personal.

## Gestión de Productos y Cuotas

### addProduct()
```javascript
addProduct() {
  // Función para agregar productos con cálculo de cuotas
  // Maneja validación de formularios y cálculos matemáticos
}
```

### deleteProduct(index)
```javascript
deleteProduct(index) {
  // Elimina un producto con confirmación modal
  // Incluye animaciones y actualización de estadísticas
}
```

### calculateInstallments(price, installments, interestRate)
```javascript
calculateInstallments(price, installments, interestRate) {
  // Cálculo matemático de cuotas con interés
  // Fórmula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
}
```

## Gestión de Estadísticas

### updateStats()
```javascript
updateStats() {
  // Calcula estadísticas generales:
  // - Total a pagar
  // - Promedio de cuotas
  // - Número de productos
  // - Proyección mensual
}
```

### updateChart()
```javascript
updateChart() {
  // Actualiza gráficos con Chart.js
  // Soporte para gráficos de barras y líneas
  // Filtros por período de tiempo
}
```

## Generación de PDF

### generatePDF()
```javascript
generatePDF() {
  // Genera reportes PDF con jsPDF
  // Diseño minimalista y elegante
  // Sin caracteres especiales para máxima compatibilidad
}
```

### addPDFHeader(doc)
```javascript
addPDFHeader(doc) {
  // Agrega encabezado profesional al PDF
  // Colores corporativos y tipografía limpia
}
```

### addPDFFooter(doc, pageNumber, totalPages)
```javascript
addPDFFooter(doc, pageNumber, totalPages) {
  // Pie de página con numeración
  // Fecha de generación del reporte
}
```

## Gestión de Datos

### saveToLocalStorage()
```javascript
saveToLocalStorage() {
  // Persistencia de datos en localStorage
  // Manejo de errores y fallbacks
}
```

### loadFromLocalStorage()
```javascript
loadFromLocalStorage() {
  // Carga de datos guardados
  // Validación y migración de formatos antiguos
}
```

## Utilidades de UI

### showModal(content, type)
```javascript
showModal(content, type) {
  // Sistema de modales reutilizable
  // Tipos: success, error, warning, info
}
```

### showLoading() / hideLoading()
```javascript
showLoading() {
  // Indicadores de carga con spinner animado
}
hideLoading() {
  // Oculta indicadores de carga
}
```

## Validaciones

### validatePositiveNumber(value)
```javascript
validatePositiveNumber(value) {
  // Validación de números positivos
  // Manejo de formatos de entrada
}
```

### formatCurrency(amount)
```javascript
formatCurrency(amount) {
  // Formateo de moneda para mostrar
  // Soporte para diferentes locales
}
```

## Notas de Migración

1. **Adaptación**: Estas funciones pueden adaptarse para manejar ingresos y gastos en lugar de solo productos.
2. **Extensión**: El sistema de estadísticas puede expandirse para incluir ratios financieros.
3. **Reutilización**: Las funciones de PDF y UI son directamente reutilizables.
4. **Mejoras**: Considerar TypeScript para mejor tipado y mantenibilidad.
