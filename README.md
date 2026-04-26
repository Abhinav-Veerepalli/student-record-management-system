# 📚 Student Record Management System (SRMS)

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A professional, modular Student Record Management System designed to streamline academic administrative tasks. Built with a robust backend architecture using **Node.js**, **Express**, and **MySQL**, and a dynamic frontend powered by **EJS**.

---

## 🌟 Key Features

- 🔐 **Secure Authentication**: Multi-role login system (Admin, Teacher, Student) using Passport.js and Bcrypt password hashing.
- 👨‍🎓 **Student Management**: Full CRUD operations for student records, including registrations and profile updates.
- 👩‍🏫 **Teacher Management**: Administrative tools to manage faculty records and course assignments.
- 📖 **Course & Enrollment**: Comprehensive system for managing subjects and student enrollments.
- 🏗️ **Modular Architecture**: Clean code structure with separate modules for high maintainability.
- 🛡️ **Session Management**: Secure user sessions with persistent login states.

---

## 🏗️ Project Structure

```text
SRMS/
├── public/                 # Static assets (CSS, JS, Images)
├── src/
│   ├── database/           # Database configuration and connection pools
│   ├── middleware/         # Custom authentication and validation middleware
│   ├── modules/            # Domain-driven modules (Admin, Auth, Courses, etc.)
│   ├── app.js              # Express application configuration
│   └── index.js            # Server entry point
├── views/                  # EJS templates for dynamic rendering
├── .env                    # Environment variables configuration
├── quries.sql              # Database schema and initial setup
└── package.json            # Project dependencies and scripts
```

---

## 🛠️ Technology Stack

- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Frontend**: [EJS](https://ejs.co/), [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **Database**: [MySQL](https://www.mysql.com/) (using `mysql2/promise`)
- **Security**: [Bcrypt](https://www.npmjs.com/package/bcrypt), [Passport.js](https://www.passportjs.org/)
- **Development**: [Nodemon](https://nodemon.io/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher)
- **MySQL Server**
- **npm** (Node Package Manager)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SRMS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=srms
   SESSION_SECRET=your_secret_key
   ```

4. **Database Setup**:
   Import the `quries.sql` file into your MySQL database:
   ```bash
   mysql -u root -p srms < quries.sql
   ```

### Running the Application

- **Development Mode** (with auto-reload):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

The application will be accessible at `http://localhost:3000`.

---

## 🧑‍💻 Contributing Developers

- **PATURU V N S GANESH CHARAN**
- **KISHOR GUNITHI**
- **DOGGA YASHWANTH**
- **R.NITHIN**
- **ANAND GOKUL KOTA**

---

## 📄 License

This project is licensed under the **ISC License**.

---
<p align="center">Made with ❤️ for Academic Excellence</p>
