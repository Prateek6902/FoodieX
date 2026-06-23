import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Edit2, Trash2, Save, Package, DollarSign, Clock } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface MenuItem {
  id?: string
  name: string
  price: number
  category: string
  description: string
  is_available: boolean
  preparation_time: number
}

interface MenuManagementProps {
  restaurantId: string
  restaurantName: string
  onClose: () => void
  onUpdate: () => void
}

export const MenuManagement = ({ restaurantId, restaurantName, onClose, onUpdate }: MenuManagementProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    preparation_time: '15',
  })

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/menu/`)
      if (response.data.success) {
        setMenuItems(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }

  useState(() => {
    fetchMenuItems()
  }, )

  const handleAddMenuItem = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.post(`/restaurants/${restaurantId}/products/create/`, {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category || 'Main Course',
        description: formData.description,
        preparation_time: parseInt(formData.preparation_time),
        is_available: true,
        is_active: true
      })

      if (response.data.success) {
        toast.success('Menu item added successfully!')
        setShowAddForm(false)
        setFormData({ name: '', price: '', category: '', description: '', preparation_time: '15' })
        fetchMenuItems()
        onUpdate()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add menu item')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    setLoading(true)
    try {
      const response = await api.delete(`/restaurants/products/${itemId}/delete/`)
      if (response.data.success) {
        toast.success('Menu item deleted successfully!')
        fetchMenuItems()
        onUpdate()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete menu item')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Sides']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Menu Management</h2>
            <p className="text-sm text-gray-500">{restaurantName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Add Menu Item Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Menu Item
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="12.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="15"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    placeholder="Item description..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMenuItem}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Menu Items List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">Menu Items</h3>
            {menuItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No menu items yet. Click "Add Menu Item" to get started.
              </div>
            ) : (
              menuItems.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <span className="text-xs text-gray-500">{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <DollarSign className="w-3 h-3" />
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparation_time || 15} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteMenuItem(item.id!)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}