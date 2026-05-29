export function placeOrder(state, config, productId) {
  const product = state.products[productId];
  if (!product || !state.licenses[product.license]?.owned) return "Producto bloqueado.";
  if (state.money < product.boxCost) return "No hay dinero suficiente.";
  state.money -= product.boxCost;
  state.costs += product.boxCost;
  state.orders.push({ productId, remaining: config.world.deliverySeconds });
  return `Pedido de ${product.name} en camino.`;
}

export function updateOrders(state, dt) {
  for (const order of state.orders) order.remaining -= dt;
  const arrived = state.orders.filter((order) => order.remaining <= 0);
  state.orders = state.orders.filter((order) => order.remaining > 0);

  for (const order of arrived) {
    const pallet = state.pallets.find((slot) => slot.boxes.length < 2);
    if (pallet) {
      pallet.boxes.push({ productId: order.productId });
      state.messages.push({ text: "Pedido entregado en el almacen.", type: "success" });
    }
    else {
      state.orders.push({ ...order, remaining: 5, blocked: true });
      state.messages.push({ text: "Entrega bloqueada: todos los pales estan llenos.", type: "warn" });
    }
  }
}
