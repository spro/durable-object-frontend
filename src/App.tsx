import { useEffect, useState } from "react"

import useWebSocket, { ReadyState } from "react-use-websocket"

import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"
import "./App.css"

function App() {
    const [count, setCount] = useState(0)

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
        "ws://localhost:8787/ws",
    )

    // Run when the connection state (readyState) changes
    useEffect(() => {
        console.log("Connection state changed")
        if (readyState === ReadyState.OPEN) {
            sendJsonMessage({
                event: "subscribe",
                data: {
                    channel: "general-chatroom",
                },
            })
        }
    }, [readyState, sendJsonMessage])

    // Run when a new WebSocket message is received (lastJsonMessage)
    useEffect(() => {
        console.log("Got a new message:", lastJsonMessage)
    }, [lastJsonMessage])

    return (
        <div className="w-full p-8">
            <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
        </div>
    )
}

export default App
