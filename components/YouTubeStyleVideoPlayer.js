import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { CattleColors } from "../styles/colors";

const { width } = Dimensions.get("window");

export default function YouTubeStyleVideoPlayer({
  videoUrl,
  onClose,
  onNext,
  onPrevious,
}) {
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.timeUpdateEventInterval = 0.25;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const { currentTime } = useEvent(player, "timeUpdate", {
    currentTime: player.currentTime,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });

  const duration = player.duration || 0;

  useEffect(() => {
    if (duration > 0) {
      progressAnim.setValue(currentTime / duration);
    }
  }, [currentTime, duration, progressAnim]);

  useEffect(() => {
    let timeout;
    if (showControlsOverlay) {
      timeout = setTimeout(() => {
        hideControls();
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControlsOverlay, isPlaying]);

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
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (seconds) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const seekTo = (position) => {
    if (duration > 0) {
      player.currentTime = position * duration;
    }
  };

  return (
    <TouchableOpacity
      style={styles.videoContainer}
      onPress={showControlsOverlay ? hideControls : showControls}
      activeOpacity={1}
    >
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />

      {!showControlsOverlay && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}

      {showControlsOverlay && (
        <Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.centerPlayButton} onPress={togglePlayPause}>
            <Text style={styles.centerPlayButtonText}>{isPlaying ? "⏸️" : "▶️"}</Text>
          </TouchableOpacity>

          <View style={styles.bottomControls}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <TouchableOpacity
                style={styles.progressBar}
                onPress={(event) => {
                  const { locationX } = event.nativeEvent;
                  const progressBarWidth = width - 120;
                  seekTo(locationX / progressBarWidth);
                }}
              >
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            <View style={styles.navigationControls}>
              <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
                <Text style={styles.navButtonText}>⏮️</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
                <Text style={styles.playPauseButtonText}>{isPlaying ? "⏸️" : "▶️"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navButton} onPress={onNext}>
                <Text style={styles.navButtonText}>⏭️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: "100%",
    height: 250,
    backgroundColor: CattleColors.black,
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  progressBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  topControls: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: CattleColors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  centerPlayButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerPlayButtonText: {
    fontSize: 30,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  timeText: {
    color: CattleColors.white,
    fontSize: 12,
    fontWeight: "600",
    width: 40,
    textAlign: "center",
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: CattleColors.accent,
    borderRadius: 2,
  },
  navigationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 18,
  },
  playPauseButton: {
    backgroundColor: CattleColors.accent,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButtonText: {
    fontSize: 24,
  },
});
