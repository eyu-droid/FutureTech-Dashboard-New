export interface Message{
    id:string;
    body:string;
    reciver:string;
    sender:string;
    sentAt: Date;
    sentBy: string;
    status:string;
    title:string;
    attachedTo:number;
}

export type MessageColumn = Pick<Message, 'title' | 'body' | 'sentAt' | 'reciver'| 'status' | 'id'>;


