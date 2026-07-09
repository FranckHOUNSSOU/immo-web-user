import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('rg_token') || ''}` } })

export const rolesApi = {
  activer: (role: string, justification?: string) =>
    axios.post(`${BASE}/roles/${role}/activate`, { justification }, auth()).then(r => r.data),

  desactiver: (role: string) =>
    axios.post(`${BASE}/roles/${role}/deactivate`, {}, auth()).then(r => r.data),
}
