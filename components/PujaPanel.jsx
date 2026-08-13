import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Button, Icon } from "react-native-paper";
import { CattleColors, CattleShadows } from "../styles/colors";

export default function PujaPanel({
  counter,
  siguientePuja,
  isBidding,
  isWinning,
  showStatus,
  onPujar,
}) {
  const cardScale = useRef(new Animated.Value(1)).current;
  const amountScale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(1)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const bannerY = useRef(new Animated.Value(-10)).current;

  const incremento = useMemo(() => {
    const next = Number(siguientePuja) || 0;
    const current = Number(counter) || 0;
    return Math.max(0, next - current);
  }, [counter, siguientePuja]);

  useEffect(() => {
    amountScale.setValue(1.14);
    Animated.spring(amountScale, {
      toValue: 1,
      speed: 22,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  }, [counter, amountScale]);

  useEffect(() => {
    if (!showStatus) {
      bannerOpacity.setValue(0);
      return;
    }

    bannerOpacity.setValue(0);
    bannerY.setValue(-12);
    Animated.parallel([
      Animated.timing(bannerOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(bannerY, {
        toValue: 0,
        speed: 20,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();

    cardScale.setValue(0.98);
    Animated.spring(cardScale, {
      toValue: 1,
      speed: 18,
      bounciness: 10,
      useNativeDriver: true,
    }).start();
  }, [showStatus, isWinning, bannerOpacity, bannerY, cardScale]);

  useEffect(() => {
    if (!showStatus || !isWinning) {
      glow.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1.12,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showStatus, isWinning, glow]);

  useEffect(() => {
    if (!showStatus || isWinning) {
      buttonPulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.04,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showStatus, isWinning, buttonPulse]);

  const winning = showStatus && isWinning;
  const losing = showStatus && !isWinning;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale: cardScale }] }]}>
      {showStatus && (
        <Animated.View
          style={[
            styles.banner,
            winning ? styles.bannerWin : styles.bannerLose,
            { opacity: bannerOpacity, transform: [{ translateY: bannerY }] },
          ]}
        >
          <Animated.View
            style={[
              styles.bannerIcon,
              winning ? styles.bannerIconWin : styles.bannerIconLose,
              winning && { transform: [{ scale: glow }] },
            ]}
          >
            <Icon
              source={winning ? "crown" : "flash"}
              size={20}
              color={winning ? "#1A1204" : CattleColors.white}
            />
          </Animated.View>
          <View style={styles.bannerText}>
            <Text style={[styles.bannerKicker, losing && styles.bannerKickerLose]}>
              {winning ? "VAS GANANDO" : "TE SUPERARON"}
            </Text>
            <Text style={[styles.bannerSub, losing && styles.bannerSubLose]}>
              {winning
                ? "Tu oferta lidera este lote ahora mismo"
                : "Otra oferta tomó la delantera"}
            </Text>
          </View>
        </Animated.View>
      )}

      <View
        style={[
          styles.card,
          winning && styles.cardWin,
          losing && styles.cardLose,
        ]}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.liveLabel}>LOTE EN VIVO</Text>
            <Text style={styles.liveHint}>
              {winning ? "Estás al frente" : losing ? "Recuperá la delantera" : "Oferta actual del remate"}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              winning && styles.badgeWin,
              losing && styles.badgeLose,
            ]}
          >
            <View
              style={[
                styles.badgeDot,
                winning && styles.badgeDotWin,
                losing && styles.badgeDotLose,
              ]}
            />
            <Text
              style={[
                styles.badgeText,
                winning && styles.badgeTextWin,
                losing && styles.badgeTextLose,
              ]}
            >
              {winning ? "TU OFERTA" : losing ? "SUPERADO" : "EN PUJA"}
            </Text>
          </View>
        </View>

        <Text style={styles.amountLabel}>MONTO ACTUAL</Text>
        <Animated.Text
          style={[
            styles.amount,
            winning && styles.amountWin,
            losing && styles.amountLose,
            { transform: [{ scale: amountScale }] },
          ]}
        >
          ${Number(counter || 0).toLocaleString()}
        </Animated.Text>

        <View style={styles.nextRow}>
          <View>
            <Text style={styles.nextLabel}>SIGUIENTE PUJA</Text>
            <Text style={styles.nextAmount}>
              ${Number(siguientePuja || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.incrementPill}>
            <Text style={styles.incrementText}>
              +${Number(incremento || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
          <Button
            mode="contained"
            onPress={onPujar}
            disabled={isBidding}
            style={[
              styles.button,
              winning && styles.buttonWin,
              losing && styles.buttonLose,
            ]}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            icon={isBidding ? "timer-sand" : losing ? "restore" : "gavel"}
          >
            {isBidding
              ? "ENVIANDO PUJA..."
              : losing
                ? `RECUPERAR LOTE  $${Number(siguientePuja || 0).toLocaleString()}`
                : winning
                  ? `SEGUIR PUJANDO  $${Number(siguientePuja || 0).toLocaleString()}`
                  : `PUJAR  $${Number(siguientePuja || 0).toLocaleString()}`}
          </Button>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  bannerWin: {
    backgroundColor: "#0F2E24",
    borderColor: CattleColors.accent,
  },
  bannerLose: {
    backgroundColor: "#3A1514",
    borderColor: "#E07A76",
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bannerIconWin: {
    backgroundColor: CattleColors.accent,
  },
  bannerIconLose: {
    backgroundColor: CattleColors.error,
  },
  bannerText: {
    flex: 1,
  },
  bannerKicker: {
    color: CattleColors.accent,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  bannerKickerLose: {
    color: "#FFB4B1",
  },
  bannerSub: {
    marginTop: 2,
    color: "#E8F0EC",
    fontSize: 13,
    fontWeight: "500",
  },
  bannerSubLose: {
    color: "#F7D7D6",
  },
  card: {
    backgroundColor: CattleColors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: CattleColors.mediumLightGray,
    ...CattleShadows.floating,
  },
  cardWin: {
    backgroundColor: "#FBF8EE",
    borderColor: CattleColors.accent,
  },
  cardLose: {
    backgroundColor: "#FFF7F6",
    borderColor: "#E07A76",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: CattleColors.primary,
  },
  liveHint: {
    marginTop: 3,
    fontSize: 12,
    color: CattleColors.mediumGray,
    fontWeight: "500",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F2EC",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeWin: {
    backgroundColor: "#1A1204",
  },
  badgeLose: {
    backgroundColor: "#3A1514",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: CattleColors.success,
    marginRight: 6,
  },
  badgeDotWin: {
    backgroundColor: CattleColors.accent,
  },
  badgeDotLose: {
    backgroundColor: "#FF8A85",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: CattleColors.primary,
  },
  badgeTextWin: {
    color: CattleColors.accent,
  },
  badgeTextLose: {
    color: "#FFB4B1",
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: CattleColors.mediumGray,
  },
  amount: {
    marginTop: 4,
    fontSize: 36,
    fontWeight: "800",
    color: CattleColors.primary,
    letterSpacing: -0.8,
  },
  amountWin: {
    color: "#8A6B12",
  },
  amountLose: {
    color: CattleColors.error,
  },
  nextRow: {
    marginTop: 14,
    marginBottom: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(11, 61, 46, 0.08)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: CattleColors.mediumGray,
  },
  nextAmount: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: "700",
    color: CattleColors.primary,
  },
  incrementPill: {
    backgroundColor: CattleColors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  incrementText: {
    color: CattleColors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  button: {
    borderRadius: 14,
    backgroundColor: CattleColors.primary,
  },
  buttonWin: {
    backgroundColor: "#8A6B12",
  },
  buttonLose: {
    backgroundColor: CattleColors.error,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: CattleColors.white,
  },
});
