import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, AppState } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Linking, Alert } from "react-native";
import { Button, Card, Title, Paragraph, Chip, IconButton } from "react-native-paper";
import { CattleColors, CattleShadows } from "../styles/colors";
import { cattleLots } from "../data/cattleLots";
import LoteInfoScreen from "../components/LoteInfoScreen";
import VideoScreen from "../components/VideoScreen";
import PujaPanel from "../components/PujaPanel";
import EventSource from 'react-native-event-source';
import useEventosWS from "../services/useEventosWS";
import { procesarEvento } from "../services/procesarEvento";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePuja } from "../hook/usePuja";
import { apiBaseUrl, wsBaseUrl } from "../config/env";
import AppHeader from "../components/AppHeader";
import SideMenu from "../components/SideMenu";
import usePujaWebSocket from '../hook/usePujaWebSocket';
import {
    extractUserBidFromPujas,
    getMyPuja,
    markNotifiedOutbid,
    markPujaOutbid,
    saveMyPuja,
    setCurrentViewedLote,
} from "../services/pujaPersistence";
import { notifyOutbid, registerExpoPushToken } from "../services/outbidNotifications";
import apiClient from "../api/apiClient";

const pickRemateCatalogUrl = (...candidates) => {
    for (const value of candidates) {
        const url = String(value ?? "").trim();
        if (url) return url;
    }
    return "";
};


const { width, height } = Dimensions.get('window');

function cerrarPantallaRemate() {
    navigation.navigate("RematesList"); // va a la lista de remates
}


export default function HomeScreen({ navigation, route }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isWinning, setIsWinning] = useState(false);
    const [leaderUserId, setLeaderUserId] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [showStatus, setShowStatus] = useState(false);

    const loteParam = route?.params?.lote;
    const remateParam = route?.params?.remate;
    const videoLote = loteParam?.video;
    const loteid = loteParam?.id ?? null;
    const numeroLote = loteParam?.numLote;
    const nombreLote = loteParam?.nombre || loteParam?.name || "";
    const razaLote = loteParam?.raza || "";
    const cabanaid = loteParam?.cabana?.id;
    const remateIdFromRoute = (() => {
        const raw =
            loteParam?.remate?.id ??
            loteParam?.remateId ??
            remateParam?.id ??
            route?.params?.remateId ??
            null;
        return raw != null && String(raw).trim() !== "" ? String(raw) : null;
    })();
    const [remateid, setRemateid] = useState(remateIdFromRoute);
    const [remateResolved, setRemateResolved] = useState(Boolean(remateIdFromRoute));
    const [remateCatalogUrl, setRemateCatalogUrl] = useState(() =>
        pickRemateCatalogUrl(remateParam?.urlListaLotes, loteParam?.remate?.urlListaLotes)
    );
    const baseInicial =
        Number(loteParam?.prelance ?? loteParam?.precio) || 0;
    const videoRef = useRef(null);
    const [counter, setCounter] = useState(null);
    const [myBidMonto, setMyBidMonto] = useState(null);
    const [userId, setUserId] = useState(null);
    const displayCounter = Number(counter) || 0;
    const { siguientePuja, incremento } = usePuja(displayCounter, baseInicial);

    const [source, setSource] = useState({
        uri: videoLote,
    });
    const [isError, setIsError] = useState(false);
    const [isBidding, setIsBidding] = useState(false);
    const ws = useRef(null);
    const lastUserBidValueRef = useRef(null);
    const pendingUserBidRef = useRef(false);
    const isBiddingRef = useRef(false);
    const userIdRef = useRef(null);
    const authHeaderRef = useRef({});
    ///esta funcion es para sacar a las personas del remate
    useEventosWS(remateid, (mensaje) => {
        procesarEvento(mensaje, navigation);
    });


    const getAuthHeader = async () => {
        const token = await AsyncStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };
    //web socket-----------------------------------------
    // useEffect(() => {
    //     if (!loteid || !remateid) return; // asegurarse que los IDs existen

    //     const remateId = remateid; // según tu código, remate.id parece ser remateId
    //     const wsUrl = `${wsBaseUrl}/ws/puja/${remateId}/${loteid}`;

    //     ws.current = new WebSocket(wsUrl);

    //     ws.current.onopen = () => {
    //         console.log("Conectado al WebSocket:", wsUrl);
    //     };

    //     ws.current.onmessage = (event) => {
    //         console.log("Mensaje recibido:", event.data);
    //         const valor = parseInt(event.data, 10);
    //         if (isNaN(valor)) return;
    //         setCounter(valor);

    //         if (pendingUserBidRef.current && lastUserBidValueRef.current !== null) {
    //             if (valor >= lastUserBidValueRef.current) {
    //                 pendingUserBidRef.current = false;
    //                 setIsWinning(true);
    //                 setStatusMessage("Tu tienes el lote, ¡felicidades!");
    //                 setShowStatus(true);
    //             }
    //         } else if (isWinning && lastUserBidValueRef.current !== null && valor > lastUserBidValueRef.current) {
    //             setIsWinning(false);
    //             setStatusMessage("Perdiste el lote");
    //             setShowStatus(true);
    //             lastUserBidValueRef.current = null;
    //         }
    //     };

    //     ws.current.onerror = (error) => {
    //         console.error("Error WebSocket:", error.message || error);
    //     };

    //     ws.current.onclose = (event) => {
    //         console.log("Conexión cerrada:", event.code, event.reason);
    //     };

    //     // Si quieres inicializar con un fetch igual que antes
    //     fetch(`${apiBaseUrl}/contador/${remateId}/${loteid}`)
    //         .then(res => res.json())
    //         .then(data => setCounter(data))
    //         .catch(err => console.error("Error fetch inicial:", err));

    //     return () => {
    //         if (ws.current) ws.current.close();
    //     };
    // }, [loteid, remateid]); // solo se ejecuta cuando estos cambian


usePujaWebSocket({
    loteid,
    remateid,

    wsBaseUrl,
    apiBaseUrl,

    setCounter,
    setIsWinning,
    setStatusMessage,
    setShowStatus,
    setLeaderUserId,

    pendingUserBidRef,
    lastUserBidValueRef,
    userIdRef,
    isWinning,
    onOutbid: async (valor) => {
        const userId = userIdRef.current;
        if (!userId || !loteid) return;

        await markPujaOutbid({
            userId,
            loteId: loteid,
            currentMonto: valor,
        });

        if (AppState.currentState === "active") return;

        await notifyOutbid({
            numeroLote,
            montoActual: valor,
            loteId: loteid,
            remateId: remateid,
        });
        await markNotifiedOutbid(userId, loteid);
    },
});

    // Resolver remate: params → AsyncStorage (evita crash si lote.remate viene vacío)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (remateIdFromRoute) {
                if (!cancelled) {
                    setRemateid(remateIdFromRoute);
                    setRemateResolved(true);
                }
                try {
                    await AsyncStorage.setItem("remate", remateIdFromRoute);
                } catch (_) {
                    /* ignore */
                }
                return;
            }
            try {
                const stored = await AsyncStorage.getItem("remate");
                if (!cancelled) {
                    setRemateid(stored || null);
                    setRemateResolved(true);
                }
            } catch (_) {
                if (!cancelled) {
                    setRemateid(null);
                    setRemateResolved(true);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [remateIdFromRoute, loteid]);

    // URL catálogo del remate (urlListaLotes), no confundir con lote.video
    useEffect(() => {
        const fromParams = pickRemateCatalogUrl(
            remateParam?.urlListaLotes,
            loteParam?.remate?.urlListaLotes
        );
        if (fromParams) {
            setRemateCatalogUrl(fromParams);
            return;
        }
        if (!remateid) {
            setRemateCatalogUrl("");
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const response = await apiClient.get(`/remates/${remateid}`);
                const url = pickRemateCatalogUrl(response.data?.urlListaLotes);
                if (!cancelled) setRemateCatalogUrl(url);
            } catch (error) {
                console.log("[CATÁLOGO] no se pudo cargar urlListaLotes del remate:", error?.message || error);
                if (!cancelled) setRemateCatalogUrl("");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        remateid,
        remateParam?.urlListaLotes,
        loteParam?.remate?.urlListaLotes,
        loteParam?.remate?.id,
    ]);

    useEffect(() => {
        if (!remateResolved) return;
        if (!loteid) {
            Alert.alert("Error", "No se pudo identificar el lote.", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
            return;
        }
        if (!remateid) {
            Alert.alert(
                "Error",
                "No se pudo identificar el remate de este lote.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        }
    }, [remateResolved, loteid, remateid, navigation]);

    //verificar si es usuario admin para mostrar el boton del panel de admin
    useEffect(() => {
    (async () => {
        try {
            const stored = await AsyncStorage.getItem("rol");
            if (!stored) {
                setIsAdmin(false);
                return;
            }

            const rolId = parseInt(stored, 10);
            if (Number.isNaN(rolId)) {
                setIsAdmin(false);
                return;
            }

            const ADMIN_ROLE_ID = 2;
            setIsAdmin(rolId === ADMIN_ROLE_ID);
        } catch (e) {
            console.log("Error leyendo rol del almacenamiento:", e);
            setIsAdmin(false);
        }
    })();
}, []);

    useEffect(() => {
        setCurrentViewedLote(loteid);
        return () => setCurrentViewedLote(null);
    }, [loteid]);

    useEffect(() => {
        (async () => {
            try {
                const [username, token, storedUserId] = await Promise.all([
                    AsyncStorage.getItem("usuario"),
                    AsyncStorage.getItem("authToken"),
                    AsyncStorage.getItem("userId"),
                ]);
                authHeaderRef.current = token ? { Authorization: `Bearer ${token}` } : {};

                if (storedUserId) {
                    const parsedId = Number(storedUserId);
                    userIdRef.current = parsedId;
                    setUserId(parsedId);
                }
                if (!username) return;

                const userRes = await fetch(`${apiBaseUrl}/api/usuarios/id/${username}`, {
                    headers: { ...authHeaderRef.current },
                });
                if (!userRes.ok) return;

                const userData = await userRes.json();
                const loadedUserId = userData.id ?? userData;
                userIdRef.current = loadedUserId;
                setUserId(loadedUserId);
                await AsyncStorage.setItem("userId", String(loadedUserId));
                registerExpoPushToken(loadedUserId, authHeaderRef.current);
            } catch (e) {
                console.log("Error precargando usuario:", e);
            }
        })();
    }, []);

    useEffect(() => {
        let cancelled = false;

        const restoreMyPuja = async () => {
            if (!loteid || !remateid || !userId) return;

            try {

                let myPuja = await getMyPuja(userId, loteid);
                console.log("[PUJA] restaurando local", myPuja);

                try {
                    const res = await fetch(`${apiBaseUrl}/api/pujas/remate/${remateid}`, {
                        headers: { ...authHeaderRef.current },
                    });
                    if (res.ok) {
                        const pujas = await res.json();
                        const apiMonto = extractUserBidFromPujas(pujas, {
                            userId,
                            loteId: loteid,
                        });
                        console.log("[PUJA] restaurando api", apiMonto);
                        if (apiMonto != null && (!myPuja || apiMonto !== Number(myPuja.monto))) {
                            myPuja = await saveMyPuja({
                                userId,
                                loteId: loteid,
                                remateId: remateid,
                                monto: apiMonto,
                                numeroLote,
                            });
                        }
                    }
                } catch (error) {
                    console.log("[PUJA] no se pudo sincronizar pujas:", error?.message || error);
                }

                if (cancelled || !myPuja) return;

                lastUserBidValueRef.current = Number(myPuja.monto);
                setMyBidMonto(Number(myPuja.monto));
            } catch (error) {
                console.log("[PUJA] error restaurando puja:", error?.message || error);
            }
        };

        restoreMyPuja();
        return () => {
            cancelled = true;
        };
    }, [loteid, remateid, numeroLote, userId]);

    useEffect(() => {
        if (myBidMonto == null || counter == null) return;

        lastUserBidValueRef.current = myBidMonto;

        // Preferir líder del servidor cuando esté disponible
        if (leaderUserId != null && userId != null) {
            const winning = Number(leaderUserId) === Number(userId);
            setIsWinning(winning);
            setShowStatus(true);
            setStatusMessage(
                winning ? "¡Vas ganando el lote!" : "Te superaron, pujá de nuevo"
            );
            return;
        }

        if (Number(counter) > Number(myBidMonto)) {
            setIsWinning(false);
            setShowStatus(true);
            setStatusMessage("Te superaron, pujá de nuevo");
        } else {
            setIsWinning(true);
            setShowStatus(true);
            setStatusMessage("¡Vas ganando el lote!");
        }
    }, [counter, myBidMonto, leaderUserId, userId]);

    useEffect(() => {
        let interval;
        if (isError) {
            // intentar reconectar cada 5 segundos
            interval = setInterval(() => {
                setSource({ uri: videoLote, key: Date.now() });

                setIsError(false);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isError]);

    const player = useVideoPlayer(
        { uri: videoLote },
        (player) => {
            player.loop = true;
            player.play();
        }
    );

    const incrementCounter = async () => {
    if (isBiddingRef.current) {
        console.log("[PUJA] tap ignorado: ya hay una puja en curso");
        return;
    }

    const t0 = Date.now();
    const elapsed = () => `+${Date.now() - t0}ms`;
    console.log(`[PUJA] 1. tap ${elapsed()}`, {
        counter,
        siguiente: siguientePuja,
        remateid,
        loteid,
        userIdCache: userIdRef.current,
    });

    isBiddingRef.current = true;
    setIsBidding(true);

    const nextValue = Number(siguientePuja);
    const safeNext = Number.isNaN(nextValue) ? Number(counter) : nextValue;

    lastUserBidValueRef.current = safeNext;
    pendingUserBidRef.current = true;
    setMyBidMonto(safeNext);
    setCounter(safeNext);
    if (userIdRef.current != null) {
        setLeaderUserId(Number(userIdRef.current));
    }
    setIsWinning(true);
    setStatusMessage("¡Vas ganando el lote!");
    setShowStatus(true);
    console.log(`[PUJA] 2. UI optimista ${elapsed()}`, { monto: safeNext });

    try {
        let userId = userIdRef.current;

        if (!userId) {
            console.log(`[PUJA] 3. buscando userId ${elapsed()}`);
            const username = await AsyncStorage.getItem("usuario");
            if (!username) {
                console.log(`[PUJA] STOP sin usuario en storage ${elapsed()}`);
                return;
            }

            const userRes = await fetch(`${apiBaseUrl}/api/usuarios/id/${username}`, {
                headers: {
                    ...(await getAuthHeader()),
                },
            });

            if (!userRes.ok) {
                console.log(`[PUJA] STOP error userId ${elapsed()}`, {
                    username,
                    status: userRes.status,
                });
                return;
            }

            const userData = await userRes.json();
            userId = userData.id ?? userData;
            userIdRef.current = userId;
            setUserId(userId);
            await AsyncStorage.setItem("userId", String(userId));
            console.log(`[PUJA] 3. userId listo ${elapsed()}`, userId);
        } else {
            console.log(`[PUJA] 3. userId cache ${elapsed()}`, userId);
        }

        const incrementUrl =
            `${apiBaseUrl}/contador/incrementar/${remateid}/${loteid}?userId=${encodeURIComponent(userId)}`;
        console.log(`[PUJA] 4. POST /contador/incrementar ${elapsed()}`, { userId });
        const incRes = await fetch(incrementUrl, {
            method: "POST",
        });
        const incBody = await incRes.text();
        const incCounter = Number(incBody);
        const finalMonto = !Number.isNaN(incCounter) ? incCounter : safeNext;
        if (!Number.isNaN(incCounter)) {
            setCounter(incCounter);
            lastUserBidValueRef.current = incCounter;
            setMyBidMonto(incCounter);
            setLeaderUserId(Number(userId));
        }
        console.log(`[PUJA] 5. contador incrementado ${elapsed()}`, incRes.status, incBody);

        saveMyPuja({
            userId,
            loteId: loteid,
            remateId: remateid,
            monto: finalMonto,
            numeroLote,
        }).catch((err) => console.log("[PUJA] error persistiendo", err));

        console.log(`[PUJA] 6. POST /api/pujas ${elapsed()}`, { monto: finalMonto, userId });
        fetch(`${apiBaseUrl}/api/pujas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaderRef.current,
            },
            body: JSON.stringify({
                fecha: new Date().toISOString().slice(0, 19),
                monto: finalMonto,
                visible: true,
                usuario: { id: userId },
                cabana: { id: cabanaid },
                lote: { id: loteid }
            })
        }).then((res) => {
            console.log(`[PUJA] 7. puja creada ${elapsed()}`, res.status);
        }).catch((err) => console.log(`[PUJA] ERROR creando puja ${elapsed()}`, err));

    } catch (err) {
        console.log(`[PUJA] ERROR incrementCounter ${elapsed()}`, err);
    } finally {
        console.log(`[PUJA] 8. botón desbloqueado ${elapsed()}`);
        isBiddingRef.current = false;
        setIsBidding(false);
    }
};


    const goToListView = () => {
        navigation.navigate('ListView');
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove([
                "usuario",
                "isLoggedIn",
                "rol",
                "authToken",
            ]);
        } catch (error) {
            console.error("Error limpiando sesión:", error);
        } finally {
            navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
            });
        }
    };

    const openMenu = () => setMenuVisible(true);

    // Datos de ejemplo para los lotes de ganado (primeros 4 lotes)
    const lotesData = cattleLots.slice(0, 4);

    const openRemateCatalog = async () => {
        const url = remateCatalogUrl.trim();
        if (!url) return;
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) {
                Alert.alert("Enlace no válido", "La URL del catálogo de este remate no es válida.");
                return;
            }
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert("Error", "No se pudo abrir el catálogo del remate.");
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader
                title={`Lote ${numeroLote ?? ""}`}
                onMenu={openMenu}
                onLogout={logout}
            />

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Video promocional */}
                <VideoScreen videoUri={videoLote} />

                <View style={styles.loteInfoBlock}>
                    <View style={styles.loteInfoRow}>
                        <Text style={styles.loteInfoLabel}>Número de lote</Text>
                        <Text style={styles.loteInfoValorDestacado}>
                            {numeroLote ?? "—"}
                        </Text>
                    </View>

                    <View style={styles.loteInfoDivider} />

                    <View style={styles.loteInfoRow}>
                        <Text style={styles.loteInfoLabel}>Nombre</Text>
                        <Text style={styles.loteInfoValor} numberOfLines={2}>
                            {nombreLote || "Sin nombre"}
                        </Text>
                    </View>

                    <View style={styles.loteInfoDivider} />

                    <View style={styles.loteInfoRow}>
                        <Text style={styles.loteInfoLabel}>Raza</Text>
                        <Text style={styles.loteInfoValor} numberOfLines={1}>
                            {razaLote || "No indicada"}
                        </Text>
                    </View>
                </View>

                <PujaPanel
                    counter={displayCounter}
                    siguientePuja={siguientePuja}
                    incremento={incremento}
                    isBidding={isBidding}
                    isWinning={isWinning}
                    showStatus={showStatus}
                    onPujar={incrementCounter}
                />


                {remateCatalogUrl ? (
                    <Button
                        mode="contained"
                        onPress={openRemateCatalog}
                        style={styles.navigationButton}
                        labelStyle={styles.navigationButtonText}
                        buttonColor={CattleColors.primary}
                        textColor={CattleColors.white}
                        icon="format-list-bulleted"
                    >
                        VER CATÁLOGO COMPLETO CON VIDEOS
                    </Button>
                ) : null}
            </ScrollView>

            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                navigation={navigation}
                isAdmin={isAdmin}
                remate={route?.params?.remate}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    cardPuja: {
        margin: 12,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        elevation: 4,
    },
    sectionPuja: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    textContainerPuja: {
        flex: 1,
    },
    labelPuja: {
        fontSize: 14,
        color: "#666666",
        fontWeight: "500",
        marginBottom: 4,
    },
    amountPuja: {
        fontSize: 24,
        fontWeight: "700",
        color: "#222222",
        marginBottom: 12,
    },
    nextLabelPuja: {
        fontSize: 14,
        color: "#666666",
        fontWeight: "500",
        marginBottom: 4,
    },
    nextAmountPuja: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1a73e8", // Azul empresarial
    },
    buttonPuja: {
        marginLeft: 16,
        borderRadius: 8,
        backgroundColor: "#1a73e8",
        height: 48,
        justifyContent: "center",
    },
    buttonTextPuja: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    container: {
        flex: 1,
        backgroundColor: CattleColors.lightGray,
    },
    containerWinning: {
        backgroundColor: "#0F3D2E",
    },
    statusBanner: {
        marginHorizontal: 12,
        marginTop: 10,
        marginBottom: 6,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    statusWin: {
        backgroundColor: "rgba(201, 162, 39, 0.15)",
        borderColor: CattleColors.accent,
    },
    statusLose: {
        backgroundColor: "rgba(214, 69, 65, 0.12)",
        borderColor: CattleColors.error,
    },
    statusText: {
        color: CattleColors.black,
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
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
    loteInfoBlock: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 18,
        backgroundColor: CattleColors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: CattleColors.mediumLightGray,
        borderLeftWidth: 4,
        borderLeftColor: CattleColors.accent,
        ...CattleShadows.card,
    },
    loteInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        gap: 12,
    },
    loteInfoDivider: {
        height: 1,
        backgroundColor: CattleColors.mediumLightGray,
    },
    loteInfoLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: CattleColors.mediumGray,
        flexShrink: 0,
        minWidth: 110,
    },
    loteInfoValor: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: CattleColors.primary,
        textAlign: "right",
    },
    loteInfoValorDestacado: {
        flex: 1,
        fontSize: 22,
        fontWeight: "800",
        color: CattleColors.primary,
        textAlign: "right",
    },

});

