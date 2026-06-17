export interface Channel {
  key: string
  type: string
  label: string
  color: string
}

enum EMessageType {
  EmailSent = 'EMAIL_SENT',
  LinkedInMessageSent = 'LINKEDIN_MESSAGE_SENT',
  LinkedInInMailSent = 'LINKEDIN_INMAIL_SENT'
  // others not needed for this demo project
}

export const CHANNELS: readonly Channel[] = [
  { key: 'email', type: EMessageType.EmailSent, label: 'Email', color: '#3f51b6' },
  { key: 'message', type: EMessageType.LinkedInMessageSent, label: 'Message LinkedIn', color: '#139BE3' },
  { key: 'inmail', type: EMessageType.LinkedInInMailSent, label: 'LinkedIn InMail', color: '#0A66C2' }
] as const
