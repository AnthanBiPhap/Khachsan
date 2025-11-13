/**
 * Ví dụ sử dụng Socket Service trong các controller hoặc service khác
 * 
 * Import socketService:
 * import socketService from '../services/socket.service';
 * 
 * Các cách sử dụng:
 */

// 1. Gửi notification đến user cụ thể
// socketService.sendToUser(userId, 'booking-confirmed', {
//   bookingId: '123',
//   message: 'Đặt phòng thành công'
// });

// 2. Gửi notification đến room (ví dụ: tất cả admin)
// socketService.sendToRoom('role:admin', 'new-booking', {
//   bookingId: '123',
//   customerName: 'Nguyễn Văn A'
// });

// 3. Broadcast đến tất cả users
// socketService.broadcast('system-maintenance', {
//   message: 'Hệ thống sẽ bảo trì từ 2h-4h sáng',
//   startTime: '2024-01-01T02:00:00Z'
// });

// 4. Kiểm tra user có online không
// const isOnline = socketService.isUserOnline(userId);

// 5. Lấy số lượng users online
// const onlineCount = socketService.getOnlineUsersCount();

// 6. Lấy socket instance để sử dụng trực tiếp (nếu cần)
// const io = socketService.getIO();
// if (io) {
//   io.to('room-name').emit('event', data);
// }

