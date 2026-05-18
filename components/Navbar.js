export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Tên ứng dụng bên trái */}
          <div className="text-lg font-semibold tracking-tight text-gray-900">
            Xã Gào
          </div>
          
          {/* Tiêu đề phụ bên phải */}
          <div className="text-sm font-medium text-gray-500">
            Quản lý công việc
          </div>
        </div>
      </div>
    </nav>
  )
}