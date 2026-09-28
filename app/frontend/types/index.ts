export type FlashData = {
  notice?: string
  alert?: string
}

export type CurrentUser = {
  id: number
  email_address: string
}

export type SharedProps = {
  locale: string
  current_user: CurrentUser | null
}
