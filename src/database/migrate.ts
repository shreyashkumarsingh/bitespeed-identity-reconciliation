import pool from './connection';

const migrate = async () => {
  const client = await pool.connect();
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
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
