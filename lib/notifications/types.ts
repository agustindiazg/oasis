export interface NotificationProvider {
  sendEmail(input: { to: string; subject: string; html: string }): Promise<{ id: string }>;
}
