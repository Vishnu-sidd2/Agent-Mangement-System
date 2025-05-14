# Agent Management System

A comprehensive MERN stack application for admin login, agent management, and CSV/XLSX list distribution.

## Features

- **Admin Authentication**: Secure login with JWT authentication
- **Agent Management**: Create, edit, and manage agents with proper validation
- **CSV/XLSX Upload**: Upload and validate files with records
- **Automatic Distribution**: Distribute records equally among agents
- **Interactive 3D Dashboard**: Beautiful animations using Three.js and GSAP
- **Mobile Responsive**: Works on all device sizes

## Tech Stack

- **Frontend**: React.js with Three.js, GSAP, and React Three Fiber
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Processing**: Papa Parse and xlsx for file parsing
- **Styling**: Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=development
   ```

### Running the Application

1. Start the development server
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

### Default Login Credentials

- **Email**: admin@example.com
- **Password**: admin123

## Usage

1. **Login** using the admin credentials
2. **Add Agents** from the Agents page
3. **Upload CSV/XLSX files** from the Lists page
4. **View Distribution** to see how records are allocated to agents
5. **Download** the full list or agent-specific lists

## File Format Requirements

The CSV/XLSX files should contain the following columns:
- FirstName (text)
- Phone (number)
- Notes (text)

## License

MIT