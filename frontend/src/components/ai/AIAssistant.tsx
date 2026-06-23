import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Sparkles, MessageSquare, TrendingUp, BarChart3, Zap } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const suggestions = [
  {
    icon: TrendingUp,
    text: 'Show me revenue insights',
    prompt: 'Can you provide revenue insights for the last 30 days?',
  },
  {
    icon: BarChart3,
    text: 'Analyze top vendors',
    prompt: 'Who are the top performing vendors this month?',
  },
  {
    icon: MessageSquare,
    text: 'Customer satisfaction',
    prompt: 'What is the current customer satisfaction rate?',
  },
  {
    icon: Zap,
    text: 'Quick actions',
    prompt: 'What tasks need my attention today?',
  },
]

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])

  const handleSend = async (prompt: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: prompt }])
    // Here you would call your AI API
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Based on your request "${prompt}", I've analyzed the data. Your revenue has increased by 15% this month. Would you like more details?`,
        },
      ])
    }, 1000)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20 flex items-center justify-center group"
      >
        <Bot className="w-6 h-6 text-white" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px]"
          >
            <GlassCard className="h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-white/40">Powered by GPT-4</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-white/40 mt-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Hi! I'm your AI assistant.</p>
                    <p className="text-sm">How can I help you today?</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2',
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                            : 'bg-white/10 text-white'
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Suggestions */}
              {messages.length === 0 && (
                <div className="p-4 border-t border-white/10">
                  <p className="text-xs text-white/40 mb-2">Suggestions</p>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(suggestion.prompt)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                      >
                        <suggestion.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-white/80">{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsListening(!isListening)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isListening
                        ? 'bg-danger text-white animate-pulse'
                        : 'hover:bg-white/10 text-white/60'
                    )}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleSend(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}