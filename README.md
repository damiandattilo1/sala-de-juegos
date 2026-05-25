## Sala de Juegos — Dattilo Damián

**Alumno:** Dattilo, Damián Nicolás  
**Materia:** Programación IV — UTN FRA  
**Deploy:** https://sala-de-juegos-e1527.web.app

---

## Tecnologías utilizadas

- Angular 17 (standalone components)
- TypeScript
- Bootstrap 5
- Firebase Hosting
- GitHub API

---

## Sprints

### Sprint #1
- Creación del proyecto Angular.
- Deploy en Firebase Hosting.
- Componentes: Login, Registro, Home (Bienvenida) y Quién Soy.
- Navegación entre componentes sin restricciones de acceso.
- Quién Soy consume la API de GitHub (`damiandattilo1`) mostrando avatar, nombre, bio, ubicación y estadísticas.
- Explicación del juego propio: **Generala Simple**.
- Favicon personalizado.
- Bootstrap 5 y animaciones CSS/TypeScript de transición entre rutas.

### Sprint #2
- Autenticación funcional con Firebase Authentication (login, registro y logout).
- Datos del registro guardados en Firestore (nombre, apellido, edad y email; sin contraseña).
- 3 botones de inicio de sesión rápido para testing.
- Guards de ruta (`authGuard`) para proteger rutas privadas (home).
- Home condicional: muestra bienvenida personalizada si el usuario está autenticado.
- Navegación condicional: muestra Login/Registro cuando no hay sesión, y Cerrar Sesión cuando sí hay.

### Sprint #3
- Juego **Ahorcado** implementado con entrada por botones del abecedario.
- Juego **Mayor o Menor** implementado con baraja española.
- **Chat global en tiempo real** para usuarios logueados.
- Persistencia en Firestore de resultados de Ahorcado y Mayor o Menor.
- Persistencia en Firestore de mensajes del chat (usuario, mensaje, fecha/hora).

### Sprint #4
- Juego **Preguntados** implementado consumiendo la API OpenTDB (`https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple`).
- Respuestas de Preguntados con opciones por botones y guardado de desempeño en Firestore (aciertos, total, tiempo).
- Juego propio **Generala Simple** implementado con reglas, condición de victoria/derrota y persistencia de resultados.
- Página **Resultados** agregada con 4 tablas (Ahorcado, Mayor o Menor, Preguntados y Generala).
- Rankings ordenados de mejor desempeño/puntaje a peor para cada juego.

### Sprint #5 — Recuperatorio
- **Encuesta de satisfacción** con formulario reactivo y validaciones:
  - Datos personales: nombre/apellido, edad (18–99), teléfono (solo dígitos, máx. 10).
  - 4 preguntas con controles distintos: radio button, checkbox (múltiple), select y textarea.
  - Todos los campos requeridos con mensajes de error específicos.
  - Respuestas guardadas en Firestore identificando al usuario.
  - Aviso si el usuario ya respondió la encuesta (sin bloquear el reenvío).
- **Resultados de encuestas** accesibles solo para administradores (`adminGuard`):
  - Tab "Indicadores": tarjetas resumen + 3 gráficos de barras SVG (frecuencia, juego favorito, géneros).
  - Tab "Registros": tabla completa con todas las respuestas individuales.
- **Animaciones de transición de rutas** mejoradas (enter + leave con fade y slide).
- Datos de prueba precargados en Firestore para los 3 usuarios de testing.
