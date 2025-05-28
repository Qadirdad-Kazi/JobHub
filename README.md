# JobHub - Modern Job Board Platform

JobHub is a comprehensive job board platform built with React, TypeScript, and modern web technologies. It connects job seekers with employers through an intuitive and feature-rich interface.

## Features

### For Job Seekers
- User-friendly job search and filtering
- Resume builder tool
- Job application tracking
- Personalized job recommendations
- Profile management

### For Employers
- Easy job posting interface
- Applicant tracking system
- Company profile management
- Job listing analytics
- Candidate management

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn UI components
- React Hook Form for form management
- Zod for validation
- Wouter for routing
- Tanstack Query for data fetching

### Backend
- MongoDB for database
- Express.js API
- JWT authentication
- RESTful architecture

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/Qadirdad-Kazi/JobHub.git
cd JobHub
```

2. Install dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables
```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and set the following variables:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/jobhub

# Authentication
# Replace with a strong, unique secret key
JWT_SECRET=your-secret-key-here
BCRYPT_SALT_ROUNDS=10

# Client URL
CLIENT_URL=http://localhost:5173
```

**Important Security Notes:**
- Never commit your `.env` file to version control
- Use strong, unique values for sensitive variables like `JWT_SECRET`
- In production, use more complex passwords and connection strings

4. Start the development servers
```bash
# Start client (in client directory)
npm run dev

# Start server (in server directory)
npm run dev
```

## Project Structure

```
JobHub/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities and helpers
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
└── server/               # Backend Express application
    ├── src/
    │   ├── controllers/  # Route controllers
    │   ├── models/       # Database models
    │   ├── routes/       # API routes
    │   └── middleware/   # Custom middleware
    └── config/          # Configuration files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Qadirdad Kazi - [@QadirdadKazi](https://github.com/Qadirdad-Kazi)

Project Link: [https://github.com/Qadirdad-Kazi/JobHub](https://github.com/Qadirdad-Kazi/JobHub)