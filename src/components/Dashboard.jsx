import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const tiles = [
  {
    title: "Пациенты",
    icon: "fa-user-injured",
    bg: "bg-primary",
    link: "/patients",
    key: "patients",
    description: "Общее число пациентов"
  },
  {
    title: "Записи на комиссию",
    icon: "fa-clipboard-list",
    bg: "bg-success",
    link: "/medicalcommission",
    key: "appointments",
    description: "Записей на медицинскую комиссию"
  },
  {
    title: "Записи на отборочную комиссию",
    icon: "fa-users-gear",
    bg: "bg-info",
    link: "/selectioncommission",
    key: "selectionAppointments",
    description: "Записей на отборочную комиссию"
  },
  {
    title: "Расписание",
    icon: "fa-calendar-days",
    bg: "bg-secondary",
    link: "/schedule",
    key: "schedule",
    description: "Количество записей в расписании"
  },
  {
    title: "Уведомления",
    icon: "fa-bell",
    bg: "bg-warning",
    link: "/notifications",
    key: "unreadNotifications",
    description: "Непрочитанных уведомлений"
  },
  {
    title: "Жалобы",
    icon: "fa-exclamation-circle",
    bg: "bg-danger",
    link: "/complaints",
    key: "newComplaints",
    description: "Новых жалоб"
  },
  {
    title: "Финансы (Поступлений)",
    icon: "fa-wallet",
    bg: "bg-success",
    link: "/finance",
    key: "totalIncome",
    description: "Поступлений, ₽"
  },
  {
    title: "Финансы (Возвратов)",
    icon: "fa-undo",
    bg: "bg-danger",
    link: "/finance",
    key: "totalRefund",
    description: "Возвратов, ₽"
  },
  {
    title: "Отделения",
    icon: "fa-building",
    bg: "bg-info",
    link: "/departments",
    key: "departments",
    description: "Всего отделений"
  },
  {
    title: "Сотрудники",
    icon: "fa-user-md",
    bg: "bg-primary",
    link: "/staff",
    key: "staff",
    description: "Всего сотрудников"
  },
  {
    title: "Аудит",
    icon: "fa-clipboard-check",
    bg: "bg-dark",
    link: "/auditlog",
    key: "audit",
    description: "Просмотр лога аудита"
  }
];

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectionAppointments, setSelectionAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [finance, setFinance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    try {
      const p = localStorage.getItem("statrea_patients");
      setPatients(p ? JSON.parse(p) : [
        { id: 1, name: "Иванов Иван" },
        { id: 2, name: "Петрова Анна" }
      ]);
    } catch { setPatients([]); }

    try {
      const a = localStorage.getItem("statrea_medical_commission");
      setAppointments(a ? JSON.parse(a) : []);
    } catch { setAppointments([]); }

    try {
      const sa = localStorage.getItem("statrea_selection_appointments") || localStorage.getItem("statrea_selection_commission");
      setSelectionAppointments(sa ? JSON.parse(sa) : []);
    } catch { setSelectionAppointments([]); }

    try {
      const sc = localStorage.getItem("statrea_appointments") || localStorage.getItem("statrea_schedule");
      setSchedule(sc ? JSON.parse(sc) : [
        { id: 1 }, { id: 2 }
      ]);
    } catch { setSchedule([]); }

    try {
      const fin = localStorage.getItem("statrea_payments");
      setFinance(fin ? JSON.parse(fin) : [
        { id: 1, type: "Поступление", amount: 5000 },
        { id: 2, type: "Поступление", amount: 8000 },
        { id: 3, type: "Возврат", amount: 3000 }
      ]);
    } catch { setFinance([]); }

    try {
      const notifs = localStorage.getItem("statrea_notifications");
      setNotifications(notifs ? JSON.parse(notifs) : [
        { id: 1, read: false },
        { id: 2, read: true },
        { id: 3, read: false }
      ]);
    } catch { setNotifications([]); }

    try {
      const comp = localStorage.getItem("statrea_complaints");
      setComplaints(comp ? JSON.parse(comp) : [
        { id: 1, status: "Новая" },
        { id: 2, status: "Рассмотрена" }
      ]);
    } catch { setComplaints([]); }

    try {
      const dep = localStorage.getItem("statrea_departments");
      setDepartments(dep ? JSON.parse(dep) : [
        { id: 1 }, { id: 2 }, { id: 3 }
      ]);
    } catch { setDepartments([]); }

    try {
      const st = localStorage.getItem("statrea_staff");
      setStaff(st ? JSON.parse(st) : [
        { id: 1 }, { id: 2 }, { id: 3 }
      ]);
    } catch { setStaff([]); }
  }, []);

  const totalIncome = finance.filter(p=>p.type==="Поступление").reduce((s,p)=>s+Number(p.amount||0),0);
  const totalRefund = finance.filter(p=>p.type==="Возврат").reduce((s,p)=>s+Number(p.amount||0),0);
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const newComplaints = complaints.filter(c => c.status === "Новая").length;

  const tileData = {
    patients: patients.length,
    appointments: appointments.length,
    selectionAppointments: selectionAppointments.length,
    schedule: schedule.length,
    unreadNotifications,
    newComplaints,
    totalIncome: totalIncome.toLocaleString("ru-RU"),
    totalRefund: totalRefund.toLocaleString("ru-RU"),
    departments: departments.length,
    staff: staff.length,
    audit: ""
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <img
          src="/logo.png"
          alt="StatRea логотип"
          style={{ height: 90, marginBottom: 15 }}
        />
        <h1 className="display-4 fw-bold mb-2">StatRea</h1>
        <div className="fs-5 text-muted mb-2">
          специально разработано для ГБУ ЦРИ Царицыно
        </div>
      </div>
      <div className="row g-4">
        {tiles.map(tile => (
          <div key={tile.key} className="col-12 col-md-6 col-lg-4">
            <Link to={tile.link} className="text-decoration-none">
              <div className={`card text-white ${tile.bg} h-100 shadow-sm`}>
                <div
                  className="card-body d-flex flex-column align-items-center justify-content-center"
                  style={{ minHeight: 170 }}
                >
                  <i className={`fas ${tile.icon} fa-3x mb-3`} aria-hidden="true"></i>
                  <div className="fs-2 fw-bold">
                    {tileData[tile.key] !== undefined ? tileData[tile.key] : ""}
                  </div>
                  <div className="fs-5">{tile.title}</div>
                  <div className="small text-white-50">{tile.description}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <footer className="mt-5 text-center text-muted small">
        разработчик Aleksandr Zharkov
      </footer>
    </div>
  );
}