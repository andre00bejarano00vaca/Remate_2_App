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
} from 'react-native';

import {
  Modal,
  Text,
  TextInput,
  Button,
  RadioButton,
  List,
} from 'react-native-paper';

import {
  DatePickerModal,
  TimePickerModal,
  registerTranslation,
} from 'react-native-paper-dates';

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
   Helpers Fecha Local
======================= */

const parseLocalDate = (iso) => {
  if (!iso) return undefined;

  const [d, t] = iso.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, min] = (t || '00:00').split(':').map(Number);

  return new Date(y, m - 1, day, h, min);
};

const formatLocalDateTime = (date) => {
  if (!date) return null;

  const pad = (n) => n.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
};

/* =======================
   Componente
======================= */

export default function AuctionModal({
  visible,
  onDismiss,
  onSave,
  editingAuction,
  cabanas,
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
    } else {
      setAuction({});

      setStartDate(undefined);
      setEndDate(undefined);

      setBanner(null);
      setBannerUrl('');
      setBannerDeleted(false);
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
        aspect: [16, 9],
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

  const guardar = () => {
    onSave({
      ...auction,

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
      onDismiss={onDismiss}
      contentContainerStyle={styles.modal}
    >
      <Text style={styles.title}>
        {auction?.id ? 'Editar Remate' : 'Crear Remate'}
      </Text>

      {/* =======================
          NOMBRE
      ======================= */}

      <TextInput
        label="Nombre del remate"
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

      <List.Accordion
        title={
          auction?.cabana?.nombre ||
          'Seleccionar Cabaña'
        }
        style={styles.accordion}
      >
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
              right={() => (
                <RadioButton value={c.id} />
              )}
            />
          ))}
        </RadioButton.Group>
      </List.Accordion>

      {/* =======================
          BANNER
      ======================= */}

      <Text style={styles.label}>
        Banner del remate
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
          GUARDAR
      ======================= */}

      <Button
        mode="contained"
        style={{ marginTop: 20 }}
        onPress={guardar}
        disabled={
          !auction.nombre ||
          !auction.fecha ||
          !auction.fechaFin ||
          !auction.cabana?.id
        }
      >
        Guardar
      </Button>
    </Modal>
  );
}

/* =======================
   Styles
======================= */

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  label: {
    marginTop: 12,
    marginBottom: 5,
  },

  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  accordion: {
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 6,
  },

  bannerContainer: {
    width: '100%',
    height: 180,
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