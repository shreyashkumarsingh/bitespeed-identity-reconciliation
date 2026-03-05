# Bitespeed Identity Reconciliation Backend

A Node.js backend service that identifies and reconciles customer identities across multiple purchases by linking different contact information (email and phone numbers) to the same person.

## 🚀 Quick Start

**New to this project?** Start with [QUICKSTART.md](QUICKSTART.md) for setup instructions.

**Ready to deploy?** Follow [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment steps.

## Overview

This service implements the Bitespeed identity reconciliation logic as specified in the task requirements. It maintains a database of contacts and links them based on shared email addresses or phone numbers.

## Features

- **Identity Linking**: Automatically links contacts that share email or phone numbers
- **Primary/Secondary Contacts**: Maintains oldest contact as primary with newer contacts as secondary
- **Contact Hierarchy**: Supports recursive linking of contacts
- **RESTful API**: Simple POST endpoint for identity identification

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM/Query**: Native pg library

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v10 or higher)
- npm or yarn

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
Create a `.env` file in the root directory:
```
DATABASE_URL=postgresql://user:password@localhost:5432/bitespeed
NODE_ENV=development
PORT=3000
```

4. Run database migrations:
```bash
npm run build
npm run migrate
```

5. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Documentation

### Identify Endpoint

**Endpoint**: `POST /identify`

**Request Body**:
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

Note: At least one of `email` or `phoneNumber` must be provided.

**Response**:
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

### Response Fields

- `primaryContatctId`: The ID of the primary contact in the link hierarchy
- `emails`: Array of all emails linked to this contact (primary email first)
- `phoneNumbers`: Array of all phone numbers linked to this contact (primary phone first)
- `secondaryContactIds`: Array of IDs for all secondary contacts

## Database Schema

### Contact Table

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

## Logic Details

### How Identification Works

1. **New Request**: When a request comes with email/phoneNumber combination:
   - Search for existing contacts with matching email or phoneNumber

2. **No Match**: If no matching contacts exist:
   - Create a new contact with `linkPrecedence = 'primary'`
   - Return the new contact

3. **Match Found**: If matching contact(s) found:
   - Identify the oldest (primary) contact
   - If new info is provided, create secondary contact linked to primary
   - Return consolidated contact information

4. **Primary Conversion**: When a newer primary contacts shares info with an older one:
   - The newer primary becomes secondary
   - The older contact remains primary

## Building for Production

```bash
npm run build
npm start
```

## Live Endpoint

**Base URL**: https://bitespeed-reconcile-2026.onrender.com

**Example Request:**
```bash
POST https://bitespeed-reconcile-2026.onrender.com/identify
Content-Type: application/json

{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

**Example Response:**
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

## Git Commits

The repository uses small, insightful commits for each feature and fix.

View commit history:
```bash
git log --oneline
```

## Deployment

This application is ready to deploy on platforms like:
- Render.com
- Railway
- Heroku
- AWS

[Deployment URL will be added here after deployment]

## Author

Created as part of the Bitespeed Backend Task.
