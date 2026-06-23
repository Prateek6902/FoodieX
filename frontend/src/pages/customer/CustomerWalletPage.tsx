import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, 
  RefreshCw, CreditCard, Gift, TrendingUp,
  Calendar, ChevronRight, X, CheckCircle
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

interface WalletData {
  id: string
  balance: number
  total_added: number
  total_spent: number
  transactions: Array<{
    id: string
    amount: number
    type: string
    description: string
    created_at: string
  }>
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const CustomerWalletPage = () => {
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [amount, setAmount] = useState<string>('')
  const [selectedAmount, setSelectedAmount] = useState<number>(0)

  const quickAmounts = [100, 200, 500, 1000, 2000]

  const { data: wallet, refetch } = useQuery<WalletData>({
    queryKey: ['customer-wallet'],
    queryFn: async () => {
      const response = await api.get('/customers/wallet/')
      return response.data.data
    },
  })

  const addMoney = useMutation({
    mutationFn: async (amount: number) => {
      const response = await api.post('/customers/wallet/add/', { amount })
      return response.data
    },
    onSuccess: () => {
      toast.success('Money added to wallet successfully!')
      refetch()
      setShowAddMoney(false)
      setAmount('')
      setSelectedAmount(0)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add money')
    },
  })

  const handleAddMoney = () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    addMoney.mutate(amountNum)
  }

  const handleQuickAmount = (value: number) => {
    setSelectedAmount(value)
    setAmount(value.toString())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
              <p className="text-white/80">Manage your balance and transactions</p>
            </div>
            <button 
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-white/80 text-sm">Available Balance</p>
              <p className="text-4xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
              <div className="flex gap-4 mt-2 text-sm text-white/80">
                <span>Added: {formatCurrency(wallet?.total_added || 0)}</span>
                <span>•</span>
                <span>Spent: {formatCurrency(wallet?.total_spent || 0)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowAddMoney(true)}
              className="px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition flex items-center gap-2 backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" />
              Add Money
            </button>
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add Money</h3>
                  <button onClick={() => setShowAddMoney(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent text-lg"
                    placeholder="Enter amount"
                    min="0"
                  />
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Quick Amounts</p>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleQuickAmount(value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedAmount === value
                            ? 'bg-[#E63946] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ₹{value}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddMoney}
                  disabled={addMoney.isPending}
                  className="w-full py-3 bg-[#E63946] text-white rounded-xl hover:bg-[#C62828] transition font-medium disabled:opacity-50"
                >
                  {addMoney.isPending ? 'Processing...' : 'Add Money'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Added</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(wallet?.total_added || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(wallet?.total_spent || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-lg font-bold text-gray-800">{wallet?.transactions?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Gift className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(wallet?.balance || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E63946]" />
              Transaction History
            </h2>
          </div>
          <div className="p-6">
            {wallet?.transactions && wallet.transactions.length > 0 ? (
              <div className="space-y-3">
                {wallet.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'CREDIT' ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-1">Add money to your wallet to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}