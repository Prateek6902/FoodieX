import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, Shield, Eye, Globe, Moon, Sun, 
  Lock, User, Smartphone, CreditCard, Mail,Settings,
  MapPin, Server, Database, Zap, Cloud,
  ChevronRight, CheckCircle, AlertCircle,
  ShieldCheck, Fingerprint, Key, LogOut,
  RefreshCw, Save, X, Loader2, 
  Speaker, Volume2, VolumeX, Vibrate
} from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import api from '../../services/api'

interface SettingsState {
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  orderUpdates: boolean
  promotions: boolean
  darkMode: boolean
  language: string
  twoFactorAuth: boolean
  autoSave: boolean
  soundEffects: boolean
  vibration: boolean
}

export const SettingsPage = () => {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'preferences'>('general')
  const [settings, setSettings] = useState<SettingsState>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false,
    darkMode: true,
    language: 'en',
    twoFactorAuth: false,
    autoSave: true,
    soundEffects: true,
    vibration: true,
  })

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Zap },
  ]

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('user_settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
  }, [])

  const handleToggle = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem('user_settings', JSON.stringify(settings))
      
      // Save to backend if needed
      await api.put('/users/settings/', settings)
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Reset all settings to default?')) {
      setSettings({
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotions: false,
        darkMode: true,
        language: 'en',
        twoFactorAuth: false,
        autoSave: true,
        soundEffects: true,
        vibration: true,
      })
      toast.success('Settings reset to default')
    }
  }

  const toggleDarkMode = () => {
    handleToggle('darkMode')
    // Apply dark mode to document
    document.documentElement.classList.toggle('dark')
  }

  const SettingToggle = ({ 
    label, 
    description, 
    value, 
    onChange,
    icon: Icon,
    color = 'primary'
  }: { 
    label: string
    description?: string
    value: boolean
    onChange: () => void
    icon?: any
    color?: string
  }) => {
    const colorMap = {
      primary: 'from-[#FF9F1C] to-[#FFBF69]',
      green: 'from-green-500 to-emerald-500',
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      red: 'from-red-500 to-rose-500',
    }

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9F1C]/10 to-[#2EC4B6]/10 flex items-center justify-center group-hover:scale-110 transition">
              <Icon className="w-5 h-5 text-[#FF9F1C]" />
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-800">{label}</h4>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        <button
          onClick={onChange}
          className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
            value ? `bg-gradient-to-r ${colorMap[color as keyof typeof colorMap] || colorMap.primary}` : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
              value ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="text-white/70">Manage your preferences and account settings</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-4 h-fit sticky top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF9F1C]/10 to-[#2EC4B6]/10 text-[#FF9F1C] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">General Settings</h2>
                    <p className="text-sm text-gray-500">Basic account settings and preferences</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Account Name</h4>
                          <p className="text-sm text-gray-500">{user?.full_name || user?.email}</p>
                        </div>
                      </div>
                      <button className="text-sm text-[#FF9F1C] hover:underline">Change</button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Email Address</h4>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <button className="text-sm text-[#FF9F1C] hover:underline">Change</button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Language</h4>
                          <p className="text-sm text-gray-500">Select your preferred language</p>
                        </div>
                      </div>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <SettingToggle
                      label="Dark Mode"
                      description="Switch between light and dark theme"
                      value={settings.darkMode}
                      onChange={toggleDarkMode}
                      icon={settings.darkMode ? Moon : Sun}
                    />

                    <SettingToggle
                      label="Auto Save"
                      description="Automatically save your changes"
                      value={settings.autoSave}
                      onChange={() => handleToggle('autoSave')}
                      icon={Save}
                      color="blue"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Notification Preferences</h2>
                    <p className="text-sm text-gray-500">Choose how you want to receive updates</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <SettingToggle
                      label="Push Notifications"
                      description="Receive push notifications on your device"
                      value={settings.pushNotifications}
                      onChange={() => handleToggle('pushNotifications')}
                      icon={Bell}
                    />

                    <SettingToggle
                      label="Email Notifications"
                      description="Receive email updates and summaries"
                      value={settings.emailNotifications}
                      onChange={() => handleToggle('emailNotifications')}
                      icon={Mail}
                      color="blue"
                    />

                    <SettingToggle
                      label="SMS Notifications"
                      description="Receive SMS alerts on your phone"
                      value={settings.smsNotifications}
                      onChange={() => handleToggle('smsNotifications')}
                      icon={Smartphone}
                      color="green"
                    />

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="font-medium text-gray-800 mb-4">What to notify</h4>
                      
                      <SettingToggle
                        label="Order Updates"
                        description="Get notified about your order status"
                        value={settings.orderUpdates}
                        onChange={() => handleToggle('orderUpdates')}
                        color="orange"
                      />

                      <SettingToggle
                        label="Promotions & Offers"
                        description="Receive promotional messages and deals"
                        value={settings.promotions}
                        onChange={() => handleToggle('promotions')}
                        color="purple"
                      />
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="font-medium text-gray-800 mb-4">Sound & Vibration</h4>
                      
                      <SettingToggle
                        label="Sound Effects"
                        description="Play sounds for notifications"
                        value={settings.soundEffects}
                        onChange={() => handleToggle('soundEffects')}
                        icon={Volume2}
                        color="teal"
                      />

                      <SettingToggle
                        label="Vibration"
                        description="Vibrate on notification"
                        value={settings.vibration}
                        onChange={() => handleToggle('vibration')}
                        icon={Vibrate}
                        color="pink"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Security & Privacy</h2>
                    <p className="text-sm text-gray-500">Protect your account and data</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                          <Key className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Change Password</h4>
                          <p className="text-sm text-gray-500">Update your password regularly</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg text-sm hover:shadow-lg transition">
                        Update
                      </button>
                    </div>

                    <SettingToggle
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security"
                      value={settings.twoFactorAuth}
                      onChange={() => handleToggle('twoFactorAuth')}
                      icon={ShieldCheck}
                      color="green"
                    />

                    <SettingToggle
                      label="Biometric Login"
                      description="Use fingerprint or face recognition"
                      value={false}
                      onChange={() => handleToggle('twoFactorAuth')}
                      icon={Fingerprint}
                      color="blue"
                    />

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="font-medium text-gray-800 mb-4">Privacy Controls</h4>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Data Privacy</h4>
                            <p className="text-sm text-gray-500">Manage your data and privacy settings</p>
                          </div>
                        </div>
                        <button className="text-sm text-[#FF9F1C] hover:underline">Manage</button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <Server className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Data Export</h4>
                            <p className="text-sm text-gray-500">Download your data and activity</p>
                          </div>
                        </div>
                        <button className="text-sm text-[#FF9F1C] hover:underline">Export</button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition">
                        <LogOut className="w-4 h-4" />
                        Logout from all devices
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Preferences</h2>
                    <p className="text-sm text-gray-500">Customize your experience</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Default View</h4>
                          <p className="text-sm text-gray-500">Choose your default dashboard view</p>
                        </div>
                      </div>
                      <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]">
                        <option value="grid">Grid View</option>
                        <option value="list">List View</option>
                        <option value="compact">Compact View</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
                          <Cloud className="w-5 h-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Data Sync</h4>
                          <p className="text-sm text-gray-500">Sync settings across devices</p>
                        </div>
                      </div>
                      <button className="text-sm text-[#FF9F1C] hover:underline">Sync Now</button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                          <Database className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Cache Settings</h4>
                          <p className="text-sm text-gray-500">Manage app cache and storage</p>
                        </div>
                      </div>
                      <button className="text-sm text-red-500 hover:underline">Clear Cache</button>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="font-medium text-gray-800 mb-4">Appearance</h4>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {['Light', 'Dark', 'System'].map((theme) => (
                          <button
                            key={theme}
                            className={`p-3 border rounded-xl text-center transition ${
                              settings.darkMode && theme === 'Dark'
                                ? 'border-[#FF9F1C] bg-[#FF9F1C]/10'
                                : !settings.darkMode && theme === 'Light'
                                ? 'border-[#FF9F1C] bg-[#FF9F1C]/10'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                              theme === 'Light' ? 'bg-white border border-gray-200' :
                              theme === 'Dark' ? 'bg-gray-800' :
                              'bg-gradient-to-r from-white to-gray-800 border border-gray-200'
                            }`} />
                            <span className="text-xs text-gray-600">{theme}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}