import React, { useState, useEffect } from "react";

// Утилиты для даты
function getNextWeekSlots() {
  // Только будни, по два слота в день: 10:00 и 14:00
  const slots = [];
  const start = new Date();
  for (let d = 0, i = 0; i < 7; d++, i++) {
    const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d);
    const day = dt.getDay();
    if (day === 0 || day === 6) continue; // Пропустить выходные
    const dateStr = dt.toISOString().split('T')[0];
    slots.push({ slotId: dateStr + "_10:00", date: dateStr, time: "10:00" });
    slots.push({ slotId: dateStr + "_14:00", date: dateStr, time: "14:00" });
  }
  return slots;
}

export default function SelectionCommission() {
  // Заявки и записи храним в localStorage
  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("statrea_selection_requests")||"[]");
    } catch { return []; }
  });
  const [appointments, setAppointments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("statrea_selection_appointments")||"[]");
    } catch { return []; }
  });
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });

  // Автосохранение
  useEffect(() => {
    localStorage.setItem("statrea_selection_requests", JSON.stringify(requests));
  }, [requests]);
  useEffect(() => {
    localStorage.setItem("statrea_selection_appointments", JSON.stringify(appointments));
  }, [appointments]);

  const handleAddRequest = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setRequests(reqs => [
      ...reqs,
      {
        id: 'req_' + Math.random().toString(36).slice(2,10),
        name: form.name.trim(),
        phone: form.phone.trim(),
        comment: form.comment.trim(),
        status: 'new'
      }
    ]);
    setForm({ name: "", phone: "", comment: "" });
    setShowForm(false);
  };

  const slots = getNextWeekSlots().map(slot => {
    // Проверить занятость
    const found = appointments.find(a => a.slotId === slot.slotId);
    return found
      ? { ...slot, status: "busy", patient: found.patientName, requestId: found.requestId }
      : { ...slot, status: "free" };
  });

  function handleSelectRequest(requestId) {
    setSelectedRequestId(requestId);
  }

  function handleBookSlot(slotId, requestId) {
    // Проверить что слот свободен
    if (appointments.find(a => a.slotId === slotId)) {
      alert("Этот слот уже занят.");
      return;
    }
    // Найти заявку
    const idx = requests.findIndex(r=>r.id===requestId);
    if (idx<0) {
      alert("Заявка не найдена.");
      return;
    }
    // Добавить запись
    setAppointments(apps => [
      ...apps,
      {
        slotId,
        requestId,
        patientName: requests[idx].name,
        phone: requests[idx].phone
      }
    ]);
    // Пометить заявку как записанную
    setRequests(reqs => {
      const newReqs = reqs.slice();
      newReqs[idx] = { ...newReqs[idx], status: "scheduled" };
      return newReqs;
    });
    setSelectedRequestId(null);
    alert("Пациент успешно записан на комиссию!");
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Отборочная комиссия</h1>
      <div className="row g-4">
        {/* Блок заявок */}
        <div className="col-lg-5">
          <div className="mb-3 fs-5 fw-semibold">1. Заявки пациентов</div>
          <button className="btn btn-success mb-2" onClick={() => setShowForm(f => !f)}>
            {showForm ? "Скрыть форму" : "Добавить заявку"}
          </button>
          {showForm && (
            <form onSubmit={handleAddRequest} className="mb-3">
              <div className="mb-2">
                <label className="form-label">ФИО пациента</label>
                <input className="form-control" required
                  value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
              </div>
              <div className="mb-2">
                <label className="form-label">Контактный телефон</label>
                <input className="form-control" required
                  value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} />
              </div>
              <div className="mb-2">
                <label className="form-label">Комментарий оператора</label>
                <textarea className="form-control" rows="2"
                  value={form.comment} onChange={e=>setForm(f=>({...f, comment:e.target.value}))} />
              </div>
              <button className="btn btn-primary" type="submit">Добавить заявку</button>
            </form>
          )}
          <div className="request-list">
            {requests.length === 0 && (
              <div className="text-muted text-center mt-3">Нет новых заявок</div>
            )}
            {requests.map(r=>(
              <div key={r.id}
                className={`request-item d-flex flex-column flex-md-row align-items-md-center justify-content-between ${selectedRequestId===r.id?"border-primary border-2":""}`}>
                <div>
                  <b>{r.name}</b> <span className="text-muted" style={{fontSize:"0.96rem"}}>{r.phone}</span>
                  <span className={`request-status-${r.status} ms-2`}>
                    {r.status==='new'?'Новая':'Записан'}
                  </span>
                  {r.comment ? <div className="small text-secondary mt-1">{r.comment}</div> : ""}
                </div>
                <div>
                  {r.status==='new' &&
                    <button className="btn btn-success btn-sm mt-2 mt-md-0"
                      onClick={()=>handleSelectRequest(r.id)}>
                      Записать
                    </button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Календарный план */}
        <div className="col-lg-7">
          <div className="mb-3 fs-5 fw-semibold">2. Запись на комиссию</div>
          <div className="calendar-title mb-2">Календарный план (ближайшая неделя)</div>
          <div className="calendar-grid">
            {slots.reduce((days, slot) => {
              const lastDay = days.length ? days[days.length-1] : null;
              if (!lastDay || lastDay[0].date !== slot.date) days.push([slot]);
              else lastDay.push(slot);
              return days;
            }, []).map((daySlots, idx) => (
              <div key={daySlots[0].date} className="calendar-row">
                {daySlots.map(slot => (
                  <div key={slot.slotId}
                    className={`calendar-cell ${slot.status === 'busy' ? "busy" : "available"}${selectedRequestId && slot.status!=='busy' ? " selectable" : ""}`}
                    style={{
                      minWidth:120,
                      minHeight:80,
                      border:"1px solid #e0e7ef",
                      background:slot.status==='busy'?"#fee2e2":"#f0fdf4",
                      color:slot.status==='busy'?"#b91c1c":undefined,
                      borderRadius:".5rem",
                      padding:".5rem",
                      marginRight:10,
                      marginBottom:10,
                      cursor: slot.status==='busy' ? "not-allowed" : selectedRequestId ? "pointer" : "default",
                      boxShadow: selectedRequestId && slot.status!=='busy' ? "0 2px 12px rgba(59,130,246,0.12)" : undefined
                    }}
                    onClick={() => selectedRequestId && slot.status!=='busy' && handleBookSlot(slot.slotId, selectedRequestId)}
                  >
                    <div className="slot-time fw-semibold">{slot.time}</div>
                    {slot.status==='busy'
                      ? <div className="slot-patient">Записан: <b>{slot.patient}</b></div>
                      : selectedRequestId
                        ? <><div className="text-success fw-semibold mt-2">Свободно</div>
                          <button className="btn btn-outline-primary btn-sm mt-2">Записать</button></>
                        : <div className="text-success fw-semibold mt-2" style={{opacity:.7}}>Свободно</div>
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}