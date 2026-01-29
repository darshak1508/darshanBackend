# Darshan Transaction API

A Node.js/Express API for managing transactions, vehicles, firms, and pricing.

## Features

- Transaction management
- Vehicle tracking
- Firm management
- Pricing control
- PDF generation
- Excel export functionality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **PDF Generation**: PDFKit
- **Excel**: XLSX

## Installation

1. Clone the repository:
```bash
git clone https://github.com/darshak1508/darshanBackend.git
cd darshanBackend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env`

```bash
cp .env.example .env
```

4. Start the server:

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
DB_HOST=127.0.0.1
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=your_database_name
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoints and usage.

## Project Structure

```
src/
├── controllers/     # Request handlers
├── models/         # Database models
├── routes/         # API routes
└── index.js        # Application entry point
```

## License

ISC
