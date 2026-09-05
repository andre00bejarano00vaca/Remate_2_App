import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Acepta formato legado ("1100") y nuevo ({"valor":1100,"usuarioIdLider":5}).
 */
export function parseContadorMessage(raw) {
    if (raw == null) return null;
    const text = String(raw).trim();
    if (!text) return null;

    if (/^-?\d+$/.test(text)) {
        return { valor: parseInt(text, 10), usuarioIdLider: null, hasLiderField: false };
    }

    try {
        const data = JSON.parse(text);
        if (!data || typeof data !== 'object') return null;

        if (data.estado === 'finalizado') {
            return { finalizado: true };
        }

        const valorRaw = data.valor != null ? data.valor : data;
        const valor = Number(valorRaw);
        if (Number.isNaN(valor)) return null;

        let usuarioIdLider = null;
        if (data.usuarioIdLider != null && data.usuarioIdLider !== '') {
            const parsed = Number(data.usuarioIdLider);
            if (!Number.isNaN(parsed)) usuarioIdLider = parsed;
        }

        return {
            valor,
            usuarioIdLider,
            hasLiderField: Object.prototype.hasOwnProperty.call(data, 'usuarioIdLider'),
        };
    } catch {
        return null;
    }
}

export function parseContadorResponse(data) {
    if (data == null) return null;

    if (typeof data === 'number' || (typeof data === 'string' && /^-?\d+$/.test(String(data).trim()))) {
        const valor = Number(data);
        return Number.isNaN(valor)
            ? null
            : { valor, usuarioIdLider: null, hasLiderField: false };
    }

    if (typeof data === 'object') {
        const valor = Number(data.valor);
        if (Number.isNaN(valor)) return null;
        let usuarioIdLider = null;
        if (data.usuarioIdLider != null && data.usuarioIdLider !== '') {
            const parsed = Number(data.usuarioIdLider);
            if (!Number.isNaN(parsed)) usuarioIdLider = parsed;
        }
        return {
            valor,
            usuarioIdLider,
            hasLiderField: Object.prototype.hasOwnProperty.call(data, 'usuarioIdLider'),
        };
    }

    return null;
}

export default function usePujaWebSocket({
    loteid,
    remateid,
    wsBaseUrl,
    apiBaseUrl,

    setCounter,
    setIsWinning,
    setStatusMessage,
    setShowStatus,
    setLeaderUserId,

    pendingUserBidRef,
    lastUserBidValueRef,
    userIdRef,
    isWinning,
    onOutbid,
}) {
    const ws = useRef(null);
    const reconnectTimeout = useRef(null);
    const reconnectAttempts = useRef(0);
    const appState = useRef(AppState.currentState);
    const shouldReconnect = useRef(true);

    const isWinningRef = useRef(isWinning);
    isWinningRef.current = isWinning;
    const onOutbidRef = useRef(onOutbid);
    onOutbidRef.current = onOutbid;

    const applyEstado = (estado) => {
        if (!estado || estado.finalizado) return;

        const { valor, usuarioIdLider, hasLiderField } = estado;
        setCounter(valor);

        if (typeof setLeaderUserId === 'function' && hasLiderField) {
            setLeaderUserId(usuarioIdLider);
        }

        const myId = userIdRef?.current != null ? Number(userIdRef.current) : null;

        // Camino ideal: el servidor dice quién lidera
        if (hasLiderField && usuarioIdLider != null && myId != null) {
            const winning = Number(usuarioIdLider) === myId;
            if (winning) {
                pendingUserBidRef.current = false;
                setIsWinning(true);
                setStatusMessage('¡Vas ganando el lote!');
                setShowStatus(true);
                console.log('[PUJA WS] lider=yo', { valor, usuarioIdLider });
            } else {
                const hadBid = lastUserBidValueRef.current != null;
                const wasWinning = isWinningRef.current;
                setIsWinning(false);
                if (hadBid || wasWinning) {
                    setStatusMessage('Te superaron, pujá de nuevo');
                    setShowStatus(true);
                    if (hadBid && valor > Number(lastUserBidValueRef.current)) {
                        onOutbidRef.current?.(valor);
                    }
                    console.log('[PUJA WS] lider=otro', { valor, usuarioIdLider, myId });
                }
            }
            return;
        }

        // Fallback legado (solo número): comparar contra tu última puja
        if (
            pendingUserBidRef.current &&
            lastUserBidValueRef.current !== null
        ) {
            if (valor >= lastUserBidValueRef.current) {
                pendingUserBidRef.current = false;
                setIsWinning(true);
                setStatusMessage('¡Vas ganando el lote!');
                setShowStatus(true);
                if (typeof setLeaderUserId === 'function' && myId != null) {
                    setLeaderUserId(myId);
                }
                console.log('[PUJA WS] confirmado ganando (legado)', valor);
            }
            return;
        }

        if (
            lastUserBidValueRef.current !== null &&
            valor > Number(lastUserBidValueRef.current)
        ) {
            setIsWinning(false);
            setStatusMessage('Te superaron, pujá de nuevo');
            setShowStatus(true);
            console.log('[PUJA WS] superado (legado)', valor);
            onOutbidRef.current?.(valor);
        }
    };

    useEffect(() => {
        if (!loteid || !remateid) {
            return;
        }

        const remateId = remateid;
        const wsUrl = `${wsBaseUrl}/ws/puja/${remateId}/${loteid}`;

        const obtenerContador = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/contador/${remateId}/${loteid}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                const estado = parseContadorResponse(data);
                if (estado) {
                    applyEstado(estado);
                }
            } catch (error) {
                console.error('[PUJA WS] error fetch contador:', error);
            }
        };

        const cerrarWebSocket = () => {
            if (ws.current) {
                ws.current.onopen = null;
                ws.current.onmessage = null;
                ws.current.onerror = null;
                ws.current.onclose = null;
                ws.current.close();
                ws.current = null;
            }
        };

        const conectarWebSocket = () => {
            if (appState.current !== 'active') {
                return;
            }

            if (
                ws.current &&
                (ws.current.readyState === WebSocket.OPEN ||
                    ws.current.readyState === WebSocket.CONNECTING)
            ) {
                return;
            }

            const socket = new WebSocket(wsUrl);
            ws.current = socket;

            socket.onopen = () => {
                reconnectAttempts.current = 0;
                obtenerContador();
            };

            socket.onmessage = (event) => {
                const estado = parseContadorMessage(event.data);
                if (!estado) {
                    console.log('[PUJA WS] mensaje ignorado:', event.data);
                    return;
                }
                if (estado.finalizado) {
                    console.log('[PUJA WS] lote/remate finalizado');
                    return;
                }

                console.log('[PUJA WS] mensaje', {
                    valor: estado.valor,
                    lider: estado.usuarioIdLider,
                    pending: pendingUserBidRef.current,
                    lastBid: lastUserBidValueRef.current,
                    winning: isWinningRef.current,
                    myId: userIdRef?.current,
                });

                applyEstado(estado);
            };

            socket.onerror = (error) => {
                console.error('[PUJA WS] error:', error.message || error);
            };

            socket.onclose = (event) => {
                console.log('[PUJA WS] cerrado', event.code, event.reason);
                ws.current = null;

                if (shouldReconnect.current && appState.current === 'active') {
                    reconnectAttempts.current++;
                    const delay = Math.min(reconnectAttempts.current * 2000, 10000);
                    console.log(`[PUJA WS] reintento en ${delay / 1000}s`);
                    clearTimeout(reconnectTimeout.current);
                    reconnectTimeout.current = setTimeout(() => {
                        conectarWebSocket();
                    }, delay);
                }
            };
        };

        const handleAppStateChange = (nextState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextState === 'active'
            ) {
                clearTimeout(reconnectTimeout.current);
                obtenerContador();
                conectarWebSocket();
            }
            appState.current = nextState;
        };

        const subscription = AppState.addEventListener(
            'change',
            handleAppStateChange
        );

        shouldReconnect.current = true;
        obtenerContador();
        conectarWebSocket();

        return () => {
            shouldReconnect.current = false;
            clearTimeout(reconnectTimeout.current);
            subscription.remove();
            cerrarWebSocket();
        };
    }, [loteid, remateid, wsBaseUrl, apiBaseUrl]);
}
