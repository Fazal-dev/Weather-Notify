Weather Notify
~
Weather Notify is a web application designed to provide users with daily weather updates via email. The application utilizes the OpenWeatherMap API to fetch weather data and Google Generative AI to generate detailed weather reports. These reports are sent to users periodically using the Node-cron scheduler and Nodemailer for email delivery.

Features

    User Registration: Users can sign up with their email and location.
    Weather Data Fetching: Fetches current weather data from the OpenWeatherMap API based on the user's location.
    AI-Generated Reports: Uses Google Generative AI to create detailed and engaging weather reports.
    Email Notifications: Sends periodic weather updates to users via email.
    CRUD Operations: Users can update their location details.


    Tech Stack

        Backend: Node.js, Express.js
        Database: MongoDB
        Email Service: Nodemailer
        Scheduler: Node-cron
        AI Service: Google Generative AI
        Weather Data: OpenWeatherMap API

Getting Started

Prerequisites

    Ensure you have the following installed:

        Node.js
        MongoDB
        npm

Installation

    Clone the repository:

        git clone https://github.com/Fazal-dev/Weather-Notify.git
        cd weather-notify

Install dependencies:

    npm install

Create a .env file in the root directory and add the following environment variables:

    OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
    GEMINI_API_KEY=your_google_generative_ai_key
    MAILTRAP_HOST=smtp.mailtrap.io
    MAILTRAP_PORT=2525
    MAILTRAP_USER=your_mailtrap_user
    MAILTRAP_PASS=your_mailtrap_password

Start the application:

    npm start

API Endpoints

Create User:

        POST /api/user
        Request Body: { "email": "user@example.com", "location": "City Name" }

Update User Location:

        PATCH /api/user/:id/location
        Request Body: { "location": "New City Name" }

Get Weather Data for User:

        GET /api/weatherData/:id/weather/:date
        URL Params: id (User ID), date (YYYY-MM-DD format)

Functionality

    Fetch Weather Data:Fetches weather data from the OpenWeatherMap API based on the user's location.

    Generate Weather Report: Generates a detailed weather report using Google Generative AI.

    Send Email:Sends the generated weather report to the user's email.

    Cron Job:Schedules a task to run every 3 hours, checking for new weather data and sending email notifications to users.

Contact
For any inquiries or questions.please contact Fasal Mohamed at mfazal404@gmail.com.
