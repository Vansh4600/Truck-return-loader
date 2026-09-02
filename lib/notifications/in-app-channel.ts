/**
 * In-app notification channel — persists notifications to the
 * `notifications` table via Supabase. This is the only channel enabled in
 * the MVP. Future channels (email/SMS/WhatsApp/push) should implement
 * `NotificationChannel` and be added to a multiplexing dispatcher.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationChannel, SendNotificationInput } from './provider';

export class InAppNotificationChannel implements NotificationChannel {
  constructor(private readonly supabase: SupabaseClient) {}

  async send(input: SendNotificationInput): Promise<void> {
    const { error } = await this.supabase.from('notifications').insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata ?? {},
    });
    if (error) {
      // Notifications are best-effort; log but never break the primary flow.
      console.error('Failed to persist notification:', error.message);
    }
  }
}

export function getNotificationChannel(supabase: SupabaseClient): NotificationChannel {
  return new InAppNotificationChannel(supabase);
}
