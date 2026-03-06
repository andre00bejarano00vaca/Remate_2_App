import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, RefreshControl } from "react-native";
import {
  TextInput,
  Button,
  Title,
  Text,
  Card,
  IconButton,
  Chip,
  FAB,
  Portal,
  Modal,
  Provider as PaperProvider,
  Searchbar
} from "react-native-paper";
import { CattleColors } from "../styles/colors";
import { List, RadioButton, Switch, DateTimePicker } from "react-native-paper";
import AuctionModal from "../components/AuctionModal";

import { getUsers, createteUser } from "../services/userService";
import { getAuctions, createAuction, updateAuction } from "../services/auctionService";
import { getLots, createLot, updateLot } from "../services/lotService";
import { getBids } from "../services/bidService";

import { updateUser, deleteUser } from "../services/userService";
import { getCabanas, createCabana, updateCabana } from "../services/cabanaService";
import PDFGenerator from "../components/PDFGenerator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReporteScreen from "../components/Reporte";
import BidCorrectionModal from "../components/BidCorrectionModal"
import finalizarLote from "../services/finalizarLote";
import { DatePickerModal } from 'react-native-paper-dates';
import RematesScreen from "../components/RematesScreen";




export default function AdminPanelScreen() {

  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState('remates');
  const [loading, setLoading] = useState(false);
  const [currentRolId, setCurrentRolId] = useState(null);

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

  // Usuarios
  const [users, setUsers] = useState([]);
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
  const [auctionSearchQuery, setAuctionSearchQuery] = useState('');
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);


  // Lotes
  const [cattleLots, setCattleLots] = useState([]);
  const [lotSearchQuery, setLotSearchQuery] = useState('');
  const [showLotModal, setShowLotModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);

  //cabanas
  const [cabanas, setCabanas] = useState([]);
  const [cabanaSearchQuery, setCabanaSearchQuery] = useState('');
  const [showCabanaModal, setShowCabanaModal] = useState(false);
  const [editingCabana, setEditingCabana] = useState(null);


  // Pujas
  const [bids, setBids] = useState([]);
  const [bidSearchQuery, setBidSearchQuery] = useState('');
  const [correctionVisible, setCorrectionVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [newBidValue, setNewBidValue] = useState("");
  const [loteId, setLoteId] = useState()

  // Reportes
  const [reports, setReports] = useState({});

  // Cargar datos de ejemplo
  useEffect(() => {
    loadInitialData();
  }, []);
  useEffect(() => {
    const loadCurrentRole = async () => {
      try {
        const stored = await AsyncStorage.getItem("rol");
        if (!stored) {
          setCurrentRolId(null);
          return;
        }
        // Puede ser "1", "2" o un JSON array/string
        const parsed = (() => {
          try {
            return JSON.parse(stored);
          } catch {
            return stored;
          }
        })();
        if (typeof parsed === "number") {
          setCurrentRolId(parsed);
        } else if (typeof parsed === "string") {
          const asNumber = parseInt(parsed, 10);
          setCurrentRolId(Number.isNaN(asNumber) ? null : asNumber);
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          const roleName = String(parsed[0]).toUpperCase();
          const role = ROLE_OPTIONS.find(r => r.name === roleName);
          setCurrentRolId(role ? role.id : null);
        } else {
          setCurrentRolId(null);
        }
      } catch (error) {
        console.error("Error leyendo rol actual:", error);
        setCurrentRolId(null);
      }
    };
    loadCurrentRole();
  }, []);
  // --- FETCH DE DATOS (IP LOCAL + PUERTO 8080) ---
  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const remateId = await AsyncStorage.getItem("remate");
        const loteId = await AsyncStorage.getItem("Lote")
        setLoteId(loteId)
        // Usamos la IP
        //  192.168.0.116 y el puerto 8080
        const response = await fetch(`https://testapp.digitaltelecom.net/api/pujas/remate/${remateId}`);

        if (response.ok) {
          const data = await response.json();
          // Ordenamos por ID descendente (opcional, para ver las más nuevas arriba)
          const pujasOrdenadas = data.sort((a, b) => b.id - a.id);
          setBids(pujasOrdenadas);
        } else {
          console.error("Error status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching pujas:", error);
      }
    };

    fetchPujas();

    // Actualizar automáticamente cada 5 segundos (Polling)
    const interval = setInterval(fetchPujas, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [usuario, auctionsData, lotsData, bidsData, cabana] = await Promise.all([
        getUsers(),
        getAuctions(),
        getLots(),
        getBids(),
        getCabanas(),
      ]);
      setUsers(usuario)
      setAuctions(auctionsData);
      setCattleLots(lotsData);
      setBids(bidsData.data);
      setCabanas(cabana);





      // Si tus reportes no vienen del backend aún:
      setReports({
        totalSales: lotsData.reduce((sum, l) => sum + (l.puja || 0), 0),
        totalAuctions: auctionsData.length,
        totalLots: lotsData.length,
        topBuyers: [],
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };
  const loadUser = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los remates");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "usuarios") await loadUser();
      else if (activeTab === "remates") await loadAuctions();
      else if (activeTab === "lotes") await loadLots();
      else if (activeTab === "cabanas") await loadCabanas();
      else if (activeTab === "puja") await loadPujas();
      else await loadInitialData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  // Funciones de acción
  const handleUserAction = async (userId, action, data = null, newRole = null, rolId) => {
    setLoading(true);
    try {
      if (action === "approve") {
        console.log(action)
        await updateUser(userId, { aprobado: true });
      } else if (action === "reject") {
        await updateUser(userId, { aprobado: false });
      } else if (action === "changeRole") {
        await updateUser(userId, { ...data, rolId: rolId });
      } else if (action === "delete") {
        await updateUser(userId, { ...data, visible: false });
      } else if (action === "update") {
        await updateUser(userId, data);
      } else if (action === "create") {
        await createteUser(data);
      }
      await loadUser(); // refrescar datos
    } catch (error) {
      Alert.alert("Error", "No se pudo realizar la acción" + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleAuctionAction = async (auctionId, action, data = null) => {
    setLoading(true);
    try {
      if (action === "create") {
        await createAuction(data);
      } else if (action === "update") {
        await updateAuction(auctionId, data);
      } else if (action === "delete") {
        await deleteAuction(auctionId);
      }
      loadAuctions();
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el remate");
    } finally {
      setLoading(false);
    }
  };

  const handleLotAction = async (lotId, action, data = null) => {
    setLoading(true);
    try {
      if (action === "create") {
        await createLot(data);
      } else if (action === "update") {
        await updateLot(lotId, data);
      } else if (action === "delete") {
        await deleteLot(lotId);
      }
      loadLots();
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el lote");
    } finally {
      setLoading(false);
    }
  };

  const loadAuctions = async () => {
    try {
      const data = await getAuctions();
      setAuctions(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los remates");
    }
  };

  const loadLots = async () => {
    try {
      const data = await getLots();
      setCattleLots(data); // o el estado que uses para tus lotes
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los lotes");
    }
  };

  const loadCabanas = async () => {
    try {
      const data = await getCabanas();
      setCabanas(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar las cabañas");
    }
  };
  const loadPujas = async () => {
    try {
      const data = await getBids();
      setBids(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar las cabañas");
    }
  };

  //cabanas 
  const handleCabanaAction = async (cabanaId, action, data = null) => {
    setLoading(true);
    try {
      if (action === "create") {
        await createCabana(data);
      } else if (action === "update") {
        await updateCabana(cabanaId, data);
      } else if (action === "delete") {
        await deleteCabana(cabanaId);
      }
      loadCabanas();
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la cabaña");
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
    setLoading(true);
    try {
      if (action === "create") {
        await createBid(data);
      } else if (action === "update") {
        await updateBid(bidId, data);
      } else if (action === "delete") {
        await deleteBid(bidId);
      }
      loadBids();
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la puja");
    } finally {
      setLoading(false);
    }
  };

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
      <Searchbar
        placeholder="Buscar usuarios..."
        onChangeText={setUserSearchQuery}
        value={userSearchQuery}
        style={styles.searchbar}
      />
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
          <Card key={user.id} style={styles.card}>
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
                        rolId: user.rol?.id || user.rolId,
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
    </ScrollView>
  );

  //-------------remates---------------
  const renderAuctionsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Searchbar
        placeholder="Buscar remates..."
        onChangeText={setAuctionSearchQuery}
        value={auctionSearchQuery}
        style={styles.searchbar}
      />
      {auctions
        .filter(a =>
          a.nombre.toLowerCase().includes(auctionSearchQuery.toLowerCase())
        ).filter(a => a.visible)
        .map(a => {
          const [fecha, hora] = (a.fecha || '').split('T');
          const [fechaFin, horaFin] = (a.fechaFin || '').split('T');

          return (
            <Card key={a.id} style={stylesCardRemate.card}>
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

                {/* Finalizar abajo */}
                {a.estado != "Finalizado" ?
                  <Button
                    mode="contained"
                    icon="play-circle"
                    buttonColor="#0000FF"
                    textColor="white"
                    contentStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}
                    labelStyle={{ fontSize: 15 }} // ajusta el tamaño de la letra
                    onPress={() => finalizarLote(a.id, loteId, "finish")}
                  >
                    Comenzar remate
                  </Button> : <Button
                    mode="contained"
                    icon="stop-circle"
                    buttonColor="#C62828"
                    textColor="white"
                    style={stylesCardRemate.finishButton}
                    contentStyle={stylesCardRemate.finishButtonContent}
                    onPress={() => finalizarLote(a.id, loteId, "Finalizado")}
                  >
                    Finalizar Remate
                  </Button>}


              </Card.Content>
            </Card>


          )
        })}
    </ScrollView>
  );
  //---------------------Lotes ----------------------------------
  const renderLotsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Searchbar
        placeholder="Buscar lotes..."
        onChangeText={setLotSearchQuery}
        value={lotSearchQuery}
        style={styles.searchbar}
      />

      {cattleLots
        .filter(l => l.nombre.toLowerCase().includes(lotSearchQuery.toLowerCase()))
        // .filter(l => l.visible)
        .map(l => {
          return (
            <Card key={l.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    {/* Nombre y raza */}
                    <Text style={styles.userName}>{l.nombre}</Text>
                    <Text style={styles.userEmail}>Raza: {l.raza}</Text>

                    {/* Información de precios */}
                    <View style={{ marginVertical: 5 }}>
                      <Text>Precio Inicial: ${l.precio}</Text>
                      <Text>Prelance: ${l.prelance}</Text>
                      <Text>Puja mínima: ${l.puja}</Text>
                    </View>

                    {/* Estado */}
                    <Chip style={{ marginTop: 5 }}>{l.estado || "SIN ESTADO"}</Chip>

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
    </ScrollView>
  );

  //--------------------cabanas -------------------------
  const renderCabanasTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Searchbar
        placeholder="Buscar cabañas..."
        onChangeText={setCabanaSearchQuery}
        value={cabanaSearchQuery}
        style={styles.searchbar}
      />
      {cabanas
        .filter(c =>
          c.nombre.toLowerCase().includes(cabanaSearchQuery.toLowerCase())
        )
        .filter(c => c.visible)
        .map(c => (
          <Card key={c.id} style={styles.card}>
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
    </ScrollView>
  );

  // -------------------pujas-----------------------------
  // ------------------- RENDER TAB PUJAS -----------------------------
  const renderBidsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Searchbar
        placeholder="Buscar por monto..."
        onChangeText={setBidSearchQuery}
        value={bidSearchQuery}
        style={styles.searchbar}
      />

      {bids.filter(b => `${b.monto}`.includes(bidSearchQuery)).map(b => {
        return (

          <Card key={b.id} style={styles.card}>
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
    </ScrollView>
  );

  const renderReportsTab = () => (
      <RematesScreen/>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Title style={styles.title}>Panel Administrador</Title>
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

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            if (activeTab === 'remates') { setEditingAuction(null); setShowAuctionModal(true); }
            else if (activeTab === 'lotes') { setEditingLot(null); setShowLotModal(true); }
            else if (activeTab === 'usuarios') {
              setEditingUser({
                username: "",
                nombre: "",
                celular: "",
                ci: "",
                password: "",
                aprobado: false,
                visible: true,
                rolId: 1,
                rol: { id: 1, name: "CLIENTE" },
              });
              setShowUserModal(true);
            }
            else if (activeTab === 'cabanas') { setEditingCabana(null); setShowCabanaModal(true); } // ✅ agregar
          }}
          disabled={!['remates', 'lotes', 'cabanas', 'usuarios'].includes(activeTab)} // ✅ agregar 'cabanas'
        />


        <Portal>
          {/* 🧑 Modal de Usuario */}
          <Modal
            visible={showUserModal}
            onDismiss={() => setShowUserModal(false)}
            contentContainerStyle={styles.modalWrapper}
          >
            <View style={styles.modal}>
              <ScrollView
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                indicatorStyle="black"
              >
                <Title>{editingUser?.id ? 'Editar Usuario' : 'Crear Usuario'}</Title>

                <TextInput
                  label="Nombre de usuario"
                  style={styles.input}
                  value={editingUser?.username || ''}
                  onChangeText={text =>
                    setEditingUser(prev => ({ ...(prev || {}), username: text }))
                  }
                />

                <TextInput
                  label="Nombre"
                  style={styles.input}
                  value={editingUser?.nombre || ''}
                  onChangeText={text =>
                    setEditingUser(prev => ({ ...(prev || {}), nombre: text }))
                  }
                />

                <TextInput
                  label="Celular"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editingUser?.celular || ''}
                  onChangeText={text =>
                    setEditingUser(prev => ({ ...(prev || {}), celular: text }))
                  }
                />

                <TextInput
                  label="CI"
                  style={styles.input}
                  keyboardType="numeric"
                  value={editingUser?.ci || ''}
                  onChangeText={text =>
                    setEditingUser(prev => ({ ...(prev || {}), ci: text }))
                  }
                />

                <TextInput
                  label="Contraseña"
                  style={styles.input}
                  secureTextEntry
                  value={editingUser?.password || ''}
                  onChangeText={text =>
                    setEditingUser(prev => ({ ...(prev || {}), password: text }))
                  }
                />

                {/* Switch para aprobar usuario */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                  <Text>Aprobado:</Text>
                  <Switch
                    value={editingUser?.aprobado || false}
                    onValueChange={value =>
                      setEditingUser(prev => ({ ...(prev || {}), aprobado: value }))
                    }
                  />
                </View>

            {/* Selección de roles */}
            {editableRoleOptions.length > 0 && (
              <List.Accordion
                title={editingUser?.rol?.name || (editingUser?.rolId ? (ROLE_OPTIONS.find(r => r.id === editingUser.rolId)?.name || "Seleccionar Rol") : "Seleccionar Rol")}
                style={{ backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 }}
              >
                <RadioButton.Group
                  onValueChange={(value) =>
                    setEditingUser(prev => ({
                      ...(prev || {}),
                      rolId: value,
                      rol: { id: value, name: ROLE_OPTIONS.find(r => r.id === value)?.name }
                    }))
                  }
                  value={editingUser?.rol?.id || editingUser?.rolId || null}
                >
                  {editableRoleOptions.map(r => (
                    <List.Item
                      key={r.id}
                      title={r.name}
                      right={() => <RadioButton value={r.id} />}
                    />
                  ))}
                </RadioButton.Group>
              </List.Accordion>
            )}

                {/* Switch para visible */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                  <Text>Visible:</Text>
                  <Switch
                    value={editingUser?.visible ?? true}
                    onValueChange={value =>
                      setEditingUser(prev => ({ ...(prev || {}), visible: value }))
                    }
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={async () => {
                    try {
                      if (editingUser?.id) {
                        // 📝 Actualizar usuario existente
                        await handleUserAction(editingUser.id, "update", editingUser);
                      } else {
                        // 🆕 Crear nuevo usuario
                        await handleUserAction(null, "create", editingUser);
                      }

                      setShowUserModal(false);
                      setEditingUser(null); // limpia el estado
                    } catch (error) {
                      console.error(error);
                      Alert.alert("Error", "No se pudo guardar el usuario");
                    }
                  }}
                >
                  Guardar
                </Button>
              </ScrollView>
            </View>
          </Modal>
          {/* 📦 Modal de Remate */}
          <AuctionModal
            visible={showAuctionModal}
            onDismiss={() => setShowAuctionModal(false)}
            onSave={async (auctionData) => {
              if (auctionData.id) await handleAuctionAction(auctionData.id, 'update', auctionData);
              else await handleAuctionAction(null, 'create', auctionData);
              setShowAuctionModal(false);
              setEditingAuction(null);
            }}
            editingAuction={editingAuction}
            cabanas={cabanas}
          />


          {/* 🐂 Modal de Lote */}
          <Modal
            visible={showLotModal}
            onDismiss={() => setShowLotModal(false)}
            contentContainerStyle={styles.modalWrapper}
          >
            <View style={styles.modal}>
              <ScrollView
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true} // iOS + Android
                persistentScrollbar={true}          // Android (iOS lo ignora)
                indicatorStyle="black"              // iOS (Android lo ignora)
              >

                <Title>{editingLot ? 'Editar Lote' : 'Crear Lote'}</Title>

                <TextInput
                  label="Nombre del lote"
                  style={styles.input}
                  value={editingLot?.nombre || ''}
                  onChangeText={text =>
                    setEditingLot(prev => ({ ...prev, nombre: text }))
                  }
                />

                <TextInput
                  label="Raza"
                  style={styles.input}
                  value={editingLot?.raza || ''}
                  onChangeText={text =>
                    setEditingLot(prev => ({ ...prev, raza: text }))
                  }
                />

                <TextInput
                  label="Precio"
                  style={styles.input}
                  keyboardType="numeric"
                  value={editingLot?.precio?.toString() || ''}
                  onChangeText={text =>
                    setEditingLot(prev => ({ ...prev, precio: parseFloat(text) || 0 }))
                  }
                />

                <TextInput
                  label="Prelance"
                  style={styles.input}
                  keyboardType="numeric"
                  value={editingLot?.prelance?.toString() || ''}
                  onChangeText={text =>
                    setEditingLot(prev => ({ ...prev, prelance: parseFloat(text) || 0 }))
                  }
                />
                <TextInput
                  label="Número de lote"
                  style={styles.input}
                  keyboardType="numeric"
                  value={editingLot?.numLote?.toString() || ''}
                  onChangeText={text =>
                    setEditingLot(prev => ({
                      ...prev,
                      numLote: parseInt(text) || 0
                    }))
                  }
                />
                <TextInput
                  label="Puja"
                  style={styles.input}
                  keyboardType="numeric"
                  value={editingLot?.puja?.toString() || ''}
                  onChangeText={text =>
                    setEditingLot(prev => ({ ...prev, puja: parseFloat(text) || 0 }))
                  }
                />

                <TextInput
                  label="Estado"
                  style={styles.input}
                  value={editingLot?.estado || ''}
                  onChangeText={text =>
                    setEditingLot(prev => ({ ...prev, estado: text }))
                  }
                />

                <List.Accordion
                  title={
                    editingLot?.cabana?.id
                      ? `Cabaña ID: ${editingLot.cabana.id}`
                      : "Seleccionar Cabaña"
                  }
                  style={{ backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 }}
                >
                  <RadioButton.Group
                    onValueChange={(value) =>
                      setEditingLot((prev) => ({
                        ...prev,
                        cabana: { id: value }, // ✅ solo guardamos el id
                      }))
                    }
                    value={editingLot?.cabana?.id || null}
                  >
                    {Array.isArray(cabanas) && cabanas.length > 0 ? (
                      cabanas.map((c) => (
                        <List.Item
                          key={c.id}
                          title={c.nombre}
                          right={() => <RadioButton value={c.id} />}
                        />
                      ))
                    ) : (
                      <List.Item title="No hay cabañas disponibles" />
                    )}
                  </RadioButton.Group>
                </List.Accordion>



                <List.Accordion
                  title={editingLot?.remate?.nombre || "Seleccionar Remate"}
                  style={{ backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 }}
                >
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
                          right={() => <RadioButton value={r.id} />}
                        />
                      ))
                    ) : (
                      <List.Item title="No hay remates disponibles" />
                    )}
                  </RadioButton.Group>
                </List.Accordion>


                <Button
                  mode="contained"
                  onPress={async () => {
                    try {
                      if (editingLot?.id) {
                        // 📝 Actualizar lote existente
                        await handleLotAction(editingLot.id, "update", editingLot);
                      } else {
                        // 🆕 Crear nuevo lote
                        await handleLotAction(null, "create", editingLot);
                      }

                      setShowLotModal(false);
                      setEditingLot(null); // limpia el estado
                    } catch (error) {
                      console.error(error);
                      Alert.alert("Error", "No se pudo guardar el lote");
                    }
                  }}
                >
                  Guardar
                </Button>

              </ScrollView>
            </View>

          </Modal>

          {/*Modal de cabanas*/}
          <Modal
            visible={showCabanaModal}
            onDismiss={() => setShowCabanaModal(false)}
            contentContainerStyle={styles.modalWrapper}
          >
            <View style={styles.modal}>
              <ScrollView
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true} // iOS + Android
                persistentScrollbar={true}          // Android (iOS lo ignora)
                indicatorStyle="black"              // iOS (Android lo ignora)
              >
                <Title>{editingCabana ? 'Editar Cabaña' : 'Crear Cabaña'}</Title>

                <TextInput
                  label="Nombre de la cabaña"
                  style={styles.input}
                  value={editingCabana?.nombre || ''}
                  onChangeText={text =>
                    setEditingCabana(prev => ({ ...prev, nombre: text }))
                  }
                />


                <TextInput
                  label="Teléfono"
                  style={styles.input}
                  value={editingCabana?.telefono || ''}
                  onChangeText={text =>
                    setEditingCabana(prev => ({ ...prev, telefono: text }))
                  }
                />

                <Button
                  mode="contained"
                  onPress={async () => {
                    try {
                      if (editingCabana?.id) {
                        await handleCabanaAction(editingCabana.id, "update", editingCabana);
                      } else {
                        await handleCabanaAction(null, "create", editingCabana);
                      }
                      setShowCabanaModal(false);
                      setEditingCabana(null);
                    } catch (error) {
                      console.error(error);
                      Alert.alert("Error", "No se pudo guardar la cabaña");
                    }
                  }}
                >
                  Guardar
                </Button>
              </ScrollView>
            </View>
          </Modal>
          <BidCorrectionModal
            visible={correctionVisible}
            onDismiss={() => setCorrectionVisible(false)}
            onCorrect={() => getBids()}
            id={selectedBid?.id}
          />
        </Portal>

      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CattleColors.lightGray,
    paddingTop: 40,
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: CattleColors.primary, marginBottom: 20, paddingHorizontal: 20 },
  tabsContainer: { maxHeight: 60, marginBottom: 10 },
  tabsContent: { paddingHorizontal: 20, alignItems: 'center' },
  tabButton: { marginRight: 10, borderRadius: 20 },
  activeTab: { backgroundColor: CattleColors.primary },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  searchbar: { marginBottom: 15, backgroundColor: CattleColors.white },
  card: { marginBottom: 15, backgroundColor: CattleColors.white, ...CattleColors.cardShadow },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: CattleColors.primary, marginBottom: 4 },
  userEmail: { fontSize: 14, color: CattleColors.mediumGray, marginBottom: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  actionButtons: { flexDirection: 'column' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: CattleColors.primary },
  modal: {
    width: '90%',
    height: '70%', // ✅ solo 70% de la pantalla
    backgroundColor: CattleColors.white,
    borderRadius: 12,
    padding: 20,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: CattleColors.white,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 40,
    justifyContent: "center",
  },

  finishButtonContent: {
    paddingVertical: 4,
  },
});

