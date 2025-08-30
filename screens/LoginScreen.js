import React, { useState } from "react";
import { View, StyleSheet, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { TextInput, Button, Title, Text, Card } from "react-native-paper";
import { CattleColors, CattleShadows } from "../styles/colors";

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // Aquí puedes implementar la lógica de autenticación real
        if (email && password) {
            navigation.replace('Home');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            {/* Fondo con gradiente sutil */}
            <View style={styles.backgroundGradient} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo y título principal */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../assets/PerfilELITE.png")}
                        style={styles.logoImage}
                    />

                    <View style={styles.accentLine} />
                </View>

                {/* Tarjeta de login */}
                <Card style={styles.loginCard}>
                    <Card.Content>
                        <Title style={styles.loginTitle}>Acceso al Sistema</Title>
                        <Text style={styles.loginSubtitle}>Ingresa tus credenciales</Text>

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            style={styles.input}
                            labelStyle={styles.inputLabel}
                            outlineStyle={styles.inputOutline}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="email" color={CattleColors.accent} />}
                            theme={{
                                colors: {
                                    primary: CattleColors.accent,
                                    onSurfaceVariant: CattleColors.black,
                                    outline: CattleColors.mediumLightGray,
                                }
                            }}
                        />

                        <TextInput
                            label="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            style={styles.input}
                            labelStyle={styles.inputLabel}
                            outlineStyle={styles.inputOutline}
                            secureTextEntry={!showPassword}
                            left={<TextInput.Icon icon="lock" color={CattleColors.accent} />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off" : "eye"}
                                    color={CattleColors.accent}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                            theme={{
                                colors: {
                                    primary: CattleColors.accent,
                                    onSurfaceVariant: CattleColors.black,
                                    outline: CattleColors.mediumLightGray,
                                }
                            }}
                        />

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            labelStyle={styles.loginButtonText}
                            disabled={!email || !password}
                            buttonColor={CattleColors.primary}
                            textColor={CattleColors.white}
                        >
                            ACCEDER AL SISTEMA
                        </Button>

                        <Text style={styles.forgotPassword}>
                            ¿Olvidaste tu contraseña?
                        </Text>
                    </Card.Content>
                </Card>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerLine} />
                <Text style={styles.footerText}>
                    © 2024 Remate Ganadero - Sistema Profesional
                </Text>
                <Text style={styles.footerSubtext}>
                    Todos los derechos reservados
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CattleColors.lightGray,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: CattleColors.primary,
        opacity: 0.1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
        paddingBottom: 100,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 50,
        height:170,
    },
    logoImage: {
        height: 300,
        aspectRatio: 1,
        resizeMode: "contain",
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: CattleColors.accent,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        ...CattleShadows.floating,
    },
    logoIcon: {
        fontSize: 40,
    },
    logoTitle: {
        fontSize: 36,
        fontWeight: "700",
        color: CattleColors.primary,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    logoSubtitle: {
        fontSize: 16,
        color: CattleColors.secondary,
        textAlign: "center",
        marginBottom: 20,
        fontWeight: "500",
    },
    accentLine: {
        width: 60,
        height: 3,
        backgroundColor: CattleColors.accent,
        borderRadius: 2,
    },
    loginCard: {
        backgroundColor: CattleColors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: CattleColors.mediumLightGray,
        ...CattleShadows.card,
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
        color: CattleColors.primary,
        letterSpacing: -0.3,
    },
    loginSubtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 30,
        color: CattleColors.secondary,
        fontWeight: "500",
    },
    input: {
        marginBottom: 20,
        backgroundColor: CattleColors.lightGray,
        borderRadius: 8,
    },
    inputLabel: {
        color: CattleColors.black,
        fontSize: 16,
    },
    inputOutline: {
        borderRadius: 8,
        borderWidth: 1,
    },
    loginButton: {
        marginTop: 10,
        paddingVertical: 12,
        borderRadius: 8,
        ...CattleShadows.button,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    forgotPassword: {
        textAlign: "center",
        marginTop: 20,
        color: CattleColors.accent,
        fontSize: 14,
        fontWeight: "500",
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: "center",
    },
    footerLine: {
        width: 100,
        height: 2,
        backgroundColor: CattleColors.accent,
        borderRadius: 1,
        marginBottom: 15,
    },
    footerText: {
        color: CattleColors.accent,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 5,
    },
    footerSubtext: {
        color: CattleColors.secondary,
        fontSize: 12,
        opacity: 0.7,
    },
});
