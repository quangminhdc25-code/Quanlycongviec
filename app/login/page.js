'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TrangDangNhap() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMessage('Email hoặc mật khẩu không chính xác, vui lòng kiểm tra lại.')
      setLoading(false)
    } else {
      // Đăng nhập thành công, tự động chuyển về trang quản lý chính
      window.location.href = '/'
    }
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-tr from-[#bcf8e8] via-[#ffcdec] to-[#d1bbf9]">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-md">VH</div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">HỆ THỐNG ICT GIA LAI TÂY</h1>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Đăng nhập hệ thống</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 text-slate-600">Địa chỉ Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="nhap-email@test.com" 
              className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-normal transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 text-slate-600">Mật khẩu</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-normal transition-all"
            />
          </div>

          {errorMessage && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
          </button>
        </form>
      </div>
    </div>
  )
}