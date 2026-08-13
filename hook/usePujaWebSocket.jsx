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

                setCounter(data);

                console.log(
                    'Contador actualizado:',
                    data
                );

            } catch (error) {

                console.error(
                    'Error fetch contador:',
                    error
                );
            }
        };


        /*
         * ==========================================
         * CERRAR SOCKET
         * ==========================================
         */

        const cerrarWebSocket = () => {

            if (ws.current) {

                console.log(
                    'Cerrando WebSocket...'
                );

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


            console.log(
                'Conectando WebSocket:',
                wsUrl
            );


            const socket =
                new WebSocket(wsUrl);

            ws.current = socket;


            /*
             * ======================================
             * OPEN
             * ======================================
             */

            socket.onopen = () => {

                console.log(
                    'WebSocket conectado'
                );

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

                console.log('========== WEBSOCKET ==========');
                console.log('Mensaje recibido:', event.data);
                console.log('Tipo:', typeof event.data);
                console.log('================================');

                const valor = parseInt(event.data, 10);

                if (isNaN(valor)) {
                    return;
                }

                setCounter(valor);
                /*
                 * Usuario tenía puja pendiente
                 */

                if (
                    pendingUserBidRef.current &&
                    lastUserBidValueRef.current !== null
                ) {

                    if (
                        valor >=
                        lastUserBidValueRef.current
                    ) {

                        pendingUserBidRef.current =
                            false;

                        setIsWinning(true);

                        setStatusMessage(
                            'Tu tienes el lote, ¡felicidades!'
                        );

                        setShowStatus(true);
                    }


                    /*
                     * Usuario perdió
                     */

                } else if (
                    isWinningRef.current &&
                    lastUserBidValueRef.current !== null &&
                    valor >
                    lastUserBidValueRef.current
                ) {

                    setIsWinning(false);

                    setStatusMessage(
                        'Perdiste el lote'
                    );

                    setShowStatus(true);

                    lastUserBidValueRef.current =
                        null;
                }
            };


            /*
             * ======================================
             * ERROR
             * ======================================
             */

            socket.onerror = (error) => {

                console.error(
                    'WebSocket error:',
                    error.message || error
                );
            };


            /*
             * ======================================
             * CLOSE
             * ======================================
             */

            socket.onclose = (
                event
            ) => {

                console.log(
                    'WebSocket cerrado:',
                    event.code,
                    event.reason
                );


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


                    console.log(
                        `Reintentando en ${delay / 1000}s`
                    );


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

                console.log(
                    'AppState:',
                    appState.current,
                    '→',
                    nextState
                );


                /*
                 * App vuelve a primer plano
                 */

                if (
                    appState.current.match(
                        /inactive|background/
                    ) &&
                    nextState === 'active'
                ) {

                    console.log(
                        'App volvió a primer plano'
                    );


                    clearTimeout(
                        reconnectTimeout.current
                    );


                    cerrarWebSocket();


                    /*
                     * Obtener valor actual
                     */

                    obtenerContador();


                    /*
                     * Reconectar
                     */

                    setTimeout(
                        () => {
                            conectarWebSocket();
                        },
                        300
                    );
                }


                /*
                 * App pasa a segundo plano
                 */

                if (
                    nextState === 'background' ||
                    nextState === 'inactive'
                ) {

                    console.log(
                        'App pasó a segundo plano'
                    );


                    clearTimeout(
                        reconnectTimeout.current
                    );


                    cerrarWebSocket();
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

            console.log(
                'Saliendo de la vista del lote'
            );


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
