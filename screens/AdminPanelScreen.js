import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
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

  import { getUsers } from "../services/userService";
  import { getAuctions } from "../services/auctionService";
  import { getLots } from "../services/lotService";
  import { getBids } from "../services/bidService";

  import { updateUser, deleteUser } from "../services/userService";


export default function AdminPanelScreen() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(false);

  // Usuarios
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Remates
  const [auctions, setAuctions] = useState([]);
  const [auctionSearchQuery, setAuctionSearchQuery] = useState('');
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);

  // Lotes
  const [cattleLots, setCattleLots] = useState([]);
  const [lotSearchQuery, setLotSearchQuery] = useState('');
  const [showLotModal, setShowLotModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);

  // Pujas
  const [bids, setBids] = useState([]);
  const [bidSearchQuery, setBidSearchQuery] = useState('');

  // Reportes
  const [reports, setReports] = useState({});

  // Cargar datos de ejemplo
  useEffect(() => {
    loadInitialData();
  }, []);


  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [ auctionsData, lotsData, bidsData] = await Promise.all([
        // getUsers(),
        getAuctions(),
        getLots(),
        getBids(),
      ]);
      console.log(lotsData)
      setAuctions(auctionsData);
      setCattleLots(lotsData);
      setBids(bidsData.data);

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


  // Funciones de acción
//   const handleUserAction = async (userId, action, newRole = null) => {
//   setLoading(true);
//   try {
//     if (action === "approve") {
//       await updateUser(userId, { status: "approved" });
//     } else if (action === "reject") {
//       await updateUser(userId, { status: "rejected" });
//     } else if (action === "changeRole") {
//       await updateUser(userId, { role: newRole });
//     } else if (action === "delete") {
//       await deleteUser(userId);
//     }
//     await loadInitialData(); // refrescar datos
//   } catch (error) {
//     Alert.alert("Error", "No se pudo realizar la acción");
//   } finally {
//     setLoading(false);
//   }
// };

  
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

  // Render Tabs
  // const renderUsersTab = () => (
  //   <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
  //     <Searchbar placeholder="Buscar usuarios..." onChangeText={setUserSearchQuery} value={userSearchQuery} style={styles.searchbar} />
  //     {users.filter(u => u.nombre.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase())).map(user => (
  //       <Card key={user.id} style={styles.card}>
  //         <Card.Content>
  //           <View style={styles.cardHeader}>
  //             <View style={styles.userInfo}>
  //               <Text style={styles.userName}>{user.nombre}</Text>
  //               <Text style={styles.userEmail}>{user.email}</Text>
  //               <View style={styles.chipContainer}>
  //                 <Chip style={{ marginRight: 8, marginBottom: 8 }} textStyle={{ color: user.status === 'approved' ? CattleColors.success : user.status === 'pending' ? CattleColors.warning : CattleColors.error }}>{user.status}</Chip>
  //                 <Chip style={{ marginRight: 8, marginBottom: 8, backgroundColor: CattleColors.accent }}>{user.role}</Chip>
  //               </View>
  //             </View>
  //             <View style={styles.actionButtons}>
  //               {user.status === 'pending' && (
  //                 <>
  //                   <IconButton icon="check" iconColor={CattleColors.success} onPress={() => handleUserAction(user.id, 'approve')} />
  //                   <IconButton icon="close" iconColor={CattleColors.error} onPress={() => handleUserAction(user.id, 'reject')} />
  //                 </>
  //               )}
  //               <IconButton icon="account-cog" iconColor={CattleColors.info} onPress={() => Alert.alert(
  //                 'Cambiar Rol', 'Selecciona el nuevo rol:', [
  //                 { text: 'Admin', onPress: () => handleUserAction(user.id, 'changeRole', 'admin') },
  //                 { text: 'Colaborador', onPress: () => handleUserAction(user.id, 'changeRole', 'colaborador') },
  //                 { text: 'Cliente', onPress: () => handleUserAction(user.id, 'changeRole', 'cliente') },
  //                 { text: 'Cancelar', style: 'cancel' }
  //               ]
  //               )} />
  //             </View>
  //           </View>
  //         </Card.Content>
  //       </Card>
  //     ))}
  //   </ScrollView>
  // );

  const renderAuctionsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
      <Searchbar placeholder="Buscar remates..." onChangeText={setAuctionSearchQuery} value={auctionSearchQuery} style={styles.searchbar} />
      {auctions.filter(a => a.nombre.toLowerCase().includes(auctionSearchQuery.toLowerCase())).map(a => (
        <Card key={a.id} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{a.nombre}</Text>
                <Text style={styles.userEmail}>Fecha: {a.date}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Chip style={{ marginRight: 8, marginBottom: 8 }}>Lotes: {a.lotsCount}</Chip>
                  <Chip style={{ marginRight: 8, marginBottom: 8 }}>Pujas: {a.totalBids}</Chip>
                  <Chip style={{ marginRight: 8, marginBottom: 8, color: a.status === 'active' ? CattleColors.success : a.status === 'completed' ? CattleColors.info : CattleColors.warning }}>{a.status}</Chip>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <IconButton icon="pencil" iconColor={CattleColors.info} onPress={() => { setEditingAuction(a); setShowAuctionModal(true); }} />
                <IconButton icon="delete" iconColor={CattleColors.error} onPress={() => handleAuctionAction(a.id, 'delete')} />
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const renderLotsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
      <Searchbar placeholder="Buscar lotes..." onChangeText={setLotSearchQuery} value={lotSearchQuery} style={styles.searchbar} />
      {cattleLots.filter(l => l.nombre.toLowerCase().includes(lotSearchQuery.toLowerCase())).map(l => (
        <Card key={l.id} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{l.nombre}</Text>
                <Text style={styles.userEmail}>Raza: {l.raza} | Peso: {l.weight} kg | Precio: {l.precio}</Text>
                <Chip style={{ marginTop: 5 }}>{l.status}</Chip>
              </View>
              <View style={styles.actionButtons}>
                <IconButton icon="pencil" iconColor={CattleColors.info} onPress={() => { setEditingLot(l); setShowLotModal(true); }} />
                <IconButton icon="delete" iconColor={CattleColors.error} onPress={() => handleLotAction(l.id, 'delete')} />
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const renderBidsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
      <Searchbar placeholder="Buscar pujas..." onChangeText={setBidSearchQuery} value={bidSearchQuery} style={styles.searchbar} />
      {bids.filter(b => `${b.monto}`.includes(bidSearchQuery)).map(b => (
        <Card key={b.id} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>Lote ID: {b.lote.id}</Text>
                <Text style={styles.userEmail}>Usuario ID: {b.usuario.id} | Monto: {b.monto} | Estado: {b.status}</Text>
              </View>
              <View style={styles.actionButtons}>
                <IconButton icon="check" iconColor={CattleColors.success} onPress={() => handleBidAction(b.id, 'confirm')} />
                <IconButton icon="close" iconColor={CattleColors.error} onPress={() => handleBidAction(b.id, 'forceClose')} />
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const renderReportsTab = () => (
    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
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
          {/* {renderTabButton('usuarios', 'Usuarios', 'account')} */}
          {renderTabButton('remates', 'Remates', 'calendar')}
          {renderTabButton('lotes', 'Lotes', 'cow')}
          {renderTabButton('pujas', 'Pujas', 'gavel')}
          {renderTabButton('reportes', 'Reportes', 'chart-line')}
        </ScrollView>

        <View style={styles.contentContainer}>
          {/* {activeTab === 'usuarios' && renderUsersTab()} */}
          {activeTab === 'remates' && renderAuctionsTab()}
          {activeTab === 'lotes' && renderLotsTab()}
          {activeTab === 'pujas' && renderBidsTab()}
          {activeTab === 'reportes' && renderReportsTab()}
        </View>

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            if (activeTab === 'remates') { setEditingAuction(null); setShowAuctionModal(true); }
            else if (activeTab === 'lotes') { setEditingLot(null); setShowLotModal(true); }
          }}
          disabled={!['remates', 'lotes'].includes(activeTab)}
        />

        <Portal>
          <Modal visible={showAuctionModal} onDismiss={() => setShowAuctionModal(false)} contentContainerStyle={styles.modal}>
            <Title>{editingAuction ? 'Editar Remate' : 'Crear Remate'}</Title>
            <TextInput label="Nombre del remate" style={styles.input} />
            <TextInput label="Fecha" style={styles.input} />
            <Button mode="contained" onPress={() => setShowAuctionModal(false)}>Guardar</Button>
          </Modal>

          <Modal visible={showLotModal} onDismiss={() => setShowLotModal(false)} contentContainerStyle={styles.modal}>
            <Title>{editingLot ? 'Editar Lote' : 'Crear Lote'}</Title>
            <TextInput label="Nombre del lote" style={styles.input} />
            <TextInput label="Raza" style={styles.input} />
            <TextInput label="Peso" style={styles.input} keyboardType="numeric" />
            <TextInput label="Precio inicial" style={styles.input} keyboardType="numeric" />
            <Button mode="contained" onPress={() => setShowLotModal(false)}>Guardar</Button>
          </Modal>
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
