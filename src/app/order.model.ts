export type Status = 'New' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
    id: number;
    customer: string;
    product: string;
    quantity: number;
    price: number;
    date: string;
    status: Status;
}