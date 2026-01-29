# API Documentation

**Base URL:** `http://localhost:3000/api`

**Server Port:** 3000

---

## Table of Contents

1. [Firm APIs](#1-firm-apis)
2. [Vehicle APIs](#2-vehicle-apis)
3. [Pricing APIs](#3-pricing-apis)
4. [Transaction APIs](#4-transaction-apis)
5. [Data Models](#5-data-models)
6. [Error Handling](#6-error-handling)
7. [Example Requests](#7-example-requests)

---

## 1. Firm APIs

**Base Path:** `/api/firm`

### 1.1 Get All Firms

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/firm` |
| **Description** | Retrieve all firms from the database |
| **Auth Required** | No |

**Response:**
```json
[
  {
    "FirmID": 1,
    "FirmName": "ABC Transport",
    "ContactPerson": "John Doe",
    "Address": "123 Main Street",
    "City": "Ahmedabad",
    "PhoneNumber": "9876543210",
    "Email": "abc@example.com"
  }
]
```

---

### 1.2 Get Firm by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/firm/:id` |
| **Description** | Retrieve a specific firm by its ID |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Firm ID |

**Response:**
```json
{
  "FirmID": 1,
  "FirmName": "ABC Transport",
  "ContactPerson": "John Doe",
  "Address": "123 Main Street",
  "City": "Ahmedabad",
  "PhoneNumber": "9876543210",
  "Email": "abc@example.com"
}
```

---

### 1.3 Create Firm

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/firm` |
| **Description** | Create a new firm |
| **Auth Required** | No |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `FirmName` | String | Yes | Name of the firm |
| `ContactPerson` | String | No | Contact person name |
| `Address` | String | No | Firm address |
| `City` | String | No | City name |
| `PhoneNumber` | String(10) | Yes | 10-digit phone number |
| `Email` | String | No | Valid email address |

**Request Example:**
```json
{
  "FirmName": "ABC Transport",
  "ContactPerson": "John Doe",
  "Address": "123 Main Street",
  "City": "Ahmedabad",
  "PhoneNumber": "9876543210",
  "Email": "abc@example.com"
}
```

**Response:** `201 Created`
```json
{
  "FirmID": 1,
  "FirmName": "ABC Transport",
  "ContactPerson": "John Doe",
  "Address": "123 Main Street",
  "City": "Ahmedabad",
  "PhoneNumber": "9876543210",
  "Email": "abc@example.com"
}
```

---

### 1.4 Update Firm

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/firm/:id` |
| **Description** | Update an existing firm |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Firm ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `FirmName` | String | No | Name of the firm |
| `ContactPerson` | String | No | Contact person name |
| `Address` | String | No | Firm address |
| `City` | String | No | City name |
| `PhoneNumber` | String(10) | No | 10-digit phone number |
| `Email` | String | No | Valid email address |

**Response:** `200 OK`
```json
{
  "message": "Firm updated successfully"
}
```

---

### 1.5 Delete Firm

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/firm/:id` |
| **Description** | Delete a firm |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Firm ID |

**Response:** `200 OK`
```json
{
  "message": "Firm deleted successfully"
}
```

---

### 1.6 Get Total Firms Count

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/firm/count/total` |
| **Description** | Get the total count of all firms |
| **Auth Required** | No |

**Response:**
```json
{
  "totalFirms": 15
}
```

---

## 2. Vehicle APIs

**Base Path:** `/api/vehicle`

### 2.1 Get All Vehicles

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/vehicle` |
| **Description** | Retrieve all vehicles with firm details |
| **Auth Required** | No |

**Response:**
```json
[
  {
    "VehicleID": 1,
    "VehicleNo": "GJ01AB1234",
    "DriverNumber": "9876543210",
    "OwnerName": "Ram Patel",
    "FirmID": 1,
    "Firm": {
      "FirmID": 1,
      "FirmName": "ABC Transport"
    }
  }
]
```

---

### 2.2 Get Vehicles by Firm

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/vehicle/byFirm/:firmId` |
| **Description** | Retrieve all vehicles belonging to a specific firm |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firmId` | Integer | Yes | Firm ID |

**Response:**
```json
[
  {
    "VehicleID": 1,
    "VehicleNo": "GJ01AB1234",
    "DriverNumber": "9876543210",
    "OwnerName": "Ram Patel",
    "FirmID": 1
  }
]
```

---

### 2.3 Get Total Vehicles Count

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/vehicle/count/total` |
| **Description** | Get the total count of all vehicles |
| **Auth Required** | No |

**Response:**
```json
{
  "totalVehicles": 50
}
```

---

### 2.4 Get Vehicles Count by Firm

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/vehicle/count/firm/:firmId` |
| **Description** | Get vehicles count for a specific firm |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firmId` | Integer | Yes | Firm ID |

**Response:**
```json
{
  "firmName": "ABC Transport",
  "totalVehicles": 10
}
```

---

### 2.5 Create Vehicle

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/vehicle` |
| **Description** | Create a new vehicle |
| **Auth Required** | No |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `FirmId` | Integer | Yes | ID of the firm |
| `VehicleNo` | String(50) | Yes | Vehicle registration number |
| `DriverNumber` | String(50) | Yes | Driver's phone number |
| `OwnerName` | String(100) | Yes | Vehicle owner's name |

**Request Example:**
```json
{
  "FirmId": 1,
  "VehicleNo": "GJ01AB1234",
  "DriverNumber": "9876543210",
  "OwnerName": "Ram Patel"
}
```

**Response:** `201 Created`
```json
{
  "VehicleID": 1,
  "VehicleNo": "GJ01AB1234",
  "DriverNumber": "9876543210",
  "OwnerName": "Ram Patel",
  "FirmID": 1
}
```

---

### 2.6 Update Vehicle

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/vehicle/:id` |
| **Description** | Update an existing vehicle |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Vehicle ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `FirmId` | Integer | No | ID of the firm |
| `VehicleNo` | String(50) | No | Vehicle registration number |
| `DriverNumber` | String(50) | No | Driver's phone number |
| `OwnerName` | String(100) | No | Vehicle owner's name |

**Response:** `204 No Content`

---

### 2.7 Delete Vehicle

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/vehicle/:id` |
| **Description** | Delete a vehicle |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Vehicle ID |

**Response:** `200 OK`
```json
{
  "message": "Vehicle deleted successfully"
}
```

---

## 3. Pricing APIs

**Base Path:** `/api/pricing`

### 3.1 Get All Pricing

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/pricing` |
| **Description** | Retrieve all pricing entries with firm details |
| **Auth Required** | No |

**Response:**
```json
[
  {
    "PricingID": 1,
    "FirmID": 1,
    "RoTonPrice": 150.00,
    "OpenTonPrice": 180.00,
    "EffectiveDate": "2025-01-25T00:00:00.000Z",
    "Firm": {
      "FirmID": 1,
      "FirmName": "ABC Transport"
    }
  }
]
```

---

### 3.2 Get Pricing by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/pricing/:id` |
| **Description** | Retrieve pricing by pricing ID |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Pricing ID |

**Response:**
```json
{
  "PricingID": 1,
  "FirmID": 1,
  "RoTonPrice": 150.00,
  "OpenTonPrice": 180.00,
  "EffectiveDate": "2025-01-25T00:00:00.000Z",
  "Firm": {
    "FirmID": 1,
    "FirmName": "ABC Transport"
  }
}
```

---

### 3.3 Create Pricing

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/pricing/:firmId` |
| **Description** | Create pricing for a firm (one pricing per firm) |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firmId` | Integer | Yes | Firm ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `RoTonPrice` | Decimal | Yes | Price per RO ton |
| `OpenTonPrice` | Decimal | Yes | Price per Open ton |

**Request Example:**
```json
{
  "RoTonPrice": 150.00,
  "OpenTonPrice": 180.00
}
```

**Response:** `201 Created`
```json
{
  "PricingID": 1,
  "FirmID": 1,
  "RoTonPrice": 150.00,
  "OpenTonPrice": 180.00,
  "EffectiveDate": "2025-01-25T00:00:00.000Z"
}
```

---

### 3.4 Update Pricing

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/pricing/:firmId` |
| **Description** | Update pricing for a firm |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firmId` | Integer | Yes | Firm ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `RoTonPrice` | Decimal | Yes | Price per RO ton |
| `OpenTonPrice` | Decimal | Yes | Price per Open ton |

**Response:** `200 OK`
```json
{
  "message": "Pricing updated successfully."
}
```

---

### 3.5 Delete Pricing

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/pricing/:id` |
| **Description** | Delete a pricing entry |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Pricing ID |

**Response:** `204 No Content`

---

## 4. Transaction APIs

**Base Path:** `/api/transaction`

### 4.1 Create Transaction

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/transaction` |
| **Description** | Create a new transaction (prices auto-calculated) |
| **Auth Required** | No |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `FirmID` | Integer | Yes | Firm ID |
| `VehicleID` | Integer | Yes | Vehicle ID (must belong to firm) |
| `RoNumber` | String | Yes | RO Number |
| `TotalTon` | Decimal | Yes | Total tonnage |
| `RoTon` | Decimal | Yes | RO tonnage (must be ≤ TotalTon) |
| `TransactionDate` | Date | No | Transaction date (defaults to today) |

**Request Example:**
```json
{
  "FirmID": 1,
  "VehicleID": 5,
  "RoNumber": "RO-12345",
  "TotalTon": 25.50,
  "RoTon": 20.00,
  "TransactionDate": "2025-01-25"
}
```

**Auto-Calculated Fields:**
- `OpenTon` = TotalTon - RoTon
- `RoPrice` = RoTon × RoTonPrice (from firm's pricing)
- `OpenPrice` = OpenTon × OpenTonPrice (from firm's pricing)
- `TotalPrice` = RoPrice + OpenPrice

**Response:** `201 Created`
```json
{
  "TransactionID": 1,
  "FirmID": 1,
  "VehicleID": 5,
  "RoNumber": "RO-12345",
  "TotalTon": 25.50,
  "RoTon": 20.00,
  "OpenTon": 5.50,
  "RoPrice": 3000.00,
  "OpenPrice": 990.00,
  "TotalPrice": 3990.00,
  "TransactionDate": "2025-01-25T00:00:00.000Z"
}
```

---

### 4.2 Get Transaction by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/:id` |
| **Description** | Retrieve a transaction with firm and vehicle details |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Transaction ID |

**Response:**
```json
{
  "TransactionID": 1,
  "FirmID": 1,
  "VehicleID": 5,
  "RoNumber": "RO-12345",
  "TotalTon": 25.50,
  "RoTon": 20.00,
  "OpenTon": 5.50,
  "RoPrice": 3000.00,
  "OpenPrice": 990.00,
  "TotalPrice": 3990.00,
  "TransactionDate": "2025-01-25T00:00:00.000Z",
  "Firm": {
    "FirmID": 1,
    "FirmName": "ABC Transport"
  },
  "Vehicle": {
    "VehicleID": 5,
    "VehicleNo": "GJ01AB1234"
  }
}
```

---

### 4.3 Get All Transactions

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/all` |
| **Description** | Retrieve all transactions (sorted by date DESC) |
| **Auth Required** | No |

**Response:**
```json
[
  {
    "TransactionID": 1,
    "FirmID": 1,
    "VehicleID": 5,
    "RoNumber": "RO-12345",
    "TotalTon": 25.50,
    "RoTon": 20.00,
    "OpenTon": 5.50,
    "RoPrice": 3000.00,
    "OpenPrice": 990.00,
    "TotalPrice": 3990.00,
    "TransactionDate": "2025-01-25T00:00:00.000Z",
    "Firm": { "FirmID": 1, "FirmName": "ABC Transport" },
    "Vehicle": { "VehicleID": 5, "VehicleNo": "GJ01AB1234" }
  }
]
```

---

### 4.4 Get Transactions by Firm

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/by-firm/:firmId` |
| **Description** | Retrieve all transactions for a specific firm |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firmId` | Integer | Yes | Firm ID |

**Response:** Array of transactions (same format as Get All)

---

### 4.5 Update Transaction

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/transaction/:id` |
| **Description** | Update an existing transaction (prices recalculated) |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Transaction ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `FirmID` | Integer | Yes | Firm ID |
| `VehicleID` | Integer | Yes | Vehicle ID |
| `RoNumber` | String | Yes | RO Number |
| `TotalTon` | Decimal | Yes | Total tonnage |
| `RoTon` | Decimal | Yes | RO tonnage |
| `TransactionDate` | Date | No | Transaction date |

**Response:** Updated transaction object with associations

---

### 4.6 Delete Transaction

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/transaction/:id` |
| **Description** | Delete a transaction |
| **Auth Required** | No |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Integer | Yes | Transaction ID |

**Response:** `200 OK`
```json
{
  "message": "Transaction deleted successfully."
}
```

---

### 4.7 Get Today's Total Ton

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/total-ton/today` |
| **Description** | Get today's total tonnage statistics |
| **Auth Required** | No |

**Response:**
```json
{
  "totalTon": "150.50",
  "roTon": "120.00",
  "openTon": "30.50"
}
```

---

### 4.8 Get Daily Total Ton

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/total-ton/daily` |
| **Description** | Get daily total tonnage |
| **Auth Required** | No |

**Response:**
```json
{
  "totalTon": "150.50"
}
```

---

### 4.9 Get Weekly Total Ton

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/total-ton/weekly` |
| **Description** | Get last 7 days tonnage statistics |
| **Auth Required** | No |

**Response:**
```json
{
  "totalTon": "1050.75",
  "roTon": "850.00",
  "openTon": "200.75",
  "transactionCount": 45
}
```

---

### 4.10 Get Today's Total Amount

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/today/total` |
| **Description** | Get today's total amount statistics |
| **Auth Required** | No |

**Response:**
```json
{
  "totalAmount": "25000.00",
  "roAmount": "18000.00",
  "openAmount": "7000.00",
  "transactionCount": 15
}
```

---

### 4.11 Get Weekly Truck Load Count

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/truck-load/weekly` |
| **Description** | Get truck load count for last 7 days |
| **Auth Required** | No |

**Response:**
```json
{
  "count": 45
}
```

---

### 4.12 Download PDF Report

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/report/pdf` |
| **Description** | Download transactions as PDF report |
| **Auth Required** | No |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | Date | Yes | Report start date (YYYY-MM-DD) |
| `endDate` | Date | Yes | Report end date (YYYY-MM-DD) |
| `firmId` | Integer | No | Filter by firm ID |
| `roTonPrice` | Decimal | No | Custom RO ton price for recalculation |
| `openTonPrice` | Decimal | No | Custom Open ton price for recalculation |

**Example:**
```
GET /api/transaction/report/pdf?startDate=2025-01-01&endDate=2025-01-31&firmId=1
```

**Response:** PDF file download

---

### 4.13 Download Excel Report

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/transaction/report/excel` |
| **Description** | Download transactions as Excel report |
| **Auth Required** | No |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | Date | Yes | Report start date (YYYY-MM-DD) |
| `endDate` | Date | Yes | Report end date (YYYY-MM-DD) |
| `firmId` | Integer | No | Filter by firm ID |

**Example:**
```
GET /api/transaction/report/excel?startDate=2025-01-01&endDate=2025-01-31
```

**Response:** Excel file download (.xlsx)

---

## 5. Data Models

### 5.1 Firm Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `FirmID` | Integer | Auto | Primary key, auto-increment |
| `FirmName` | String | Yes | Name of the firm |
| `ContactPerson` | String | No | Contact person name |
| `Address` | String | No | Firm address |
| `City` | String | No | City name |
| `PhoneNumber` | String(10) | Yes | 10-digit phone number |
| `Email` | String | No | Valid email address |

---

### 5.2 Vehicle Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `VehicleID` | Integer | Auto | Primary key, auto-increment |
| `VehicleNo` | String(50) | Yes | Vehicle registration number |
| `DriverNumber` | String(50) | Yes | Driver's phone number |
| `OwnerName` | String(100) | Yes | Vehicle owner's name |
| `FirmID` | Integer | Yes | Foreign key to Firms table |

---

### 5.3 Pricing Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `PricingID` | Integer | Auto | Primary key, auto-increment |
| `FirmID` | Integer | Yes | Foreign key to Firms table |
| `RoTonPrice` | Decimal(18,2) | Yes | Price per RO ton |
| `OpenTonPrice` | Decimal(18,2) | Yes | Price per Open ton |
| `EffectiveDate` | Date | Auto | Date when pricing was set |

---

### 5.4 Transaction Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `TransactionID` | Integer | Auto | Primary key, auto-increment |
| `FirmID` | Integer | Yes | Foreign key to Firms table |
| `VehicleID` | Integer | Yes | Foreign key to Vehicles table |
| `RoNumber` | String | Yes | RO Number reference |
| `TotalTon` | Decimal(18,2) | Yes | Total tonnage |
| `RoTon` | Decimal(10,2) | Yes | RO tonnage |
| `OpenTon` | Decimal(10,2) | Calc | Open tonnage (TotalTon - RoTon) |
| `RoPrice` | Decimal(10,2) | Calc | RO price (RoTon × RoTonPrice) |
| `OpenPrice` | Decimal(10,2) | Calc | Open price (OpenTon × OpenTonPrice) |
| `TotalPrice` | Decimal(10,2) | Calc | Total price (RoPrice + OpenPrice) |
| `TransactionDate` | Date | No | Transaction date (defaults to now) |

---

## 6. Error Handling

### Standard Error Response Format

```json
{
  "message": "Error description here"
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `204` | No Content - Request successful, no content returned |
| `400` | Bad Request - Invalid request data |
| `404` | Not Found - Resource not found |
| `500` | Internal Server Error - Server error |

### Common Error Messages

| Error | Description |
|-------|-------------|
| `"Firm not found"` | Firm ID does not exist |
| `"Vehicle not found"` | Vehicle ID does not exist |
| `"Pricing not found"` | Pricing record not found |
| `"Transaction not found"` | Transaction ID does not exist |
| `"Vehicle does not belong to the selected firm"` | Vehicle-Firm mismatch |
| `"Total Ton cannot be less than RO Ton"` | Validation error |
| `"This vehicle number is already registered with this firm"` | Duplicate vehicle |
| `"Pricing already exists for this firm"` | Duplicate pricing |

---

## 7. Example Requests

### 7.1 Create a Complete Workflow

**Step 1: Create Firm**
```http
POST /api/firm
Content-Type: application/json

{
  "FirmName": "XYZ Logistics",
  "ContactPerson": "Ramesh Shah",
  "Address": "Industrial Area",
  "City": "Rajkot",
  "PhoneNumber": "9898989898",
  "Email": "xyz@logistics.com"
}
```

**Step 2: Create Vehicle for Firm**
```http
POST /api/vehicle
Content-Type: application/json

{
  "FirmId": 1,
  "VehicleNo": "GJ03XY5678",
  "DriverNumber": "9876543210",
  "OwnerName": "Suresh Patel"
}
```

**Step 3: Set Pricing for Firm**
```http
POST /api/pricing/1
Content-Type: application/json

{
  "RoTonPrice": 150.00,
  "OpenTonPrice": 180.00
}
```

**Step 4: Create Transaction**
```http
POST /api/transaction
Content-Type: application/json

{
  "FirmID": 1,
  "VehicleID": 1,
  "RoNumber": "RO-2025-001",
  "TotalTon": 30.00,
  "RoTon": 25.00,
  "TransactionDate": "2025-01-25"
}
```

---

### 7.2 Generate Reports

**PDF Report for Specific Firm:**
```http
GET /api/transaction/report/pdf?startDate=2025-01-01&endDate=2025-01-31&firmId=1
```

**Excel Report for All Firms:**
```http
GET /api/transaction/report/excel?startDate=2025-01-01&endDate=2025-01-31
```

**PDF Report with Custom Pricing:**
```http
GET /api/transaction/report/pdf?startDate=2025-01-01&endDate=2025-01-31&firmId=1&roTonPrice=160&openTonPrice=190
```

---

### 7.3 Dashboard Statistics

**Get Today's Summary:**
```http
GET /api/transaction/today/total
GET /api/transaction/total-ton/today
```

**Get Weekly Summary:**
```http
GET /api/transaction/total-ton/weekly
GET /api/transaction/truck-load/weekly
```

**Get Counts:**
```http
GET /api/firm/count/total
GET /api/vehicle/count/total
```

---

## Quick Reference - All Endpoints

### Firm Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/firm` | Get all firms |
| GET | `/api/firm/:id` | Get firm by ID |
| POST | `/api/firm` | Create firm |
| PUT | `/api/firm/:id` | Update firm |
| DELETE | `/api/firm/:id` | Delete firm |
| GET | `/api/firm/count/total` | Get firms count |

### Vehicle Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicle` | Get all vehicles |
| GET | `/api/vehicle/byFirm/:firmId` | Get vehicles by firm |
| GET | `/api/vehicle/count/total` | Get vehicles count |
| GET | `/api/vehicle/count/firm/:firmId` | Get vehicles count by firm |
| POST | `/api/vehicle` | Create vehicle |
| PUT | `/api/vehicle/:id` | Update vehicle |
| DELETE | `/api/vehicle/:id` | Delete vehicle |

### Pricing Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pricing` | Get all pricing |
| GET | `/api/pricing/:id` | Get pricing by ID |
| POST | `/api/pricing/:firmId` | Create pricing |
| PUT | `/api/pricing/:firmId` | Update pricing |
| DELETE | `/api/pricing/:id` | Delete pricing |

### Transaction Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transaction` | Create transaction |
| GET | `/api/transaction/:id` | Get transaction by ID |
| GET | `/api/transaction/all` | Get all transactions |
| GET | `/api/transaction/by-firm/:firmId` | Get transactions by firm |
| PUT | `/api/transaction/:id` | Update transaction |
| DELETE | `/api/transaction/:id` | Delete transaction |
| GET | `/api/transaction/total-ton/today` | Today's tonnage |
| GET | `/api/transaction/total-ton/daily` | Daily tonnage |
| GET | `/api/transaction/total-ton/weekly` | Weekly tonnage |
| GET | `/api/transaction/today/total` | Today's amount |
| GET | `/api/transaction/truck-load/weekly` | Weekly truck count |
| GET | `/api/transaction/report/pdf` | Download PDF |
| GET | `/api/transaction/report/excel` | Download Excel |

---

**Document Version:** 1.0  
**Last Updated:** January 25, 2025  
**Server:** Node.js + Express  
**Database:** MySQL (Sequelize ORM)
