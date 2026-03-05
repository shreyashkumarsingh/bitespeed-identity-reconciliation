import express, { Request, Response } from 'express';
import { ContactService } from './services/ContactService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const contactService = new ContactService();

app.use(express.json());

app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

interface IdentifyRequest {
  email?: string | null;
  phoneNumber?: string | null;
}

app.post('/identify', async (req: Request<{}, {}, IdentifyRequest>, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate that at least one field is provided
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
    }

    const response = await contactService.identify(email || null, phoneNumber || null);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in /identify endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
