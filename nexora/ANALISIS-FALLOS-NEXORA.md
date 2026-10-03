# 📋 Reporte de Auditoría: Fallos, Riesgos y Deuda Técnica en Nexora

Este documento recopila de forma detallada y categorizada todas las debilidades, inconsistencias arquitectónicas, riesgos de seguridad y oportunidades de mejora identificadas en el código base de **Nexora**.

---

## 🚦 Resumen de Severidad

| Nivel | Cantidad | Descripción |
| :--- | :---: | :--- |
| 🔴 **Crítica / Alta** | 4 | Fallos que afectan la experiencia del usuario, persistencia o rompen la arquitectura central. |
| 🟠 **Media** | 3 | Deuda técnica que dificulta la escalabilidad, el mantenimiento y la velocidad de carga. |
| 🟡 **Baja / Mejora** | 2 | Oportunidades de optimización de código y buenas prácticas. |

---

## 🔴 1. Fallos de Severidad Crítica y Alta

### 1.1. Pérdida de sesión al recargar la página (F5)
- **Ubicación**: [`src/App.tsx`](file:///d:/React/nexora/src/App.tsx#L10-L25)
- **Problema**: 
  La autenticación se gestiona mediante un estado en memoria volátil:
  ```tsx
  const [authenticated, setAuthenticated] = useState(false)
  ```
  Al montar la aplicación en el navegador, `authenticated` se inicializa siempre en `false`. Si el usuario ya inició sesión y presiona `F5` o actualiza la pestaña, el estado vuelve a `false` y es expulsado inmediatamente a la pantalla de Login, ignorando que el token de sesión sigue existiendo en el almacenamiento local.
- **Impacto**: Experiencia de usuario frustrante; no hay persistencia de sesión real.
- **Solución recomendada**:
  Inicializar el estado verificando la presencia y validez del token en `localStorage`:
  ```tsx
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('nexora.auth.token') || localStorage.getItem('auth_token'))
  })
  ```

---

### 1.2. Falta de Interceptor de Autenticación en Cliente HTTP
- **Ubicación**: [`src/lib/api.ts`](file:///d:/React/nexora/src/lib/api.ts)
- **Problema**:
  La instancia global de Axios está configurada de forma básica:
  ```ts
  export const api = axios.create({
    baseURL: (import.meta.env.VITE_API_REST as string | undefined) || 'http://localhost:8080',
  })
  ```
  No cuenta con un interceptor de peticiones (`api.interceptors.request.use`) que inyecte automáticamente el encabezado `Authorization: Bearer <token>`.
- **Impacto**:
  - Varias peticiones hacia endpoints protegidos se envían sin credenciales.
  - Otras vistas intentan construir encabezados manualmente de forma ad-hoc y repetitiva.
  - Si el token expira (código HTTP `401`), no existe un interceptor de respuesta para redirigir automáticamente al login o limpiar credenciales.
- **Solución recomendada**:
  Configurar interceptores de petición y respuesta en `src/lib/api.ts`:
  ```ts
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nexora.auth.token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('nexora.auth.token')
        window.location.reload()
      }
      return Promise.reject(error)
    }
  )
  ```

---

### 1.3. Ruptura de la Arquitectura Hexagonal (*Architecture Drift*)
- **Ubicaciones principales**:
  1. [`src/features/personas/ui/organisms/registro-persona-panel.tsx`](file:///d:/React/nexora/src/features/personas/ui/organisms/registro-persona-panel.tsx#L21)
  2. [`src/features/login/ui/Login.tsx`](file:///d:/React/nexora/src/features/login/ui/Login.tsx)
  3. [`src/features/recursos/`](file:///d:/React/nexora/src/features/recursos/)
- **Problema**:
  El proyecto definió como regla obligatoria en [`src/agent.md`](file:///d:/React/nexora/src/agent.md) la arquitectura en capas concéntricas:
  $$\text{ui/} \longrightarrow \text{application/} \longrightarrow \text{domain/} \longleftarrow \text{infrastructure/}$$
  Sin embargo, varios módulos violan esta regla:
  - **`features/personas`**: No tiene carpetas `application/` ni `infrastructure/`. El componente visual `registro-persona-panel.tsx` invoca `await api.post('/persons', payload)` directamente.
  - **`features/login`**: Contiene únicamente un archivo monolítico `Login.tsx` de más de 400 líneas que agrupa UI, estado, validaciones, llamada a la API y persistencia en disco.
  - **`features/recursos`**: No tiene carpeta `domain/`, declarando las entidades y tipos directamente dentro de `infrastructure/api-module-repository.ts`.
- **Impacto**: Acoplamiento directo de la interfaz gráfica a Axios y a URLs de red; imposibilidad de sustituir o mockear clientes de red en estos módulos.

---

### 1.4. Ausencia Total de Pruebas Automatizadas (*Zero Automated Tests*)
- **Ubicación**: Todo el proyecto (`package.json`)
- **Problema**:
  No existe **ni un solo archivo de prueba** (`*.test.ts`, `*.spec.ts`) en todo el repositorio. Tampoco hay librerías de testing instaladas (`vitest`, `jest`, `@testing-library/react`).
- **Impacto**:
  - Aunque la arquitectura hexagonal se creó específicamente para permitir probar entidades y casos de uso en aislamiento sin navegador, actualmente no se aprovecha esta ventaja.
  - Cada cambio o refactorización conlleva riesgo de regresión silenciosa que solo se detecta manualmente.

---

## 🟠 2. Fallos de Severidad Media

### 2.1. Navegación y Enrutamiento Simulado sin Historial Web ni URLs
- **Ubicación**: [`src/features/dashboard/dashboard-page.tsx`](file:///d:/React/nexora/src/features/dashboard/dashboard-page.tsx#L44-L70)
- **Problema**:
  La navegación entre módulos no utiliza un router web (como React Router o TanStack Router), sino una cadena anidada de 10 operadores ternarios evaluando el estado local `activeId`:
  ```tsx
  {activeId === 'home' ? (
    <HomeOverview />
  ) : activeId === 'sedes' ? (
    <SedesView />
  ) : activeId === 'usuarios' ? (
    <UsuariosPage />
  ...
  ```
- **Impacto**:
  - **No hay Deep Linking**: No es posible compartir una URL directa a una sección (ej. `/reservas` o `/habitaciones`).
  - **Historial roto**: El botón de retroceder o avanzar del navegador (`history.back()`) no funciona dentro de las páginas del panel.
  - **Pérdida de estado**: Al cambiar de pestaña, el componente anterior se desmonta por completo del árbol de React, destruyendo cualquier estado en progreso en formularios o filtros no guardados.

---

### 2.2. Disparidad y Ambigüedad de Claves de Autenticación
- **Ubicación**: [`src/shared/auth-storage.ts`](file:///d:/React/nexora/src/shared/auth-storage.ts#L1-L3)
- **Problema**:
  Conviven al menos 3 nombres de clave distintos en `localStorage` para almacenar la identidad del usuario:
  - `'nexora.auth.token'` (guardado por `Login.tsx`)
  - `'auth_token'` (requerido por el payload de reservas)
  - `'auth_user'` (usado como respaldo)
  Debido a esto, el archivo `auth-storage.ts` tuvo que crear funciones complejas con decodificación JWT manual y múltiples `try/catch` encadenados para intentar adivinar en qué clave se encuentra el usuario actual.
- **Impacto**: Fragilidad ante cambios en el backend y riesgo de que `created_by` se guarde con valores de respaldo (`'admin'` o `'user_system'`) en vez de la identidad real del operador.

---

### 2.3. Componentes Monolíticos Sobrecargados (*God Components*)
- **Ubicaciones principales**:
  - [`src/features/cama3d/ui/organisms/asignar-cama-card.tsx`](file:///d:/React/nexora/src/features/cama3d/ui/organisms/asignar-cama-card.tsx) (40.3 KB, ~1.000 líneas)
  - [`src/features/sedes/ui/organisms/sedes-panel.tsx`](file:///d:/React/nexora/src/features/sedes/ui/organisms/sedes-panel.tsx) (19.2 KB)
  - [`src/features/tema/ui/organisms/custom-theme-page.tsx`](file:///d:/React/nexora/src/features/tema/ui/organisms/custom-theme-page.tsx) (19.1 KB)
- **Problema**:
  Dichos archivos acumulan en un solo lugar:
  1. Configuración y escena 3D / Three.js.
  2. Estado local de múltiples formularios.
  3. Control de modales y alertas.
  4. Mapeo y formateo de datos.
- **Impacto**: Viola el principio de Responsabilidad Única (**SRP**); alta dificultad para dar mantenimiento y mayor probabilidad de introducir *bugs* al editar.

---

## 🟡 3. Fallos de Severidad Baja / Optimización

### 3.1. Paquete Inicial Pesado sin *Code Splitting* (Lazy Loading)
- **Ubicación**: `dist/assets/index-*.js` (1.6 MB)
- **Problema**:
  El empaquetado de Vite incluye dependencias muy pesadas (como `three`, `@react-three/fiber` y `@react-three/drei`) dentro del archivo JavaScript principal que se descarga en la primera visita.
- **Impacto**:
  Un usuario que solo ingresa a iniciar sesión o a consultar una lista de reservas debe descargar 1.6 MB de código 3D que tal vez nunca utilice.
- **Solución**:
  Implementar carga diferida con `React.lazy()` y `Suspense`:
  ```tsx
  const Cama3dPage = React.lazy(() => import('../../features/cama3d/ui/cama3d-page'))
  ```

---

### 3.2. Gestión Manual y Repetitiva de Estados de Servidor (*Server State*)
- **Ubicación**: Repetido en cada organismo (`sedes-panel`, `reserva-card-form`, `color-menu-bar`, etc.).
- **Problema**:
  Cada módulo reinventa su propio manejo de:
  - `const [isLoading, setIsLoading] = useState(true)`
  - `const [errorMessage, setErrorMessage] = useState(null)`
  - `useEffect(() => { fetch(...) }, [])`
- **Impacto**: Código repetitivo, sin caché de peticiones en memoria, sin deduplicación de consultas simultáneas y sin reintentos automáticos tras reconexión a internet.

---

## 🛠️ Plan de Acción Recomendado (Hoja de Ruta)

```
PASO 1 (Inmediato):
├── Corregir persistencia de sesión en src/App.tsx
└── Añadir interceptor de Bearer Token en src/lib/api.ts

PASO 2 (Corto Plazo):
├── Normalizar features/personas y features/login a las 4 capas (Domain, App, Infra, UI)
└── Unificar la clave de almacenamiento del token en auth-storage.ts

PASO 3 (Medio Plazo):
├── Instalar Vitest + Testing Library para pruebas unitarias de Domain/Application
├── Incorporar React Router con rutas explícitas (/login, /dashboard/reservas, etc.)
└── Aplicar React.lazy() en Cama3dPage para optimizar el bundle a < 300 KB iniciales
```
