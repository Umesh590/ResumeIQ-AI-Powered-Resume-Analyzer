# 🎯 ResumeIQ – AI-Powered Resume Analyzer


![React](https://img.shields.io/badge/React-19-2188C8?style=flat-round&labelColor=222222)
![Node.js](https://img.shields.io/badge/Node.js-Backend-4CAF50?style=flat-round&labelColor=222222)
![Express](https://img.shields.io/badge/Express-Framework-4CAF50?style=flat-round&labelColor=222222)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-4CAF50?style=flat-round&labelColor=222222)
![Gemini_AI](https://img.shields.io/badge/Gemini_AI-Google_AI-2878B5?style=flat-round&labelColor=222222)
![JWT](https://img.shields.io/badge/JWT-Authentication-C94B40?style=flat-round&labelColor=222222)

---

## 📖 About The Project

ResumeIQ is an **AI-powered Resume Analyzer** that helps job seekers improve their resumes and increase their chances of getting shortlisted. It analyzes uploaded **PDF resumes** against specific **Job Descriptions** using **Google Gemini AI**. The platform evaluates **skills, experience, and keywords** to identify strengths and missing qualifications while generating **AI-driven recommendations** to improve resume quality and job compatibility. Users can also generate and download **detailed PDF analysis reports** for future reference.

## ✨ Key Features

- 📄 **Resume Upload** 
- 🤖 **AI-Powered Analysis** 
- 🎯 **Job Description Matching** 
- 📊 **Resume Evaluation** 
- 🔍 **Keyword Analysis** 
- 💡 **AI Recommendations** 
- 📈 **Resume Insights** 
- 📑 **PDF Report Generation** 
- 🔐 **Secure Authentication** 
- ⚡ **Responsive Interface** 
- 🗄️ **Data Management** 

## 📸 Screenshots

**Register Page**

<img width="884" height="439" alt="resume iq registration page" src="https://github.com/user-attachments/assets/1775c9da-632a-435c-8308-2c761ef28762" />


**Login Page**

<img width="887" height="446" alt="resumeiq login page" src="https://github.com/user-attachments/assets/912c8a2a-6f9d-4267-b467-ff5814805a46" />


**Home Page**

<img width="878" height="448" alt="resume iq home page" src="https://github.com/user-attachments/assets/fdb0761f-9dc7-4009-adbd-37387cf812c6" />


**Resume Upload Page**

<img width="884" height="447" alt="resuem iq home page2" src="https://github.com/user-attachments/assets/3211438e-3616-4af1-b954-ef60be1046e1" />


**AI Analysis Report**

<img width="887" height="448" alt="resume iq  report page " src="https://github.com/user-attachments/assets/2c70ca45-5e3f-4eb4-9a53-b43e4523df27" />


## 🏗️ Architecture

The system architecture follows a client-server model with separate frontend and backend responsibilities to ensure modularity, scalability, and maintainability.

- **Frontend (React.js + Vite):** Handles user interface, resume uploads, and AI report display.
- **Backend (Node.js + Express.js):** Manages APIs, authentication, and resume processing.
- **Database (MongoDB Atlas + Mongoose):** Stores user details and analysis reports.
- **AI Integration (Google Gemini AI):** Provides intelligent resume analysis and recommendations.
- **Resume Parsing (PDF-Parse):** Extracts text from uploaded PDF resumes.
- **PDF Generation (Puppeteer):** Generates downloadable analysis reports.
- **Authentication (JWT):** Provides secure login and protected routes.
 ```mermaid
flowchart TB
    subgraph Client
        U["👤 User"]
        UI["⚛️ React Frontend"]
        UP["📄 Upload Resume & Job Description"]
        U --> UI
        UI --> UP
    end

    subgraph Backend
        API["🚀 Express API"]
        AUTH["🔐 JWT Authentication"]
        PARSER["📑 PDF Parser"]
        AI["🤖 Google Gemini AI"]
        DB[("🍃 MongoDB Atlas")]
        PDF["📥 Puppeteer PDF Generator"]

        API --> AUTH
        API --> PARSER
        PARSER --> AI
        AI --> API
        API <--> DB
        API --> PDF
    end

    UP --> API
    API -->|"Analysis Report"| UI
    PDF -->|"Download PDF Report"| UI

    style Client fill:#fff8dc,stroke:#b8a76a,color:#333
    style Backend fill:#fff8dc,stroke:#b8a76a,color:#333
    style UI fill:#20b99a,stroke:#168a73,color:#fff
    style API fill:#d66ba0,stroke:#a8497a,color:#fff
    style AI fill:#4285f4,stroke:#245bb5,color:#fff
    style DB fill:#e8c66a,stroke:#b3953c,color:#333
    style PDF fill:#d66ba0,stroke:#a8497a,color:#fff
``` 


  
## 📂 Directory Structure

```text
ResumeIQ-AI-Powered-Resume-Analyzer/
│
├── Backend/
    │   ├── package.json
    │   ├── server.js
    │   └── src/
    │       ├── app.js
    │       ├── config/
    │       │   └── database.js
    │       ├── controllers/
    │       │   ├── auth.controller.js
    │       │   └── interview.controller.js
    │       ├── middlewares/
    │       │   ├── auth.middleware.js
    │       │   └── file.middleware.js
    │       ├── models/
    │       │   ├── blacklist.model.js
    │       │   ├── interviewReport.model.js
    │       │   └── user.model.js
    │       ├── routes/
    │       │   ├── auth.routes.js
    │       │   └── interview.routes.js
    │       └── services/
    │           └── ai.service.js
    └── Frontend/
        ├── README.md
        ├── eslint.config.js
        ├── index.html
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.jsx
            ├── app.routes.jsx
            ├── main.jsx
            ├── style.scss
            ├── components/
            │   ├── Footer.jsx
            │   ├── MainLayout.jsx
            │   └── Navbar.jsx
            ├── features/
            │   ├── auth/
            │   │   ├── auth.context.jsx
            │   │   ├── auth.form.scss
            │   │   ├── components/
            │   │   │   └── Protected.jsx
            │   │   ├── hooks/
            │   │   │   └── useAuth.js
            │   │   ├── pages/
            │   │   │   ├── Login.jsx
            │   │   │   └── Register.jsx
            │   │   └── services/
            │   │       └── auth.api.js
            │   └── interview/
            │       ├── interview.context.jsx
            │       ├── hooks/
            │       │   └── useInterview.js
            │       ├── pages/
            │       │   ├── Home.jsx
            │       │   └── Interview.jsx
            │       ├── services/
            │       │   └── interview.api.js
            │       └── style/
            │           ├── home.scss
            │           └── interview.scss
            └── style/
                ├── button.scss
                ├── footer.scss
                ├── layout.scss
                └── navbar.scss


```

## 🛠️ Built With

- **Frontend:** React.js, Vite, React Router DOM
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT, Bcrypt.js
- **AI Integration:** Google Gemini AI 
- **Resume Processing:** PDF-Parse, Multer
- **PDF Generation:** Puppeteer
- **Validation:** Zod
- **Deployment:** Render

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas Account
- Google Gemini API Key
  
---

### Installation

**Clone Repository**

```bash
https://github.com/Umesh590/ResumeIQ-AI-Powered-Resume-Analyzer.git
```

**Backend Setup**

```bash
cd Backend
npm install
npm run dev
```

**Frontend Setup**

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```
---

## 🔑 Environment Variables

Create a `.env` inside Backend:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```
---
## 🚀 Future Roadmap

- 📊 Advanced ATS Score Evaluation
- 🎯 Multiple Job Description Comparisons
- 📄 Resume Template Recommendations
- 🤖 AI-Powered Resume Improvement
- 📈 Resume Score History and Tracking
- 💼 Job Role Recommendations
- 📧 Email Notifications
- 📱 Enhanced Mobile Experience

---
## 👨‍💻 Developer

**Umesh Kumar**

💼 MERN Stack Developer | AI-Powered Application Development

- **GitHub:** https://github.com/Umesh590
- **LinkedIn:** https://www.linkedin.com/in/umesh-kumar111
---
## 🌐 Live Demo

**ResumeIQ:** https://interviewai-frontend-sd63.onrender.com
---
## ⭐ Show Some Love

If you like this project, give it a ⭐ on GitHub.
