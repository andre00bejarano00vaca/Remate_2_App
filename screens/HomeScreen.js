import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Modal } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Linking, Alert } from "react-native";
import { Button, Card, Title, Paragraph, Chip, IconButton, Portal, Menu, Divider } from "react-native-paper";
import { CattleColors, CattleShadows } from "../styles/colors";
import { cattleLots } from "../data/cattleLots";

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const videoRef = useRef(null);
    const [counter, setCounter] = useState(0);
    const [menuVisible, setMenuVisible] = useState(false);

    const [source, setSource] = useState({
        uri: "https://master.tucableip.com/tvlatina/index.ll.m3u8",
    });
    const [isError, setIsError] = useState(false);
     const ws = useRef(null);

     //web socket-----------------------------------------
  useEffect(() => {
    ws.current = new WebSocket("ws://192.168.0.119:8080/ws/contador");

    ws.current.onopen = () => {
      console.log("Conectado al WebSocket");
    };

    ws.current.onmessage = (event) => {
      console.log("Mensaje recibido:", event.data);
      setCounter(parseInt(event.data, 10)); // tu backend envía el número en texto
    };

    ws.current.onerror = (error) => {
      console.error("Error WebSocket:", error);
    };

    fetch("http://192.168.0.119:8080/contador")
   .then((res) => res.json())
   .then((data) => setCounter(data));

    ws.current.onclose = () => {
      console.log("Conexión cerrada");
    };


    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

    useEffect(() => {
        let interval;
        if (isError) {
            // intentar reconectar cada 5 segundos
            interval = setInterval(() => {
                console.log("Intentando reconectar...");
                setSource({ uri: "https://master.tucableip.com/tvlatina/index.ll.m3u8", key: Date.now() });

                setIsError(false);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isError]);

     const player = useVideoPlayer(
    { uri: "https://master.tucableip.com/tvlatina/index.ll.m3u8" },
    (player) => {
      player.loop = true;
      player.play();
    }
  );

    const incrementCounter = async () => {
        await fetch("http://192.168.0.119:8080/contador/incrementar", {
      method: "POST",
    });
    };

    const goToListView = () => {
        navigation.navigate('ListView');
    };

    const logout = () => {
        navigation.replace('Login');
    };

    const goToAdminPanel = () => {
        setMenuVisible(false);
        navigation.navigate('AdminPanel');
    };

    const goToHome = () => {
        setMenuVisible(false);
        // Ya estamos en Home, solo cerramos el menú
    };

    const goToCatalog = () => {
        setMenuVisible(false);
        navigation.navigate('ListView');
    };

    // Datos de ejemplo para los lotes de ganado (primeros 4 lotes)
    const lotesData = cattleLots.slice(0, 4);

    const openYouTube  = async () => {
  const url = "https://www.youtube.com/playlist?list=PL7dEzhx7AQdakwerQflhAhPYT9y-i_T2M";
  try {
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert("No se pudo abrir el enlace:", error.message);
  }
};

    return (
        <View style={styles.container}>
            {/* Header profesional */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    {/* Columna izquierda vacía para balancear */}
                    <View style={styles.sidePlaceholder} />

                    {/* Logo centrado */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../assets/PerfilELITE.png")}
                            style={styles.logoImage}
                        />
                    </View>

                    {/* Botón menú a la derecha */}
                    <View style={styles.headerButtons}>
                        <IconButton
                            icon="menu"
                            size={28}
                            iconColor={CattleColors.white}
                            onPress={() => setMenuVisible(true)}
                            style={styles.menuButton}
                        />
                        <IconButton
                            icon="logout"
                            size={28}
                            iconColor={CattleColors.white}
                            onPress={logout}
                            style={styles.logoutButton}
                        />
                    </View>
                </View>

                <View style={styles.headerLine} />
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Video promocional */}
                <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        onError={(e) => {
          console.log("Error en la transmisión:", e);
        }}
      />
      <Text style={styles.videoLabel}>
        Presentación del Remate Ganadero
      </Text>
    </View>

                {/* Información Adicional de Lotes */}
                {/* Sección de Monto con Contador */}
                <Card style={styles.counterCard}>
                    <Card.Content>
                        <View style={styles.counterSection}>
                            <View style={styles.textContainer}>
                                <Text style={styles.montoLabel}>MONTO ACTUAL</Text>
                                <Text style={styles.montoSubtitle}>Presiona para pujar</Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <Button
                                    mode="contained"
                                    onPress={incrementCounter}
                                    style={styles.counterButton}
                                    labelStyle={styles.counterButtonText}
                                    buttonColor={CattleColors.accent}
                                    textColor={CattleColors.white}
                                >
                                    ${counter.toLocaleString()}
                                </Button>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
                <Card style={styles.infoCard}>
                    <Card.Content>
                        <View style={styles.infoHeader}>
                            <Text style={styles.infoTitle}> INFORMACIÓN IMPORTANTE PARA COMPRADORES</Text>
                        </View>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoIcon}>🐄</Text>
                                <Text style={styles.infoLabel}>Raza</Text>
                                <Text style={styles.infoValue}>Brahman, Angus, Hereford</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoIcon}>⚖️</Text>
                                <Text style={styles.infoLabel}>Peso Promedio</Text>
                                <Text style={styles.infoValue}>400-500 kg</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoIcon}>🧬</Text>
                                <Text style={styles.infoLabel}>Genética</Text>
                                <Text style={styles.infoValue}>Certificada y Verificada</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoIcon}>💉</Text>
                                <Text style={styles.infoLabel}>Vacunas</Text>
                                <Text style={styles.infoValue}>Al día y Documentadas</Text>
                            </View>
                        </View>

                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>
                                ⚠️ Todos los animales han sido inspeccionados por veterinarios certificados.
                                Se recomienda revisar videos completos antes de hacer ofertas.
                            </Text>
                        </View>
                    </Card.Content>
                </Card>


                {/* Botón para ver catálogo completo */}
                <Button
                    mode="contained"
                    onPress={openYouTube}
                    style={styles.navigationButton}
                    labelStyle={styles.navigationButtonText}
                    buttonColor={CattleColors.primary}
                    textColor={CattleColors.white}
                    icon="format-list-bulleted"
                >
                    VER CATÁLOGO COMPLETO CON VIDEOS
                </Button>
            </ScrollView>

            {/* Menú Responsivo */}
            <Portal>
                <Modal
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    contentContainerStyle={styles.menuContainer}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.menuOverlay}>
                        <View style={styles.menuContent}>
                            <View style={styles.menuHeader}>
                                <Text style={styles.menuTitle}>Menú Principal</Text>
                                <IconButton
                                    icon="close"
                                    size={24}
                                    iconColor={CattleColors.primary}
                                    onPress={() => setMenuVisible(false)}
                                    style={styles.closeButton}
                                />
                            </View>
                            
                            <Divider style={styles.menuDivider} />
                            
                            <View style={styles.menuItems}>
                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={goToHome}
                                >
                                    <IconButton
                                        icon="home"
                                        size={24}
                                        iconColor={CattleColors.primary}
                                        style={styles.menuItemIcon}
                                    />
                                    <Text style={styles.menuItemText}>Inicio</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={openYouTube}
                                >
                                    <IconButton
                                        icon="format-list-bulleted"
                                        size={24}
                                        iconColor={CattleColors.primary}
                                        style={styles.menuItemIcon}
                                    />
                                    <Text style={styles.menuItemText}>Catálogo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={goToAdminPanel}
                                >
                                    <IconButton
                                        icon="cog"
                                        size={24}
                                        iconColor={CattleColors.primary}
                                        style={styles.menuItemIcon}
                                    />
                                    <Text style={styles.menuItemText}>Panel Admin</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={logout}
                                >
                                    <IconButton
                                        icon="logout"
                                        size={24}
                                        iconColor={CattleColors.error}
                                        style={styles.menuItemIcon}
                                    />
                                    <Text style={[styles.menuItemText, { color: CattleColors.error }]}>Cerrar Sesión</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Portal>
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
        paddingTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: CattleColors.accent,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },

    sidePlaceholder: {
        width: 40, // 👈 igual al ancho aproximado del botón para balancear
    },

    logoContainer: {
        flex: 1,
        height: 80,
        alignItems: "center",
        justifyContent: "center",
    },

    logoImage: {
        height: 150,
        aspectRatio: 1,
        resizeMode: "contain",
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
    logoutButton: {
        backgroundColor: CattleColors.secondary,
        borderRadius: 8,
    },
    headerLine: {
        height: 2,
        backgroundColor: CattleColors.accent,
        marginHorizontal: 20,
        borderRadius: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    videoContainer: {
        marginBottom: 25,
        alignItems: "center",
    },
    videoFrame: {
        borderWidth: 2,
        borderColor: CattleColors.mediumLightGray,
        borderRadius: 12,
        overflow: "hidden",
        ...CattleShadows.card,
    },
    video: {
        width: width - 46,
        height: 220,
        backgroundColor: CattleColors.mediumLightGray,
    },
    videoLabel: {
        marginTop: 12,
        fontSize: 16,
        color: CattleColors.primary,
        fontWeight: "500",
        textAlign: "center",
    },
    card: {
        backgroundColor: CattleColors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: CattleColors.mediumLightGray,
        marginBottom: 25,
        ...CattleShadows.card,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: CattleColors.primary,
        flex: 1,
    },
    cardBadge: {
        backgroundColor: CattleColors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    cardBadgeText: {
        color: CattleColors.white,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    tableHeader: {
        backgroundColor: CattleColors.lightGray,
        borderRadius: 8,
        marginBottom: 10,
    },
    tableTitle: {
        color: CattleColors.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    tableRow: {
        borderBottomWidth: 1,
        borderBottomColor: CattleColors.mediumLightGray,
        paddingVertical: 8,
    },
    tableCell: {
        justifyContent: "center",
    },
    loteNumero: {
        color: CattleColors.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    razaContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    razaText: {
        color: CattleColors.primary,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
    },
    pesoText: {
        color: CattleColors.secondary,
        fontSize: 11,
        fontWeight: "500",
    },
    caracteristicaText: {
        fontSize: 12,
        fontWeight: "500",
        color: CattleColors.darkGray,
        textAlign: 'center',
    },
    precioText: {
        color: CattleColors.accent,
        fontSize: 14,
        fontWeight: "600",
    },
    saludContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
    },
    saludChip: {
        height: 20,
        borderRadius: 10,
        marginBottom: 2,
    },
    saludChipText: {
        fontSize: 8,
        fontWeight: "600",
        color: CattleColors.white,
    },
    infoCard: {
        backgroundColor: CattleColors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: CattleColors.mediumLightGray,
        marginBottom: 25,
        ...CattleShadows.card,
    },
    infoHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: CattleColors.primary,
        textAlign: 'center',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: CattleColors.lightGray,
        borderRadius: 8,
    },
    infoIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: CattleColors.primary,
        marginBottom: 4,
        textAlign: 'center',
    },
    infoValue: {
        fontSize: 10,
        color: CattleColors.darkGray,
        textAlign: 'center',
        lineHeight: 14,
    },
    warningBox: {
        backgroundColor: CattleColors.warning,
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: CattleColors.error,
    },
    warningText: {
        fontSize: 12,
        color: CattleColors.white,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: "500",
    },
    counterCard: {
        backgroundColor: CattleColors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: CattleColors.mediumLightGray,
        marginBottom: 25,
        ...CattleShadows.card,
    },
    counterSection: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    textContainer: {
        flex: 1,
        marginRight: 20,
    },
    montoLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: CattleColors.primary,
        marginBottom: 5,
    },
    montoSubtitle: {
        fontSize: 14,
        color: CattleColors.mediumGray,
    },
    buttonContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    counterButton: {
        borderRadius: 8,
        minWidth: 100,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        ...CattleShadows.button,
    },
    counterButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    navigationButton: {
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 20,
        ...CattleShadows.button,
    },
    navigationButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    // Estilos del menú responsivo
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuButton: {
        backgroundColor: CattleColors.secondary,
        borderRadius: 8,
        marginRight: 8,
    },
    menuContainer: {
        flex: 1,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    menuContent: {
        backgroundColor: CattleColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
        maxHeight: height * 0.6,
        ...CattleShadows.card,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: CattleColors.primary,
    },
    closeButton: {
        margin: 0,
    },
    menuDivider: {
        marginVertical: 10,
        backgroundColor: CattleColors.mediumLightGray,
    },
    menuItems: {
        paddingVertical: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginVertical: 2,
    },
    menuItemIcon: {
        margin: 0,
        marginRight: 15,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: CattleColors.primary,
        flex: 1,
    },
});

