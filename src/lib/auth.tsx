'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { api } from './api'

interface User {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
  role: string
}

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (data: Record<string, string>) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = Cookies.get('nr_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.login(email, password)
      const { token, user: u } = res.data.data
      Cookies.set('nr_token', token, { expires: 7 })
      Cookies.set('nr_user', JSON.stringify(u), { expires: 7 })
      setUser(u)
      return { success: true, message: res.data.message }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      return { success: false, message: err?.response?.data?.message || 'Login failed' }
    }
  }

  const register = async (data: Record<string, string>) => {
    try {
      const res = await api.auth.register(data)
      const { token, user: u } = res.data.data
      Cookies.set('nr_token', token, { expires: 7 })
      Cookies.set('nr_user', JSON.stringify(u), { expires: 7 })
      setUser(u)
      return { success: true, message: res.data.message }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      return { success: false, message: err?.response?.data?.message || 'Registration failed' }
    }
  }

  const logout = () => {
    Cookies.remove('nr_token')
    Cookies.remove('nr_user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
