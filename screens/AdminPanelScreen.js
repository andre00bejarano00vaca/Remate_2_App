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


import { getUsers } from "../services/userService";
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


export default function AdminPanelScreen() {

  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState('remates');
  const [loading, setLoading] = useState(false);

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
  const handleUserAction = async (userId, action, data = null, newRole = null) => {
    setLoading(true);
    try {
      if (action === "approve") {
        await updateUser(userId, { ...data, aprobado: true });
      } else if (action === "reject") {
        await updateUser(userId, { ...data, aprobado: false });
      } else if (action === "changeRole") {
        await updateUser(userId, { ...data, roles: [newRole] });
      } else if (action === "delete") {
        await updateUser(userId, { ...data, visible: false });
      }
      await loadUser(); // refrescar datos
    } catch (error) {
      Alert.alert("Error", "No se pudo realizar la acción");
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

  const handleCorrectBid = async () => {
    try {
      await axios.post(
        `${BASE_URL}/contador/corregir/${selectedBid.lote.remate.id}/${selectedBid.lote.id}`,
        { nuevoValor: Number(newBidValue) }
      );

      alert("Puja corregida correctamente.");
      getBids();     // Recargar lista
      setCorrectionVisible(false);
    } catch (error) {
      console.error(error);
      alert("Error al corregir la puja.");
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
        // Filtrar por username y roles
        .filter(u =>
          u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          u.roles.join(', ').toLowerCase().includes(userSearchQuery.toLowerCase())
        )
        // Mostrar solo los visibles
        .filter(u => u.visible)
        .map(user => (
          <Card key={user.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.username}</Text>
                  <Text style={styles.userEmail}>Rol: {user.roles.join(', ')}</Text>
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
                      {user.roles.join(', ')}
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
                    icon="account-cog"
                    iconColor={CattleColors.info}
                    onPress={() =>
                      Alert.alert('Cambiar Rol', 'Selecciona el nuevo rol:', [
                        {
                          text: 'Admin',
                          onPress: () =>
                            handleUserAction(user.id, 'changeRole', user, 'ADMIN')
                        },
                        {
                          text: 'Cliente',
                          onPress: () =>
                            handleUserAction(user.id, 'changeRole', user, 'CLIENTE')
                        },
                        {
                          text: 'Cancelar',
                          style: 'cancel'
                        }
                      ])
                    }
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
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
        .map(a => (
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
              <Text style={stylesCardRemate.subtitle}>Fecha: {a.fecha}</Text>
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
                  onPress={() => finalizarLote(a.id, loteId, "finish")}
                >
                  Finalizar Remate
                </Button>}


            </Card.Content>
          </Card>


        ))}
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
        .map(l => (
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
                    <Text>{l.remate?.nombre} - {l.remate?.fecha}</Text>
                    <Text style={{ color: CattleColors.mediumGray }}>
                      Cabana: {l.cabana?.nombre}
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
        ))}
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

      {bids.filter(b => `${b.monto}`.includes(bidSearchQuery)).map(b => (
        <Card key={b.id} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>
                  Lote {b.lote?.numlote}: {b.lote?.nombre}
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
                  icon="check"
                  iconColor={CattleColors.success}
                  onPress={() => handleBidAction(b.id, 'confirm')}
                />
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
      ))}
    </ScrollView>
  );

  const renderReportsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
      <ReporteScreen />
      <Card style={styles.card}>
        <Card.Content>
          <Text>Total Ventas: {reports.totalSales}</Text>
          <Text>Total Remates: {reports.totalAuctions}</Text>
          <Text>Total Lotes: {reports.totalLots}</Text>
        </Card.Content>
      </Card>
      <Title style={{ marginTop: 15 }}>Top Compradores</Title>
      {reports.topBuyers?.map((b, idx) => (
        <Card key={idx} style={styles.card}>
          <Card.Content>
            <Text>{b.nombre} - Compras: {b.totalPurchases} | Lotes: {b.lotsCount}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
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
            else if (activeTab === 'usuarios') { setEditingUser(null); setShowUserModal(true); }
            else if (activeTab === 'cabanas') { setEditingCabana(null); setShowCabanaModal(true); } // ✅ agregar
          }}
          disabled={!['remates', 'lotes', 'cabanas', 'usuarios'].includes(activeTab)} // ✅ agregar 'cabanas'
        />


        <Portal>
          {/* 🧑 Modal de Usuario */}
          <Modal
            visible={showUserModal}
            onDismiss={() => setShowUserModal(false)}
            contentContainerStyle={styles.modal}
          >
            <Title>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</Title>

            <TextInput
              label="Nombre de usuario"
              style={styles.input}
              value={editingUser?.username || ''}
              onChangeText={text =>
                setEditingUser(prev => ({ ...prev, username: text }))
              }
            />

            <TextInput
              label="Contraseña"
              style={styles.input}
              secureTextEntry
              value={editingUser?.password || ''}
              onChangeText={text =>
                setEditingUser(prev => ({ ...prev, password: text }))
              }
            />

            {/* Switch para aprobar usuario */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
              <Text>Aprobado:</Text>
              <Switch
                value={editingUser?.aprobado || false}
                onValueChange={value =>
                  setEditingUser(prev => ({ ...prev, aprobado: value }))
                }
              />
            </View>

            {/* Selección de roles */}
            <List.Accordion
              title={editingUser?.roles?.join(', ') || "Seleccionar Rol"}
              style={{ backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 }}
            >
              <RadioButton.Group
                onValueChange={(value) =>
                  setEditingUser(prev => ({ ...prev, roles: [value] })) // Lista de roles
                }
                value={editingUser?.roles?.[0] || null}
              >
                <List.Item title="ADMIN" right={() => <RadioButton value="ADMIN" />} />
                <List.Item title="CLIENTE" right={() => <RadioButton value="CLIENTE" />} />
              </RadioButton.Group>
            </List.Accordion>

            {/* Switch para visible */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
              <Text>Visible:</Text>
              <Switch
                value={editingUser?.visible || false}
                onValueChange={value =>
                  setEditingUser(prev => ({ ...prev, visible: value }))
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
          </Modal>
          {/* 📦 Modal de Remate */}
          <Modal
            visible={showAuctionModal}
            onDismiss={() => setShowAuctionModal(false)}
            contentContainerStyle={styles.modal}
          >
            <Text>{editingAuction ? 'Editar Remate' : 'Crear Remate'}</Text>

            <TextInput
              label="Nombre del remate"
              style={styles.input}
              value={editingAuction?.nombre || ''}
              onChangeText={text =>
                setEditingAuction(prev => ({ ...prev, nombre: text }))
              }
            />

            // Dentro de tu modal:
            <Text style={{ marginBottom: 5 }}>Fecha de inicio</Text>
            <Button
              mode="outlined"
              onPress={() => setShowStartPicker(true)}
            >
              {editingAuction?.fecha ? editingAuction.fecha : "Seleccionar fecha y hora"}
            </Button>
            {showStartPicker && (
              <DateTimePicker
                value={editingAuction?.fecha ? new Date(editingAuction.fecha) : new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    setEditingAuction(prev => ({
                      ...prev,
                      fecha: selectedDate.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
                    }));
                  }
                }}
              />
            )}

            <Text style={{ marginBottom: 5 }}>Fecha de fin</Text>
            <Button
              mode="outlined"
              onPress={() => setShowEndPicker(true)}
            >
              {editingAuction?.fechaFin ? editingAuction.fechaFin : "Seleccionar fecha y hora"}
            </Button>
            {showEndPicker && (
              <DateTimePicker
                value={editingAuction?.fechaFin ? new Date(editingAuction.fechaFin) : new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) {
                    setEditingAuction(prev => ({
                      ...prev,
                      fechaFin: selectedDate.toISOString().slice(0, 16)
                    }));
                  }
                }}
              />
            )}

            <TextInput
              label="URL de lista de lotes"
              style={styles.input}
              value={editingAuction?.urlListaLotes || ''}
              onChangeText={text =>
                setEditingAuction(prev => ({ ...prev, urlListaLotes: text }))
              }
            />

            <TextInput
              label="Estado"
              style={styles.input}
              value={editingAuction?.estado || ''}
              onChangeText={text =>
                setEditingAuction(prev => ({ ...prev, estado: text }))
              }
            />

            <List.Accordion
              title={editingAuction?.cabana?.nombre || "Seleccionar Cabaña"}
              style={{ backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 }}
            >
              <RadioButton.Group
                onValueChange={(value) =>
                  setEditingAuction((prev) => ({
                    ...prev,
                    cabana: { id: value }
                  }))
                }
                value={editingAuction?.cabana?.id || null}
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

            <Button
              mode="contained"
              onPress={async () => {
                try {
                  if (editingAuction?.id) {
                    // 📝 Editar remate existente
                    await handleAuctionAction(editingAuction.id, "update", editingAuction);
                  } else {
                    // 🆕 Crear nuevo remate
                    await handleAuctionAction(null, "create", editingAuction);
                  }

                  setShowAuctionModal(false);
                  setEditingAuction(null); // limpiar el estado
                } catch (error) {
                  console.error(error);
                  Alert.alert("Error", "No se pudo guardar el remate");
                }
              }}
            >
              Guardar
            </Button>


          </Modal>

          {/* 🐂 Modal de Lote */}
          <Modal
            visible={showLotModal}
            onDismiss={() => setShowLotModal(false)}
            contentContainerStyle={styles.modal}
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


          </Modal>

          {/*Modal de cabanas*/}
          <Modal
            visible={showCabanaModal}
            onDismiss={() => setShowCabanaModal(false)}
            contentContainerStyle={styles.modal}
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
          </Modal>
          <BidCorrectionModal
            visible={correctionVisible}
            onDismiss={() => setCorrectionVisible(false)}
            onCorrect={() => getBids()}
          />

        </Portal>

      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CattleColors.lightGray, paddingTop: 40 },
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
  modal: { backgroundColor: CattleColors.white, margin: 20, padding: 20, borderRadius: 8 },
  input: { marginBottom: 15, backgroundColor: CattleColors.white },
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

