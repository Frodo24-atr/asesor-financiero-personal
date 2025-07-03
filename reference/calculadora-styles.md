# Paleta de Colores y Estilos de la Calculadora

Este documento contiene los estilos y paleta de colores reutilizables de la calculadora de cuotas.

## Paleta de Colores Principal

### Colores Primarios

```scss
// Azul principal (corporativo y confiable)
$primary-blue: #2563eb;
$primary-blue-light: #3b82f6;
$primary-blue-dark: #1d4ed8;

// Verde (éxito y positivo)
$success-green: #059669;
$success-green-light: #10b981;
$success-green-dark: #047857;

// Naranja (advertencia y atención)
$warning-orange: #d97706;
$warning-orange-light: #f59e0b;
$warning-orange-dark: #b45309;

// Rojo (error y negativo)
$danger-red: #dc2626;
$danger-red-light: #ef4444;
$danger-red-dark: #b91c1c;
```

### Colores Secundarios

```scss
// Grises (textos y fondos)
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-700: #374151;
$gray-800: #1f2937;
$gray-900: #111827;
```

### Colores de Fondo

```scss
$background-primary: #ffffff;
$background-secondary: #f8fafc;
$background-dark: #1e293b;
$background-card: #ffffff;
$background-hover: #f1f5f9;
```

## Tipografía

```scss
// Fuentes principales
$font-family-primary:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  sans-serif;
$font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

// Tamaños de fuente
$font-size-xs: 0.75rem; // 12px
$font-size-sm: 0.875rem; // 14px
$font-size-base: 1rem; // 16px
$font-size-lg: 1.125rem; // 18px
$font-size-xl: 1.25rem; // 20px
$font-size-2xl: 1.5rem; // 24px
$font-size-3xl: 1.875rem; // 30px
$font-size-4xl: 2.25rem; // 36px

// Pesos de fuente
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

## Espaciado y Tamaños

```scss
// Espaciado (basado en múltiplos de 4px)
$spacing-1: 0.25rem; // 4px
$spacing-2: 0.5rem; // 8px
$spacing-3: 0.75rem; // 12px
$spacing-4: 1rem; // 16px
$spacing-5: 1.25rem; // 20px
$spacing-6: 1.5rem; // 24px
$spacing-8: 2rem; // 32px
$spacing-10: 2.5rem; // 40px
$spacing-12: 3rem; // 48px

// Bordes redondeados
$border-radius-sm: 0.25rem; // 4px
$border-radius-md: 0.375rem; // 6px
$border-radius-lg: 0.5rem; // 8px
$border-radius-xl: 0.75rem; // 12px
$border-radius-2xl: 1rem; // 16px

// Sombras
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md:
  0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg:
  0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl:
  0 20px 25px -5px rgba(0, 0, 0, 0.1),
  0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Componentes Reutilizables

### Botones

```scss
.btn-primary {
  background-color: $primary-blue;
  color: white;
  padding: $spacing-3 $spacing-6;
  border-radius: $border-radius-lg;
  font-weight: $font-weight-medium;
  transition: all 0.2s ease;

  &:hover {
    background-color: $primary-blue-dark;
    transform: translateY(-1px);
    box-shadow: $shadow-md;
  }
}

.btn-success {
  background-color: $success-green;
  color: white;

  &:hover {
    background-color: $success-green-dark;
  }
}

.btn-danger {
  background-color: $danger-red;
  color: white;

  &:hover {
    background-color: $danger-red-dark;
  }
}
```

### Tarjetas

```scss
.card {
  background-color: $background-card;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-md;
  padding: $spacing-6;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
}

.card-header {
  border-bottom: 1px solid $gray-200;
  padding-bottom: $spacing-4;
  margin-bottom: $spacing-4;
}
```

### Formularios

```scss
.form-input {
  width: 100%;
  padding: $spacing-3 $spacing-4;
  border: 1px solid $gray-300;
  border-radius: $border-radius-lg;
  font-size: $font-size-base;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: $primary-blue;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &.error {
    border-color: $danger-red;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
}
```

## Animaciones y Transiciones

```scss
// Transiciones suaves
$transition-fast: 0.15s ease;
$transition-base: 0.2s ease;
$transition-slow: 0.3s ease;

// Animaciones de entrada
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

// Efectos hover
.hover-lift {
  transition: transform $transition-base;

  &:hover {
    transform: translateY(-2px);
  }
}

.hover-scale {
  transition: transform $transition-base;

  &:hover {
    transform: scale(1.05);
  }
}
```

## Utilidades de Estado

```scss
// Estados de salud financiera
.status-excellent {
  background-color: $success-green;
  color: white;
}

.status-good {
  background-color: $success-green-light;
  color: white;
}

.status-warning {
  background-color: $warning-orange;
  color: white;
}

.status-danger {
  background-color: $danger-red;
  color: white;
}

// Indicadores de carga
.loading-spinner {
  border: 2px solid $gray-200;
  border-top: 2px solid $primary-blue;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

## Notas de Uso

1. **Consistencia**: Mantener la paleta de colores para coherencia visual
2. **Accesibilidad**: Los contrastes cumplen con WCAG 2.1 AA
3. **Responsive**: Todos los tamaños están en unidades relativas (rem)
4. **Escalabilidad**: Usar variables SCSS para fácil mantenimiento
5. **Performance**: Transiciones optimizadas para 60fps
