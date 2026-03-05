"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const shouldUseSsl = process.env.NODE_ENV === 'production' ||
    process.env.DATABASE_URL?.includes('supabase.co');
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});
exports.default = pool;
//# sourceMappingURL=connection.js.map