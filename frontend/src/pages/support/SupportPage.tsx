import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, MessageCircle, Phone, Mail, Globe,Package, CreditCard, Store, 
  Send, ChevronDown, ChevronUp, Headphones, 
  Clock, CheckCircle, MessageSquare, AlertCircle 
} from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: "How do I place an order?",
    answer: "Simply browse restaurants, select your favorite dishes, add them to cart, and proceed to checkout. You can track your order in real-time.",
    category: "orders"
  },
  {
    id: 2,
    question: "What payment methods are accepted?",
    answer: "We accept credit/debit cards, UPI, net banking, wallets, and cash on delivery.",
    category: "payments"
  },
  {
    id: 3,
    question: "How can I track my order?",
    answer: "Go to 'My Orders' section and click on the order you want to track. You'll see real-time status updates.",
    category: "orders"
  },
  {
    id: 4,
    question: "What is your refund policy?",
    answer: "If your order is delayed or incorrect, you can request a refund within 24 hours of delivery.",
    category: "payments"
  },
  {
    id: 5,
    question: "How do I become a delivery partner?",
    answer: "Visit our 'Become a Partner' page, fill out the application form, and complete the verification process.",
    category: "partners"
  },
  {
    id: 6,
    question: "How do I register as a restaurant owner?",
    answer: "Click on 'Become a Vendor' on the login page, fill in your restaurant details, and submit for verification.",
    category: "partners"
  },
]

export const SupportPage = () => {
  const { user } = useAuthStore()
  const [openFaqId, setOpenFaqId] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { id: 'all', label: 'All', icon: HelpCircle },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'partners', label: 'Partners', icon: Store },
  ]

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Support Center</h1>
            <p className="text-white/70">How can we help you today?</p>
          </div>
          <div className="bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#FF9F1C]" />
              <span className="font-semibold">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Support Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-7 h-7 text-[#FF9F1C]" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-500">Chat with our support team</p>
          <button className="mt-3 text-sm text-[#FF9F1C] hover:underline">Start Chat →</button>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Phone className="w-7 h-7 text-[#2EC4B6]" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Phone Support</h3>
          <p className="text-sm text-gray-500">Call us 24/7</p>
          <p className="text-lg font-bold text-gray-800 mt-2">+1 (555) 123-4567</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Mail className="w-7 h-7 text-purple-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Email Support</h3>
          <p className="text-sm text-gray-500">Get response within 24h</p>
          <p className="text-sm text-gray-600 mt-2">support@foodiex.com</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all group cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Globe className="w-7 h-7 text-blue-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Knowledge Base</h3>
          <p className="text-sm text-gray-500">Browse help articles</p>
          <button className="mt-3 text-sm text-blue-500 hover:underline">Browse Articles →</button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-500">Find answers to common questions</p>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-gray-100">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="px-6 py-4">
              <button
                onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                {openFaqId === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {openFaqId === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pl-4 text-gray-500 text-sm"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Still Need Help?</h2>
          <p className="text-sm text-gray-500">Send us a message and we'll get back to you</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
              placeholder="What is this regarding?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
              placeholder="Describe your issue in detail..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  )
}