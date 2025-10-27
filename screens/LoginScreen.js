import React, { useState } from "react";
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { TextInput, Button, Title, Text, Card, SegmentedButtons } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CattleColors, CattleShadows } from "../styles/colors";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("signin"); // "signin" o "signup"

  const handleSignIn = async () => {
    try {
      const response = await fetch(`https://testapp.digitaltelecom.net/auth/existe/${email}`);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Usuario no aprobado ❌");
        } else if (response.status === 404) {
          setError("Usuario no encontrado. Regístrate primero.");
        } else {
          setError("Error al iniciar sesión");
        }
        return;
      }

      // Login exitoso
      await AsyncStorage.setItem("usuario", email);
      await AsyncStorage.setItem("password", password)
      await AsyncStorage.setItem("isLoggedIn", "true");
      navigation.replace("RematesList");

    } catch (err) {
      console.error("Error en login:", err);
      setError("No se pudo iniciar sesión, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError("");

      // Verificar si el usuario ya existe
      const checkResponse = await fetch("https://testapp.digitaltelecom.net/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
        }).toString(),
      });

      if (checkResponse.ok) {
        const checkText = await checkResponse.text();
        if (checkText.includes("exists") || checkText.includes("ya existe")) {
          setError("El usuario ya está registrado. Usa 'Iniciar Sesión' en su lugar.");
          return;
        }
      }

      const response = await fetch("https://testapp.digitaltelecom.net/auth/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password: password,
        }).toString(),
      });

      const text = await response.text();
      console.log("Backend Register:", text);

      if (!response.ok) {
        if (response.status === 409) {
          setError("El usuario ya está registrado ❌");
        } else {
          setError("Error al registrar");
        }
        return;
      }

      // Si llega aquí, el registro fue exitoso
      await AsyncStorage.setItem("usuario", email);
      await AsyncStorage.setItem("isLoggedIn", "true");
      navigation.replace("PendingApproval");

    } catch (err) {
      console.error("Error en registro:", err);
      setError("No se pudo registrar, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "signin") {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.backgroundGradient} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/PerfilELITE.png")}
            style={styles.logoImage}
          />
          <View style={styles.accentLine} />
        </View>

        {/* Tarjeta Login/Registro */}
        <Card style={styles.loginCard}>
          <Card.Content>
            <Title style={styles.loginTitle}>
              {mode === "signin" ? "Iniciar Sesión" : "Registro de Usuario"}
            </Title>
            <Text style={styles.loginSubtitle}>
              {mode === "signin" ? "Accede a tu cuenta" : "Crea tu cuenta para acceder"}
            </Text>

            {/* Selector de modo */}
            <SegmentedButtons
              value={mode}
              onValueChange={setMode}
              buttons={[
                {
                  value: 'signin',
                  label: 'Iniciar Sesión',
                  icon: 'login',
                },
                {
                  value: 'signup',
                  label: 'Registrarse',
                  icon: 'account-plus',
                },
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

            {error ? <Text style={{ color: "red", textAlign: "center" }}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.loginButton}
              disabled={!email || !password || loading}
              buttonColor={CattleColors.primary}
              textColor={CattleColors.white}
              loading={loading}
            >
              {mode === "signin" ? "INICIAR SESIÓN" : "REGISTRARME"}
            </Button>

            {/* Información adicional */}
            {mode === "signin" && (
              <Text style={styles.helpText}>
                ¿No tienes cuenta? Cambia a "Registrarse" arriba.
              </Text>
            )}
            {mode === "signup" && (
              <Text style={styles.helpText}>
                ¿Ya tienes cuenta? Cambia a "Iniciar Sesión" arriba.
              </Text>
            )}
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
