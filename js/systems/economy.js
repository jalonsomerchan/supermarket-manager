export function ownedProductIds(state) {
  return Object.entries(state.products)
    .filter(([, product]) => state.licenses[product.license]?.owned)
    .map(([id]) => id);
}

export function buyLicense(state, config, licenseId) {
  const license = state.licenses[licenseId];
  if (!license || license.owned) return "Licencia no disponible.";
  if (state.reputation < license.level) return `Necesitas reputacion nivel ${license.level}.`;
  if (state.money < license.cost) return "No hay dinero suficiente.";
  state.money -= license.cost;
  state.costs += license.cost;
  license.owned = true;
  return `${license.name} desbloqueada.`;
}

export function buyUpgrade(state, config, upgradeId) {
  const upgrade = config.upgrades[upgradeId];
  if (!upgrade || state.upgrades[upgradeId]) return "Mejora no disponible.";
  if (state.money < upgrade.cost) return "No hay dinero suficiente.";
  state.money -= upgrade.cost;
  state.costs += upgrade.cost;
  state.upgrades[upgradeId] = true;
  if (upgradeId === "expansion1") state.expansionLevel = 1;
  return `${upgrade.name} comprada.`;
}

export function changePrice(state, productId, delta) {
  const product = state.products[productId];
  product.basePrice = Math.max(0.1, Math.round((product.basePrice + delta) * 10) / 10);
}

export function addReputation(state, amount, config) {
  state.reputationXp += amount;
  while (state.reputationXp >= config.world.reputationPerLevel) {
    state.reputationXp -= config.world.reputationPerLevel;
    state.reputation += 1;
  }
  if (state.reputationXp < 0) {
    state.reputationXp = 0;
    state.reputation = Math.max(1, state.reputation - 1);
  }
}
