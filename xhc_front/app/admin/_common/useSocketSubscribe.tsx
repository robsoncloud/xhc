import { useCallback, useEffect, useRef } from "react"



export function useSocketSubscribe(workstation: string, handleMessage: (message: string) => void) {
    const ws = useRef<WebSocket | null>(null)
   

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8000/ws/${workstation}`)
        const handleOpen = () => {
            const message = JSON.stringify({ type: "connected", payload: workstation });
            handleMessage(message);
        };

        const handleMessageEvent = (event) => {
            if (event.data) {
                handleMessage(event.data);
            }
        };

        const handleClose = () => {
            const message = JSON.stringify({ type: "disconnected", payload: workstation });
            handleMessage(message);
        };

        const handleError = (event) => {
            const message = JSON.stringify({ type: "error", payload: `Error connecting to Websocket server: ${event.currentTarget.url}` });
            handleMessage(message);
        };

        ws.current.onopen = handleOpen;
        ws.current.onmessage = handleMessageEvent;
        ws.current.onclose = handleClose;
        ws.current.onerror = handleError;

        const connectMessage = JSON.stringify({ type: "connecting", payload: `Connecting to Websocket server: ${ws.current.url}` });
        handleMessage(connectMessage);

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [workstation, handleMessage]);

    const sendMessage = useCallback((message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            console.log(message);
            ws.current.send(message);
        } else {
            console.error("WebSocket is not open");
            handleMessage(JSON.stringify({ type: "error", payload: "WebSocket is not open" }));
        }
    }, []);

    return sendMessage;

}

