import React, { useState, useEffect } from "react";

// Демоданные аудита
const DEMO_LOGS = [
  { id: 1, date: "2025-06-03 12:44", user: "admin", action: "Добавлен пациент Иванов Иван" },
  { id: 2, date: "2025-06-03 13:20", user: "operator", action: "Назначена процедура для Петрова Анны" },
  { id: 3, date: "2025-06-04 09:15", user: "admin", action: "Удалён сотрудник Сидоров С.С." }
];

export default function AuditLog() {
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("statrea_auditlog");
      return saved ? JSON.parse(saved) : DEMO_LOGS;
    } catch { return DEMO_LOGS; }
  });
  const [filter, setFilter] = useState({ user: "", action: "" });

  useEffect(() => {
    localStorage.setItem("statrea_auditlog", JSON.stringify(logs));
  }, [logs]);

  const filtered = logs.filter(log =>
    (!filter.user || log.user.toLowerCase().includes(filter.user.toLowerCase())) &&
    (!filter.action || log.action.toLowerCase().includes(filter.action.toLowerCase()))
  );

  const handleExport = () => {
    const csv = [
      ["Дата", "Пользователь", "Действие"],
      ...filtered.map(l => [l.date, l.user, l.action])
    ].map(row => row.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "audit-log.csv";
    a.click();
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Журнал аудита</h1>
      <div className="mb-3 d-flex flex-wrap gap-2 align-items-end">
        <input className="form-control" style={{ maxWidth: 200 }} placeholder="Пользователь"
          value={filter.user} onChange={e => setFilter(f => ({ ...f, user: e.target.value }))} />
        <input className="form-control" style={{ maxWidth: 350 }} placeholder="Действие"
          value={filter.action} onChange={e => setFilter(f => ({ ...f, action: e.target.value }))} />
        <button className="btn btn-outline-primary" onClick={handleExport}>Экспорт в CSV</button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Пользователь</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">Нет записей</td>
              </tr>
            )}
            {filtered.map(log => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td>{log.user}</td>
                <td>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}