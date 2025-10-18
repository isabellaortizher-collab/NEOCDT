**Proyecto académico – Ingeniería de Software 2 (UAO, 2025-2)**  
**Equipo:** Samuel Salazar, Roiman Urrego, Isabela Cabezas, Isabella Ortíz, Sebastián Bustamante  
**Docente:** Rodrigo Escobar López  

**NeoCDT** es un módulo digital de **NeoBank** para la **gestión de Certificados de Depósito a Término (CDTs)**.  
Permite abrir, consultar y renovar CDTs de forma 100% digital, mejorando la eficiencia y experiencia del usuario.

**Avance general:** 

**Incluye:**
- ✅ **Login funcional** con validación de credenciales.  
- ✅ **Backend inicial:** CRUD básico de `SolicitudesCDT` (sin interfaz pulida).  
- ✅ **Frontend inicial:** consumo del backend y vistas básicas de gestión.  
- ✅ **Historias de usuario** con criterios de aceptación en **Gherkin**.  
- ✅ **Pruebas unitarias iniciales** y **1–2 pruebas funcionales.**  
- ✅ **Primer análisis de SonarQube** con hallazgos y acciones de mejora.
  
**Arquitectura (prototipo inicial)**

- **Frontend:** React.js (estructura base y rutas iniciales).  
- **Backend:** Node.js + Express.  
- **Base de datos:** MongoDB.  
- **Control de calidad:** SonarQube.

**Funcionalidades actuales**

- Registro y autenticación de usuarios.
- Comunicación básica entre frontend y backend.  
- Validación de datos y manejo de errores.

##  Instrucciones de ejecución

**Backend**

Instalar dependencias:
  npm install
Ejecutar el servidor:
  npm run dev

**Fronted**

Ir al directorio del frontend:
  cd ../frontend
Instalar dependencias:
  npm install
Ejecutar el servidor de desarrollo:
  npm start

