export interface WallPost {
    id: number;
    recipient_id: number;
    sender_id: number;
    first: string;
    last: string;
    post: string;
    timestamp: string;
    avatarurl?: string;
    link?: string;
}
