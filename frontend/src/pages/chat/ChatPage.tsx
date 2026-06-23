import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Paperclip, Image, Smile, MoreVertical, Phone, Video, 
  Search, Pin, MessageCircle, X, Check, CheckCheck 
} from 'lucide-react' 
import { useAuthStore } from '../../stores/authStore'
import { GlassCard } from '../../components/ui/GlassCard'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar'

interface Message {
  id: string
  message: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  created_at: string
  is_read: boolean
}

interface ChatRoom {
  id: string
  room_name: string
  room_type: string
  participants: any[]
  last_message?: Message
  unread_count: number
}

export const ChatPage = () => {
  const { user } = useAuthStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    const newSocket = io('http://localhost:8000', {
      transports: ['websocket'],
      query: { token },
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat server')
    })

    newSocket.on('chat_rooms', (data: ChatRoom[]) => {
      setRooms(data)
    })

    newSocket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message])
      
      // Update room last message
      setRooms((prev) =>
        prev.map((room) =>
          room.id === message.sender_id
            ? { ...room, last_message: message, unread_count: room.unread_count + 1 }
            : room
        )
      )
    })

    newSocket.on('user_typing', (data: { room_id: string; user_name: string; is_typing: boolean }) => {
      if (data.room_id === activeRoom?.id) {
        if (data.is_typing) {
          setTypingUsers((prev) => [...prev, data.user_name])
        } else {
          setTypingUsers((prev) => prev.filter((name) => name !== data.user_name))
        }
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (activeRoom && socket) {
      socket.emit('join_room', { room_id: activeRoom.id })
      socket.emit('get_messages', { room_id: activeRoom.id }, (response: Message[]) => {
        setMessages(response)
      })
    }
  }, [activeRoom, socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !activeRoom) return

    socket.emit('send_message', {
      room_id: activeRoom.id,
      message: newMessage,
    })

    setNewMessage('')
  }

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    socket?.emit('typing', { room_id: activeRoom?.id, is_typing: true })
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing', { room_id: activeRoom?.id, is_typing: false })
    }, 1000)
  }

  const getRecipient = (room: ChatRoom) => {
    return room.participants.find((p) => p.id !== user?.id)
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Chat List */}
        <GlassCard className="overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Messages</h2>
            <Input placeholder="Search conversations..." icon={<Search className="w-4 h-4" />} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {rooms.map((room, index) => {
                const recipient = getRecipient(room)
                if (!recipient) return null
                
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveRoom(room)}
                    className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                      activeRoom?.id === room.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={recipient.avatar} />
                        <AvatarFallback className="bg-primary">
                          {recipient.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-white truncate">
                            {recipient.full_name}
                          </p>
                          {room.last_message && (
                            <span className="text-xs text-white/40">
                              {new Date(room.last_message.created_at).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/60 truncate">
                          {room.last_message?.message || 'No messages yet'}
                        </p>
                      </div>
                      {room.unread_count > 0 && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">{room.unread_count}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {activeRoom ? (
            <GlassCard className="h-full flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={getRecipient(activeRoom)?.avatar} />
                    <AvatarFallback className="bg-primary">
                      {getRecipient(activeRoom)?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">
                      {getRecipient(activeRoom)?.full_name}
                    </h3>
                    {typingUsers.length > 0 && (
                      <p className="text-xs text-primary">Typing...</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/10 transition">
                    <Phone className="w-5 h-5 text-white/60" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition">
                    <Video className="w-5 h-5 text-white/60" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition">
                    <Pin className="w-5 h-5 text-white/60" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition">
                    <MoreVertical className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                          <Avatar className="w-8 h-8 mr-2">
                            <AvatarFallback className="bg-primary text-xs">
                              {message.sender_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs text-white/60 mb-1">{message.sender_name}</p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs text-white/40 mt-1 text-right">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/10 transition">
                    <Paperclip className="w-5 h-5 text-white/60" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition">
                    <Image className="w-5 h-5 text-white/60" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition">
                    <Smile className="w-5 h-5 text-white/60" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyUp={handleTyping}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-white/40">Choose a chat to start messaging</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}