# 🎓 Alumni Management System

A full-stack web application designed to streamline alumni engagement, networking, job sharing, mentorship, and donations within an institution.

---

## 🚀 Live Deployment

🔗 https://alumni-management-system-1-backend.onrender.com/

---

## 📌 Overview

The Alumni Management System provides a centralized platform where:

* Alumni can register and stay connected
* Students can explore opportunities and mentorship
* Jobs and internships can be posted
* Donations can be made for institutional growth
* Mentorship sessions can be scheduled

The system follows a **client-server architecture** with dynamic UI rendering and RESTful API integration.

---

## ✨ Key Features

### 🔹 Authentication & User Roles


* Separate signup flows for **Alumni** and **Students**
* Alumni → Name, Email, Graduation Year
* Students → Name, Email, College ID

---

### 🔹 Dashboard (Alumni)

* Live **Alumni Count**
* **Job & Internship Posting**
* **Mentorship Setup & Bookings**
* **Donation Tracking Panel**

---

### 🔹 Job & Internship Portal

* Alumni can post opportunities
* Students can explore and apply
* Supports:

  * Remote / Onsite / Hybrid roles
  * Internship (Online / Offline)

---

### 🔹 Mentorship System

* Alumni can enable mentorship
* Configure:

  * Availability
  * Contact details
  * Meeting links
* Students can book sessions

---

### 🔹 Donation Module

* Alumni can contribute funds
* Categorized causes:

  * Education
  * Research
  * Medical Aid
  * Disaster Relief

---

### 🔹 Dynamic UI Features

* Real-time-like updates using **polling**
* **Event Delegation** for scalable interaction handling
* **Conditional Rendering** for panel switching
* **Reusable Card-Based UI**

---

## 🏗️ Tech Stack

### Frontend

* HTML5
* CSS3 (Flexbox + Grid + CSS Variables)
* Vanilla JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

---

## ⚙️ Core Concepts Implemented

* **Event Bubbling & Event Delegation**
* JWT Authentication & Security
* **REST API Integration**
* **Dynamic DOM Rendering**
* **State Persistence (localStorage)**
* **Responsive Design**
* **Single Page Application (SPA-like behaviour)**

---

## 📁 Project Structure

```
alumni-management-system/
│
├── frontend/
│   ├── dashboard/
│   ├── login/
│   ├── signup/
│   └── styles/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── server.js
│
└── README.md
```

---

## 🧪 API Endpoints (Sample)

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| GET    | /api/users/stats      | Get total alumni count  |
| POST   | /api/posts/create     | Create job/internship   |
| GET    | /api/posts            | Fetch all posts         |
| POST   | /api/donations/create | Add donation            |
| GET    | /api/donations        | Fetch donations         |
| PUT    | /api/users/:id        | Update mentor settings  |
| GET    | /api/meetings/:id     | Get mentorship bookings |

---

## 🛠️ Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-link>
cd alumni-management-system
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Start Server

```bash
npm start
```

### 4. Open Frontend

* Open `index.html` in browser
* Or use Live Server

---

## 📈 Future Enhancements


* Real-time updates using WebSockets
* Email notifications for mentorship
* Admin panel for moderation
* Advanced search & filtering

---

## 👨‍💻 Author

Developed as part of a full-stack project to address alumni engagement challenges and provide scalable networking solutions.

---

## 📄 License

This project is open-source and available under the MIT License.

