import React, { useState } from "react";

// Демоданные для отделений
const DEMO_DEPARTMENTS = [
  { id: 1, name: "Взрослый нестационар", head: "Петров П.П.", phone: "+7(900)111-11-11", address: "Москва, ул. Ленина, 10" },
  { id: 2, name: "Детский нестационар", head: "Иванова И.И.", phone: "+7(900)222-22-22", address: "Москва, ул. Мира, 5" },
  { id: 3, name: "Стационар", head: "Сидоров С.С.", phone: "+7(900)333-33-33", address: "Москва, ул. Советская, 7" },
];

export default function Departments() {
  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem("statrea_departments");
      return saved ? JSON.parse(saved) : DEMO_DEPARTMENTS;
    } catch {
      return DEMO_DEPARTMENTS;
    }
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", head: "", phone: "", address: "" });
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!form.name.trim()) {
      setError("Название обязательно");
      return;
    }
    setDepartments(ds => {
      const newDept = {
        id: Date.now(),
        name: form.name.trim(),
        head: form.head.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      const updated = [...ds, newDept];
      localStorage.setItem("statrea_departments", JSON.stringify(updated));
      return updated;
    });
    setForm({ name: "", head: "", phone: "", address: "" });
    setShowAdd(false);
    setError("");
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Отделения</h1>
      <button className="btn btn-success mb-3" onClick={() => setShowAdd(true)}>Добавить отделение</button>
      <div className="row g-3">
        {departments.map(dep => (
          <div key={dep.id} className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{dep.name}</h5>
                <p><b>Заведующий:</b> {dep.head || "—"}</p>
                <p><b>Телефон:</b> {dep.phone || "—"}</p>
                <p><b>Адрес:</b> {dep.address || "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showAdd && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Добавить отделение</h5>
                <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Название *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Заведующий</label>
                  <input className="form-control" value={form.head} onChange={e => setForm(f => ({ ...f, head: e.target.value }))} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Телефон</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Адрес</label>
                  <input className="form-control" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Отмена</button>
                <button className="btn btn-success" onClick={handleAdd}>Добавить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}