# Guía de Transmisiones en Vivo (.m3u8)

## Descripción
Esta aplicación ahora incluye soporte completo para transmisiones en vivo usando el protocolo HLS (HTTP Live Streaming) con archivos .m3u8.

## Componentes Implementados

### 1. LiveStreamPlayer
- **Ubicación**: `components/LiveStreamPlayer.js`
- **Funcionalidades**:
  - Reproducción de streams HLS (.m3u8)
  - Reconexión automática en caso de errores
  - Indicador de estado en tiempo real ("EN VIVO")
  - Controles optimizados para transmisiones en vivo
  - Buffering inteligente
  - Manejo de errores con reintentos automáticos

### 2. LiveStreamScreen
- **Ubicación**: `screens/LiveStreamScreen.js`
- **Funcionalidades**:
  - Interfaz para probar diferentes URLs de transmisión
  - URLs de ejemplo preconfiguradas
  - Configuración personalizada de streams
  - Información técnica del reproductor

## URLs de Ejemplo para Pruebas

### 1. Fercogan (Actual)
```
https://master.tucableip.com/fercogan/index.m3u8
```
- **Descripción**: Transmisión actual del remate ganadero
- **Estado**: Activa durante eventos

### 2. Big Buck Bunny (Test)
```
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```
- **Descripción**: Stream de prueba con video de alta calidad
- **Estado**: Siempre disponible para pruebas

### 3. Apple HLS Sample
```
https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8
```
- **Descripción**: Ejemplo oficial de Apple para HLS
- **Estado**: Siempre disponible

### 4. Sintel (Test)
```
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
```
- **Descripción**: Stream de prueba con múltiples calidades
- **Estado**: Siempre disponible

## Características Técnicas

### Configuración de Buffer
```javascript
bufferConfig={{
    minBufferMs: 15000,        // Buffer mínimo: 15 segundos
    maxBufferMs: 50000,        // Buffer máximo: 50 segundos
    bufferForPlaybackMs: 2500, // Buffer para reproducción: 2.5 segundos
    bufferForPlaybackAfterRebufferMs: 5000 // Buffer después de rebuffer: 5 segundos
}}
```

### Reconexión Automática
- **Reintentos**: Hasta 3 intentos automáticos
- **Backoff**: Tiempo de espera exponencial (2s, 4s, 6s)
- **Indicador**: Muestra estado de reconexión al usuario

### Estados del Reproductor
- `connecting`: Conectando al stream
- `connected`: Conectado y reproduciendo ("EN VIVO")
- `error`: Error de conexión
- `buffering`: Cargando contenido

## Uso Básico

### 1. En HomeScreen (Ya implementado)
```javascript
<LiveStreamPlayer
    streamUrl="https://master.tucableip.com/fercogan/index.m3u8"
    title="Transmisión en Vivo - Remate Ganadero"
    autoPlay={true}
    showControls={true}
    onError={(error) => console.log("Error:", error)}
    onLoad={(data) => console.log("Cargado:", data)}
/>
```

### 2. En pantalla dedicada
```javascript
// Navegar a la pantalla de transmisiones
navigation.navigate('LiveStream');
```

## Propiedades del Componente

| Propiedad | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `streamUrl` | string | ✅ | URL del stream .m3u8 |
| `title` | string | ❌ | Título de la transmisión |
| `autoPlay` | boolean | ❌ | Reproducir automáticamente (default: true) |
| `showControls` | boolean | ❌ | Mostrar controles (default: true) |
| `onError` | function | ❌ | Callback para errores |
| `onLoad` | function | ❌ | Callback cuando se carga el stream |
| `onBuffer` | function | ❌ | Callback para estado de buffering |
| `onClose` | function | ❌ | Callback para cerrar reproductor |

## Mejores Prácticas

### 1. URLs de Transmisión
- ✅ Usar URLs HTTPS cuando sea posible
- ✅ Verificar que la URL termine en `.m3u8`
- ✅ Probar la URL en un navegador antes de implementar
- ❌ No usar URLs HTTP en producción

### 2. Manejo de Errores
- Implementar callbacks `onError` para logging
- Mostrar mensajes informativos al usuario
- Permitir reintentos manuales

### 3. Performance
- El componente está optimizado para streams en vivo
- Buffering configurado para balance entre latencia y estabilidad
- Reconexión automática para mantener la transmisión

## Solución de Problemas

### Stream no se reproduce
1. Verificar que la URL sea válida y accesible
2. Comprobar conexión a internet
3. Verificar que el stream esté activo
4. Revisar logs de consola para errores específicos

### Buffering excesivo
1. Verificar velocidad de internet
2. Ajustar configuración de buffer si es necesario
3. Probar con streams de menor calidad

### Reconexión fallida
1. Verificar estabilidad de la conexión
2. Comprobar que el servidor de streaming esté funcionando
3. Revisar logs para errores específicos del servidor

## Navegación

### Acceso a Transmisiones
1. **Desde HomeScreen**: Botón "TRANSMISIONES"
2. **Navegación directa**: `navigation.navigate('LiveStream')`

### Funcionalidades Disponibles
- ✅ Reproducción de streams .m3u8
- ✅ Controles de play/pause
- ✅ Indicador de estado en vivo
- ✅ Reconexión automática
- ✅ URLs de ejemplo para pruebas
- ✅ Configuración personalizada
- ✅ Manejo de errores robusto

## Próximas Mejoras Sugeridas

1. **Grabación de streams**: Permitir grabar transmisiones
2. **Chat en vivo**: Integrar chat durante transmisiones
3. **Múltiples streams**: Reproducir varios streams simultáneamente
4. **Calidad adaptativa**: Cambio automático de calidad según conexión
5. **Notificaciones**: Alertas cuando inicien transmisiones
6. **Historial**: Guardar streams favoritos
7. **Compartir**: Compartir streams con otros usuarios
