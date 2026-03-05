"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ContactService_1 = require("./services/ContactService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const contactService = new ContactService_1.ContactService();
app.use(express_1.default.json());
app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.post('/identify', async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        // Validate that at least one field is provided
        if (!email && !phoneNumber) {
            return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
        }
        const response = await contactService.identify(email || null, phoneNumber || null);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error in /identify endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map