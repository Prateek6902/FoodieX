// src/contexts/CartContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'

export interface CartItem {
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  restaurant_id: string
  restaurant_name: string
  total_price: number
  is_veg?: boolean
  image?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, change: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
  isInCart: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'customer_cart'

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
        }
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e)
        setCartItems([])
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(c => c.product_id === item.product_id)
      if (existingItem) {
        // If item exists, update quantity
        return prevItems.map(c =>
          c.product_id === item.product_id
            ? { 
                ...c, 
                quantity: c.quantity + item.quantity, 
                total_price: (c.quantity + item.quantity) * c.unit_price 
              }
            : c
        )
      }
      // Add new item
      return [...prevItems, item]
    })
    toast.success(`${item.product_name} added to cart`)
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => {
      const item = prevItems.find(c => c.product_id === productId)
      if (item) {
        toast.success(`${item.product_name} removed from cart`)
      }
      return prevItems.filter(c => c.product_id !== productId)
    })
  }

  const updateQuantity = (productId: string, change: number) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(c => {
        if (c.product_id === productId) {
          const newQuantity = c.quantity + change
          if (newQuantity <= 0) {
            return null // Will be filtered out
          }
          return { ...c, quantity: newQuantity, total_price: newQuantity * c.unit_price }
        }
        return c
      }).filter((item): item is CartItem => item !== null)
      
      return updatedItems
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
    toast.success('Cart cleared')
  }

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.product_id === productId)
  }

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(c => c.product_id === productId)
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemCount,
      isInCart,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}