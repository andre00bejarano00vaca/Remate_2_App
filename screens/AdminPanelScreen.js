import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, RefreshControl } from "react-native";
import { 
  TextInput, 
  Button, 
  Title, 
  Text, 
  Card, 
  List, 
  IconButton, 
  Menu, 
  Chip,
  FAB,
  Portal,
  Modal,
  Divider,
  DataTable,
  Searchbar
} from "react-native-paper";
import { CattleColors } from "../styles/colors";

export default function AdminPanelScreen() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para usuarios
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  // Estados para remates
  const [auctions, setAuctions] = useState([]);
  const [auctionSearchQuery, setAuctionSearchQuery] = useState('');
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  
  // Estados para lotes
  const [cattleLots, setCattleLots] = useState([]);
  const [lotSearchQuery, setLotSearchQuery] = useState('');
  const [showLotModal, setShowLotModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  
  // Estados para pujas
  const [bids, setBids] = useState([]);
  const [bidSearchQuery, setBidSearchQuery] = useState('');
  
  // Estados para reportes
  const [reports, setReports] = useState({});
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Datos de ejemplo para desarrollo
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo para usuarios
      setUsers([
        { id: 1, name: 'Juan Pérez', email: 'juan@email.com', role: 'admin', status: 'approved', createdAt: '2024-01-15' },
        { id: 2, name: 'María García', email: 'maria@email.com', role: 'colaborador', status: 'pending', createdAt: '2024-01-16' },
        { id: 3, name: 'Carlos López', email: 'carlos@email.com', role: 'cliente', status: 'approved', createdAt: '2024-01-17' },
        { id: 4, name: 'Ana Martínez', email: 'ana@email.com', role: 'cliente', status: 'rejected', createdAt: '2024-01-18' },
      ]);
      
      // Datos de ejemplo para remates
      setAuctions([
        { id: 1, name: 'Remate Primavera 2024', date: '2024-03-15', status: 'active', lotsCount: 25, totalBids: 150 },
        { id: 2, name: 'Remate Otoño 2024', date: '2024-09-20', status: 'completed', lotsCount: 30, totalBids: 200 },
        { id: 3, name: 'Remate Invierno 2024', date: '2024-12-10', status: 'scheduled', lotsCount: 20, totalBids: 0 },
      ]);
      
      // Datos de ejemplo para lotes
      setCattleLots([
        { id: 1, auctionId: 1, name: 'Lote 001 - Angus', breed: 'Angus', weight: 450, startingPrice: 150000, currentBid: 180000, status: 'active' },
        { id: 2, auctionId: 1, name: 'Lote 002 - Hereford', breed: 'Hereford', weight: 420, startingPrice: 140000, currentBid: 165000, status: 'active' },
        { id: 3, auctionId: 2, name: 'Lote 003 - Brahman', breed: 'Brahman', weight: 480, startingPrice: 160000, currentBid: 190000, status: 'sold' },
      ]);
      
      // Datos de ejemplo para pujas
      setBids([
        { id: 1, lotId: 1, userId: 3, amount: 180000, timestamp: '2024-01-20 14:30:00', status: 'active' },
        { id: 2, lotId: 2, userId: 3, amount: 165000, timestamp: '2024-01-20 14:25:00', status: 'active' },
        { id: 3, lotId: 1, userId: 2, amount: 175000, timestamp: '2024-01-20 14:20:00', status: 'outbid' },
      ]);
      
      // Datos de ejemplo para reportes
      setReports({
        totalSales: 2500000,
        totalAuctions: 3,
        totalLots: 75,
        topBuyers: [
          { name: 'Carlos López', totalPurchases: 850000, lotsCount: 5 },
          { name: 'Ana Martínez', totalPurchases: 650000, lotsCount: 4 },
          { name: 'Pedro González', totalPurchases: 450000, lotsCount: 3 },
        ]
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Funciones para gestión de usuarios
  const handleUserAction = async (userId, action, newRole = null) => {
    try {
      setLoading(true);
      // Aquí harías la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === 'approve') {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'approved' } : user
        ));
        Alert.alert('Éxito', 'Usuario aprobado correctamente');
      } else if (action === 'reject') {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'rejected' } : user
        ));
        Alert.alert('Éxito', 'Usuario rechazado');
      } else if (action === 'changeRole') {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        Alert.alert('Éxito', 'Rol actualizado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la acción');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para gestión de remates
  const handleAuctionAction = async (auctionId, action) => {
    try {
      setLoading(true);
      // Aquí harías la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === 'delete') {
        setAuctions(auctions.filter(auction => auction.id !== auctionId));
        Alert.alert('Éxito', 'Remate eliminado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la acción');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para gestión de lotes
  const handleLotAction = async (lotId, action) => {
    try {
      setLoading(true);
      // Aquí harías la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === 'delete') {
        setCattleLots(cattleLots.filter(lot => lot.id !== lotId));
        Alert.alert('Éxito', 'Lote eliminado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la acción');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para gestión de pujas
  const handleBidAction = async (bidId, action) => {
    try {
      setLoading(true);
      // Aquí harías la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === 'forceClose') {
        setBids(bids.map(bid => 
          bid.id === bidId ? { ...bid, status: 'closed' } : bid
        ));
        Alert.alert('Éxito', 'Puja cerrada forzosamente');
      } else if (action === 'confirmWinner') {
        setBids(bids.map(bid => 
          bid.id === bidId ? { ...bid, status: 'confirmed' } : bid
        ));
        Alert.alert('Éxito', 'Ganador confirmado');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la acción');
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

  const renderUsersTab = () => (
    <ScrollView style={styles.tabContent}>
      <Searchbar
        placeholder="Buscar usuarios..."
        onChangeText={setUserSearchQuery}
        value={userSearchQuery}
        style={styles.searchbar}
      />
      
      {users
        .filter(user => 
          user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
        )
        .map(user => (
          <Card key={user.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.chipContainer}>
                    <Chip 
                      mode="outlined" 
                      textStyle={{ color: user.status === 'approved' ? CattleColors.success : 
                                          user.status === 'pending' ? CattleColors.warning : 
                                          CattleColors.error }}
                    >
                      {user.status}
                    </Chip>
                    <Chip mode="outlined" style={styles.roleChip}>
                      {user.role}
                    </Chip>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  {user.status === 'pending' && (
                    <>
                      <IconButton
                        icon="check"
                        iconColor={CattleColors.success}
                        onPress={() => handleUserAction(user.id, 'approve')}
                      />
                      <IconButton
                        icon="close"
                        iconColor={CattleColors.error}
                        onPress={() => handleUserAction(user.id, 'reject')}
                      />
                    </>
                  )}
                  <IconButton
                    icon="account-cog"
                    iconColor={CattleColors.info}
                    onPress={() => {
                      Alert.alert(
                        'Cambiar Rol',
                        'Selecciona el nuevo rol:',
                        [
                          { text: 'Admin', onPress: () => handleUserAction(user.id, 'changeRole', 'admin') },
                          { text: 'Colaborador', onPress: () => handleUserAction(user.id, 'changeRole', 'colaborador') },
                          { text: 'Cliente', onPress: () => handleUserAction(user.id, 'changeRole', 'cliente') },
                          { text: 'Cancelar', style: 'cancel' }
                        ]
                      );
                    }}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
    </ScrollView>
  );

  const renderAuctionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Searchbar
        placeholder="Buscar remates..."
        onChangeText={setAuctionSearchQuery}
        value={auctionSearchQuery}
        style={styles.searchbar}
      />
      
      {auctions
        .filter(auction => 
          auction.name.toLowerCase().includes(auctionSearchQuery.toLowerCase())
        )
        .map(auction => (
          <Card key={auction.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.auctionInfo}>
                  <Text style={styles.auctionName}>{auction.name}</Text>
                  <Text style={styles.auctionDate}>Fecha: {auction.date}</Text>
                  <View style={styles.auctionStats}>
                    <Chip mode="outlined" icon="cow">
                      {auction.lotsCount} lotes
                    </Chip>
                    <Chip mode="outlined" icon="gavel">
                      {auction.totalBids} pujas
                    </Chip>
                    <Chip 
                      mode="outlined" 
                      textStyle={{ 
                        color: auction.status === 'active' ? CattleColors.success : 
                               auction.status === 'completed' ? CattleColors.info : 
                               CattleColors.warning 
                      }}
                    >
                      {auction.status}
                    </Chip>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="pencil"
                    iconColor={CattleColors.info}
                    onPress={() => {
                      setEditingAuction(auction);
                      setShowAuctionModal(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    iconColor={CattleColors.error}
                    onPress={() => handleAuctionAction(auction.id, 'delete')}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
    </ScrollView>
  );

  const renderCattleLotsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Searchbar
        placeholder="Buscar lotes..."
        onChangeText={setLotSearchQuery}
        value={lotSearchQuery}
        style={styles.searchbar}
      />
      
      {cattleLots
        .filter(lot => 
          lot.name.toLowerCase().includes(lotSearchQuery.toLowerCase()) ||
          lot.breed.toLowerCase().includes(lotSearchQuery.toLowerCase())
        )
        .map(lot => (
          <Card key={lot.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.lotInfo}>
                  <Text style={styles.lotName}>{lot.name}</Text>
                  <Text style={styles.lotBreed}>Raza: {lot.breed}</Text>
                  <Text style={styles.lotWeight}>Peso: {lot.weight} kg</Text>
                  <View style={styles.lotPricing}>
                    <Text style={styles.startingPrice}>Precio inicial: ${lot.startingPrice.toLocaleString()}</Text>
                    <Text style={styles.currentBid}>Puja actual: ${lot.currentBid.toLocaleString()}</Text>
                  </View>
                  <Chip 
                    mode="outlined" 
                    textStyle={{ 
                      color: lot.status === 'active' ? CattleColors.success : 
                             lot.status === 'sold' ? CattleColors.info : 
                             CattleColors.warning 
                    }}
                  >
                    {lot.status}
                  </Chip>
                </View>
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="pencil"
                    iconColor={CattleColors.info}
                    onPress={() => {
                      setEditingLot(lot);
                      setShowLotModal(true);
                    }}
                  />
                  <IconButton
                    icon="delete"
                    iconColor={CattleColors.error}
                    onPress={() => handleLotAction(lot.id, 'delete')}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
    </ScrollView>
  );

  const renderBidsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Searchbar
        placeholder="Buscar pujas..."
        onChangeText={setBidSearchQuery}
        value={bidSearchQuery}
        style={styles.searchbar}
      />
      
      {bids
        .filter(bid => 
          bid.lotId.toString().includes(bidSearchQuery) ||
          bid.amount.toString().includes(bidSearchQuery)
        )
        .map(bid => (
          <Card key={bid.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLot}>Lote #{bid.lotId}</Text>
                  <Text style={styles.bidAmount}>${bid.amount.toLocaleString()}</Text>
                  <Text style={styles.bidTime}>{bid.timestamp}</Text>
                  <Chip 
                    mode="outlined" 
                    textStyle={{ 
                      color: bid.status === 'active' ? CattleColors.success : 
                             bid.status === 'confirmed' ? CattleColors.info : 
                             CattleColors.error 
                    }}
                  >
                    {bid.status}
                  </Chip>
                </View>
                <View style={styles.bidActions}>
                  <IconButton
                    icon="stop"
                    iconColor={CattleColors.warning}
                    onPress={() => handleBidAction(bid.id, 'forceClose')}
                    disabled={bid.status !== 'active'}
                  />
                  <IconButton
                    icon="check"
                    iconColor={CattleColors.success}
                    onPress={() => handleBidAction(bid.id, 'confirmWinner')}
                    disabled={bid.status !== 'active'}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
    </ScrollView>
  );

  const renderReportsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Estadísticas Generales</Title>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${reports.totalSales?.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Ventas Totales</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reports.totalAuctions}</Text>
              <Text style={styles.statLabel}>Remates</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reports.totalLots}</Text>
              <Text style={styles.statLabel}>Lotes</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Top Compradores</Title>
          {reports.topBuyers?.map((buyer, index) => (
            <View key={index} style={styles.buyerItem}>
              <Text style={styles.buyerName}>{buyer.name}</Text>
              <Text style={styles.buyerStats}>
                ${buyer.totalPurchases.toLocaleString()} • {buyer.lotsCount} lotes
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Panel Administrador</Title>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {renderTabButton('usuarios', 'Usuarios', 'account')}
        {renderTabButton('remates', 'Remates', 'calendar')}
        {renderTabButton('lotes', 'Lotes', 'cow')}
        {renderTabButton('pujas', 'Pujas', 'gavel')}
        {renderTabButton('reportes', 'Reportes', 'chart-line')}
      </ScrollView>

      <View style={styles.contentContainer}>
        {activeTab === 'usuarios' && renderUsersTab()}
        {activeTab === 'remates' && renderAuctionsTab()}
        {activeTab === 'lotes' && renderCattleLotsTab()}
        {activeTab === 'pujas' && renderBidsTab()}
        {activeTab === 'reportes' && renderReportsTab()}
      </View>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          if (activeTab === 'remates') {
            setEditingAuction(null);
            setShowAuctionModal(true);
          } else if (activeTab === 'lotes') {
            setEditingLot(null);
            setShowLotModal(true);
          }
        }}
        disabled={!['remates', 'lotes'].includes(activeTab)}
      />

      {/* Modales para crear/editar remates y lotes */}
      <Portal>
        <Modal
          visible={showAuctionModal}
          onDismiss={() => setShowAuctionModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>{editingAuction ? 'Editar Remate' : 'Crear Remate'}</Title>
          <TextInput label="Nombre del remate" style={styles.input} />
          <TextInput label="Fecha" style={styles.input} />
          <Button mode="contained" onPress={() => setShowAuctionModal(false)}>
            Guardar
          </Button>
        </Modal>

        <Modal
          visible={showLotModal}
          onDismiss={() => setShowLotModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>{editingLot ? 'Editar Lote' : 'Crear Lote'}</Title>
          <TextInput label="Nombre del lote" style={styles.input} />
          <TextInput label="Raza" style={styles.input} />
          <TextInput label="Peso" style={styles.input} keyboardType="numeric" />
          <TextInput label="Precio inicial" style={styles.input} keyboardType="numeric" />
          <Button mode="contained" onPress={() => setShowLotModal(false)}>
            Guardar
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CattleColors.lightGray,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: CattleColors.primary,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabsContainer: {
    maxHeight: 60,
    marginBottom: 10,
  },
  tabsContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tabButton: {
    marginRight: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: CattleColors.primary,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },
  searchbar: {
    marginBottom: 15,
    backgroundColor: CattleColors.white,
  },
  card: {
    marginBottom: 15,
    backgroundColor: CattleColors.white,
    ...CattleColors.cardShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CattleColors.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: CattleColors.mediumGray,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    backgroundColor: CattleColors.accent,
  },
  auctionInfo: {
    flex: 1,
  },
  auctionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CattleColors.primary,
    marginBottom: 4,
  },
  auctionDate: {
    fontSize: 14,
    color: CattleColors.mediumGray,
    marginBottom: 8,
  },
  auctionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lotInfo: {
    flex: 1,
  },
  lotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CattleColors.primary,
    marginBottom: 4,
  },
  lotBreed: {
    fontSize: 14,
    color: CattleColors.mediumGray,
    marginBottom: 2,
  },
  lotWeight: {
    fontSize: 14,
    color: CattleColors.mediumGray,
    marginBottom: 8,
  },
  lotPricing: {
    marginBottom: 8,
  },
  startingPrice: {
    fontSize: 14,
    color: CattleColors.info,
    marginBottom: 2,
  },
  currentBid: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CattleColors.success,
  },
  bidInfo: {
    flex: 1,
  },
  bidLot: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CattleColors.primary,
    marginBottom: 4,
  },
  bidAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CattleColors.success,
    marginBottom: 4,
  },
  bidTime: {
    fontSize: 14,
    color: CattleColors.mediumGray,
    marginBottom: 8,
  },
  bidActions: {
    flexDirection: 'column',
  },
  actionButtons: {
    flexDirection: 'column',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CattleColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: CattleColors.mediumGray,
    textAlign: 'center',
  },
  buyerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: CattleColors.mediumLightGray,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: '500',
    color: CattleColors.primary,
  },
  buyerStats: {
    fontSize: 14,
    color: CattleColors.mediumGray,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: CattleColors.primary,
  },
  modal: {
    backgroundColor: CattleColors.white,
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 15,
    backgroundColor: CattleColors.white,
  },
});
