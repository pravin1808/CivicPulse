# CivicPulse 🏛️

**CivicPulse** is a full-stack municipal grievance management platform that bridges the gap between citizens and local administration. Citizens can report civic issues (potholes, broken streetlamps, water leakage, etc.) with photo evidence and GPS coordinates. Administrators review and assign issues to field workers, who then resolve them and upload after-photos as proof.

---

## ✨ Features

### 👤 Citizen
- Register with OTP-based email verification
- Login with role-based JWT authentication
- Report civic issues with photo proof and GPS coordinates
- Track issue status in real time (Pending → Assigned → In Progress → Resolved / Rejected)
- Edit or delete issues while they are in `PENDING` status
- View resolution evidence (before/after photos)

### 🛡️ Admin
- View all reported issues across departments
- Assign issues to field workers
- Register and manage field workers
- System dashboard with statistics and resolution rate metrics

### 🔧 Field Worker
- View issues assigned to their department
- Update issue status (In Progress / Resolved)
- Upload resolution photo as proof when resolving

### 🔐 Authentication
- OTP email verification on citizen registration
- Forgot password via OTP flow
- Stateless JWT-based sessions (no server-side HTTP sessions)
- Role-isolated login endpoints (`/citizen/login`, `/admin/login`, `/worker/login`)

---

## 🏗️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Spring Boot 4.1.0 |
| Language | Java 25 |
| Security | Spring Security + JWT (jjwt 0.13.0) |
| ORM | Spring Data JPA (Hibernate) |
| Database | PostgreSQL |
| Cache/OTP Store | Redis |
| Email | Spring Boot Mail (SMTP) |
| Validation | Jakarta Bean Validation (`@Valid`, `@NotBlank`, etc.) |
| Build Tool | Maven |
| Utilities | Lombok |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Styling | Vanilla CSS (Glassmorphism design) |
| State | React Context API (AuthContext) |
| Font | Google Fonts (Outfit) |

---

## 📁 Project Structure

```
CivicPulse/
├── src/main/java/com/civicpulse/civicpulse/
│   ├── config/
│   │   ├── SecurityConfig.java        # JWT filter chain, role-based access rules
│   │   ├── JwtFilter.java             # Request-level JWT validation filter
│   │   ├── ImageResourceConfig.java   # Serves uploaded images at /images/**
│   │   └── DataInitializer.java       # Seeds departments & categories on startup
│   ├── controller/
│   │   ├── AuthController.java        # Register, OTP verify, login, forgot password
│   │   ├── CitizenController.java     # CRUD for citizen issues
│   │   ├── AdminController.java       # Worker management + issue assignment
│   │   └── WorkerController.java      # Worker issue list + status update
│   ├── service/
│   │   ├── AuthService.java           # OTP generation, user registration, Redis session
│   │   ├── CitizenService.java        # Citizen-scoped issue operations
│   │   ├── AdminService.java          # Admin-scoped operations
│   │   ├── WorkerService.java         # Worker-scoped operations
│   │   ├── IssueService.java          # Issue creation with image upload
│   │   ├── ImageService.java          # Saves image files to local disk
│   │   ├── JwtService.java            # JWT generation & validation
│   │   └── EmailService.java          # Sends OTP emails via SMTP
│   ├── model/
│   │   ├── User.java                  # Unified user entity (citizen/admin/worker via Role)
│   │   ├── Issue.java                 # Issue entity with status, images, GPS, relations
│   │   ├── Category.java              # Issue category (e.g. Pothole Repair)
│   │   ├── Department.java            # Municipal department (e.g. Public Works)
│   │   ├── IssueStatus.java           # Enum: PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED
│   │   ├── Role.java                  # Enum: CITIZEN, ADMIN, WORKER
│   │   └── dto/                       # Request & response DTOs with validation annotations
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java     # @RestControllerAdvice — central error handling
│   │   ├── ResourceNotFoundException.java  # 404 — entity not found
│   │   ├── AccessForbiddenException.java   # 403 — wrong role or ownership
│   │   ├── DuplicateResourceException.java # 409 — email already registered
│   │   ├── InvalidOtpException.java        # 400 — wrong OTP entered
│   │   └── OtpExpiredException.java        # 410 — OTP session expired
│   └── repository/
│       └── jpa/                        # Spring Data JPA repositories
│
└── frontend/src/
    ├── api/
    │   ├── api.js                      # Axios instance with JWT interceptor
    │   └── categories.js               # Department & category lookup maps
    ├── context/
    │   └── AuthContext.jsx             # JWT decode, login/logout, role state
    ├── components/
    │   ├── Sidebar.jsx                 # Role-aware navigation sidebar
    │   ├── TopBar.jsx                  # Page title + user info bar
    │   ├── ProtectedRoute.jsx          # Role-based route guard
    │   ├── StatusBadge.jsx             # Colored badge for issue status
    │   ├── StatCard.jsx                # Dashboard stat card component
    │   └── LoadingSpinner.jsx          # Full-page and inline loader
    ├── pages/
    │   ├── auth/                       # Login, Register, OTP Verify, Forgot Password
    │   ├── citizen/                    # Dashboard, Report Issue, Issue Detail
    │   ├── admin/                      # Dashboard, Issue Management, Admin Issue Detail, Worker Management
    │   └── worker/                     # Worker Dashboard, Worker Issue Detail
    ├── utils/
    │   ├── errorHelper.js              # Parses backend ErrorResponseDto for user-friendly messages
    │   └── imageHelper.js              # Resolves issue image URLs with category-based fallbacks
    └── landing/
        └── LandingPage.jsx             # Public marketing/landing page
```

---

## 🔌 API Endpoints

### Auth — `/api/auth/`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/citizen/register` | Public | Register new citizen (triggers OTP email) |
| `POST` | `/citizen/verify_otp` | Public | Verify OTP and activate account |
| `POST` | `/citizen/login` | Public | Citizen login → returns JWT |
| `POST` | `/admin/login` | Public | Admin login → returns JWT |
| `POST` | `/worker/login` | Public | Worker login → returns JWT |
| `POST` | `/forgot_password` | Public | Request a password-reset OTP |
| `POST` | `/forgot_password/reset` | Public | Verify OTP and set a new password |

### Citizen — `/api/citizen/` *(JWT required, CITIZEN role)*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/issue` | Report new issue (multipart: JSON + image) |
| `GET` | `/issues` | Get all issues reported by logged-in citizen |
| `GET` | `/issue/{id}` | Get single issue detail |
| `PUT` | `/issue` | Update issue (PENDING status only) |
| `DELETE` | `/issue/{id}` | Delete issue (PENDING status only) |

### Admin — `/api/admin/` *(JWT required, ADMIN role)*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/worker_register` | Register a new field worker |
| `GET` | `/workers` | Get all workers |
| `GET` | `/worker/{id}` | Get worker by ID |
| `PUT` | `/worker/{id}` | Update worker details |
| `DELETE` | `/worker/{id}` | Delete a worker |
| `GET` | `/issues` | Get all issues (system-wide) |
| `GET` | `/issue/{id}` | Get issue details |
| `PATCH` | `/issue/assign/{id}` | Assign issue to a worker + set status |

### Worker — `/api/worker/` *(JWT required, WORKER role)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/issues` | Get all issues assigned to logged-in worker |
| `GET` | `/issue/{id}` | Get single assigned issue |
| `PATCH` | `/issue/{id}` | Update status + optional resolution photo |

---

## 🚦 Issue Lifecycle

```
[Citizen Reports] → PENDING
      ↓
[Admin Reviews]   → ASSIGNED (worker selected)
      ↓
[Worker Starts]   → IN_PROGRESS
      ↓
[Worker Resolves] → RESOLVED (after-photo uploaded)
      ↓  or
[Admin Rejects]   → REJECTED
```

---

## ⚠️ Error Handling

The backend uses a `@RestControllerAdvice` `GlobalExceptionHandler` that returns a consistent JSON error structure for all failures:

```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Title must not be blank, Category is required",
  "timestamp": "2026-08-26T17:00:00"
}
```

The frontend reads `error.response.data.message` via `src/utils/errorHelper.js` (`extractErrorMessage`) and displays it inline on every form — no generic "Something went wrong" messages.

---

## 🚀 Getting Started

### Prerequisites
- Java 25+
- Maven 3.9+
- Node.js 18+ & npm
- PostgreSQL (running instance)
- Redis (running instance)
- SMTP credentials (Gmail or any provider)

### Backend Configuration

Create or update `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/civicpulse
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# JWT
jwt.secret=your_very_long_secret_key_here

# Mail (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Image upload storage path (must end with /)
image.upload.path=D:/Images/

# Max file upload size
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Run the Backend

```bash
# From the project root
./mvnw spring-boot:run
# Backend starts on http://localhost:8080
```

### Run the Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

---

## 🔒 Security Notes

- All `/api/citizen/**`, `/api/admin/**`, `/api/worker/**` routes require a valid JWT in the `Authorization: Bearer <token>` header.
- Role mismatch (e.g. a citizen accessing `/api/admin/**`) returns `403 Forbidden`.
- JWT contains the user's email (`sub`) and role claim.
- OTPs are stored in Redis with a 2-minute TTL.
- Passwords must be 8-20 characters with at least one uppercase, lowercase, digit, and special character.
- Images are stored on the local filesystem and served publicly at `/images/**`.

---

## 📦 Key Dependencies

### Backend
| Dependency | Version | Purpose |
|---|---|---|
| `spring-boot-starter-parent` | 4.1.0 | Spring Boot base |
| `spring-boot-starter-security` | — | Authentication & authorization |
| `spring-boot-starter-data-jpa` | — | ORM with Hibernate |
| `spring-boot-starter-data-redis` | — | OTP caching |
| `spring-boot-starter-mail` | — | SMTP email |
| `spring-boot-starter-validation` | — | Bean validation |
| `jjwt-api/impl/jackson` | 0.13.0 | JWT token handling |
| `postgresql` | — | Database driver |
| `lombok` | 1.18.46 | Boilerplate reduction |

### Frontend
| Dependency | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client |
| `lucide-react` | Icon library |
| `vite` | Build tool & dev server |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built by **Pravin** — a full-stack Spring Boot + React project for learning and portfolio demonstration.

> *CivicPulse — Empowering citizens, enabling administration.*
