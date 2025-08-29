import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Video } from 'expo-av';
import { CattleColors } from '../styles/colors';

const { width, height } = Dimensions.get('window');

export default function YouTubeStyleVideoPlayer({ 
    videoUrl, 
    title, 
    description, 
    onClose, 
    onNext, 
    onPrevious,
    initialShowControls = true 
}) {
    const videoRef = useRef(null);
    const [status, setStatus] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControlsOverlay, setShowControlsOverlay] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let timeout;
        if (showControlsOverlay) {
            timeout = setTimeout(() => {
                hideControls();
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [showControlsOverlay]);

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

    const togglePlayPause = async () => {
        if (isPlaying) {
            await videoRef.current?.pauseAsync();
        } else {
            await videoRef.current?.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    const onPlaybackStatusUpdate = (status) => {
        setStatus(status);
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setProgress(status.positionMillis / status.durationMillis);
            setDuration(status.durationMillis);
            
            // Animate progress bar
            Animated.timing(progressAnim, {
                toValue: status.positionMillis / status.durationMillis,
                duration: 100,
                useNativeDriver: false,
            }).start();
        }
    };

    const formatTime = (millis) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const seekTo = async (position) => {
        if (videoRef.current && status.isLoaded) {
            const newPosition = position * status.durationMillis;
            await videoRef.current.setPositionAsync(newPosition);
        }
    };

    if (!showControlsOverlay) {
        return (
            <TouchableOpacity 
                style={styles.videoContainer} 
                onPress={showControls}
                activeOpacity={1}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: videoUrl }}
                    style={styles.video}
                    resizeMode="contain"
                    shouldPlay={false}
                    isLooping
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    onError={(error) => console.log('Video error:', error)}
                />
                
                {/* Progress Bar Always Visible */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View 
                            style={[
                                styles.progressFill, 
                                { width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%']
                                })}
                            ]} 
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.videoContainer}>
            <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                resizeMode="contain"
                shouldPlay={false}
                isLooping
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                onError={(error) => console.log('Video error:', error)}
            />
            
            {/* Controls Overlay */}
            <Animated.View 
                style={[
                    styles.controlsOverlay,
                    { opacity: fadeAnim }
                ]}
            >
                {/* Top Controls */}
                <View style={styles.topControls}>
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
                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <Text style={styles.timeText}>
                            {formatTime(status.positionMillis || 0)}
                        </Text>
                        <TouchableOpacity 
                            style={styles.progressBar}
                            onPress={(event) => {
                                const { locationX } = event.nativeEvent;
                                const progressBarWidth = width - 120; // Adjust based on your layout
                                const seekPosition = locationX / progressBarWidth;
                                seekTo(seekPosition);
                            }}
                        >
                            <View style={styles.progressBar}>
                                <Animated.View 
                                    style={[
                                        styles.progressFill, 
                                        { width: progressAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%']
                                        })}
                                    ]} 
                                />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.timeText}>
                            {formatTime(status.durationMillis || 0)}
                        </Text>
                    </View>

                    {/* Navigation Controls */}
                    <View style={styles.navigationControls}>
                        <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
                            <Text style={styles.navButtonText}>⏮️</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.playPauseButton} 
                            onPress={togglePlayPause}
                        >
                            <Text style={styles.playPauseButtonText}>
                                {isPlaying ? '⏸️' : '▶️'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.navButton} onPress={onNext}>
                            <Text style={styles.navButtonText}>⏭️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
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
        top: 20,
        right: 20,
        zIndex: 10,
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
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    timeText: {
        color: CattleColors.white,
        fontSize: 12,
        fontWeight: '600',
        width: 40,
        textAlign: 'center',
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: CattleColors.accent,
        borderRadius: 2,
    },
    navigationControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 18,
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
});
