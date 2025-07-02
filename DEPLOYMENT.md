# 🚀 Guía de Despliegue - Asesor Financiero Personal

## Opciones de Despliegue

### 1. GitHub Pages (Recomendado para demos)

#### Configuración automática con GitHub Actions:

1. **Crear workflow de GitHub Actions:**
   - Crear `.github/workflows/deploy.yml`
   - Se configurará automáticamente para builds de Vite

2. **Configurar GitHub Pages:**
   - Ve a Settings → Pages en tu repositorio
   - Selecciona "GitHub Actions" como source
   - El deploy se ejecutará automáticamente en cada push a main

#### Configuración manual:

```bash
# Build del proyecto
npm run build

# Deploy a gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

### 2. Vercel (Recomendado para producción)

1. **Importar desde GitHub:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa el repositorio

2. **Configuración automática:**
   - Vercel detecta automáticamente Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### 3. Netlify

1. **Deploy desde GitHub:**
   - Ve a [netlify.com](https://netlify.com)
   - Conecta tu repositorio de GitHub

2. **Configuración:**
   - Build command: `npm run build`
   - Publish directory: `dist`

### 4. Deploy Manual

```bash
# Build para producción
npm run build

# Subir carpeta dist/ a tu servidor web
# Asegúrate de que el servidor soporte SPA routing
```

## Configuraciones Específicas

### Vite Build Configuration

El archivo `vite.config.ts` ya está configurado para producción:

```typescript
export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  // ... otras configuraciones
})
```

### Variables de Entorno

Para EmailJS y otras APIs:

```bash
# .env.production
VITE_EMAILJS_PUBLIC_KEY=tu_clave_publica
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
```

## GitHub Actions Workflow

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run lint
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Configuración de Dominio Personalizado

### En GitHub Pages:
1. Agregar archivo `CNAME` en `/public/` con tu dominio
2. Configurar DNS A records apuntando a GitHub Pages IPs
3. Habilitar HTTPS en configuración del repositorio

### En Vercel/Netlify:
1. Agregar dominio en dashboard
2. Configurar DNS según las instrucciones
3. SSL se configura automáticamente

## Optimizaciones para Producción

### 1. Lazy Loading
```typescript
// Para futuras rutas
const Dashboard = lazy(() => import('./components/Dashboard'))
```

### 2. Code Splitting
```typescript
// Vite hace esto automáticamente
import('./modules/charts').then(module => {
  // Cargar charts solo cuando sea necesario
})
```

### 3. Compresión
```typescript
// vite.config.ts
import { compression } from 'vite-plugin-compression'

export default defineConfig({
  plugins: [compression()]
})
```

## Monitoreo y Analytics

### Google Analytics
```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

### Sentry para errores
```typescript
import * as Sentry from "@sentry/browser"

Sentry.init({
  dsn: "YOUR_DSN"
})
```

## Checklist Pre-Deploy

- [ ] Tests passing (`npm run lint`)
- [ ] Build exitoso (`npm run build`)
- [ ] Assets optimizados
- [ ] Variables de entorno configuradas
- [ ] README actualizado
- [ ] CHANGELOG actualizado
- [ ] Tags de versión creados

## Rollback

En caso de problemas:

```bash
# Revertir a commit anterior
git revert HEAD

# O rollback en Vercel/Netlify
# Usar dashboard para revertir deployment
```

## URLs de Ejemplo

- **GitHub Pages**: `https://tu-usuario.github.io/asesor-financiero-personal`
- **Vercel**: `https://asesor-financiero-personal.vercel.app`
- **Netlify**: `https://asesor-financiero-personal.netlify.app`
