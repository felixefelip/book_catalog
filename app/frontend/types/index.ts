export type FlashData = {
  notice?: string
  alert?: string
}

export type CurrentUser = {
  id: number
  name: string
  last_name: string
  email_address: string
}

export type SharedProps = {
  locale: string
  current_user: CurrentUser | null
}
