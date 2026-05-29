export const CONFIG = {
  title: "Supermarket Manager 2D",
  tile: 32,
  world: {
    cols: 20,
    rows: 15,
    openingHour: 8,
    closingHour: 20,
    realDaySeconds: 720,
    deliverySeconds: 18,
    customerEverySeconds: 7,
    queuePatienceSeconds: 20,
    inspectSeconds: 1.5,
    checkoutSeconds: 2.2,
    restockUnitSeconds: 0.2,
    startMoney: 220,
    startReputation: 1,
    reputationPerLevel: 80,
    maxCustomers: 8,
    closedGraceSeconds: 45,
    closedReputationPenaltySeconds: 25,
    dailyProfitFeeRate: 0.05
  },
  controls: {
    actionKeys: ["e", " ", "Enter"],
    moveKeys: ["q", "Q"],
    shopKeys: ["o", "O"],
    pauseKeys: ["Escape", "p", "P"],
    up: ["w", "ArrowUp"],
    down: ["s", "ArrowDown"],
    left: ["a", "ArrowLeft"],
    right: ["d", "ArrowRight"]
  },
  sprites: {
    player: "assets/sprites/player/sheet-transparent.png",
    customer: "assets/sprites/customer/sheet-transparent.png",
    shelf: "assets/sprites/shelf/sprite.png",
    register: "assets/sprites/register/sprite.png",
    pallet: "assets/sprites/pallet/sprite.png",
    computer: "assets/sprites/computer/sprite.png",
    wall: "assets/sprites/wall/sprite.png",
    door: "assets/sprites/door/sprite.png",
    frameSize: 96,
    columns: 4,
    directions: { down: 0, left: 1, right: 2, up: 3 }
  },
  map: {
    entrance: { x: 9, y: 14 },
    exit: { x: 10, y: 14 },
    office: { x: 6, y: 6, w: 2, h: 1 },
    recycle: { x: 11, y: 6, w: 1, h: 1 },
    pallets: [{ x: 11, y: 5 }],
    registers: [{ x: 8, y: 11, w: 2, h: 1, queue: [{ x: 10, y: 11 }, { x: 11, y: 11 }, { x: 11, y: 10 }] }],
    shelves: [
      { id: "shelf-bread", x: 6, y: 9, w: 1, h: 2, productId: "bread" },
      { id: "shelf-milk", x: 10, y: 9, w: 1, h: 2, productId: "milk" }
    ],
    walls: [
      { x: 0, y: 0, w: 20, h: 1 },
      { x: 0, y: 0, w: 1, h: 15 },
      { x: 19, y: 0, w: 1, h: 15 },
      { x: 0, y: 14, w: 9, h: 1 },
      { x: 11, y: 14, w: 8, h: 1 },
      { x: 0, y: 4, w: 6, h: 1 },
      { x: 8, y: 4, w: 12, h: 1 }
    ],
    warehouseTiles: [{ x: 6, y: 5, w: 7, h: 2 }],
    expansionWalls: [
      { x: 1, y: 1, w: 18, h: 3 },
      { x: 1, y: 5, w: 5, h: 9 },
      { x: 13, y: 5, w: 6, h: 9 },
      { x: 6, y: 7, w: 1, h: 1 },
      { x: 12, y: 7, w: 1, h: 1 }
    ],
    lockedZones: [
      { x: 1, y: 1, w: 18, h: 3 },
      { x: 1, y: 5, w: 5, h: 9 },
      { x: 13, y: 5, w: 6, h: 9 }
    ]
  },
  products: {
    bread: { name: "Pan de Molde", lot: 10, boxCost: 10, basePrice: 2.5, shelfCapacity: 12, license: "basic", color: "#d99b48" },
    milk: { name: "Leche Entera", lot: 10, boxCost: 8, basePrice: 1.8, shelfCapacity: 10, license: "basic", color: "#e9f7ff" },
    coffee: { name: "Cafe Molido", lot: 5, boxCost: 17.5, basePrice: 7, shelfCapacity: 8, license: "breakfast", color: "#6b3f25" },
    cola: { name: "Refresco de Cola", lot: 15, boxCost: 7.5, basePrice: 1.5, shelfCapacity: 15, license: "snacks", color: "#d63d32" },
    beer: { name: "Cerveza Artesana", lot: 12, boxCost: 14.4, basePrice: 3, shelfCapacity: 12, license: "alcohol", color: "#f0b84a" },
    snacks: { name: "Aperitivos", lot: 10, boxCost: 4, basePrice: 1.2, shelfCapacity: 10, license: "snacks", color: "#f5da4f" }
  },
  licenses: {
    basic: { name: "Licencia Basica", cost: 0, level: 1, products: ["bread", "milk"], owned: true },
    snacks: { name: "Bebidas y Snacks", cost: 250, level: 2, products: ["cola", "snacks"] },
    breakfast: { name: "Desayunos y Cafeteria", cost: 600, level: 3, products: ["coffee"] },
    alcohol: { name: "Bebidas Alcoholicas", cost: 1200, level: 4, products: ["beer"] }
  },
  upgrades: {
    shoes: { name: "Zapatillas de Correr", cost: 300, desc: "+20% velocidad" },
    scanner: { name: "Escaner Laser", cost: 500, desc: "Cobro al doble de velocidad" },
    strong: { name: "Fuerza Hercules", cost: 750, desc: "Carga 2 cajas" },
    expansion1: { name: "Ampliacion Local Fase 1", cost: 900, desc: "Abre el resto del local y del almacen" }
  },
  furniture: {
    shelf: { name: "Estanteria", cost: 120, w: 1, h: 2 },
    pallet: { name: "Pale", cost: 90, w: 1, h: 1 },
    recycle: { name: "Papelera reciclaje", cost: 70, w: 1, h: 1 }
  },
  player: {
    start: { x: 7, y: 12 },
    speed: 150,
    carryingSpeedFactor: 0.9,
    boxCapacity: 5
  },
  customer: {
    speed: 58,
    angrySpeed: 118,
    wanderPauseChance: 0.16,
    buyProbabilityBelowBase: 1,
    overpriceSoftLimit: 1.2
  }
};
