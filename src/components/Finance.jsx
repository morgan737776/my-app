import React, { useState, useEffect } from "react";

// Примерные демо-данные
const DEMO_PAYMENTS = [
  { id: 1, patient: "Иванов Иван", date: "2025-06-01", amount: 5000, type: "Поступление", method: "Карта", comment: "Оплата курса" },
  { id: 2, patient: "Петрова Анна", date: "2025-06-02", amount: 8000, type: "Поступление", method: "Наличные", comment: "Первоначальный взнос" },
  { id: 3, patient: "Петрова Анна", date: "2025-06-03", amount: 3000, type: "Возврат", method: "Банк", comment: "Частичный возврат" },
];

function exportPaymentsCSV(payments) {
  let csv = "Дата;Пациент;Сумма;Тип;Способ;Комментарий\n";
  payments.forEach(p =>
    csv += [
      p.date,
      p.patient,
      p.amount,
      p.type,
      p.method,
      p.comment.replace(/[\r\n]+/g, " ")
    ].map(x => `"${(x || "").replace(/"/g, '""')}"`).join(";") + "\n"
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "payments.csv";
  a.click();
}

export default function Finance() {
  const [payments, setPayments] = useState(() => {
    try {
      const saved = localStorage.getItem("statrea_payments");
      return saved ? JSON.parse(saved) : DEMO_PAYMENTS;
    } catch { return DEMO_PAYMENTS; }
  });
  const [filter, setFilter] = useState({ patient: "", type: "all" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient: "", date: "", amount: "", type: "Поступление", method: "Карта", comment: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("statrea_payments", JSON.stringify(payments));
  }, [payments]);

  const filtered = payments.filter(p =>
    (!filter.patient || p.patient.toLowerCase().includes(filter.patient.toLowerCase())) &&
    (filter.type === "all" || p.type === filter.type)
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.patient.trim() || !form.date || !form.amount) {
      setError("Заполните все обязательные поля");
      return;
    }
    setPayments([
      { ...form, id: Date.now(), amount: Number(form.amount) },
      ...payments
    ]);
    setForm({ patient: "", date: "", amount: "", type: "Поступление", method: "Карта", comment: "" });
    setShowForm(false);
    setError("");
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Финансы</h1>
      <div className="mb-3 d-flex flex-wrap gap-2 align-items-end">
        <button className="btn btn-success" onClick={() => setShowForm(f => !f)}>
          {showForm ? "Скрыть форму" : "Добавить платёж"}
        </button>
        <input className="form-control" style={{ maxWidth: 200 }} placeholder="Пациент"
          value={filter.patient} onChange={e => setFilter(f => ({ ...f, patient: e.target.value }))} />
        <select className="form-select" style={{ maxWidth: 160 }}
          value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
          <option value="all">Все типы</option>
          <option value="Поступление">Поступление</option>
          <option value="Возврат">Возврат</option>
        </select>
        <button className="btn btn-outline-primary" onClick={() => exportPaymentsCSV(filtered)}>
          Экспорт в CSV
        </button>
      </div>
      {showForm && (
        <form className="mb-3 card p-3" onSubmit={handleAdd}>
          <div className="row g-3">
            <div className="col-md-3">
              <input className="form-control" placeholder="Пациент *" required
                value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="date" required
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="number" min={0} placeholder="Сумма *" required
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <select className="form-select"
                value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="Поступление">Поступление</option>
                <option value="Возврат">Возврат</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select"
                value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                <option value="Карта">Карта</option>
                <option value="Наличные">Наличные</option>
                <option value="Банк">Банк</option>
              </select>
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Комментарий"
                value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" type="submit">Сохранить</button>
            </div>
            {error && <div className="alert alert-danger mt-2">{error}</div>}
          </div>
        </form>
      )}
      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Пациент</th>
              <th>Сумма</th>
              <th>Тип</th>
              <th>Способ</th>
              <th>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted">Нет платежей</td>
              </tr>
            )}
            {filtered.map(pay => (
              <tr key={pay.id}>
                <td>{pay.date}</td>
                <td>{pay.patient}</td>
                <td>{pay.amount} ₽</td>
                <td>{pay.type}</td>
                <td>{pay.method}</td>
                <td>{pay.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <h5>Аналитика</h5>
        <div>
          <b>Всего поступлений:</b> {payments.filter(p=>p.type==="Поступление").reduce((s,p)=>s+p.amount,0)} ₽, <b>Всего возвратов:</b> {payments.filter(p=>p.type==="Возврат").reduce((s,p)=>s+p.amount,0)} ₽
        </div>
        <div className="small text-muted mt-1">* Для детальной аналитики используйте экспорт в Excel</div>
      </div>
    </div>
  );
}