import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Text,
  Card,
  IconButton,
  Chip,
  Portal,
  Modal,
  Searchbar,
  Snackbar,
} from "react-native-paper";
import { CattleColors } from "../styles/colors";
import { List, RadioButton, Switch, DateTimePicker } from "react-native-paper";
import AuctionModal from "../components/AuctionModal";

import { getUsersPaginado, createteUser } from "../services/userService";
import { getAuctionsPaginado, createAuction, updateAuction, deleteAuction } from "../services/auctionService";
import { getLotsPaginado, createLot, updateLot, deleteLot } from "../services/lotService";
import { getBidsPaginado, createBid, updateBid, deleteBid } from "../services/bidService";

import { updateUser, deleteUser } from "../services/userService";
import { getCabanas, getCabanasPaginado, createCabana, updateCabana, deleteCabana } from "../services/cabanaService";
import PDFGenerator from "../components/PDFGenerator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReporteScreen from "../components/Reporte";
import apiClient from "../api/apiClient";
import { apiBaseUrl } from "../config/env";
import BidCorrectionModal from "../components/BidCorrectionModal"
import finalizarLote from "../services/finalizarLote";
import { DatePickerModal } from 'react-native-paper-dates';
import RematesScreen from "../components/RematesScreen";
import AppHeader from "../components/AppHeader";
import SideMenu from "../components/SideMenu";

const isRemateFinalizado = (estado) =>
  String(estado ?? "")
    .trim()
    .toLowerCase() === "finalizado";

export default function AdminPanelScreen({ navigation }) {

  const PAGE_SIZE = 20;

  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState('remates');
  const [loading, setLoading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [savingCard, setSavingCard] = useState(null); // { type, id }
  const [successCard, setSuccessCard] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });
  const successTimerRef = useRef(null);
  const [currentRolId, setCurrentRolId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const showToast = useCallback((message) => {
    setSnackbar({ visible: true, message });
  }, []);

  const clearCardFeedback = useCallback(() => {
    setSavingCard(null);
    setSuccessCard(null);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  const flashSuccessCard = useCallback((type, id) => {
    setSavingCard(null);
    if (id == null) return;
    setSuccessCard({ type, id });
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setSuccessCard(null);
      successTimerRef.current = null;
    }, 2200);
  }, []);

  const getCardStyle = useCallback(
    (baseStyle, type, id) => {
      const next = [baseStyle];
      if (savingCard?.type === type && savingCard?.id === id) next.push(styles.cardSaving);
      if (successCard?.type === type && successCard?.id === id) next.push(styles.cardSuccess);
      return next;
    },
    [savingCard, successCard]
  );

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const ROLE_PRIORITY = { 1: 1, 3: 2, 2: 3, 4: 4 }; // CLIENTE < COLABORADOR < ADMIN < SUPER_USUARIO
  const ROLE_OPTIONS = [
    { id: 1, name: "CLIENTE" },
    { id: 2, name: "ADMIN" },
    { id: 3, name: "COLABORADOR" },
    { id: 4, name: "SUPER_USUARIO" },
  ];
  const editableRoleOptions = ROLE_OPTIONS
    .filter(r => r.id !== 4)
    .filter(r => (ROLE_PRIORITY[currentRolId] || 0) > (ROLE_PRIORITY[r.id] || 0));

  const buildUserPayload = (user, includePassword = false) => {
    const rolId = typeof user?.rol === "object" && user?.rol !== null
      ? user.rol.id
      : (user?.rol ?? user?.rolId);

    const toLong = (value) => {
      if (value === "" || value === undefined || value === null) return null;
      const n = Number(value);
      return Number.isNaN(n) ? null : n;
    };

    const payload = {
      username: user?.username,
      nombre: user?.nombre,
      celular: toLong(user?.celular),
      ci: toLong(user?.ci),
      aprobado: Boolean(user?.aprobado),
      visible: user?.visible !== false,
      rol: rolId != null ? Number(rolId) : null,
    };

    if (includePassword && user?.password) {
      payload.password = user.password;
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null) delete payload[key];
    });

    return payload;
  };

  // Usuarios
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [userTotalElements, setUserTotalElements] = useState(0);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const reportes = {
    remate: "Remate Primavera 2025",
    fecha: "30/10/2025",
    lugar: "Centro Ganadero Santa Cruz",
    lote: {
      numero: 12,
      tipo: "Toros Brahman",
      cantidad: 8,
      pesoPromedio: 450,
    },
    prelances: [
      { postor: "Ganadera El Sol", monto: 4500 },
      { postor: "Estancia La Palma", monto: 4700 },
      { postor: "Agropecuaria San José", monto: 5000 },
    ],
    ganador: "Agropecuaria San José",
    precioFinal: 5000,
  };

  // Remates
  const [auctions, setAuctions] = useState([]);
  const [auctionPage, setAuctionPage] = useState(0);
  const [auctionTotalPages, setAuctionTotalPages] = useState(0);
  const [auctionTotalElements, setAuctionTotalElements] = useState(0);
  const [auctionSearchQuery, setAuctionSearchQuery] = useState('');
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);


  // Lotes
  const [cattleLots, setCattleLots] = useState([]);
  const [lotPage, setLotPage] = useState(0);
  const [lotTotalPages, setLotTotalPages] = useState(0);
  const [lotTotalElements, setLotTotalElements] = useState(0);
  const [lotSearchQuery, setLotSearchQuery] = useState('');
  const [showLotModal, setShowLotModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);

  //cabanas
  const [cabanas, setCabanas] = useState([]);
  const [cabanasForSelect, setCabanasForSelect] = useState([]);
  const [cabanaPage, setCabanaPage] = useState(0);
  const [cabanaTotalPages, setCabanaTotalPages] = useState(0);
  const [cabanaTotalElements, setCabanaTotalElements] = useState(0);
  const [cabanaSearchQuery, setCabanaSearchQuery] = useState('');
  const [showCabanaModal, setShowCabanaModal] = useState(false);
  const [editingCabana, setEditingCabana] = useState(null);


  // Pujas
  const [bids, setBids] = useState([]);
  const [bidPage, setBidPage] = useState(0);
  const [bidTotalPages, setBidTotalPages] = useState(0);
  const [bidTotalElements, setBidTotalElements] = useState(0);
  const [bidSearchQuery, setBidSearchQuery] = useState('');
  const [correctionVisible, setCorrectionVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [newBidValue, setNewBidValue] = useState("");
  const [loteId, setLoteId] = useState()

  // Reportes
  const [reports, setReports] = useState({});

  // Cargar datos de ejemplo
  useEffect(() => {
    loadAuctions(0);
  }, []);
  useEffect(() => {
    const loadCurrentRole = async () => {
      try {
        const stored = await AsyncStorage.getItem("rol");
        if (!stored) {
          setCurrentRolId(null);
          setIsAdmin(false);
          return;
        }
        const asNumber = parseInt(stored, 10);
        if (Number.isNaN(asNumber)) {
          setCurrentRolId(null);
          setIsAdmin(false);
          return;
        }
        setCurrentRolId(asNumber);
        setIsAdmin(asNumber === 2 || asNumber === 4);
      } catch (error) {
        console.error("Error leyendo rol actual:", error);
        setCurrentRolId(null);
        setIsAdmin(false);
      }
    };
    loadCurrentRole();
  }, []);

  useEffect(() => {
    const loadLoteId = async () => {
      try {
        const id = await AsyncStorage.getItem("Lote");
        setLoteId(id);
      } catch (_) {
        /* ignore */
      }
    };
    loadLoteId();
  }, []);

  useEffect(() => {
    if (activeTab === "usuarios") loadUser(userPage);
    else if (activeTab === "remates") loadAuctions(auctionPage);
    else if (activeTab === "lotes") loadLots(lotPage);
    else if (activeTab === "cabanas") loadCabanas(cabanaPage);
    else if (activeTab === "pujas") loadPujas(bidPage);
  }, [activeTab]);

  // Cabañas para selects de remate/lote (lista completa, no depende del tab)
  useEffect(() => {
    if (showAuctionModal || showLotModal) {
      loadCabanasForSelect();
    }
  }, [showAuctionModal, showLotModal]);

  const applyPage = (data, setters) => {
    const content = data?.content ?? [];
    setters.setItems(content);
    setters.setPage(data?.page ?? 0);
    setters.setTotalPages(data?.totalPages ?? 0);
    setters.setTotalElements(data?.totalElements ?? 0);
    return content;
  };

  const loadUser = async (pageToLoad = userPage) => {
    try {
      const data = await getUsersPaginado({ page: pageToLoad, size: PAGE_SIZE });
      applyPage(data, {
        setItems: setUsers,
        setPage: setUserPage,
        setTotalPages: setUserTotalPages,
        setTotalElements: setUserTotalElements,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "usuarios") await loadUser(userPage);
      else if (activeTab === "remates") await loadAuctions(auctionPage);
      else if (activeTab === "lotes") await loadLots(lotPage);
      else if (activeTab === "cabanas") await loadCabanas(cabanaPage);
      else if (activeTab === "pujas") await loadPujas(bidPage);
      else await loadAuctions(0);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  // Funciones de acción
  const handleUserAction = async (userId, action, data = null, newRole = null, rolId) => {
    if (userId != null) setSavingCard({ type: "usuario", id: userId });
    setLoading(true);
    try {
      if (action === "approve") {
        await updateUser(userId, { aprobado: true });
      } else if (action === "reject") {
        await updateUser(userId, { aprobado: false });
      } else if (action === "changeRole") {
        await updateUser(userId, { rol: rolId });
      } else if (action === "delete") {
        await updateUser(userId, { ...data, visible: false });
      } else if (action === "update") {
        const payload = buildUserPayload(data, Boolean(data?.password));
        await updateUser(userId, payload);
      } else if (action === "create") {
        const payload = buildUserPayload(data, true);
        await createteUser(payload);
      }
      await loadUser(userPage);
      if (action === "create") {
        clearCardFeedback();
        showToast("Usuario creado");
      } else if (action === "approve") {
        flashSuccessCard("usuario", userId);
        showToast("Usuario aprobado");
      } else if (action === "reject") {
        flashSuccessCard("usuario", userId);
        showToast("Usuario rechazado");
      } else if (action === "delete" || data?.visible === false) {
        clearCardFeedback();
        showToast("Usuario eliminado");
      } else {
        flashSuccessCard("usuario", userId);
        showToast("Usuario actualizado");
      }
    } catch (error) {
      clearCardFeedback();
      Alert.alert("Error", "No se pudo realizar la acción" + error.message);
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const handleAuctionAction = async (auctionId, action, data = null) => {
    if (auctionId != null) setSavingCard({ type: "remate", id: auctionId });
    setLoading(true);
    try {
      let saved = null;
      if (action === "create") {
        saved = await createAuction(data);
      } else if (action === "update") {
        saved = await updateAuction(auctionId, data);
      } else if (action === "delete") {
        await deleteAuction(auctionId);
      }
      await loadAuctions(auctionPage);
      const softDelete = action === "update" && data?.visible === false;
      if (action === "delete" || softDelete) {
        clearCardFeedback();
        showToast("Remate eliminado");
      } else if (action === "create") {
        flashSuccessCard("remate", saved?.id);
        showToast("Remate creado");
      } else {
        flashSuccessCard("remate", auctionId);
        showToast("Remate actualizado");
      }
      return saved;
    } catch (error) {
      clearCardFeedback();
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLotAction = async (lotId, action, data = null) => {
    if (lotId != null) setSavingCard({ type: "lote", id: lotId });
    setLoading(true);
    try {
      let saved = null;
      if (action === "create") {
        saved = await createLot(data);
      } else if (action === "update") {
        saved = await updateLot(lotId, data);
      } else if (action === "delete") {
        await deleteLot(lotId);
      }
      await loadLots(lotPage);
      const softDelete = action === "update" && data?.visible === false;
      if (action === "delete" || softDelete) {
        clearCardFeedback();
        showToast("Lote eliminado");
      } else if (action === "create") {
        flashSuccessCard("lote", saved?.id);
        showToast("Lote creado");
      } else {
        flashSuccessCard("lote", lotId);
        showToast("Lote actualizado");
      }
      return saved;
    } catch (error) {
      clearCardFeedback();
      Alert.alert("Error", "No se pudo procesar el lote");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadAuctions = async (pageToLoad = auctionPage) => {
    try {
      const data = await getAuctionsPaginado({ page: pageToLoad, size: PAGE_SIZE });
      const content = applyPage(data, {
        setItems: setAuctions,
        setPage: setAuctionPage,
        setTotalPages: setAuctionTotalPages,
        setTotalElements: setAuctionTotalElements,
      });
      setReports((prev) => ({
        ...prev,
        totalAuctions: data?.totalElements ?? content.length,
      }));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los remates");
    }
  };

  const handleFinalizarRemate = (remate) => {
    if (!remate?.id) return;

    if (isRemateFinalizado(remate.estado)) {
      Alert.alert("Remate finalizado", "Este remate ya está marcado como finalizado.");
      return;
    }

    const loteParaFinalizar =
      loteId ??
      cattleLots.find(
        (l) =>
          String(l?.remate?.id ?? l?.remateId) === String(remate.id) && l?.visible !== false
      )?.id;

    if (!loteParaFinalizar) {
      Alert.alert(
        "Lote requerido",
        "Abrí un lote de este remate en la app o andá a la pestaña Lotes para que el sistema identifique el lote activo, y volvé a intentar."
      );
      return;
    }

    Alert.alert(
      "Finalizar remate",
      `¿Finalizar "${remate.nombre}"? Se notificará a los usuarios conectados y no podrán seguir pujando en vivo.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await finalizarLote(remate.id, loteParaFinalizar);
              await loadAuctions(auctionPage);
              Alert.alert("Listo", "Remate finalizado correctamente.");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo finalizar el remate.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const loadLots = async (pageToLoad = lotPage) => {
    try {
      const data = await getLotsPaginado({ page: pageToLoad, size: PAGE_SIZE });
      const content = applyPage(data, {
        setItems: setCattleLots,
        setPage: setLotPage,
        setTotalPages: setLotTotalPages,
        setTotalElements: setLotTotalElements,
      });
      setReports((prev) => ({
        ...prev,
        totalLots: data?.totalElements ?? content.length,
        totalSales: content.reduce((sum, l) => sum + (l.puja || 0), 0),
      }));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los lotes");
    }
  };

  const loadCabanas = async (pageToLoad = cabanaPage) => {
    try {
      const data = await getCabanasPaginado({ page: pageToLoad, size: PAGE_SIZE });
      applyPage(data, {
        setItems: setCabanas,
        setPage: setCabanaPage,
        setTotalPages: setCabanaTotalPages,
        setTotalElements: setCabanaTotalElements,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar las cabañas");
    }
  };

  const loadCabanasForSelect = async () => {
    try {
      const data = await getCabanas();
      const list = Array.isArray(data) ? data : data?.content ?? [];
      setCabanasForSelect(list);
    } catch (error) {
      console.error("Error cargando cabañas para select:", error);
      setCabanasForSelect([]);
    }
  };

  const loadPujas = async (pageToLoad = bidPage) => {
    try {
      const remateId = await AsyncStorage.getItem("remate");
      if (remateId) {
        const response = await apiClient.get(`/pujas/remate/${remateId}`);
        const list = Array.isArray(response.data) ? response.data : [];
        const ordered = [...list].sort((a, b) => (b.id || 0) - (a.id || 0));
        const totalPages = ordered.length === 0 ? 0 : Math.ceil(ordered.length / PAGE_SIZE);
        const start = pageToLoad * PAGE_SIZE;
        setBids(ordered.slice(start, start + PAGE_SIZE));
        setBidPage(pageToLoad);
        setBidTotalElements(ordered.length);
        setBidTotalPages(totalPages);
        return;
      }

      const data = await getBidsPaginado({ page: pageToLoad, size: PAGE_SIZE });
      applyPage(data, {
        setItems: setBids,
        setPage: setBidPage,
        setTotalPages: setBidTotalPages,
        setTotalElements: setBidTotalElements,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar las pujas");
    }
  };

  //cabanas 
  const handleCabanaAction = async (cabanaId, action, data = null) => {
    if (cabanaId != null) setSavingCard({ type: "cabana", id: cabanaId });
    setLoading(true);
    try {
      let saved = null;
      if (action === "create") {
        saved = await createCabana(data);
      } else if (action === "update") {
        saved = await updateCabana(cabanaId, data);
      } else if (action === "delete") {
        await deleteCabana(cabanaId);
      }
      await loadCabanas(cabanaPage);
      await loadCabanasForSelect();
      const softDelete = action === "update" && data?.visible === false;
      if (action === "delete" || softDelete) {
        clearCardFeedback();
        showToast("Cabaña eliminada");
      } else if (action === "create") {
        flashSuccessCard("cabana", saved?.id);
        showToast("Cabaña creada");
      } else {
        flashSuccessCard("cabana", cabanaId);
        showToast("Cabaña actualizada");
      }
      return saved;
    } catch (error) {
      clearCardFeedback();
      Alert.alert("Error", "No se pudo procesar la cabaña");
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const openCorrectionModal = (bid) => {
    setSelectedBid(bid);
    setNewBidValue(String(bid.monto));
    setCorrectionVisible(true);
  };

  const handleBidAction = async (bidId, action, data = null) => {
    if (bidId != null) setSavingCard({ type: "puja", id: bidId });
    setLoading(true);
    try {
      if (action === "create") {
        await createBid(data);
      } else if (action === "update") {
        await updateBid(bidId, data);
      } else if (action === "delete") {
        await deleteBid(bidId);
      }
      await loadPujas(bidPage);
      if (action === "delete") {
        clearCardFeedback();
        showToast("Puja eliminada");
      } else if (action === "create") {
        clearCardFeedback();
        showToast("Puja creada");
      } else {
        flashSuccessCard("puja", bidId);
        showToast("Puja actualizada");
      }
    } catch (error) {
      clearCardFeedback();
      Alert.alert("Error", "No se pudo procesar la puja");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const renderPagination = (page, totalPages, totalElements, onChangePage, label) => {
    if (!totalElements) return null;
    const canPrev = page > 0;
    const canNext = totalPages > 0 && page < totalPages - 1;
    return (
      <View style={styles.paginationRow}>
        <Text style={styles.paginationInfo}>
          Página {page + 1} de {Math.max(totalPages, 1)} · {totalElements} {label}
        </Text>
        <View style={styles.paginationButtons}>
          <Button
            mode="outlined"
            compact
            disabled={!canPrev}
            onPress={() => onChangePage(page - 1)}
          >
            Anterior
          </Button>
          <Button
            mode="outlined"
            compact
            disabled={!canNext}
            onPress={() => onChangePage(page + 1)}
          >
            Siguiente
          </Button>
        </View>
      </View>
    );
  };

  const openAddModal = () => {
    if (activeTab === 'remates') {
      setEditingAuction(null);
      setShowAuctionModal(true);
    } else if (activeTab === 'lotes') {
      setEditingLot(null);
      setShowLotModal(true);
    } else if (activeTab === 'usuarios') {
      setEditingUser({
        username: "",
        nombre: "",
        celular: "",
        ci: "",
        aprobado: false,
        visible: true,
        rol: 1,
      });
      setShowUserModal(true);
    } else if (activeTab === 'cabanas') {
      setEditingCabana(null);
      setShowCabanaModal(true);
    }
  };

  const renderSearchRow = (placeholder, query, setQuery, showAdd = false) => (
    <View style={styles.searchRow}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={setQuery}
        value={query}
        style={styles.searchbar}
      />
      {showAdd && (
        <Button
          mode="contained"
          icon="plus"
          onPress={openAddModal}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          labelStyle={styles.addButtonLabel}
          compact
        >
          Añadir
        </Button>
      )}
    </View>
  );

  const renderTabButton = (tabKey, title, icon) => (
    <Button
      mode={activeTab === tabKey ? "contained" : "outlined"}
      onPress={() => setActiveTab(tabKey)}
      style={[styles.tabButton, activeTab === tabKey && styles.activeTab]}
      icon={icon}
      compact
    >
      {title}
    </Button>
  );

  // Render Users Tabs
  const renderUsersTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {renderSearchRow("Buscar usuarios...", userSearchQuery, setUserSearchQuery, true)}
      {users
        // Filtrar por username y rol
        .filter(u =>
          u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          (u.rol?.name || '').toLowerCase().includes(userSearchQuery.toLowerCase())
        )
        // Mostrar solo los visibles y ocultar SUPER_USUARIO
        .filter(u => u.visible !== false)
        .filter(u => (u.rol?.id || u.rolId) !== 4 && (u.rol?.name || '').toUpperCase() !== "SUPER_USUARIO")
        .map(user => {
          const userRolId = user.rol?.id || user.rolId;
          const currentPriority = ROLE_PRIORITY[currentRolId] || 0;
          const targetPriority = ROLE_PRIORITY[userRolId] || 0;
          const canEditRoles = currentPriority > targetPriority;
          return (
            <Card key={user.id} style={getCardStyle(styles.card, "usuario", user.id)}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.username}</Text>
                    <Text style={styles.userEmail}>Rol: {user.rol?.name || "—"}</Text>
                    <Text style={styles.userEmail}>Nombre: {user.nombre || "—"}</Text>
                    <Text style={styles.userEmail}>Celular: {user.celular || "—"}</Text>
                    <Text style={styles.userEmail}>CI: {user.ci || "—"}</Text>
                    <View style={styles.chipContainer}>
                      <Chip
                        style={{ marginRight: 8, marginBottom: 8 }}
                        textStyle={{
                          color: user.aprobado
                            ? CattleColors.success
                            : CattleColors.error
                        }}
                      >
                        {user.aprobado ? 'Aprobado' : 'Pendiente'}
                      </Chip>
                      <Chip
                        style={{
                          marginRight: 8,
                          marginBottom: 8,
                          backgroundColor: CattleColors.accent
                        }}
                      >
                        {user.rol?.name || "—"}
                      </Chip>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    {!user.aprobado && (
                      <>
                        <IconButton
                          icon="check"
                          iconColor={CattleColors.success}
                          onPress={() => handleUserAction(user.id, 'approve', user)}
                        />
                        <IconButton
                          icon="close"
                          iconColor={CattleColors.error}
                          onPress={() => handleUserAction(user.id, 'reject', user)}
                        />
                      </>
                    )}
                    <IconButton
                      icon="pencil"
                      iconColor={CattleColors.info}
                      onPress={() => {
                        setEditingUser({
                          ...user,
                          rol: user.rol?.id || user.rolId,
                        });
                        setShowUserModal(true);
                      }}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      {renderPagination(userPage, userTotalPages, userTotalElements, loadUser, "usuarios")}
    </ScrollView>
  );

  //-------------remates---------------
  const renderAuctionsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {renderSearchRow("Buscar remates...", auctionSearchQuery, setAuctionSearchQuery, true)}
      {auctions
        .filter(a =>
          a.nombre.toLowerCase().includes(auctionSearchQuery.toLowerCase())
        ).filter(a => a.visible)
        .map(a => {
          const [fecha, hora] = (a.fecha || '').split('T');
          const [fechaFin, horaFin] = (a.fechaFin || '').split('T');

          return (
            <Card key={a.id} style={getCardStyle(stylesCardRemate.card, "remate", a.id)}>
              <Card.Content>

                {/* Header con texto + iconos */}
                <View style={stylesCardRemate.headerRow}>
                  <Text style={stylesCardRemate.title}>{a.nombre}</Text>

                  <View style={stylesCardRemate.headerActions}>
                    <IconButton
                      icon="pencil"
                      iconColor={CattleColors.info}
                      size={22}
                      onPress={() => {
                        setEditingAuction(a);
                        setShowAuctionModal(true);
                      }}
                    />
                    <IconButton
                      icon="delete"
                      iconColor={CattleColors.error}
                      size={22}
                      onPress={() =>
                        handleAuctionAction(a.id, "update", { ...a, visible: false })
                      }
                    />
                  </View>
                </View>

                {/* Info debajo */}
                <Text style={stylesCardRemate.subtitle}>Fecha de Inicio: {fecha}</Text>
                <Text style={stylesCardRemate.subtitle}>Hora de Inicio: {hora}</Text>
                <Text style={stylesCardRemate.subtitle}>Fecha de Finalización : {fechaFin}</Text>
                <Text style={stylesCardRemate.subtitle}>Hora de Finalización: {horaFin}</Text>
                <Text style={stylesCardRemate.subtitle}>Cabaña: {a.cabana?.nombre}</Text>
                <Text style={stylesCardRemate.subtitle}>
                  Estado: {a.estado?.trim() || "Sin estado"}
                </Text>

                {isRemateFinalizado(a.estado) ? (
                  <Chip
                    icon="check-circle"
                    style={stylesCardRemate.finalizadoChip}
                    textStyle={stylesCardRemate.finalizadoChipText}
                  >
                    Remate finalizado
                  </Chip>
                ) : (
                  <Button
                    mode="contained"
                    icon="stop-circle"
                    buttonColor="#C62828"
                    textColor="white"
                    style={stylesCardRemate.finishButton}
                    contentStyle={stylesCardRemate.finishButtonContent}
                    labelStyle={stylesCardRemate.finishButtonLabel}
                    onPress={() => handleFinalizarRemate(a)}
                  >
                    Finalizar remate
                  </Button>
                )}


              </Card.Content>
            </Card>


          )
        })}
      {renderPagination(auctionPage, auctionTotalPages, auctionTotalElements, loadAuctions, "remates")}
    </ScrollView>
  );
  //---------------------Lotes ----------------------------------
  const renderLotsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {renderSearchRow("Buscar lotes...", lotSearchQuery, setLotSearchQuery, true)}

      {cattleLots
        .filter(l => l.nombre.toLowerCase().includes(lotSearchQuery.toLowerCase()))
        // .filter(l => l.visible)
        .map(l => {
          return (
            <Card key={l.id} style={getCardStyle(styles.card, "lote", l.id)}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    {/* Nombre y raza */}
                    <Text style={styles.userName}>{l.nombre}</Text>
                    <Text style={styles.userEmail}>Raza: {l.raza}</Text>

                    {/* Información de precios */}
                    <View style={{ marginVertical: 5 }}>
                      <Text>Precio Inicial: ${l.precio}</Text>
                      {/*<Text>Prelance: ${l.prelance}</Text>*/}
                      <Text>Puja mínima: ${l.puja}</Text>
                    </View>

                    {/* Estado */}
                    {/*<Chip style={{ marginTop: 5 }}>{l.estado || "SIN ESTADO"}</Chip>*/}

                    {/* Información de cabana/remate */}
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>Remate:</Text>
                      <Text>{l.remate?.nombre}</Text>
                      <Text style={{ color: CattleColors.mediumGray }}>
                        Cabaña: {l.cabana?.nombre}
                      </Text>
                    </View>
                  </View>

                  {/* Botones de acción */}
                  <View style={styles.actionButtons}>
                    <IconButton
                      icon="pencil"
                      iconColor={CattleColors.info}
                      onPress={() => {
                        setEditingLot(l);
                        setShowLotModal(true);
                      }}
                    />
                    <IconButton
                      icon="delete"
                      iconColor={CattleColors.error}
                      onPress={() => handleLotAction(l.id, "update", { ...l, visible: false })}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          )
        })}
      {renderPagination(lotPage, lotTotalPages, lotTotalElements, loadLots, "lotes")}
    </ScrollView>
  );

  //--------------------cabanas -------------------------
  const renderCabanasTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {renderSearchRow("Buscar cabañas...", cabanaSearchQuery, setCabanaSearchQuery, true)}
      {cabanas
        .filter(c =>
          c.nombre.toLowerCase().includes(cabanaSearchQuery.toLowerCase())
        )
        .filter(c => c.visible)
        .map(c => (
          <Card key={c.id} style={getCardStyle(styles.card, "cabana", c.id)}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{c.nombre}</Text>
                  <Text style={styles.userEmail}>Teléfono: {c.telefono}</Text>

                </View>

                <View style={styles.actionButtons}>
                  <IconButton
                    icon="pencil"
                    iconColor={CattleColors.info}
                    onPress={() => {
                      setEditingCabana(c);
                      setShowCabanaModal(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    iconColor={CattleColors.error}
                    onPress={() =>
                      handleCabanaAction(c.id, "update", { ...c, visible: false })
                    }
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      {renderPagination(cabanaPage, cabanaTotalPages, cabanaTotalElements, loadCabanas, "cabañas")}
    </ScrollView>
  );

  // -------------------pujas-----------------------------
  // ------------------- RENDER TAB PUJAS -----------------------------
  const renderBidsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {renderSearchRow("Buscar por monto...", bidSearchQuery, setBidSearchQuery)}

      {(Array.isArray(bids) ? bids : [])
        .filter(b => `${b.monto ?? ""}`.includes(bidSearchQuery))
        .map(b => {
        return (

          <Card key={b.id} style={getCardStyle(styles.card, "puja", b.id)}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>
                    Lote {b.lote?.numLote}: {b.lote?.nombre}
                  </Text>

                  <Text style={[styles.userEmail, { fontWeight: 'bold', color: CattleColors.primary }]}>
                    {b.lote?.remate?.nombre}
                  </Text>

                  <Text style={styles.userEmail}>
                    Oferta: ${b.monto?.toLocaleString()}
                  </Text>
                </View>

                {/* BOTONES DE ACCIÓN */}
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="close"
                    iconColor={CattleColors.error}
                    onPress={() => handleBidAction(b.id, 'forceClose')}
                  />

                  {/* NUEVO BOTÓN: MODIFICAR MONTO */}
                  <IconButton
                    icon="pencil"
                    iconColor={CattleColors.warning}
                    onPress={() => openCorrectionModal(b)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )
      })}
      {renderPagination(bidPage, bidTotalPages, bidTotalElements, loadPujas, "pujas")}
    </ScrollView>
  );

  const renderReportsTab = () => (
    <RematesScreen />
  );

  const isInitialLoading =
    loading &&
    users.length === 0 &&
    auctions.length === 0 &&
    cattleLots.length === 0 &&
    cabanas.length === 0 &&
    bids.length === 0;

  if (isInitialLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={CattleColors.primary} />
        <Text style={styles.loadingText}>Cargando panel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <AppHeader
          title="PANEL ADMINISTRADOR"
          onMenu={() => setMenuVisible(true)}
          onLogout={async () => {
            try {
              await AsyncStorage.multiRemove(["usuario", "isLoggedIn", "rol", "authToken"]);
            } finally {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }
          }}
        />
        <Title style={styles.title}>PANEL ADMINISTADOR</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
          {renderTabButton('usuarios', 'Usuarios', 'account')}
          {renderTabButton('remates', 'Remates', 'calendar')}
          {renderTabButton('lotes', 'Lotes', 'cow')}
          {renderTabButton('cabanas', 'Cabañas', 'home')}
          {renderTabButton('pujas', 'Pujas', 'gavel')}
          {renderTabButton('reportes', 'Reportes', 'chart-line')}

        </ScrollView>

        <View style={styles.contentContainer}>
          {activeTab === 'usuarios' && renderUsersTab()}
          {activeTab === 'remates' && renderAuctionsTab()}
          {activeTab === 'lotes' && renderLotsTab()}
          {activeTab === 'cabanas' && renderCabanasTab()}
          {activeTab === 'pujas' && renderBidsTab()}
          {activeTab === 'reportes' && renderReportsTab()}

        </View>

        <Portal>
          {/* 🧑 Modal de Usuario */}
          <Modal
            visible={showUserModal}
            onDismiss={() => {
              if (modalSaving) return;
              setShowUserModal(false);
            }}
            contentContainerStyle={styles.modalWrapper}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modal}
            >
              <Title style={styles.modalTitle}>
                {editingUser?.id ? "Editar Usuario" : "Crear Usuario"}
              </Title>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                bounces={false}
              >
                <TextInput
                  label="Nombre de usuario"
                  style={styles.input}
                  value={editingUser?.username || ""}
                  onChangeText={(text) =>
                    setEditingUser((prev) => ({ ...(prev || {}), username: text }))
                  }
                />

                {!editingUser?.id && (
                  <TextInput
                    label="Contraseña"
                    style={styles.input}
                    secureTextEntry
                    value={editingUser?.password || ""}
                    onChangeText={(text) =>
                      setEditingUser((prev) => ({ ...(prev || {}), password: text }))
                    }
                  />
                )}

                <TextInput
                  label="Nombre"
                  style={styles.input}
                  value={editingUser?.nombre || ""}
                  onChangeText={(text) =>
                    setEditingUser((prev) => ({ ...(prev || {}), nombre: text }))
                  }
                />

                <TextInput
                  label="Celular"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editingUser?.celular || ""}
                  onChangeText={(text) =>
                    setEditingUser((prev) => ({ ...(prev || {}), celular: text }))
                  }
                />

                <TextInput
                  label="CI"
                  style={styles.input}
                  keyboardType="numeric"
                  value={editingUser?.ci || ""}
                  onChangeText={(text) =>
                    setEditingUser((prev) => ({ ...(prev || {}), ci: text }))
                  }
                />

                <View style={styles.modalSwitchRow}>
                  <Text>Aprobado:</Text>
                  <Switch
                    value={editingUser?.aprobado || false}
                    onValueChange={(value) =>
                      setEditingUser((prev) => ({ ...(prev || {}), aprobado: value }))
                    }
                  />
                </View>

                {editableRoleOptions.length > 0 && (
                  <>
                    <Text style={styles.modalSectionLabel}>Rol</Text>
                    <RadioButton.Group
                      onValueChange={(value) =>
                        setEditingUser((prev) => ({
                          ...(prev || {}),
                          rol: value,
                        }))
                      }
                      value={editingUser?.rol || null}
                    >
                      {editableRoleOptions.map((r) => (
                        <List.Item
                          key={r.id}
                          title={r.name}
                          onPress={() =>
                            setEditingUser((prev) => ({
                              ...(prev || {}),
                              rol: r.id,
                            }))
                          }
                          right={() => <RadioButton value={r.id} />}
                          style={styles.modalSelectItem}
                        />
                      ))}
                    </RadioButton.Group>
                  </>
                )}

                <View style={styles.modalSwitchRow}>
                  <Text>Visible:</Text>
                  <Switch
                    value={editingUser?.visible ?? true}
                    onValueChange={(value) =>
                      setEditingUser((prev) => ({ ...(prev || {}), visible: value }))
                    }
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  mode="contained"
                  loading={modalSaving}
                  disabled={modalSaving}
                  onPress={async () => {
                    setModalSaving(true);
                    try {
                      if (editingUser?.id) {
                        await handleUserAction(editingUser.id, "update", editingUser);
                      } else {
                        if (!editingUser?.password) {
                          Alert.alert(
                            "Error",
                            "La contraseña es obligatoria al crear un usuario"
                          );
                          return;
                        }
                        await handleUserAction(null, "create", editingUser);
                      }

                      setShowUserModal(false);
                      setEditingUser(null);
                    } catch (error) {
                      console.error(error);
                    } finally {
                      setModalSaving(false);
                    }
                  }}
                >
                  {modalSaving ? "Guardando…" : "Guardar"}
                </Button>
              </View>
            </KeyboardAvoidingView>
          </Modal>
          {/* 📦 Modal de Remate */}
          <AuctionModal
            visible={showAuctionModal}
            onDismiss={() => {
              if (modalSaving) return;
              setShowAuctionModal(false);
            }}
            saving={modalSaving}

            onSave={async (auctionData) => {
              setModalSaving(true);
              try {
                /*
                 * Guardamos los datos especiales del banner
                 */
                const bannerFile = auctionData.bannerFile;
                const bannerDeleted = auctionData.bannerDeleted;

                /*
                 * Quitamos estas propiedades antes de enviar
                 * el remate al backend.
                 */
                const { bannerFile: _, bannerDeleted: __, ...remateData } =
                  auctionData;

                /*
                 * ==========================
                 * 1. GUARDAR REMATE
                 * ==========================
                 */

                const savedAuction = await handleAuctionAction(
                  remateData.id || null,
                  remateData.id ? 'update' : 'create',
                  remateData
                );

                /*
                 * El ID puede venir del objeto retornado
                 */
                const remateId =
                  savedAuction?.id || remateData.id;

                if (!remateId) {
                  throw new Error(
                    'No se obtuvo el ID del remate.'
                  );
                }

                /*
                 * ==========================
                 * 2. ELIMINAR BANNER
                 * ==========================
                 */

                if (bannerDeleted) {
                  const token = await AsyncStorage.getItem("authToken");
                  await fetch(
                    `${apiBaseUrl}/api/remates/${remateId}/banner`,
                    {
                      method: 'DELETE',
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                  );
                }

                /*
                 * ==========================
                 * 3. SUBIR / ACTUALIZAR BANNER
                 * ==========================
                 */

                if (bannerFile) {
                  const formData = new FormData();

                  formData.append('file', {
                    uri: bannerFile.uri,
                    name: bannerFile.name,
                    type: bannerFile.type,
                  });

                  /*
                   * Si el remate es nuevo usamos POST.
                   * Si ya existía usamos PUT.
                   */

                  const method = remateData.id
                    ? 'PUT'
                    : 'POST';

                  const token = await AsyncStorage.getItem("authToken");
                  const response = await fetch(
                    `${apiBaseUrl}/api/remates/${remateId}/banner`,
                    {
                      method,
                      body: formData,
                      headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                    }
                  );

                  if (!response.ok) {
                    throw new Error(
                      'No se pudo guardar el banner.'
                    );
                  }
                }

                /*
                 * ==========================
                 * 4. CERRAR MODAL
                 * ==========================
                 */

                setShowAuctionModal(false);
                setEditingAuction(null);

              } catch (error) {
                console.error(
                  'Error guardando remate:',
                  error
                );

                Alert.alert(
                  'Error',
                  error.message ||
                  'No se pudo guardar el remate.'
                );
              } finally {
                setModalSaving(false);
              }
            }}

            editingAuction={editingAuction}
            cabanas={cabanasForSelect}
          />



          {/* 🐂 Modal de Lote */}
          <Modal
            visible={showLotModal}
            onDismiss={() => {
              if (modalSaving) return;
              setShowLotModal(false);
            }}
            contentContainerStyle={styles.modalWrapper}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modal}
            >
              <Title style={styles.modalTitle}>
                {editingLot ? "Editar Lote" : "Crear Lote"}
              </Title>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                bounces={false}
              >
                <TextInput
                  label="Nombre del lote"
                  style={styles.input}
                  value={editingLot?.nombre || ""}
                  onChangeText={(text) =>
                    setEditingLot((prev) => ({ ...prev, nombre: text }))
                  }
                />

                <TextInput
                  label="Raza"
                  style={styles.input}
                  value={editingLot?.raza || ""}
                  onChangeText={(text) =>
                    setEditingLot((prev) => ({ ...prev, raza: text }))
                  }
                />

                <TextInput
                  label="Precio"
                  style={styles.input}
                  keyboardType="numeric"
                  value={editingLot?.precio?.toString() || ""}
                  onChangeText={(text) =>
                    setEditingLot((prev) => ({
                      ...prev,
                      precio: parseFloat(text) || 0,
                    }))
                  }
                />

                <TextInput
                  label="Número de lote"
                  style={styles.input}
                  value={editingLot?.numLote?.toString() || ""}
                  onChangeText={(text) =>
                    setEditingLot((prev) => ({
                      ...prev,
                      numLote: text || 0,
                    }))
                  }
                />

                <TextInput
                  label="Video (URL)"
                  style={styles.input}
                  value={editingLot?.video || ""}
                  onChangeText={(text) =>
                    setEditingLot((prev) => ({ ...prev, video: text }))
                  }
                  placeholder="https://..."
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Selectores sin Accordion: no pelean el scroll del modal */}
                <Text style={styles.modalSectionLabel}>Cabaña</Text>
                <RadioButton.Group
                  onValueChange={(value) =>
                    setEditingLot((prev) => ({
                      ...prev,
                      cabana: { id: value },
                    }))
                  }
                  value={editingLot?.cabana?.id || null}
                >
                  {Array.isArray(cabanasForSelect) && cabanasForSelect.length > 0 ? (
                    cabanasForSelect.map((c) => (
                      <List.Item
                        key={c.id}
                        title={c.nombre}
                        onPress={() =>
                          setEditingLot((prev) => ({
                            ...prev,
                            cabana: { id: c.id },
                          }))
                        }
                        right={() => <RadioButton value={c.id} />}
                        style={styles.modalSelectItem}
                      />
                    ))
                  ) : (
                    <List.Item title="No hay cabañas disponibles" />
                  )}
                </RadioButton.Group>

                <Text style={styles.modalSectionLabel}>Remate</Text>
                <RadioButton.Group
                  onValueChange={(value) =>
                    setEditingLot((prev) => ({
                      ...prev,
                      remate: { id: value },
                    }))
                  }
                  value={editingLot?.remate?.id || null}
                >
                  {Array.isArray(auctions) && auctions.length > 0 ? (
                    auctions.map((r) => (
                      <List.Item
                        key={r.id}
                        title={r.nombre}
                        onPress={() =>
                          setEditingLot((prev) => ({
                            ...prev,
                            remate: { id: r.id, nombre: r.nombre },
                          }))
                        }
                        right={() => <RadioButton value={r.id} />}
                        style={styles.modalSelectItem}
                      />
                    ))
                  ) : (
                    <List.Item title="No hay remates disponibles" />
                  )}
                </RadioButton.Group>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  mode="contained"
                  loading={modalSaving}
                  disabled={modalSaving}
                  onPress={async () => {
                    setModalSaving(true);
                    try {
                      if (editingLot?.id) {
                        await handleLotAction(editingLot.id, "update", editingLot);
                      } else {
                        await handleLotAction(null, "create", editingLot);
                      }

                      setShowLotModal(false);
                      setEditingLot(null);
                    } catch (error) {
                      console.error(error);
                    } finally {
                      setModalSaving(false);
                    }
                  }}
                >
                  {modalSaving ? "Guardando…" : "Guardar"}
                </Button>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Modal de cabañas */}
          <Modal
            visible={showCabanaModal}
            onDismiss={() => {
              if (modalSaving) return;
              setShowCabanaModal(false);
            }}
            contentContainerStyle={styles.modalWrapper}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modal}
            >
              <Title style={styles.modalTitle}>
                {editingCabana ? "Editar Cabaña" : "Crear Cabaña"}
              </Title>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                bounces={false}
              >
                <TextInput
                  label="Nombre de la cabaña"
                  style={styles.input}
                  value={editingCabana?.nombre || ""}
                  onChangeText={(text) =>
                    setEditingCabana((prev) => ({ ...prev, nombre: text }))
                  }
                />

                <TextInput
                  label="Teléfono"
                  style={styles.input}
                  value={editingCabana?.telefono || ""}
                  onChangeText={(text) =>
                    setEditingCabana((prev) => ({ ...prev, telefono: text }))
                  }
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  mode="contained"
                  loading={modalSaving}
                  disabled={modalSaving}
                  onPress={async () => {
                    setModalSaving(true);
                    try {
                      if (editingCabana?.id) {
                        await handleCabanaAction(
                          editingCabana.id,
                          "update",
                          editingCabana
                        );
                      } else {
                        await handleCabanaAction(null, "create", editingCabana);
                      }
                      setShowCabanaModal(false);
                      setEditingCabana(null);
                    } catch (error) {
                      console.error(error);
                    } finally {
                      setModalSaving(false);
                    }
                  }}
                >
                  {modalSaving ? "Guardando…" : "Guardar"}
                </Button>
              </View>
            </KeyboardAvoidingView>
          </Modal>
          <BidCorrectionModal
            visible={correctionVisible}
            onDismiss={() => setCorrectionVisible(false)}
            onCorrect={() => {
              loadPujas(bidPage);
              showToast("Puja actualizada");
            }}
            id={selectedBid?.id}
            remateId={selectedBid?.lote?.remate?.id ?? selectedBid?.lote?.remateId}
            loteId={selectedBid?.lote?.id}
            initialValue={selectedBid?.monto}
          />
        </Portal>

        <SideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          navigation={navigation}
          isAdmin={isAdmin}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={CattleColors.primary} />
          </View>
        )}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ visible: false, message: "" })}
          duration={3200}
          style={styles.snackbar}
        >
          {snackbar.message}
        </Snackbar>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CattleColors.neutral,
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: CattleColors.primary, marginBottom: 20, paddingHorizontal: 20 },
  tabsContainer: { maxHeight: 60, marginBottom: 10 },
  tabsContent: { paddingHorizontal: 20, alignItems: 'center' },
  tabButton: { marginRight: 10, borderRadius: 20 },
  activeTab: { backgroundColor: CattleColors.primary },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  searchbar: { flex: 1, backgroundColor: CattleColors.white },
  addButton: {
    backgroundColor: CattleColors.primary,
    borderRadius: 8,
  },
  addButtonContent: {
    paddingHorizontal: 4,
  },
  addButtonLabel: {
    fontSize: 13,
  },
  card: { marginBottom: 15, backgroundColor: CattleColors.white, ...CattleColors.cardShadow },
  cardSaving: {
    opacity: 0.55,
    borderWidth: 2,
    borderColor: CattleColors.primary || "#3b82f6",
    backgroundColor: "#E8F1FF",
  },
  cardSuccess: {
    borderWidth: 2,
    borderColor: CattleColors.success || "#22c55e",
    backgroundColor: "#E8F8EE",
  },
  snackbar: {
    backgroundColor: "#14532d",
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: CattleColors.primary, marginBottom: 4 },
  userEmail: { fontSize: 14, color: CattleColors.mediumGray, marginBottom: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  actionButtons: { flexDirection: 'column' },
  modal: {
    width: "100%",
    maxHeight: Dimensions.get("window").height * 0.85,
    backgroundColor: CattleColors.white,
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  modalTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  modalScrollView: {
    flexGrow: 0,
    maxHeight: Dimensions.get("window").height * 0.62,
  },
  modalScroll: {
    paddingBottom: 16,
  },
  modalAccordion: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
  },
  modalSectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: CattleColors.primary,
    marginTop: 4,
    marginBottom: 6,
  },
  modalSelectItem: {
    paddingVertical: 0,
    marginBottom: 2,
  },
  modalSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 8,
  },
  modalFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CattleColors.mediumLightGray || "#E3E7E5",
    paddingTop: 12,
    paddingBottom: 12,
  },
  input: {
    marginBottom: 15,
    backgroundColor: CattleColors.white,
  },
  modalWrapper: {
    marginHorizontal: 16,
    alignSelf: "center",
    width: "92%",
    maxHeight: Dimensions.get("window").height * 0.9,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CattleColors.neutral,
  },
  loadingText: {
    marginTop: 10,
    color: CattleColors.mediumGray,
    fontSize: 14,
  },
  paginationRow: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 10,
  },
  paginationInfo: {
    textAlign: "center",
    color: CattleColors.mediumGray,
    fontSize: 13,
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
});
const reporte = {
  remate: "Remate Primavera 2025",
  fecha: "30/10/2025",
  lugar: "Centro Ganadero Santa Cruz",
  lote: {
    numero: 12,
    tipo: "Toros Brahman",
    cantidad: 8,
    pesoPromedio: 450,
  },
  prelances: [
    { postor: "Ganadera El Sol", monto: 4500 },
    { postor: "Estancia La Palma", monto: 4700 },
    { postor: "Agropecuaria San José", monto: 5000 },
  ],
  ganador: "Agropecuaria San José",
  precioFinal: 5000,
};

const stylesCardRemate = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
    padding: 6,
    elevation: 4,
    backgroundColor: "white",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  finishButton: {
    marginTop: 12,
    borderRadius: 10,
    overflow: "visible",
  },

  finishButtonContent: {
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: "center",
  },

  finishButtonLabel: {
    fontSize: 14,
    lineHeight: 22,
    includeFontPadding: true,
    paddingVertical: 2,
  },

  finalizadoChip: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: CattleColors.lightGray,
  },

  finalizadoChipText: {
    color: CattleColors.darkGray,
  },
});

