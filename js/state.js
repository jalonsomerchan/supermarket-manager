export function createState(config) {
  const products = structuredClone(config.products);
  for (const product of Object.values(products)) product.basePriceRecommended = product.basePrice;
  const licenses = structuredClone(config.licenses);
  const upgrades = Object.fromEntries(Object.keys(config.upgrades).map((id) => [id, false]));
  const shelves = config.map.shelves.map((shelf) => ({
    ...shelf,
    stock: licenses[products[shelf.productId].license]?.owned
      ? Math.floor(products[shelf.productId].shelfCapacity * 0.65)
      : 0
  }));

  return {
    day: 1,
    elapsed: 0,
    phase: "closed",
    paused: false,
    closedWait: 0,
    closedPenaltyTimer: 0,
    money: config.world.startMoney,
    reputation: config.world.startReputation,
    reputationXp: 0,
    gross: 0,
    costs: 0,
    dailyProfitFee: 0,
    dailyProfitFeeRate: config.world.dailyProfitFeeRate,
    dailyProfitFeeApplied: false,
    served: 0,
    lost: 0,
    products,
    licenses,
    upgrades,
    expansionLevel: 0,
    shelves,
    pallets: config.map.pallets.map((tile) => ({ ...tile, boxes: [] })),
    recycles: [{ ...config.map.recycle }],
    droppedBoxes: [],
    orders: [],
    customers: [],
    messages: [],
    stockWarnings: {},
    movingObject: null,
    started: false,
    pauseOpen: false,
    terminalOpen: false,
    reportOpen: false,
    checkoutSummaryOpen: false,
    customerInfoOpen: false
  };
}
