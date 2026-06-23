// components/ai/AISupportChat.tsx

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, X, Send, Bot, User, 
  Image, Paperclip, Camera, Mic, 
  Shield, Gift, Clock, CheckCircle, 
  AlertCircle, ThumbsUp, ThumbsDown,
  FileText, Upload, Loader2, ChevronDown,
  Sparkles, Zap, Award, Coffee
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  images?: string[]
  options?: {
    label: string
    action: string
  }[]
}

interface ComplaintType {
  id: string
  label: string
  icon: any
  description: string
}

const complaintTypes: ComplaintType[] = [
  {
    id: 'delayed',
    label: 'Order Delayed',
    icon: Clock,
    description: 'Order taking longer than expected'
  },
  {
    id: 'spoilt',
    label: 'Food Spoilt',
    icon: AlertCircle,
    description: 'Food quality is not good or spoilt'
  },
  {
    id: 'wrong',
    label: 'Wrong Order',
    icon: FileText,
    description: 'Received wrong items or missing items'
  },
  {
    id: 'refund',
    label: 'Refund Request',
    icon: Shield,
    description: 'Request for refund'
  },
  {
    id: 'delivery',
    label: 'Delivery Issue',
    icon: AlertCircle,
    description: 'Delivery partner related issue'
  },
  {
    id: 'other',
    label: 'Other',
    icon: MessageCircle,
    description: 'Other complaint'
  }
]

const AIResponseTemplates = {
  delayed: {
    title: 'Order Delay Resolution',
    message: 'I understand your order is delayed. Let me check the status and help you with this.',
    options: [
      { label: 'Track Order', action: 'track' },
      { label: 'Get Voucher', action: 'voucher' },
      { label: 'Contact Support', action: 'support' }
    ]
  },
  spoilt: {
    title: 'Food Quality Issue',
    message: 'I\'m sorry to hear about the food quality. Please upload images of the food and I\'ll help you with a refund or voucher.',
    options: [
      { label: 'Upload Images', action: 'upload' },
      { label: 'Get Refund', action: 'refund' },
      { label: 'Get Voucher', action: 'voucher' }
    ]
  },
  wrong: {
    title: 'Wrong Order Received',
    message: 'I apologize for the wrong order. Let me help you get this resolved quickly.',
    options: [
      { label: 'Report Issue', action: 'report' },
      { label: 'Get Refund', action: 'refund' },
      { label: 'Reorder Items', action: 'reorder' }
    ]
  },
  refund: {
    title: 'Refund Request',
    message: 'I understand you want a refund. Let me check if your order is eligible for a refund.',
    options: [
      { label: 'Check Eligibility', action: 'check' },
      { label: 'Process Refund', action: 'refund' },
      { label: 'Contact Support', action: 'support' }
    ]
  },
  delivery: {
    title: 'Delivery Issue',
    message: 'I understand you\'re having issues with delivery. Let me help you resolve this.',
    options: [
      { label: 'Track Delivery', action: 'track' },
      { label: 'Contact Driver', action: 'contact' },
      { label: 'Report Issue', action: 'report' }
    ]
  },
  default: {
    title: 'How can I help you?',
    message: 'I\'m here to help you with any issues you\'re facing with your order.',
    options: [
      { label: 'Report Issue', action: 'report' },
      { label: 'Check Order', action: 'track' },
      { label: 'Contact Support', action: 'support' }
    ]
  }
}

export const AISupportChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: '👋 Hi! I\'m your AI support assistant. How can I help you today?',
      timestamp: new Date(),
      options: [
        { label: 'Order Issue', action: 'order_issue' },
        { label: 'Refund Request', action: 'refund' },
        { label: 'Delivery Help', action: 'delivery' },
        { label: 'Other', action: 'other' }
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showComplaintOptions, setShowComplaintOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const simulateAIResponse = async (userMessage: string, complaintType: string) => {
    setIsTyping(true)
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const template = AIResponseTemplates[complaintType as keyof typeof AIResponseTemplates] || AIResponseTemplates.default
    
    // Add AI response
    addMessage({
      type: 'bot',
      content: template.message,
      options: template.options
    })

    // If complaint is spoilt or wrong order, ask for images
    if (complaintType === 'spoilt' || complaintType === 'wrong') {
      setTimeout(() => {
        addMessage({
          type: 'bot',
          content: '📸 Please upload images of the issue so I can better assist you.',
          options: [
            { label: '📷 Upload Images', action: 'upload_images' },
            { label: 'Skip Images', action: 'skip' }
          ]
        })
        setIsTyping(false)
      }, 1000)
    } else {
      setIsTyping(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedImages.length === 0) return

    // Add user message
    const userMessage = inputMessage.trim() || 'I have a complaint about my order'
    addMessage({
      type: 'user',
      content: userMessage,
      images: uploadedImages.length > 0 ? uploadedImages : undefined
    })

    setInputMessage('')
    setUploadedImages([])

    // Check if user selected a complaint type
    const complaintType = selectedComplaint || 'default'
    
    // Simulate AI response
    await simulateAIResponse(userMessage, complaintType)
  }

  const handleComplaintSelect = (complaintId: string) => {
    setSelectedComplaint(complaintId)
    setShowComplaintOptions(false)
    
    const complaint = complaintTypes.find(c => c.id === complaintId)
    if (complaint) {
      addMessage({
        type: 'user',
        content: `I have a ${complaint.label.toLowerCase()} issue`
      })
      
      // Simulate AI response based on complaint type
      simulateAIResponse(complaint.label, complaintId)
    }
  }

  const handleOptionClick = async (action: string) => {
    switch (action) {
      case 'upload_images':
        fileInputRef.current?.click()
        break
      case 'refund':
        addMessage({
          type: 'bot',
          content: '✅ Your refund request has been processed. You will receive the amount within 3-5 business days.',
          options: [
            { label: 'Track Refund', action: 'track' },
            { label: 'Get Voucher', action: 'voucher' }
          ]
        })
        break
      case 'voucher':
        addMessage({
          type: 'bot',
          content: '🎉 I\'ve applied a 70% OFF voucher for your next order! Code: FOODIE70\n\nValid for 2 days only!',
          options: [
            { label: 'Copy Code', action: 'copy' },
            { label: 'Browse Restaurants', action: 'browse' }
          ]
        })
        toast.success('🎉 Voucher applied! 70% OFF on next order')
        break
      case 'track':
        addMessage({
          type: 'bot',
          content: '📍 Your order is currently being prepared and will be delivered in approximately 20-30 minutes. You can track it live in the orders section.',
          options: [
            { label: 'View Order', action: 'view_order' },
            { label: 'Contact Driver', action: 'contact' }
          ]
        })
        break
      case 'support':
        addMessage({
          type: 'bot',
          content: '📞 Our support team has been notified. They will contact you within 10 minutes.',
          options: [
            { label: 'Call Support', action: 'call' },
            { label: 'Chat with Agent', action: 'chat' }
          ]
        })
        break
      case 'report':
        setShowComplaintOptions(true)
        break
      case 'copy':
        navigator.clipboard.writeText('FOODIE70')
        toast.success('Code copied to clipboard!')
        break
      case 'browse':
        window.location.href = '/customer/restaurants'
        break
      case 'view_order':
        window.location.href = '/customer/orders'
        break
      case 'check':
        addMessage({
          type: 'bot',
          content: '✅ Your order is eligible for a full refund! Would you like to proceed?',
          options: [
            { label: 'Process Refund', action: 'refund' },
            { label: 'Get Voucher', action: 'voucher' }
          ]
        })
        break
      default:
        break
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
    e.target.value = ''
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[#E63946] to-[#C62828] text-white rounded-full shadow-2xl hover:shadow-xl transition-all flex items-center justify-center group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-36 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[600px] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Support Assistant</h3>
                  <p className="text-xs text-white/70">Online • Ready to help</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto p-1 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      message.type === 'user'
                        ? 'bg-[#E63946] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-[#E63946]" />
                        <span className="text-xs font-medium text-[#E63946]">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {message.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Upload ${idx + 1}`}
                            className="w-16 h-16 rounded-lg object-cover border border-white/20"
                          />
                        ))}
                      </div>
                    )}

                    {/* Options */}
                    {message.options && message.options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOptionClick(option.action)}
                            className="px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-full transition"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Complaint Options */}
              {showComplaintOptions && (
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select your issue type:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {complaintTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleComplaintSelect(type.id)}
                          className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                        >
                          <Icon className="w-5 h-5 text-[#E63946] mb-1" />
                          <span className="text-xs text-gray-700">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              
              {uploadedImages.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12">
                      <img src={img} alt="Upload" className="w-full h-full object-cover rounded-lg" />
                      <button
                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <Image className="w-5 h-5 text-gray-500" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() && uploadedImages.length === 0}
                  className="p-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}