import React, { useState, useEffect } from "react";

export default function Schedule() {
  // Данные для демо (пациенты, сотрудники, локации, назначения)
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('statrea_patients');
    return saved ? JSON.parse(saved) : [
      {
        id: 1, name: "Иванов Иван", mobility: "Самостоятельно", history: ["Физиотерапия", "Массаж", "ЛФК"]
      },
      {
        id: 2, name: "Петрова Анна", mobility: "Инвалидное кресло", history: ["ЛФК", "Массаж", "Гидротерапия"]
      }
    ];
  });
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('statrea_appointments');
    let parsed = saved ? JSON.parse(saved) : [
      { id: 1, patientId: 1, patient: "Иванов Иван", procedure: "Физиотерапия", staffId: 1, staff: "Смирнов Алексей",
        locationId: 1, location: "Кабинет 101", startTime: "2025-06-04T10:00", duration: 30, type: "Individual", status: "Scheduled" },
      { id: 2, patientId: 2, patient: "Петрова Анна", procedure: "Массаж", staffId: 2, staff: "Кузнецова Ольга",
        locationId: 2, location: "Кабинет 102", startTime: "2025-06-04T11:00", duration: 45, type: "Individual", status: "Scheduled" },
    ];
    parsed = parsed.filter(appt => appt.startTime && typeof appt.startTime === 'string');
    return parsed;
  });
  const [staff] = useState(() => {
    const saved = localStorage.getItem('statrea_staff');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Смирнов Алексей", role: "Физиотерапевт" },
      { id: 2, name: "Кузнецова Ольга", role: "Массажист" },
      { id: 3, name: "Иванов Сергей", role: "Реабилитолог" },
    ];
  });
  const [locations] = useState(() => {
    const saved = localStorage.getItem('statrea_locations');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Кабинет 101", accessibility: ["Самостоятельно", "Трость", "Ходунки"] },
      { id: 2, name: "Кабинет 102", accessibility: ["Самостоятельно", "Инвалидное кресло", "Ходунки", "Трость"] },
      { id: 3, name: "Бассейн", accessibility: ["Самостоятельно", "Инвалидное кресло"] },
    ];
  });

  // Состояния
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 4)); // 4 июня 2025
  const [selectedDay, setSelectedDay] = useState('2025-06-04');
  const [formData, setFormData] = useState({
    patientId: '', procedure: '', staffId: '', locationId: '', startTime: '', duration: '30', type: 'Individual', status: 'Scheduled'
  });
  const [editAppt, setEditAppt] = useState(null);
  const [deleteApptId, setDeleteApptId] = useState(null);
  const [errors, setErrors] = useState({});
  const [conflictMessage, setConflictMessage] = useState('');
  const [filters, setFilters] = useState({ patientId: 'all', staffId: 'all', locationId: 'all', startDate: '', endDate: '', statuses: ['Scheduled', 'Completed'] });

  // Сохранение данных
  useEffect(() => {
    localStorage.setItem('statrea_appointments', JSON.stringify(appointments));
    localStorage.setItem('statrea_staff', JSON.stringify(staff));
    localStorage.setItem('statrea_locations', JSON.stringify(locations));
    // Обновление patients.history и lastVisit
    const updatedPatients = patients.map(p => {
      const patientAppts = appointments.filter(a => a.patientId === p.id && a.status === 'Completed' && a.startTime);
      const newHistory = [...new Set([...p.history, ...patientAppts.map(a => a.procedure)])];
      const lastVisit = patientAppts.reduce((latest, a) => {
        const apptDate = new Date(a.startTime);
        return !latest || (apptDate > new Date(latest) && a.startTime) ? a.startTime.split('T')[0] : latest;
      }, p.lastVisit);
      return { ...p, history: newHistory, lastVisit };
    });
    setPatients(updatedPatients);
    localStorage.setItem('statrea_patients', JSON.stringify(updatedPatients));
  }, [appointments]);

  // Календарь
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const formatDate = (date) => date.toISOString().split('T')[0];
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
      return formatDate(date);
    }),
  ];

  // Фильтрация
  const filteredAppointments = appointments.filter(appt => {
    if (!appt.startTime || typeof appt.startTime !== 'string') return false;
    const apptDate = appt.startTime.split('T')[0];
    const inDateRange = (!filters.startDate || apptDate >= filters.startDate) && (!filters.endDate || apptDate <= filters.endDate);
    const matchesPatient = filters.patientId === 'all' || appt.patientId === parseInt(filters.patientId);
    const matchesStaff = filters.staffId === 'all' || appt.staffId === parseInt(filters.staffId);
    const matchesLocation = filters.locationId === 'all' || appt.locationId === parseInt(filters.locationId);
    const matchesStatus = filters.statuses.includes(appt.status);
    return inDateRange && matchesPatient && matchesStaff && matchesLocation && matchesStatus;
  });

  // Проверка конфликтов
  const hasConflict = (appt, isEdit = false) => {
    if (!appt.startTime) return 'Ошибка: Не указана дата и время';
    const newStart = new Date(appt.startTime);
    const newEnd = new Date(newStart.getTime() + appt.duration * 60000);
    for (const existing of appointments) {
      if (isEdit && existing.id === appt.id) continue;
      if (!existing.startTime) continue;
      const existingStart = new Date(existing.startTime);
      const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000);
      const overlaps = newStart < existingEnd && newEnd > existingStart;
      if (overlaps && (existing.patientId === parseInt(appt.patientId))) {
        return `Конфликт: Пациент ${appt.patient} занят в это время.`;
      }
      if (overlaps && (existing.staffId === parseInt(appt.staffId))) {
        return `Конфликт: Сотрудник ${appt.staff} занят в это время.`;
      }
      if (overlaps && (existing.locationId === parseInt(appt.locationId))) {
        return `Конфликт: Локация ${appt.location} занята в это время.`;
      }
    }
    const patient = patients.find(p => p.id === parseInt(appt.patientId));
    const location = locations.find(l => l.id === parseInt(appt.locationId));
    if (!location.accessibility.includes(patient.mobility)) {
      return `Конфликт: Локация ${appt.location} недоступна для пациента с подвижностью "${patient.mobility}".`;
    }
    return '';
  };

  // Обработчики
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'patientId') {
      const patient = patients.find(p => p.id === parseInt(value));
      setFormData(f => ({ ...f, procedure: patient?.history[0] || '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = 'Пациент обязателен';
    if (!formData.procedure) newErrors.procedure = 'Процедура обязательна';
    if (!formData.staffId) newErrors.staffId = 'Сотрудник обязателен';
    if (!formData.locationId) newErrors.locationId = 'Локация обязательна';
    if (!formData.startTime) newErrors.startTime = 'Дата и время обязательны';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    const patient = patients.find(p => p.id === parseInt(formData.patientId));
    const staffMember = staff.find(s => s.id === parseInt(formData.staffId));
    const location = locations.find(l => l.id === parseInt(formData.locationId));
    const newAppt = {
      id: Date.now(),
      patientId: parseInt(formData.patientId),
      patient: patient.name,
      procedure: formData.procedure,
      staffId: parseInt(formData.staffId),
      staff: staffMember.name,
      locationId: parseInt(formData.locationId),
      location: location.name,
      startTime: formData.startTime,
      duration: parseInt(formData.duration),
      type: formData.type,
      status: formData.status,
    };
    const conflict = hasConflict(newAppt);
    if (conflict) {
      setConflictMessage(conflict);
      return;
    }
    setAppointments([...appointments, newAppt]);
    setFormData({ patientId: '', procedure: '', staffId: '', locationId: '', startTime: '', duration: '30', type: 'Individual', status: 'Scheduled' });
    setConflictMessage('');
    setErrors({});
  };

  const handleEdit = () => {
    if (!validateForm()) return;
    const patient = patients.find(p => p.id === parseInt(formData.patientId));
    const staffMember = staff.find(s => s.id === parseInt(formData.staffId));
    const location = locations.find(l => l.id === parseInt(formData.locationId));
    const updatedAppt = {
      ...editAppt,
      patientId: parseInt(formData.patientId),
      patient: patient.name,
      procedure: formData.procedure,
      staffId: parseInt(formData.staffId),
      staff: staffMember.name,
      locationId: parseInt(formData.locationId),
      location: location.name,
      startTime: formData.startTime,
      duration: parseInt(formData.duration),
      type: formData.type,
      status: formData.status,
    };
    const conflict = hasConflict(updatedAppt, true);
    if (conflict) {
      setConflictMessage(conflict);
      return;
    }
    setAppointments(appointments.map(a => a.id === editAppt.id ? updatedAppt : a));
    setEditAppt(null);
    setFormData({ patientId: '', procedure: '', staffId: '', locationId: '', startTime: '', duration: '30', type: 'Individual', status: 'Scheduled' });
    setConflictMessage('');
    setErrors({});
  };

  const handleDelete = () => {
    setAppointments(appointments.filter(a => a.id !== deleteApptId));
    setDeleteApptId(null);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Пациент', 'Процедура', 'Сотрудник', 'Локация', 'Дата и время', 'Длительность', 'Тип', 'Статус'],
      ...filteredAppointments.map(a => [
        a.id, a.patient, a.procedure, a.staff, a.location, a.startTime, a.duration, a.type, a.status
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'appointments.csv';
    link.click();
  };

  // Рендеринг календаря
  const renderMonthView = () => (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <button className="btn btn-primary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
            Пред. месяц
          </button>
          <h5 className="card-title">{currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</h5>
          <button className="btn btn-primary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
            След. месяц
          </button>
        </div>
        <div className="row row-cols-7 g-0">
          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
            <div key={day} className="col text-center fw-bold p-2 border">{day}</div>
          ))}
          {calendarDays.map((day, index) => {
            const hasAppts = filteredAppointments.some(a => a.startTime && a.startTime.startsWith(day));
            return (
              <div
                key={index}
                className={`col calendar-day ${day === selectedDay ? 'calendar-day-selected' : ''} ${day === formatDate(new Date(2025, 5, 4)) ? 'calendar-day-today' : ''} ${hasAppts ? 'calendar-day-has-appt' : ''}`}
                style={{
                  cursor: day ? "pointer" : "default",
                  background: day === selectedDay ? "#3b82f6" : hasAppts ? "#d1e7dd" : "white",
                  color: (day === selectedDay) ? "white" : undefined
                }}
                onClick={() => day && setSelectedDay(day)}
              >
                {day ? day.split('-')[2] : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return formatDate(date);
    });
    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <button className="btn btn-primary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))}>
              Пред. неделя
            </button>
            <h5 className="card-title">{weekDays[0]} - {weekDays[6]}</h5>
            <button className="btn btn-primary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))}>
              След. неделя
            </button>
          </div>
          <div className="row g-0">
            {weekDays.map(day => (
              <div key={day} className="col border text-center p-2">
                <div className="fw-bold">{new Date(day).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}</div>
                {filteredAppointments
                  .filter(a => a.startTime && a.startTime.startsWith(day))
                  .map(a => (
                    <div
                      key={a.id}
                      className={`week-slot m-1 p-1 appt-${a.type?.toLowerCase()} ${a.status === 'Completed' ? 'appt-completed' : a.status === 'Cancelled' ? 'appt-cancelled' : ''}`}
                      onClick={() => setEditAppt(a)}
                      title={`${a.patient}: ${a.procedure} (${a.staff}, ${a.location})`}
                      style={{background:a.type==="Group"?"#22c55e":"#3b82f6", color:"white", cursor:"pointer"}}
                    >
                      {a.startTime.split('T')[1].slice(0, 5)}: {a.procedure}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <button className="btn btn-primary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1))}>
              Пред. день
            </button>
            <h5 className="card-title">{currentDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</h5>
            <button className="btn btn-primary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1))}>
              След. день
            </button>
          </div>
          {hours.map(hour => (
            <div key={hour} className="row g-0">
              <div className="col-2 border p-2">{hour}</div>
              <div className="col-10 border p-2">
                {filteredAppointments
                  .filter(a => a.startTime && a.startTime.startsWith(selectedDay) && a.startTime.includes(hour))
                  .map(a => (
                    <div
                      key={a.id}
                      className={`day-slot m-1 p-1 appt-${a.type?.toLowerCase()} ${a.status === 'Completed' ? 'appt-completed' : a.status === 'Cancelled' ? 'appt-cancelled' : ''}`}
                      onClick={() => setEditAppt(a)}
                      title={`${a.patient}: ${a.procedure} (${a.staff}, ${a.location})`}
                      style={{background:a.type==="Group"?"#22c55e":"#3b82f6", color:"white", cursor:"pointer"}}
                    >
                      {a.startTime.split('T')[1].slice(0, 5)}: {a.procedure} ({a.patient}, {a.staff})
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Форма
  const renderForm = () => (
    <div className="row g-3 mb-3">
      <div className="col-md-3">
        <label htmlFor="patientId" className="form-label">Пациент *</label>
        <select
          className={`form-select ${errors.patientId ? 'is-invalid' : ''}`}
          id="patientId"
          name="patientId"
          value={formData.patientId}
          onChange={handleInputChange}
        >
          <option value="">Выберите пациента</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.mobility})</option>
          ))}
        </select>
        {errors.patientId && <div className="invalid-feedback">{errors.patientId}</div>}
      </div>
      <div className="col-md-3">
        <label htmlFor="procedure" className="form-label">Процедура *</label>
        <input
          type="text"
          className={`form-control ${errors.procedure ? 'is-invalid' : ''}`}
          id="procedure"
          name="procedure"
          value={formData.procedure}
          onChange={handleInputChange}
          list="procedureSuggestions"
        />
        <datalist id="procedureSuggestions">
          {patients.find(p => p.id === parseInt(formData.patientId))?.history.map((proc, i) => (
            <option key={i} value={proc} />
          ))}
        </datalist>
        {errors.procedure && <div className="invalid-feedback">{errors.procedure}</div>}
      </div>
      <div className="col-md-3">
        <label htmlFor="staffId" className="form-label">Сотрудник *</label>
        <select
          className={`form-select ${errors.staffId ? 'is-invalid' : ''}`}
          id="staffId"
          name="staffId"
          value={formData.staffId}
          onChange={handleInputChange}
        >
          <option value="">Выберите сотрудника</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
          ))}
        </select>
        {errors.staffId && <div className="invalid-feedback">{errors.staffId}</div>}
      </div>
      <div className="col-md-3">
        <label htmlFor="locationId" className="form-label">Локация *</label>
        <select
          className={`form-select ${errors.locationId ? 'is-invalid' : ''}`}
          id="locationId"
          name="locationId"
          value={formData.locationId}
          onChange={handleInputChange}
        >
          <option value="">Выберите локацию</option>
          {locations.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        {errors.locationId && <div className="invalid-feedback">{errors.locationId}</div>}
      </div>
      <div className="col-md-3">
        <label htmlFor="startTime" className="form-label">Дата и время *</label>
        <input
          type="datetime-local"
          className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
          id="startTime"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
        />
        {errors.startTime && <div className="invalid-feedback">{errors.startTime}</div>}
      </div>
      <div className="col-md-3">
        <label htmlFor="duration" className="form-label">Длительность (мин)</label>
        <select
          className="form-select"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
        >
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="45">45</option>
          <option value="60">60</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label">Тип</label>
        <div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="type"
              id="typeIndividual"
              value="Individual"
              checked={formData.type === 'Individual'}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="typeIndividual">Индивидуальная</label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="type"
              id="typeGroup"
              value="Group"
              checked={formData.type === 'Group'}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="typeGroup">Групповая</label>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <label htmlFor="status" className="form-label">Статус</label>
        <select
          className="form-select"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="Scheduled">Запланирована</option>
          <option value="Completed">Завершена</option>
          <option value="Cancelled">Отменена</option>
        </select>
      </div>
      <div className="col-md-12">
        <button onClick={editAppt ? handleEdit : handleAdd} className="btn btn-success w-100">
          {editAppt ? 'Сохранить изменения' : 'Добавить процедуру'}
        </button>
      </div>
    </div>
  );

  // Фильтры
  const renderFilters = () => (
    <div className="row g-3 mb-3">
      <div className="col-md-3">
        <select
          className="form-select"
          value={filters.patientId}
          onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
        >
          <option value="all">Все пациенты</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <select
          className="form-select"
          value={filters.staffId}
          onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}
        >
          <option value="all">Все сотрудники</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <select
          className="form-select"
          value={filters.locationId}
          onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}
        >
          <option value="all">Все локации</option>
          {locations.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <input
          type="date"
          className="form-control"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Начальная дата"
        />
      </div>
      <div className="col-md-3">
        <input
          type="date"
          className="form-control"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="Конечная дата"
        />
      </div>
      <div className="col-md-3">
        <div>
          {['Scheduled', 'Completed', 'Cancelled'].map(status => (
            <div key={status} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id={`status-${status}`}
                checked={filters.statuses.includes(status)}
                onChange={(e) => {
                  const newStatuses = e.target.checked
                    ? [...filters.statuses, status]
                    : filters.statuses.filter(s => s !== status);
                  setFilters({ ...filters, statuses: newStatuses });
                }}
              />
              <label className="form-check-label" htmlFor={`status-${status}`}>
                {status === 'Scheduled' ? 'Запланированы' : status === 'Completed' ? 'Завершены' : 'Отменены'}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="col-md-3">
        <button onClick={handleExport} className="btn btn-primary w-100">Экспорт в CSV</button>
      </div>
    </div>
  );

  // Список назначений
  const renderAppointments = () => (
    filteredAppointments
      .filter(a => view === 'month' ? a.startTime && a.startTime.startsWith(selectedDay) : true)
      .map(a => (
        <div
          key={a.id}
          className={`card mb-2 appt-${a.type?.toLowerCase()} ${a.status === 'Completed' ? 'appt-completed' : a.status === 'Cancelled' ? 'appt-cancelled' : ''}`}
        >
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              {a.startTime}: {a.procedure} ({a.patient}, {a.staff}, {a.location}, {a.duration} мин, {a.type})
            </div>
            <div>
              <button className="btn btn-primary btn-sm me-1" onClick={() => setEditAppt(a)}>Редактировать</button>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteApptId(a.id)}>Удалить</button>
            </div>
          </div>
        </div>
      ))
  );

  return (
    <div className="container py-4">
      <ul className="nav nav-pills mb-3" id="scheduleTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Месяц</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Неделя</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>День</button>
        </li>
      </ul>
      {conflictMessage && (
        <div className="alert alert-danger mb-3" role="alert">{conflictMessage}</div>
      )}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
      {renderFilters()}
      <h3 className="h4 mb-3">{editAppt ? 'Редактировать процедуру' : 'Добавить процедуру'}</h3>
      {renderForm()}
      <h3 className="h4 mb-3">Назначения</h3>
      {renderAppointments().length > 0 ? renderAppointments() : (
        <p className="text-muted">Нет назначений за {view === 'month' ? selectedDay : 'выбранный период'}</p>
      )}
      {deleteApptId && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Подтверждение удаления</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteApptId(null)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Вы уверены, что хотите удалить процедуру "{appointments.find(a => a.id === deleteApptId)?.procedure || 'Неизвестная'}" для {appointments.find(a => a.id === deleteApptId)?.patient || 'неизвестного пациента'} в {appointments.find(a => a.id === deleteApptId)?.startTime || 'неизвестное время'}?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteApptId(null)}>Отмена</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Удалить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}