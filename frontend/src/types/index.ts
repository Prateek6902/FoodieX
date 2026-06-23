export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  mobile_number: string
  role: string
  profile_picture?: string
  is_verified: boolean
  created_at: string
}

export interface Restaurant {
  id: string
  name: string
  description: string
  cuisine_type: string
  city: string
  state: string
  rating: number
  total_reviews: number
  is_open_now: boolean
  logo?: string
  cover_image?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  compare_at_price?: number
  image?: string
  is_veg: boolean
  is_available: boolean
  stock_quantity: number
  rating: number
}

export interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  estimated_delivery_time?: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Vendor {
  id: string
  business_name: string
  city: string
  state: string
  rating: number
  total_orders: number
  total_revenue: number
  status: string
}

export interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  status: string
  created_at: string
  due_date: string
}