import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Video from "react-native-video";
import convertToProxyURL from "react-native-video-cache";

const CustomVideoPlayer = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#00ffcc"
          style={styles.loader}
        />
      )}

      <Video
        // URI de tu stream HLS
        source={{ uri: convertToProxyURL("https://master.tucableip.com/fercogan/video.m3u8") }}

        // Miniatura mientras carga (puedes cambiarla)
        poster="https://dummyimage.com/600x400/000/fff&text=Cargando+video..."
        posterResizeMode="cover"

        // Configuración de buffer
        bufferConfig={{
          minBufferMs: 2500,
          maxBufferMs: 5000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 2500,
        }}

        // iOS
        ignoreSilentSwitch="ignore"
        playWhenInactive={false}
        playInBackground={false}

        // Android
        useTextureView={false}

        // UI
        controls={false}
        disableFocus={true}
        hideShutterView
        shutterColor="transparent"

        // Reproducción
        paused={isPaused}
        repeat={true}
        resizeMode="cover"

        // Callback
        onReadyForDisplay={handleVideoLoad}

        // Estilo
        style={styles.video}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: 250,
    backgroundColor: "black",
  },
  loader: {
    position: "absolute",
    zIndex: 1,
  },
});

export default CustomVideoPlayer;
