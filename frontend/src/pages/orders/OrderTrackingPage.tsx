import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Truck, CheckCircle, Clock, Package, Phone, MessageCircle } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../stores/authStore'

const orderSteps = [
  { status: 'PENDING', label: 'Order Placed', icon: Package, description: 'Your order has been placed' },
  { status: 'ACCEPTED', label: 'Restaurant Accepted', icon: CheckCircle, description: 'Restaurant has accepted your order' },
  { status: 'PREPARING', label: 'Preparing', icon: Clock, description: 'Your food is being prepared' },
  { status: 'READY', label: 'Ready for Pickup', icon: Package, description: 'Order is ready for pickup' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, description: 'Delivery partner is on the way' },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' },
]

export const OrderTrackingPage = () => {
  const { orderId } = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [orderStatus, setOrderStatus] = useState('PENDING')
  const [deliveryLocation, setDeliveryLocation] = useState({ lat: 0, lng: 0 })
  const [deliveryPartner, setDeliveryPartner] = useState<any>(null)

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    const newSocket = io('http://localhost:8000', {
      transports: ['websocket'],
      query: { token },
    })

    newSocket.emit('track_order', { order_id: orderId })

    newSocket.on('order_status_update', (data) => {
      setOrderStatus(data.status)
    })

    newSocket.on('delivery_location_update', (data) => {
      setDeliveryLocation({ lat: data.latitude, lng: data.longitude })
    })

    newSocket.on('delivery_partner_info', (data) => {
      setDeliveryPartner(data)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [orderId])

  const currentStepIndex = orderSteps.findIndex(step => step.status === orderStatus)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Track Your Order</h1>
        <p className="text-white/60 mt-1">Real-time updates for order #{orderId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Progress */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Order Progress</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/10">
                <motion.div
                  className="w-full bg-primary"
                  initial={{ height: 0 }}
                  animate={{ height: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-8">
                {orderSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const Icon = step.icon

                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex gap-4"
                    >
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : 'bg-white/10 text-white/40'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-white' : 'text-white/40'}`}>
                          {step.label}
                        </h3>
                        <p className={`text-sm ${isCompleted ? 'text-white/60' : 'text-white/40'}`}>
                          {step.description}
                        </p>
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 flex items-center gap-2 text-xs text-primary"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            In Progress
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Delivery Info */}
        <div className="space-y-6">
          {/* Delivery Partner Info */}
          {deliveryPartner && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Delivery Partner</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{deliveryPartner.name}</p>
                  <p className="text-sm text-white/60">{deliveryPartner.phone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-yellow-500">
                      {'★'.repeat(Math.floor(deliveryPartner.rating))}
                      {'☆'.repeat(5 - Math.floor(deliveryPartner.rating))}
                    </div>
                    <span className="text-xs text-white/60">({deliveryPartner.rating})</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Live Location */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Live Location</h2>
            <div className="h-48 bg-background-light rounded-lg flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary animate-pulse" />
              <p className="text-white/60 ml-2">Live map integration coming soon</p>
            </div>
            <p className="text-xs text-white/40 mt-4 text-center">
              Last updated: Just now
            </p>
          </GlassCard>

          {/* Need Help */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Need Help?</h2>
            <p className="text-white/60 text-sm mb-4">
              Having issues with your order? Contact our support team
            </p>
            <Button fullWidth variant="outline">
              Contact Support
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}