import { Button, Dropdown, message, Modal, DatePicker, Space, Typography, Radio, Select } from "antd";
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, CalendarOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useState } from "react";
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Booking } from "../../types/booking";

interface ExportButtonProps {
  bookings: Booking[];
  statistics: {
    totalBookings: number;
    currentGuests: number;
    todayRevenue: number;
    monthRevenue: number;
    pendingBookings: number;
    paidBookings: number;
  };
}

export default function ExportButton({ bookings }: Omit<ExportButtonProps, 'statistics'>) {
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [pendingExportType, setPendingExportType] = useState<'excel' | 'pdf' | null>(null);
  const [dateRangeType, setDateRangeType] = useState<'custom' | 'month' | 'year'>('custom');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [includeAnalysis, setIncludeAnalysis] = useState<boolean>(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Function để loại bỏ dấu tiếng Việt
  const removeVietnameseAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  // Function để lọc dữ liệu theo ngày đặt phòng (checkIn)
  const getFilteredBookings = (startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs) => {
    if (!startDate && !endDate) return bookings;
    
    return bookings.filter(booking => {
      // Sử dụng ngày đặt phòng (checkIn) thay vì ngày tạo booking (createdAt)
      const bookingDate = dayjs(booking.checkIn);
      
      if (startDate && endDate) {
        // Kiểm tra ngày đặt phòng có nằm trong khoảng thời gian không
        const isAfterStart = bookingDate.isAfter(startDate) || bookingDate.isSame(startDate, 'day');
        const isBeforeEnd = bookingDate.isBefore(endDate) || bookingDate.isSame(endDate, 'day');
        return isAfterStart && isBeforeEnd;
      } else if (startDate) {
        return bookingDate.isAfter(startDate) || bookingDate.isSame(startDate, 'day');
      } else if (endDate) {
        return bookingDate.isBefore(endDate) || bookingDate.isSame(endDate, 'day');
      }
      
      return true;
    });
  };

  // Function để tính thống kê theo dữ liệu đã lọc
  const calculateFilteredStatistics = (filteredBookings: Booking[], dateRangeType?: string, selectedMonth?: number, selectedYear?: number) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const totalBookings = filteredBookings.length;
    let currentGuests = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;
    let pendingBookings = 0;
    let paidBookings = 0;

    // Xác định khoảng thời gian để tính doanh thu
    let targetMonthStart: Date;
    let targetMonthEnd: Date;
    
    if (dateRangeType === 'month' && selectedMonth && selectedYear) {
      // Tính doanh thu của tháng được chọn
      targetMonthStart = new Date(selectedYear, selectedMonth - 1, 1);
      targetMonthEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
    } else if (dateRangeType === 'year' && selectedYear) {
      // Tính doanh thu của năm được chọn
      targetMonthStart = new Date(selectedYear, 0, 1);
      targetMonthEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
    } else if (dateRangeType === 'custom' && dateRange[0] && dateRange[1]) {
      // Tính doanh thu của khoảng thời gian tùy chọn
      targetMonthStart = dateRange[0].toDate();
      targetMonthEnd = dateRange[1].toDate();
    } else {
      // Tính doanh thu của tháng hiện tại
      targetMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      targetMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    filteredBookings.forEach(booking => {
      // Tính khách đang ở (check-in <= hôm nay < check-out)
      const checkIn = new Date(booking.checkIn || '');
      const checkOut = new Date(booking.checkOut || '');
      
      if (checkIn <= now && now < checkOut) {
        currentGuests += booking.guestCount || booking.guests?.length || 0;
      }

      // Tính doanh thu hôm nay (dựa trên ngày đặt phòng)
      const checkInDate = new Date(booking.checkIn || '');
      if (checkInDate >= today && booking.paymentStatus === 'paid') {
        todayRevenue += Number(booking.totalPrice) || 0;
      }

      // Tính doanh thu theo tháng được chọn (dựa trên ngày đặt phòng)
      if (checkInDate >= targetMonthStart && checkInDate <= targetMonthEnd && booking.paymentStatus === 'paid') {
        monthRevenue += Number(booking.totalPrice) || 0;
      }

      // Đếm trạng thái thanh toán
      if (booking.paymentStatus === 'pending') {
        pendingBookings++;
      } else if (booking.paymentStatus === 'paid') {
        paidBookings++;
      }
    });

    return {
      totalBookings,
      currentGuests,
      todayRevenue,
      monthRevenue,
      pendingBookings,
      paidBookings
    };
  };

  // Function để lấy dữ liệu thống kê đã lọc
  const getFilteredStatisticsData = (filteredStats: {
    totalBookings: number;
    currentGuests: number;
    todayRevenue: number;
    monthRevenue: number;
    pendingBookings: number;
    paidBookings: number;
  }) => {
    // Xác định label cho doanh thu
    let revenueLabel = 'Doanh thu tháng này';
    if (dateRangeType === 'month' && selectedMonth && selectedYear) {
      revenueLabel = `Doanh thu tháng ${selectedMonth}/${selectedYear}`;
    } else if (dateRangeType === 'year' && selectedYear) {
      revenueLabel = `Doanh thu năm ${selectedYear}`;
    } else if (dateRangeType === 'custom' && dateRange[0] && dateRange[1]) {
      revenueLabel = `Doanh thu từ ${dateRange[0].format('DD/MM/YYYY')} đến ${dateRange[1].format('DD/MM/YYYY')}`;
    }

    return [
      [removeVietnameseAccents('Tổng đặt phòng'), filteredStats.totalBookings],
      [removeVietnameseAccents('Khách đang ở'), filteredStats.currentGuests],
      [removeVietnameseAccents('Chờ thanh toán'), filteredStats.pendingBookings],
      [removeVietnameseAccents('Đã thanh toán'), filteredStats.paidBookings],
      [removeVietnameseAccents('Tỷ lệ thanh toán'), `${((filteredStats.paidBookings / filteredStats.totalBookings) * 100).toFixed(1)}%`],
      [removeVietnameseAccents('Doanh thu hôm nay'), formatCurrency(filteredStats.todayRevenue)],
      [removeVietnameseAccents(revenueLabel), formatCurrency(filteredStats.monthRevenue)],
      [removeVietnameseAccents('Trung bình/booking'), formatCurrency(filteredStats.totalBookings > 0 ? filteredStats.monthRevenue / filteredStats.totalBookings : 0)]
    ];
  };

  // Function để tính toán phân tích nhu cầu khách hàng
  const getCustomerAnalysis = (filteredBookings: Booking[]) => {
    const analysis = {
      totalBookings: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
      averageBookingValue: 0,
      customerTypes: {
        online: 0,
        walkIn: 0
      },
      paymentStatus: {
        pending: 0,
        paid: 0,
        failed: 0,
        refunded: 0
      },
      roomPreferences: {} as Record<string, number>,
      guestCountDistribution: {} as Record<number, number>,
      peakDays: {} as Record<string, number>,
      revenueByMonth: {} as Record<string, number>
    };

    // Tính toán các chỉ số
    filteredBookings.forEach(booking => {
      // Loại khách hàng
      if (booking.source === 'online') {
        analysis.customerTypes.online++;
      } else {
        analysis.customerTypes.walkIn++;
      }

      // Trạng thái thanh toán
      if (booking.paymentStatus) {
        analysis.paymentStatus[booking.paymentStatus as keyof typeof analysis.paymentStatus]++;
      }

      // Phòng ưa thích
      const roomNumber = (booking.roomId as { roomNumber?: string })?.roomNumber || 'Unknown';
      analysis.roomPreferences[roomNumber] = (analysis.roomPreferences[roomNumber] || 0) + 1;

      // Phân bố số khách
      const guestCount = booking.guestCount || booking.guests?.length || 0;
      analysis.guestCountDistribution[guestCount] = (analysis.guestCountDistribution[guestCount] || 0) + 1;

      // Ngày cao điểm
      const dayOfWeek = dayjs(booking.createdAt).format('dddd');
      analysis.peakDays[dayOfWeek] = (analysis.peakDays[dayOfWeek] || 0) + 1;

      // Doanh thu theo tháng
      const month = dayjs(booking.createdAt).format('YYYY-MM');
      analysis.revenueByMonth[month] = (analysis.revenueByMonth[month] || 0) + (booking.totalPrice || 0);
    });

    // Tính trung bình
    analysis.averageBookingValue = analysis.totalBookings > 0 ? analysis.totalRevenue / analysis.totalBookings : 0;

    return analysis;
  };

  const getBookingData = (filteredBookings?: Booking[]) => {
    const dataToUse = filteredBookings || bookings;
    return dataToUse.map(booking => {
      const mainGuest = booking.guests?.find(guest => guest.isMainGuest) || booking.guests?.[0];
      const customerName = booking.customerId?.fullName || mainGuest?.fullName || '-';
      const customerContact = booking.customerId?.email || booking.customerId?.phoneNumber || mainGuest?.phoneNumber || '';
      
      return {
        'Mã Booking': booking._id,
        'Khách hàng': customerName,
        'Liên hệ': customerContact,
        'Phòng': (booking.roomId as { roomNumber?: string })?.roomNumber || '-',
        'Ngày nhận': booking.checkIn ? formatDate(booking.checkIn) : '-',
        'Ngày trả': booking.checkOut ? formatDate(booking.checkOut) : '-',
        'Số khách': booking.guestCount || booking.guests?.length || 0,
        'Tổng tiền': booking.totalPrice || 0,
        'Trạng thái thanh toán': booking.paymentStatus || '-',
        'Nguồn': booking.source === 'online' ? 'Online' : 'Walk-in',
        'Ghi chú': booking.notes || '-',
        'Ngày tạo': booking.createdAt ? formatDate(booking.createdAt) : '-'
      };
    });
  };


  const exportToExcel = (filteredBookings?: Booking[]) => {
    try {
      const dataToUse = filteredBookings || bookings;
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Danh sách Booking
      const ws = XLSX.utils.json_to_sheet(getBookingData(dataToUse));
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách Booking');
      
      // Sheet 2: Thống kê (tính theo dữ liệu đã lọc)
      const filteredStats = calculateFilteredStatistics(dataToUse, dateRangeType, selectedMonth, selectedYear);
      const statsWs = XLSX.utils.aoa_to_sheet([
        ['BÁO CÁO THỐNG KÊ BOOKING'],
        [''],
        ...getFilteredStatisticsData(filteredStats)
      ]);
      XLSX.utils.book_append_sheet(wb, statsWs, 'Thống kê');
      
      // Sheet 3: Phân tích nhu cầu khách hàng (nếu được chọn)
      if (includeAnalysis) {
        const analysis = getCustomerAnalysis(dataToUse);
        const analysisData = [
          ['PHÂN TÍCH NHU CẦU KHÁCH HÀNG'],
          [''],
          ['TỔNG QUAN'],
          ['Tổng số booking', analysis.totalBookings],
          ['Tổng doanh thu', formatCurrency(analysis.totalRevenue)],
          ['Giá trị trung bình/booking', formatCurrency(analysis.averageBookingValue)],
          [''],
          ['LOẠI KHÁCH HÀNG'],
          ['Online', analysis.customerTypes.online],
          ['Walk-in', analysis.customerTypes.walkIn],
          [''],
          ['TRẠNG THÁI THANH TOÁN'],
          ['Chờ thanh toán', analysis.paymentStatus.pending],
          ['Đã thanh toán', analysis.paymentStatus.paid],
          ['Thất bại', analysis.paymentStatus.failed],
          ['Đã hoàn tiền', analysis.paymentStatus.refunded],
          [''],
          ['PHÒNG ƯA THÍCH'],
          ...Object.entries(analysis.roomPreferences).map(([room, count]) => [room, count]),
          [''],
          ['PHÂN BỐ SỐ KHÁCH'],
          ...Object.entries(analysis.guestCountDistribution).map(([guests, count]) => [`${guests} khách`, count]),
          [''],
          ['NGÀY CAO ĐIỂM'],
          ...Object.entries(analysis.peakDays).map(([day, count]) => [day, count]),
          [''],
          ['DOANH THU THEO THÁNG'],
          ...Object.entries(analysis.revenueByMonth).map(([month, revenue]) => [month, formatCurrency(revenue)])
        ];
        const analysisWs = XLSX.utils.aoa_to_sheet(analysisData);
        XLSX.utils.book_append_sheet(wb, analysisWs, 'Phân tích khách hàng');
      }
      
      const dateSuffix = filteredBookings ? `-${dateRange[0]?.format('YYYY-MM-DD')}-${dateRange[1]?.format('YYYY-MM-DD')}` : '';
      XLSX.writeFile(wb, `booking-report${dateSuffix}-${new Date().toISOString().split('T')[0]}.xlsx`);
      message.success('Xuất Excel thành công!');
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Xuất Excel thất bại!');
    }
  };


  const exportToPDF = (filteredBookings?: Booking[]) => {
    try {
      const doc = new jsPDF();
      const dataToUse = filteredBookings || bookings;
      const filteredStats = calculateFilteredStatistics(dataToUse, dateRangeType, selectedMonth, selectedYear);
      
      // Tiêu đề
      doc.setFontSize(20);
      doc.text(removeVietnameseAccents('BÁO CÁO BOOKING'), 14, 22);
      
      // Thông tin thống kê
      doc.setFontSize(12);
      doc.text(`${removeVietnameseAccents('Ngày xuất')}: ${new Date().toLocaleDateString('vi-VN')}`, 14, 35);
      doc.text(`${removeVietnameseAccents('Tổng số booking')}: ${dataToUse.length}`, 14, 45);
      doc.text(`${removeVietnameseAccents('Khách đang ở')}: ${filteredStats.currentGuests}`, 14, 55);
      
      // Xác định label cho doanh thu
      let revenueLabel = 'Doanh thu tháng này';
      if (dateRangeType === 'month' && selectedMonth && selectedYear) {
        revenueLabel = `Doanh thu tháng ${selectedMonth}/${selectedYear}`;
      } else if (dateRangeType === 'year' && selectedYear) {
        revenueLabel = `Doanh thu năm ${selectedYear}`;
      } else if (dateRangeType === 'custom' && dateRange[0] && dateRange[1]) {
        revenueLabel = `Doanh thu từ ${dateRange[0].format('DD/MM/YYYY')} đến ${dateRange[1].format('DD/MM/YYYY')}`;
      }
      doc.text(`${removeVietnameseAccents(revenueLabel)}: ${formatCurrency(filteredStats.monthRevenue)}`, 14, 65);
      
      // Bảng dữ liệu
      const tableData = dataToUse.map(booking => {
        const mainGuest = booking.guests?.find(guest => guest.isMainGuest) || booking.guests?.[0];
        const customerName = booking.customerId?.fullName || mainGuest?.fullName || '-';
        
        return [
          booking._id.substring(0, 8) + '...',
          customerName,
          (booking.roomId as { roomNumber?: string })?.roomNumber || '-',
          booking.checkIn ? formatDate(booking.checkIn) : '-',
          booking.checkOut ? formatDate(booking.checkOut) : '-',
          booking.guestCount || booking.guests?.length || 0,
          formatCurrency(booking.totalPrice || 0),
          booking.paymentStatus || '-'
        ];
      });

      autoTable(doc, {
        startY: 80,
        head: [[
          removeVietnameseAccents('Mã'), 
          removeVietnameseAccents('Khách hàng'), 
          removeVietnameseAccents('Phòng'), 
          removeVietnameseAccents('Nhận'), 
          removeVietnameseAccents('Trả'), 
          removeVietnameseAccents('Số khách'), 
          removeVietnameseAccents('Tổng tiền'), 
          removeVietnameseAccents('Trạng thái')
        ]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [24, 144, 255] },
        margin: { top: 80 }
      });

      // Thống kê chi tiết
      doc.setFontSize(14);
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
      doc.text(removeVietnameseAccents('THỐNG KÊ CHI TIẾT'), 14, finalY + 20);
      
      autoTable(doc, {
        startY: finalY + 25,
        head: [[removeVietnameseAccents('Chỉ số'), removeVietnameseAccents('Giá trị')]],
        body: getFilteredStatisticsData(filteredStats),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [82, 196, 26] }
      });

      const dateSuffix = filteredBookings ? `-${dateRange[0]?.format('YYYY-MM-DD')}-${dateRange[1]?.format('YYYY-MM-DD')}` : '';
      doc.save(`booking-report${dateSuffix}-${new Date().toISOString().split('T')[0]}.pdf`);
      message.success('Xuất PDF thành công!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Xuất PDF thất bại!');
    }
  };

  // Function để xử lý export với modal chọn ngày
  const handleExportWithDate = (type: 'excel' | 'pdf') => {
    setDateRangeType('custom');
    setPendingExportType(type);
    setIsDateModalVisible(true);
  };

  // Function để xử lý export ngay lập tức
  const handleExportImmediate = (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      exportToExcel();
    } else {
      exportToPDF();
    }
  };

  // Function để xác nhận export với ngày đã chọn
  const handleConfirmExport = () => {
    if (!pendingExportType) return;
    
    let filteredBookings: Booking[];
    
    if (dateRangeType === 'month') {
      const startDate = dayjs().year(selectedYear).month(selectedMonth - 1).startOf('month');
      const endDate = dayjs().year(selectedYear).month(selectedMonth - 1).endOf('month');
      filteredBookings = getFilteredBookings(startDate, endDate);
      
      // Debug log để kiểm tra dữ liệu
      console.log('=== DEBUG EXPORT THEO THÁNG ===');
      console.log('Tháng được chọn:', selectedMonth, selectedYear);
      console.log('Khoảng thời gian:', startDate.format('DD/MM/YYYY'), 'đến', endDate.format('DD/MM/YYYY'));
      console.log('Tổng booking gốc:', bookings.length);
      console.log('Booking sau khi lọc:', filteredBookings.length);
      
      // Kiểm tra từng booking được lọc
      filteredBookings.forEach((booking, index) => {
        const checkInDate = dayjs(booking.checkIn);
        const createdAt = dayjs(booking.createdAt);
        console.log(`Booking ${index + 1}:`, {
          id: booking._id.substring(0, 8),
          checkIn: checkInDate.format('DD/MM/YYYY'),
          createdAt: createdAt.format('DD/MM/YYYY'),
          checkInMonth: checkInDate.month() + 1,
          checkInYear: checkInDate.year(),
          totalPrice: booking.totalPrice
        });
      });
    } else if (dateRangeType === 'year') {
      const startDate = dayjs().year(selectedYear).startOf('year');
      const endDate = dayjs().year(selectedYear).endOf('year');
      filteredBookings = getFilteredBookings(startDate, endDate);
    } else {
      // Xuất theo khoảng thời gian tùy chọn - cũng sử dụng ngày đặt phòng
      filteredBookings = getFilteredBookings(dateRange[0] || undefined, dateRange[1] || undefined);
      
      // Debug log cho khoảng thời gian tùy chọn
      if (dateRange[0] && dateRange[1]) {
        console.log('=== DEBUG EXPORT THEO KHOẢNG THỜI GIAN ===');
        console.log('Khoảng thời gian:', dateRange[0].format('DD/MM/YYYY'), 'đến', dateRange[1].format('DD/MM/YYYY'));
        console.log('Tổng booking gốc:', bookings.length);
        console.log('Booking sau khi lọc:', filteredBookings.length);
        
        // Kiểm tra từng booking được lọc
        filteredBookings.forEach((booking, index) => {
          const checkInDate = dayjs(booking.checkIn);
          const createdAt = dayjs(booking.createdAt);
          console.log(`Booking ${index + 1}:`, {
            id: booking._id.substring(0, 8),
            checkIn: checkInDate.format('DD/MM/YYYY'),
            createdAt: createdAt.format('DD/MM/YYYY'),
            checkInMonth: checkInDate.month() + 1,
            checkInYear: checkInDate.year(),
            totalPrice: booking.totalPrice
          });
        });
      }
    }
    
    if (pendingExportType === 'excel') {
      exportToExcel(filteredBookings);
    } else {
      exportToPDF(filteredBookings);
    }
    
    setIsDateModalVisible(false);
    setDateRange([null, null]);
    setPendingExportType(null);
    setDateRangeType('custom');
    setIncludeAnalysis(false);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'excel',
      label: 'Xuất Excel',
      icon: <FileExcelOutlined />,
      onClick: () => handleExportImmediate('excel')
    },
    {
      key: 'excel-range',
      label: 'Xuất Excel theo khoảng thời gian',
      icon: <CalendarOutlined />,
      onClick: () => handleExportWithDate('excel')
    },
    {
      key: 'excel-month',
      label: 'Xuất Excel theo tháng',
      icon: <CalendarOutlined />,
      onClick: () => {
        setDateRangeType('month');
        setPendingExportType('excel');
        setIsDateModalVisible(true);
      }
    },
    {
      key: 'excel-year',
      label: 'Xuất Excel theo năm',
      icon: <CalendarOutlined />,
      onClick: () => {
        setDateRangeType('year');
        setPendingExportType('excel');
        setIsDateModalVisible(true);
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'pdf',
      label: 'Xuất PDF',
      icon: <FilePdfOutlined />,
      onClick: () => handleExportImmediate('pdf')
    },
    {
      key: 'pdf-range',
      label: 'Xuất PDF theo khoảng thời gian',
      icon: <CalendarOutlined />,
      onClick: () => handleExportWithDate('pdf')
    },
    {
      key: 'pdf-month',
      label: 'Xuất PDF theo tháng',
      icon: <CalendarOutlined />,
      onClick: () => {
        setDateRangeType('month');
        setPendingExportType('pdf');
        setIsDateModalVisible(true);
      }
    },
    {
      key: 'pdf-year',
      label: 'Xuất PDF theo năm',
      icon: <CalendarOutlined />,
      onClick: () => {
        setDateRangeType('year');
        setPendingExportType('pdf');
        setIsDateModalVisible(true);
      }
    }
  ];

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          style={{ width: '100%' }}
        >
          Xuất dữ liệu
        </Button>
      </Dropdown>

      <Modal
        title="Chọn khoảng thời gian xuất dữ liệu"
        open={isDateModalVisible}
        onOk={handleConfirmExport}
        onCancel={() => {
          setIsDateModalVisible(false);
          setDateRange([null, null]);
          setPendingExportType(null);
          setDateRangeType('custom');
          setIncludeAnalysis(false);
        }}
        okText="Xuất dữ liệu"
        cancelText="Hủy"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text>
            Chọn khoảng thời gian để xuất dữ liệu booking:
          </Typography.Text>
          
          <Radio.Group 
            value={dateRangeType} 
            onChange={(e) => setDateRangeType(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical">
              <Radio value="custom">Tùy chọn khoảng thời gian</Radio>
              <Radio value="month">Theo tháng</Radio>
              <Radio value="year">Theo năm</Radio>
            </Space>
          </Radio.Group>
          
          {dateRangeType === 'custom' && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              📅 Chọn khoảng thời gian từ ngày - đến ngày
            </Typography.Text>
          )}
          
          {dateRangeType === 'month' && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              📅 Xuất dữ liệu theo tháng được chọn
            </Typography.Text>
          )}
          
          {dateRangeType === 'year' && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              📅 Xuất dữ liệu theo năm được chọn
            </Typography.Text>
          )}
          
          {dateRangeType === 'custom' && (
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
              format="DD/MM/YYYY"
            />
          )}
          
          {dateRangeType === 'month' && (
            <Space>
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 120 }}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: i + 1,
                  label: `Tháng ${i + 1}`
                }))}
              />
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 100 }}
                options={Array.from({ length: 5 }, (_, i) => ({
                  value: new Date().getFullYear() - 2 + i,
                  label: `${new Date().getFullYear() - 2 + i}`
                }))}
              />
            </Space>
          )}
          
          {dateRangeType === 'year' && (
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 120 }}
              options={Array.from({ length: 5 }, (_, i) => ({
                value: new Date().getFullYear() - 2 + i,
                label: `${new Date().getFullYear() - 2 + i}`
              }))}
            />
          )}
          
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <Typography.Text strong>Phân tích nhu cầu khách hàng:</Typography.Text>
            <br />
            <Typography.Text type="secondary">
              Bao gồm phân tích loại khách hàng, phòng ưa thích, ngày cao điểm, và xu hướng doanh thu
            </Typography.Text>
            <br />
            <input
              type="checkbox"
              checked={includeAnalysis}
              onChange={(e) => setIncludeAnalysis(e.target.checked)}
              style={{ marginTop: 8 }}
            />
            <Typography.Text style={{ marginLeft: 8 }}>
              Bao gồm phân tích nhu cầu khách hàng
            </Typography.Text>
          </div>
          
          {dateRangeType === 'custom' && dateRange[0] && dateRange[1] && (
            <div style={{ 
              padding: 12, 
              backgroundColor: '#e6f7ff', 
              borderRadius: 6, 
              border: '1px solid #91d5ff',
              marginTop: 8
            }}>
              <Typography.Text strong style={{ color: '#1890ff' }}>
                📊 Sẽ xuất dữ liệu từ {dateRange[0].format('DD/MM/YYYY')} đến {dateRange[1].format('DD/MM/YYYY')}
              </Typography.Text>
            </div>
          )}
          
          {dateRangeType === 'month' && (
            <div style={{ 
              padding: 12, 
              backgroundColor: '#f6ffed', 
              borderRadius: 6, 
              border: '1px solid #b7eb8f',
              marginTop: 8
            }}>
              <Typography.Text strong style={{ color: '#52c41a' }}>
                📅 Sẽ xuất dữ liệu tháng {selectedMonth}/{selectedYear}
              </Typography.Text>
            </div>
          )}
          
          {dateRangeType === 'year' && (
            <div style={{ 
              padding: 12, 
              backgroundColor: '#fff7e6', 
              borderRadius: 6, 
              border: '1px solid #ffd591',
              marginTop: 8
            }}>
              <Typography.Text strong style={{ color: '#fa8c16' }}>
                📈 Sẽ xuất dữ liệu năm {selectedYear}
              </Typography.Text>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
}
