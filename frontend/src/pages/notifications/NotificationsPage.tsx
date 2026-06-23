import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Package, Star, MessageCircle, CreditCard, 
  CheckCheck, Trash2, Filter, Calendar, Clock,
  ShoppingBag, Truck, Award, AlertCircle, X,
  Mail, Phone, User, MapPin, Settings, LogOut
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import api from '../../services/api'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  timeAgo: string
  icon: any
  type: string
  read: boolean
  actionUrl?: string
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'Order Delivered',
    message: 'Your order #FX125680 has been delivered successfully',
    time: '2024-06-16T10:30:00',
    timeAgo: '5 minutes ago',
    icon: Package,
    type: 'order',
    read: false,
    actionUrl: '/orders/FX125680'
  },
  {
    id: 2,
    title: 'New Review',
    message: 'Customer left a 5-star review on your restaurant "Spice Garden"',
    time: '2024-06-16T09:15:00',
    timeAgo: '1 hour ago',
    icon: Star,
    type: 'review',
    read: false,
    actionUrl: '/reviews'
  },
  {
    id: 3,
    title: 'New Message',
    message: 'You have a new message from customer support regarding your recent order',
    time: '2024-06-16T07:00:00',
    timeAgo: '3 hours ago',
    icon: MessageCircle,
    type: 'message',
    read: true,
    actionUrl: '/chat'
  },
  {
    id: 4,
    title: 'Payment Received',
    message: 'Your payout of ₹2,450.00 has been processed and sent to your bank account',
    time: '2024-06-15T14:00:00',
    timeAgo: '1 day ago',
    icon: CreditCard,
    type: 'payment',
    read: true,
    actionUrl: '/wallet'
  },
  {
    id: 5,
    title: 'New Order',
    message: 'New order #FX125681 received from customer Rahul Sharma',
    time: '2024-06-16T11:00:00',
    timeAgo: 'Just now',
    icon: ShoppingBag,
    type: 'order',
    read: false,
    actionUrl: '/orders/FX125681'
  },
  {
    id: 6,
    title: 'Delivery Partner Assigned',
    message: 'A delivery partner has been assigned to your order #FX125679',
    time: '2024-06-16T08:30:00',
    timeAgo: '2 hours ago',
    icon: Truck,
    type: 'delivery',
    read: false,
    actionUrl: '/orders/FX125679/track'
  },
  {
    id: 7,
    title: 'Achievement Unlocked',
    message: 'Congratulations! You\'ve completed 50 orders. Bronze badge unlocked!',
    time: '2024-06-15T10:00:00',
    timeAgo: '2 days ago',
    icon: Award,
    type: 'achievement',
    read: true,
    actionUrl: '/profile'
  },
  {
    id: 8,
    title: 'System Update',
    message: 'New features available! Check out the updated restaurant dashboard.',
    time: '2024-06-14T09:00:00',
    timeAgo: '3 days ago',
    icon: AlertCircle,
    type: 'system',
    read: true,
    actionUrl: '/vendor/dashboard'
  },
]

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'order': return 'bg-orange-100 text-orange-600'
      case 'review': return 'bg-yellow-100 text-yellow-600'
      case 'message': return 'bg-blue-100 text-blue-600'
      case 'payment': return 'bg-green-100 text-green-600'
      case 'delivery': return 'bg-teal-100 text-teal-600'
      case 'achievement': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'order': return ShoppingBag
      case 'review': return Star
      case 'message': return MessageCircle
      case 'payment': return CreditCard
      case 'delivery': return Truck
      case 'achievement': return Award
      default: return Bell
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false
    if (filter === 'read' && !notification.read) return false
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    return true
  })

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    toast.success('Marked as read')
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Notification deleted')
  }

  const types = ['all', 'order', 'review', 'message', 'payment', 'delivery', 'achievement', 'system']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Notifications</h1>
                  <p className="text-white/70">Stay updated with your latest activities</p>
                </div>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="bg-[#FF9F1C] rounded-full px-3 py-1 text-sm font-semibold">
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-[#FF9F1C] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === 'unread'
                    ? 'bg-[#FF9F1C] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === 'read'
                    ? 'bg-[#FF9F1C] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Read
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
              >
                <Filter className="w-4 h-4" />
                Filter by type
              </button>
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-100 p-2 z-10 min-w-[150px]">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setTypeFilter(type)
                        setShowFilters(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition ${
                        typeFilter === type
                          ? 'bg-[#FF9F1C] text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => {
              const Icon = notification.icon
              const typeColor = getTypeColor(notification.type)
              const TypeIcon = getTypeIcon(notification.type)
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden ${
                    !notification.read ? 'border-l-4 border-l-[#FF9F1C]' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full ${typeColor} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{notification.timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className={`text-xs px-2 py-1 rounded transition ${
                              notification.read
                                ? 'text-gray-400 cursor-default'
                                : 'text-[#FF9F1C] hover:bg-orange-50'
                            }`}
                            disabled={notification.read}
                          >
                            {notification.read ? 'Read' : 'Mark as read'}
                          </button>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No notifications found</p>
              <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}