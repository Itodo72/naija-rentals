import axios from 'axios'
import Cookies from 'js-cookie'

const client = axios.create({ baseURL: '' })

client.interceptors.request.use((config) => {
  const token = Cookies.get('nr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('nr_token')
      Cookies.remove('nr_user')
      if (typeof window !== 'undefined') window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const api = {
  auth: {
    register: (d: Record<string, string>) => client.post('/api/auth/register', d),
    login: (email: string, password: string) => client.post('/api/auth/login', { email, password }),
  },
  listings: {
    browse: (params?: Record<string, string | number>) => client.get('/api/listings', { params }),
    create: (d: Record<string, string | number | boolean>) => client.post('/api/listings', d),
  },
  payments: {
    breakdown: (listingId: string) => client.get('/api/payments?listingId=' + listingId),
    initiate:  (listingId: string) => client.post('/api/payments', { listingId }),
  },
}

export default api
