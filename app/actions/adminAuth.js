'use server'

import { createClient } from '@supabase/supabase-js'

// 1. TẠO SUPABASE CLIENT QUYỀN LỰC NHẤT
// Sử dụng Service Role Key để bỏ qua mọi RLS (Row Level Security)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 2. LẤY DANH SÁCH TOÀN BỘ NGƯỜI DÙNG
export async function layDanhSachTaiKhoan() {
  try {
    // Lấy thông tin tài khoản (email, id)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError

    // Lấy thông tin chức vụ từ bảng profiles
    const { data: profiles, error: profError } = await supabaseAdmin.from('profiles').select('*')
    if (profError) throw profError

    // Trộn 2 dữ liệu lại với nhau
    const danhSach = authData.users.map(user => {
      const profile = profiles.find(p => p.id === user.id)
      return {
        id: user.id,
        email: user.email,
        role: profile ? profile.role : 'viewer',
        created_at: user.created_at
      }
    })

    return { success: true, data: danhSach }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// 3. TẠO TÀI KHOẢN MỚI TỪ ADMIN
export async function taoTaiKhoanMoi(email, password, role) {
  try {
    // Ép tạo tài khoản và tự động xác nhận email (email_confirm: true)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    })
    
    if (error) throw error

    // Sau khi tạo xong, ép quyền (role) vào bảng profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      role: role
    })

    if (profileError) throw profileError

    return { success: true, message: 'Tạo tài khoản thành công!' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// 4. ĐỔI MẬT KHẨU TÀI KHOẢN (KHÔNG CẦN EMAIL XÁC NHẬN)
export async function datLaiMatKhau(userId, newPassword) {
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) throw error
    return { success: true, message: 'Đổi mật khẩu thành công!' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// 5. ĐỔI QUYỀN / LEVEL CỦA TÀI KHOẢN
export async function doiQuyenTaiKhoan(userId, newRole) {
  try {
    const { error } = await supabaseAdmin.from('profiles').update({
      role: newRole
    }).eq('id', userId)

    if (error) throw error
    return { success: true, message: 'Cập nhật quyền thành công!' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// 6. XÓA TÀI KHOẢN VĨNH VIỄN
export async function xoaTaiKhoan(userId) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) throw error
    return { success: true, message: 'Đã xóa tài khoản vĩnh viễn!' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}