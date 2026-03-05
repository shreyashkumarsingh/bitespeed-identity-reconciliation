# Bitespeed Identity Reconciliation Backend

A Node.js backend service that identifies and reconciles customer identities across multiple purchases by linking different contact information (email and phone numbers) to the same person.

## Overview

This service implements the Bitespeed identity reconciliation logic. It maintains a database of contacts and links them based on shared email addresses or phone numbers.

## Features

- Identity linking by email or phone number
- Primary/secondary contact model with oldest as primary
- Recursive contact hierarchy support
- RESTful API with /identify endpoint

## Technology Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express.js
- Database: PostgreSQL
- Query: Native pg library

## Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v10 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shreyashkumarsingh/bitespeed-identity-reconciliation.git
cd bitespeed-identity-reconciliation
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```
DATABASE_URL=postgresql://user:password@host:5432/bitespeed
NODE_ENV=development
PORT=3000
```

4. Build and run migrations:
```bash
npm run build
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Documentation

### Endpoint: POST /identify

Request body:
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

Note: At least one of email or phoneNumber must be provided.

Response:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["primary@example.com", "secondary@example.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

Response fields:
- primaryContatctId: ID of the primary contact
- emails: All emails linked to this contact (primary first)
- phoneNumbers: All phone numbers linked to this contact (primary first)
- secondaryContactIds: IDs of all secondary contacts

## Database Schema

Contact table:
```sql
CREATE TABLE "Contact" (
  id SERIAL PRIMARY KEY,
  phoneNumber VARCHAR,
  email VARCHAR,
  linkedId INTEGER,
  linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary', 'secondary')),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_linkedId FOREIGN KEY(linkedId) REFERENCES "Contact"(id)
);
```

## Live Endpoint

Base URL: https://bitespeed-reconcile-2026.onrender.com

Example request:
```bash
POST https://bitespeed-reconcile-2026.onrender.com/identify
Content-Type: application/json

{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

Example response:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

## Repository

GitHub: https://github.com/shreyashkumarsingh/bitespeed-identity-reconciliation
