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

      if (!validateEmail(email)) {
        setError("Por favor ingresa un email válido");
        return;
      }

      // 1. Usar la URL correcta del endpoint @GetMapping("/confirmado/{username}")
    const response = await fetch(`https://testapp.digitaltelecom.net/api/usuarios/confirmado/${encodeURIComponent(email)}`);

    console.log(response.status, " - Verificando usuario:", email);
    if (!response.ok) {
      // Esto solo pasaría si el servidor se cae (500) o la URL está mal (404)
      setError("Error de conexión con el servidor");
      return;
    }

    // 2. Parsear el objeto ConfirmadoTF
    const data = await response.json(); 
    // data = { authenticated: boolean, confirmed: boolean }

    // 3. Lógica de validación basada en los booleanos del Backend
    if (!data.authenticated) {
      setError("Usuario no registrado. Crea una cuenta.");
      return;
    }

    if (!data.confirmed) {
      // El usuario existe pero aún no ha sido aceptado por el admin
      setError("Tu cuenta está pendiente de aprobación.");
      // Opcional: navigation.replace("PendingApproval");
      return;
    }

    // 4. Si ambos son true, el login es "exitoso"
    console.log("Login exitoso para:", email);
    await AsyncStorage.setItem("usuario", email);
    await AsyncStorage.setItem("isLoggedIn", "true");
    
    navigation.replace("RematesList");

      const obtenerRol = async (email) => {
        try {
          // No hace falta 'method: GET' porque es el default, ni Content-Type
          const response = await fetch(`https://testapp.digitaltelecom.net/api/usuarios/rol/${email}`);

          if (!response.ok) {
            throw new Error("No se pudo obtener el rol");
          }

          const data = await response.json();
          console.log("ID de Rol recibido:", data.rolId);

          await AsyncStorage.setItem("rol", String(data.rolId));
          return data.rolId;

        } catch (error) {
          console.error("Error obteniendo rol:", error);
        }
      };

      obtenerRol(email);
      // Si el servidor responde OK, loguear posible payload para depuración
      try {
        const data = await response.json();
        console.log("Login response:", data);
        if (data.token) {
          await AsyncStorage.setItem("authToken", data.token);
        }
      } catch (e) {
        console.log("Login: respuesta OK sin JSON:", e);
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

      if (!nombre || !celular || !ci) {
        setError("Completa nombre, celular y CI");
        return;
      }

      // Validaciones
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
        // Construir URL segura (email puede tener @ + etc.)
        const verificarUrl =
          `https://testapp.digitaltelecom.net/auth/verificar/${encodeURIComponent(email)}`;

        // Hacer request GET
        const verifyResponse = await fetch(verificarUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Verificar status:", verifyResponse.status);

        // ===============================
        // CASO 1: Usuario NO existe (404)
        // ===============================
        if (verifyResponse.status === 404) {
          console.log("Usuario no existe, continuar registro normal...");
          // Aquí simplemente sigues el flujo normal del registro
          return;
        }

        // ===============================
        // CASO 2: Otro error inesperado
        // ===============================
        if (!verifyResponse.ok) {
          console.warn("Error verificando usuario:", verifyResponse.status);
          setError("Error verificando usuario. Intenta nuevamente.");
          return;
        }

        // ===============================
        // CASO 3: Respuesta válida JSON
        // ===============================
        const verified = await verifyResponse.json();

        console.log("Usuario verificado:", verified);

        // verified = { authenticated: true/false, confirmed: true/false }

        // ===============================
        // SI YA EXISTE Y ESTÁ APROBADO
        // ===============================
        if (verified.authenticated && verified.confirmed) {
          setError("Usuario ya registrado y aprobado.");
          return;
        }

        // ===============================
        // SI EXISTE PERO NO ESTÁ APROBADO
        // ===============================
        if (verified.authenticated && !verified.confirmed) {
          await AsyncStorage.setItem("usuario", email);
          await AsyncStorage.setItem("isLoggedIn", "true");

          navigation.replace("PendingApproval");
          return;
        }

        // ===============================
        // SI NO EXISTE → CONTINUAR REGISTRO NORMAL
        // ===============================
        console.log("Usuario no registrado, continuar flujo...");

      } catch (error) {
        console.error("Error en verificación:", error);
        setError("No se pudo verificar usuario. Revisa tu conexión.");
      }

      try {
        const response = await fetch("https://testapp.digitaltelecom.net/api/usuarios/registrar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        const data = await response.json();
        console.log("Usuario registrado:", data);
        await AsyncStorage.setItem("rol", data.rol || 1);

      } catch (error) {
        console.error("Registro falló:", error);
      }


      await AsyncStorage.setItem("usuario", email);
      await AsyncStorage.setItem("rol", JSON.stringify(["CLIENTE"]));
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

  const isFormValid =
    mode === "signin"
      ? email && password && validateEmail(email) && validatePassword(password)
      : nombre &&
        celular &&
        ci &&
        email &&
        password &&
        validateEmail(email) &&
        validatePassword(password);

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