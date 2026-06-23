import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  MapPin, Home, Briefcase, Plus, Trash2, 
  CheckCircle, X, Star
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

interface Address {
  id: string
  address_type: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  landmark: string | null
  is_default: boolean
}

export const CustomerAddressesPage = () => {
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    address_type: 'HOME',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    landmark: ''
  })

  const { data: addresses = [], refetch } = useQuery<Address[]>({
    queryKey: ['customer-addresses'],
    queryFn: async () => {
      const response = await api.get('/customers/addresses/')
      return response.data.data || []
    },
  })

  const addAddress = useMutation({
    mutationFn: async (addressData: any) => {
      const response = await api.post('/customers/addresses/create/', addressData)
      return response.data
    },
    onSuccess: () => {
      toast.success('Address added successfully')
      refetch()
      setShowAddAddress(false)
      setNewAddress({
        address_type: 'HOME',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        landmark: ''
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add address')
    },
  })

  const setDefaultAddress = useMutation({
    mutationFn: async (addressId: string) => {
      await api.post(`/customers/addresses/${addressId}/set-default/`)
    },
    onSuccess: () => {
      toast.success('Default address updated')
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update default address')
    },
  })

  const deleteAddress = useMutation({
    mutationFn: async (addressId: string) => {
      await api.delete(`/customers/addresses/${addressId}/delete/`)
    },
    onSuccess: () => {
      toast.success('Address deleted')
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete address')
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Addresses</h1>
              <p className="text-white/80">Manage your saved delivery addresses</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button 
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>
          </div>
        </div>

        {/* Add Address Form */}
        {showAddAddress && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Add New Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newAddress.address_type}
                onChange={(e) => setNewAddress({ ...newAddress, address_type: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
              >
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                type="text"
                placeholder="Address Line 1 *"
                value={newAddress.address_line1}
                onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={newAddress.address_line2}
                onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
              />
              <input
                type="text"
                placeholder="City *"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
              />
              <input
                type="text"
                placeholder="State *"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
              />
              <input
                type="text"
                placeholder="Postal Code *"
                value={newAddress.postal_code}
                onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
              />
              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddAddress(false)}
                className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => addAddress.mutate(newAddress)}
                disabled={addAddress.isPending}
                className="px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition disabled:opacity-50"
              >
                {addAddress.isPending ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 text-center py-16">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No addresses saved</p>
            <p className="text-sm text-gray-400 mt-1">Add your first address for faster checkout</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address: Address) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {address.address_type === 'HOME' && <Home className="w-5 h-5 text-blue-500" />}
                      {address.address_type === 'WORK' && <Briefcase className="w-5 h-5 text-purple-500" />}
                      {address.address_type === 'OTHER' && <MapPin className="w-5 h-5 text-gray-500" />}
                      <span className="font-semibold text-gray-800">{address.address_type}</span>
                      {address.is_default && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{address.address_line1}</p>
                    {address.address_line2 && <p className="text-gray-500 text-sm">{address.address_line2}</p>}
                    <p className="text-gray-500 text-sm">{address.city}, {address.state} - {address.postal_code}</p>
                    {address.landmark && <p className="text-gray-400 text-sm">Landmark: {address.landmark}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    {!address.is_default && (
                      <button
                        onClick={() => setDefaultAddress.mutate(address.id)}
                        className="px-3 py-1 text-xs bg-[#1D3557] text-white rounded-lg hover:bg-[#457B9D] transition"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this address?')) {
                          deleteAddress.mutate(address.id)
                        }
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)