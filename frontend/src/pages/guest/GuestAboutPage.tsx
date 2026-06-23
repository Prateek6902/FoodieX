// pages/guest/GuestAboutPage.tsx

import { motion } from 'framer-motion'
import { 
  Users, Award, Shield, Clock, 
  Heart, Star, Truck, Coffee,
  Globe, Zap, Sparkles, Crown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const GuestAboutPage = () => {
  const navigate = useNavigate()

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-[#E63946]" />,
      title: 'Customer First',
      description: 'We prioritize your satisfaction and strive to deliver the best experience.'
    },
    {
      icon: <Shield className="w-8 h-8 text-[#E63946]" />,
      title: 'Quality Assurance',
      description: 'Every restaurant is vetted and every order is quality-checked.'
    },
    {
      icon: <Clock className="w-8 h-8 text-[#E63946]" />,
      title: 'Timely Delivery',
      description: 'We understand the value of time and deliver within promised time.'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-[#E63946]" />,
      title: 'Innovation',
      description: 'Constantly evolving to bring you the best food delivery experience.'
    }
  ]

  const teamMembers = [
    { name: 'Aarav Sharma', role: 'CEO & Founder', image: '👨‍💼' },
    { name: 'Priya Patel', role: 'Head of Operations', image: '👩‍💼' },
    { name: 'Vikram Singh', role: 'CTO', image: '👨‍💻' },
    { name: 'Neha Gupta', role: 'Head of Marketing', image: '👩‍💻' },
  ]

  const milestones = [
    { year: '2022', title: 'Founded', description: 'Started with a vision to revolutionize food delivery' },
    { year: '2023', title: '500+ Restaurants', description: 'Reached 500+ restaurant partners across India' },
    { year: '2024', title: '10K+ Daily Orders', description: 'Serving over 10,000 orders every day' },
    { year: '2025', title: '50+ Cities', description: 'Expanded to 50+ cities across the country' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About FoodieX</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              We're on a mission to connect people with the best food experiences, 
              one delivery at a time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              FoodieX was born from a simple idea: food brings people together. 
              Founded in 2022, we started with a small team passionate about 
              connecting food lovers with the best restaurants in their city.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Today, we've grown into a platform that serves thousands of customers 
              daily, partnering with hundreds of restaurants and delivery partners 
              across India.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our commitment to quality, speed, and customer satisfaction has made 
              us one of the fastest-growing food delivery platforms in the country.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="mt-6 px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition font-medium"
            >
              Join Our Journey
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">🍔</div>
              <p className="text-2xl font-bold text-[#1D3557]">500+</p>
              <p className="text-sm text-gray-500">Restaurants</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">🚀</div>
              <p className="text-2xl font-bold text-[#1D3557]">10K+</p>
              <p className="text-sm text-gray-500">Daily Orders</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-2xl font-bold text-[#1D3557]">4.8</p>
              <p className="text-sm text-gray-500">Avg Rating</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">🌍</div>
              <p className="text-2xl font-bold text-[#1D3557]">50+</p>
              <p className="text-sm text-gray-500">Cities</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Our Values</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl hover:bg-gray-50 transition group"
              >
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{value.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Our Journey</h2>
          <p className="text-center text-gray-500 mb-12">Key milestones in our growth</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
              >
                <div className="text-3xl font-bold text-[#E63946]">{milestone.year}</div>
                <h3 className="font-semibold text-gray-800 mt-2">{milestone.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Meet the Team</h2>
          <p className="text-center text-gray-500 mb-12">The people behind FoodieX</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl mb-3">{member.image}</div>
                <h3 className="font-semibold text-gray-800">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Become Part of Our Story</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join us in our mission to deliver happiness, one meal at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-[#E63946] text-white rounded-xl font-semibold hover:bg-[#C62828] transition"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}