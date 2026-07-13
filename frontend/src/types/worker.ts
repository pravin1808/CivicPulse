import type { User } from './user'

export interface Worker extends User {
  phoneNumber: string
  address: string
  deptId: number
}
