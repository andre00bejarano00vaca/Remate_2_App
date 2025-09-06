import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, TextInput, Title, Paragraph, IconButton } from 'react-native-paper';
import { CattleColors } from '../styles/colors';
import LiveStreamPlayer from '../components/LiveStreamPlayer';

export default function LiveStreamScreen({ navigation }) {
    const [streamUrl, setStreamUrl] = useState('https://master.tucableip.com/fercogan/video.m3u8');
    const [currentStream, setCurrentStream] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [streamTitle, setStreamTitle] = useState('Transmisión en Vivo');

    // URLs de ejemplo para diferentes tipos de transmisiones
    const exampleStreams = [
        {
            name: 'Fercogan (Actual)',
            url: 'https://master.tucableip.com/fercogan/video.m3u8',
            description: 'Transmisión actual del remate ganadero'
        },
        {
            name: 'Big Buck Bunny (Test)',
            url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            description: 'Stream de prueba con video de alta calidad'
        },
        {
            name: 'Apple HLS Sample',
            url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
            description: 'Ejemplo oficial de Apple para HLS'
        },
        {
            name: 'Sintel (Test)',
            url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
            description: 'Stream de prueba con múltiples calidades'
        }
    ];

    const handlePlayStream = () => {
        if (!streamUrl.trim()) {
            Alert.alert('Error', 'Por favor ingresa una URL válida');
            return;
        }
        
        if (!streamUrl.includes('.m3u8')) {
            Alert.alert(
                'Advertencia', 
                'Esta URL no parece ser un stream HLS (.m3u8). Puede que no funcione correctamente.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Continuar', onPress: () => startStream() }
                ]
            );
            return;
        }
        
        startStream();
    };

    const startStream = () => {
        setCurrentStream(streamUrl);
        setIsPlaying(true);
    };

    const handleExampleStream = (example) => {
        setStreamUrl(example.url);
        setStreamTitle(example.name);
        setCurrentStream(example.url);
        setIsPlaying(true);
    };

    const handleStreamError = (error) => {
        console.log('Error en stream:', error);
        Alert.alert(
            'Error de Transmisión',
            'No se pudo conectar con la transmisión. Verifica la URL o tu conexión a internet.',
            [
                { text: 'OK', onPress: () => setIsPlaying(false) }
            ]
        );
    };

    const handleStreamLoad = (data) => {
        console.log('Stream cargado:', data);
    };

    const handleCloseStream = () => {
        setCurrentStream('');
        setIsPlaying(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    iconColor={CattleColors.white}
                    onPress={() => navigation.goBack()}
                />
                <Title style={styles.headerTitle}>Transmisiones en Vivo</Title>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Configuración de Stream */}
                <Card style={styles.configCard}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Configurar Transmisión</Title>
                        
                        <View style={styles.inputContainer}>
                            <TextInput
                                label="URL de Transmisión (.m3u8)"
                                value={streamUrl}
                                onChangeText={setStreamUrl}
                                mode="outlined"
                                style={styles.urlInput}
                                placeholder="https://ejemplo.com/stream.m3u8"
                            />
                            
                            <TextInput
                                label="Título de la Transmisión"
                                value={streamTitle}
                                onChangeText={setStreamTitle}
                                mode="outlined"
                                style={styles.titleInput}
                                placeholder="Mi Transmisión en Vivo"
                            />
                            
                            <Button
                                mode="contained"
                                onPress={handlePlayStream}
                                style={styles.playButton}
                                buttonColor={CattleColors.accent}
                                textColor={CattleColors.white}
                                icon="play"
                            >
                                Reproducir Transmisión
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                {/* Streams de Ejemplo */}
                <Card style={styles.examplesCard}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Streams de Ejemplo</Title>
                        <Paragraph style={styles.cardDescription}>
                            Selecciona uno de estos streams de prueba para verificar la funcionalidad
                        </Paragraph>
                        
                        {exampleStreams.map((stream, index) => (
                            <Card key={index} style={styles.exampleCard}>
                                <Card.Content>
                                    <View style={styles.exampleHeader}>
                                        <View style={styles.exampleInfo}>
                                            <Title style={styles.exampleTitle}>{stream.name}</Title>
                                            <Paragraph style={styles.exampleDescription}>
                                                {stream.description}
                                            </Paragraph>
                                        </View>
                                        <Button
                                            mode="outlined"
                                            onPress={() => handleExampleStream(stream)}
                                            style={styles.exampleButton}
                                            buttonColor={CattleColors.primary}
                                            textColor={CattleColors.white}
                                            compact
                                        >
                                            Probar
                                        </Button>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </Card.Content>
                </Card>

                {/* Reproductor */}
                {currentStream && (
                    <Card style={styles.playerCard}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Reproductor en Vivo</Title>
                            <LiveStreamPlayer
                                streamUrl={currentStream}
                                title={streamTitle}
                                autoPlay={isPlaying}
                                showControls={true}
                                onError={handleStreamError}
                                onLoad={handleStreamLoad}
                                onClose={handleCloseStream}
                            />
                        </Card.Content>
                    </Card>
                )}

                {/* Información Técnica */}
                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Información Técnica</Title>
                        <Paragraph style={styles.infoText}>
                            • Este reproductor soporta streams HLS (.m3u8){'\n'}
                            • Reconexión automática en caso de errores{'\n'}
                            • Indicador de estado en tiempo real{'\n'}
                            • Controles optimizados para transmisiones en vivo{'\n'}
                            • Buffering inteligente para mejor experiencia
                        </Paragraph>
                    </Card.Content>
                </Card>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 10,
        elevation: 4,
    },
    headerTitle: {
        color: CattleColors.white,
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 48, // Same as IconButton width
    },
    scrollContainer: {
        flex: 1,
        padding: 20,
    },
    configCard: {
        marginBottom: 20,
        backgroundColor: CattleColors.white,
        elevation: 3,
    },
    examplesCard: {
        marginBottom: 20,
        backgroundColor: CattleColors.white,
        elevation: 3,
    },
    playerCard: {
        marginBottom: 20,
        backgroundColor: CattleColors.white,
        elevation: 3,
    },
    infoCard: {
        marginBottom: 20,
        backgroundColor: CattleColors.white,
        elevation: 3,
    },
    cardTitle: {
        color: CattleColors.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cardDescription: {
        color: CattleColors.mediumGray,
        marginBottom: 15,
    },
    inputContainer: {
        gap: 15,
    },
    urlInput: {
        backgroundColor: CattleColors.white,
    },
    titleInput: {
        backgroundColor: CattleColors.white,
    },
    playButton: {
        marginTop: 10,
    },
    exampleCard: {
        marginBottom: 10,
        backgroundColor: CattleColors.lightGray,
        elevation: 1,
    },
    exampleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    exampleInfo: {
        flex: 1,
        marginRight: 10,
    },
    exampleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: CattleColors.primary,
        marginBottom: 5,
    },
    exampleDescription: {
        fontSize: 12,
        color: CattleColors.mediumGray,
    },
    exampleButton: {
        minWidth: 80,
    },
    infoText: {
        color: CattleColors.darkGray,
        lineHeight: 20,
    },
});
