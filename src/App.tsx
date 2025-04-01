import { FormEvent, useEffect, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"

type Message = {
    event: string
    data: {
        channel?: string
        [key: string]: unknown
    }
}

function App() {
    const [messages, setMessages] = useState<Message[]>([])
    const [greeting, setGreeting] = useState("")
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
        `${import.meta.env.VITE_WORKER_URL}/ws`,
    )

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            sendJsonMessage({
                event: "subscribe",
                data: {
                    channel: "general-chatroom",
                },
            })
        }
    }, [readyState, sendJsonMessage])

    useEffect(() => {
        if (lastJsonMessage) {
            setMessages((prev) => [...prev, lastJsonMessage as Message])
        }
    }, [lastJsonMessage])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            await fetch(`${import.meta.env.VITE_WORKER_URL}/greeting`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: greeting,
            })
            setGreeting("")
        } catch (error) {
            console.error("Failed to send greeting:", error)
        }
    }

    return (
        <div className="w-full p-8 space-y-4">
            <form
                onSubmit={handleSubmit}
                className="fixed top-4 right-4 flex gap-2"
            >
                <input
                    type="text"
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    className="px-3 py-1 border bg-zinc-100 border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-200"
                    placeholder="Set greeting..."
                />
            </form>
            {messages.map((message, index) => (
                <pre key={index} className="">
                    {JSON.stringify(message)}
                </pre>
            ))}
        </div>
    )
}

export default App
