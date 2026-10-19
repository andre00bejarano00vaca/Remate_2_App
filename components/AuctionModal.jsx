// import React, { useEffect, useState } from 'react';
// import { StyleSheet } from 'react-native';
// import {
//   Modal,
//   Text,
//   TextInput,
//   Button,
//   RadioButton,
//   List,
// } from 'react-native-paper';
// import {
//   DatePickerModal,
//   TimePickerModal,
//   registerTranslation,
// } from 'react-native-paper-dates';

// /* =======================
//    Traducciones Español
// ======================= */
// registerTranslation('es', {
//   save: 'Guardar',
//   selectSingle: 'Seleccionar fecha',
//   selectMultiple: 'Seleccionar fechas',
//   selectRange: 'Seleccionar rango',
//   notAccordingToDateFormat: (inputFormat) =>
//     `No coincide con el formato ${inputFormat}`,
//   mustBeHigherThan: (date) => `Debe ser posterior a ${date}`,
//   mustBeLowerThan: (date) => `Debe ser anterior a ${date}`,
//   dateIsDisabled: 'Fecha deshabilitada',
//   previous: 'Anterior',
//   next: 'Siguiente',
//   typeInDate: 'Ingresar fecha',
//   close: 'Cerrar',
// });

// /* =======================
//    Helpers Fecha Local
// ======================= */
// const parseLocalDate = (iso) => {
//   if (!iso) return undefined;
//   const [d, t] = iso.split('T');
//   const [y, m, day] = d.split('-').map(Number);
//   const [h, min] = (t || '00:00').split(':').map(Number);
//   return new Date(y, m - 1, day, h, min);
// };

// const formatLocalDateTime = (date) => {
//   if (!date) return null;
//   const pad = (n) => n.toString().padStart(2, '0');
//   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
//     date.getDate()
//   )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
// };

// /* =======================
//    Componente
// ======================= */
// export default function AuctionModal({
//   visible,
//   onDismiss,
//   onSave,
//   editingAuction,
//   cabanas,
// }) {
//   const [auction, setAuction] = useState({});

//   const [startDate, setStartDate] = useState();
//   const [endDate, setEndDate] = useState();

//   const [showStartDate, setShowStartDate] = useState(false);
//   const [showStartTime, setShowStartTime] = useState(false);
//   const [showEndDate, setShowEndDate] = useState(false);
//   const [showEndTime, setShowEndTime] = useState(false);

//   useEffect(() => {
//     if (editingAuction) {
//       setAuction(editingAuction);
//       setStartDate(parseLocalDate(editingAuction.fecha));
//       setEndDate(parseLocalDate(editingAuction.fechaFin));
//     } else {
//       setAuction({});
//       setStartDate(undefined);
//       setEndDate(undefined);
//     }
//   }, [editingAuction, visible]);

//   /* =======================
//      Confirmaciones
//   ======================= */
//   const confirmStartDate = (date) => {
//     setShowStartDate(false);
//     if (!date) return;

//     const base = startDate ?? new Date();
//     const merged = new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate(),
//       base.getHours(),
//       base.getMinutes()
//     );

//     setStartDate(merged);
//     setShowStartTime(true);
//   };

//   const confirmStartTime = ({ hours, minutes }) => {
//     setShowStartTime(false);
//     if (!startDate) return;

//     const updated = new Date(startDate);
//     updated.setHours(hours);
//     updated.setMinutes(minutes);

//     setStartDate(updated);
//     setAuction((prev) => ({
//       ...prev,
//       fecha: formatLocalDateTime(updated),
//     }));
//   };

//   const confirmEndDate = (date) => {
//     setShowEndDate(false);
//     if (!date) return;

//     const base = endDate ?? new Date();
//     const merged = new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate(),
//       base.getHours(),
//       base.getMinutes()
//     );

//     setEndDate(merged);
//     setShowEndTime(true);
//   };

//   const confirmEndTime = ({ hours, minutes }) => {
//     setShowEndTime(false);
//     if (!endDate) return;

//     const updated = new Date(endDate);
//     updated.setHours(hours);
//     updated.setMinutes(minutes);

//     setEndDate(updated);
//     setAuction((prev) => ({
//       ...prev,
//       fechaFin: formatLocalDateTime(updated),
//     }));
//   };

//   /* =======================
//      Render
//   ======================= */
//   return (
//     <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
//       <Text style={styles.title}>
//         {auction?.id ? 'Editar Remate' : 'Crear Remate'}
//       </Text>

//       <TextInput
//         label="Nombre del remate"
//         value={auction?.nombre || ''}
//         onChangeText={(t) => setAuction((p) => ({ ...p, nombre: t }))}
//         style={styles.input}
//       />

//       {/* FECHA INICIO */}
//       <Text style={styles.label}>Fecha inicio</Text>
//       <Button mode="outlined" onPress={() => setShowStartDate(true)}>
//         {startDate ? startDate.toLocaleString() : 'Seleccionar fecha y hora'}
//       </Button>

//       <DatePickerModal
//         locale="es"
//         mode="single"
//         visible={showStartDate}
//         date={startDate}
//         onDismiss={() => setShowStartDate(false)}
//         onConfirm={({ date }) => confirmStartDate(date)}
//       />

//       <TimePickerModal
//         locale="es"
//         visible={showStartTime}
//         onDismiss={() => setShowStartTime(false)}
//         onConfirm={confirmStartTime}
//         hours={startDate?.getHours() ?? 0}
//         minutes={startDate?.getMinutes() ?? 0}
//       />

//       {/* FECHA FIN */}
//       <Text style={styles.label}>Fecha fin</Text>
//       <Button mode="outlined" onPress={() => setShowEndDate(true)}>
//         {endDate ? endDate.toLocaleString() : 'Seleccionar fecha y hora'}
//       </Button>

//       <DatePickerModal
//         locale="es"
//         mode="single"
//         visible={showEndDate}
//         date={endDate}
//         onDismiss={() => setShowEndDate(false)}
//         onConfirm={({ date }) => confirmEndDate(date)}
//       />

//       <TimePickerModal
//         locale="es"
//         visible={showEndTime}
//         onDismiss={() => setShowEndTime(false)}
//         onConfirm={confirmEndTime}
//         hours={endDate?.getHours() ?? 0}
//         minutes={endDate?.getMinutes() ?? 0}
//       />

//       <TextInput
//         label="URL lista de lotes"
//         value={auction?.urlListaLotes || ''}
//         onChangeText={(t) => setAuction((p) => ({ ...p, urlListaLotes: t }))}
//         style={styles.input}
//       />

//       <TextInput
//         label="Estado"
//         value={auction?.estado || ''}
//         onChangeText={(t) => setAuction((p) => ({ ...p, estado: t }))}
//         style={styles.input}
//       />

//       <List.Accordion
//         title={auction?.cabana?.nombre || 'Seleccionar Cabaña'}
//         style={styles.accordion}
//       >
//         <RadioButton.Group
//           value={auction?.cabana?.id}
//           onValueChange={(value) => {
//             const c = cabanas.find((x) => x.id === value);
//             setAuction((p) => ({
//               ...p,
//               cabana: c ? { id: c.id, nombre: c.nombre } : { id: value },
//             }));
//           }}
//         >
//           {cabanas?.map((c) => (
//             <List.Item
//               key={c.id}
//               title={c.nombre}
//               right={() => <RadioButton value={c.id} />}
//             />
//           ))}
//         </RadioButton.Group>
//       </List.Accordion>

//       <Button
//         mode="contained"
//         style={{ marginTop: 20 }}
//         onPress={() => onSave(auction)}
//         disabled={
//           !auction.nombre ||
//           !auction.fecha ||
//           !auction.fechaFin ||
//           !auction.cabana?.id
//         }
//       >
//         Guardar
//       </Button>
//     </Modal>
//   );
// }

// /* =======================
//    Styles
// ======================= */
// const styles = StyleSheet.create({
//   modal: {
//     backgroundColor: '#fff',
//     margin: 20,
//     padding: 20,
//     borderRadius: 8,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//   },
//   label: {
//     marginTop: 12,
//     marginBottom: 5,
//   },
//   input: {
//     marginBottom: 10,
//     backgroundColor: '#fff',
//   },
//   accordion: {
//     backgroundColor: '#fff',
//     marginTop: 10,
//     borderRadius: 6,
//   },
// });


import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  Modal,
  Text,
  TextInput,
  Button,
  RadioButton,
  List,
  Switch,
} from 'react-native-paper';

import {
  DatePickerModal,
  TimePickerModal,
  registerTranslation,
} from 'react-native-paper-dates';
import {
  formatLocalDateTime,
  parseLocalDate,
} from '../utils/businessDateTime';

import * as ImagePicker from 'expo-image-picker';

/* =======================
   Traducciones Español
======================= */

registerTranslation('es', {
  save: 'Guardar',
  selectSingle: 'Seleccionar fecha',
  selectMultiple: 'Seleccionar fechas',
  selectRange: 'Seleccionar rango',
  notAccordingToDateFormat: (inputFormat) =>
    `No coincide con el formato ${inputFormat}`,
  mustBeHigherThan: (date) => `Debe ser posterior a ${date}`,
  mustBeLowerThan: (date) => `Debe ser anterior a ${date}`,
  dateIsDisabled: 'Fecha deshabilitada',
  previous: 'Anterior',
  next: 'Siguiente',
  typeInDate: 'Ingresar fecha',
  close: 'Cerrar',
});

/* =======================
   Fecha local = reloj de pared America/La_Paz (utils/businessDateTime).
======================= */

const defaultTramosUI = () => [
  { hasta: '500', pasosText: '20,30', sinLimite: false },
  { hasta: '', pasosText: '50', sinLimite: true },
];

const reglaToUI = (regla) => {
  if (!regla?.tramos?.length) return defaultTramosUI();
  return regla.tramos.map((t) => ({
    hasta: t.hasta == null ? '' : String(t.hasta),
    pasosText: Array.isArray(t.pasos) ? t.pasos.join(',') : '',
    sinLimite: t.hasta == null,
  }));
};

const uiToRegla = (tramosUI) => ({
  version: 1,
  tramos: tramosUI.map((t) => ({
    hasta: t.sinLimite ? null : Number(String(t.hasta).trim()),
    pasos: String(t.pasosText || '')
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s)),
  })),
});

/* =======================
   Componente
======================= */

export default function AuctionModal({
  visible,
  onDismiss,
  onSave,
  editingAuction,
  cabanas,
  saving = false,
}) {
  const [auction, setAuction] = useState({});

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);

  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  /* =======================
     Banner
  ======================= */

  const [banner, setBanner] = useState(null);

  const [bannerUrl, setBannerUrl] = useState('');

  const [bannerDeleted, setBannerDeleted] = useState(false);

  /* =======================
     Regla de incrementos
  ======================= */

  const [useCustomRegla, setUseCustomRegla] = useState(false);
  const [tramosUI, setTramosUI] = useState(defaultTramosUI);

  /* =======================
     Cargar datos
  ======================= */

  useEffect(() => {
    if (editingAuction) {
      setAuction(editingAuction);

      setStartDate(parseLocalDate(editingAuction.fecha));
      setEndDate(parseLocalDate(editingAuction.fechaFin));

      setBannerUrl(editingAuction.bannerUrl || '');
      setBanner(null);
      setBannerDeleted(false);

      const hasRegla = !!editingAuction.reglaIncremento?.tramos?.length;
      setUseCustomRegla(hasRegla);
      setTramosUI(reglaToUI(editingAuction.reglaIncremento));
    } else {
      setAuction({});

      setStartDate(undefined);
      setEndDate(undefined);

      setBanner(null);
      setBannerUrl('');
      setBannerDeleted(false);

      setUseCustomRegla(false);
      setTramosUI(defaultTramosUI());
    }
  }, [editingAuction, visible]);

  /* =======================
     Seleccionar Banner
  ======================= */

  const seleccionarBanner = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos permiso para acceder a tus imágenes.'
        );

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 2], // 1536×1024
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      setBanner({
        uri: asset.uri,
        name: asset.fileName || `banner-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });

      setBannerDeleted(false);

    } catch (error) {
      console.error('Error seleccionando banner:', error);

      Alert.alert(
        'Error',
        'No se pudo seleccionar la imagen.'
      );
    }
  };

  /* =======================
     Eliminar Banner
  ======================= */

  const eliminarBanner = () => {
    Alert.alert(
      'Eliminar banner',
      '¿Seguro que quieres eliminar el banner?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setBanner(null);
            setBannerUrl('');
            setBannerDeleted(true);
          },
        },
      ]
    );
  };

  /* =======================
     Confirmaciones Fecha
  ======================= */

  const confirmStartDate = (date) => {
    setShowStartDate(false);

    if (!date) return;

    const base = startDate ?? new Date();

    const merged = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      base.getHours(),
      base.getMinutes()
    );

    setStartDate(merged);
    setShowStartTime(true);
  };

  const confirmStartTime = ({ hours, minutes }) => {
    setShowStartTime(false);

    if (!startDate) return;

    const updated = new Date(startDate);

    updated.setHours(hours);
    updated.setMinutes(minutes);

    setStartDate(updated);

    setAuction((prev) => ({
      ...prev,
      fecha: formatLocalDateTime(updated),
    }));
  };

  const confirmEndDate = (date) => {
    setShowEndDate(false);

    if (!date) return;

    const base = endDate ?? new Date();

    const merged = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      base.getHours(),
      base.getMinutes()
    );

    setEndDate(merged);
    setShowEndTime(true);
  };

  const confirmEndTime = ({ hours, minutes }) => {
    setShowEndTime(false);

    if (!endDate) return;

    const updated = new Date(endDate);

    updated.setHours(hours);
    updated.setMinutes(minutes);

    setEndDate(updated);

    setAuction((prev) => ({
      ...prev,
      fechaFin: formatLocalDateTime(updated),
    }));
  };

  /* =======================
     Guardar
  ======================= */

  const updateTramo = (index, patch) => {
    setTramosUI((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );
  };

  const addTramo = () => {
    setTramosUI((prev) => [
      ...prev.filter((t) => !t.sinLimite),
      { hasta: '', pasosText: '50', sinLimite: false },
      { hasta: '', pasosText: '50', sinLimite: true },
    ]);
  };

  const removeTramo = (index) => {
    setTramosUI((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      if (!next.some((t) => t.sinLimite)) {
        next.push({ hasta: '', pasosText: '50', sinLimite: true });
      }
      return next;
    });
  };

  const guardar = () => {
    let reglaIncremento = null;
    if (useCustomRegla) {
      const regla = uiToRegla(tramosUI);
      for (let i = 0; i < regla.tramos.length; i++) {
        const t = regla.tramos[i];
        if (!t.pasos.length || t.pasos.some((p) => !Number.isFinite(p) || p <= 0)) {
          Alert.alert('Incrementos', `El tramo #${i + 1} tiene pasos inválidos.`);
          return;
        }
        if (!tramosUI[i].sinLimite && (!Number.isFinite(t.hasta) || t.hasta <= 0)) {
          Alert.alert('Incrementos', `El tramo #${i + 1} necesita un "hasta" válido.`);
          return;
        }
      }
      reglaIncremento = regla;
    }

    onSave({
      ...auction,
      reglaIncremento,

      /*
       * Información del banner para
       * que el componente padre lo procese.
       */
      bannerFile: banner,

      bannerDeleted,
    });
  };

  /* =======================
     Render
  ======================= */

  return (
    <Modal
      visible={visible}
      onDismiss={saving ? undefined : onDismiss}
      dismissable={!saving}
      contentContainerStyle={styles.modalWrapper}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modal}
      >
        <Text style={styles.title}>
          {auction?.id ? 'Editar Prelance' : 'Crear Prelance'}
        </Text>

        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScroll}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator
          bounces={false}
        >
          {/* =======================
              NOMBRE
          ======================= */}

          <TextInput
            label="Nombre del prelance"
            value={auction?.nombre || ''}
            onChangeText={(t) =>
              setAuction((p) => ({
                ...p,
                nombre: t,
              }))
            }
            style={styles.input}
          />

          {/* =======================
              FECHA INICIO
          ======================= */}

          <Text style={styles.label}>
            Fecha inicio
          </Text>

          <Button
            mode="outlined"
            onPress={() => setShowStartDate(true)}
          >
            {startDate
              ? startDate.toLocaleString()
              : 'Seleccionar fecha y hora'}
          </Button>

          <DatePickerModal
            locale="es"
            mode="single"
            visible={showStartDate}
            date={startDate}
            onDismiss={() => setShowStartDate(false)}
            onConfirm={({ date }) =>
              confirmStartDate(date)
            }
          />

          <TimePickerModal
            locale="es"
            visible={showStartTime}
            onDismiss={() =>
              setShowStartTime(false)
            }
            onConfirm={confirmStartTime}
            hours={startDate?.getHours() ?? 0}
            minutes={startDate?.getMinutes() ?? 0}
          />

          {/* =======================
              FECHA FIN
          ======================= */}

          <Text style={styles.label}>
            Fecha fin
          </Text>

          <Button
            mode="outlined"
            onPress={() => setShowEndDate(true)}
          >
            {endDate
              ? endDate.toLocaleString()
              : 'Seleccionar fecha y hora'}
          </Button>

          <DatePickerModal
            locale="es"
            mode="single"
            visible={showEndDate}
            date={endDate}
            onDismiss={() => setShowEndDate(false)}
            onConfirm={({ date }) =>
              confirmEndDate(date)
            }
          />

          <TimePickerModal
            locale="es"
            visible={showEndTime}
            onDismiss={() =>
              setShowEndTime(false)
            }
            onConfirm={confirmEndTime}
            hours={endDate?.getHours() ?? 0}
            minutes={endDate?.getMinutes() ?? 0}
          />

          {/* =======================
              URL LOTES
          ======================= */}

          <TextInput
            label="URL lista de lotes"
            value={auction?.urlListaLotes || ''}
            onChangeText={(t) =>
              setAuction((p) => ({
                ...p,
                urlListaLotes: t,
              }))
            }
            style={styles.input}
          />

          {/* =======================
              ESTADO
          ======================= */}

          <TextInput
            label="Estado"
            value={auction?.estado || ''}
            onChangeText={(t) =>
              setAuction((p) => ({
                ...p,
                estado: t,
              }))
            }
            style={styles.input}
          />

          {/* =======================
              CABAÑA
          ======================= */}

          <Text style={styles.sectionLabel}>Cabaña</Text>
          <RadioButton.Group
            value={auction?.cabana?.id}
            onValueChange={(value) => {
              const c = cabanas.find(
                (x) => x.id === value
              );

              setAuction((p) => ({
                ...p,
                cabana: c
                  ? {
                      id: c.id,
                      nombre: c.nombre,
                    }
                  : {
                      id: value,
                    },
              }));
            }}
          >
            {cabanas?.map((c) => (
              <List.Item
                key={c.id}
                title={c.nombre}
                onPress={() => {
                  setAuction((p) => ({
                    ...p,
                    cabana: {
                      id: c.id,
                      nombre: c.nombre,
                    },
                  }));
                }}
                right={() => (
                  <RadioButton value={c.id} />
                )}
                style={styles.selectItem}
              />
            ))}
          </RadioButton.Group>

          {/* =======================
              BANNER
          ======================= */}

          <Text style={styles.label}>
            Banner del prelance
          </Text>

          {/* Vista previa */}

          {(banner || (bannerUrl && !bannerDeleted)) && (
            <View style={styles.bannerContainer}>
              <Image
                source={{
                  uri: banner
                    ? banner.uri
                    : bannerUrl,
                }}
                style={styles.banner}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Seleccionar / Cambiar */}

          <Button
            mode="outlined"
            icon="image"
            onPress={seleccionarBanner}
            style={styles.bannerButton}
          >
            {banner || bannerUrl
              ? 'Cambiar banner'
              : 'Seleccionar banner'}
          </Button>

          {/* Eliminar */}

          {(banner || (bannerUrl && !bannerDeleted)) && (
            <Button
              mode="text"
              icon="delete"
              textColor="#d32f2f"
              onPress={eliminarBanner}
            >
              Eliminar banner
            </Button>
          )}

          {/* =======================
              INCREMENTOS DE PUJA
          ======================= */}

          <Text style={styles.sectionLabel}>Incrementos de puja</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Usar regla personalizada</Text>
            <Switch
              value={useCustomRegla}
              onValueChange={setUseCustomRegla}
            />
          </View>
          <Text style={styles.hintText}>
            Si está apagado, se usa la regla por defecto del sistema (20/30, 50, 100, 500).
            Con regla activa: cada tramo aplica mientras el monto sea menor a “Hasta”.
            Pasos: lista separada por comas (ej. 20,30). Un solo número = fijo.
          </Text>

          {useCustomRegla &&
            tramosUI.map((tramo, index) => (
              <View key={`tramo-${index}`} style={styles.tramoCard}>
                <Text style={styles.tramoTitle}>Tramo {index + 1}</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Sin límite (último tramo)</Text>
                  <Switch
                    value={!!tramo.sinLimite}
                    onValueChange={(v) => {
                      setTramosUI((prev) =>
                        prev.map((t, i) => {
                          if (i === index) {
                            return { ...t, sinLimite: v, hasta: v ? '' : t.hasta || '1000' };
                          }
                          if (v) return { ...t, sinLimite: false };
                          return t;
                        })
                      );
                    }}
                  />
                </View>
                {!tramo.sinLimite && (
                  <TextInput
                    label="Hasta monto (exclusivo)"
                    value={tramo.hasta}
                    keyboardType="numeric"
                    onChangeText={(text) => updateTramo(index, { hasta: text })}
                    style={styles.input}
                  />
                )}
                <TextInput
                  label="Pasos (ej. 20,30 o 50)"
                  value={tramo.pasosText}
                  onChangeText={(text) => updateTramo(index, { pasosText: text })}
                  style={styles.input}
                />
                <Button
                  mode="text"
                  textColor="#d32f2f"
                  onPress={() => removeTramo(index)}
                  disabled={tramosUI.length <= 1}
                >
                  Quitar tramo
                </Button>
              </View>
            ))}

          {useCustomRegla && (
            <Button mode="outlined" icon="plus" onPress={addTramo} style={styles.bannerButton}>
              Agregar tramo
            </Button>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            mode="contained"
            onPress={guardar}
            loading={saving}
            disabled={
              saving ||
              !auction?.nombre ||
              !auction?.fecha ||
              !auction?.fechaFin ||
              !auction?.cabana?.id
            }
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* =======================
   Styles
======================= */

const styles = StyleSheet.create({
  modalWrapper: {
    marginHorizontal: 16,
    alignSelf: 'center',
    width: '92%',
    maxHeight: Dimensions.get('window').height * 0.9,
  },

  modal: {
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },

  modalScrollView: {
    flexGrow: 0,
    maxHeight: Dimensions.get('window').height * 0.62,
  },

  modalScroll: {
    paddingBottom: 16,
  },

  modalFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E7E5',
    paddingTop: 12,
    paddingBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  label: {
    marginTop: 12,
    marginBottom: 5,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  switchLabel: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
  },

  hintText: {
    fontSize: 12,
    color: '#667070',
    marginBottom: 10,
    lineHeight: 16,
  },

  tramoCard: {
    borderWidth: 1,
    borderColor: '#E3E7E5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FAFBFA',
  },

  tramoTitle: {
    fontWeight: '600',
    marginBottom: 6,
  },

  selectItem: {
    paddingVertical: 0,
    marginBottom: 2,
  },

  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  bannerContainer: {
    width: '100%',
    aspectRatio: 3 / 2, // 1536×1024
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },

  banner: {
    width: '100%',
    height: '100%',
  },

  bannerButton: {
    marginTop: 5,
  },
});