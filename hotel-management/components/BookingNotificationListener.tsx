'use client';

import { useBookingNotifications } from '@/hooks/useBookingNotifications';

export default function BookingNotificationListener() {
  // Hook này sẽ tự động lắng nghe socket notifications
  useBookingNotifications();
  
  // Component này không render gì, chỉ để chạy hook
  return null;
}

