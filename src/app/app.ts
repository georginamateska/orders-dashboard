import { Component, computed, inject, signal } from '@angular/core';
import { OrdersService } from './orders.service';
import { Status } from './order.model';

type Page = 'dashboard' | 'orders';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  private ordersService = inject(OrdersService);
  orders = this.ordersService.orders;

  statuses: Status[] = ['New', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  search = signal(''); //text typed in the search box
  statusFilter = signal('All');

  page = signal<Page>('dashboard');//box holding the name of the open view

  showPage(newPage: Page) { //showPage is a method the buttons will call
    this.page.set(newPage);
  }

  filteredOrders = computed(() =>
    this.orders().filter(order => {
      const text = (order.customer + ' ' + order.product).toLowerCase();
      const matchesSearch = text.includes(this.search().toLowerCase());
      const matchesStatus =
        this.statusFilter() === 'All' || order.status === this.statusFilter();
      return matchesSearch && matchesStatus;
    })
  );

  totalOrders = computed(() => this.orders().length);
  revenue = computed(() =>
    this.orders()
      .filter(order => order.status !== 'Cancelled')
      .reduce((sum, order) => sum + order.quantity * order.price, 0)
  );
  newCount = computed(() => this.orders().filter(o => o.status === 'New').length);
  cancelledCount = computed(() => this.orders().filter(o => o.status === 'Cancelled').length);

  statusCounts = computed(() => 
  this.statuses.map(status => ({
    status,
    count: this.orders().filter(order => order.status === status).length,
  }))
);

maxCount = computed(() => 
  Math.max(1, ...this.statusCounts(). map(item => item.count))
);

  changeStatus(id: number, event: Event) {
    const value = (event.target as HTMLSelectElement).value as Status;
    this.ordersService.setStatus(id, value);
  }

  updateSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  updateFilter(event: Event) {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  addOrder(event: Event, customer: string, product: string, quantity: string, price: string) {
    event.preventDefault();
    if (!customer.trim() || !product.trim() || Number(quantity) < 1 || Number(price) < 0) {
      return;
    }
    this.ordersService.addOrder({
      customer: customer.trim(),
      product: product.trim(),
      quantity: Number(quantity),
      price: Number(price),
      date: new Date().toISOString().slice(0, 10),
      status: 'New',
    });
    (event.target as HTMLFormElement).reset();
  }

  deleteOrder(id: number) {
    if (confirm('Delete this order?')) {
      this.ordersService.deleteOrder(id);
    }
  }
}