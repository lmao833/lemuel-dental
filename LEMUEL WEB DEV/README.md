I want to build a simple, professional, and responsive website for a dental practice called Lemuel’s Dental. Please generate clean, structured code for both the frontend and backend, following these requirements:

General Requirements
Use professional colors suitable for dentistry (light blue, teal, Navy blue, gentle gradients).
Add subtle animations (fade-ins, slide transitions, hover effects) for a modern feel.
The design must be fully responsive (mobile, tablet, desktop).
The homepage should stand out visually, with a hero section, service highlights, and a clear call-to-action.
Use a custom SVG logo with the initials “LD” in the navbar.
Pages
Homepage — Modern layout with hero section, call-to-action, and brief about services.
Register — Patient registration form (name, email, phone, address).
Book Appointment — Date/time picker, service type, linked to user account.
Login Page — Separate login for users and staff.
Dashboard:
User: View their own appointment history.
Staff: View all booked appointments and all registered users.
Footer
Add a footer with:
Address: “12 clove Street, Dansoman, Accra, Ghana”
Phone: “+233 54 763 5431”
Email: “info@Lemueldentalclinic.com”
Copyright: “© 2025 Lemuel's Web Dev Project”
Functional Features
User and staff login system (store accounts in a SQLite database).
Staff can view a list of all booked appointments and all registered users.
Use HTML forms for registration and appointment booking.
Use vanilla JavaScript for form submission and dynamic content.
Connect the frontend to a Python Flask backend with SQLite for:
Registration (/register)
Login (/login)
Book appointment (/book-appointment)
View appointments (/appointments)
View users (users)
Backend (Flask)
Scaffold a Flask app with endpoints for registration, login, booking, and data retrieval.
Use SQLite for data storage.
Enable CORS for frontend-backend communication.
Frontend
Use semantic HTML and CSS for all pages.
Add a custom SVG logo (with “LD” and dental theme colors) to the navbar.
Use JavaScript to handle form submissions and fetch/display data from the backend.
Please generate all necessary files (HTML, CSS, JS, Python, requirements.txt, SVG logo) and provide clear instructions for running both the frontend and backend.

---

## How to Run This Project

### Backend (Flask API)
1. Open a terminal and navigate to `backend`:
   ```cmd
   cd backend
   ```
2. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```cmd
   python app.py
   ```
   The API will run at http://127.0.0.1:5000

### Frontend (Static Files)
1. Open `frontend/index.html` in your browser to view the site.
2. For full functionality, use a local server (e.g., VS Code Live Server extension or Python's `http.server`).

### Default Staff Account
- Register a user, then set `is_staff` to 1 in the `users` table using a SQLite editor if you want staff access.

---

## Project Structure
- `backend/` — Flask API and SQLite DB
- `frontend/` — HTML, CSS, JS, SVG logo

---

For any issues, contact info@Lemueldentalclinic.com