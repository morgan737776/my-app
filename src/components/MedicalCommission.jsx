import React, { useState, useEffect } from "react";

// Примерная структура для врачебной комиссии
export default function MedicalCommission() {
  // Загружаем данные из localStorage — пациентов, записи с отборочной, комиссии
  const [patients] = useState(() => {
    try {
      const saved = localStorage.getItem('statrea_patients');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectionAppointments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("statrea_selection_appointments")||"[]");
    } catch { return []; }
  });
  const [commissionAppointments, setCommissionAppointments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("statrea_medical_commission")||"[]");
    } catch { return []; }
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Cписок прошедших отборочную комиссию
  const eligiblePatients = selectionAppointments.map(a => ({
    patientName: a.patientName,
    phone: a.phone,
    slotId: a.slotId,
    id: a.requestId
  }));

  // Автосохранение
  useEffect(() => {
    localStorage.setItem("statrea_medical_commission", JSON.stringify(commissionAppointments));
  }, [commissionAppointments]);

  // Добавление записи на врачебную комиссию
  function addToCommission(patient) {
    if (commissionAppointments.find(a => a.id === patient.id)) {
      alert("Пациент уже записан на врачебную комиссию.");
      return;
    }
    setCommissionAppointments(apps => [
      ...apps,
      {
        id: patient.id,
        patientName: patient.patientName,
        phone: patient.phone,
        slotId: patient.slotId,
        status: "Записан",
        decision: "",
        notes: ""
      }
    ]);
  }

  // Обновление решения по комиссии
  function setDecision(id, decision, notes) {
    setCommissionAppointments(apps =>
      apps.map(a => a.id === id ? { ...a, decision, notes } : a)
    );
    setSelectedAppointment(null);
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Врачебная комиссия</h1>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="mb-3 fs-5 fw-semibold">Пациенты, прошедшие отборочную комиссию</div>
          {eligiblePatients.length === 0 && (
            <div className="text-muted">Нет новых пациентов для врачебной комиссии</div>
          )}
          {eligiblePatients.map(p => (
            <div key={p.id} className="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
              <div>
                <b>{p.patientName}</b><br/>
                <span className="text-muted small">{p.phone}</span>
              </div>
              <button className="btn btn-success"
                onClick={() => addToCommission(p)}
                disabled={commissionAppointments.some(a => a.id === p.id)}
              >
                {commissionAppointments.some(a => a.id === p.id) ? "Уже записан" : "Записать"}
              </button>
            </div>
          ))}
        </div>
        <div className="col-lg-6">
          <div className="mb-3 fs-5 fw-semibold">Журнал врачебной комиссии</div>
          {commissionAppointments.length === 0 && (
            <div className="text-muted">Нет записей на врачебную комиссию</div>
          )}
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Пациент</th>
                <th>Телефон</th>
                <th>Решение</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {commissionAppointments.map(a => (
                <tr key={a.id}>
                  <td>{a.patientName}</td>
                  <td>{a.phone}</td>
                  <td>
                    {a.decision
                      ? <span className={a.decision === "Допущен" ? "text-success" : "text-danger"}>{a.decision}</span>
                      : <span className="text-secondary">Нет решения</span>
                    }
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => setSelectedAppointment(a)}>
                      {a.decision ? "Изменить" : "Вынести решение"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedAppointment && (
        <DecisionModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSubmit={setDecision}
        />
      )}
    </div>
  );
}

// Модалка для внесения решения по комиссии
function DecisionModal({ appointment, onClose, onSubmit }) {
  const [decision, setDecision] = useState(appointment.decision || "");
  const [notes, setNotes] = useState(appointment.notes || "");

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Решение по пациенту: {appointment.patientName}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Решение</label>
              <select className="form-select" value={decision} onChange={e => setDecision(e.target.value)}>
                <option value="">—</option>
                <option value="Допущен">Допущен</option>
                <option value="Не допущен">Не допущен</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Комментарий</label>
              <textarea className="form-control" rows={3}
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-success"
              onClick={() => { onSubmit(appointment.id, decision, notes); }}>
              Сохранить
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          </div>
        </div>
      </div>
    </div>
  );
}