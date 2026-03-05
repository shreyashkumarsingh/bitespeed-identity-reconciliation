import pool from '../database/connection';

export interface ContactRow {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: 'primary' | 'secondary';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IdentifyResponse {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export class ContactService {
  private schemaEnsured = false;

  async identify(email: string | null, phoneNumber: string | null): Promise<IdentifyResponse> {
    await this.ensureSchema();

    // Find all contacts matching email or phoneNumber
    const query = `
      SELECT * FROM "Contact" 
      WHERE "deletedAt" IS NULL AND (
        ($1::VARCHAR IS NOT NULL AND email = $1) OR
        ($2::VARCHAR IS NOT NULL AND "phoneNumber" = $2)
      )
      ORDER BY "createdAt" ASC
    `;

    const result = await pool.query(query, [email, phoneNumber]);
    const matchingContacts: ContactRow[] = result.rows;

    // If no matching contacts, create a new primary contact
    if (matchingContacts.length === 0) {
      return this.createNewPrimaryContact(email, phoneNumber);
    }

    // Get all linked contacts (traverse the link chain)
    const primaryContact = await this.findPrimaryContact(matchingContacts[0].id);
    const allLinkedContacts = await this.getAllLinkedContacts(primaryContact.id);

    // Check if new information needs to be added
    const hasNewEmail = email && !allLinkedContacts.some(c => c.email === email);
    const hasNewPhone = phoneNumber && !allLinkedContacts.some(c => c.phoneNumber === phoneNumber);

    if (hasNewEmail || hasNewPhone) {
      // Create secondary contact with new information
      await this.createSecondaryContact(email, phoneNumber, primaryContact.id);
      // Refresh the linked contacts
      return this.buildResponse(primaryContact, await this.getAllLinkedContacts(primaryContact.id));
    }

    return this.buildResponse(primaryContact, allLinkedContacts);
  }

  private async findPrimaryContact(contactId: number): Promise<ContactRow> {
    const client = await pool.connect();
    try {
      const visited = new Set<number>();
      let current: number | null = contactId;

      while (current && !visited.has(current)) {
        visited.add(current);
        const result = await client.query(
          'SELECT * FROM "Contact" WHERE id = $1 AND "deletedAt" IS NULL',
          [current]
        );

        if (result.rows.length === 0) {
          throw new Error(`Contact ${current} not found`);
        }

        const contact: ContactRow = result.rows[0];
        if (contact.linkPrecedence === 'primary') {
          return contact;
        }

        current = contact.linkedId;
      }

      throw new Error(`No primary contact found for contact ${contactId}`);
    } finally {
      client.release();
    }
  }

  private async getAllLinkedContacts(primaryId: number): Promise<ContactRow[]> {
    const query = `
      WITH RECURSIVE linked_contacts AS (
        SELECT * FROM "Contact" WHERE id = $1 AND "deletedAt" IS NULL
        UNION ALL
        SELECT c.* FROM "Contact" c
        INNER JOIN linked_contacts lc ON c."linkedId" = lc.id
        WHERE c."deletedAt" IS NULL
      )
      SELECT * FROM linked_contacts ORDER BY "createdAt" ASC
    `;

    const result = await pool.query(query, [primaryId]);
    return result.rows;
  }

  private async createNewPrimaryContact(email: string | null, phoneNumber: string | null): Promise<IdentifyResponse> {
    const insertQuery = `
      INSERT INTO "Contact" (email, "phoneNumber", "linkPrecedence", "createdAt", "updatedAt")
      VALUES ($1, $2, 'primary', NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [email, phoneNumber]);
    const contact: ContactRow = result.rows[0];

    return {
      contact: {
        primaryContatctId: contact.id,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: [],
      },
    };
  }

  private async createSecondaryContact(
    email: string | null,
    phoneNumber: string | null,
    linkedId: number
  ): Promise<ContactRow> {
    const insertQuery = `
      INSERT INTO "Contact" (email, "phoneNumber", "linkedId", "linkPrecedence", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'secondary', NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [email, phoneNumber, linkedId]);
    return result.rows[0];
  }

  private buildResponse(primaryContact: ContactRow, allContacts: ContactRow[]): IdentifyResponse {
    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const secondaryContactIds: number[] = [];

    // Add primary contact info first
    if (primaryContact.email) {
      emails.push(primaryContact.email);
    }
    if (primaryContact.phoneNumber) {
      phoneNumbers.push(primaryContact.phoneNumber);
    }

    // Add secondary contact info
    for (const contact of allContacts) {
      if (contact.id !== primaryContact.id) {
        if (contact.email && !emails.includes(contact.email)) {
          emails.push(contact.email);
        }
        if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
          phoneNumbers.push(contact.phoneNumber);
        }
        secondaryContactIds.push(contact.id);
      }
    }

    return {
      contact: {
        primaryContatctId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }

  private async ensureSchema(): Promise<void> {
    if (this.schemaEnsured) {
      return;
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Contact" (
        id SERIAL PRIMARY KEY,
        "phoneNumber" VARCHAR,
        email VARCHAR,
        "linkedId" INTEGER,
        "linkPrecedence" VARCHAR(10) NOT NULL CHECK ("linkPrecedence" IN ('primary', 'secondary')),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT fk_linkedId FOREIGN KEY("linkedId") REFERENCES "Contact"(id)
      );
    `);

    this.schemaEnsured = true;
  }
}
