# Career & Contact Queries Backend

A Node.js + Express + MongoDB (Mongoose) REST API for:

1. **Career Page** — job postings (`Career`) and candidate applications (`Application`)
2. **Contact / Client Queries** — messages submitted via a "Contact Us" form (`ContactQuery`)

## Project Structure

```
career-contact-backend/
├── config/
│   └── db.js                    # MongoDB connection
├── models/
│   ├── Career.js                # Job posting schema
│   ├── Application.js           # Job application schema
│   └── ContactQuery.js          # Contact/client query schema
├── controllers/
│   ├── careerController.js
│   ├── applicationController.js
│   └── contactController.js
├── routes/
│   ├── careerRoutes.js
│   ├── applicationRoutes.js
│   └── contactRoutes.js
├── middleware/
│   └── errorHandler.js          # 404 + centralized error handling
├── utils/
│   └── apiResponse.js           # sendSuccess / sendError helpers
├── .env.example
├── package.json
└── server.js                    # App entry point
```

## Setup

```bash
cd career-contact-backend
npm install
cp .env.example .env
# edit .env with your MongoDB URI

npm run dev     # requires nodemon (devDependency)
# or
npm start
```

Make sure MongoDB is running locally, or set `MONGO_URI` in `.env` to an Atlas connection string.

## API Endpoints

### Careers (`/api/careers`)
| Method | Endpoint                     | Description                          |
|--------|-------------------------------|---------------------------------------|
| POST   | `/api/careers`                | Create a job posting |
| GET    | `/api/careers`                | List job postings (filters: `status`, `department`, `employmentType`, `workMode`, `location`, `search`, `page`, `limit`, `sort`) |
| GET    | `/api/careers/:idOrSlug`      | Get one job posting by ID or slug |
| PUT    | `/api/careers/:id`            | Update a job posting |
| PATCH  | `/api/careers/:id/status`     | Update only the status |
| DELETE | `/api/careers/:id`            | Delete a job posting (also deletes its applications) |
| GET    | `/api/careers/stats/summary`  | Counts by status / department |

### Applications (`/api/applications`)
| Method | Endpoint                           | Description |
|--------|--------------------------------------|--------------|
| POST   | `/api/applications`                 | Submit an application to a job (`job` = Career `_id`) |
| GET    | `/api/applications`                 | List applications (filters: `job`, `status`, `search`, `page`, `limit`, `sort`) |
| GET    | `/api/applications/:id`             | Get one application |
| PUT    | `/api/applications/:id`             | Update an application |
| PATCH  | `/api/applications/:id/status`      | Update only the status |
| DELETE | `/api/applications/:id`             | Delete an application |

### Contact / Client Queries (`/api/contact-queries`)
| Method | Endpoint                                | Description |
|--------|--------------------------------------------|--------------|
| POST   | `/api/contact-queries`                     | Submit a contact/client query |
| GET    | `/api/contact-queries`                     | List queries (filters: `status`, `queryType`, `priority`, `search`, `page`, `limit`, `sort`) |
| GET    | `/api/contact-queries/:id`                 | Get one query (marks as read) |
| PUT    | `/api/contact-queries/:id`                 | Update a query |
| PATCH  | `/api/contact-queries/:id/respond`         | Save a response and mark resolved (`{ response, respondedBy }`) |
| PATCH  | `/api/contact-queries/:id/status`          | Update only the status |
| DELETE | `/api/contact-queries/:id`                 | Delete a query |
| GET    | `/api/contact-queries/stats/summary`       | Counts by status / type, unread count |

## Example Requests

**Create a job posting**
```bash
curl -X POST http://localhost:5000/api/careers \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Engineer",
    "department": "Engineering",
    "location": "Remote",
    "workMode": "remote",
    "employmentType": "full-time",
    "experienceLevel": "senior",
    "description": "We are looking for a senior backend engineer...",
    "skills": ["Node.js", "MongoDB", "AWS"],
    "status": "open"
  }'
```

**Apply to a job**
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "job": "<career_id>",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "resumeUrl": "https://example.com/uploads/jane-resume.pdf"
  }'
```

**Submit a contact query**
```bash
curl -X POST http://localhost:5000/api/contact-queries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Client",
    "email": "john@company.com",
    "company": "Acme Corp",
    "subject": "Partnership inquiry",
    "message": "We would like to discuss a potential partnership.",
    "queryType": "partnership"
  }'
```

## Notes
- All responses follow the shape: `{ success, message, data, meta? }` (see `utils/apiResponse.js`).
- Add an authentication/authorization middleware (e.g., JWT) in front of admin-only routes (create/update/delete, stats) before deploying to production — this scaffold ships without auth so you can plug in your own.
- File uploads (resumes, attachments) are expected to be handled by a separate upload flow (e.g., multer + S3/Cloudinary) that returns a URL, which is then stored in `resumeUrl` / `attachments`.
