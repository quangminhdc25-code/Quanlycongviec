import './globals.css' // <-- DÒNG NÀY LÀ CHÌA KHÓA ĐỂ KÍCH HOẠT GIAO DIỆN

// 1. Cấu hình tiêu đề web chuẩn Next.js
export const metadata = {
  title: 'Quản lý công việc ICT Gia Lai Tây',
}

// 2. CHÌA KHÓA HIỂN THỊ DI ĐỘNG: Ép tỷ lệ 1:1, không cho phép trình duyệt tự thu nhỏ
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      {/* Lệnh m-0 p-0 overflow-hidden giúp web tràn sát viền */}
      <body className="m-0 p-0 overflow-hidden bg-black">
        {children}
      </body>
    </html>
  )
}