import User from "../models/users.model";

/**
 * Tính giá phòng với logic giảm giá sinh nhật
 * Nếu có ngày trong khoảng thời gian đặt phòng trùng với ngày sinh của khách hàng, giảm 50% giá cho ngày đó
 * 
 * @param pricePerNight - Giá phòng mỗi đêm
 * @param checkIn - Ngày check-in
 * @param checkOut - Ngày check-out
 * @param customerId - ID khách hàng (optional)
 * @param guests - Mảng khách hàng với dateOfBirth (optional)
 * @returns { totalPrice, breakdown, discountApplied }
 */
export const calculateRoomPriceWithBirthdayDiscount = async (
  pricePerNight: number,
  checkIn: Date,
  checkOut: Date,
  customerId?: string,
  guests?: Array<{ dateOfBirth?: Date | string; fullName?: string; isMainGuest?: boolean }>
) => {
  let customerBirthday: Date | null = null;

  // Ưu tiên lấy ngày sinh từ guests (thông tin từ form đặt phòng)
  if (guests && guests.length > 0) {
    const mainGuest = guests.find((g) => (g as any).isMainGuest) || guests[0];
    if (mainGuest && mainGuest.dateOfBirth) {
      customerBirthday = new Date(mainGuest.dateOfBirth);
      // Chỉ log khi debug (có thể bật/tắt bằng env variable)
      if (process.env.DEBUG_PRICING === 'true') {
        console.log(`🎂 Using dateOfBirth from guests:`, {
          guestName: mainGuest.fullName || 'Unknown',
          dateOfBirth: mainGuest.dateOfBirth,
          parsedDate: customerBirthday.toISOString()
        });
      }
    }
  }

  // Nếu không có guests, mới lấy từ customerId (user database)
  if (!customerBirthday && customerId) {
    const customer = await User.findById(customerId).select('dateOfBirth');
    if (customer && customer.dateOfBirth) {
      customerBirthday = new Date(customer.dateOfBirth);
      // Chỉ log khi debug
      if (process.env.DEBUG_PRICING === 'true') {
        console.log(`🎂 Using dateOfBirth from customerId:`, {
          customerId,
          dateOfBirth: customer.dateOfBirth,
          parsedDate: customerBirthday.toISOString()
        });
      }
    }
  }

  // Nếu không có ngày sinh, tính giá bình thường (dựa trên số đêm thực tế, không làm tròn lên)
  if (!customerBirthday) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const checkInDate = new Date(checkIn);
    checkInDate.setUTCHours(0, 0, 0, 0);
    const checkOutDate = new Date(checkOut);
    checkOutDate.setUTCHours(0, 0, 0, 0);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.floor(diffMs / MS_PER_DAY));
    return {
      totalPrice: nights * pricePerNight,
      breakdown: [],
      discountApplied: false,
      discountAmount: 0
    };
  }

  // Tính từng ngày trong khoảng thời gian
  const breakdown: Array<{ date: Date, price: number, isBirthday: boolean }> = [];
  let totalPrice = 0;
  let discountApplied = false;
  let discountAmount = 0;

  // Sử dụng UTC để đảm bảo tính đúng ngày
  const checkInDate = new Date(checkIn);
  checkInDate.setUTCHours(0, 0, 0, 0); // Đặt về đầu ngày UTC

  const checkOutDate = new Date(checkOut);
  checkOutDate.setUTCHours(0, 0, 0, 0);

  // Lấy MM-DD từ ngày sinh
  const birthdayDate = new Date(customerBirthday);
  const birthdayMonth = String(birthdayDate.getUTCMonth() + 1).padStart(2, '0');
  const birthdayDay = String(birthdayDate.getUTCDate()).padStart(2, '0');
  const birthdayStr = `${birthdayMonth}-${birthdayDay}`;
  
  // Lấy MM-DD từ ngày check-in và check-out
  const checkInMonth = String(checkInDate.getUTCMonth() + 1).padStart(2, '0');
  const checkInDay = String(checkInDate.getUTCDate()).padStart(2, '0');
  const checkInStr = `${checkInMonth}-${checkInDay}`;
  
  const checkOutMonth = String(checkOutDate.getUTCMonth() + 1).padStart(2, '0');
  const checkOutDay = String(checkOutDate.getUTCDate()).padStart(2, '0');
  const checkOutStr = `${checkOutMonth}-${checkOutDay}`;
  
  // Chỉ log khi debug
  if (process.env.DEBUG_PRICING === 'true') {
    console.log(`🎂 Birthday info:`, {
      customerBirthday,
      birthdayDate: birthdayDate.toISOString(),
      birthdayMonth,
      birthdayDay,
      birthdayStr,
      checkInStr,
      checkOutStr
    });
  }

  // Tính từng ngày trong khoảng thời gian (từ check-in đến trước check-out)
  const currentDate = new Date(checkInDate);
  while (currentDate < checkOutDate) {
    // Lấy MM-DD từ ngày hiện tại
    const currentMonth = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const currentDay = String(currentDate.getUTCDate()).padStart(2, '0');
    const currentStr = `${currentMonth}-${currentDay}`;

    // Kiểm tra xem ngày này có trùng với ngày sinh không (chỉ so sánh MM-DD, không quan tâm năm)
    const isBirthday = currentStr === birthdayStr;
    
    // Chỉ log khi debug và khi là ngày sinh nhật
    if (process.env.DEBUG_PRICING === 'true' && isBirthday) {
      console.log(`🎂 Birthday match found:`, {
        currentDate: currentDate.toISOString(),
        currentStr,
        birthdayStr,
        isBirthday
      });
    }
    
    let price = pricePerNight;
    if (isBirthday) {
      price = pricePerNight * 0.5; // Giảm 50%
      discountApplied = true;
      discountAmount += pricePerNight * 0.5;
    }

    breakdown.push({
      date: new Date(currentDate),
      price,
      isBirthday
    });

    totalPrice += price;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Chuyển sang ngày tiếp theo
  }
  
  // Kiểm tra riêng ngày check-out nếu chưa được xử lý trong vòng lặp
  // (khi check-in và check-out khác ngày và ngày check-out trùng với ngày sinh)
  if (checkInStr !== checkOutStr && checkOutStr === birthdayStr) {
    // Ngày check-out trùng với ngày sinh, áp dụng giảm giá
    const price = pricePerNight * 0.5; // Giảm 50%
    discountApplied = true;
    discountAmount += pricePerNight * 0.5;
    totalPrice += price;
    
    breakdown.push({
      date: new Date(checkOutDate),
      price,
      isBirthday: true
    });
    
    if (process.env.DEBUG_PRICING === 'true') {
      console.log(`🎂 Birthday match found on check-out date:`, {
        checkOutDate: checkOutDate.toISOString(),
        checkOutStr,
        birthdayStr
      });
    }
  }
  
  // Xử lý trường hợp check-in và check-out cùng ngày và trùng với ngày sinh
  if (checkInStr === checkOutStr && checkInStr === birthdayStr) {
    // Nếu đã có trong breakdown thì không cần thêm, nhưng nếu vòng lặp không chạy (cùng ngày) thì cần thêm
    const alreadyProcessed = breakdown.some(item => {
      const itemMonth = String(item.date.getUTCMonth() + 1).padStart(2, '0');
      const itemDay = String(item.date.getUTCDate()).padStart(2, '0');
      return `${itemMonth}-${itemDay}` === checkInStr;
    });
    
    if (!alreadyProcessed) {
      const price = pricePerNight * 0.5; // Giảm 50%
      discountApplied = true;
      discountAmount += pricePerNight * 0.5;
      totalPrice += price;
      
      breakdown.push({
        date: new Date(checkInDate),
        price,
        isBirthday: true
      });
      
      if (process.env.DEBUG_PRICING === 'true') {
        console.log(`🎂 Birthday match found on same check-in/check-out date:`, {
          checkInDate: checkInDate.toISOString(),
          checkInStr,
          birthdayStr
        });
      }
    }
  }

  return {
    totalPrice,
    breakdown,
    discountApplied,
    discountAmount
  };
};

