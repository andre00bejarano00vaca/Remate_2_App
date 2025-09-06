import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Dimensions, 
    Animated,
    Alert,
    ActivityIndicator
} from 'react-native';
import Video from 'react-native-video';
import { CattleColors } from '../styles/colors';

const { width, height } = Dimensions.get('window');

export default function LiveStreamPlayer({ 
    streamUrl, 
    title = "Transmisión en Vivo",
    onClose,
    autoPlay = true,
    showControls = true,
    onError,
    onLoad,
    onBuffer
}) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [showControlsOverlay, setShowControlsOverlay] = useState(showControls);
    const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, error
    const [retryCount, setRetryCount] = useState(0);
    const [lastError, setLastError] = useState(null);
    
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Auto-hide controls after 5 seconds
    useEffect(() => {
        let timeout;
        if (showControlsOverlay && isPlaying) {
            timeout = setTimeout(() => {
                hideControls();
            }, 5000);
        }
        return () => clearTimeout(timeout);
    }, [showControlsOverlay, isPlaying]);

    // Pulse animation for live indicator
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const hideControls = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowControlsOverlay(false);
        });
    };

    const showControls = () => {
        setShowControlsOverlay(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleLoad = (data) => {
        setIsLoading(false);
        setConnectionStatus('connected');
        setRetryCount(0);
        setLastError(null);
        if (onLoad) onLoad(data);
    };

    const handleBuffer = ({ isBuffering }) => {
        setIsBuffering(isBuffering);
        if (onBuffer) onBuffer(isBuffering);
    };

    const handleError = (error) => {
        console.log('Live stream error:', error);
        setIsLoading(false);
        setConnectionStatus('error');
        setLastError(error);
        
        if (onError) {
            onError(error);
        } else {
            // Auto-retry logic
            if (retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    setConnectionStatus('connecting');
                    setIsLoading(true);
                }, 2000 * (retryCount + 1)); // Exponential backoff
            } else {
                Alert.alert(
                    'Error de Conexión',
                    'No se pudo conectar con la transmisión en vivo. Verifica tu conexión a internet.',
                    [
                        { text: 'Reintentar', onPress: () => {
                            setRetryCount(0);
                            setConnectionStatus('connecting');
                            setIsLoading(true);
                        }},
                        { text: 'Cerrar', onPress: onClose }
                    ]
                );
            }
        }
    };

    const handleProgress = (data) => {
        // Para streams en vivo, no mostramos progreso ya que es continuo
    };

    const formatConnectionStatus = () => {
        switch (connectionStatus) {
            case 'connecting':
                return 'Conectando...';
            case 'connected':
                return 'EN VIVO';
            case 'error':
                return 'Error de conexión';
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connecting':
                return CattleColors.accent;
            case 'connected':
                return '#FF0000'; // Rojo para "EN VIVO"
            case 'error':
                return '#FF6B6B';
            default:
                return CattleColors.mediumGray;
        }
    };

    if (!streamUrl) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>URL de transmisión no válida</Text>
            </View>
        );
    }

    return (
        <View style={styles.videoContainer}>
            <Video
                ref={videoRef}
                source={{ 
                    uri: streamUrl,
                    type: 'm3u8' // Especificamos que es HLS
                }}
                style={styles.video}
                resizeMode="contain"
                paused={!isPlaying}
                onLoad={handleLoad}
                onBuffer={handleBuffer}
                onError={handleError}
                onProgress={handleProgress}
                onLoadStart={() => {
                    setIsLoading(true);
                    setConnectionStatus('connecting');
                }}
                // Configuraciones específicas para HLS
                bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000
                }}
                // Configuraciones de red para streams en vivo
                networkState={1}
                // Habilitar reproducción automática para streams en vivo
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="ignore"
                mixWithOthers="duck"
            />
            
            {/* Loading Indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={CattleColors.accent} />
                    <Text style={styles.loadingText}>Cargando transmisión...</Text>
                </View>
            )}

            {/* Buffering Indicator */}
            {isBuffering && !isLoading && (
                <View style={styles.bufferingContainer}>
                    <ActivityIndicator size="small" color={CattleColors.white} />
                    <Text style={styles.bufferingText}>Buffering...</Text>
                </View>
            )}

            {/* Live Status Indicator */}
            <View style={styles.liveIndicator}>
                <Animated.View 
                    style={[
                        styles.liveDot,
                        { 
                            backgroundColor: getStatusColor(),
                            opacity: pulseAnim 
                        }
                    ]} 
                />
                <Text style={[styles.liveText, { color: getStatusColor() }]}>
                    {formatConnectionStatus()}
                </Text>
            </View>

            {/* Controls Overlay */}
            {showControlsOverlay && (
                <Animated.View 
                    style={[
                        styles.controlsOverlay,
                        { opacity: fadeAnim }
                    ]}
                >
                    {/* Top Controls */}
                    <View style={styles.topControls}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.videoTitle} numberOfLines={2}>
                                {title}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Center Play/Pause Button */}
                    <TouchableOpacity 
                        style={styles.centerPlayButton} 
                        onPress={togglePlayPause}
                    >
                        <Text style={styles.centerPlayButtonText}>
                            {isPlaying ? '⏸️' : '▶️'}
                        </Text>
                    </TouchableOpacity>

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                        <View style={styles.controlsRow}>
                            <TouchableOpacity 
                                style={styles.playPauseButton} 
                                onPress={togglePlayPause}
                            >
                                <Text style={styles.playPauseButtonText}>
                                    {isPlaying ? '⏸️' : '▶️'}
                                </Text>
                            </TouchableOpacity>
                            
                            <View style={styles.streamInfo}>
                                <Text style={styles.streamInfoText}>
                                    Transmisión en Vivo
                                </Text>
                                {retryCount > 0 && (
                                    <Text style={styles.retryText}>
                                        Reintento {retryCount}/3
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}

            {/* Tap to show controls */}
            {!showControlsOverlay && (
                <TouchableOpacity 
                    style={styles.tapArea} 
                    onPress={showControls}
                    activeOpacity={1}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    videoContainer: {
        width: '100%',
        height: 250,
        backgroundColor: CattleColors.black,
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: CattleColors.white,
        fontSize: 16,
        marginTop: 10,
        fontWeight: '600',
    },
    bufferingContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bufferingText: {
        color: CattleColors.white,
        fontSize: 12,
        marginLeft: 8,
    },
    liveIndicator: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    liveText: {
        color: CattleColors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    topControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        paddingTop: 60, // Espacio para el indicador en vivo
    },
    titleContainer: {
        flex: 1,
        marginRight: 20,
    },
    videoTitle: {
        color: CattleColors.white,
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    closeButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: CattleColors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    centerPlayButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -30 }, { translateY: -30 }],
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerPlayButtonText: {
        fontSize: 30,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    playPauseButton: {
        backgroundColor: CattleColors.accent,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playPauseButtonText: {
        fontSize: 24,
    },
    streamInfo: {
        flex: 1,
        marginLeft: 20,
    },
    streamInfoText: {
        color: CattleColors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    retryText: {
        color: CattleColors.accent,
        fontSize: 12,
        marginTop: 2,
    },
    tapArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    errorContainer: {
        width: '100%',
        height: 250,
        backgroundColor: CattleColors.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: CattleColors.white,
        fontSize: 16,
        textAlign: 'center',
    },
});
