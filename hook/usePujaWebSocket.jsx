import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export default function usePujaWebSocket({
    loteid,
    remateid,
    wsBaseUrl,
    apiBaseUrl,

    setCounter,
    setIsWinning,
    setStatusMessage,
    setShowStatus,

    pendingUserBidRef,
    lastUserBidValueRef,
    isWinning,
    onOutbid,
}) {

    const ws = useRef(null);

    const reconnectTimeout = useRef(null);

    const reconnectAttempts = useRef(0);

    const appState = useRef(
        AppState.currentState
    );

    const shouldReconnect = useRef(true);

    // Evita closure obsoleto sin reconectar el WS al cambiar isWinning
    const isWinningRef = useRef(isWinning);
    isWinningRef.current = isWinning;
    const onOutbidRef = useRef(onOutbid);
    onOutbidRef.current = onOutbid;


    useEffect(() => {

        if (!loteid || !remateid) {
            return;
        }


        const remateId = remateid;

        const wsUrl =
            `${wsBaseUrl}/ws/puja/${remateId}/${loteid}`;


        /*
         * ==========================================
         * OBTENER CONTADOR
         * ==========================================
         */

        const obtenerContador = async () => {

            try {

                const response = await fetch(
                    `${apiBaseUrl}/contador/${remateId}/${loteid}`
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}`
                    );
                }

                const data =
                    await response.json();

                const valor = Number(data);
                if (!Number.isNaN(valor)) {
                    setCounter(valor);
                }

            } catch (error) {
                console.error('[PUJA WS] error fetch contador:', error);
            }
        };


        /*
         * ==========================================
         * CERRAR SOCKET
         * ==========================================
         */

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


        /*
         * ==========================================
         * CONECTAR
         * ==========================================
         */

        const conectarWebSocket = () => {

            if (
                appState.current !==
                'active'
            ) {
                return;
            }


            /*
             * Evitar conexiones duplicadas
             */

            if (
                ws.current &&
                (
                    ws.current.readyState ===
                    WebSocket.OPEN ||

                    ws.current.readyState ===
                    WebSocket.CONNECTING
                )
            ) {

                return;
            }


            const socket =
                new WebSocket(wsUrl);

            ws.current = socket;


            /*
             * ======================================
             * OPEN
             * ======================================
             */

            socket.onopen = () => {
                reconnectAttempts.current = 0;

                /*
                 * Actualizar contador al reconectar
                 */

                obtenerContador();
            };


            /*
             * ======================================
             * MESSAGE
             * ======================================
             */

            socket.onmessage = (event) => {
                const valor = parseInt(event.data, 10);

                if (isNaN(valor)) {
                    console.log('[PUJA WS] mensaje ignorado (no numérico):', event.data);
                    return;
                }

                console.log('[PUJA WS] mensaje', {
                    valor,
                    pending: pendingUserBidRef.current,
                    lastBid: lastUserBidValueRef.current,
                    winning: isWinningRef.current,
                });

                setCounter(valor);

                if (
                    pendingUserBidRef.current &&
                    lastUserBidValueRef.current !== null
                ) {

                    if (
                        valor >=
                        lastUserBidValueRef.current
                    ) {
                        pendingUserBidRef.current = false;
                        setIsWinning(true);
                        setStatusMessage('¡Vas ganando el lote!');
                        setShowStatus(true);
                        console.log('[PUJA WS] confirmado ganando', valor);
                    }

                } else if (
                    isWinningRef.current &&
                    lastUserBidValueRef.current !== null &&
                    valor >
                    lastUserBidValueRef.current
                ) {
                    setIsWinning(false);
                    setStatusMessage('Te superaron, pujá de nuevo');
                    setShowStatus(true);
                    console.log('[PUJA WS] superado', valor);
                    onOutbidRef.current?.(valor);
                }
            };


            /*
             * ======================================
             * ERROR
             * ======================================
             */

            socket.onerror = (error) => {
                console.error('[PUJA WS] error:', error.message || error);
            };


            /*
             * ======================================
             * CLOSE
             * ======================================
             */

            socket.onclose = (
                event
            ) => {

                console.log('[PUJA WS] cerrado', event.code, event.reason);
                ws.current = null;


                if (
                    shouldReconnect.current &&
                    appState.current ===
                    'active'
                ) {

                    reconnectAttempts.current++;


                    /*
                     * 2s
                     * 4s
                     * 6s
                     * ...
                     * máximo 10s
                     */

                    const delay =
                        Math.min(
                            reconnectAttempts.current *
                            2000,
                            10000
                        );


                    console.log(`[PUJA WS] reintento en ${delay / 1000}s`);
                    clearTimeout(
                        reconnectTimeout.current
                    );


                    reconnectTimeout.current =
                        setTimeout(
                            () => {
                                conectarWebSocket();
                            },
                            delay
                        );
                }
            };
        };


        /*
         * ==========================================
         * APPSTATE
         * ==========================================
         */

        const handleAppStateChange =
            (nextState) => {

                if (
                    appState.current.match(
                        /inactive|background/
                    ) &&
                    nextState === 'active'
                ) {
                    clearTimeout(
                        reconnectTimeout.current
                    );
                    obtenerContador();
                    conectarWebSocket();
                }


                appState.current =
                    nextState;
            };


        const subscription =
            AppState.addEventListener(
                'change',
                handleAppStateChange
            );


        /*
         * ==========================================
         * INICIO
         * ==========================================
         */

        shouldReconnect.current = true;

        obtenerContador();

        conectarWebSocket();


        /*
         * ==========================================
         * CLEANUP
         * ==========================================
         */

        return () => {
            shouldReconnect.current =
                false;


            clearTimeout(
                reconnectTimeout.current
            );


            subscription.remove();


            cerrarWebSocket();
        };


    }, [
        loteid,
        remateid,
        wsBaseUrl,
        apiBaseUrl,
    ]);
}
