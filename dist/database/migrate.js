"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("./connection"));
const migrate = async () => {
    const client = await connection_1.default.connect();
    try {
        await client.query(`
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
        console.log('Migration completed successfully');
    }
    catch (err) {
        console.error('Migration error:', err);
    }
    finally {
        client.release();
        await connection_1.default.end();
    }
};
migrate();
//# sourceMappingURL=migrate.js.map