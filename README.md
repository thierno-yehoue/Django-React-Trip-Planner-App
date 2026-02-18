# Django-React Trip Planner App

## Overview

Django-React Trip Planner App is a full-stack web application designed to help users plan and organize their trips efficiently. The application combines the robust backend capabilities of Django with the interactive user interface of React, providing a seamless experience for trip planning.

## Technology Stack

- **Backend**: Python with Django (50.5%)
- **Frontend**: JavaScript and React (43.5%)
- **Styling**: CSS (4.6%)
- **Other**: Various supporting technologies (1.4%)

## Project Structure

The project is organized into two main directories:

- `trip_app_server/` - Django backend application
- `trip_app_client/` - React frontend application

## Features

- Trip creation and management
- Itinerary planning and organization
- User-friendly interface for travel planning
- RESTful API for data communication between frontend and backend

## Getting Started

### Prerequisites

- Python 3.x
- Node.js and npm
- Django
- React

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/thierno-yehoue/Django-React-Trip-Planner-App.git

   

    Set up the backend (Django):
    bash

    cd trip_app_server
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver

    Set up the frontend (React):
    bash

    cd trip_app_client
    npm install
    npm start

Usage

Once both the backend and frontend servers are running:

    Access the application at http://localhost:3000 (or the configured React port)
    The backend API will be available at http://localhost:8000 (or the configured Django port)


