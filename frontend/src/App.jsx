
import { useEffect, useState } from "react";
import {
  Users, UserPlus, Search, Pencil, Trash2,
  Eye, X, RefreshCw, LayoutDashboard,
  Building2, CheckCircle2
} from "lucide-react";
import "./App.css";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/employees`;

const initialForm = {
  employeeId: "",
  fullName: "",
  gender: "Nam",
  dateOfBirth: "",
  department: "",
  position: "",
  email: "",
  phone: "",
  hireDate: "",
  status: "Đang làm việc"
};

const fields = [
  ["employeeId", "Mã nhân viên"],
  ["fullName", "Họ và tên"],
  ["gender", "Giới tính"],
  ["dateOfBirth", "Ngày sinh"],
  ["department", "Phòng ban"],
  ["position", "Chức vụ"],
  ["email", "Email"],
  ["phone", "Số điện thoại"],
  ["hireDate", "Ngày vào làm"],
  ["status", "Trạng thái"]
];

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function request(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
    return data;
  }

  async function loadEmployees() {
    setLoading(true);
    try {
      setEmployees(await request(API));
    } catch (err) {
      setNotice(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(); }, []);

  function openAdd() {
    setSelected(null);
    setForm(initialForm);
    setModal("add");
  }

  function openEdit(e) {
    setSelected(e);
    setForm(Object.fromEntries(
      fields.map(([key]) => [key, e[key] || ""])
    ));
    setModal("edit");
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const editing = modal === "edit";
      await request(editing ? `${API}/${selected._id}` : API, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      setModal("");
      setNotice(editing ? "Cập nhật thành công!" : "Thêm thành công!");
      await loadEmployees();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(e) {
    if (!confirm(`Xóa nhân viên ${e.fullName}?`)) return;
    try {
      await request(`${API}/${e._id}`, { method: "DELETE" });
      setNotice("Xóa thành công!");
      await loadEmployees();
    } catch (err) {
      setNotice(err.message);
    }
  }

  const filtered = employees.filter(e =>
    `${e.employeeId} ${e.fullName}`.toLowerCase()
      .includes(search.toLowerCase())
  );

  const working = employees.filter(e => e.status === "Đang làm việc").length;
  const departments = new Set(employees.map(e => e.department).filter(Boolean)).size;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand"><Users size={27}/> <div><b>HR MANAGEMENT</b><small>Cloud System</small></div></div>
        <div className="side-title">MENU CHÍNH</div>
        <div className="side-item selected"><LayoutDashboard size={19}/> Dashboard</div>
        <div className="side-item"><Users size={19}/> Quản lý nhân viên</div>
        <div className="account"><b>Nguyễn Trần Nhất Huy</b><span>236988 • DH23TIN10</span></div>
      </aside>

      <main className="main">
        <header className="header">
          <div><small>HỆ THỐNG QUẢN LÝ NHÂN SỰ</small><h1>Tổng quan nhân viên</h1><p>Quản lý thông tin nhân viên trên nền tảng đám mây</p></div>
          <button className="primary" onClick={openAdd}><UserPlus size={18}/> Thêm nhân viên</button>
        </header>

        <div className="stats">
          <div className="stat"><Users color="#2563eb"/><span>Tổng nhân viên</span><b>{employees.length}</b></div>
          <div className="stat"><CheckCircle2 color="#16a34a"/><span>Đang làm việc</span><b>{working}</b></div>
          <div className="stat"><Building2 color="#9333ea"/><span>Phòng ban</span><b>{departments}</b></div>
        </div>

        {notice && <div className="notice">{notice}<button onClick={() => setNotice("")}><X size={16}/></button></div>}

        <section className="panel">
          <div className="panel-header">
            <div><h2>Danh sách nhân viên</h2><p>Dữ liệu được đồng bộ từ MongoDB Atlas</p></div>
            <button className="secondary" onClick={loadEmployees}><RefreshCw size={17}/> Làm mới</button>
          </div>

          <div className="toolbar">
            <div className="search"><Search size={18}/><input placeholder="Tìm theo mã hoặc tên nhân viên..." value={search} onChange={e => setSearch(e.target.value)}/></div>
            <span>{filtered.length} nhân viên</span>
          </div>

          <div className="table-responsive">
            <table>
              <thead><tr><th>Mã NV</th><th>Họ và tên</th><th>Phòng ban</th><th>Chức vụ</th><th>Email</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="7" className="empty">Đang tải dữ liệu...</td></tr> :
                  filtered.length === 0 ? <tr><td colSpan="7" className="empty">Không có nhân viên</td></tr> :
                  filtered.map(e => <tr key={e._id}>
                    <td><b>{e.employeeId}</b></td><td>{e.fullName}</td><td>{e.department}</td><td>{e.position}</td><td>{e.email}</td>
                    <td><span className={`status ${e.status === "Đang làm việc" ? "active" : "inactive"}`}>{e.status || "Chưa cập nhật"}</span></td>
                    <td><div className="actions">
                      <button title="Xem" onClick={() => {setSelected(e);setModal("view");}}><Eye size={17}/></button>
                      <button title="Sửa" onClick={() => openEdit(e)}><Pencil size={17}/></button>
                      <button title="Xóa" onClick={() => remove(e)}><Trash2 size={17}/></button>
                    </div></td>
                  </tr>)
                }
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {modal && <div className="overlay" onMouseDown={e => {if(e.target === e.currentTarget) setModal("");}}>
        <div className="modal">
          <div className="modal-header"><h2>{modal === "add" ? "Thêm nhân viên" : modal === "edit" ? "Sửa nhân viên" : "Chi tiết nhân viên"}</h2><button onClick={() => setModal("")}><X/></button></div>
          {modal === "view" ? <div className="details">
            {fields.map(([key,label]) => <div key={key}><span>{label}</span><strong>{selected[key] || "—"}</strong></div>)}
            <button className="primary" onClick={() => openEdit(selected)}>Chỉnh sửa</button>
          </div> : <form onSubmit={save}>
            <div className="form-grid">
              {fields.map(([key,label]) => <label key={key}>{label}
                {key === "gender" || key === "status" ?
                  <select name={key} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}>
                    {(key === "gender" ? ["Nam","Nữ","Khác"] : ["Đang làm việc","Tạm nghỉ","Đã nghỉ"]).map(v => <option key={v}>{v}</option>)}
                  </select> :
                  <input type={key === "dateOfBirth" || key === "hireDate" ? "date" : key === "email" ? "email" : "text"}
                    required={["employeeId","fullName","email"].includes(key)}
                    value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}/>
                }
              </label>)}
            </div>
            <div className="modal-footer"><button type="button" className="secondary" onClick={() => setModal("")}>Hủy</button><button type="submit" className="primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thông tin"}</button></div>
          </form>}
        </div>
      </div>}
    </div>
  );
}
