# Remate Ganadero App - Sistema Profesional de Gestión de Remates

Esta es una aplicación React Native **profesional y elegante** para la gestión y visualización de lotes de ganado en remates, diseñada específicamente para ganaderos y profesionales del sector.

## 🎨 **Paleta de Colores Profesional**

### **Teoría del Color Aplicada:**
- **🔵 Azul Profesional** (`#2C3E50`) - Color principal, transmite confianza y profesionalismo
- **🟠 Naranja Cálido** (`#E67E22`) - Color de acento, estimula la acción y es apropiado para el sector ganadero
- **⚪ Grises Neutros** - Escala profesional que no distrae del contenido
- **🟢 Verde Suave** (`#27AE60`) - Para estados de éxito y disponibilidad

### **Colores Base:**
- **Primario**: Azul oscuro profesional (`#2C3E50`)
- **Secundario**: Azul grisáceo (`#34495E`)
- **Acento**: Naranja cálido (`#E67E22`)
- **Neutral**: Gris muy claro (`#ECF0F1`)

## 🚀 **Características Principales**

### 🔐 **Sistema de Autenticación Profesional**
- **Pantalla de Login elegante** con diseño limpio y profesional
- **Logo circular** con emoji de ganado (🐄)
- **Formulario seguro** con campos de email y contraseña
- **Navegación protegida** entre pantallas
- **Botón de logout** en todas las pantallas autenticadas

### 🎥 **HomeScreen (Pantalla Principal)**
- **Video promocional** con marco sutil y controles nativos
- **Header profesional** con logo y botón de logout
- **Tabla de información de lotes** con datos relevantes para ganado:
  - Número de lote
  - Raza del animal
  - Peso en kilogramos
  - Preoferta del lote
  - Estado (Disponible/Reservado) con chips de colores
- **Sección de monto** con botón contador naranja
- **Botón de navegación** a la vista detallada

### 📋 **ListView (Catálogo de Ganado)**
- **Lista detallada de 8 lotes** con información completa:
  - Número y raza con badge "GANADO"
  - Peso del animal
  - Preoferta y estado con chips de colores
  - Descripción detallada del animal
  - Características específicas (edad, genética, vacunas, etc.)
- **Diseño de tarjetas limpias** con bordes sutiles
- **Header profesional** con logo y navegación de regreso

## 🛠️ **Tecnologías Utilizadas**

- **React Native** - Framework principal
- **Expo** - Plataforma de desarrollo
- **React Navigation** - Navegación entre pantallas
- **React Native Paper** - Componentes de Material Design con tema profesional
- **Expo AV** - Reproducción de video

## 📱 **Funcionalidades Técnicas**

### **Video y Orientación**
- ✅ **Video promocional** con marco sutil
- ✅ **Controles nativos** para reproducción
- ✅ **Orientación automática** según la posición del dispositivo
- ✅ **Sombras sutiles** para profundidad visual

### **Navegación y Autenticación**
- ✅ **Flujo de autenticación** completo
- ✅ **Navegación protegida** entre pantallas
- ✅ **Headers profesionales** sin interferencia de la cámara
- ✅ **Transiciones suaves** entre vistas

### **Interfaz de Usuario Profesional**
- ✅ **Diseño Material Design** con colores neutros y profesionales
- ✅ **Tablas de datos organizadas** con información relevante para ganado
- ✅ **Chips de estado** con colores diferenciados
- ✅ **Layout responsivo** para diferentes tamaños de pantalla
- ✅ **Sombras sutiles** para profundidad visual

## 🚀 **Instalación y Uso**

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

3. **Flujo de uso:**
   - **Login** → Ingresa email y contraseña
   - **HomeScreen** → Visualiza video y tabla de lotes de ganado
   - **ListView** → Explora catálogo completo de animales
   - **Logout** → Regresa a la pantalla de login

## 🏗️ **Estructura del Proyecto**

```
remate-ganadero/
├── App.js                 # Configuración principal con tema profesional
├── styles/
│   └── colors.js          # Paleta de colores profesionales y estilos
├── screens/
│   ├── LoginScreen.js     # Pantalla de autenticación
│   ├── HomeScreen.js      # Pantalla principal con información de ganado
│   └── ListView.js        # Catálogo completo de lotes de ganado
└── package.json           # Dependencias del proyecto
```

## 🐄 **Características de los Lotes de Ganado**

### **Información Mostrada:**
- **Número de lote** con badge "GANADO"
- **Raza del animal** (Brahman, Angus, Hereford, Simmental)
- **Peso** en kilogramos
- **Preoferta** en formato de moneda
- **Estado** (Disponible/Reservado) con chips de colores
- **Descripción detallada** de cada animal
- **Características específicas** (edad, genética, vacunas, etc.)

### **Estados Visuales:**
- 🟢 **Disponible** - Verde para lotes disponibles
- 🟠 **Reservado** - Naranja para lotes reservados
- 🏷️ **Badge GANADO** - Indicador de tipo de lote

## 🔧 **Personalización**

### **Sistema de Colores:**
- Modifica la paleta en `styles/colors.js`
- Ajusta sombras y elevaciones
- Personaliza tipografías y espaciados

### **Contenido del Video:**
- Cambia la URL del video en `HomeScreen.js`
- El video mantiene el marco sutil

### **Datos de Lotes:**
- Modifica la información en `HomeScreen.js` (tabla resumida)
- Edita el catálogo completo en `ListView.js`
- Personaliza badges y estados

## 📱 **Compatibilidad**

- **Android** - Versión 5.0+ (API 21+)
- **iOS** - Versión 11.0+
- **Expo** - Versión 53.0+
- **React Native** - Versión 0.79.5+

## 🚨 **Solución de Problemas**

### **Problemas Comunes:**
1. **Video no reproduce**: Verifica la URL y conexión a internet
2. **Orientación no funciona**: Asegúrate de que el dispositivo permita rotación
3. **Navegación lenta**: Limpia la caché con `expo start -c`
4. **Colores no se aplican**: Verifica que `styles/colors.js` esté importado

### **Comandos de Mantenimiento:**
```bash
# Limpiar caché
expo start -c

# Reinstalar dependencias
rm -rf node_modules && npm install

# Verificar instalación
expo doctor
```

## 🎨 **Elementos de Diseño Profesional**

### **Sombras y Elevaciones:**
- **Tarjetas**: Sombra sutil con elevación 3
- **Botones**: Sombra media con elevación 2
- **Elementos flotantes**: Sombra suave con elevación 6

### **Tipografías Profesionales:**
- **Títulos**: Con espaciado de letras optimizado para legibilidad
- **Texto del cuerpo**: Alto contraste para fácil lectura
- **Destacados**: Color naranja para elementos importantes

### **Bordes y Marcos:**
- **Video**: Marco sutil de 2px con bordes redondeados
- **Tarjetas**: Bordes sutiles de 1px con esquinas redondeadas
- **Botones**: Bordes redondeados con sombras sutiles

## 📄 **Licencia**

© 2024 Remate Ganadero App - Sistema Profesional - Todos los derechos reservados

---

**Nota**: Esta aplicación está diseñada con una estética profesional y elegante, utilizando una paleta de colores neutra y sofisticada (azules, grises y naranja) apropiada para el sector ganadero y profesional.
