/**
 * Canaux de messagerie suivis par le graphique « Taux de réponse par canal ».
 * `type` correspond à la valeur de la colonne `historyentries.type` côté DB.
 */
export interface Channel {
  key: string
  type: string
  label: string
  color: string
}

export const CHANNELS: readonly Channel[] = [
  { key: 'email', type: 'EMAIL_SENT', label: 'Email', color: '#3f51b6' },
  { key: 'message', type: 'LINKEDIN_MESSAGE_SENT', label: 'Message LinkedIn', color: '#139BE3' },
  { key: 'inmail', type: 'LINKEDIN_INMAIL_SENT', label: 'LinkedIn InMail', color: '#0A66C2' }
] as const
