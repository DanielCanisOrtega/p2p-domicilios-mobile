const dismissedOrderIds = new Set<string>();

export const pendingOrderStore = {
  dismiss(orderId: number | string) {
    dismissedOrderIds.add(String(orderId));
  },

  isDismissed(orderId: number | string) {
    return dismissedOrderIds.has(String(orderId));
  },

  filterVisible<T extends { id: number | string }>(orders: T[]) {
    return orders.filter((order) => !dismissedOrderIds.has(String(order.id)));
  },

  clear() {
    dismissedOrderIds.clear();
  },
};