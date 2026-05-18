import './globals.css' // <-- DÒNG NÀY LÀ CHÌA KHÓA ĐỂ KÍCH HOẠT GIAO DIỆN

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <title>Quản lý công việc ICT Gia Lai Tây</title>
      </head>
      {/* Lệnh m-0 p-0 overflow-hidden giúp web tràn sát viền */}
      <body className="m-0 p-0 overflow-hidden bg-black">
        {children}
      </body>
    </html>
  )
}