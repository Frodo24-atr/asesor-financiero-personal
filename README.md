# 💰 Asesor Financiero Personal

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5+-646CFF)](https://vitejs.dev/)

Una herramienta inteligente y moderna para la gestión financiera personal con análisis avanzado de ingresos, gastos y recomendaciones automáticas.

🚀 **Aplicación en vivo**: [https://Frodo24-atr.github.io/asesor-financiero-personal](https://Frodo24-atr.github.io/asesor-financiero-personal)

![Asesor Financiero Personal Demo](https://via.placeholder.com/800x400/2563eb/ffffff?text=Asesor+Financiero+Personal)

## 🌟 Características Principales

### ✅ Implementadas

- 📊 **Dashboard Financiero Interactivo**: Visualización clara de tu situación financiera
- 💼 **Configuración de Ingresos**: Soporte para ingresos quincenales y mensuales
- � **Gestión de Gastos**: 11 categorías predefinidas con filtros avanzados
- �📈 **Análisis de Ratios**: Cálculo automático de ratios de endeudamiento
- 🚦 **Semáforo de Salud Financiera**: Indicadores visuales de tu estado financiero
- 📋 **Reportes PDF Elegantes**: Exportación de análisis en formato PDF profesional
- 🎨 **Tema Oscuro/Claro**: Interfaz adaptable con cambio de tema
- 💾 **Persistencia de Datos**: Guardado automático en localStorage
- 🔔 **Sistema de Notificaciones**: Alertas visuales para acciones importantes

### 🚧 En Desarrollo

- 📈 **Gráficos Interactivos**: Visualizaciones con Chart.js
- 🎯 **Metas Financieras**: Planificación y seguimiento de objetivos
- 📧 **Notificaciones Email**: Envío automático de reportes
- 🤖 **Recomendaciones IA**: Sugerencias inteligentes personalizadas

## � Demo en Vivo

[Ver Demo](https://tu-usuario.github.io/asesor-financiero-personal)

## 📦 Instalación

### Prerrequisitos

- Node.js 16+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/asesor-financiero-personal.git
cd asesor-financiero-personal
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

4. **Abrir en el navegador**

```
http://localhost:3000
```

## 🛠️ Scripts Disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Construye la aplicación para producción
npm run preview   # Previsualiza la build de producción
npm run lint      # Ejecuta ESLint para verificar el código
npm run format    # Formatea el código con Prettier
```

## 🎯 Uso

### 1. Configurar Ingresos

- Ve a la pestaña "💰 Ingresos"
- Selecciona la frecuencia (mensual o quincenal)
- Ingresa el monto de tus ingresos
- Opcionalmente, agrega ingresos adicionales
- Haz clic en "💾 Guardar Configuración"

### 2. Registrar Gastos

- Ve a la pestaña "💸 Gastos"
- Llena el formulario con los detalles del gasto
- Selecciona la categoría y frecuencia
- Define la prioridad (esencial, importante, opcional)
- Haz clic en "➕ Agregar Gasto"

### 3. Ver Análisis

- El dashboard se actualiza automáticamente
- Revisa tu puntuación de salud financiera
- Lee las recomendaciones personalizadas
- Filtra gastos por categoría o prioridad

### 4. Exportar Reporte

- Haz clic en "📄 Exportar Reporte"
- Se generará un PDF con tu análisis completo
- Incluye resumen financiero y recomendaciones

## 🏗️ Tecnologías

- **Frontend**: TypeScript, HTML5, SCSS
- **Build Tool**: Vite
- **PDF Generation**: jsPDF
- **Email Service**: EmailJS (próximamente)
- **Charts**: Chart.js (próximamente)
- **Styling**: SCSS con CSS Variables
- **Code Quality**: ESLint + Prettier

## � Estructura del Proyecto

```
asesor-financiero-personal/
├── src/
│   ├── index.html          # Página principal
│   ├── scripts/
│   │   └── app.ts          # Lógica principal de la aplicación
│   ├── styles/
│   │   └── main.scss       # Estilos principales
│   └── types/
│       └── global.d.ts     # Declaraciones TypeScript
├── reference/              # Documentación de referencia
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Verificar código
npm run lint

# Formatear código
npm run format
```

## 📊 Características Técnicas

### Gestión de Estado

- Persistencia automática en localStorage
- Manejo de errores y validación de datos
- Carga y migración de datos

### Interfaz de Usuario

- Diseño responsive mobile-first
- Tema oscuro/claro
- Animaciones suaves con CSS
- Sistema de notificaciones

### Análisis Financiero

- Cálculo de ratios de endeudamiento
- Sistema de puntuación (0-100)
- Recomendaciones personalizadas
- Categorización automática de gastos

### Generación de Reportes

- PDFs profesionales y limpios
- Sin caracteres especiales para compatibilidad
- Resumen financiero completo
- Diseño minimalista

## 🔮 Roadmap

### Versión 1.1

- [ ] Gráficos interactivos con Chart.js
- [ ] Sistema de metas financieras
- [ ] Exportación de datos a CSV/Excel

### Versión 1.2

- [ ] Notificaciones por email
- [ ] Análisis predictivo
- [ ] Comparación de períodos

### Versión 2.0

- [ ] Integración con bancos
- [ ] App móvil (PWA)
- [ ] Recomendaciones con IA

## 📝 Changelog

### v1.0.0 (2025-07-02)

- ✅ Lanzamiento inicial
- ✅ Dashboard financiero completo
- ✅ Gestión de ingresos y gastos
- ✅ Análisis de salud financiera
- ✅ Generación de reportes PDF
- ✅ Tema oscuro/claro
- ✅ Persistencia de datos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [Vite](https://vitejs.dev/) por la excelente experiencia de desarrollo
- [TypeScript](https://www.typescriptlang.org/) por el tipado estático
- [jsPDF](https://github.com/MrRio/jsPDF) por la generación de PDFs
- [Chart.js](https://www.chartjs.org/) para las futuras visualizaciones

## 📞 Contacto

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu@email.com

---

**⭐ ¡Dale una estrella si este proyecto te ha sido útil!** 5. **Exportar Reportes**: Genera reportes PDF profesionales 6. **Configurar Alertas**: Recibe notificaciones por email sobre tu salud financiera

## 🔗 Proyecto Relacionado

Este proyecto es una evolución de la [Calculadora de Cuotas](https://github.com/tuusuario/calculadora-cuotas), expandiendo las funcionalidades hacia un asesor financiero completo.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- GitHub: [@tuusuario](https://github.com/tuusuario)
- Email: tu.email@dominio.com

---

⭐ **¡Si te gusta este proyecto, no olvides darle una estrella!** ⭐
