// layouts/GuestLayout.tsx

import { Outlet, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Store, ShoppingBag, Heart, Search, User, 
  LogIn, UserPlus, Menu, X, ChevronDown,
  Facebook, Instagram, Twitter, Youtube,
  Mail, Phone, MapPin, Clock, Award,
  Shield, CreditCard, Truck, Coffee
} from 'lucide-react'
import { useState } from 'react'

export const GuestLayout = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Restaurants', href: '/restaurants' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  const handleLoginClick = () => {
    navigate('/login')
  }

  const handleSignUpClick = () => {
    navigate('/register')
  }

  const handleGuestClick = () => {
    navigate('/restaurants')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>🍔 FoodieX</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Delivering happiness since 2024</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLoginClick}
              className="hover:text-[#E63946] transition flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              Login
            </button>
            <button 
              onClick={handleSignUpClick}
              className="bg-[#E63946] px-3 py-0.5 rounded-full text-xs hover:bg-[#C62828] transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="text-2xl">🍔</div>
              <span className="text-xl font-bold text-[#1D3557] group-hover:text-[#E63946] transition">
                FoodieX
              </span>
              <span className="text-xs bg-[#E63946] text-white px-2 py-0.5 rounded-full hidden sm:inline">
                Guest
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-gray-600 hover:text-[#E63946] transition text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleGuestClick}
                className="hidden md:flex items-center gap-1 text-sm text-[#E63946] hover:underline"
              >
                <User className="w-4 h-4" />
                Guest View
              </button>
              <button className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-[#E63946] transition">
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={handleLoginClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-[#E63946] text-[#E63946] rounded-lg hover:bg-[#E63946] hover:text-white transition text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button
                onClick={handleSignUpClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition text-sm font-medium shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block py-2 text-gray-600 hover:text-[#E63946] transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={handleLoginClick}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E63946] text-[#E63946] rounded-lg hover:bg-[#E63946] hover:text-white transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  onClick={handleSignUpClick}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    handleGuestClick()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
                >
                  <User className="w-4 h-4" />
                  Guest View
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1D3557] text-white">
        {/* Call to Action */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-[#E63946] to-[#C62828] rounded-2xl p-8 text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Ready to Start Your Food Journey?</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover the best restaurants in your city.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignUpClick}
                className="px-8 py-3 bg-white text-[#E63946] rounded-xl font-semibold hover:shadow-xl transition inline-flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Create Account
              </button>
              <button
                onClick={handleGuestClick}
                className="px-8 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition inline-flex items-center justify-center gap-2"
              >
                <Store className="w-5 h-5" />
                Browse as Guest
              </button>
            </div>
          </div>

          {/* Footer Grid - same as before */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🍔</span>
                FoodieX
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Delivering happiness to your doorstep. Order food from the best restaurants in your city.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link to="/restaurants" className="hover:text-white transition">Restaurants</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">For Businesses</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link to="/vendor/register" className="hover:text-white transition">Partner With Us</Link></li>
                <li><Link to="/vendor/login" className="hover:text-white transition">Vendor Login</Link></li>
                <li><Link to="/delivery/register" className="hover:text-white transition">Become a Delivery Partner</Link></li>
                <li><Link to="/delivery/login" className="hover:text-white transition">Delivery Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Contact Info</h4>
              <ul className="space-y-3 text-white/60 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E63946] mt-0.5" />
                  123 Food Street, New Delhi, India
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E63946]" />
                  support@foodiex.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#E63946]" />
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E63946]" />
                  24/7 Customer Support
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-white/40 text-xs">
            <p>© 2024 FoodieX. All rights reserved.</p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}