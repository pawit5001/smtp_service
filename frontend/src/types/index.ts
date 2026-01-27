export interface Email {
    subject: string;
    from: string;
    date: string;
    snippet?: string;
    body_text?: string;
    body_html?: string;
    headers?: Record<string, string>;
    attachments?: Array<{
        filename: string;
        content_type: string;
        size: number;
        content_id?: string;
        content_disposition?: string;
        content?: string;
    }>;
    [key: string]: any;
}
export interface EmailRequest {
    display_name?: string;
    recipient: string;
    subject: string;
    body: string;
}

export interface PredefinedMessage {
    id: number;
    title: string;
    content: string;
}