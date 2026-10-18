import { Injectable, signal, effect } from "@angular/core";
import { Order, Status } from './order.model';

const defaultOrders: Order[] = [];

@Injectable({ providedIn: 'root' }) //marks class as service
export class OrdersService { //makes it importable from other class and creates the class
    private key = 'orders';
    orders = signal<Order[]>(this.load());

    constructor(){
        effect(() => {
            if (typeof localStorage !== 'undefined'){
                localStorage.setItem(this.key, JSON.stringify(this.orders()));
            }
        });
    }

    setStatus(id: number, status: Status){
        this.orders.update(list =>
            list.map(order => (order.id === id ? {...order, status} : order))
        );
    }

    addOrder(newOrder: Omit<Order, 'id'>) {
    this.orders.update(list => {
      const nextId = list.length ? Math.max(...list.map(order => order.id)) + 1 : 1;
      return [...list, { ...newOrder, id: nextId }];
    });
    }

    deleteOrder(id: number) {
        this.orders.update(list => list.filter(order => order.id !== id));
    }

    private load(): Order[] {
        if (typeof localStorage === 'undefined') return defaultOrders;
        const saved = localStorage.getItem(this.key);
        return saved ? JSON.parse(saved) : defaultOrders;
    }
}