# Event Scheduling & Resource Allocation System

This is a web application for scheduling events and allocating resources (rooms, equipment, etc.) while preventing conflicts.

## Tech Stack

- **Backend**: Python, Flask, SQLAlchemy, SQLite
- **Frontend**: React, Vite, CSS Modules

## Features

1.  **Resource Management**: Add and view resources (Rooms, Instructors, Equipment).
2.  **Event Management**: Create events with start/end times and descriptions.
3.  **Conflict Detection**: 
    - Prevents allocating a resource that is already booked for an overlapping time window.
    - Accurately handles partial overlaps, nested intervals, and exact matches.
4.  **Resource Allocation**: Assign available resources to events.
5.  **Utilization Report**: View total hours booked and booking counts for resources.

## Setup Instructions

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    python app.py
    ```
    The server will run on `http://127.0.0.1:5000`.

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Usage

1.  **Start both servers**.
2.  Open your browser to `http://localhost:5173`.
3.  Go to **Resources** to add resources (e.g., "Conference Room A", "Projector").
4.  Go to **Events & Allocation** to create events. 
5.  Use the dropdown in the event card to allocate a resource.
    - If there is a conflict, you will see an error message.
6.  Go to **Report** to see utilization metrics.

## Screenshot & Video

*(Please add your screenshots and recording files here as required by the assignment submission guidelines)*

