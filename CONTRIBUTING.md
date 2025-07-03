# Guía de Contribución

¡Gracias por tu interés en contribuir al Asesor Financiero Personal! 🎉

## 🚀 Cómo Empezar

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Git

### Configuración del Entorno

1. **Fork el repositorio**

   ```bash
   # Haz fork desde GitHub UI
   ```

2. **Clonar tu fork**

   ```bash
   git clone https://github.com/tu-usuario/asesor-financiero-personal.git
   cd asesor-financiero-personal
   ```

3. **Instalar dependencias**

   ```bash
   npm install
   ```

4. **Configurar remote upstream**

   ```bash
   git remote add upstream https://github.com/usuario-original/asesor-financiero-personal.git
   ```

5. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

## 📝 Flujo de Trabajo

### 1. Crear una nueva rama

```bash
git checkout -b feature/nombre-de-la-feature
```

### 2. Hacer cambios

- Escribe código limpio y bien documentado
- Sigue las convenciones de estilo existentes
- Agrega tests si es aplicable

### 3. Verificar código

```bash
npm run lint     # Verificar ESLint
npm run format   # Formatear con Prettier
npm run build    # Verificar que compile
```

### 4. Commit

```bash
git add .
git commit -m "feat: descripción clara del cambio"
```

### 5. Push y Pull Request

```bash
git push origin feature/nombre-de-la-feature
```

Luego crea un Pull Request desde GitHub.

## 📋 Tipos de Contribuciones

### 🐛 Reportar Bugs

- Usa el template de issue para bugs
- Incluye pasos para reproducir
- Especifica el navegador y OS
- Agrega screenshots si es útil

### ✨ Nuevas Features

- Abre un issue primero para discutir la idea
- Espera feedback antes de empezar a codear
- Sigue el roadmap del proyecto

### 📚 Documentación

- Mejoras en README
- Documentación de código
- Guías de usuario
- Ejemplos de uso

### 🎨 Mejoras de UI/UX

- Propuestas de diseño
- Mejoras de accesibilidad
- Optimizaciones de performance

## 🎯 Estándares de Código

### TypeScript

- Usar tipos explícitos siempre que sea posible
- Evitar `any` - usar tipos específicos
- Documentar funciones complejas con JSDoc

```typescript
/**
 * Calcula el ratio de endeudamiento
 * @param income - Ingreso mensual total
 * @param expenses - Gastos mensuales totales
 * @returns Ratio como porcentaje (0-100)
 */
function calculateDebtRatio(income: number, expenses: number): number {
  return income > 0 ? (expenses / income) * 100 : 0;
}
```

### SCSS

- Usar variables CSS para colores y espaciado
- Seguir metodología BEM para nombres de clases
- Mantener especificidad baja

```scss
.financial-card {
  &__header {
    // estilos del header
  }

  &__content {
    // estilos del contenido
  }

  &--highlighted {
    // modificador para destacar
  }
}
```

### Estructura de Archivos

```
src/
├── components/          # Componentes reutilizables (futuro)
├── scripts/
│   ├── app.ts          # Lógica principal
│   ├── utils/          # Utilidades
│   └── types/          # Tipos TypeScript
├── styles/
│   ├── main.scss       # Estilos principales
│   ├── components/     # Estilos de componentes
│   └── utilities/      # Utilidades CSS
└── index.html
```

## 🧪 Testing

### Para nuevas features:

- Agregar tests unitarios si es aplicable
- Verificar que no rompan funcionalidad existente
- Probar en diferentes navegadores

### Manual Testing Checklist:

- [ ] Funciona en Chrome, Firefox, Safari
- [ ] Responsive en mobile y desktop
- [ ] Tema oscuro y claro funcionan
- [ ] localStorage persiste datos
- [ ] PDF se genera correctamente

## 📖 Convenciones de Commit

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato (no afectan lógica)
refactor: refactorización de código
test: agregar o modificar tests
chore: cambios en build, deps, etc.
```

Ejemplos:

```
feat: agregar gráfico de gastos por categoría
fix: corregir cálculo de ratio de endeudamiento
docs: actualizar guía de instalación
style: mejorar espaciado en formularios
```

## 🔍 Proceso de Review

### Para Maintainers:

1. Verificar que cumple con estándares
2. Probar funcionalidad manualmente
3. Revisar impacto en performance
4. Verificar documentación actualizada

### Para Contributors:

- Responder a feedback constructivamente
- Hacer cambios solicitados
- Mantener commits limpios (squash si es necesario)

## 🏷️ Labels de Issues

- `bug` - Bugs reportados
- `enhancement` - Nuevas features
- `documentation` - Mejoras de docs
- `good first issue` - Ideal para principiantes
- `help wanted` - Se busca ayuda
- `priority: high` - Alta prioridad
- `priority: low` - Baja prioridad

## 🎁 Reconocimientos

Los contributors aparecerán en:

- README principal
- Página de créditos en la app
- Releases notes

## 📞 Contacto

- **Issues**: Para bugs y features
- **Discussions**: Para preguntas generales
- **Email**: para temas privados

## 📄 Código de Conducta

Seguimos el [Contributor Covenant](https://www.contributor-covenant.org/). Esperamos un ambiente respetuoso y constructivo.

¡Gracias por contribuir! 🙏
