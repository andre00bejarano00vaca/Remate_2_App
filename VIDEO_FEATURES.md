# 🎥 Funcionalidades de Video - Remate Ganadero

## 📱 **Videos en el Catálogo de Ganado**

### **Características Implementadas:**

#### ✅ **Reproductor de Video Integrado**
- **Componente Video**: Usando `expo-av` para reproducción nativa
- **Controles Nativos**: Play, pause, seek, volumen y pantalla completa
- **Reproducción en Loop**: Los videos se repiten automáticamente
- **Modo Contenedor**: Los videos se ajustan al tamaño del contenedor

#### ✅ **Interfaz de Usuario Intuitiva**
- **Botón Expandir/Contraer**: "Ver Video" / "Ocultar" para cada lote
- **Sección Dedicada**: Área específica para el video con fondo diferenciado
- **Estado Expandido**: Solo se muestra un video a la vez para optimizar rendimiento
- **Etiqueta Informativa**: Muestra la raza y número de lote del video

#### ✅ **Gestión de Estado**
- **Estado Local**: Controla qué video está expandido actualmente
- **Toggle Inteligente**: Al hacer clic en un video expandido, se contrae
- **Un Solo Video**: Solo un video puede estar expandido simultáneamente
- **Persistencia**: El estado se mantiene durante la navegación

### 🎯 **Estructura de Datos**

#### **Archivo de Datos Centralizado:**
```javascript
// data/cattleLots.js
export const cattleLots = [
    {
        id: 1,
        numero: "L-001",
        raza: "Brahman",
        peso: "450 kg",
        preoferta: "$2,500",
        estado: "Disponible",
        descripcion: "...",
        caracteristicas: [...],
        videoUrl: "https://ejemplo.com/video-brahman.mp4"
    }
    // ... más lotes
];
```

#### **URLs de Video Incluidas:**
- **L-001 (Brahman)**: BigBuckBunny.mp4
- **L-002 (Angus)**: ElephantsDream.mp4
- **L-003 (Hereford)**: ForBiggerBlazes.mp4
- **L-004 (Simmental)**: ForBiggerEscapes.mp4
- **L-005 (Brahman)**: ForBiggerFun.mp4
- **L-006 (Angus)**: ForBiggerJoyrides.mp4
- **L-007 (Simmental)**: ForBiggerMeltdowns.mp4
- **L-008 (Hereford)**: Sintel.mp4

### 🎨 **Diseño y Estilos**

#### **Sección de Video:**
```javascript
videoSection: {
    marginBottom: 20,
    backgroundColor: CattleColors.lightGray,
    borderRadius: 8,
    padding: 16,
}
```

#### **Contenedor de Video:**
```javascript
animalVideo: {
    width: width - 80,  // Ancho responsivo
    height: 200,        // Altura fija para consistencia
    backgroundColor: CattleColors.mediumLightGray,
    borderRadius: 8,
    marginBottom: 8,
}
```

#### **Botón de Toggle:**
```javascript
videoToggleButton: {
    paddingHorizontal: 0,
    minWidth: 80,
}
```

### 🔧 **Implementación Técnica**

#### **Importaciones Requeridas:**
```javascript
import { Video } from "expo-av";
import { cattleLots } from "../data/cattleLots";
```

#### **Estado del Componente:**
```javascript
const [expandedVideo, setExpandedVideo] = useState(null);
```

#### **Función de Toggle:**
```javascript
const toggleVideo = (loteId) => {
    if (expandedVideo === loteId) {
        setExpandedVideo(null);
    } else {
        setExpandedVideo(loteId);
    }
};
```

#### **Renderizado Condicional:**
```javascript
{expandedVideo === lote.id && (
    <View style={styles.videoContainer}>
        <Video
            source={{ uri: lote.videoUrl }}
            useNativeControls
            resizeMode="contain"
            isLooping
            shouldPlay={false}
            style={styles.animalVideo}
            onError={(error) => console.log('Video error:', error)}
            onLoad={() => console.log('Video loaded successfully')}
        />
        <Text style={styles.videoLabel}>
            {lote.raza} - Lote {lote.numero}
        </Text>
    </View>
)}
```

### 📱 **Experiencia del Usuario**

#### **Flujo de Uso:**
1. **Usuario navega** al catálogo de ganado
2. **Ve la lista** de lotes con botones "Ver Video"
3. **Hace clic** en "Ver Video" para un lote específico
4. **Se expande** la sección de video del animal
5. **Reproduce** el video con controles nativos
6. **Puede contraer** el video haciendo clic en "Ocultar"
7. **Navega** a otros lotes manteniendo el estado

#### **Beneficios para Ganaderos:**
- **Evaluación Visual**: Pueden ver el ganado antes de hacer ofertas
- **Características Físicas**: Observan conformación, movimiento y salud
- **Comparación**: Comparan visualmente diferentes lotes
- **Decisión Informada**: Toman decisiones basadas en evidencia visual
- **Eficiencia**: No necesitan viajar para ver el ganado

### 🚀 **Optimizaciones Implementadas**

#### **Rendimiento:**
- **Lazy Loading**: Los videos solo se cargan cuando se expanden
- **Un Solo Video**: Solo un video activo a la vez
- **Controles Nativos**: Usa controles optimizados del sistema
- **Manejo de Errores**: Callbacks para debugging y fallbacks

#### **Accesibilidad:**
- **Etiquetas Descriptivas**: Cada video tiene etiqueta informativa
- **Controles Nativos**: Accesibilidad integrada del sistema
- **Estados Visuales**: Botones claros para expandir/contraer
- **Feedback Visual**: Indicadores claros del estado actual

### 🔮 **Futuras Mejoras**

#### **Funcionalidades Adicionales:**
- **Thumbnails**: Imágenes previas de los videos
- **Calidad Adaptativa**: Diferentes calidades según conexión
- **Descarga Offline**: Videos disponibles sin conexión
- **Favoritos**: Marcar videos para revisión posterior
- **Compartir**: Enviar videos a otros ganaderos

#### **Integración Avanzada:**
- **Streaming en Vivo**: Videos en tiempo real del ganado
- **Chat en Vivo**: Comentarios durante la reproducción
- **Análisis de Video**: IA para evaluar características del ganado
- **Historial**: Seguimiento de videos vistos

---

**Nota**: Esta funcionalidad transforma la experiencia del remate ganadero, permitiendo a los compradores evaluar visualmente el ganado antes de hacer ofertas, mejorando significativamente la calidad de las decisiones de compra.
