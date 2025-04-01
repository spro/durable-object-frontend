import { FormEvent, useCallback, useEffect, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { UserIcon } from "@heroicons/react/24/solid"

type Message = {
    event?: string
    [key: string]: unknown
}

function App() {
    const [messages, setMessages] = useState<Message[]>([])

    const [type, setType] = useState("name")
    const [value, setValue] = useState("")

    const [hello, setHello] = useState("")
    const [users, setUsers] = useState(0)

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
        `${import.meta.env.VITE_WORKER_URL}/ws`,
        {
            shouldReconnect: () => true,
        },
    )

    const addMessage = useCallback((message: Message) => {
        setMessages((prev) => {
            const newMessages = [...prev, message]
            return newMessages.slice(-40)
        })
    }, [])

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            addMessage({
                event: "connect",
            })
            sendJsonMessage({ hello: true })
        } else if (readyState === ReadyState.CLOSED) {
            addMessage({
                event: "disconnect",
            })
        }
    }, [readyState, addMessage, sendJsonMessage])

    useEffect(() => {
        if (lastJsonMessage) {
            const message = lastJsonMessage as Message
            addMessage(message)
            if ("hello" in message && typeof message.hello === "string") {
                setHello(message.hello)
            }
            if ("users" in message && typeof message.users === "number") {
                setUsers(message.users)
            }
        }
    }, [lastJsonMessage, addMessage])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            await fetch(`${import.meta.env.VITE_WORKER_URL}/${type}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: value,
            })
            setValue("")
        } catch (error) {
            console.error("Failed to send greeting:", error)
        }
    }

    return (
        <div className="w-full p-8">
            <form
                onSubmit={handleSubmit}
                className="fixed top-4 right-4 flex gap-2"
            >
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-1 py-0.5 border bg-zinc-100 border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm"
                >
                    <option value="name">Name</option>
                    <option value="greeting">Greeting</option>
                </select>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="px-2 py-0.5 border bg-zinc-100 border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm"
                    placeholder={
                        type === "name" ? "Set name..." : "Set greeting..."
                    }
                />
            </form>
            <div className="fixed left-4 bottom-4 overflow-y-auto text-sm text-zinc-300 -z-10">
                {messages.map((message, index) => (
                    <pre
                        key={index}
                        className={`${message.event ? "text-emerald-500" : ""}`}
                    >
                        {JSON.stringify(message)}
                    </pre>
                ))}
            </div>
            <h1 className="max-w-2xl text-6xl font-bold text-center">
                {hello}
            </h1>
            <h2 className="max-w-2xl text-xl font-bold text-center mt-4 text-zinc-400 flex items-center justify-center gap-2">
                <span>{users}</span>
                <UserIcon className="inline-block w-4 h-4" />
            </h2>
        </div>
    )
}

export default App
