import React, { useState, useEffect } from "react";

// Структура уведомления: { id, title, message, type, date, read }
const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: "Запись на прием", message: "Пациент Иванов Иван записался на физиотерапию.", type: "info", date: "2025-06-04T10:00", read: false },
  { id: 2, title: "Поступил платёж", message: "Поступил платёж от Петрова Анны.", type: "success", date: "2025-06-04T09:30", read: true },
  { id: 3, title: "Запись отменена", message: "Пациент Сидоров С.С. отменил процедуру.", type: "danger", date: "2025-06-03T18:10", read: false }
];

const typeBadge = {
  "info": "primary",
  "success": "success",
  "danger": "danger",
  "warning": "warning"
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("statrea_notifications");
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "info" });

  useEffect(() => {
    localStorage.setItem("statrea_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setNotifications(ns => [
      {
        id: Date.now(),
        title: form.title,
        message: form.message,
        type: form.type,
        date: new Date().toISOString(),
        read: false
      },
      ...ns
    ]);
    setForm({ title: "", message: "", type: "info" });
    setShowForm(false);
  };

  const handleMarkRead = (id) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const handleDelete = (id) => {
    setNotifications(ns => ns.filter(n => n.id !== id));
  };
  const handleMarkAllRead = () => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  };
  const handleClearAll = () => {
    setNotifications([]);
  };

  let filtered = notifications;
  if (filter !== "all") {
    if (filter === "unread") filtered = notifications.filter(n => !n.read);
    else filtered = notifications.filter(n => n.type === filter);
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Уведомления</h1>
      <div className="mb-3 d-flex flex-wrap gap-2 align-items-end">
        <button className="btn btn-success" onClick={()=>setShowForm(f=>!f)}>
          {showForm ? "Скрыть форму" : "Новое уведомление"}
        </button>
        <button className="btn btn-outline-primary" onClick={handleMarkAllRead}>Отметить все как прочитанные</button>
        <button className="btn btn-outline-danger" onClick={handleClearAll}>Очистить все</button>
        <div className="ms-auto">
          <select className="form-select" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">Все</option>
            <option value="unread">Непрочитанные</option>
            <option value="info">Инфо</option>
            <option value="success">Успех</option>
            <option value="warning">Внимание</option>
            <option value="danger">Ошибка</option>
          </select>
        </div>
      </div>
      {showForm && (
        <form className="mb-4" onSubmit={handleAdd}>
          <div className="row g-2">
            <div className="col-md-3">
              <input className="form-control" placeholder="Заголовок" required
                value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} />
            </div>
            <div className="col-md-5">
              <input className="form-control" placeholder="Текст уведомления" required
                value={form.message} onChange={e=>setForm(f=>({...f, message:e.target.value}))} />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={form.type}
                onChange={e=>setForm(f=>({...f, type:e.target.value}))}>
                <option value="info">Инфо</option>
                <option value="success">Успех</option>
                <option value="warning">Внимание</option>
                <option value="danger">Ошибка</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" type="submit">Сохранить</button>
            </div>
          </div>
        </form>
      )}
      <div>
        {filtered.length === 0 && (
          <div className="alert alert-secondary">Нет уведомлений по выбранным фильтрам</div>
        )}
        {filtered.map(n => (
          <div key={n.id} className={`alert alert-${typeBadge[n.type]||"primary"} d-flex justify-content-between align-items-center`} role="alert"
            style={{ opacity: n.read ? 0.6 : 1 }}>
            <div>
              <b>{n.title}</b> <span className="badge bg-light text-dark ms-1">{n.type}</span>
              <span className="ms-2 text-muted" style={{ fontSize: "0.96rem" }}>
                {n.date ? new Date(n.date).toLocaleString('ru-RU') : ""}
              </span>
              <div>{n.message}</div>
            </div>
            <div>
              {!n.read && (
                <button className="btn btn-outline-secondary btn-sm me-2" onClick={()=>handleMarkRead(n.id)}>Прочитано</button>
              )}
              <button className="btn btn-outline-danger btn-sm" onClick={()=>handleDelete(n.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}