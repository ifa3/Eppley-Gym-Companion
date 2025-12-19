### Eppley Gym Companion


### Project Description:

   Eppley Gym Companion is a web application built for University of Maryland students to help them plan visits to the Eppley Recreation Center. The app provides estimated crowd levels, basic operating hours, and current local weather so students can decide the best time to go to the gym before leaving their dorm or class.

   The project also includes a simple companion tool that allows users to track whether they have used their one-time UID entry for the semester and submit a sample crowd update. All data is presented through a clean interface that works across modern browsers.

### Target Browsers: 

   This application is designed for modern desktop browsers:

- Google Chrome (latest)

- Mozilla Firefox (latest)

- Microsoft Edge (latest)

- Safari (latest)

Basic functionality works on mobile browsers, but the interface is optimized for desktop use.


### Live Deployment

This project is deployed on Vercel and runs on a Node.js backend.

Live URL:
https://eppley-gym-companion.vercel.app/ 

GitHub Repository

Repository Link:
https://github.com/ifa3/Eppley-Gym-Companion 

<img width="1438" height="763" alt="Image" src="https://github.com/user-attachments/assets/888ed97d-7bcf-4da6-a1bd-fe1d92f9d9c8" />

<img width="1440" height="769" alt="Image" src="https://github.com/user-attachments/assets/66950e2b-402c-4f9b-8d9a-c193ba34d4aa" />


### Developer Manual

This section is intended for future developers who may continue working on this project. Readers are expected to understand general web development concepts but do not need prior knowledge of this specific system.

### Technology Stack: 
Frontend: 

- HTML5

- CSS3 (custom responsive styling)

- JavaScript (ES6)

- Chart.js (data visualization)

- Day.js (time handling)

### Backend: 

- Node.js

- Express.js

- Supabase (PostgreSQL database)

- Open-Meteo API (weather data)

- OpenCage Geocoding API (location lookup)

### Project Structure

Final Project/
- about.html
- companion.html
- index.html
- home.js
- companion.js
- styles.css
- server.js
- package.json
- package-lock.json
- README.md
- .env
- .gitignore

### Installation Instructions

- Clone the repository:

git clone https://github.com/your-username/eppley-gym-companion.git

- Navigate into the project folder:

cd eppley-gym-companion

- Install dependencies:

npm install

### Environment Variables

Create a .env file in the root directory with the following variables:

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENCAGE_KEY=your_opencage_api_key
PORT=3000

The .env file is ignored by Git and should never be committed.

### Running the Application Locally

- Start the server using:

npm start

- Then open:

http://localhost:3000

### Backend API Documentation
GET /api/crowd

Retrieves the stored crowd level for a given date and hour.

Query Parameters

date (YYYY-MM-DD)

hour (0–23)

POST /api/crowd

Creates or updates a crowd level entry in Supabase.

### Request Body

{
  "date": "2025-11-16",
  "hour": 14,
  "level": "High"
}

### GET /api/uid-entry

Retrieves whether a device has already used its one-time UID entry for a semester.

### Query Parameters

device_id

semester

POST /api/uid-entry

### Marks a one-time UID entry as used.

Request Body

{
  "device_id": "device-id",
  "semester": "Fall 2025",
  "used_one_time_entry": true
}

### GET /api/hours

Returns a sample weekly operating schedule for the gym.

GET /api/weather

### Fetches live weather data for the Eppley Recreation Center using Open-Meteo and OpenCage.

Frontend Data Access

### All frontend data is loaded using the Fetch API, including:

- Crowd level data

- UID entry tracking

- Weather data

- Daily hours

- The frontend does not access the database directly.

### JavaScript Libraries Used

- Chart.js – Used to render a sample crowd trend chart

- Day.js – Used for handling time and date logic

### Known Limitations

- Crowd levels are demo-based and rely on sample user input

- UID tracking is device-based and not tied to real student records

- Operating hours are static sample data

### Future Improvements

- Real-time crowd integration from RecWell

- User authentication

- Mobile-first UI improvements

- Admin dashboard for staff updates

- Notifications for low-crowd periods

### Contributors: 

- Ifa Bato
- Sirak Abraham