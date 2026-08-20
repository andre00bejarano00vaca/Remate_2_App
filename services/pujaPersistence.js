import AsyncStorage from "@react-native-async-storage/async-storage";

const pujaKey = (userId, loteId) => `myPuja:${userId}:${loteId}`;
const watchedKey = (userId) => `myPujas:watched:${userId}`;

let currentViewedLoteId = null;

export function setCurrentViewedLote(loteId) {
  currentViewedLoteId = loteId == null ? null : String(loteId);
}

export function getCurrentViewedLote() {
  return currentViewedLoteId;
}

async function readJson(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeWatched(userId, lots) {
  await AsyncStorage.setItem(watchedKey(userId), JSON.stringify(lots));
}

export async function getMyPuja(userId, loteId) {
  if (userId == null || loteId == null) return null;
  return readJson(pujaKey(userId, loteId));
}

export async function getWatchedPujas(userId) {
  if (userId == null) return [];
  const lots = await readJson(watchedKey(userId));
  return Array.isArray(lots) ? lots : [];
}

export async function saveMyPuja({
  userId,
  loteId,
  remateId,
  monto,
  numeroLote,
}) {
  if (userId == null || loteId == null) return null;

  const data = {
    userId: Number(userId),
    loteId: Number(loteId),
    remateId: remateId == null ? null : Number(remateId),
    monto: Number(monto) || 0,
    numeroLote: numeroLote ?? null,
    status: "winning",
    notifiedOutbid: false,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(pujaKey(userId, loteId), JSON.stringify(data));

  const watched = await getWatchedPujas(userId);
  const next = [
    data,
    ...watched.filter((item) => Number(item.loteId) !== Number(loteId)),
  ];
  await writeWatched(userId, next);

  console.log("[PUJA] persistida", {
    loteId: data.loteId,
    monto: data.monto,
  });
  return data;
}

export async function markPujaOutbid({ userId, loteId, currentMonto }) {
  const existing = await getMyPuja(userId, loteId);
  if (!existing) return null;

  const updated = {
    ...existing,
    status: "outbid",
    currentMonto: Number(currentMonto) || existing.currentMonto || null,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(pujaKey(userId, loteId), JSON.stringify(updated));

  const watched = await getWatchedPujas(userId);
  await writeWatched(
    userId,
    watched.map((item) =>
      Number(item.loteId) === Number(loteId) ? updated : item
    )
  );

  return updated;
}

export async function markNotifiedOutbid(userId, loteId) {
  const existing = await getMyPuja(userId, loteId);
  if (!existing) return null;

  const updated = {
    ...existing,
    notifiedOutbid: true,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(pujaKey(userId, loteId), JSON.stringify(updated));

  const watched = await getWatchedPujas(userId);
  await writeWatched(
    userId,
    watched.map((item) =>
      Number(item.loteId) === Number(loteId) ? updated : item
    )
  );

  return updated;
}

export function extractUserBidFromPujas(pujas, { userId, loteId }) {
  if (!Array.isArray(pujas)) return null;

  const mine = pujas.filter((puja) => {
    const pujaUserId = Number(
      puja?.usuario?.id ?? puja?.usuarioId ?? puja?.usuario
    );
    const pujaLoteId = Number(puja?.lote?.id ?? puja?.loteId ?? puja?.lote);
    return pujaUserId === Number(userId) && pujaLoteId === Number(loteId);
  });

  if (!mine.length) return null;

  return Math.max(...mine.map((puja) => Number(puja.monto) || 0));
}
