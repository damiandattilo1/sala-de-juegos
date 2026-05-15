# Guía de Deploy — Sala de Juegos

## Información del proyecto

| Campo           | Valor                              |
|-----------------|------------------------------------|
| Proyecto        | `sala-de-juegos-e1527`                         |
| URL producción  | https://sala-de-juegos-e1527.web.app           |
| Hosting         | Firebase Hosting                   |
| Build output    | `dist/tp-sala-juegos/browser`      |
| Rama principal  | `main`                             |

---

## Requisitos previos

| Herramienta    | Versión mínima | Instalación                              |
|----------------|----------------|------------------------------------------|
| Node.js        | 18+            | https://nodejs.org                       |
| Angular CLI    | 17+            | `npm install -g @angular/cli`            |
| Firebase CLI   | 13+            | `npm install -g firebase-tools`          |

---

## Primera vez (configuración inicial)

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Iniciar sesión en Firebase
```bash
firebase login --no-localhost
```
Seguir el link que aparece en consola, autenticarse con la cuenta Google del proyecto y pegar el código de autorización.

### 3. Verificar acceso al proyecto
```bash
firebase projects:list
```
Debe aparecer `sala-de-juegos-e1527` en la lista.

---

## Deploy manual

### Linux / macOS (Bash)
```bash
# Deploy completo
./deploy.sh

# Sin correr tests
./deploy.sh --skip-tests

# Simular sin desplegar (dry run)
./deploy.sh --dry-run
```

### Windows (PowerShell)
```powershell
# Habilitar ejecución de scripts (solo primera vez, como Administrador)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Deploy completo
.\deploy.ps1

# Sin correr tests
.\deploy.ps1 -SkipTests

# Simular sin desplegar (dry run)
.\deploy.ps1 -DryRun
```

### Comandos manuales paso a paso
```bash
# 1. Instalar dependencias
npm ci

# 2. Build de producción
ng build --configuration=production

# 3. Deploy
firebase deploy --only hosting
```

---

## Qué hace el script de deploy

```
1. Verifica dependencias (node, npm, ng, firebase)
2. Verifica sesión activa en Firebase CLI
3. Lee el proyecto desde .firebaserc
4. Instala dependencias (npm ci)
5. Ejecuta tests (ChromeHeadless) — omitible con --skip-tests / -SkipTests
6. Compila para producción (ng build --configuration=production)
7. Despliega en Firebase Hosting (firebase deploy --only hosting)
```

---

## Archivos de configuración

### `.firebaserc`
Define el proyecto Firebase activo:
```json
{
  "projects": {
    "default": "sala-de-juegos-e1527"
  }
}
```

### `firebase.json`
Configura Firebase Hosting:
```json
{
  "hosting": {
    "public": "dist/tp-sala-juegos/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

> **Importante:** La regla `rewrites` redirige todas las rutas al `index.html`, lo que permite que el router de Angular maneje la navegación en producción.

---

## Variables de entorno

Los valores de Firebase están en `src/environments/`:

| Archivo                   | Uso                         |
|---------------------------|-----------------------------|
| `environment.ts`          | Desarrollo (`ng serve`)     |
| `environment.prod.ts`     | Producción (`ng build`)     |

Para cambiar el proyecto Firebase, actualizar ambos archivos con los valores de la consola Firebase.

---

## Verificar el deploy

Después de un deploy exitoso, la consola muestra:

```
✔  Deploy complete!
Hosting URL: https://sala-de-juegos-e1527.web.app
```

Para ver versiones previas y hacer rollback:
```bash
# Ver historial de releases
firebase hosting:releases:list

# Ver canales activos
firebase hosting:channel:list
```

---

## Solución de problemas

| Error | Solución |
|-------|----------|
| `command not found: firebase` | `npm install -g firebase-tools` |
| `command not found: ng` | `npm install -g @angular/cli` |
| `Error: Failed to list Firebase projects` | Ejecutar `firebase login --no-localhost` con la cuenta correcta |
| `The build failed` | Revisar errores de TypeScript con `ng build` |
| Rutas 404 en producción | Verificar que `firebase.json` tenga el rewrite `**` → `/index.html` |
| Página en blanco en producción | Verificar que `"public"` en `firebase.json` apunta a `dist/tp-sala-juegos/browser` |
