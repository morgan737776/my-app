import React, { useState, useEffect } from "react";

// Демоданные жалоб
const DEMO_COMPLAINTS = [
  { id: 1, patient: "Иванов Иван", date: "2025-06-03", text: "Долгое ожидание процедуры", status: "Новая", reply: "" },
  { id: 2, patient: "Петрова Анна", date: "2025-06-02", text: "Неудобное расписание", status: "Рассмотрена", reply: "Извините, расписание будет скорректировано." }
];

export default function Complaints() {
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem("statrea_complaints");
      return saved ? JSON.parse(saved) : DEMO_COMPLAINTS;
    } catch { return DEMO_COMPLAINTS; }
  });

  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient: "", text: "" });
  const [showReplyId, setShowReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    localStorage.setItem("statrea_complaints", JSON.stringify(complaints));
  }, [complaints]);

  const filtered = complaints.filter(c =>
    filter === "all" ? true : c.status === filter
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.patient.trim() || !form.text.trim()) return;
    setComplaints([
      { id: Date.now(), patient: form.patient, date: new Date().toISOString().split('T')[0], text: form.text, status: "Новая", reply: "" },
      ...complaints
    ]);
    setForm({ patient: "", text: "" });
    setShowForm(false);
  };

  const handleReply = (id) => {
    setComplaints(cs =>
      cs.map(c => c.id === id
        ? { ...c, status: "Рассмотрена", reply: replyText }
        : c
      )
    );
    setShowReplyId(null);
    setReplyText("");
  };

  const handleDelete = (id) => {
    setComplaints(cs => cs.filter(c => c.id !== id));
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Жалобы и обращения</h1>
      <div className="mb-3 d-flex flex-wrap gap-2 align-items-end">
        <button className="btn btn-success" onClick={()=>setShowForm(f=>!f)}>
          {showForm ? "Скрыть форму" : "Добавить жалобу"}
        </button>
        <select className="form-select" style={{maxWidth:180}} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">Все</option>
          <option value="Новая">Новые</option>
          <option value="Рассмотрена">Рассмотренные</option>
        </select>
      </div>
      {showForm && (
        <form className="mb-4" onSubmit={handleAdd}>
          <div className="row g-2">
            <div className="col-md-3">
              <input className="form-control" placeholder="Пациент *" required
                value={form.patient} onChange={e=>setForm(f=>({...f, patient:e.target.value}))} />
            </div>
            <div className="col-md-7">
              <input className="form-control" placeholder="Текст жалобы *" required
                value={form.text} onChange={e=>setForm(f=>({...f, text:e.target.value}))} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" type="submit">Сохранить</button>
            </div>
          </div>
        </form>
      )}
      <div>
        {filtered.length === 0 && (
          <div className="alert alert-secondary">Нет жалоб по выбранным фильтрам</div>
        )}
        {filtered.map(c => (
          <div key={c.id} className={`card mb-3 border-${c.status==="Новая"?"danger":"success"}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <b>{c.patient}</b> <span className="text-muted ms-2">{c.date}</span>
                  <div className="mt-1">{c.text}</div>
                  <span className={`badge bg-${c.status==="Новая"?"danger":"success"} mt-2`}>
                    {c.status}
                  </span>
                </div>
                <div>
                  <button className="btn btn-outline-danger btn-sm ms-2" onClick={()=>handleDelete(c.id)}>Удалить</button>
                </div>
              </div>
              {c.status === "Новая" && showReplyId !== c.id && (
                <button className="btn btn-primary btn-sm mt-3" onClick={()=>{setShowReplyId(c.id); setReplyText("");}}>
                  Ответить
                </button>
              )}
              {showReplyId === c.id && (
                <div className="mt-3">
                  <textarea
                    className="form-control mb-2"
                    placeholder="Ваш ответ"
                    value={replyText}
                    onChange={e=>setReplyText(e.target.value)}
                    rows={2}
                  />
                  <button className="btn btn-success btn-sm me-2" onClick={()=>handleReply(c.id)}>Сохранить ответ</button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setShowReplyId(null)}>Отмена</button>
                </div>
              )}
              {c.status === "Рассмотрена" && c.reply && (
                <div className="alert alert-success mt-3 mb-0">
                  <b>Ответ:</b> {c.reply}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}