import React, { useState } from "react";
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { TextInput, Button, Title, Text, Card, SegmentedButtons } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CattleColors, CattleShadows } from "../styles/colors";

// Validaciones
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("signin");

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      if (!validateEmail(email)) {
        setError("Por favor ingresa un email válido");
        return;
      }

      // Envía email Y contraseña (típico en auth)
      const response = await fetch("https://testapp.digitaltelecom.net/auth/existe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Email o contraseña incorrectos");
        } else if (response.status === 404) {
          setError("Usuario no registrado. Crea una cuenta.");
        } else {
          setError("Error al iniciar sesión. Intenta más tarde.");
        }
        return;
      }

      // Guarda solo el email (NUNCA guardes contraseñas)
      await AsyncStorage.setItem("usuario", email);
      await AsyncStorage.setItem("isLoggedIn", "true");
      
      // Opcional: guardar token JWT si el servidor lo proporciona
      // const data = await response.json();
      // if (data.token) await AsyncStorage.setItem("authToken", data.token);

      navigation.replace("RematesList");

    } catch (err) {
      console.error("Error en login:", err);
      setError("Conexión fallida. Verifica tu internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError("");

      // Validaciones
      if (!validateEmail(email)) {
        setError("Email inválido");
        return;
      }
      if (!validatePassword(password)) {
        setError("Contraseña debe tener al menos 6 caracteres");
        return;
      }

      // Verificar si existe
      const checkResponse = await fetch("https://testapp.digitaltelecom.net/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.status === 409 || (checkResponse.ok && await checkResponse.text().includes("existe"))) {
        setError("Este email ya está registrado.");
        return;
      }

      // Registrar
      const response = await fetch("https://testapp.digitaltelecom.net/auth/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("Error en registro. Intenta con otro email.");
        return;
      }

      await AsyncStorage.setItem("usuario", email);
      await AsyncStorage.setItem("isLoggedIn", "true");
      navigation.replace("PendingApproval");

    } catch (err) {
      console.error("Error en signup:", err);
      setError("Fallo en la conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    mode === "signin" ? handleSignIn() : handleSignUp();
  };

  const isFormValid = email && password && validateEmail(email) && validatePassword(password);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.backgroundGradient} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/PerfilELITE.png")}
            style={styles.logoImage}
          />
          <View style={styles.accentLine} />
        </View>

        <Card style={styles.loginCard}>
          <Card.Content>
            <Title style={styles.loginTitle}>
              {mode === "signin" ? "Iniciar Sesión" : "Crear Cuenta"}
            </Title>
            <Text style={styles.loginSubtitle}>
              {mode === "signin" ? "Accede con tu email" : "Regístrate para continuar"}
            </Text>

            <SegmentedButtons
              value={mode}
              onValueChange={setMode}
              buttons={[
                { value: 'signin', label: 'Iniciar Sesión', icon: 'login' },
                { value: 'signup', label: 'Registrarse', icon: 'account-plus' },
              ]}
              style={styles.segmentedButtons}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" color={CattleColors.accent} />}
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" color={CattleColors.accent} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  color={CattleColors.accent}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            {mode === "signup" && (
              <Text style={styles.helperText}>
                Mín. 6 caracteres
              </Text>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.loginButton}
              disabled={!isFormValid || loading}
              buttonColor={CattleColors.primary}
              textColor={CattleColors.white}
              loading={loading}
            >
              {mode === "signin" ? "INICIAR SESIÓN" : "REGISTRARME"}
            </Button>

            <Text style={styles.helpText}>
              {mode === "signin" ? "¿Sin cuenta? Usa 'Registrarse'" : "¿Ya tienes cuenta? Usa 'Iniciar Sesión'"}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CattleColors.lightGray },
  backgroundGradient: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: CattleColors.primary,
    opacity: 0.1,
  },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  logoContainer: { alignItems: "center", marginBottom: 40 },
  logoImage: { height: 200, resizeMode: "contain" },
  accentLine: { width: 60, height: 3, backgroundColor: CattleColors.accent, borderRadius: 2 },
  loginCard: { backgroundColor: CattleColors.white, borderRadius: 16, ...CattleShadows.card },
  loginTitle: { fontSize: 26, fontWeight: "600", textAlign: "center", marginBottom: 8, color: CattleColors.primary },
  loginSubtitle: { fontSize: 15, textAlign: "center", marginBottom: 20, color: CattleColors.secondary },
  segmentedButtons: { marginBottom: 20 },
  input: { marginBottom: 20, backgroundColor: CattleColors.lightGray },
  loginButton: { marginTop: 10, paddingVertical: 12, borderRadius: 8, ...CattleShadows.button },
  helpText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 15,
    color: CattleColors.mediumGray,
    fontStyle: "italic"
  },
});