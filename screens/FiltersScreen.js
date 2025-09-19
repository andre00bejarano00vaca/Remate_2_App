import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { 
    Button, 
    Title, 
    IconButton, 
    Card, 
    Chip, 
    Divider,
    RadioButton,
    Checkbox,
    Slider,
    TextInput
} from "react-native-paper";
import { CattleColors, CattleShadows } from "../styles/colors";
import { cattleLots } from "../data/cattleLots";

export default function FiltersScreen({ navigation, route }) {
    const { currentFilters = {}, onApplyFilters } = route.params || {};
    
    // Estados para los filtros
    const [selectedRazas, setSelectedRazas] = useState(currentFilters.razas || []);
    const [selectedEstados, setSelectedEstados] = useState(currentFilters.estados || []);
    const [pesoRange, setPesoRange] = useState(currentFilters.pesoRange || [300, 600]);
    const [precioRange, setPrecioRange] = useState(currentFilters.precioRange || [1000, 5000]);
    const [edadRange, setEdadRange] = useState(currentFilters.edadRange || [1, 8]);
    const [searchText, setSearchText] = useState(currentFilters.searchText || "");
    
    // Obtener opciones únicas de los datos
    const razasDisponibles = [...new Set(cattleLots.map(lote => lote.raza))];
    const estadosDisponibles = [...new Set(cattleLots.map(lote => lote.estado))];
    
    const goBack = () => {
        navigation.goBack();
    };

    const toggleRaza = (raza) => {
        setSelectedRazas(prev => 
            prev.includes(raza) 
                ? prev.filter(r => r !== raza)
                : [...prev, raza]
        );
    };

    const toggleEstado = (estado) => {
        setSelectedEstados(prev => 
            prev.includes(estado) 
                ? prev.filter(e => e !== estado)
                : [...prev, estado]
        );
    };

    const clearAllFilters = () => {
        setSelectedRazas([]);
        setSelectedEstados([]);
        setPesoRange([300, 600]);
        setPrecioRange([1000, 5000]);
        setEdadRange([1, 8]);
        setSearchText("");
    };

    const applyFilters = () => {
        const filters = {
            razas: selectedRazas,
            estados: selectedEstados,
            pesoRange,
            precioRange,
            edadRange,
            searchText
        };
        
        if (onApplyFilters) {
            onApplyFilters(filters);
        }
        
        navigation.goBack();
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedRazas.length > 0) count++;
        if (selectedEstados.length > 0) count++;
        if (pesoRange[0] !== 300 || pesoRange[1] !== 600) count++;
        if (precioRange[0] !== 1000 || precioRange[1] !== 5000) count++;
        if (edadRange[0] !== 1 || edadRange[1] !== 8) count++;
        if (searchText.trim() !== "") count++;
        return count;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <IconButton 
                            icon="arrow-left" 
                            size={28}
                            iconColor={CattleColors.white}
                            onPress={goBack}
                            style={styles.backButton}
                        />
                        <Title style={styles.headerTitle}>FILTROS</Title>
                    </View>
                    <View style={styles.headerRight}>
                        {getActiveFiltersCount() > 0 && (
                            <Chip 
                                mode="flat"
                                style={styles.activeFiltersChip}
                                textStyle={styles.activeFiltersText}
                            >
                                {getActiveFiltersCount()} activos
                            </Chip>
                        )}
                    </View>
                </View>
                <View style={styles.headerLine} />
            </View>

            <ScrollView 
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Búsqueda por texto */}
                <Card style={styles.filterCard}>
                    <Card.Content>
                        <Text style={styles.filterTitle}>🔍 Búsqueda</Text>
                        <TextInput
                            label="Buscar por número de lote, descripción..."
                            value={searchText}
                            onChangeText={setSearchText}
                            style={styles.searchInput}
                            mode="outlined"
                            placeholder="Ej: L-001, Brahman, genética..."
                        />
                    </Card.Content>
                </Card>

                {/* Filtro por Raza */}
                <Card style={styles.filterCard}>
                    <Card.Content>
                        <Text style={styles.filterTitle}>🐄 Raza</Text>
                        <View style={styles.chipContainer}>
                            {razasDisponibles.map(raza => (
                                <Chip
                                    key={raza}
                                    mode={selectedRazas.includes(raza) ? "flat" : "outlined"}
                                    selected={selectedRazas.includes(raza)}
                                    onPress={() => toggleRaza(raza)}
                                    style={[
                                        styles.filterChip,
                                        selectedRazas.includes(raza) && styles.selectedChip
                                    ]}
                                    textStyle={[
                                        styles.chipText,
                                        selectedRazas.includes(raza) && styles.selectedChipText
                                    ]}
                                >
                                    {raza}
                                </Chip>
                            ))}
                        </View>
                    </Card.Content>
                </Card>

                {/* Filtro por Estado */}
                <Card style={styles.filterCard}>
                    <Card.Content>
                        <Text style={styles.filterTitle}>📊 Estado</Text>
                        <View style={styles.chipContainer}>
                            {estadosDisponibles.map(estado => (
                                <Chip
                                    key={estado}
                                    mode={selectedEstados.includes(estado) ? "flat" : "outlined"}
                                    selected={selectedEstados.includes(estado)}
                                    onPress={() => toggleEstado(estado)}
                                    style={[
                                        styles.filterChip,
                                        selectedEstados.includes(estado) && styles.selectedChip
                                    ]}
                                    textStyle={[
                                        styles.chipText,
                                        selectedEstados.includes(estado) && styles.selectedChipText
                                    ]}
                                    icon={estado === "Disponible" ? "check-circle" : "clock"}
                                >
                                    {estado}
                                </Chip>
                            ))}
                        </View>
                    </Card.Content>
                </Card>

                {/* Filtro por Peso */}
                <Card style={styles.filterCard}>
                    <Card.Content>
                        <Text style={styles.filterTitle}>⚖️ Peso (kg)</Text>
                        <View style={styles.rangeContainer}>
                            <Text style={styles.rangeLabel}>
                                {pesoRange[0]} kg - {pesoRange[1]} kg
                            </Text>
                            <View style={styles.rangeInputs}>
                                <TextInput
                                    label="Mín"
                                    value={pesoRange[0].toString()}
                                    onChangeText={(text) => {
                                        const value = parseInt(text) || 0;
                                        setPesoRange([value, pesoRange[1]]);
                                    }}
                                    style={styles.rangeInput}
                                    mode="outlined"
                                    keyboardType="numeric"
                                />
                                <Text style={styles.rangeSeparator}>-</Text>
                                <TextInput
                                    label="Máx"
                                    value={pesoRange[1].toString()}
                                    onChangeText={(text) => {
                                        const value = parseInt(text) || 0;
                                        setPesoRange([pesoRange[0], value]);
                                    }}
                                    style={styles.rangeInput}
                                    mode="outlined"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Filtro por Precio */}
                <Card style={styles.filterCard}>
                    <Card.Content>
                        <Text style={styles.filterTitle}>💰 Precio (USD)</Text>
                        <View style={styles.rangeContainer}>
                            <Text style={styles.rangeLabel}>
                                ${precioRange[0]} - ${precioRange[1]}
                            </Text>
                            <View style={styles.rangeInputs}>
                                <TextInput
                                    label="Mín"
                                    value={precioRange[0].toString()}
                                    onChangeText={(text) => {
                                        const value = parseInt(text) || 0;
                                        setPrecioRange([value, precioRange[1]]);
                                    }}
                                    style={styles.rangeInput}
                                    mode="outlined"
                                    keyboardType="numeric"
                                />
                                <Text style={styles.rangeSeparator}>-</Text>
                                <TextInput
                                    label="Máx"
                                    value={precioRange[1].toString()}
                                    onChangeText={(text) => {
                                        const value = parseInt(text) || 0;
                                        setPrecioRange([precioRange[0], value]);
                                    }}
                                    style={styles.rangeInput}
                                    mode="outlined"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Filtro por Edad */}
                <Card style={styles.filterCard}>
                    <Card.Content>
                        <Text style={styles.filterTitle}>🕒 Edad (años)</Text>
                        <View style={styles.rangeContainer}>
                            <Text style={styles.rangeLabel}>
                                {edadRange[0]} - {edadRange[1]} años
                            </Text>
                            <View style={styles.rangeInputs}>
                                <TextInput
                                    label="Mín"
                                    value={edadRange[0].toString()}
                                    onChangeText={(text) => {
                                        const value = parseInt(text) || 0;
                                        setEdadRange([value, edadRange[1]]);
                                    }}
                                    style={styles.rangeInput}
                                    mode="outlined"
                                    keyboardType="numeric"
                                />
                                <Text style={styles.rangeSeparator}>-</Text>
                                <TextInput
                                    label="Máx"
                                    value={edadRange[1].toString()}
                                    onChangeText={(text) => {
                                        const value = parseInt(text) || 0;
                                        setEdadRange([edadRange[0], value]);
                                    }}
                                    style={styles.rangeInput}
                                    mode="outlined"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
                <Button
                    mode="outlined"
                    onPress={clearAllFilters}
                    style={styles.clearButton}
                    labelStyle={styles.clearButtonText}
                    icon="filter-off"
                >
                    Limpiar
                </Button>
                <Button
                    mode="contained"
                    onPress={applyFilters}
                    style={styles.applyButton}
                    labelStyle={styles.applyButtonText}
                    buttonColor={CattleColors.primary}
                    icon="check"
                >
                    Aplicar Filtros
                </Button>
            </View>
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
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    headerRight: {
        alignItems: "flex-end",
    },
    backButton: {
        backgroundColor: CattleColors.secondary,
        borderRadius: 8,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: CattleColors.white,
        letterSpacing: 0.5,
    },
    activeFiltersChip: {
        backgroundColor: CattleColors.accent,
    },
    activeFiltersText: {
        color: CattleColors.white,
        fontSize: 12,
        fontWeight: "600",
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
    filterCard: {
        backgroundColor: CattleColors.white,
        borderRadius: 12,
        marginBottom: 20,
        ...CattleShadows.card,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: CattleColors.primary,
        marginBottom: 15,
    },
    searchInput: {
        backgroundColor: CattleColors.white,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    filterChip: {
        marginBottom: 5,
        borderColor: CattleColors.primary,
    },
    selectedChip: {
        backgroundColor: CattleColors.primary,
    },
    chipText: {
        color: CattleColors.primary,
        fontSize: 14,
    },
    selectedChipText: {
        color: CattleColors.white,
    },
    rangeContainer: {
        marginTop: 10,
    },
    rangeLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: CattleColors.primary,
        textAlign: "center",
        marginBottom: 15,
    },
    rangeInputs: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rangeInput: {
        flex: 1,
        backgroundColor: CattleColors.white,
    },
    rangeSeparator: {
        fontSize: 18,
        fontWeight: "bold",
        color: CattleColors.primary,
        marginHorizontal: 15,
    },
    actionButtons: {
        flexDirection: "row",
        padding: 20,
        paddingTop: 15,
        backgroundColor: CattleColors.white,
        borderTopWidth: 1,
        borderTopColor: CattleColors.mediumLightGray,
        gap: 15,
    },
    clearButton: {
        flex: 1,
        borderColor: CattleColors.mediumGray,
        borderRadius: 8,
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: CattleColors.mediumGray,
    },
    applyButton: {
        flex: 2,
        borderRadius: 8,
        ...CattleShadows.button,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});

