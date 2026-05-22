'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { layDanhSachTaiKhoan, taoTaiKhoanMoi, datLaiMatKhau, doiQuyenTaiKhoan, xoaTaiKhoan } from './actions/adminAuth'

// === COMPONENT: BỘ TẠO ICON TÀI LIỆU ===
function getFileIcon(filename, size = 'small') {
  if (!filename) return null;
  const ext = filename.split('.').pop().toLowerCase();
  const isLarge = size === 'large';
  
  let strokeColor = 'stroke-slate-400';
  let bgColor = 'bg-slate-500/10';
  let textColor = 'text-slate-500 border-slate-500/20';
  let badgeText = 'FILE';
  let innerIcon = (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m-6-8h2" />
  );

  if (['doc', 'docx'].includes(ext)) { 
    strokeColor = 'stroke-blue-500'; bgColor = 'bg-blue-500/10'; textColor = 'text-blue-500 border-blue-500/20'; badgeText = 'DOC';
    innerIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h3m-3-8h6" />;
  } else if (['xls', 'xlsx', 'csv'].includes(ext)) { 
    strokeColor = 'stroke-green-500'; bgColor = 'bg-green-500/10'; textColor = 'text-green-600 border-green-500/20'; badgeText = 'XLS';
    innerIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h6M9 12h6M9 7h6M9 7v10M15 7v10" />;
  } else if (['ppt', 'pptx'].includes(ext)) { 
    strokeColor = 'stroke-orange-500'; bgColor = 'bg-orange-500/10'; textColor = 'text-orange-600 border-orange-500/20'; badgeText = 'PPT';
    innerIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4" />;
  } else if (['pdf'].includes(ext)) { 
    strokeColor = 'stroke-red-500'; bgColor = 'bg-red-500/10'; textColor = 'text-red-500 border-red-500/20'; badgeText = 'PDF';
    innerIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01" />;
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) { 
    strokeColor = 'stroke-purple-500'; bgColor = 'bg-purple-500/10'; textColor = 'text-purple-500 border-purple-500/20'; badgeText = 'IMG';
    innerIcon = <circle cx="12" cy="13" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
} else if (['zip', 'rar', '7z'].includes(ext)) { 
    strokeColor = 'stroke-yellow-500'; bgColor = 'bg-yellow-500/10'; textColor = 'text-yellow-600 border-yellow-500/20'; badgeText = 'ZIP';
    innerIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v4m0 0l-2-2m2 2l2-2" />;
  } else if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
    strokeColor = 'stroke-pink-500'; bgColor = 'bg-pink-500/10'; textColor = 'text-pink-600 border-pink-500/20'; badgeText = 'VID';
    innerIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
  }

  if (isLarge) {
    return (
      <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl ${bgColor} border border-dashed border-slate-500/20 w-24 h-24`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-12 h-12 ${strokeColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className={`absolute bottom-2 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${textColor} bg-white dark:bg-[#1a1a24]`}>{badgeText}</span>
      </div>
    );
  }

  return (
    <div className={`p-1.5 rounded-lg ${bgColor} shrink-0 flex items-center justify-center`}>
      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${strokeColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
}

export default function TrangQuanLyChuyenSau() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [currentSpace, setCurrentSpace] = useState('shared'); // 'shared' (Ngôi nhà chung) hoặc 'private' (Căn phòng riêng)
  const [isSharedInput, setIsSharedInput] = useState(true); // Trạng thái công tắc khi tạo việc mới
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('light')
  
  const [viewMode, setViewMode] = useState('kanban')

  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [modalType, setModalType] = useState(null) 
  const [viewingTask, setViewingTask] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const [projectTitle, setProjectTitle] = useState('')
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskDeadline, setTaskDeadline] = useState('')
  const [taskFiles, setTaskFiles] = useState([])

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [isUploadingPending, setIsUploadingPending] = useState(false)
  const [pendingUploadProgress, setPendingUploadProgress] = useState(0)

  const [editField, setEditField] = useState(null)
  const [tempValue, setTempValue] = useState('')
  const [quickNoteText, setQuickNoteText] = useState('')
  const [editingNoteIndex, setEditingNoteIndex] = useState(null)
  const [editingNoteText, setEditingNoteText] = useState('')
const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // === STATE CHO ADMIN PANEL ===
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '', role: 'viewer' });
  const [editingPasswordId, setEditingPasswordId] = useState(null);
  const [newPasswordTemp, setNewPasswordTemp] = useState('');

 const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Trạng thái đóng/mở Menu trên điện thoại
  const [searchResults, setSearchResults] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const [currentDate, setCurrentDate] = useState(new Date());

  const ITEMS_PER_PAGE = 10;
  const [pagePending, setPagePending] = useState(1);
  const [pageTodo, setPageTodo] = useState(1);
  const [pageInProgress, setPageInProgress] = useState(1);
  const [pageDone, setPageDone] = useState(1);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProjectName, setEditProjectName] = useState('');
  
  const [pendingOrders, setPendingOrders] = useState({});
  const [todoOrders, setTodoOrders] = useState({});
  const [inProgressOrders, setInProgressOrders] = useState({});
  const [doneOrders, setDoneOrders] = useState({});

  const [hoveredTaskInfo, setHoveredTaskInfo] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const modalRef = useRef(null);
  const dragData = useRef({ isDragging: false, startX: 0, startY: 0, initX: 0, initY: 0 });

// === CÁC STATE PHÂN QUYỀN MỚI ===
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('viewer'); // Mặc định an toàn nhất là viewer

  // Bộ lọc thông minh tách biệt giữa phòng riêng và nhà chung
  const hienThiTasks = tasks.filter(task => {
      if (currentSpace === 'shared') {
          return task.is_shared === true; // Ngôi nhà chung: Của chung
      } else {
          // Căn phòng riêng: Việc không chia sẻ VÀ phải ĐÚNG của user đang đăng nhập
          return task.is_shared === false && task.user_id === currentUser?.id;
      }
  });

  useEffect(() => {
    setPagePending(1);
    setPageTodo(1);
    setPageInProgress(1);
    setPageDone(1);
  }, [selectedProjectId]);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập và nạp quyền từ Supabase
    const checkUserAndLoadData = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            window.location.href = '/login';
            return;
        }

        setCurrentUser(session.user);

        // Lấy quyền của tài khoản này từ bảng profiles
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) {
            setUserRole(profile.role);
        } else {
            setUserRole('viewer'); 
        }

        // Tải dữ liệu hệ thống
        await taiDuLieuHienTai();
        
        const savedTheme = localStorage.getItem('app-theme') || 'light';
        setTheme(savedTheme);
        
        const savedPending = localStorage.getItem('pendingOrders');
        const savedTodo = localStorage.getItem('todoOrders');
        const savedInProg = localStorage.getItem('inProgressOrders');
        const savedDone = localStorage.getItem('doneOrders');
        
        if (savedPending) setPendingOrders(JSON.parse(savedPending));
        if (savedTodo) setTodoOrders(JSON.parse(savedTodo));
        if (savedInProg) setInProgressOrders(JSON.parse(savedInProg));
        if (savedDone) setDoneOrders(JSON.parse(savedDone));
    };

    checkUserAndLoadData();
  }, []);

  // Biến kiểm tra nhanh điều kiện quyền
  const isViewer = userRole === 'viewer';
  const isEditor = userRole === 'editor' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.href = '/login';
  };

useEffect(() => {
    if (modalType === 'task_view' && modalRef.current) {
        const el = modalRef.current;
        if (el.dataset.initialized !== 'true') {
            const isMobile = window.innerWidth < 768;
            // Điện thoại: Bung rộng 95%, cao 92% (chuẩn App). Máy tính: Giữ tỷ lệ cũ.
            const w = isMobile ? window.innerWidth * 0.95 : Math.min(1152, window.innerWidth * 0.95);
            const h = isMobile ? window.innerHeight * 0.92 : window.innerHeight * 0.85;
            
            const x = (window.innerWidth - w) / 2;
            const y = (window.innerHeight - h) / 2;
            
            el.style.width = `${w}px`;
            el.style.height = `${h}px`;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.dataset.initialized = 'true';
        }
    }
  }, [modalType, viewingTask]);

  useEffect(() => {
    const handleMouseMove = (e) => {
        if (dragData.current.isDragging && modalRef.current) {
            const newX = dragData.current.initX + (e.clientX - dragData.current.startX);
            const newY = dragData.current.initY + (e.clientY - dragData.current.startY);
            modalRef.current.style.left = `${newX}px`;
            modalRef.current.style.top = `${newY}px`;
        }
    };
    const handleMouseUp = () => { dragData.current.isDragging = false; };

    if (modalType === 'task_view') {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [modalType]);

  const handleModalDragStart = (e) => {
    if (modalRef.current) {
        dragData.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initX: modalRef.current.offsetLeft,
            initY: modalRef.current.offsetTop
        };
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('app-theme', newTheme)
  }

  async function taiDuLieuHienTai() {
    const { data: pData } = await supabase.from('projects').select('*').order('created_at', { ascending: true })
    const { data: tData } = await supabase.from('tasks').select('*').order('created_at', { ascending: true })
    if (pData) {
      setProjects(pData)
      if (pData.length > 0 && !selectedProjectId) setSelectedProjectId(pData[0].id)
    }
    if (tData) setTasks(tData)
  }

  function getSafeArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try { const parsed = JSON.parse(data); return Array.isArray(parsed) ? parsed : []; } catch (e) { return []; }
  }

  const highlightText = (text, highlight) => {
    if (!text || !highlight) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-blue-500 font-normal bg-blue-500/10 px-0.5 rounded shadow-sm">{part}</span>
          ) : (<span key={i}>{part}</span>) 
        )}
      </span>
    );
  };

  function handleSearch(e) {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); setIsSearchOpen(false); return; }
    
    const lowerQuery = query.toLowerCase();
    const results = hienThiTasks.filter(task => {
      const matchTitle = task.title?.toLowerCase().includes(lowerQuery);
      const matchDesc = task.description?.toLowerCase().includes(lowerQuery);
      const safeNotes = getSafeArray(task.notes);
      const matchNotes = safeNotes.some(n => n.text?.toLowerCase().includes(lowerQuery));
      const safeAttachments = getSafeArray(task.attachments);
      const matchFiles = safeAttachments.some(f => f.name?.toLowerCase().includes(lowerQuery));
      return matchTitle || matchDesc || matchNotes || matchFiles;
    });
    setSearchResults(results); setIsSearchOpen(true);
  }

  function handleSelectSearchResult(task) {
    setSelectedProjectId(task.project_id); moModalXemChiTiet(task);
    setIsSearchOpen(false); setSearchQuery('');
  }

  async function luuMangCongViec(e) {
    e.preventDefault()
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    const { error } = await supabase.from('projects').insert([{ title: projectTitle }])
    if (!error) { setProjectTitle(''); setModalType(null); taiDuLieuHienTai(); }
  }

  function xoaMangCongViec(id) {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    if(confirm('Xóa mảng này sẽ xóa tất cả công việc con bên trong. Bạn chắc chứ?')) {
      supabase.from('projects').delete().eq('id', id).then(() => {
        setSelectedProjectId(null); taiDuLieuHienTai();
      });
    }
  }

  async function handleRenameProject(id) {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua || !editProjectName.trim()) { setEditingProjectId(null); return; }
    setProjects(prev => prev.map(p => p.id === id ? { ...p, title: editProjectName } : p));
    setEditingProjectId(null);
    await supabase.from('projects').update({ title: editProjectName }).eq('id', id);
  }

  function moModalTaoMoi(projectId) {
    setActiveProjectId(projectId); setTaskTitle(''); setTaskDesc(''); setTaskDeadline(''); setTaskFiles([]);
    setModalType('task_new');
  }

  const handleDragOverFile = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDropFileNew = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isEditor) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setTaskFiles(Array.from(e.dataTransfer.files));
    }
  };

async function handleDirectUploadPendingFile(e) {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    
    // ... (Phần còn lại của hàm giữ nguyên)
    const files = Array.from(e.target.files);
    if (!files.length || !selectedProjectId) return;
    
    setIsUploadingPending(true); setPendingUploadProgress(10);
    const progressInterval = setInterval(() => { setPendingUploadProgress(prev => (prev < 90 ? prev + 15 : prev)); }, 300);
    
    for (let file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${Date.now()}-${safeName}`;
      const { error: upError } = await supabase.storage.from('task-attachments').upload(fileName, file);
      if (!upError) {
        const { data: urlData } = supabase.storage.from('task-attachments').getPublicUrl(fileName);
const taskData = {
          title: file.name, 
          description: '',
          due_date: null,
          attachments: [{ name: file.name, url: urlData.publicUrl, type: 'input' }], 
notes: [], 
          project_id: selectedProjectId, 
          status: 'pending',
          is_shared: isEditor ? isSharedInput : false,
          user_id: currentUser?.id // Đóng dấu chủ sở hữu
        };
        await supabase.from('tasks').insert([taskData]);
      }
    }
    
    clearInterval(progressInterval); setPendingUploadProgress(100);
    setTimeout(() => { setIsUploadingPending(false); setPendingUploadProgress(0); taiDuLieuHienTai(); }, 400);
  }

async function xuLyTaoViecMoi(e) {
    e.preventDefault();
    setLoading(true);
    let attachments = [];
    
    if (taskFiles.length > 0) {
      setIsUploading(true); setUploadProgress(10);
      const progressInterval = setInterval(() => { setUploadProgress(prev => (prev < 90 ? prev + 15 : prev)); }, 300);
      for (let file of taskFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `${Date.now()}-${safeName}`;
        const { error: upError } = await supabase.storage.from('task-attachments').upload(fileName, file);
        if (!upError) {
          const { data: urlData } = supabase.storage.from('task-attachments').getPublicUrl(fileName);
          attachments.push({ name: file.name, url: urlData.publicUrl, type: 'input' });
        }
      }
      clearInterval(progressInterval); setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 400));
      setIsUploading(false); setUploadProgress(0);
    }
    
const taskData = {
      title: taskTitle, description: taskDesc,
      due_date: taskDeadline ? new Date(taskDeadline).toISOString() : null,
      attachments, notes: [], project_id: activeProjectId, status: 'todo',
      is_shared: isEditor ? isSharedInput : false,
      user_id: currentUser?.id // Đóng dấu chủ sở hữu
    };
    
    const { error: err } = await supabase.from('tasks').insert([taskData]);
    
    if (err) { 
      console.error("Lỗi Supabase:", err.message); // Chuyển lỗi xuống nền ngầm, không hiện ra ngoài làm phiền người dùng
    } else { 
      dongModalTask(); 
      taiDuLieuHienTai(); 
      setCurrentSpace('private'); // Lệnh xịn sò: Tự động đưa người dùng về xem Căn phòng riêng!
    }
    setLoading(false);
  }

  function moModalXemChiTiet(task) {
    setViewingTask(task);
    const attachments = getSafeArray(task.attachments);
    setSelectedFile(attachments.length > 0 ? attachments[0] : null);
    setModalType('task_view');
    setHoveredTaskInfo(null);
  }

  function moTrinhXemFile(file) {
    setSelectedFile(file);
    setModalType('file_viewer');
    setHoveredTaskInfo(null);
  }

  function dongModalTask() {
    setModalType(null); setViewingTask(null); setSelectedFile(null);
    setTaskTitle(''); setTaskDesc(''); setTaskDeadline(''); setTaskFiles([]);
    setIsUploading(false); setUploadProgress(0); setEditField(null); setTempValue('');
    setQuickNoteText(''); setEditingNoteIndex(null); setEditingNoteText('');
    if (modalRef.current) modalRef.current.dataset.initialized = '';
  }

async function saveInlineEdit(field) {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua || !viewingTask) return;
    let finalValue = tempValue;
    if (field === 'due_date' && tempValue) finalValue = new Date(tempValue).toISOString();
    const updatedTask = { ...viewingTask, [field]: finalValue };
    setViewingTask(updatedTask); setTasks(prev => prev.map(t => t.id === viewingTask.id ? updatedTask : t));
    await supabase.from('tasks').update({ [field]: finalValue }).eq('id', viewingTask.id);
    setEditField(null);
  }

async function handleInlineUpload(e, fileType = 'input', droppedFiles = null) {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    
    const files = droppedFiles ? Array.from(droppedFiles) : Array.from(e.target.files);
    if (!files.length) return;
    
    setIsUploading(true); setUploadProgress(10);
    let newAttachments = [...getSafeArray(viewingTask.attachments)];
    const progressInterval = setInterval(() => { setUploadProgress(prev => (prev < 90 ? prev + 15 : prev)); }, 300);
    
    for (let file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${Date.now()}-${safeName}`;
      const { error: upError } = await supabase.storage.from('task-attachments').upload(fileName, file);
      
      if (upError) {
        // NẾU SUPABASE CHẶN FILE, CHUÔNG SẼ RÉO LÊN Ở ĐÂY!
        alert("Lỗi kho chứa Supabase: " + upError.message);
      } else {
        const { data: urlData } = supabase.storage.from('task-attachments').getPublicUrl(fileName);
        newAttachments.push({ name: file.name, url: urlData.publicUrl, type: fileType });
      }
    }
    
    clearInterval(progressInterval); setUploadProgress(100);
    const updatedTask = { ...viewingTask, attachments: newAttachments };
    setViewingTask(updatedTask); setTasks(prev => prev.map(t => t.id === viewingTask.id ? updatedTask : t));
    
    const { error: dbErr } = await supabase.from('tasks').update({ attachments: newAttachments }).eq('id', viewingTask.id);
    if (dbErr) {
        alert("Lỗi lưu data: " + dbErr.message);
    }
    
    setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 400);
  }

  const handleDropFileInput = (e) => { e.preventDefault(); e.stopPropagation(); handleInlineUpload(null, 'input', e.dataTransfer.files); };
  const handleDropFileOutput = (e) => { e.preventDefault(); e.stopPropagation(); handleInlineUpload(null, 'output', e.dataTransfer.files); };

function handleInlineDeleteFile(fileUrl) {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    if(confirm('Xóa tệp đính kèm này khỏi hệ thống?')) {
      let newAttachments = getSafeArray(viewingTask.attachments).filter(f => f.url !== fileUrl);
      const updatedTask = { ...viewingTask, attachments: newAttachments };
      setViewingTask(updatedTask); setTasks(prev => prev.map(t => t.id === viewingTask.id ? updatedTask : t));
      supabase.from('tasks').update({ attachments: newAttachments }).eq('id', viewingTask.id);
      if (selectedFile && selectedFile.url === fileUrl) setSelectedFile(newAttachments.length > 0 ? newAttachments[0] : null);
    }
  }

async function handleAddQuickNote() {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua || !quickNoteText.trim() || !viewingTask) return;
    const newNote = { text: quickNoteText.trim(), created_at: new Date().toISOString() };
    const updatedNotes = [...getSafeArray(viewingTask.notes), newNote];
    const updatedTask = { ...viewingTask, notes: updatedNotes };
    setViewingTask(updatedTask); setTasks(prev => prev.map(t => t.id === viewingTask.id ? updatedTask : t));
    setQuickNoteText('');
    await supabase.from('tasks').update({ notes: updatedNotes }).eq('id', viewingTask.id);
  }

function handleDeleteNote(idx) {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    if(confirm('Xóa ghi chú này?')) {
      const updatedNotes = [...getSafeArray(viewingTask.notes)];
      updatedNotes.splice(idx, 1);
      const updatedTask = { ...viewingTask, notes: updatedNotes };
      setViewingTask(updatedTask); setTasks(prev => prev.map(t => t.id === viewingTask.id ? updatedTask : t));
      supabase.from('tasks').update({ notes: updatedNotes }).eq('id', viewingTask.id);
    }
  }

  const handleDragOver = (e) => { e.preventDefault(); };
  
const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");
    if (!taskId) return;
    if (sourceStatus === newStatus) return;

    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus, is_completed: newStatus === 'done' } : t));
    await supabase.from('tasks').update({ status: newStatus, is_completed: newStatus === 'done' }).eq('id', taskId);
    await taiDuLieuHienTai();
  };
// === LOGIC KÉO THẢ TOÀN DIỆN (PC & MOBILE) ===
  
  // 1. Bùa phép kéo thả bằng ngón tay trên điện thoại (Ấn giữ 200ms để kéo)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/mobile-drag-drop@3.0.0-rc.1/index.min.js";
    script.async = true;
    script.onload = () => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/mobile-drag-drop@3.0.0-rc.1/default.css';
      document.head.appendChild(css);
      window.MobileDragDrop.polyfill({ holdToDrag: 200 });
    };
    document.body.appendChild(script);
  }, []);

  // 2. Xử lý khi bắt đầu nhấc thẻ lên (Hỗ trợ cả đổi cột lẫn sắp xếp)
  const handleDragStartCard = (e, task, index) => {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) { e.preventDefault(); return; }
    
    // Dữ liệu dành cho việc Đổi Cột
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("sourceStatus", task.status);
    
    // Dữ liệu tương thích với logic Sắp Xếp cũ của bạn
    e.dataTransfer.setData("text/plain", index);
    e.dataTransfer.setData("status", task.status);
  };

  // 3. Xử lý khi thả thẻ vào một Cột mới
  const handleDropToColumnArea = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");

    // Nếu thả vào cùng cột cũ hoặc không có ID thì bỏ qua
    if (!taskId || sourceStatus === targetStatus) return;

    const isCompleted = targetStatus === 'done';

    // Cập nhật giao diện ngay lập tức cho mượt mà
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus, is_completed: isCompleted } : t));

    // Đẩy dữ liệu lên Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ status: targetStatus, is_completed: isCompleted })
      .eq('id', taskId);

    if (error) {
      alert("Lỗi chuyển trạng thái: " + error.message);
      await taiDuLieuHienTai(); // Trả lại vị trí cũ nếu lỗi mạng
    }
  };
  const handleDropSort = (status, dragIndex, dropIndex) => {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    
    let rawList, ordersMap, setOrders, page, storageKey;
    if(status === 'pending') { rawList = sortedPendingRaw; ordersMap = pendingOrders; setOrders = setPendingOrders; page = pagePending; storageKey = 'pendingOrders'; }
    else if(status === 'todo') { rawList = sortedTodoRaw; ordersMap = todoOrders; setOrders = setTodoOrders; page = pageTodo; storageKey = 'todoOrders'; }
    else if(status === 'in_progress') { rawList = sortedInProgressRaw; ordersMap = inProgressOrders; setOrders = setInProgressOrders; page = pageInProgress; storageKey = 'inProgressOrders'; }
    else if(status === 'done') { rawList = sortedDoneRaw; ordersMap = doneOrders; setOrders = setDoneOrders; page = pageDone; storageKey = 'doneOrders'; }

    const newSorted = [...rawList];
    const realDragIdx = (page - 1) * ITEMS_PER_PAGE + parseInt(dragIndex);
    const realDropIdx = (page - 1) * ITEMS_PER_PAGE + parseInt(dropIndex);

    const [draggedItem] = newSorted.splice(realDragIdx, 1);
    newSorted.splice(realDropIdx, 0, draggedItem);

    const newOrderIds = newSorted.map(t => t.id);
    const nextOrders = { ...ordersMap, [selectedProjectId]: newOrderIds };
    setOrders(nextOrders);
    localStorage.setItem(storageKey, JSON.stringify(nextOrders));
  };
// 1. Hàm này chỉ dùng để kích hoạt bảng thông báo UI
function xoaTaskNhanh(taskId) {
      const quyenSua = isEditor || currentSpace === 'private';
      if (!quyenSua) return;
      setDeletingTaskId(taskId); // Gắn ID để mở bảng Modal
  }

  // 2. Hàm này thực thi việc xóa vĩnh viễn khi bấm Xác nhận trên bảng Modal
async function thucHienXoaTask() {
      const quyenSua = isEditor || currentSpace === 'private';
      if (!quyenSua || !deletingTaskId) return;
      setIsDeleting(true); // Đổi nút thành "Đang xóa..." để tránh bấm đúp
      
      try {
          const taskToDelete = tasks.find(t => t.id === deletingTaskId);
          setTasks(prev => prev.filter(t => t.id !== deletingTaskId)); // Ẩn khỏi màn hình trước cho mượt
          
          if (taskToDelete && taskToDelete.attachments) {
              const files = getSafeArray(taskToDelete.attachments);
              for (let file of files) {
                  if (file.url) {
                      const urlParts = file.url.split('/');
                      const fileName = urlParts[urlParts.length - 1];
                      await supabase.storage.from('task-attachments').remove([fileName]);
                  }
              }
          }
          
          const { error } = await supabase.from('tasks').delete().eq('id', deletingTaskId);
          if (error) {
              alert('Lỗi: Hệ thống từ chối xóa! ' + error.message);
              taiDuLieuHienTai();
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsDeleting(false); // Trả lại trạng thái nút
          setDeletingTaskId(null); // Đóng bảng Modal
      }
  }
  const handleTaskMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
  };

const handleTaskMouseEnter = (e, task) => {
      // KHÓA BẢO VỆ: Nếu là màn hình điện thoại hoặc máy tính bảng (< 1024px), từ chối hiện Tooltip!
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return;

      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      
      hoverTimeoutRef.current = setTimeout(() => {
          let left = mousePosRef.current.x + 15;
          let top = mousePosRef.current.y + 15;
          
          if (typeof window !== 'undefined') {
              if (left + 350 > window.innerWidth) left = mousePosRef.current.x - 350 - 15;
              if (top + 400 > window.innerHeight) { 
                  top = mousePosRef.current.y - 400 - 15;
                  if (top < 10) top = 10;
              }
          }
          setHoveredTaskInfo({ task, top, left });
      }, 350); 
  };

  const handleTaskMouseLeave = () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setHoveredTaskInfo(null);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = selectedProject ? hienThiTasks.filter(t => t.project_id === selectedProject.id) : [];
  
  const allPendingRaw = projectTasks.filter(t => t.status === 'pending');
  const allTodoRaw = projectTasks.filter(t => t.status === 'todo' || (!t.status && !t.is_completed));
  const allInProgressRaw = projectTasks.filter(t => t.status === 'in_progress');
  const allDoneRaw = projectTasks.filter(t => t.status === 'done' || t.is_completed);

  const totalTasksCount = projectTasks.length;
  const overdueTasksList = projectTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done');
  const upcomingTasksList = projectTasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      const dueDate = new Date(t.due_date);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return dueDate >= today && dueDate <= nextWeek;
  });

  const applySorting = (rawList, orderMap) => {
      let sortedList = [...rawList];
      const currentOrder = orderMap[selectedProjectId] || [];
      if (currentOrder.length > 0) {
          sortedList.sort((a, b) => {
              let idxA = currentOrder.indexOf(a.id);
              let idxB = currentOrder.indexOf(b.id);
              if (idxA === -1) idxA = Infinity;
              if (idxB === -1) idxB = Infinity;
              return idxA - idxB;
          });
      }
      return sortedList;
  };

  const sortedPendingRaw = applySorting(allPendingRaw, pendingOrders);
  const sortedTodoRaw = applySorting(allTodoRaw, todoOrders);
  const sortedInProgressRaw = applySorting(allInProgressRaw, inProgressOrders);
  const sortedDoneRaw = applySorting(allDoneRaw, doneOrders);

  const totalPagesPending = Math.ceil(sortedPendingRaw.length / ITEMS_PER_PAGE) || 1;
  const totalPagesTodo = Math.ceil(sortedTodoRaw.length / ITEMS_PER_PAGE) || 1;
  const totalPagesInProgress = Math.ceil(sortedInProgressRaw.length / ITEMS_PER_PAGE) || 1;
  const totalPagesDone = Math.ceil(sortedDoneRaw.length / ITEMS_PER_PAGE) || 1;

  const paginatedPending = sortedPendingRaw.slice((pagePending - 1) * ITEMS_PER_PAGE, pagePending * ITEMS_PER_PAGE);
  const paginatedTodo = sortedTodoRaw.slice((pageTodo - 1) * ITEMS_PER_PAGE, pageTodo * ITEMS_PER_PAGE);
  const paginatedInProgress = sortedInProgressRaw.slice((pageInProgress - 1) * ITEMS_PER_PAGE, pageInProgress * ITEMS_PER_PAGE);
  const paginatedDone = sortedDoneRaw.slice((pageDone - 1) * ITEMS_PER_PAGE, pageDone * ITEMS_PER_PAGE);

  const totalTasks = projectTasks.length;
  const completedTasks = allDoneRaw.length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i); 
  
  const getTasksForDay = (day) => {
      return projectTasks.filter(t => {
          if (!t.due_date || t.status === 'pending') return false; 
          const d = new Date(t.due_date);
          return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
      });
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

// === CÁC HÀM XỬ LÝ DÀNH CHO ADMIN ===
  async function loadAdminUsers() {
      setIsLoadingAdmin(true);
      const res = await layDanhSachTaiKhoan();
      if (res.success) {
          setAdminUsers(res.data);
      } else {
          alert("Lỗi lấy danh sách: " + res.message);
      }
      setIsLoadingAdmin(false);
  }

  async function handleAdminCreateUser(e) {
      e.preventDefault();
      if (!adminForm.email || !adminForm.password) return;
      setIsLoadingAdmin(true);
      const res = await taoTaiKhoanMoi(adminForm.email, adminForm.password, adminForm.role);
      if (res.success) {
          setAdminForm({ email: '', password: '', role: 'viewer' });
          await loadAdminUsers();
      } else {
          alert("Lỗi tạo tài khoản: " + res.message);
      }
      setIsLoadingAdmin(false);
  }

  async function handleAdminDeleteUser(id) {
      if (!confirm('Xóa vĩnh viễn tài khoản này?')) return;
      setIsLoadingAdmin(true);
      const res = await xoaTaiKhoan(id);
      if (res.success) await loadAdminUsers();
      else alert("Lỗi xóa tài khoản: " + res.message);
      setIsLoadingAdmin(false);
  }

  async function handleAdminChangeRole(id, newRole) {
      setIsLoadingAdmin(true);
      const res = await doiQuyenTaiKhoan(id, newRole);
      if (res.success) await loadAdminUsers();
      else alert("Lỗi đổi quyền: " + res.message);
      setIsLoadingAdmin(false);
  }

  async function handleAdminResetPassword(id) {
      if (!newPasswordTemp.trim()) return;
      setIsLoadingAdmin(true);
      const res = await datLaiMatKhau(id, newPasswordTemp);
      if (res.success) {
          setEditingPasswordId(null);
          setNewPasswordTemp('');
          alert("Đổi mật khẩu thành công!");
      } else {
          alert("Lỗi đổi mật khẩu: " + res.message);
      }
      setIsLoadingAdmin(false);
  }

  // HÀM MỚI: CHUYỂN TRẠNG THÁI BẰNG TAY (DÀNH CHO ĐIỆN THOẠI)
  async function handleManualStatusChange(taskId, newStatus) {
    const quyenSua = isEditor || currentSpace === 'private';
    if (!quyenSua) return;
    const isCompleted = newStatus === 'done';
    const updatedTask = { ...viewingTask, status: newStatus, is_completed: isCompleted };
    
    setViewingTask(updatedTask);
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus, is_completed: isCompleted } : t));
    
    await supabase.from('tasks').update({ status: newStatus, is_completed: isCompleted }).eq('id', taskId);
    await taiDuLieuHienTai();
  }

  const bgMain = theme === 'dark' ? 'bg-[#0b0c10]' : 'bg-liquid-light';
  const panelBg = theme === 'dark' ? 'bg-[#181a20]/90 backdrop-blur-2xl' : 'bg-white/70 backdrop-blur-xl';
  const textMain = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const textMuted = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const cardBg = theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100 shadow-sm';
  return (
    <>
<style dangerouslySetInnerHTML={{__html: `
        .font-custom { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; }
        ::-webkit-scrollbar { width: 6px; height: 4px; }
        @media (max-width: 1024px) { .hide-scrollbar-on-mobile::-webkit-scrollbar { display: none; } .hide-scrollbar-on-mobile { -ms-overflow-style: none; scrollbar-width: none; } }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.4); border-radius: 10px; }
        .bg-liquid-light { background: linear-gradient(110deg, #bcf8e8 0%, #ffcdec 45%, #d1bbf9 100%); background-attachment: fixed; }
      `}} />

      <div className={`flex h-screen w-screen font-custom overflow-hidden transition-colors duration-500 ${bgMain} p-2 sm:p-3 gap-3 ${textMain}`}>
            
            {/* OVERLAY DI ĐỘNG (Lớp phủ làm mờ nền khi mở menu trên điện thoại) */}
            {isMobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* SIDEBAR (Responsive: Ẩn đi trên điện thoại, trượt ra khi bấm nút) */}
            <aside className={`absolute md:relative z-[200] md:z-auto h-[calc(100%-1rem)] sm:h-[calc(100%-1.5rem)] md:h-auto w-64 flex flex-col shrink-0 rounded-2xl shadow-2xl md:shadow-sm overflow-hidden transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'} ${panelBg} ${theme === 'dark' ? 'border border-white/5' : 'border border-white/40'}`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-white/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm text-sm">VH</div>
                <div>
                  <h1 className="text-base font-bold tracking-tight">ICT GIA LAI TÂY</h1>
                  <p className={`text-[8px] uppercase font-bold tracking-widest text-blue-500`}>{userRole}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-xs p-1.5 opacity-50 hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-md transition-all font-bold">Thoát</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 px-2 ${textMuted}`}>Danh sách kế hoạch</div>
            {projects.map((project, index) => (
              <div key={project.id} className="relative group w-full">
                {editingProjectId === project.id ? (
                  <div className="px-3 py-1.5 rounded-xl border border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <input autoFocus value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleRenameProject(project.id) }} onBlur={() => handleRenameProject(project.id)} className="w-full bg-transparent text-sm font-semibold focus:outline-none dark:text-white text-slate-800" />
                  </div>
                ) : (
<button onClick={() => setSelectedProjectId(project.id)} className={`w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-semibold flex items-center justify-between min-w-0 gap-2 ${selectedProjectId === project.id ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-blue-600 text-white shadow-md border border-transparent') : (theme === 'dark' ? 'hover:bg-white/5 text-slate-300 border border-transparent' : 'hover:bg-white/50 text-slate-700 border border-transparent')}`}>
                    <span className="truncate text-[13px] block flex-1 min-w-0" title={`${index + 1}. ${project.title}`}>{index + 1}. {project.title}</span>
                    <div className="relative w-6 h-5 flex items-center justify-end shrink-0 overflow-hidden">
                     <span className={`absolute transition-all duration-200 group-hover:opacity-0 group-hover:translate-x-4 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${selectedProjectId === project.id ? (theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white') : (theme === 'dark' ? 'bg-white/10' : 'bg-black/5')}`}>{hienThiTasks.filter(t => t.project_id === project.id).length}</span>
                        {(isEditor || currentSpace === 'private') && (
                          <span onClick={(e) => { e.stopPropagation(); setEditingProjectId(project.id); setEditProjectName(project.title); }} className={`absolute transition-all duration-200 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/20 text-xs ${selectedProjectId === project.id ? (theme === 'dark' ? 'text-blue-400' : 'text-white') : textMuted}`}>✎</span>
                        )}
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>

{/* BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN CẤP CAO */}
          {isAdmin && (
            <div className={`p-3 border-t ${theme === 'dark' ? 'border-white/5' : 'border-white/30'}`}>
              <button onClick={() => { setIsAdminModalOpen(true); loadAdminUsers(); }} className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm border ${theme === 'dark' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/30' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                ⚙️ Quản trị hệ thống
              </button>
            </div>
          )}

{(isEditor || currentSpace === 'private') && (
            <div className={`p-3 border-t ${theme === 'dark' ? 'border-white/5' : 'border-white/30'}`}>
              <button onClick={() => setModalType('project')} className={`w-full px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'}`}>+ Tạo mảng mới</button>
            </div>
          )}
        </aside>

        <main className={`flex-1 flex flex-col relative w-full min-w-0 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${panelBg} ${theme === 'dark' ? 'border border-white/5' : 'border border-white/40'}`}>
              
              {/* THANH HEADER ĐIỀU HƯỚNG TỐI ƯU MOBILE (Tự động cuộn/xuống dòng trên màn hình nhỏ) */}
              <div className={`w-full flex flex-col xl:flex-row justify-between items-start xl:items-center p-4 sm:p-5 pb-0 shrink-0 gap-3 z-40 relative transition-all duration-700`}>
                
                <div className="flex w-full xl:w-auto flex-1 max-w-xl items-center gap-3 relative">
                  {/* NÚT MENU HAMBURGER (CHỈ HIỆN TRÊN MOBILE) */}
                  <button onClick={() => setIsMobileMenuOpen(true)} className={`md:hidden shrink-0 p-2 rounded-xl border shadow-sm transition-colors ${theme === 'dark' ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                  </button>

                  <div className={`flex-1 flex items-center px-4 py-2 rounded-full shadow-sm backdrop-blur-xl border transition-all ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white focus-within:border-blue-500/50 focus-within:bg-black/50' : 'bg-white/60 border-white/60 text-slate-800 focus-within:border-blue-400 focus-within:bg-white'}`}>
                <span className="opacity-50 mr-2 text-sm">🔍</span>
                <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Tìm kiếm công việc, tài liệu..." className="flex-1 bg-transparent border-none focus:outline-none text-sm font-normal placeholder-opacity-50" />
                {searchQuery && <button onClick={() => {setSearchQuery(''); setIsSearchOpen(false)}} className="opacity-50 hover:opacity-100 text-sm font-bold ml-2">✕</button>}
              </div>

              {isSearchOpen && searchQuery && (
                <div className={`absolute top-full left-0 right-0 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 z-[100] ${theme === 'dark' ? 'bg-[#1a1a24]/95 border-white/10' : 'bg-white/95 border-gray-200'}`}>
                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center text-xs font-normal opacity-50 uppercase tracking-widest">Không tìm thấy kết quả.</div>
                  ) : (
                    <div className="p-2 space-y-1">
                      <div className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${textMuted}`}>Kết quả ({searchResults.length})</div>
                      {searchResults.map(task => {
                        const proj = projects.find(p => p.id === task.project_id);
                        const matchDesc = task.description?.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchedNotes = getSafeArray(task.notes).filter(n => n.text?.toLowerCase().includes(searchQuery.toLowerCase()));
                        const matchedFiles = getSafeArray(task.attachments).filter(f => f.name?.toLowerCase().includes(searchQuery.toLowerCase()));

                        return (
                          <button key={task.id} onClick={() => handleSelectSearchResult(task)} className={`w-full text-left p-3 rounded-xl flex flex-col gap-1.5 transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                            <div className="flex justify-between items-center w-full">
                              <span className="text-sm font-normal truncate flex-1 pr-3">{highlightText(task.title, searchQuery)}</span>
                              <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shrink-0 ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{proj ? proj.title : 'Không rõ'}</span>
                            </div>
                            <div className="text-[11px] opacity-80 space-y-1">
                              {matchDesc && <div className="line-clamp-1"><span className="opacity-50">Mô tả:</span> {highlightText(task.description, searchQuery)}</div>}
                              {matchedNotes.map((n, i) => <div key={`n-${i}`} className="line-clamp-1"><span className="opacity-50">📌</span> {highlightText(n.text, searchQuery)}</div>)}
                              {matchedFiles.map((f, i) => <div key={`f-${i}`} className="line-clamp-1"><span className="opacity-50">📎</span> {highlightText(f.name, searchQuery)}</div>)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
</div>

                {/* KHU VỰC CÁC NÚT ĐIỀU HƯỚNG BÊN PHẢI (Cuộn ngang trên Mobile) */}
                <div className="w-full xl:w-auto flex overflow-x-auto gap-3 items-center pb-2 xl:pb-0 custom-scrollbar hide-scrollbar-on-mobile">
                  {/* HAI TAB CHUYỂN ĐỔI KHÔNG GIAN */}
                  <div className={`flex shrink-0 p-1 rounded-full shadow-inner border backdrop-blur-md ${theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/50 border-white/60'}`}>
                    <button 
                      onClick={() => setCurrentSpace('shared')}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${currentSpace === 'shared' ? 'bg-blue-500 text-white shadow-md' : theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}
                    >
                      Tổng hợp
                    </button>
                    <button 
                      onClick={() => setCurrentSpace('private')}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${currentSpace === 'private' ? 'bg-purple-500 text-white shadow-md' : theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}
                    >
                      Cá nhân
                    </button>
                  </div>

                  {selectedProject && (
                    <div className={`flex shrink-0 items-center p-1 rounded-full border ${theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/40 border-white/60 shadow-sm'}`}>
                        <button onClick={() => setViewMode('kanban')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'kanban' ? (theme === 'dark' ? 'bg-white/20 text-white shadow' : 'bg-white text-slate-800 shadow-sm') : 'opacity-50 hover:opacity-100'}`}>Bảng</button>
                        <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'calendar' ? (theme === 'dark' ? 'bg-white/20 text-white shadow' : 'bg-white text-slate-800 shadow-sm') : 'opacity-50 hover:opacity-100'}`}>Lịch</button>
                        <button onClick={() => setViewMode('dashboard')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'dashboard' ? (theme === 'dark' ? 'bg-white/20 text-white shadow' : 'bg-white text-slate-800 shadow-sm') : 'opacity-50 hover:opacity-100'}`}>Thống kê</button>
                    </div>
                  )}
                  
                  <button onClick={toggleTheme} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border shadow-sm outline-none shrink-0 overflow-hidden relative ml-auto xl:ml-0 ${theme === 'dark' ? 'bg-black/50 border-white/10 text-yellow-400 hover:bg-black/70' : 'bg-white border-white/60 text-slate-600 hover:bg-white'}`}>
                     <div className={`absolute transition-all duration-500 ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div>
                     <div className={`absolute transition-all duration-500 ${theme === 'light' ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></div>
                  </button>
                </div>
              </div>

          <div className="flex-1 overflow-y-auto">
            {!selectedProject ? (
              <div className="h-full flex flex-col items-center justify-center p-8"><div className={`text-6xl mb-4 ${theme === 'dark' ? 'opacity-20' : 'opacity-40'}`}>📄</div><p className="text-sm font-semibold opacity-50">Hãy chọn danh sách bên trái hoặc sử dụng thanh tìm kiếm.</p></div>
            ) : (
              <div className="max-w-[1600px] mx-auto p-4 sm:p-5 flex flex-col h-full relative">
                
                {/* TOÀN BỘ HEADER VÀ TABS KHÔNG GIAN */}
                <div className="mb-4 shrink-0 space-y-4">
                  
                  {/* DÒNG THỨ NHẤT: TIÊU ĐỀ VÀ CÁC NÚT THAO TÁC */}
                  <div className="flex justify-between items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-3">
                    <h2 className="text-2xl font-extrabold tracking-tight truncate flex-1" title={selectedProject.title}>{selectedProject.title}</h2>
                    
                    {/* NÚT BẤM ĐƯỢC PHÂN QUYỀN */}
                    <div className="flex gap-2 shrink-0">
                      {(isEditor || currentSpace === 'private') && (
                        <button onClick={() => moModalTaoMoi(selectedProject.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>+ Thêm công việc</button>
                      )}
                      {(isEditor || currentSpace === 'private') && (
                        <button onClick={() => xoaMangCongViec(selectedProject.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${theme === 'dark' ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'text-red-500 bg-white/50 hover:bg-white text-red-600 border border-white/60'}`}>Xóa mảng</button>
                      )}
                    </div>
                  </div>

                  {/* THANH TIẾN ĐỘ */}
                  {viewMode === 'kanban' && (
                    <div className={`p-3 rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-white/60 border border-white/50 shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tiến độ:</span><span className="text-sm font-black text-blue-500">{progressPercent}%</span></div>
                        <div className={`w-full rounded-full h-1.5 relative overflow-hidden ${theme === 'dark' ? 'bg-black/40' : 'bg-black/5'}`}><div className={`h-full rounded-full transition-all duration-700 ease-out ${progressPercent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }}></div></div>
                    </div>
                  )}
                </div>
                {viewMode === 'kanban' ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pb-4 min-h-[500px]">
                    
                    {/* CỘT 1: VĂN BẢN CHỜ */}
                    <div className={`flex flex-col rounded-2xl p-3 h-full max-h-[75vh] ${theme === 'dark' ? 'bg-black/20 border border-white/5' : 'bg-purple-50/50 border border-purple-100 shadow-inner'}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'pending')}>
                      <div className="flex items-center justify-between px-1 mb-3 shrink-0">
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">Văn bản chờ</span>
                           {/* CHÌA KHÓA: Cho phép Cấp 3 thấy nút Thêm nếu ở Căn phòng riêng */}
                           {(isEditor || currentSpace === 'private') && (
                             <label className="cursor-pointer flex items-center justify-center w-5 h-5 rounded-full bg-purple-200/50 text-purple-700 hover:bg-purple-200 transition-colors shadow-sm">
                               <span className="font-bold text-xs">+</span>
                               <input type="file" multiple className="hidden" onChange={handleDirectUploadPendingFile} />
                             </label>
                           )}
                         </div>
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-white/10 text-slate-300' : 'bg-purple-100 text-purple-700'}`}>{sortedPendingRaw.length}</span>
                      </div>

                      {isUploadingPending && (
                        <div className="mb-2 p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <div className="flex justify-between text-[8px] font-bold mb-1 text-purple-600"><span>Đang tải tệp lên...</span><span>{pendingUploadProgress}%</span></div>
                          <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${pendingUploadProgress}%` }}></div></div>
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                         {paginatedPending.map((task, index) => <PendingDocCard key={task.id} task={task} index={index} isEditor={isEditor} />)}
                         {paginatedPending.length === 0 && !isUploadingPending && <div className="text-center italic opacity-40 text-xs mt-6">Rỗng</div>}
                      </div>
                      {totalPagesPending > 1 && (
                         <div className="flex justify-between items-center shrink-0 mt-3 pt-3 border-t border-purple-200/50 dark:border-white/10">
                            <button disabled={pagePending === 1} onClick={() => setPagePending(p => p - 1)} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white/50 hover:bg-white'}`}>Trước</button>
                            <span className="text-[10px] font-bold opacity-60 text-purple-700 dark:text-purple-400">{pagePending}/{totalPagesPending}</span>
                            <button disabled={pagePending === totalPagesPending} onClick={() => setPagePending(p => p + 1)} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white/50 hover:bg-white'}`}>Sau</button>
                         </div>
                      )}
                    </div>

                    {/* CỘT 2: CHƯA LÀM */}
                    <div className={`flex flex-col rounded-2xl p-3 h-full max-h-[75vh] ${theme === 'dark' ? 'bg-black/20 border border-white/5' : 'bg-white/40 border border-white/50 shadow-inner'}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'todo')}>
                      <div className="flex items-center justify-between px-1 mb-3 shrink-0"><span className="text-xs font-extrabold uppercase tracking-widest">Chưa làm</span><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>{sortedTodoRaw.length}</span></div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                         {paginatedTodo.map((task, index) => <TaskCard key={task.id} task={task} index={index} isEditor={isEditor} />)}
                         {paginatedTodo.length === 0 && <div className="text-center italic opacity-40 text-xs mt-6">Rỗng</div>}
                      </div>
                      {totalPagesTodo > 1 && (
                         <div className={`flex justify-between items-center shrink-0 mt-3 pt-3 border-t ${theme === 'dark' ? 'border-white/10' : 'border-white/50'}`}>
                            <button disabled={pageTodo === 1} onClick={() => setPageTodo(p => p - 1)} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white/50 hover:bg-white'}`}>Trước</button>
                            <span className="text-[10px] font-bold opacity-60">{pageTodo}/{totalPagesTodo}</span>
                            <button disabled={pageTodo === totalPagesTodo} onClick={() => setPageTodo(p => p + 1)} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white/50 hover:bg-white'}`}>Sau</button>
                         </div>
                      )}
                    </div>

                    {/* CỘT 3: ĐANG LÀM */}
                    <div className={`flex flex-col rounded-2xl p-3 h-full max-h-[75vh] ${theme === 'dark' ? 'bg-black/20 border border-white/5' : 'bg-blue-50/40 border border-blue-100 shadow-inner'}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'in_progress')}>
                      <div className="flex items-center justify-between px-1 mb-3 shrink-0"><span className="text-xs font-extrabold uppercase tracking-widest text-blue-500">Đang làm</span><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100 text-blue-700'}`}>{sortedInProgressRaw.length}</span></div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                         {paginatedInProgress.map((task, index) => <TaskCard key={task.id} task={task} index={index} isEditor={isEditor} />)}
                         {paginatedInProgress.length === 0 && <div className="text-center italic opacity-40 text-xs mt-6">Rỗng</div>}
                      </div>
                      {totalPagesInProgress > 1 && (
                         <div className={`flex justify-between items-center shrink-0 mt-3 pt-3 border-t ${theme === 'dark' ? 'border-white/10' : 'border-blue-200/50'}`}>
                            <button disabled={pageInProgress === 1} onClick={() => setPageInProgress(p => p - 1)} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-blue-400' : 'bg-white/50 hover:bg-white text-blue-700'}`}>Trước</button>
                            <span className="text-[10px] font-bold opacity-60 text-blue-600">{pageInProgress}/{totalPagesInProgress}</span>
                            <button disabled={pageInProgress === totalPagesInProgress} onClick={() => setPageInProgress(p => p + 1)} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-blue-400' : 'bg-white/50 hover:bg-white text-blue-700'}`}>Sau</button>
                         </div>
                      )}
                    </div>

                    {/* CỘT 4: ĐÃ LÀM */}
                    <div className={`flex flex-col rounded-2xl p-3 h-full max-h-[75vh] ${theme === 'dark' ? 'bg-black/20 border border-white/5' : 'bg-green-50/40 border border-green-100 shadow-inner'}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'done')}>
                      <div className="flex items-center justify-between px-1 mb-3 shrink-0"><span className="text-xs font-extrabold uppercase tracking-widest text-green-500">Đã làm</span><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100 text-green-700'}`}>{sortedDoneRaw.length}</span></div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                         {paginatedDone.map((task, index) => <TaskCard key={task.id} task={task} index={index} isEditor={isEditor} />)}
                         {paginatedDone.length === 0 && <div className="text-center italic opacity-40 text-xs mt-6">Rỗng</div>}
                      </div>
                      {totalPagesDone > 1 && (
                         <div className={`flex justify-between items-center shrink-0 mt-3 pt-3 border-t ${theme === 'dark' ? 'border-white/10' : 'border-green-200/50'}`}>
                            <button disabled={pageDone === 1} onClick={() => setPageDone(p => p - 1)} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-green-400' : 'bg-white/50 hover:bg-white text-green-700'}`}>Trước</button>
                            <span className="text-[10px] font-bold opacity-60 text-green-600">{pageDone}/{totalPagesDone}</span>
                            <button disabled={pageDone === totalPagesDone} onClick={() => setPageDone(p => p + 1)} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-green-400' : 'bg-white/50 hover:bg-white text-green-700'}`}>Sau</button>
                         </div>
                      )}
                    </div>
                  </div>
                ) : viewMode === 'calendar' ? (
                  // BẢNG VIEW LỊCH (CALENDAR)
                  <div className={`flex-1 flex flex-col rounded-2xl p-5 transition-all ${theme === 'dark' ? 'bg-black/20 border border-white/5' : 'bg-white/60 border border-white/50 shadow-sm backdrop-blur-md'}`}>
                     <div className="flex justify-between items-center mb-5">
                        <button onClick={prevMonth} className="w-8 h-8 rounded-full font-bold text-sm bg-white/80 hover:bg-white shadow-sm flex items-center justify-center">‹</button>
                        <h3 className="text-base font-bold tracking-widest uppercase">Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}</h3>
                        <button onClick={nextMonth} className="w-8 h-8 rounded-full font-bold text-sm bg-white/80 hover:bg-white shadow-sm flex items-center justify-center">›</button>
                     </div>
                     <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-bold uppercase tracking-widest opacity-40"><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div className="text-red-500">CN</div></div>
                     <div className={`grid grid-cols-7 gap-px flex-1 bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden`}>
                        {blanksArray.map((_, i) => <div key={`blank-${i}`} className={`bg-slate-50 dark:bg-[#1a1a24] opacity-50`}></div>)}
                        {daysArray.map(day => {
                            const tasksForDay = getTasksForDay(day);
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                            return (
                                <div key={day} className={`p-1.5 sm:p-2 flex flex-col transition-colors ${
                                    isToday 
                                        ? (theme === 'dark' ? 'bg-blue-600/20 ring-1 ring-inset ring-blue-500' : 'bg-blue-50 ring-1 ring-inset ring-blue-200') 
                                        : (theme === 'dark' ? 'bg-[#1a1a24]' : 'bg-white/80')
                                } ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-white'}`}>
                                    <div className="flex justify-end mb-1">
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                                            isToday ? 'bg-blue-500 text-white shadow-md' : (theme === 'dark' ? 'text-slate-300' : 'text-slate-600')
                                        }`}>{day}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-[2px] pr-1 custom-scrollbar">
                                        {tasksForDay.map(t => {
                                            let dotColor = theme === 'dark' ? 'bg-slate-500' : 'bg-slate-300';
                                            if (t.status === 'in_progress') dotColor = 'bg-blue-500';
                                            if (t.status === 'done' || t.is_completed) dotColor = 'bg-green-500';

                                            return (
                                                <div 
                                                  key={t.id} 
                                                  onClick={() => moModalXemChiTiet(t)} 
                                                  title={t.title}
                                                  className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-white/20 text-slate-300 hover:text-white' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}></div>
                                                    <span className={`text-[9.5px] font-medium truncate w-full ${t.status==='done'?'line-through opacity-50':''}`}>
                                                        {t.title}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                     </div>
                  </div>
                ) : (
                  // BẢNG VIEW THỐNG KÊ (DASHBOARD)
                  <div className={`flex-1 flex flex-col rounded-2xl p-5 sm:p-8 transition-all overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-black/20 border border-white/5' : 'bg-white/60 border border-white/50 shadow-sm backdrop-blur-md'}`}>
                     <h3 className="text-xl font-bold mb-6">Tổng quan tiến độ</h3>
                     
                     <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className={`p-4 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-100'}`}>
                           <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${textMuted}`}>Tổng số công việc</p>
                           <h4 className="text-3xl font-black">{totalTasksCount}</h4>
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm border border-b-4 border-b-purple-500 ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-100'}`}>
                           <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-purple-500`}>Văn bản chờ</p>
                           <h4 className="text-3xl font-black">{allPendingRaw.length}</h4>
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm border border-b-4 border-b-blue-500 ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-100'}`}>
                           <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-blue-500`}>Đang thực hiện</p>
                           <h4 className="text-3xl font-black">{allInProgressRaw.length}</h4>
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm border border-b-4 border-b-green-500 ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-100'}`}>
                           <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-green-500`}>Đã hoàn thành</p>
                           <h4 className="text-3xl font-black">{allDoneRaw.length}</h4>
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm border border-b-4 border-b-red-500 ${theme === 'dark' ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                           <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-red-500`}>Đang bị trễ hạn</p>
                           <h4 className="text-3xl font-black text-red-500">{overdueTasksList.length}</h4>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`flex flex-col rounded-2xl p-5 border ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Công việc quá hạn</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{overdueTasksList.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[400px]">
                                {overdueTasksList.length === 0 ? (
                                    <div className={`text-center p-8 text-xs italic ${textMuted}`}>Tuyệt vời, không có việc nào bị trễ! 🎉</div>
                                ) : (
                                    overdueTasksList.map(task => (
                                        <div key={task.id} onClick={() => moModalXemChiTiet(task)} className={`group p-3 rounded-xl border border-red-200 cursor-pointer transition-colors ${theme === 'dark' ? 'bg-red-950/20 hover:bg-red-900/40' : 'bg-red-50 hover:bg-red-100'}`}>
                                            <h4 className="text-xs font-bold mb-1 truncate">{task.title}</h4>
                                            <p className="text-[10px] font-bold text-red-500">Trễ từ: {new Date(task.due_date).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className={`flex flex-col rounded-2xl p-5 border ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Sắp đến hạn (7 ngày)</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{upcomingTasksList.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[400px]">
                                {upcomingTasksList.length === 0 ? (
                                    <div className={`text-center p-8 text-xs italic ${textMuted}`}>Không có công việc nào sắp tới hạn.</div>
                                ) : (
                                    upcomingTasksList.map(task => (
                                        <div key={task.id} onClick={() => moModalXemChiTiet(task)} className={`group p-3 rounded-xl border cursor-pointer transition-colors ${theme === 'dark' ? 'bg-black/30 border-white/5 hover:bg-white/5' : 'bg-slate-50 border-gray-200 hover:bg-slate-100'}`}>
                                            <h4 className="text-xs font-bold mb-1 truncate">{task.title}</h4>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${task.status === 'todo' ? textMuted : 'text-blue-500'}`}>{task.status === 'todo' ? 'Chưa làm' : 'Đang làm'}</span>
                                                <p className="text-[10px] font-bold text-yellow-600">Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* === TOOLTIP HIỂN THỊ CHI TIẾT KHI RÊ CHUỘT === */}
                {hoveredTaskInfo && (() => {
                  const task = hoveredTaskInfo.task;
                  const safeNotes = getSafeArray(task.notes);
                  const safeAttachments = getSafeArray(task.attachments);
                  const inputFiles = safeAttachments.filter(f => f.type !== 'output');
                  const outputFiles = safeAttachments.filter(f => f.type === 'output');

                  return (
                    <div 
                       className={`fixed z-[999] pointer-events-none p-5 rounded-2xl shadow-2xl border transition-all duration-300 ease-out w-[350px] max-h-[70vh] flex flex-col animate-in fade-in zoom-in-95
                         ${theme === 'dark' ? 'bg-[#181a20]/95 backdrop-blur-xl border-white/10' : 'bg-white/95 backdrop-blur-xl border-gray-200'}`}
                       style={{ left: hoveredTaskInfo.left, top: hoveredTaskInfo.top }}
                    >
                       <h4 className={`text-sm font-bold mb-4 leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{task.title}</h4>
                       <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                           <div className="mb-4">
                               <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1.5 ${textMuted}`}>Mô tả công việc</span>
                               <p className={`text-xs leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{task.description || <span className="italic opacity-50">Chưa có mô tả...</span>}</p>
                           </div>
                           <div className={`border-t border-dashed my-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'}`}></div>
                           <div className="mb-4">
                               <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 block mb-2">📥 Văn bản đến</span>
                               {inputFiles.length > 0 ? (
                                   <div className="space-y-1.5">
                                       {inputFiles.map((file, i) => (
                                           <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                                               {getFileIcon(file.name, 'small')}
                                               <span className={`text-[10px] truncate ${theme==='dark'?'text-slate-200':'text-slate-700'}`}>{file.name}</span>
                                           </div>
                                       ))}
                                   </div>
                               ) : <span className={`text-[10px] italic ${textMuted}`}>Chưa có...</span>}
                           </div>
                           <div className="mb-4">
                               <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 block mb-2">✅ Báo cáo / Kết quả</span>
                               {outputFiles.length > 0 ? (
                                   <div className="space-y-1.5">
                                       {outputFiles.map((file, i) => (
                                           <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${theme === 'dark' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
                                               {getFileIcon(file.name, 'small')}
                                               <span className={`text-[10px] font-bold truncate ${theme==='dark'?'text-green-400':'text-green-600'}`}>{file.name}</span>
                                           </div>
                                       ))}
                                   </div>
                               ) : <span className={`text-[10px] italic ${textMuted}`}>Chưa có...</span>}
                           </div>
                           {safeNotes.length > 0 && (
                               <div>
                                   <div className={`border-t border-dashed my-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'}`}></div>
                                   <span className={`text-[10px] font-bold uppercase tracking-widest block mb-3 ${textMuted}`}>Ghi chú trao đổi</span>
                                   <div className="space-y-3">
                                      {safeNotes.slice().reverse().map((note, idx) => (
                                        <div key={idx} className="pl-3 border-l-2 border-yellow-400">
                                          <div className={`text-[9px] mb-0.5 ${textMuted}`}>{new Date(note.created_at).toLocaleString('vi-VN')}</div>
                                          <div className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{note.text}</div>
                                        </div>
                                      ))}
                                   </div>
                               </div>
                           )}
                       </div>
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        </main>

        {/* MODAL MẢNG / TẠO MỚI */}
        {(modalType === 'project' || modalType === 'task_new') && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`relative rounded-2xl shadow-2xl p-6 w-full ${modalType === 'project' ? 'max-w-md' : 'max-w-2xl'} ${theme === 'dark' ? 'bg-[#1a1a24] border border-white/10 text-white' : 'bg-white border border-gray-200 text-slate-800'}`}>
              <button onClick={dongModalTask} className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-white/10 hover:bg-red-500 text-white' : 'bg-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600'}`}>✕</button>
              <h2 className="text-xl font-bold mb-4">{modalType === 'project' ? 'Tạo kế hoạch mới' : 'Thêm công việc mới'}</h2>
              {/* CÔNG TẮC: CHỈ HIỆN VỚI NGƯỜI DÙNG CẤP 1 VÀ 2, ẨN VỚI CẤP 3 */}
            {isEditor && modalType === 'task_new' && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-200 dark:border-white/10 mb-4 bg-blue-50/50 dark:bg-blue-900/10">
                <div>
                  <p className="text-sm font-bold">Đăng lên Ngôi nhà chung?</p>
                  <p className="text-xs text-gray-500">Tắt công tắc này để chỉ mình bạn nhìn thấy (Căn phòng riêng)</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={isSharedInput} 
                  onChange={(e) => setIsSharedInput(e.target.checked)}
                  className="w-5 h-5 accent-blue-500 cursor-pointer"
                />
              </div>
            )}
              {modalType === 'project' ? (
                <form onSubmit={luuMangCongViec}>
                  <input autoFocus required value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Nhập tên kế hoạch..." className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none mb-4 font-normal ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-white/70 border-gray-200 text-slate-800'}`} />
                  <div className="flex justify-end gap-3"><button type="button" onClick={dongModalTask} className="px-5 py-2 font-bold text-sm rounded-full">Hủy</button><button type="submit" className="px-5 py-2 rounded-full text-sm font-bold bg-blue-600 text-white">Xác nhận</button></div>
                </form>
              ) : (
                <form onSubmit={xuLyTaoViecMoi} className="space-y-4">
                  <input required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Tên công việc..." className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 text-base font-normal outline-none ${theme === 'dark' ? 'bg-[#121212] border-white/20 text-white' : 'bg-white border-gray-300 text-slate-800'}`} />
                  <div><label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-50">Mô tả</label>
                  <textarea rows="3" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Nhập mô tả chi tiết..." className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-[#121212] border-white/20 text-white' : 'bg-white border-gray-300 text-slate-800'}`} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-50">Hạn chót</label><input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} className={`w-full p-2.5 rounded-xl border outline-none ${theme === 'dark' ? 'bg-[#121212] border-white/20 text-white [color-scheme:dark]' : 'bg-white border-gray-300 text-slate-800'}`} /></div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block opacity-50">Tệp văn bản đến</label>
                      <label onDragOver={handleDragOverFile} onDrop={handleDropFileNew} className={`cursor-pointer flex items-center justify-center w-full h-[42px] border-2 border-dashed rounded-xl transition-colors hover:border-blue-500 ${theme === 'dark' ? 'border-white/20 hover:bg-white/5 text-blue-400' : 'border-gray-300 hover:bg-blue-50 text-blue-600'}`}>
                        <span className="text-xs font-bold">+ Chọn hoặc Kéo thả tệp</span>
                        <input type="file" multiple onChange={e => setTaskFiles(Array.from(e.target.files))} className="hidden" />
                      </label>
                      {isUploading && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[9px] font-bold mb-1"><span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Đang tải...</span><span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>{uploadProgress}%</span></div>
                          <div className={`w-full h-1 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-black/40' : 'bg-slate-200'}`}><div className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>
                        </div>
                      )}
                      {!isUploading && taskFiles.length > 0 && <div className="mt-1.5 text-[10px] font-bold text-green-500">Đã chọn {taskFiles.length} tệp</div>}
                    </div>
                  </div>
                 <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <button type="button" onClick={dongModalTask} className="px-5 py-2 text-sm font-bold">Hủy</button>
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.preventDefault();
                        
                          xuLyTaoViecMoi(e); 
                        }} 
                        className="px-5 py-2 rounded-full text-sm font-bold bg-blue-600 text-white shadow-md hover:bg-blue-500"
                      >
                        {isUploading ? 'Đang tải...' : 'Tạo mới'}
                      </button>
                    </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL TRÌNH XEM FILE DÀNH CHO VĂN BẢN CHỜ */}
        {modalType === 'file_viewer' && selectedFile && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-200">
             <div className="relative w-full max-w-5xl h-full flex flex-col bg-[#121212] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/50 shrink-0">
                   <div className="flex items-center gap-3">
                      {getFileIcon(selectedFile.name, 'small')}
                      <span className="text-white font-bold text-sm truncate">{selectedFile.name}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <a href={selectedFile.url} target="_blank" className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors">Tải xuống</a>
                      <button onClick={() => { setModalType(null); setSelectedFile(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 text-white transition-colors">✕</button>
                   </div>
                </div>
                <div className="flex-1 w-full bg-slate-100 dark:bg-[#0b0c10] relative">
{selectedFile.name.toLowerCase().match(/\.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/i) ? (
                        <iframe src={selectedFile.name.toLowerCase().endsWith('pdf') ? `https://docs.google.com/gview?url=${encodeURIComponent(selectedFile.url)}&embedded=true` : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedFile.url)}`} className="w-full h-full border-none bg-white" />
                    ) : selectedFile.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <div className="w-full h-full flex items-center justify-center p-6"><img src={selectedFile.url} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" /></div>
                    ) : selectedFile.name.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) ? (
                        <div className="w-full h-full flex items-center justify-center p-0 bg-black/95"><video src={selectedFile.url} controls autoPlay className="w-full h-full object-contain outline-none shadow-2xl" /></div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500"><div className="text-5xl mb-4">📄</div><p>Hệ thống không hỗ trợ xem trước định dạng này.</p></div>
                    )}
                </div>
             </div>
          </div>
        )}

        {/* MODAL CHI TIẾT CÔNG VIỆC CHUẨN */}
          {modalType === 'task_view' && viewingTask && (() => {
            const viewNotes = getSafeArray(viewingTask.notes);
            const viewAttachments = getSafeArray(viewingTask.attachments);
            
            const inputFiles = viewAttachments.filter(f => f.type !== 'output');
            const outputFiles = viewAttachments.filter(f => f.type === 'output');
            
            // ĐÂY LÀ CHÌA KHÓA: Cho phép Cấp 3 sửa nếu đang ở Căn phòng riêng
            const quyenSua = isEditor || currentSpace === 'private';
            
            return (
              <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
<div 
                  ref={modalRef}
                  className={`absolute flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-[#1a1a24]/95 border-white/10 text-white' : 'bg-white/95 border-white/50 text-slate-800'}`}
                  style={{ resize: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'both' : 'none', minWidth: '320px' }}
                >
                  {/* NÚT "X" ĐƯỢC DỜI LÊN ĐỈNH ĐỂ LUÔN NHÌN THẤY TRÊN ĐIỆN THOẠI */}
                  <button onClick={dongModalTask} className={`absolute top-8 right-3 md:top-6 md:right-4 z-[150] w-8 h-8 rounded-full shadow-lg flex items-center justify-center font-bold transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-red-500 text-white' : 'bg-white/90 hover:bg-red-50 text-red-500'}`}>✕</button>

                  <div 
                     className={`absolute top-0 left-0 w-full h-6 cursor-move flex items-center justify-center z-[110] transition-colors ${theme === 'dark' ? 'bg-black/40 hover:bg-black/60' : 'bg-slate-200 hover:bg-slate-300'}`}
                     onMouseDown={handleModalDragStart}
                     title="Kéo thả để di chuyển (Chỉ hỗ trợ máy tính)"
                  >
                      <div className="w-10 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                  </div>
  
                 <div className={`flex-1 md:flex-none w-full md:w-[45%] flex flex-col border-b md:border-b-0 md:border-r ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} p-4 md:p-6 pt-10 space-y-6 overflow-y-auto custom-scrollbar`} onMouseDown={(e) => e.stopPropagation()}>
                      
                      <div className="group relative">
                        {editField === 'title' && quyenSua ? (
                          <div className="flex flex-col gap-2">
                              <textarea value={tempValue} onChange={e => setTempValue(e.target.value)} rows="2" className={`w-full p-2 text-lg border rounded-xl outline-none ${theme === 'dark' ? 'bg-[#121212] border-white/20 text-white' : 'bg-white border-gray-300 text-slate-800'}`} />
                              <div className="flex justify-end gap-2"><button onClick={() => setEditField(null)} className="px-3 py-1">Hủy</button><button onClick={() => saveInlineEdit('title')} className="px-3 py-1 bg-blue-600 text-white rounded-lg">Lưu</button></div>
                          </div>
                        ) : (
                       <div className="flex justify-between items-start"><h2 className="text-xl font-normal leading-tight pr-8">{viewingTask.title}</h2>{quyenSua && <button onClick={() => { setEditField('title'); setTempValue(viewingTask.title); }} className={`opacity-0 group-hover:opacity-100 text-[10px] font-bold px-2 py-1 rounded shrink-0 ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-blue-600' : 'bg-slate-200 text-blue-600'}`}>✎ Sửa</button>}</div>
                        )}
                      </div>

                      {/* KHU VỰC CHUYỂN TRẠNG THÁI DÀNH CHO MOBILE */}
                      <div className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-500/20">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Trạng thái:</span>
                        <select 
                          disabled={!quyenSua}
                          value={viewingTask.status || 'todo'}
                          onChange={(e) => handleManualStatusChange(viewingTask.id, e.target.value)}
                          className={`flex-1 text-xs font-bold p-2 rounded-lg outline-none border cursor-pointer appearance-none transition-colors ${theme === 'dark' ? 'bg-black/50 border-white/20 text-white focus:border-blue-500' : 'bg-white border-blue-200 text-blue-700 focus:border-blue-500'}`}
                        >
                          <option value="pending">Văn bản chờ</option>
                          <option value="todo">Chưa làm</option>
                          <option value="in_progress">Đang làm</option>
                          <option value="done">Đã hoàn thành</option>
                        </select>
                      </div>
                      
                      {/* HẠN CHÓT */}
                      <div className="group relative flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Hạn chót:</span>
                        {editField === 'due_date' && quyenSua ? (
                          <div className="flex items-center gap-2">
                              <input type="date" value={tempValue} onChange={e => setTempValue(e.target.value)} className={`p-1 text-xs border rounded outline-none ${theme === 'dark' ? 'bg-[#121212] border-white/20 text-white [color-scheme:dark]' : 'bg-white border-gray-300 text-slate-800'}`} />
                              <button onClick={() => saveInlineEdit('due_date')} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold">Lưu</button>
                              <button onClick={() => setEditField(null)} className="px-2 py-1 text-[10px]">Hủy</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${viewingTask.due_date && new Date(viewingTask.due_date) < new Date() && viewingTask.status !== 'done' ? 'text-red-500' : 'text-blue-500'}`}>
                                  {viewingTask.due_date ? new Date(viewingTask.due_date).toLocaleDateString('vi-VN') : 'Chưa đặt'}
                              </span>
                              {quyenSua && <button onClick={() => { setEditField('due_date'); setTempValue(viewingTask.due_date ? viewingTask.due_date.split('T')[0] : ''); }} className={`opacity-0 group-hover:opacity-100 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-blue-600' : 'bg-slate-200 text-blue-600'}`}>✎</button>}
                          </div>
                        )}
                      </div>
                      
                      <div className={`group relative border-b pb-4 border-dashed ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 opacity-50">Mô tả công việc</span>
                        {editField === 'description' && quyenSua ? (
                          <div className="flex flex-col gap-2">
                            <textarea value={tempValue} onChange={e => setTempValue(e.target.value)} rows="3" className={`w-full p-2 text-xs font-normal border rounded-xl outline-none ${theme === 'dark' ? 'bg-[#121212] border-white/20 text-white' : 'bg-white border-gray-300 text-slate-800'}`} />
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => setEditField(null)} className="px-3 py-1 text-xs">Hủy</button>
                              <button onClick={() => saveInlineEdit('description')} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs">Lưu</button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative pr-8 min-h-[30px]">
                            <p className={`text-xs font-normal whitespace-pre-wrap leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{viewingTask.description || <span className="italic opacity-50">Chưa có mô tả...</span>}</p>
                            {quyenSua && <button onClick={() => { setEditField('description'); setTempValue(viewingTask.description || ''); }} className={`absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg font-bold text-[10px] ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-blue-600' : 'bg-slate-200 text-blue-600'}`}>✎</button>}
                          </div>
                        )}
                      </div>
  
                      <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">📥 Văn bản đến</span>
                            {quyenSua && (
                              <label onDragOver={handleDragOverFile} onDrop={handleDropFileInput} className={`cursor-pointer text-[10px] font-bold px-2.5 py-1 rounded-full border border-dashed transition-all ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border-blue-500/50 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'}`}>
                                + Chọn / Kéo thả file
                                <input type="file" multiple onChange={(e) => handleInlineUpload(e, 'input')} className="hidden" />
                              </label>
                            )}
                        </div>
                        <div className="space-y-1.5 mb-6">{inputFiles.map((file, i) => (<div key={i} className={`group/file flex items-center justify-between p-1.5 rounded-lg border transition-all ${selectedFile?.url === file.url ? (theme === 'dark' ? 'bg-blue-900/40 border-blue-500' : 'bg-blue-50 border-blue-500') : (theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white')}`}><button onClick={() => setSelectedFile(file)} className="flex items-center gap-2 flex-1 overflow-hidden text-left pl-1">{getFileIcon(file.name, 'small')}<span className={`text-[11px] font-normal truncate transition-colors ${theme==='dark'?'text-slate-200 hover:text-white':'text-slate-700 hover:text-blue-600'}`}>{file.name}</span></button>{quyenSua && <button onClick={() => handleInlineDeleteFile(file.url)} className="opacity-0 group-hover/file:opacity-100 p-1.5 text-red-500 hover:bg-red-500/20 rounded-md shrink-0 transition-all text-xs">🗑</button>}</div>))}</div>
                        
                        <div className="flex justify-between items-center mb-2 mt-4 pt-4 border-t border-dashed border-gray-500/30">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">✅ Báo cáo / Kết quả</span>
                            {quyenSua && (
                              <label onDragOver={handleDragOverFile} onDrop={handleDropFileOutput} className={`cursor-pointer text-[10px] font-bold px-2.5 py-1 rounded-full border border-dashed transition-all ${theme === 'dark' ? 'bg-green-900/30 text-green-400 border-green-500/50 hover:bg-green-900/50' : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'}`}>
                                + Nộp Báo Cáo
                                <input type="file" multiple onChange={(e) => handleInlineUpload(e, 'output')} className="hidden" />
                              </label>
                            )}
                        </div>
                        <div className="space-y-1.5">{outputFiles.map((file, i) => (<div key={i} className={`group/file flex items-center justify-between p-1.5 rounded-lg border transition-all ${selectedFile?.url === file.url ? (theme === 'dark' ? 'bg-green-900/40 border-green-500' : 'bg-green-50 border-green-500') : (theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white')}`}><button onClick={() => setSelectedFile(file)} className="flex items-center gap-2 flex-1 overflow-hidden text-left pl-1">{getFileIcon(file.name, 'small')}<span className={`text-[11px] font-bold truncate transition-colors ${theme==='dark'?'text-green-400 hover:text-green-300':'text-green-600 hover:text-green-700'}`}>{file.name}</span></button>{quyenSua && <button onClick={() => handleInlineDeleteFile(file.url)} className="opacity-0 group-hover/file:opacity-100 p-1.5 text-red-500 hover:bg-red-500/20 rounded-md shrink-0 transition-all text-xs">🗑</button>}</div>))}</div>
                      </div>
  
                      <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                        <h3 className="text-[10px] font-bold uppercase mb-4 opacity-50">Ghi chú trao đổi</h3>
                        {quyenSua && (
                          <div className="flex gap-2 mb-4">
                            <input type="text" value={quickNoteText} onChange={(e) => setQuickNoteText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddQuickNote() }} placeholder="Nhập ghi chú..." className={`flex-1 p-2.5 text-xs font-normal border rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-slate-800'}`} />
                            <button onClick={handleAddQuickNote} className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-lg transition-all ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/40' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>+</button>
                          </div>
                        )}
                        <div className="space-y-3">
                          {getSafeArray(viewingTask.notes).map((note, idx) => (
                            <div key={idx} className="pl-3 border-l-2 border-yellow-400 group/note">
                              <div className="flex justify-between items-center mb-1"><span className="text-[9px] opacity-40">{new Date(note.created_at).toLocaleString('vi-VN')}</span>{quyenSua && <button onClick={() => handleDeleteNote(idx)} className="opacity-0 group-hover/note:opacity-100 text-[9px] text-red-500">Xóa</button>}</div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{note.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                  
                 <div className={`w-full md:w-[55%] shrink-0 h-[40vh] md:h-auto flex flex-col relative pt-6 md:pt-6 ${theme === 'dark' ? 'bg-[#121212]' : 'bg-slate-100'}`} onMouseDown={(e) => e.stopPropagation()}>
                    {/* Đã xóa nút tắt cũ ở đây */}
                    {selectedFile ? (
                      selectedFile.name.toLowerCase().match(/\.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/i) ? (
                          <iframe src={selectedFile.name.toLowerCase().endsWith('pdf') ? `https://docs.google.com/gview?url=${encodeURIComponent(selectedFile.url)}&embedded=true` : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedFile.url)}`} className="w-full h-full border-none bg-white rounded-br-2xl" />
                      ) : selectedFile.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <div className="flex-1 flex items-center justify-center p-6"><img src={selectedFile.url} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" /></div>
                      ) : selectedFile.name.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) ? (
                          <div className="flex-1 flex items-center justify-center p-0 bg-black/95 rounded-br-2xl overflow-hidden"><video src={selectedFile.url} controls autoPlay className="w-full h-full object-contain outline-none shadow-2xl" /></div>
                      ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><div className="mb-6">{getFileIcon(selectedFile.name, 'large')}</div><p className="text-lg mb-6">{selectedFile.name}</p><a href={selectedFile.url} target="_blank" className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold shadow-md">Tải xuống</a></div>
                      )
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-30"><div className="text-5xl mb-4">👁️</div><p className="text-xs font-semibold">Chọn tài liệu bên trái để xem trước</p></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
{/* MODAL XÁC NHẬN XÓA CHUẨN UX/UI */}
        {deletingTaskId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`relative w-full max-w-sm rounded-3xl shadow-2xl p-6 ${theme === 'dark' ? 'bg-[#1a1a24] border border-white/10 text-white' : 'bg-white border border-gray-200 text-slate-800'} animate-in zoom-in-95 duration-200`}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Xóa vĩnh viễn?</h3>
                <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Công việc này và toàn bộ tài liệu đính kèm sẽ bị xóa hoàn toàn khỏi hệ thống. Bạn không thể hoàn tác hành động này!
                </p>
                <div className="flex gap-3 w-full">
                  <button disabled={isDeleting} onClick={() => setDeletingTaskId(null)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    Hủy bỏ
                  </button>
                  <button disabled={isDeleting} onClick={thucHienXoaTask} className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors flex justify-center items-center shadow-lg shadow-red-500/30">
                    {isDeleting ? 'Đang xử lý...' : 'Đồng ý Xóa'}
                  </button>
                </div>
              </div>
            </div>
</div>
        )}

        {/* MODAL ADMIN PANEL */}
        {isAdminModalOpen && isAdmin && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-10 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`relative w-full max-w-4xl h-full max-h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'bg-[#121212] border-white/10' : 'bg-slate-50 border-gray-200'}`}>
              <div className={`flex justify-between items-center p-5 border-b shrink-0 ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-200'}`}>
                <div>
                  <h2 className={`text-xl font-black flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>⚙️ BẢNG QUẢN TRỊ HỆ THỐNG</h2>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Quản lý tài khoản, phân quyền và mật khẩu</p>
                </div>
                <button onClick={() => setIsAdminModalOpen(false)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-white/10 hover:bg-red-500 text-white' : 'bg-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600'}`}>✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col lg:flex-row gap-8 custom-scrollbar">
                
                {/* CỘT TRÁI: THÊM TÀI KHOẢN */}
                <div className="w-full lg:w-1/3 shrink-0">
                  <div className={`p-5 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 pb-3 border-b ${theme === 'dark' ? 'text-slate-300 border-white/10' : 'text-slate-700 border-gray-100'}`}>+ Tạo tài khoản mới</h3>
                    <form onSubmit={handleAdminCreateUser} className="space-y-4">
                      <div>
                        <label className={`text-[10px] font-bold uppercase mb-1.5 block ${textMuted}`}>Email đăng nhập</label>
                        <input required type="email" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} className={`w-full p-2.5 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-gray-200 text-slate-800'}`} placeholder="admin@ict.com" />
                      </div>
                      <div>
                        <label className={`text-[10px] font-bold uppercase mb-1.5 block ${textMuted}`}>Mật khẩu</label>
                        <input required minLength={6} type="text" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} className={`w-full p-2.5 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-gray-200 text-slate-800'}`} placeholder="Mật khẩu ít nhất 6 ký tự" />
                      </div>
                      <div>
                        <label className={`text-[10px] font-bold uppercase mb-1.5 block ${textMuted}`}>Cấp quyền</label>
                        <select value={adminForm.role} onChange={e => setAdminForm({...adminForm, role: e.target.value})} className={`w-full p-2.5 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-gray-200 text-slate-800'}`}>
                          <option value="viewer">Cấp 3 (Viewer) - Bị giới hạn 100MB</option>
                          <option value="editor">Cấp 2 (Editor) - Quản lý</option>
                          <option value="admin">Cấp 1 (Admin) - Toàn quyền</option>
                        </select>
                      </div>
                      <button disabled={isLoadingAdmin} type="submit" className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md ${isLoadingAdmin ? 'bg-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}>
                        {isLoadingAdmin ? 'Đang xử lý...' : 'Thêm người dùng'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* CỘT PHẢI: DANH SÁCH TÀI KHOẢN */}
                <div className="w-full lg:w-2/3 flex flex-col gap-4">
                  {isLoadingAdmin && adminUsers.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center italic opacity-50 text-sm">Đang tải dữ liệu...</div>
                  ) : (
                    adminUsers.map((u, i) => (
                      <div key={u.id} className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-4 justify-between transition-all ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10 hover:bg-white/5' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${u.role === 'admin' ? 'bg-red-500/20 text-red-500' : u.role === 'editor' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                              {u.role === 'admin' ? 'Cấp 1' : u.role === 'editor' ? 'Cấp 2' : 'Cấp 3'}
                            </span>
                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{u.email}</span>
                            {currentUser?.id === u.id && <span className="text-[9px] bg-yellow-500 text-white px-1.5 rounded font-bold">Bạn</span>}
                          </div>
                          <div className={`text-[10px] ${textMuted}`}>ID: {u.id.split('-')[0]}... • Tham gia: {new Date(u.created_at).toLocaleDateString('vi-VN')}</div>
                          
                          {/* ĐỔI MẬT KHẨU */}
                          {editingPasswordId === u.id ? (
                            <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-left-2">
                              <input type="text" autoFocus value={newPasswordTemp} onChange={e => setNewPasswordTemp(e.target.value)} placeholder="Nhập mật khẩu mới..." className={`w-40 px-2 py-1 text-xs rounded border outline-none ${theme === 'dark' ? 'bg-black/30 border-white/20' : 'bg-slate-50 border-gray-300'}`} />
                              <button onClick={() => handleAdminResetPassword(u.id)} disabled={isLoadingAdmin} className="text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 rounded shadow">Lưu</button>
                              <button onClick={() => { setEditingPasswordId(null); setNewPasswordTemp(''); }} className="text-[10px] font-bold px-2 py-1.5 opacity-50 hover:opacity-100">Hủy</button>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <button onClick={() => { setEditingPasswordId(u.id); setNewPasswordTemp(''); }} className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${theme === 'dark' ? 'border-white/20 hover:bg-white/10' : 'border-gray-300 hover:bg-slate-100'}`}>🔑 Đổi mật khẩu</button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 border-dashed border-gray-300 dark:border-white/10">
                          <select 
                            disabled={currentUser?.id === u.id || isLoadingAdmin}
                            value={u.role} 
                            onChange={(e) => handleAdminChangeRole(u.id, e.target.value)} 
                            className={`text-xs font-bold p-1.5 rounded outline-none border cursor-pointer ${theme === 'dark' ? 'bg-black/50 border-white/20 text-white' : 'bg-slate-50 border-gray-200 text-slate-800'}`}
                          >
                            <option value="viewer">Cấp 3</option>
                            <option value="editor">Cấp 2</option>
                            <option value="admin">Cấp 1</option>
                          </select>
                          
                          <button 
                            disabled={currentUser?.id === u.id || isLoadingAdmin}
                            onClick={() => handleAdminDeleteUser(u.id)} 
                            className="w-8 h-8 flex items-center justify-center rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Xóa tài khoản"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  function PendingDocCard({ task, index, isEditor }) {
    // 1. TẠO CHÌA KHÓA CHUNG CHO TOÀN BỘ THẺ:
    const quyenSua = isEditor || currentSpace === 'private';
    
    const files = getSafeArray(task.attachments);
    const firstFile = files.length > 0 ? files[0] : { name: task.title, url: '' };

    return (
      <div 
        draggable={quyenSua} 
        onDragStart={(e) => {
           e.dataTransfer.setData("taskId", task.id);
           e.dataTransfer.setData("sourceStatus", 'pending');
           e.dataTransfer.setData("sortIdx", index.toString());
        }} 
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
           e.stopPropagation();
           if (!quyenSua) return;
           const sourceStatus = e.dataTransfer.getData("sourceStatus");
           const sortIdx = e.dataTransfer.getData("sortIdx");
           const targetStatus = 'pending';

           if (sourceStatus === targetStatus && sortIdx !== "") {
               handleDropSort(targetStatus, sortIdx, index);
           } else {
               handleDrop(e, targetStatus);
           }
        }}
        onClick={() => {
           if(firstFile.url) moTrinhXemFile(firstFile);
        }}
        className={`group flex items-center justify-between p-2.5 rounded-xl border ${quyenSua ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} hover:shadow-md transition-all ${theme === 'dark' ? 'bg-[#1a1a24] border-white/10 hover:bg-white/5' : 'bg-white border-purple-100 shadow-sm hover:bg-purple-50'}`}
      >
         <div className="flex items-center gap-2.5 overflow-hidden">
           {quyenSua && (
             <div className="opacity-0 group-hover:opacity-30 hover:!opacity-100 cursor-ns-resize px-1 -ml-1 flex flex-col gap-0.5">
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
             </div>
           )}
           {getFileIcon(firstFile.name, 'small')}
           <div className="flex flex-col truncate">
             <span className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`} title={firstFile.name}>{firstFile.name}</span>
           </div>
         </div>
         {quyenSua && <button onClick={(e) => { e.stopPropagation(); xoaTaskNhanh(task.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-500/20 text-xs rounded transition-all">🗑</button>}
      </div>
    )
  }

  function TaskCard({ task, index, isEditor }) {
    const quyenSua = isEditor || currentSpace === 'private';
    
    const safeNotes = getSafeArray(task.notes);
    const safeAttachments = getSafeArray(task.attachments);
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
    const inputCount = safeAttachments.filter(f => f.type !== 'output').length;
    const outputCount = safeAttachments.filter(f => f.type === 'output').length;
    return (
      <div 
        draggable={quyenSua} 
        onDragStart={(e) => {
             e.dataTransfer.setData("taskId", task.id);
             e.dataTransfer.setData("sourceStatus", task.status || 'todo');
             e.dataTransfer.setData("sortIdx", index.toString());
        }} 
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
             e.stopPropagation();
             if (!quyenSua) return;
             const sourceStatus = e.dataTransfer.getData("sourceStatus");
             const sortIdx = e.dataTransfer.getData("sortIdx");
             const targetStatus = task.status || 'todo';

             if (sourceStatus === targetStatus && sortIdx !== "") {
                 handleDropSort(targetStatus, sortIdx, index);
             } else {
                 handleDrop(e, targetStatus);
             }
        }}
        onMouseMove={handleTaskMouseMove}
        onMouseEnter={(e) => handleTaskMouseEnter(e, task)}
        onMouseLeave={handleTaskMouseLeave}
        className={`group relative flex flex-col p-3 rounded-xl transition-all duration-200 ${quyenSua ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md' : 'cursor-pointer'} ${cardBg} ${task.status === 'done' ? 'opacity-60 grayscale' : ''}`}
      >
        {quyenSua && (
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 opacity-0 group-hover:opacity-30 hover:!opacity-100 cursor-ns-resize p-1 flex flex-col gap-0.5">
              <div className="w-1 h-1 rounded-full bg-current"></div>
              <div className="w-1 h-1 rounded-full bg-current"></div>
              <div className="w-1 h-1 rounded-full bg-current"></div>
          </div>
        )}

        {quyenSua && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={(e) => { e.stopPropagation(); xoaTaskNhanh(task.id); }} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm ${theme === 'dark' ? 'bg-black/80 hover:bg-red-500 text-white' : 'bg-red-100 hover:bg-red-500 hover:text-white text-red-600'}`}>🗑</button>
          </div>
        )}
        
<div className="mb-2 pr-4 pl-2 w-full flex items-start min-h-[38px]">
            <h3 className={`font-semibold text-[13px] leading-snug line-clamp-2 whitespace-normal break-words w-full cursor-pointer ${theme === 'dark' ? 'text-slate-100 hover:text-blue-400' : 'text-slate-800 hover:text-blue-600'} ${task.is_completed ? 'line-through opacity-50' : ''}`} onClick={() => moModalXemChiTiet(task)} title={task.title}>{task.title}</h3>
        </div>
        
        <div className="flex gap-1 flex-wrap mt-auto cursor-pointer pl-2" onClick={() => moModalXemChiTiet(task)}>
          {task.due_date && <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest ${isOverdue ? 'bg-red-500/20 text-red-500' : (theme === 'dark' ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600')}`}>{new Date(task.due_date).toLocaleDateString('vi-VN')}</span>}
          {safeNotes.length > 0 && <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>📝 {safeNotes.length}</span>}
          {inputCount > 0 && <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'}`}>📥 {inputCount}</span>}
          {outputCount > 0 && <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-500/10 text-green-600'}`}>✅ {outputCount}</span>}
        </div>
      </div>
    );
  }
}