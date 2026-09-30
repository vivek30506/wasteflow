# ♻️ WasteFlow — Smart Waste Management System

> **Cleaner Cities. Greener Tomorrow.**

WasteFlow is a responsive web application prototype for **smart waste reporting, pickup requests, complaint tracking, waste awareness, hotspot monitoring, and administrative operations**. It connects citizens with waste-management teams through one digital workflow.

> **Current status:** Frontend/prototype with backend API integration planned. Forms and data shown in the current repository are demo interactions unless connected to a backend.

---

## 🎯 Problem

Waste-management processes can suffer from overflowing bins, missed collection, illegal dumping, poor segregation, difficult complaint reporting, and limited visibility for administrators.

WasteFlow provides a centralized flow:

```text
Citizen → Report / Pickup Request → Location + Details → Team Review
        → Assignment → Service / Resolution → Status Tracking

Admin → Dashboard → Complaints → Priority / Hotspots → Assignment → Analytics
```

---

## ✨ Key Features

### 👤 Authentication & Roles
- Citizen/Admin login and registration UI
- Role selection and form validation
- Password confirmation and forgot-password UI
- Production-ready path: secure authentication, JWT/session, RBAC and server-side validation

### 🚨 Waste Issue Reporting
Users can report:
- Overflowing bins
- Garbage on roads
- Missed collection
- Illegal dumping
- E-waste issues
- Other waste problems

**Flow:**
```text
Category → Description → Photo → Location → Submit → Complaint ID → Track
```

Includes photo-upload UI, browser geolocation, landmark/location field, validation and confirmation feedback.

### 🚛 Waste Pickup Requests
Users can submit:
- Waste type
- Quantity
- Address
- Preferred date/time
- Additional instructions

**Flow:**
```text
Request → Team Review → Pickup Window → Collection → Completion
```

### 🔎 Complaint Tracking
Track a complaint using its ID (example: `WF-2408`).

```text
Submitted → Under Review → Verified → Assigned → In Progress → Resolved
```

### 🧑‍💼 Admin Dashboard
Provides a centralized view of:
- Total, pending, in-progress and resolved complaints
- Categories and status distribution
- Priority cases
- Waste hotspots
- Recent reports
- Operational analytics
- Report/export UI

### 🗺️ Maps & Hotspots
- Leaflet.js
- OpenStreetMap
- Browser Geolocation API
- Sample High / Medium / Low hotspot markers

> Current hotspot data is demo data; production data should come from a backend/database.

### 📚 Waste Awareness
Covers:
- Wet waste
- Dry waste
- Hazardous waste
- E-waste
- Composting
- Do's & Don'ts

### 🌐 Language & Responsive UI
- English/Hindi interface support
- Desktop, tablet and mobile layouts
- Mobile navigation/sidebar
- Responsive cards, forms, charts and maps

---

# 🤝 Partner Updates & Ticket Management

The planned partner/collection-team module will allow partners to see **tickets assigned to them plus unassigned tickets** and update ticket status.

### Ticket status
```text
Pending → Assigned → On the Way → Done
                         └──────→ Rejected
```

Partners can view relevant ticket/request details and change the status from their dashboard.

### 🔄 5-Second Polling
Partner pages will request the latest ticket data every **5 seconds**, so updates appear without manually reloading the page.

```text
Partner Dashboard
       ↓ every 5 seconds
GET /api/partner/tickets
       ↓
Backend / Database
       ↓
Latest Tickets / Status
```

**Technical approach: HTTP polling, not WebSockets.**

---

# 📧 SMTP Email Notifications

The planned backend notification service will send automated emails through **SMTP** for key workflow events:

| Event | Email |
|---|---|
| User registration | Welcome |
| Request submitted | Request Raised |
| Ticket assigned | Assigned |
| Partner starts service | On the Way |
| Ticket completed/resolved | Completed / Resolved |

**Flow:**
```text
User/Partner Action → Backend → Status Update → Notification Service → SMTP → Email Inbox
```

SMTP credentials must remain on the backend/server and be stored through environment variables—not in frontend JavaScript.

---

# 🔄 Complete Workflow

### Citizen
```text
Register/Login
   ↓
Report Issue OR Request Pickup OR Learn Awareness
   ↓
Add Details + Location/Photo
   ↓
Submit
   ↓
Backend/API
   ↓
Admin/Team Review
   ↓
Assignment
   ↓
Service / Resolution
   ↓
Citizen Tracks Status
```

### Admin
```text
Login → Dashboard → Review → Filter/Prioritize → Assign → Monitor
      → Resolve → Analytics / Reports
```

### Partner
```text
View Assigned + Unassigned Tickets
        ↓
Update Status
        ↓
Pending → Assigned → On the Way → Done / Rejected
        ↓
5-second polling keeps data updated
```

---

# 🏗️ Architecture

```text
Frontend
HTML + CSS + JavaScript + Tailwind CSS
        │
        │ REST API
        ▼
Backend (planned)
Node.js + Express
Auth + Business Logic + Notifications
        │
        ▼
Database (planned)
MongoDB / PostgreSQL
```

---

# 🛠️ Technology Stack

| Technology | Use |
|---|---|
| HTML5 / CSS3 | Structure & styling |
| JavaScript | Frontend logic |
| Tailwind CSS | Responsive UI |
| Lucide Icons | Icons |
| Chart.js | Admin charts |
| Leaflet.js | Maps |
| OpenStreetMap | Map tiles |
| Geolocation API | Current location |
| Node.js + Express | Planned backend |
| MongoDB / PostgreSQL | Planned database |
| JWT / Session | Planned authentication |
| SMTP | Planned email notifications |

---

# 📁 Project Structure

```text
WasteFlow/
├── index.html
├── login.html
├── register.html
├── citizen-dashboard.html
├── report-issue.html
├── pickup-request.html
├── complaint-tracking.html
├── awareness.html
├── mobile-view.html
├── admin-dashboard.html
├── app.css
├── app.js
├── .vscode/settings.json
└── README.md
```

---

# 🔌 Backend API Contract

The frontend documents the expected API routes for backend integration:

```http
POST /api/auth/register
POST /api/auth/login

POST /api/complaints
GET  /api/complaints/:userId
GET  /api/complaints/track/:id

POST /api/pickups
GET  /api/pickups/admin

GET  /api/admin/stats
GET  /api/admin/heatmap-data

GET  /api/partner/tickets
PATCH /api/partner/tickets/:id/status
```

The partner endpoint can be polled every 5 seconds by the partner dashboard.

---

# 🗄️ Suggested Data Model

**Users:** `id, name, email, passwordHash, role, address`

**Complaints:** `id, userId, category, description, imageUrl, location, status, assignedTo`

**Pickups:** `id, userId, wasteType, quantity, date, status`

**Tickets:** `id, complaintId/pickupId, assignedPartner, status, location, timestamps`

---

# 🔐 Production Security

Before handling real citizen data:

- Hash passwords; never store plain text passwords.
- Use secure JWT/session authentication and RBAC.
- Validate/sanitize all server inputs.
- Validate image type and upload size.
- Use HTTPS, CORS and rate limiting.
- Store database and SMTP credentials in environment variables.
- Protect admin/partner APIs with authorization.
- Log important events and handle failures safely.
- Validate location data server-side.

---

# ⚙️ Prototype vs Production

| Area | Current | Production |
|---|---|---|
| UI/pages | ✅ | ✅ |
| Reporting | Demo | Live API + DB |
| Pickup | Demo | Live API + DB |
| Tracking | Demo | Live status |
| Hotspots | Sample | Live GIS data |
| Admin analytics | Sample | Live data |
| Authentication | UI/demo | Secure auth + RBAC |
| Partner module | Planned | Ticket API + 5-sec polling |
| Emails | Planned | SMTP service |
| Database | — | MongoDB/PostgreSQL |
| Backend | — | Node.js/Express |
| File storage | — | Cloud/local storage |
| AI classification | Future | Computer-vision model |

---

# 🚀 Run Locally

### VS Code + Live Server

1. Clone/download the repository.
2. Open it in VS Code.
3. Install **Live Server**.
4. Open `index.html` → **Open with Live Server**.
5. The project settings use port **5501**.

Geolocation works more reliably on `localhost` than a `file://` URL.

---

# 🌍 GitHub Pages Deployment

Because the current project is a static frontend, it can be hosted on GitHub Pages.

```bash
git init
git add .
git commit -m "Initial WasteFlow prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/wasteflow.git
git push -u origin main
```

Then open:

```text
GitHub Repository
→ Settings
→ Pages
→ Deploy from a branch
→ main / root
→ Save
```

> The frontend can be hosted on GitHub Pages. Backend APIs, database and SMTP require a backend-capable hosting environment.

---

# 🧪 Quick Testing Checklist

- [ ] Navigation and landing page
- [ ] Login/register validation
- [ ] Citizen dashboard
- [ ] Issue category, description, image and location
- [ ] Complaint submission/tracking UI
- [ ] Pickup form
- [ ] Admin dashboard, charts and hotspots
- [ ] Awareness section
- [ ] Hindi/English UI
- [ ] Mobile responsiveness
- [ ] Partner ticket workflow (when backend is connected)
- [ ] 5-second polling (when partner API is connected)
- [ ] SMTP email events (when backend/SMTP is connected)

---

# 🎤 Hackathon Demo Flow

```text
Landing Page
 → Problem
 → Citizen Login
 → Dashboard
 → Report Issue + Location/Photo
 → Track Complaint
 → Pickup Request
 → Awareness
 → Admin Dashboard + Analytics + Hotspots
 → Partner Workflow + 5-sec Polling
 → SMTP Notification Flow
 → Backend / Scalability
```

---

# 🚀 Future Scope

- 🤖 AI image-based waste classification
- 🗺️ Intelligent waste-hotspot prediction
- 🔔 SMS/push notifications
- 📧 SMTP email automation
- 🤝 Partner/collection-team operations
- 🔄 Live ticket polling / optional real-time technology later
- 🚛 Route optimization using location, priority, volume and vehicle capacity
- 📊 Advanced resolution-time and area-wise analytics
- 🌐 Dual-Language Support — English & Hindi for wider accessibility
- ☁️ Production cloud deployment

---

# 💡 Project Value

**Citizen:** Report → Request → Track → Learn

**Administration:** Monitor → Prioritize → Assign → Resolve → Analyze

WasteFlow turns waste complaints and pickup requests into a structured, trackable digital workflow.

---

## 👨‍💻 Project

**WasteFlow — Smart Waste Management System**  
**Domain:** Smart City / Waste Management / Civic Technology  
**Users:** Citizens • Administrators • Waste Collection Partners

> **Cleaner Cities. Greener Tomorrow. ♻️**
