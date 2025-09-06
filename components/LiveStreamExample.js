import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import LiveStreamPlayer from './LiveStreamPlayer';
import { CattleColors } from '../styles/colors';

export default function LiveStreamExample() {
    const [streamUrl, setStreamUrl] = useState('');
    const [currentStream, setCurrentStream] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

    // URLs de ejemplo para probar diferentes transmisiones
    const exampleUrls = [
        {
            name: 'Fercogan (Actual)',
            url: 'https://master.tucableip.com/fercogan/index.m3u8'
        },
        {
            name: 'Big Buck Bunny (Test)',
            url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
        },
        {
            name: 'Apple HLS Sample',
            url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
        }
    ];

    const handlePlayStream = () => {
        if (!streamUrl.trim()) {
            Alert.alert('Error', 'Por favor ingresa una URL válida');
            return;
        }
        
        if (!streamUrl.includes('.m3u8')) {
            Alert.alert('Advertencia', 'Esta URL no parece ser un stream HLS (.m3u8). Puede que no funcione correctamente.');
        }
        
        setCurrentStream(streamUrl);
        setIsPlaying(true);
    };

    const handleExampleUrl = (url) => {
        setStreamUrl(url);
        setCurrentStream(url);
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
        Alert.alert('Éxito', 'Transmisión conectada correctamente');
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.title}>Reproductor de Transmisiones en Vivo</Text>
                    
                    {/* Input para URL personalizada */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>URL de Transmisión (.m3u8):</Text>
                        <TextInput
                            style={styles.input}
                            value={streamUrl}
                            onChangeText={setStreamUrl}
                            placeholder="https://ejemplo.com/stream.m3u8"
                            placeholderTextColor={CattleColors.mediumGray}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Button
                            title="Reproducir"
                            onPress={handlePlayStream}
                            color={CattleColors.accent}
                        />
                    </View>

                    {/* URLs de ejemplo */}
                    <View style={styles.examplesContainer}>
                        <Text style={styles.label}>URLs de Ejemplo:</Text>
                        {exampleUrls.map((example, index) => (
                            <Button
                                key={index}
                                title={example.name}
                                onPress={() => handleExampleUrl(example.url)}
                                color={CattleColors.primary}
                                style={styles.exampleButton}
                            />
                        ))}
                    </View>
                </Card.Content>
            </Card>

            {/* Reproductor */}
            {currentStream && (
                <Card style={styles.playerCard}>
                    <Card.Content>
                        <Text style={styles.playerTitle}>Reproductor en Vivo</Text>
                        <LiveStreamPlayer
                            streamUrl={currentStream}
                            title="Transmisión de Prueba"
                            autoPlay={isPlaying}
                            showControls={true}
                            onError={handleStreamError}
                            onLoad={handleStreamLoad}
                            onClose={() => {
                                setCurrentStream('');
                                setIsPlaying(false);
                            }}
                        />
                    </Card.Content>
                </Card>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: CattleColors.lightGray,
    },
    card: {
        marginBottom: 20,
        backgroundColor: CattleColors.white,
        borderRadius: 12,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: CattleColors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: CattleColors.primary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: CattleColors.mediumLightGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: CattleColors.white,
        marginBottom: 10,
    },
    examplesContainer: {
        marginTop: 10,
    },
    exampleButton: {
        marginBottom: 8,
    },
    playerCard: {
        backgroundColor: CattleColors.white,
        borderRadius: 12,
        elevation: 3,
    },
    playerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: CattleColors.primary,
        marginBottom: 15,
        textAlign: 'center',
    },
});
