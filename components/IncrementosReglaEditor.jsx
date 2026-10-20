import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { CattleColors } from '../styles/colors';

const PLANTILLAS = [
  {
    id: 'clasica',
    titulo: 'Clásica',
    desc: '<500: 20↔30 · luego 50',
    tramos: [
      { hasta: '500', pasos: [20, 30] },
      { hasta: null, pasos: [50] },
    ],
  },
  {
    id: 'diez',
    titulo: 'De 10 en 10',
    desc: 'Siempre +10',
    tramos: [{ hasta: null, pasos: [10] }],
  },
  {
    id: 'veinte',
    titulo: 'De 20 en 20',
    desc: 'Siempre +20',
    tramos: [{ hasta: null, pasos: [20] }],
  },
  {
    id: 'mix50',
    titulo: '20/30 → 50',
    desc: '<500 alterna · luego +50',
    tramos: [
      { hasta: '500', pasos: [20, 30] },
      { hasta: null, pasos: [50] },
    ],
  },
];

const PASOS_RAPIDOS = [10, 20, 30, 50, 100];

export const defaultTramosUI = () => [
  { hasta: '500', pasos: [20, 30] },
  { hasta: null, pasos: [50] },
];

export const reglaToUI = (regla) => {
  if (!regla?.tramos?.length) return defaultTramosUI();
  return regla.tramos.map((t, i, arr) => {
    const isLast = i === arr.length - 1;
    return {
      hasta: t.hasta == null || isLast ? null : String(t.hasta),
      pasos: Array.isArray(t.pasos)
        ? t.pasos.map(Number).filter((n) => Number.isFinite(n) && n > 0)
        : [],
    };
  });
};

export const uiToRegla = (tramosUI) => ({
  version: 1,
  tramos: tramosUI.map((t, i) => {
    const isLast = i === tramosUI.length - 1;
    return {
      hasta: isLast || t.hasta == null || t.hasta === '' ? null : Number(String(t.hasta).trim()),
      pasos: (t.pasos || []).map(Number).filter((n) => Number.isFinite(n) && n > 0),
    };
  }),
});

/** Preview local alineado a la lógica del backend (tramos + ciclo). */
function previewIncrementos(tramosUI, montoInicio = 480, pasos = 3) {
  const regla = uiToRegla(tramosUI);
  const lines = [];
  let current = Number(montoInicio) || 0;
  let indice = 0;
  let tramoKey = null;

  const elegir = (monto) => {
    for (const t of regla.tramos) {
      if (t.hasta == null || monto < t.hasta) return t;
    }
    return regla.tramos[regla.tramos.length - 1];
  };

  for (let n = 0; n < pasos; n++) {
    const tramo = elegir(current);
    const key = tramo.hasta;
    if (tramoKey !== key) {
      tramoKey = key;
      indice = 0;
    }
    const lista = tramo.pasos;
    if (!lista?.length) break;
    const i = ((indice % lista.length) + lista.length) % lista.length;
    const inc = lista[i];
    const next = current + inc;
    lines.push({ from: current, inc, to: next });
    current = next;
    indice = (i + 1) % lista.length;
    const tramo2 = elegir(current);
    if (tramo2.hasta !== tramoKey) {
      tramoKey = tramo2.hasta;
      indice = 0;
    }
  }
  return lines;
}

function ModeCard({ selected, title, subtitle, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.modeCard, selected && styles.modeCardSelected]}
    >
      <Text style={[styles.modeTitle, selected && styles.modeTitleSelected]}>{title}</Text>
      <Text style={[styles.modeSub, selected && styles.modeSubSelected]}>{subtitle}</Text>
    </Pressable>
  );
}

function PasoChips({ pasos, onChange }) {
  const [draft, setDraft] = useState('');

  const addPaso = (n) => {
    if (!Number.isFinite(n) || n <= 0) return;
    onChange([...(pasos || []), n]);
  };

  const removeAt = (index) => {
    onChange((pasos || []).filter((_, i) => i !== index));
  };

  return (
    <View>
      <Text style={styles.fieldLabel}>Pasos de incremento</Text>
      <View style={styles.chipsRow}>
        {(pasos || []).map((p, i) => (
          <Chip
            key={`${p}-${i}`}
            compact
            onClose={() => removeAt(i)}
            style={styles.pasoChip}
            textStyle={styles.pasoChipText}
          >
            +{p}
          </Chip>
        ))}
        {!(pasos || []).length && (
          <Text style={styles.emptyPasos}>Agregá al menos un paso</Text>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        {PASOS_RAPIDOS.map((n) => (
          <Chip
            key={`quick-${n}`}
            compact
            mode="outlined"
            onPress={() => addPaso(n)}
            style={styles.quickChip}
          >
            +{n}
          </Chip>
        ))}
      </ScrollView>
      <View style={styles.customPasoRow}>
        <TextInput
          dense
          mode="outlined"
          label="Otro"
          value={draft}
          keyboardType="numeric"
          onChangeText={setDraft}
          style={styles.customPasoInput}
        />
        <Button
          mode="contained-tonal"
          compact
          onPress={() => {
            const n = Number(String(draft).trim());
            if (!Number.isFinite(n) || n <= 0) return;
            addPaso(n);
            setDraft('');
          }}
        >
          Añadir
        </Button>
      </View>
      <Text style={styles.microHint}>
        Un paso = siempre ese monto. Varios = rotan (ej. +20, +30, +20…).
      </Text>
    </View>
  );
}

export default function IncrementosReglaEditor({
  useCustomRegla,
  onChangeUseCustom,
  tramosUI,
  onChangeTramos,
}) {
  const preview = useMemo(
    () => (useCustomRegla ? previewIncrementos(tramosUI, 480, 3) : previewDefaultLegacy()),
    [useCustomRegla, tramosUI]
  );

  const updateTramo = (index, patch) => {
    onChangeTramos(tramosUI.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const applyPlantilla = (plantilla) => {
    onChangeUseCustom(true);
    onChangeTramos(
      plantilla.tramos.map((t, i, arr) => ({
        hasta: i === arr.length - 1 || t.hasta == null ? null : String(t.hasta),
        pasos: [...t.pasos],
      }))
    );
  };

  const addTramo = () => {
    // El último siempre es "hasta infinito". Al agregar:
    // el que era ∞ pasa a "menor a X", y el NUEVO queda como ∞ al final.
    const last = tramosUI[tramosUI.length - 1] || { hasta: null, pasos: [50] };
    const before = tramosUI.slice(0, -1);
    const prevHasta = before.length
      ? Number(before[before.length - 1].hasta) || 500
      : 0;
    const suggestedHasta =
      last.hasta != null && String(last.hasta).trim() !== ''
        ? String(last.hasta)
        : String(prevHasta > 0 ? prevHasta * 2 : 500);

    onChangeTramos([
      ...before,
      {
        hasta: suggestedHasta,
        pasos: [...(last.pasos || [50])],
      },
      {
        hasta: null,
        pasos: [50],
      },
    ]);
  };

  const removeTramo = (index) => {
    if (tramosUI.length <= 1) return;
    // No borrar el último “en adelante”; si piden borrar el último, fusionar hacia atrás
    if (index === tramosUI.length - 1 && tramosUI.length > 1) {
      const next = tramosUI.slice(0, -1);
      next[next.length - 1] = { ...next[next.length - 1], hasta: null };
      onChangeTramos(next);
      return;
    }
    let next = tramosUI.filter((_, i) => i !== index);
    if (next.length && next[next.length - 1].hasta != null) {
      next = next.map((t, i) =>
        i === next.length - 1 ? { ...t, hasta: null } : t
      );
    }
    onChangeTramos(next);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Incrementos de puja</Text>

      <View style={styles.modeRow}>
        <ModeCard
          selected={!useCustomRegla}
          title="Por defecto"
          subtitle="<500: 20↔30 · luego 50 · 100 · 500"
          onPress={() => onChangeUseCustom(false)}
        />
        <ModeCard
          selected={useCustomRegla}
          title="Personalizada"
          subtitle="Plantillas o tramos a medida"
          onPress={() => {
            onChangeUseCustom(true);
            // Si aún no hay tramos útiles, empezar con menor-a y luego ∞
            if (!tramosUI?.length) {
              onChangeTramos(defaultTramosUI());
            }
          }}
        />
      </View>

      {useCustomRegla && (
        <>
          <Text style={styles.fieldLabel}>Plantillas rápidas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plantillasRow}
          >
            {PLANTILLAS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => applyPlantilla(p)}
                style={styles.plantillaCard}
              >
                <Text style={styles.plantillaTitle}>{p.titulo}</Text>
                <Text style={styles.plantillaDesc}>{p.desc}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {tramosUI.map((tramo, index) => {
            const isLast = index === tramosUI.length - 1;
            const desdeLabel =
              index === 0
                ? '$0'
                : `$${Number(tramosUI[index - 1].hasta || 0).toLocaleString()}`;

            return (
              <View key={`tramo-${index}`} style={styles.tramoCard}>
                <View style={styles.tramoHeader}>
                  <Text style={styles.tramoTitle}>
                    {isLast ? 'A partir de ahí' : `Tramo ${index + 1}`}
                  </Text>
                  <Text style={styles.tramoRange}>
                    {isLast
                      ? `${desdeLabel} → ∞`
                      : `${desdeLabel} → $${Number(tramo.hasta || 0).toLocaleString()}`}
                  </Text>
                </View>

                {!isLast && (
                  <TextInput
                    mode="outlined"
                    dense
                    label="Mientras la puja sea menor a"
                    value={tramo.hasta == null ? '' : String(tramo.hasta)}
                    keyboardType="numeric"
                    onChangeText={(text) => updateTramo(index, { hasta: text })}
                    style={styles.input}
                  />
                )}

                {isLast && (
                  <Text style={styles.lastHint}>
                    Este tramo aplica desde {desdeLabel} en adelante.
                  </Text>
                )}

                <PasoChips
                  pasos={tramo.pasos || []}
                  onChange={(pasos) => updateTramo(index, { pasos })}
                />

                {tramosUI.length > 1 && (
                  <Button
                    mode="text"
                    textColor={CattleColors.error}
                    onPress={() => removeTramo(index)}
                    compact
                  >
                    Quitar tramo
                  </Button>
                )}
              </View>
            );
          })}

          <Button mode="outlined" icon="plus" onPress={addTramo} style={styles.addBtn}>
            Agregar tramo (nuevo = en adelante)
          </Button>
        </>
      )}

      <View style={styles.previewBox}>
        <Text style={styles.previewTitle}>Vista previa</Text>
        <Text style={styles.previewSub}>
          Ejemplo partiendo de $480
          {!useCustomRegla ? ' (regla por defecto)' : ''}
        </Text>
        {preview.map((row, i) => (
          <Text key={`prev-${i}`} style={styles.previewLine}>
            ${row.from.toLocaleString()} → <Text style={styles.previewInc}>+{row.inc}</Text>
            {' → '}${row.to.toLocaleString()}
          </Text>
        ))}
      </View>
    </View>
  );
}

function previewDefaultLegacy() {
  const lines = [];
  let current = 480;
  for (let n = 0; n < 3; n++) {
    let inc;
    if (current < 500) inc = current % 50 === 0 ? 30 : 20;
    else if (current < 1000) inc = 50;
    else if (current < 2000) inc = 100;
    else inc = 500;
    const to = current + inc;
    lines.push({ from: current, inc, to });
    current = to;
  }
  return lines;
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: CattleColors.primary,
    marginBottom: 10,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: CattleColors.mediumLightGray,
    borderRadius: 10,
    padding: 10,
    backgroundColor: CattleColors.white,
  },
  modeCardSelected: {
    borderColor: CattleColors.primary,
    backgroundColor: '#E8F2ED',
  },
  modeTitle: {
    fontWeight: '700',
    fontSize: 13,
    color: CattleColors.darkGray,
    marginBottom: 4,
  },
  modeTitleSelected: {
    color: CattleColors.primary,
  },
  modeSub: {
    fontSize: 11,
    color: CattleColors.mediumGray,
    lineHeight: 14,
  },
  modeSubSelected: {
    color: CattleColors.secondary,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CattleColors.darkGray,
    marginBottom: 6,
  },
  plantillasRow: {
    gap: 8,
    paddingBottom: 10,
  },
  plantillaCard: {
    minWidth: 120,
    borderRadius: 10,
    padding: 10,
    backgroundColor: CattleColors.primary,
    marginRight: 4,
  },
  plantillaTitle: {
    color: CattleColors.white,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  plantillaDesc: {
    color: CattleColors.accent,
    fontSize: 11,
  },
  tramoCard: {
    borderWidth: 1,
    borderColor: CattleColors.mediumLightGray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: CattleColors.neutral,
  },
  tramoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tramoTitle: {
    fontWeight: '700',
    color: CattleColors.primary,
    fontSize: 14,
  },
  tramoRange: {
    fontSize: 11,
    color: CattleColors.mediumGray,
    fontWeight: '600',
  },
  lastHint: {
    fontSize: 12,
    color: CattleColors.mediumGray,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
    backgroundColor: CattleColors.white,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
    minHeight: 32,
    alignItems: 'center',
  },
  pasoChip: {
    backgroundColor: '#E8F2ED',
  },
  pasoChipText: {
    color: CattleColors.primary,
    fontWeight: '600',
  },
  emptyPasos: {
    fontSize: 12,
    color: CattleColors.error,
  },
  quickRow: {
    gap: 6,
    paddingBottom: 8,
  },
  quickChip: {
    borderColor: CattleColors.secondary,
  },
  customPasoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  customPasoInput: {
    flex: 1,
    backgroundColor: CattleColors.white,
  },
  microHint: {
    fontSize: 11,
    color: CattleColors.mediumGray,
    marginTop: 2,
    marginBottom: 4,
  },
  addBtn: {
    marginBottom: 10,
    borderColor: CattleColors.primary,
  },
  previewBox: {
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#0B3D2E',
    marginTop: 4,
  },
  previewTitle: {
    color: CattleColors.accent,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  previewSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginBottom: 8,
  },
  previewLine: {
    color: CattleColors.white,
    fontSize: 13,
    marginBottom: 4,
    fontVariant: ['tabular-nums'],
  },
  previewInc: {
    color: CattleColors.accent,
    fontWeight: '700',
  },
});
