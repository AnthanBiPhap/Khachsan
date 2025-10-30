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
  guests?: Array<{ dateOfBirth?: Date | string }>
) => {
  let customerBirthday: Date | null = null;

  // Ưu tiên lấy ngày sinh từ guests (thông tin từ form đặt phòng)
  if (guests && guests.length > 0) {
    const mainGuest = guests.find((g) => (g as any).isMainGuest) || guests[0];
    if (mainGuest && mainGuest.dateOfBirth) {
      customerBirthday = new Date(mainGuest.dateOfBirth);
      console.log(`🎂 Using dateOfBirth from guests:`, {
        guestName: mainGuest.fullName || 'Unknown',
        dateOfBirth: mainGuest.dateOfBirth,
        parsedDate: customerBirthday.toISOString()
      });
    }
  }

  // Nếu không có guests, mới lấy từ customerId (user database)
  if (!customerBirthday && customerId) {
    const customer = await User.findById(customerId).select('dateOfBirth');
    if (customer && customer.dateOfBirth) {
      customerBirthday = new Date(customer.dateOfBirth);
      console.log(`🎂 Using dateOfBirth from customerId:`, {
        customerId,
        dateOfBirth: customer.dateOfBirth,
        parsedDate: customerBirthday.toISOString()
      });
    }
  }

  // Nếu không có ngày sinh, tính giá bình thường
  if (!customerBirthday) {
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;
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
  const currentDate = new Date(checkIn);
  currentDate.setUTCHours(0, 0, 0, 0); // Đặt về đầu ngày UTC

  const endDate = new Date(checkOut);
  endDate.setUTCHours(0, 0, 0, 0);

  // Lấy MM-DD từ ngày sinh
  const birthdayDate = new Date(customerBirthday);
  const birthdayMonth = String(birthdayDate.getUTCMonth() + 1).padStart(2, '0');
  const birthdayDay = String(birthdayDate.getUTCDate()).padStart(2, '0');
  const birthdayStr = `${birthdayMonth}-${birthdayDay}`;
  
  console.log(`🎂 Birthday info:`, {
    customerBirthday,
    birthdayDate: birthdayDate.toISOString(),
    birthdayMonth,
    birthdayDay,
    birthdayStr
  });

  while (currentDate < endDate) {
    // Lấy MM-DD từ ngày hiện tại
    const currentMonth = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const currentDay = String(currentDate.getUTCDate()).padStart(2, '0');
    const currentStr = `${currentMonth}-${currentDay}`;

    // Kiểm tra xem ngày này có trùng với ngày sinh không (chỉ so sánh MM-DD, không quan tâm năm)
    const isBirthday = currentStr === birthdayStr;
    
    console.log(`🎂 Checking date:`, {
      currentDate: currentDate.toISOString(),
      currentMonth,
      currentDay,
      currentStr,
      birthdayStr,
      isBirthday
    });
    
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

  return {
    totalPrice,
    breakdown,
    discountApplied,
    discountAmount
  };
};

