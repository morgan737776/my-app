import React, { useState, useEffect } from "react";

// Персонал StatREA: список, добавление, просмотр, редактирование, удаление, экспорт
export default function Staff() {
  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('statrea_staff');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "Смирнов Алексей",
        role: "Физиотерапевт",
        phone: "+7(900)123-45-67",
        email: "smirnov@example.com",
        schedule: {
          mon: { start: "09:00", end: "17:00" },
          tue: { start: "09:00", end: "17:00" },
          wed: { start: "09:00", end: "17:00" },
          thu: { start: "09:00", end: "17:00" },
          fri: { start: "09:00", end: "17:00" },
          sat: null,
          sun: null
        },
        qualifications: "Сертификат по физиотерапии, 5 лет опыта",
        status: "Active"
      },
      {
        id: 2,
        name: "Кузнецова Ольга",
        role: "Массажист",
        phone: "+7(900)234-56-78",
        email: "kuznetsova@example.com",
        schedule: {
          mon: { start: "10:00", end: "18:00" },
          tue: { start: "10:00", end: "18:00" },
          wed: { start: "10:00", end: "18:00" },
          thu: { start: "10:00", end: "18:00" },
          fri: { start: "10:00", end: "18:00" },
          sat: null,
          sun: null
        },
        qualifications: "Сертификат массажиста, 3 года опыта",
        status: "Active"
      },
      {
        id: 3,
        name: "Иванов Сергей",
        role: "Реабилитолог",
        phone: "+7(900)345-67-89",
        email: "ivanov@example.com",
        schedule: {
          mon: { start: "08:00", end: "16:00" },
          tue: { start: "08:00", end: "16:00" },
          wed: { start: "08:00", end: "16:00" },
          thu: { start: "08:00", end: "16:00" },
          fri: { start: "08:00", end: "16:00" },
          sat: null,
          sun: null
        },
        qualifications: "Диплом реабилитолога, 7 лет опыта",
        status: "Active"
      }
    ];
  });

  const [appointments] = useState(() => {
    const saved = localStorage.getItem('statrea_appointments');
    return saved
      ? JSON.parse(saved).filter(a => a.startTime && typeof a.startTime === 'string')
      : [];
  });

  const [tab, setTab] = useState('list');
  const [formData, setFormData] = useState({
    name: '', role: '', phone: '', email: '',
    schedule: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
    qualifications: '', status: 'Active'
  });
  const [editStaff, setEditStaff] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ role: 'all', availability: 'all' });
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('statrea_staff', JSON.stringify(staff));
  }, [staff]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.role) newErrors.role = 'Роль обязательна';
    if (formData.phone && !/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(formData.phone)) newErrors.phone = 'Формат: +7(900)123-45-67';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Неверный email';
    if (!Object.values(formData.schedule).some(day => day && day.start && day.end)) newErrors.schedule = 'Укажите хотя бы один рабочий день';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasDuplicate = (data, isEdit = false) => {
    return staff.some(s => (isEdit ? s.id !== data.id : true) && s.name.toLowerCase() === data.name.toLowerCase());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: field === 'block'
          ? (value ? { start: value.start, end: value.end } : null)
          : {
            ...prev.schedule[day],
            [field]: value
          }
      }
    }));
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    const newStaff = {
      id: Date.now(),
      name: formData.name.trim(),
      role: formData.role,
      phone: formData.phone || '',
      email: formData.email || '',
      schedule: formData.schedule,
      qualifications: formData.qualifications || '',
      status: formData.status
    };
    if (hasDuplicate(newStaff)) {
      setAlertMessage('Ошибка: Сотрудник с таким именем уже существует');
      return;
    }
    setStaff([...staff, newStaff]);
    setFormData({
      name: '',
      role: '',
      phone: '',
      email: '',
      schedule: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
      qualifications: '',
      status: 'Active'
    });
    setAlertMessage('');
    setErrors({});
    setTab('list');
  };

  const handleEdit = () => {
    if (!validateForm()) return;
    const updatedStaff = {
      ...editStaff,
      name: formData.name.trim(),
      role: formData.role,
      phone: formData.phone || '',
      email: formData.email || '',
      schedule: formData.schedule,
      qualifications: formData.qualifications || '',
      status: formData.status
    };
    if (hasDuplicate(updatedStaff, true)) {
      setAlertMessage('Ошибка: Сотрудник с таким именем уже существует');
      return;
    }
    setStaff(staff.map(s => s.id === editStaff.id ? updatedStaff : s));
    setEditStaff(null);
    setFormData({
      name: '',
      role: '',
      phone: '',
      email: '',
      schedule: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
      qualifications: '',
      status: 'Active'
    });
    setAlertMessage('');
    setErrors({});
    setTab('list');
  };

  const handleDelete = () => {
    const staffAppointments = appointments.filter(a => a.staffId === deleteStaffId && a.status === 'Scheduled');
    if (staffAppointments.length > 0) {
      setAlertMessage('Ошибка: Нельзя удалить сотрудника с запланированными процедурами');
      setDeleteStaffId(null);
      return;
    }
    setStaff(staff.filter(s => s.id !== deleteStaffId));
    setDeleteStaffId(null);
    setAlertMessage('');
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Имя', 'Роль', 'Телефон', 'Email', 'Квалификация', 'Статус'],
      ...filteredStaff.map(s => [
        s.id, s.name, s.role, s.phone, s.email, s.qualifications, s.status
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'staff.csv';
    link.click();
  };

  // Фильтрация и поиск
  const filteredStaff = staff.filter(s => {
    const nameMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = filters.role === 'all' || s.role === filters.role;
    const today = new Date().toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
    const availabilityMatch = filters.availability === 'all' ? true : (
      filters.availability === 'today' ? (
        s.status === 'Active' && s.schedule[today]?.start
      ) : false
    );
    return nameMatch && roleMatch && availabilityMatch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Форма
  const renderForm = () => (
    <div className="row g-3 mb-3">
      <div className="col-md-6">
        <label htmlFor="name" className="form-label">Имя *</label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>
      <div className="col-md-6">
        <label htmlFor="role" className="form-label">Роль *</label>
        <select
          className={`form-select ${errors.role ? 'is-invalid' : ''}`}
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
        >
          <option value="">Выберите роль</option>
          {['Физиотерапевт', 'Массажист', 'Реабилитолог', 'Врач', 'Администратор'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {errors.role && <div className="invalid-feedback">{errors.role}</div>}
      </div>
      <div className="col-md-6">
        <label htmlFor="phone" className="form-label">Телефон</label>
        <input
          type="text"
          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
          id="phone"
          name="phone"
          placeholder="+7(900)123-45-67"
          value={formData.phone}
          onChange={handleInputChange}
        />
        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
      </div>
      <div className="col-md-6">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>
      <div className="col-md-12">
        <label className="form-label">График работы *</label>
        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
          <div key={day} className="row g-3 mb-2">
            <div className="col-md-2">
              <label className="form-label text-capitalize">{new Date(`2023-01-${2 + ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(day)}`).toLocaleString('ru-RU', { weekday: 'long' })}</label>
            </div>
            <div className="col-md-3">
              <input
                type="time"
                className="form-control"
                value={formData.schedule[day]?.start || ''}
                onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                disabled={!formData.schedule[day]}
              />
            </div>
            <div className="col-md-3">
              <input
                type="time"
                className="form-control"
                value={formData.schedule[day]?.end || ''}
                onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                disabled={!formData.schedule[day]}
              />
            </div>
            <div className="col-md-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={!!formData.schedule[day]}
                onChange={(e) => handleScheduleChange(day, 'block', e.target.checked ? { start: '09:00', end: '17:00' } : null)}
              />
              <label className="form-check-label ms-2">Рабочий</label>
            </div>
          </div>
        ))}
        {errors.schedule && <div className="invalid-feedback d-block">{errors.schedule}</div>}
      </div>
      <div className="col-md-12">
        <label htmlFor="qualifications" className="form-label">Квалификация</label>
        <textarea
          className="form-control"
          id="qualifications"
          name="qualifications"
          value={formData.qualifications}
          onChange={handleInputChange}
          rows="3"
        />
      </div>
      <div className="col-md-6">
        <label htmlFor="status" className="form-label">Статус</label>
        <select
          className="form-select"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="Active">Активный</option>
          <option value="Inactive">Неактивный</option>
        </select>
      </div>
      <div className="col-md-12">
        <button onClick={editStaff ? handleEdit : handleAdd} className="btn btn-success w-100">
          {editStaff ? 'Сохранить изменения' : 'Добавить сотрудника'}
        </button>
      </div>
    </div>
  );

  // Профиль сотрудника
  const StaffProfile = ({ staffMember, onClose }) => {
    const staffAppointments = appointments.filter(a => a.staffId === staffMember.id && new Date(a.startTime) >= new Date());
    const completedAppointments = appointments.filter(a => a.staffId === staffMember.id && a.status === 'Completed');
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{staffMember.name}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p><strong>Роль:</strong> {staffMember.role}</p>
              <p><strong>Телефон:</strong> {staffMember.phone || 'Не указан'}</p>
              <p><strong>Email:</strong> {staffMember.email || 'Не указан'}</p>
              <p><strong>Квалификация:</strong> {staffMember.qualifications || 'Не указана'}</p>
              <p><strong>Статус:</strong> {staffMember.status === 'Active' ? 'Активный' : 'Неактивный'}</p>
              <p><strong>График работы:</strong></p>
              <ul>
                {Object.entries(staffMember.schedule).map(([day, times]) => (
                  <li key={day}>
                    {new Date(`2023-01-${2 + ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(day)}`).toLocaleString('ru-RU', { weekday: 'long' })}:
                    {times ? ` ${times.start}–${times.end}` : ' Выходной'}
                  </li>
                ))}
              </ul>
              <p><strong>Предстоящие процедуры:</strong> {staffAppointments.length > 0 ? (
                staffAppointments.map(a => (
                  <div key={a.id}>{a.startTime}: {a.procedure} ({a.patient})</div>
                ))
              ) : 'Нет'}</p>
              <h6>Завершённые процедуры: {completedAppointments.length}</h6>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => { setEditStaff(staffMember); setFormData(staffMember); setViewStaff(null); setTab('add'); }}>Редактировать</button>
              <button className="btn btn-danger" onClick={() => { setDeleteStaffId(staffMember.id); setViewStaff(null); }}>Удалить</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Список сотрудников
  const renderList = () => (
    <div>
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Поиск по имени или роли..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="all">Все роли</option>
            {['Физиотерапевт', 'Массажист', 'Реабилитолог', 'Врач', 'Администратор'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filters.availability}
            onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
          >
            <option value="all">Все</option>
            <option value="today">Доступны сегодня</option>
          </select>
        </div>
        <div className="col-md-12">
          <button onClick={handleExport} className="btn btn-primary w-100">Экспорт в CSV</button>
        </div>
      </div>
      <div className="row g-3">
        {filteredStaff.length > 0 ? filteredStaff.map(s => (
          <div key={s.id} className="col-md-4">
            <div
              className={`card staff-card ${s.status === 'Active' ? 'staff-active' : 'staff-inactive'}`}
              onClick={() => setViewStaff(s)}
              style={{
                cursor: "pointer",
                borderLeft: s.status === 'Active' ? "5px solid #22c55e" : "5px solid #6c757d"
              }}
            >
              <div className="card-body">
                <h5 className="card-title">{s.name}</h5>
                <p className="card-text"><strong>Роль:</strong> {s.role}</p>
                <p className="card-text"><strong>Телефон:</strong> {s.phone || 'Не указан'}</p>
                <p className="card-text"><strong>Статус:</strong> {s.status === 'Active' ? 'Активный' : 'Неактивный'}</p>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-muted">Нет сотрудников, соответствующих фильтрам</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>Список персонала</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'add' ? 'active' : ''}`} onClick={() => { setTab('add'); setEditStaff(null); setFormData({ name: '', role: '', phone: '', email: '', schedule: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null }, qualifications: '', status: 'Active' }); }}>Добавить сотрудника</button>
        </li>
      </ul>
      {alertMessage && (
        <div className="alert alert-danger mb-3" role="alert">{alertMessage}</div>
      )}
      {tab === 'list' && renderList()}
      {tab === 'add' && (
        <div>
          <h3 className="h4 mb-3">{editStaff ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</h3>
          {renderForm()}
        </div>
      )}
      {viewStaff && <StaffProfile staffMember={viewStaff} onClose={() => setViewStaff(null)} />}
      {deleteStaffId && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Подтверждение удаления</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteStaffId(null)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Вы уверены, что хотите удалить сотрудника "{staff.find(s => s.id === deleteStaffId)?.name}"?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteStaffId(null)}>Отмена</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Удалить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}