import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput, Button, Title, Text, Card, SegmentedButtons } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CattleColors, CattleShadows } from "../styles/colors";
import { apiBaseUrl } from "../config/env";

const SESSION_KEYS = ["authToken", "usuario", "isLoggedIn", "rol", "userId"];

const showPendingApprovalAlert = (onOk) => {
  Alert.alert(
    "Aprobación requerida",
    "Tu cuenta debe ser aprobada por un administrador antes de ingresar a la app. Cuando te aprueben, inicia sesión con tu email y contraseña.",
    [{ text: "Entendido", onPress: onOk }]
  );
};

// Validaciones
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;
const normalizePhone = (phone) => phone.replace(/[\s\-\(\)]/g, "");
const validatePhone = (phone) => /^\+?\d{7,15}$/.test(normalizePhone(phone));
const isPhoneIdentifier = (value) => {
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.includes("@");
};
const validateLoginIdentifier = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return trimmed.includes("@") ? validateEmail(trimmed) : validatePhone(trimmed);
};
const toLoginUsername = (value) => {
  const trimmed = value.trim();
  return trimmed.includes("@") ? trimmed : normalizePhone(trimmed);
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [ci, setCi] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("signin");

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      if (!validateLoginIdentifier(email)) {
        setError("Ingresa un email o número de teléfono válido");
        return;
      }

      const username = toLoginUsername(email);

      const response = await fetch(`${apiBaseUrl}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setError(data.error || "Credenciales inválidas");
        return;
      }
      if (response.status === 403) {
        await AsyncStorage.multiRemove(SESSION_KEYS);
        showPendingApprovalAlert(() => setMode("signin"));
        return;
      }
      if (!response.ok) {
        setError("Error de servidor");
        return;
      }

      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("usuario", data.username);
      await AsyncStorage.setItem("rol", String(data.rolId));
      await AsyncStorage.setItem("isLoggedIn", "true");
      if (data.userId) {
        await AsyncStorage.setItem("userId", String(data.userId));
      }

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

      if (!nombre || !celular || !ci) {
        setError("Completa nombre, celular y CI");
        return;
      }

      if (!validateEmail(email)) {
        setError("Email inválido");
        return;
      }
      if (!validatePassword(password)) {
        setError("Contraseña debe tener al menos 6 caracteres");
        return;
      }

      // ===============================
      // VERIFICAR SI USUARIO EXISTE / ESTÁ APROBADO
      // ===============================
      try {
        const verificarUrl = `${apiBaseUrl}/auth/verificar/${encodeURIComponent(email)}`;
        const verifyResponse = await fetch(verificarUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        console.log("Verificar status:", verifyResponse.status);

        // 404 = no existe → seguir con registro
        if (verifyResponse.status !== 404) {
          if (!verifyResponse.ok) {
            console.warn("Error verificando usuario:", verifyResponse.status);
            setError("Error verificando usuario. Intenta nuevamente.");
            return;
          }

          const verified = await verifyResponse.json();
          console.log("Usuario verificado:", verified);

          if (verified.authenticated && verified.confirmed) {
            setError("Usuario ya registrado y aprobado.");
            return;
          }

          if (verified.authenticated && !verified.confirmed) {
            await AsyncStorage.multiRemove(SESSION_KEYS);
            showPendingApprovalAlert(() => setMode("signin"));
            return;
          }
        }
      } catch (error) {
        console.error("Error en verificación:", error);
        setError("No se pudo verificar usuario. Revisa tu conexión.");
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/usuarios/registrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: email,
            password: password,
            celular: celular,
            ci: ci,
            nombre: nombre,
            rol: 1,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error("Error al registrar: " + errorText);
        }

        console.log("Usuario registrado:", await response.json().catch(() => ({})));

        // Sin sesión falsa: debe volver a loguearse cuando lo aprueben (así obtiene JWT)
        await AsyncStorage.multiRemove(SESSION_KEYS);
        showPendingApprovalAlert(() => setMode("signin"));
      } catch (error) {
        console.error("Registro falló:", error);
        setError("No se pudo completar el registro. Intenta nuevamente.");
      }
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

  const isFormValid =
    mode === "signin"
      ? email && password && validateLoginIdentifier(email) && validatePassword(password)
      : nombre &&
        celular &&
        ci &&
        email &&
        password &&
        validateEmail(email) &&
        validatePassword(password);

  const signInUsesPhone = mode === "signin" && isPhoneIdentifier(email);

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
              {mode === "signin"
                ? "Accede con tu email o teléfono"
                : "Regístrate para continuar"}
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

            {mode === "signup" && (
              <>
                <TextInput
                  label="Nombre completo"
                  value={nombre}
                  onChangeText={setNombre}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                  left={<TextInput.Icon icon="account" color={CattleColors.accent} />}
                />
                <TextInput
                  label="Celular"
                  value={celular}
                  onChangeText={setCelular}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" color={CattleColors.accent} />}
                />
                <TextInput
                  label="CI"
                  value={ci}
                  onChangeText={setCi}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="card-account-details" color={CattleColors.accent} />}
                />
              </>
            )}

            <TextInput
              label={mode === "signin" ? "Email o teléfono" : "Email"}
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={mode === "signin" ? "default" : "email-address"}
              left={
                <TextInput.Icon
                  icon={mode === "signin" && signInUsesPhone ? "phone" : "email"}
                  color={CattleColors.accent}
                />
              }
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