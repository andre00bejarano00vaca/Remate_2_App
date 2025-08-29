import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Text, Image, TouchableOpacity } from "react-native";
import { List, Button, Title, Divider, Card, Chip, Paragraph, IconButton } from "react-native-paper";
import { CattleColors, CattleShadows } from "../styles/colors";
import { cattleLots } from "../data/cattleLots";
import YouTubeStyleVideoPlayer from "../components/YouTubeStyleVideoPlayer";
import { DataTable } from "react-native-paper";

const { width, height } = Dimensions.get('window');

export default function ListView({ navigation }) {
    const [expandedVideo, setExpandedVideo] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const lotes = cattleLots;

    const goBack = () => {
        navigation.goBack();
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Disponible':
                return CattleColors.success;
            case 'Reservado':
                return CattleColors.warning;
            default:
                return CattleColors.mediumGray;
        }
    };

    const getEstadoBackground = (estado) => {
        switch (estado) {
            case 'Disponible':
                return CattleColors.success;
            case 'Reservado':
                return CattleColors.warning;
            default:
                return CattleColors.mediumGray;
        }
    };

    const toggleVideo = (loteId) => {
        if (expandedVideo === loteId) {
            setExpandedVideo(null);
        } else {
            setExpandedVideo(loteId);
            const index = lotes.findIndex(lote => lote.id === loteId);
            setCurrentVideoIndex(index);
        }
    };

    const playNextVideo = () => {
        const nextIndex = (currentVideoIndex + 1) % lotes.length;
        setCurrentVideoIndex(nextIndex);
        setExpandedVideo(lotes[nextIndex].id);
    };

    const playPreviousVideo = () => {
        const prevIndex = currentVideoIndex === 0 ? lotes.length - 1 : currentVideoIndex - 1;
        setCurrentVideoIndex(prevIndex);
        setExpandedVideo(lotes[prevIndex].id);
    };

    return (
        <View style={styles.container}>
            {/* Header profesional */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoIcon}>🐄</Text>
                        </View>
                        <Title style={styles.headerTitle}>CATÁLOGO GANADERO</Title>
                    </View>
                    <IconButton 
                        icon="arrow-left" 
                        size={28}
                        iconColor={CattleColors.white}
                        onPress={goBack}
                        style={styles.backButton}
                    />
                </View>
                <View style={styles.headerLine} />
            </View>

            {/* Reproductor de Video Principal (estilo YouTube) */}
            {expandedVideo && (
                <View style={styles.videoPlayerContainer}>
                    <YouTubeStyleVideoPlayer
                        videoUrl={lotes[currentVideoIndex].videoUrl}
                        title={`${lotes[currentVideoIndex].raza} - Lote ${lotes[currentVideoIndex].numero}`}
                        description={lotes[currentVideoIndex].descripcion}
                        onClose={() => setExpandedVideo(null)}
                        onNext={playNextVideo}
                        onPrevious={playPreviousVideo}
                        initialShowControls={true}
                    />
                    
                    {/* Información del Video */}
                    <View style={styles.videoInfo}>
                        <Title style={styles.videoTitle}>
                            {lotes[currentVideoIndex].raza} - Lote {lotes[currentVideoIndex].numero}
                        </Title>
                        <Text style={styles.videoDescription}>
                            {lotes[currentVideoIndex].descripcion}
                        </Text>
                        <View style={styles.videoStats}>
                            <Chip 
                                mode="outlined" 
                                textStyle={styles.statsChipText}
                                style={styles.statsChip}
                            >
                                Peso: {lotes[currentVideoIndex].peso}
                            </Chip>
                            <Chip 
                                mode="outlined" 
                                textStyle={styles.statsChipText}
                                style={[
                                    styles.statsChip,
                                    { 
                                        backgroundColor: getEstadoBackground(lotes[currentVideoIndex].estado),
                                        borderColor: getEstadoColor(lotes[currentVideoIndex].estado)
                                    }
                                ]}
                            >
                                {lotes[currentVideoIndex].estado}
                            </Chip>
                        </View>
                    </View>
                </View>
            )}

        

            {/* Lista de Videos (estilo YouTube) */}
            <ScrollView 
                style={styles.listContainer} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.sectionTitle}>🎥 Videos de Ganado Disponible</Text>
                
                {lotes.map((lote, index) => (
                    <TouchableOpacity 
                    key={lote.id} 
                    style={styles.videoListItem}
                    onPress={() => toggleVideo(lote.id)}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={{ uri: lote.thumbnailUrl || "https://via.placeholder.com/120x90" }} 
                      style={styles.thumbnail} 
                      resizeMode="cover" 
                    />
                    
                    <View style={styles.videoItemInfo}>
                      <Title style={styles.videoItemTitle}>
                        {lote.raza} - Lote {lote.numero}
                      </Title>
                      <Chip 
                        icon={lote.estado === "Disponible" ? "check-circle" : "clock"}
                        
                        textStyle={{ color: CattleColors.white }}
                      >
                        {lote.estado}
                      </Chip>
                      <Paragraph numberOfLines={2} style={styles.videoItemDescription}>
                        {lote.descripcion}
                      </Paragraph>
                      <View style={styles.videoItemStats}>
                        <Text style={styles.statsText}>⚖️ {lote.peso}</Text>
                        <Text style={styles.statsText}>💵 {lote.preoferta}</Text>
                        <Text style={styles.statsText}>🕑 {lote.caracteristicas[0].split(': ')[1]}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CattleColors.lightGray,
    },
    header: {
        backgroundColor: CattleColors.primary,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: CattleColors.accent,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    logoCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: CattleColors.accent,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        ...CattleShadows.button,
    },
    logoIcon: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: CattleColors.white,
        letterSpacing: 0.5,
    },
    backButton: {
        backgroundColor: CattleColors.secondary,
        borderRadius: 8,
    },
    headerLine: {
        height: 2,
        backgroundColor: CattleColors.accent,
        marginHorizontal: 20,
        borderRadius: 1,
    },
    
    // Reproductor de Video Principal
    videoPlayerContainer: {
        backgroundColor: CattleColors.black,
        paddingBottom: 20,
    },
    videoInfo: {
        backgroundColor: CattleColors.white,
        padding: 20,
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: CattleColors.primary,
        marginBottom: 10,
    },
    videoDescription: {
        fontSize: 16,
        color: CattleColors.black,
        lineHeight: 22,
        marginBottom: 15,
        opacity: 0.8,
    },
    videoStats: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    statsChip: {
        marginBottom: 5,
    },
    statsChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: CattleColors.primary,
    },
    
    // Lista de Videos
    listContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: CattleColors.primary,
        marginBottom: 20,
        textAlign: "center",
    },
    videoListItem: {
        flexDirection: "row",
        backgroundColor: CattleColors.white,
        borderRadius: 12,
        marginBottom: 15,
        overflow: "hidden",
        ...CattleShadows.card,
    },
    thumbnailContainer: {
        position: "relative",
        width: 120,
        height: 90,
    },
    thumbnail: {
        width: 120,
        height: 90,
        backgroundColor: CattleColors.mediumLightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    playIcon: {
        fontSize: 24,
    },
    videoDuration: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: CattleColors.white,
        fontSize: 10,
        fontWeight: "600",
    },
    videoItemInfo: {
        flex: 1,
        padding: 15,
        justifyContent: "space-between",
    },
    videoItemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    videoItemTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: CattleColors.primary,
        flex: 1,
        marginRight: 10,
    },
    estadoChip: {
        alignSelf: "flex-start",
    },
    statusChip: {
        height: 24,
        borderRadius: 12,
    },
    estadoChipText: {
        fontSize: 9,
        fontWeight: "600",
        color: CattleColors.white,
    },
    videoItemDescription: {
        fontSize: 14,
        color: CattleColors.black,
        lineHeight: 18,
        marginBottom: 10,
        opacity: 0.8,
    },
    videoItemStats: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    statsText: {
        fontSize: 12,
        color: CattleColors.mediumGray,
        marginRight: 8,
        fontWeight: "500",
    },
    
    // Estilos para la tabla
    tableCard: {
        backgroundColor: CattleColors.white,
        borderRadius: 12,
        marginBottom: 20,
        marginHorizontal: 20,
        ...CattleShadows.card,
    },
    tableHeader: {
        marginBottom: 15,
        alignItems: 'center',
    },
    tableTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: CattleColors.primary,
        textAlign: 'center',
    },
    dataTableHeader: {
        backgroundColor: CattleColors.lightGray,
        borderRadius: 8,
        marginBottom: 10,
    },
    dataTableTitle: {
        color: CattleColors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    dataTableRow: {
        borderBottomWidth: 1,
        borderBottomColor: CattleColors.mediumLightGray,
        paddingVertical: 8,
    },
    dataTableCell: {
        justifyContent: "center",
    },
    loteNumero: {
        color: CattleColors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    razaText: {
        color: CattleColors.black,
        fontSize: 12,
        fontWeight: "500",
    },
    pesoText: {
        color: CattleColors.secondary,
        fontSize: 12,
        fontWeight: "500",
    },
    edadText: {
        color: CattleColors.darkGray,
        fontSize: 12,
        fontWeight: "500",
    },
    precioText: {
        color: CattleColors.accent,
        fontSize: 12,
        fontWeight: "600",
    },
});
