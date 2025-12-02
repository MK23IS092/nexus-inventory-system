# Nexus Inventory Management System

A futuristic inventory management system with a React frontend and Python Flask backend, using MongoDB for data storage.

## Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (Local installation or `mongod.exe`)

## Project Structure

- `frontend-react/`: React Frontend application
- `Backend/`: Flask Backend API
- `data/`: Local MongoDB data directory (created automatically if using local mongod)

## Setup Instructions

### 1. Database Setup (MongoDB)

If you do not have the MongoDB service running as a Windows Service, you can run a local instance using the `mongod` executable found in your MongoDB installation.

1.  Open a terminal in the project root.
2.  Create a data directory if it doesn't exist:
    ```powershell
    mkdir data
    ```
3.  Start the MongoDB server:
    ```powershell
    & "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath ".\data" --port 27017 --bind_ip 127.0.0.1
    ```
    *(Note: Adjust the path to `mongod.exe` if your installation is different)*

### 2. Backend Setup

1.  Open a new terminal and navigate to the `Backend` directory:
    ```powershell
    cd Backend
    ```
2.  Install Python dependencies:
    ```powershell
    pip install -r requirements.txt
    ```
3.  **Seed the Database** (Optional, for first-time setup):
    ```powershell
    python seed_db.py
    ```
4.  Start the Flask Server:
    ```powershell
    python app.py
    ```
    The backend will run on `http://127.0.0.1:5000`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the `frontend-react` directory:
    ```powershell
    cd frontend-react
    ```
2.  Install Node.js dependencies:
    ```powershell
    npm install
    ```
3.  Start the React Application:
    ```powershell
    npm start
    ```
    The frontend will open automatically at `http://localhost:3000`.

## Usage

- **View Data:** Select a table from the "DATA MATRIX" dropdown to view records.
- **Add Item:** Click "ADD ITEM" to insert new records into a selected table.
- **Modify Item:** Click "MODIFY ITEM" to update existing records by ID.
- **Remove Item:** Click "REMOVE ITEM" to delete records by ID.

## Troubleshooting

- **MongoDB Connection Error:** Ensure `mongod` is running and listening on port `27017`. Check `Backend/.env` to ensure `MONGO_URI=mongodb://127.0.0.1:27017/`.
- **Frontend API Errors:** Ensure the backend is running on port `5000`.
