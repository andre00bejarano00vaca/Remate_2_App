import React, { useState, useCallback, useRef } from "react";
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

export default function VideoScreen({ videoUri }) {
  const playerRef = useRef(null);
  console.log("video", videoUri)
  const videoLink =
    videoUri ?? "https://youtu.be/u-NtX-R_VLc";
  const videoId = videoLink.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
  const [playing, setPlaying] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      playerRef.current?.seekTo(0, true);
      setPlaying(true);
    }
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.videoContainer}>
        {!isReady && (
          <View style={styles.loaderContainer}>
            <Image
              source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <ActivityIndicator size="large" color="#228B22" style={styles.loader} />
          </View>
        )}

        {videoId && (
          <YoutubePlayer
            ref={playerRef}
            height={220}
            play={playing}
            videoId={videoId}
            onReady={() => setIsReady(true)}
            onChangeState={onStateChange}
            playerParams={{
              rel: 0,
              modestbranding: true,
              controls: 1,
              loop: 1,
              playlist: videoId,
            }}
            webViewProps={{
              allowsInlineMediaPlayback: true,
              mediaPlaybackRequiresUserAction: false,
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  videoContainer: {
    width: "100%",
    height: 220,
    marginVertical: 20,
    position: "relative",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 1,
  },
  thumbnail: {
    width: "100%",
    height: 220,
    opacity: 0.5,
  },
  loader: {
    position: "absolute",
  },
  videoLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "#004d00",
    fontWeight: "bold",
  },
});
