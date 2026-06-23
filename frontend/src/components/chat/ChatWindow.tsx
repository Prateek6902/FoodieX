import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../../stores/authStore'
import { Send, Paperclip, Image, Smile } from 'lucide-react'
import { Button } from '../ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar'
import { cn } from '../../lib/utils'

interface Message {
  id: string
  message: string
  sender_id: string
  sender_name: string
  created_at: string
}

interface ChatWindowProps {
  roomId: string
  recipientName: string
  recipientAvatar?: string
}

export const ChatWindow = ({ roomId, recipientName, recipientAvatar }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const newSocket = io('http://localhost:8000', {
      transports: ['websocket'],
      query: { token: useAuthStore.getState().accessToken },
    })
    setSocket(newSocket)

    newSocket.emit('join_room', roomId)

    newSocket.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data])
    })

    newSocket.on('user_typing', (data: { user_id: string; is_typing: boolean }) => {
      if (data.user_id !== user?.id) {
        setIsTyping(data.is_typing)
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [roomId, user?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return

    socket.emit('send_message', {
      room_id: roomId,
      message: newMessage,
    })

    setNewMessage('')
  }

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    socket?.emit('typing', { room_id: roomId, is_typing: true })
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing', { room_id: roomId, is_typing: false })
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full bg-background-light rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Avatar className="w-10 h-10">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback className="bg-primary">
            {recipientName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-white">{recipientName}</h3>
          {isTyping && (
            <p className="text-xs text-primary animate-pulse">Typing...</p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id
          return (
            <div
              key={message.id}
              className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2',
                  isOwn
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                    : 'bg-white/10 text-white'
                )}
              >
                {!isOwn && (
                  <p className="text-xs text-white/60 mb-1">{message.sender_name}</p>
                )}
                <p className="text-sm">{message.message}</p>
                <p className="text-xs text-white/40 mt-1 text-right">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Paperclip className="w-5 h-5 text-white/60" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Image className="w-5 h-5 text-white/60" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Smile className="w-5 h-5 text-white/60" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            onKeyUp={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
          />
          <Button onClick={sendMessage} size="sm">
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}