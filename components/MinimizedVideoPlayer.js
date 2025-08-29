import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, PanGestureHandler, State } from 'react-native';
import { Video } from 'expo-av';
import { CattleColors } from '../styles/colors';

const { width, height } = Dimensions.get('window');

export default function MinimizedVideoPlayer({ 
    videoUrl, 
    title, 
    onMaximize, 
    onClose,
    isVisible = false 
}) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState({ x: width - 200, y: height - 300 });
    
    const panRef = useRef(new Animated.ValueXY()).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const togglePlayPause = async () => {
        if (isPlaying) {
            await videoRef.current?.pauseAsync();
        } else {
            await videoRef.current?.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: panRef.x, translationY: panRef.y } }],
        { useNativeDriver: false }
    );

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.state === State.END) {
            const newX = position.x + event.nativeEvent.translationX;
            const newY = position.y + event.nativeEvent.translationY;
            
            // Mantener el video dentro de los límites de la pantalla
            const boundedX = Math.max(0, Math.min(width - 200, newX));
            const boundedY = Math.max(100, Math.min(height - 300, newY));
            
            setPosition({ x: boundedX, y: boundedY });
            panRef.setValue({ x: 0, y: 0 });
        }
    };

    const handleMaximize = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onMaximize();
        });
    };

    const handleClose = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    if (!isVisible) return null;

    return (
        <Animated.View 
            style={[
                styles.minimizedContainer,
                {
                    transform: [
                        { translateX: position.x },
                        { translateY: position.y },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <Animated.View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: videoUrl }}
                        style={styles.minimizedVideo}
                        resizeMode="contain"
                        shouldPlay={false}
                        isLooping
                        onError={(error) => console.log('Minimized video error:', error)}
                    />
                    
                    {/* Overlay de Controles */}
                    <View style={styles.controlsOverlay}>
                        <View style={styles.topControls}>
                            <TouchableOpacity 
                                style={styles.maximizeButton} 
                                onPress={handleMaximize}
                            >
                                <Text style={styles.buttonText}>⛶</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.closeButton} 
                                onPress={handleClose}
                            >
                                <Text style={styles.buttonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.playButton} 
                            onPress={togglePlayPause}
                        >
                            <Text style={styles.playButtonText}>
                                {isPlaying ? '⏸️' : '▶️'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Título del Video */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.videoTitle} numberOfLines={1}>
                            {title}
                        </Text>
                    </View>
                </Animated.View>
            </PanGestureHandler>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    minimizedContainer: {
        position: 'absolute',
        zIndex: 1000,
        elevation: 10,
    },
    videoContainer: {
        width: 200,
        height: 150,
        backgroundColor: CattleColors.black,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    minimizedVideo: {
        width: '100%',
        height: '100%',
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'space-between',
        padding: 8,
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    maximizeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: CattleColors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    playButton: {
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonText: {
        fontSize: 18,
    },
    titleContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
    },
    videoTitle: {
        color: CattleColors.white,
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
});
