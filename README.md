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
<img width="1919" height="1079" alt="Screenshot 2025-12-18 192122" src="https://github.com/user-attachments/assets/f1ab6737-cbe6-42dd-946a-bca4a3f50e7c" /><br>
<img width="1919" height="1079" alt="Screenshot 2025-12-18 192308" src="https://github.com/user-attachments/assets/7c0c61b6-5282-46b9-aeb8-8fde3b6c42c1" /><br>
<img width="1902" height="1079" alt="Screenshot 2025-12-18 192228" src="https://github.com/user-attachments/assets/8e3f9fd6-a797-480a-9075-b50d2a01cc4d" /><br>
<img width="1909" height="1079" alt="Screenshot 2025-12-18 192243" src="https://github.com/user-attachments/assets/c0bb2237-f0a8-4f14-9000-edff925fe381" /><br>
<img width="1919" height="1079" alt="Screenshot 2025-12-18 192358" src="https://github.com/user-attachments/assets/5d0a0fd2-12e5-436f-8560-4e101993a0a7" /><br>
<img width="1916" height="1079" alt="Screenshot 2025-12-18 192412" src="https://github.com/user-attachments/assets/2ed22c6e-dd8e-4d93-99d0-c3eb7ea00456" /><br>

[![Watch the video](https://drive.google.com/thumbnail?id=1S4qP5f2N-19BNcC_X-hX8xHc8-P9vusO)](https://drive.google.com/file/d/1S4qP5f2N-19BNcC_X-hX8xHc8-P9vusO/view)     







