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
export declare class ContactService {
    private schemaEnsured;
    identify(email: string | null, phoneNumber: string | null): Promise<IdentifyResponse>;
    private findPrimaryContact;
    private getAllLinkedContacts;
    private createNewPrimaryContact;
    private createSecondaryContact;
    private buildResponse;
    private ensureSchema;
}
//# sourceMappingURL=ContactService.d.ts.map