"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const connection_1 = __importDefault(require("../database/connection"));
class ContactService {
    async identify(email, phoneNumber) {
        // Find all contacts matching email or phoneNumber
        const query = `
      SELECT * FROM "Contact" 
      WHERE "deletedAt" IS NULL AND (
        ($1::VARCHAR IS NOT NULL AND email = $1) OR
        ($2::VARCHAR IS NOT NULL AND "phoneNumber" = $2)
      )
      ORDER BY "createdAt" ASC
    `;
        const result = await connection_1.default.query(query, [email, phoneNumber]);
        const matchingContacts = result.rows;
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
    async findPrimaryContact(contactId) {
        const client = await connection_1.default.connect();
        try {
            const visited = new Set();
            let current = contactId;
            while (current && !visited.has(current)) {
                visited.add(current);
                const result = await client.query('SELECT * FROM "Contact" WHERE id = $1 AND "deletedAt" IS NULL', [current]);
                if (result.rows.length === 0) {
                    throw new Error(`Contact ${current} not found`);
                }
                const contact = result.rows[0];
                if (contact.linkPrecedence === 'primary') {
                    return contact;
                }
                current = contact.linkedId;
            }
            throw new Error(`No primary contact found for contact ${contactId}`);
        }
        finally {
            client.release();
        }
    }
    async getAllLinkedContacts(primaryId) {
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
        const result = await connection_1.default.query(query, [primaryId]);
        return result.rows;
    }
    async createNewPrimaryContact(email, phoneNumber) {
        const insertQuery = `
      INSERT INTO "Contact" (email, "phoneNumber", "linkPrecedence", "createdAt", "updatedAt")
      VALUES ($1, $2, 'primary', NOW(), NOW())
      RETURNING *
    `;
        const result = await connection_1.default.query(insertQuery, [email, phoneNumber]);
        const contact = result.rows[0];
        return {
            contact: {
                primaryContatctId: contact.id,
                emails: email ? [email] : [],
                phoneNumbers: phoneNumber ? [phoneNumber] : [],
                secondaryContactIds: [],
            },
        };
    }
    async createSecondaryContact(email, phoneNumber, linkedId) {
        const insertQuery = `
      INSERT INTO "Contact" (email, "phoneNumber", "linkedId", "linkPrecedence", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'secondary', NOW(), NOW())
      RETURNING *
    `;
        const result = await connection_1.default.query(insertQuery, [email, phoneNumber, linkedId]);
        return result.rows[0];
    }
    buildResponse(primaryContact, allContacts) {
        const emails = [];
        const phoneNumbers = [];
        const secondaryContactIds = [];
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
}
exports.ContactService = ContactService;
//# sourceMappingURL=ContactService.js.map