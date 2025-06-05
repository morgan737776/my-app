import React, { useState, useEffect } from "react";

// Можно вынести эти списки в отдельные файлы-константы, если потребуется
const DEPARTMENTS = [
  { value: '', label: 'Не выбрано' },
  { value: 'Взрослый нестационар', label: 'Взрослый нестационар' },
  { value: 'Детский нестационар', label: 'Детский нестационар' },
  { value: 'Стационар', label: 'Стационар' }
];
const COURSE_STATUSES = [
  { value: 'on_course', label: 'На курсе' },
  { value: 'finished', label: 'Закончил курс' },
  { value: '', label: 'Не указано' }
];
const FUNDING_TYPES = [
  { value: '', label: 'Не указано' },
  { value: 'budget', label: 'Бюджет' },
  { value: 'paid', label: 'Платно' }
];

function exportPatientCard(patient, type = 'csv') {
  const lines = [
    ['ФИО', patient.name],
    ['Дата рождения', patient.dob],
    ['Пол', patient.gender],
    ['Паспорт', `${patient.passport?.series || ''} ${patient.passport?.number || ''}`],
    ['Кем выдан паспорт', patient.passport?.issuedBy || ''],
    ['Регистрация', patient.registration],
    ['СНИЛС', patient.snils],
    ['Полис ОМС', patient.omsPolicy],
    ['Инвалидность', patient.disability],
    ['Способ передвижения', patient.mobility],
    ['Диагноз', patient.diagnosis],
    ['МКБ-10', patient.icd10],
    ['Прогресс реабилитации', patient.progress + '%'],
    ['Отделение', patient.department],
    ['Статус курса', patient.courseStatus],
    ['Тип финансирования', patient.fundingType === 'budget' ? 'Бюджет' : patient.fundingType === 'paid' ? 'Платно' : 'Не указано'],
    ['История процедур', patient.history?.join(', ') || ''],
    ['Платежи', patient.payments?.map(p => `${p.amount} руб. (${p.date})`).join(', ') || ''],
  ];
  if(type === 'csv') {
    let csv = lines.map(l => `"${l[0]}";"${l[1]}"`).join('\n');
    const blob = new Blob([csv], {type: "text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Карта_пациента_${patient.name}.csv`;
    a.click();
  } else if(type === 'word') {
    let html = `<html><head><meta charset="UTF-8"><title>Карта пациента</title></head><body>`;
    html += `<h2>Карта пациента: ${patient.name}</h2><table border="1" cellpadding="5" style="border-collapse:collapse;">`;
    lines.forEach(l => html += `<tr><td><b>${l[0]}</b></td><td>${l[1]}</td></tr>`);
    html += `</table></body></html>`;
    const blob = new Blob(['\ufeff'+html], {type: "application/msword"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Карта_пациента_${patient.name}.doc`;
    a.click();
  } else if(type === 'pdf') {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Карта пациента</title><meta charset="UTF-8"></head><body>`);
    win.document.write(`<h2>Карта пациента: ${patient.name}</h2><table border="1" cellpadding="5" style="border-collapse:collapse;">`);
    lines.forEach(l => win.document.write(`<tr><td><b>${l[0]}</b></td><td>${l[1]}</td></tr>`));
    win.document.write(`</table></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

const PatientCard = ({ patient, onView, onAssignDept, onChangeCourseStatus, onChangeFundingType, onExport }) => (
  <div className="card mb-3">
    <div className="card-body d-flex justify-content-between align-items-center">
      <div>
        <h5 className="card-title mb-1">{patient.name}</h5>
        <p className="card-text mb-1">Диагноз: {patient.diagnosis || 'Не указан'} (МКБ-10: {patient.icd10 || 'Не указан'})</p>
        <p className="card-text mb-1">Дата рождения: {patient.dob || 'Не указана'}</p>
        <p className="card-text mb-1">Инвалидность: {patient.disability || 'Нет'}</p>
        <div>
          {patient.department && (
            <span className="badge badge-dept me-2" style={{background:"#f59e0b"}}>{patient.department}</span>
          )}
          {patient.courseStatus === 'on_course' && (
            <span className="badge badge-course me-2" style={{background:"#22c55e"}}>На курсе</span>
          )}
          {patient.courseStatus === 'finished' && (
            <span className="badge badge-finished me-2" style={{background:"#6366f1"}}>Закончил курс</span>
          )}
          {patient.fundingType === 'budget' && (
            <span className="badge badge-budget me-2" style={{background:"#0ea5e9"}}>Бюджет</span>
          )}
          {patient.fundingType === 'paid' && (
            <span className="badge badge-paid me-2" style={{background:"#ef4444"}}>Платно</span>
          )}
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <button onClick={() => onView(patient)} className="btn btn-primary mb-2">
          Просмотреть профиль
        </button>
        <div className="mb-1 w-100">
          <select
            className="form-select form-select-sm mb-1"
            value={patient.department || ''}
            onChange={e => onAssignDept(patient.id, e.target.value)}
            title="Распределить в отделение"
          >
            {DEPARTMENTS.map(dep => (
              <option key={dep.value} value={dep.value}>{dep.label}</option>
            ))}
          </select>
          <select
            className="form-select form-select-sm mb-1"
            value={patient.courseStatus || ''}
            onChange={e => onChangeCourseStatus(patient.id, e.target.value)}
            title="Статус прохождения курса"
          >
            {COURSE_STATUSES.map(cs => (
              <option key={cs.value} value={cs.value}>{cs.label}</option>
            ))}
          </select>
          <select
            className="form-select form-select-sm"
            value={patient.fundingType || ''}
            onChange={e => onChangeFundingType(patient.id, e.target.value)}
            title="Тип финансирования"
          >
            {FUNDING_TYPES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="badge bg-secondary me-1 badge-patient-export" title="Экспорт в Excel"
            style={{cursor:"pointer"}} onClick={() => onExport(patient, 'csv')}>Excel</span>
          <span className="badge bg-info me-1 badge-patient-export" title="Экспорт в Word"
            style={{cursor:"pointer"}} onClick={() => onExport(patient, 'word')}>Word</span>
          <span className="badge bg-danger badge-patient-export" title="Экспорт в PDF"
            style={{cursor:"pointer"}} onClick={() => onExport(patient, 'pdf')}>PDF</span>
        </div>
      </div>
    </div>
  </div>
);

const PatientProfile = ({ patient, onClose, onExport }) => {
  useEffect(() => {
    // Chart.js можно подключить по желанию, здесь не реализован для простоты
  }, [patient]);
  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{patient.name}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p><strong>Дата рождения:</strong> {patient.dob || 'Не указана'}</p>
            <p><strong>Пол:</strong> {patient.gender || 'Не указан'}</p>
            <p><strong>Паспорт:</strong> {patient.passport?.series} {patient.passport?.number}, выдан {patient.passport?.issuedBy || 'Не указан'}</p>
            <p><strong>Регистрация:</strong> {patient.registration || 'Не указана'}</p>
            <p><strong>СНИЛС:</strong> {patient.snils || 'Не указан'}</p>
            <p><strong>Полис ОМС:</strong> {patient.omsPolicy || 'Не указан'}</p>
            <p><strong>Инвалидность:</strong> {patient.disability || 'Нет'}</p>
            <p><strong>Способ передвижения:</strong> {patient.mobility || 'Не указан'}</p>
            <p><strong>Диагноз:</strong> {patient.diagnosis || 'Не указан'} (МКБ-10: {patient.icd10 || 'Не указан'})</p>
            <p><strong>Прогресс реабилитации:</strong> {patient.progress}%</p>
            <p><strong>Отделение:</strong> {patient.department || 'Не назначено'}</p>
            <p><strong>Статус курса:</strong> {
              patient.courseStatus === 'on_course' ? 'На курсе'
              : patient.courseStatus === 'finished' ? 'Закончил курс'
              : 'Не указано'
            }</p>
            <p><strong>Тип финансирования:</strong> {
              patient.fundingType === 'budget' ? 'Бюджет'
              : patient.fundingType === 'paid' ? 'Платно'
              : 'Не указано'
            }</p>
            <p><strong>История процедур:</strong> {patient.history?.join(", ") || 'Нет'}</p>
            <p><strong>Платежи:</strong> {patient.payments?.map(p => `${p.amount} руб. (${p.date})`).join(", ") || 'Нет'}</p>
            <p><strong>Документы:</strong> {patient.documents?.length > 0 ? patient.documents.map((doc, i) => (
              <a key={i} href={doc.data} download={doc.name} className="me-2">Скачать {doc.name}</a>
            )) : 'Нет'}</p>
            <div className="mt-3">
              <span className="badge bg-secondary me-1 badge-patient-export" title="Экспорт в Excel"
                style={{cursor:"pointer"}} onClick={() => onExport(patient, 'csv')}>Excel</span>
              <span className="badge bg-info me-1 badge-patient-export" title="Экспорт в Word"
                style={{cursor:"pointer"}} onClick={() => onExport(patient, 'word')}>Word</span>
              <span className="badge bg-danger badge-patient-export" title="Экспорт в PDF"
                style={{cursor:"pointer"}} onClick={() => onExport(patient, 'pdf')}>PDF</span>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-danger">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddPatientForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    passport: { series: '', number: '', issuedBy: '' },
    registration: '',
    snils: '',
    omsPolicy: '',
    disability: 'Нет',
    mobility: '',
    documents: [],
    department: '',
    courseStatus: '',
    fundingType: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('passport.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        passport: { ...formData.passport, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ name: file.name, data: e.target.result });
      reader.readAsDataURL(file);
    }))).then(documents => {
      setFormData({ ...formData, documents });
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'ФИО обязательно';
    if (!formData.dob) newErrors.dob = 'Дата рождения обязательна';
    if (!formData.gender) newErrors.gender = 'Пол обязателен';
    if (!formData.mobility) newErrors.mobility = 'Способ передвижения обязателен';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onAdd({
      id: Date.now(),
      name: formData.name,
      dob: formData.dob,
      gender: formData.gender,
      passport: formData.passport,
      registration: formData.registration,
      snils: formData.snils,
      omsPolicy: formData.omsPolicy,
      disability: formData.disability,
      mobility: formData.mobility,
      documents: formData.documents,
      department: formData.department,
      courseStatus: formData.courseStatus,
      fundingType: formData.fundingType,
      diagnosis: '',
      icd10: '',
      progress: 0,
      lastVisit: '',
      history: [],
      payments: [],
    });
    setFormData({
      name: '',
      dob: '',
      gender: '',
      passport: { series: '', number: '', issuedBy: '' },
      registration: '',
      snils: '',
      omsPolicy: '',
      disability: 'Нет',
      mobility: '',
      documents: [],
      department: '',
      courseStatus: '',
      fundingType: '',
    });
    setErrors({});
    setSuccessMessage('Пациент успешно добавлен!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="card-body">
      <h2 className="h4 mb-3">Добавить пациента</h2>
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="name" className="form-label">ФИО *</label>
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
          <label htmlFor="dob" className="form-label">Дата рождения *</label>
          <input
            type="date"
            className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
          />
          {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="gender" className="form-label">Пол *</label>
          <select
            className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="">Выберите пол</option>
            <option value="Мужской">Мужской</option>
            <option value="Женский">Женский</option>
          </select>
          {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="passport.series" className="form-label">Серия паспорта</label>
          <input
            type="text"
            className="form-control"
            id="passport.series"
            name="passport.series"
            value={formData.passport.series}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="passport.number" className="form-label">Номер паспорта</label>
          <input
            type="text"
            className="form-control"
            id="passport.number"
            name="passport.number"
            value={formData.passport.number}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="passport.issuedBy" className="form-label">Кем выдан паспорт</label>
          <input
            type="text"
            className="form-control"
            id="passport.issuedBy"
            name="passport.issuedBy"
            value={formData.passport.issuedBy}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="registration" className="form-label">Регистрация</label>
          <input
            type="text"
            className="form-control"
            id="registration"
            name="registration"
            value={formData.registration}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="snils" className="form-label">СНИЛС</label>
          <input
            type="text"
            className="form-control"
            id="snils"
            name="snils"
            value={formData.snils}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="omsPolicy" className="form-label">Полис ОМС</label>
          <input
            type="text"
            className="form-control"
            id="omsPolicy"
            name="omsPolicy"
            value={formData.omsPolicy}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="disability" className="form-label">Инвалидность</label>
          <select
            className="form-select"
            id="disability"
            name="disability"
            value={formData.disability}
            onChange={handleInputChange}
          >
            <option value="Нет">Нет</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div className="col-md-6">
          <label htmlFor="mobility" className="form-label">Способ передвижения *</label>
          <select
            className={`form-select ${errors.mobility ? 'is-invalid' : ''}`}
            id="mobility"
            name="mobility"
            value={formData.mobility}
            onChange={handleInputChange}
          >
            <option value="">Выберите способ</option>
            <option value="Самостоятельно">Самостоятельно</option>
            <option value="Инвалидное кресло">Инвалидное кресло</option>
            <option value="Ходунки">Ходунки</option>
            <option value="Трость">Трость</option>
            <option value="Лежачий больной">Лежачий больной</option>
          </select>
          {errors.mobility && <div className="invalid-feedback">{errors.mobility}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="department" className="form-label">Отделение</label>
          <select
            className="form-select"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
          >
            {DEPARTMENTS.map(dep => (
              <option key={dep.value} value={dep.value}>{dep.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label htmlFor="courseStatus" className="form-label">Статус курса</label>
          <select
            className="form-select"
            id="courseStatus"
            name="courseStatus"
            value={formData.courseStatus}
            onChange={handleInputChange}
          >
            {COURSE_STATUSES.map(cs => (
              <option key={cs.value} value={cs.value}>{cs.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label htmlFor="fundingType" className="form-label">Тип финансирования</label>
          <select
            className="form-select"
            id="fundingType"
            name="fundingType"
            value={formData.fundingType}
            onChange={handleInputChange}
          >
            {FUNDING_TYPES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <label htmlFor="documents" className="form-label">Отсканированные документы</label>
          <input
            type="file"
            className="form-control"
            id="documents"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          {formData.documents.length > 0 && (
            <ul className="mt-2">
              {formData.documents.map((doc, i) => (
                <li key={i}>{doc.name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-12">
          <button onClick={handleSubmit} className="btn btn-success w-100">Добавить пациента</button>
        </div>
      </div>
    </div>
  );
};

// Главный компонент
export default function Patients() {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('statrea_patients');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "Иванов Иван",
        dob: "1980-01-15",
        gender: "Мужской",
        passport: { series: "1234", number: "567890", issuedBy: "УФМС России" },
        registration: "Москва, ул. Ленина, д. 10",
        snils: "123-456-789 00",
        omsPolicy: "1234567890123456",
        disability: "Нет",
        mobility: "Самостоятельно",
        documents: [],
        diagnosis: "Остеохондроз",
        icd10: "M54.9",
        progress: 75,
        lastVisit: "2025-06-01",
        history: ["Физиотерапия", "Массаж", "ЛФК"],
        payments: [{ amount: 5000, date: "2025-05-20" }, { amount: 3000, date: "2025-06-01" }],
        department: 'Взрослый нестационар',
        courseStatus: 'on_course',
        fundingType: 'budget'
      },
      {
        id: 2,
        name: "Петрова Анна",
        dob: "1990-03-22",
        gender: "Женский",
        passport: { series: "4321", number: "098765", issuedBy: "УФМС России" },
        registration: "Москва, ул. Мира, д. 5",
        snils: "987-654-321 00",
        omsPolicy: "6543210987654321",
        disability: "2",
        mobility: "Инвалидное кресло",
        documents: [],
        diagnosis: "Реабилитация после травмы",
        icd10: "S93.4",
        progress: 60,
        lastVisit: "2025-05-30",
        history: ["ЛФК", "Массаж", "Гидротерапия"],
        payments: [{ amount: 4000, date: "2025-05-25" }],
        department: 'Детский нестационар',
        courseStatus: 'finished',
        fundingType: 'paid'
      },
    ];
  });
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    localStorage.setItem('statrea_patients', JSON.stringify(patients));
  }, [patients]);

  const filteredPatients = patients
    .filter((patient) => patient.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.progress - a.progress;
      return 0;
    });

  const addPatient = (newPatient) => {
    setPatients([...patients, newPatient]);
  };

  const assignDept = (id, dept) => {
    setPatients(patients.map(p => p.id === id ? { ...p, department: dept } : p));
  };

  const changeCourseStatus = (id, status) => {
    setPatients(patients.map(p => p.id === id ? { ...p, courseStatus: status } : p));
  };

  const changeFundingType = (id, fundingType) => {
    setPatients(patients.map(p => p.id === id ? { ...p, fundingType } : p));
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="container flex-grow-1 py-4">
        <div className="card fade-in">
          <ul className="nav nav-tabs" id="patientTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                id="list-tab"
                onClick={() => setActiveTab('list')}
                type="button"
                role="tab"
              >
                Список пациентов
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
                id="add-tab"
                onClick={() => setActiveTab('add')}
                type="button"
                role="tab"
              >
                Добавить пациента
              </button>
            </li>
          </ul>
          <div className="tab-content" id="patientTabsContent">
            <div className={`tab-pane fade ${activeTab === 'list' ? 'show active' : ''}`} id="list" role="tabpanel">
              <div className="card-body">
                <h2 className="h4 mb-3">Список пациентов</h2>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Поиск по имени..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name">Сортировать по имени</option>
                      <option value="progress">Сортировать по прогрессу</option>
                    </select>
                  </div>
                </div>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onView={() => setSelectedPatient(patient)}
                      onAssignDept={assignDept}
                      onChangeCourseStatus={changeCourseStatus}
                      onChangeFundingType={changeFundingType}
                      onExport={exportPatientCard}
                    />
                  ))
                ) : (
                  <p className="text-muted">Пациенты не найдены</p>
                )}
              </div>
            </div>
            <div className={`tab-pane fade ${activeTab === 'add' ? 'show active' : ''}`} id="add" role="tabpanel">
              <AddPatientForm onAdd={addPatient} />
            </div>
          </div>
        </div>
      </main>
      {selectedPatient && (
        <PatientProfile
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onExport={exportPatientCard}
        />
      )}
    </div>
  );
}