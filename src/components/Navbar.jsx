import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (paths) => paths.includes(location.pathname);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const closeMenu = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand d-flex align-items-center" to="/dashboard" onClick={closeMenu}>
          <img
            src="/logo.png"
            alt="StatRea"
            style={{ height: 32, width: "auto", marginRight: 10, borderRadius: 4 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="fw-bold tracking-wide">StatRea</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Переключить навигацию"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/dashboard") ? "active fw-bold" : ""}`}
                to="/dashboard"
                onClick={closeMenu}
              >
                <i className="fas fa-chart-pie me-1"></i> Дашборд
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/patients") ? "active fw-bold" : ""}`}
                to="/patients"
                onClick={closeMenu}
              >
                <i className="fas fa-user-injured me-1"></i> Пациенты
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/schedule") ? "active fw-bold" : ""}`}
                to="/schedule"
                onClick={closeMenu}
              >
                <i className="fas fa-calendar-days me-1"></i> Расписание
              </Link>
            </li>

            {/* Комиссии dropdown */}
            <li className="nav-item dropdown">
              <button
                className={`nav-link dropdown-toggle btn btn-link text-decoration-none ${
                  isGroupActive(["/selectioncommission", "/medicalcommission"]) ? "active fw-bold" : ""
                }`}
                type="button"
                onClick={() => toggleDropdown("commissions")}
              >
                <i className="fas fa-clipboard-list me-1"></i> Комиссии
              </button>
              <ul
                className={`dropdown-menu ${openDropdown === "commissions" ? "show" : ""}`}
                style={{ position: "absolute" }}
              >
                <li>
                  <Link
                    className={`dropdown-item ${isActive("/selectioncommission") ? "active" : ""}`}
                    to="/selectioncommission"
                    onClick={closeMenu}
                  >
                    <i className="fas fa-users-gear me-2"></i> Отборочная комиссия
                  </Link>
                </li>
                <li>
                  <Link
                    className={`dropdown-item ${isActive("/medicalcommission") ? "active" : ""}`}
                    to="/medicalcommission"
                    onClick={closeMenu}
                  >
                    <i className="fas fa-clipboard-check me-2"></i> Врачебная комиссия
                  </Link>
                </li>
              </ul>
            </li>

            {/* Организация dropdown */}
            <li className="nav-item dropdown">
              <button
                className={`nav-link dropdown-toggle btn btn-link text-decoration-none ${
                  isGroupActive(["/departments", "/staff"]) ? "active fw-bold" : ""
                }`}
                type="button"
                onClick={() => toggleDropdown("org")}
              >
                <i className="fas fa-building me-1"></i> Организация
              </button>
              <ul
                className={`dropdown-menu ${openDropdown === "org" ? "show" : ""}`}
                style={{ position: "absolute" }}
              >
                <li>
                  <Link
                    className={`dropdown-item ${isActive("/departments") ? "active" : ""}`}
                    to="/departments"
                    onClick={closeMenu}
                  >
                    <i className="fas fa-hospital me-2"></i> Отделения
                  </Link>
                </li>
                <li>
                  <Link
                    className={`dropdown-item ${isActive("/staff") ? "active" : ""}`}
                    to="/staff"
                    onClick={closeMenu}
                  >
                    <i className="fas fa-user-md me-2"></i> Сотрудники
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/finance") ? "active fw-bold" : ""}`}
                to="/finance"
                onClick={closeMenu}
              >
                <i className="fas fa-wallet me-1"></i> Финансы
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/complaints") ? "active fw-bold" : ""}`}
                to="/complaints"
                onClick={closeMenu}
              >
                <i className="fas fa-exclamation-circle me-1"></i> Жалобы
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/notifications") ? "active fw-bold" : ""}`}
                to="/notifications"
                onClick={closeMenu}
              >
                <i className="fas fa-bell me-1"></i> Уведомления
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/auditlog") ? "active fw-bold" : ""}`}
                to="/auditlog"
                onClick={closeMenu}
              >
                <i className="fas fa-history me-1"></i> Аудит
              </Link>
            </li>
          </ul>

          {location.pathname !== "/dashboard" && (
            <div className="d-flex align-items-center">
              <Link
                to="/dashboard"
                className="btn btn-outline-light btn-sm d-flex align-items-center"
                onClick={closeMenu}
              >
                <i className="fas fa-arrow-left me-1"></i> Главная
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
