export interface DashboardUser {
  id: number
  username: string
  email: string
  account_type: string
  is_verified: boolean
  date_joined: string
}

export interface AccountDetails {
  username: string
  email: string
  status: 'active' | 'pending' | 'inactive'
  cameras_assigned: number
  last_login: string
}