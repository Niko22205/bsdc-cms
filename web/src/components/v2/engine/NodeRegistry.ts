// Navigation anchor points — approximate t values where camera is near each concept.
// These are NOT sections. They are loose scroll positions for nav dots only.

export interface MapNode {
  id:    string
  at:    number
  label: { bg: string; en: string }
}

export const NODE_MAP: MapNode[] = [
  { id: 'hero',     at: 0.00, label: { bg: 'Начало',  en: 'Home'     } },
  { id: 'about',    at: 0.22, label: { bg: 'За нас',  en: 'About'    } },
  { id: 'services', at: 0.50, label: { bg: 'Услуги',  en: 'Services' } },
  { id: 'contact',  at: 0.85, label: { bg: 'Контакт', en: 'Contact'  } },
]
