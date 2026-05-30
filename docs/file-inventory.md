# Inventario de ficheros

Este documento resume los ficheros actuales del repositorio y la utilidad principal de cada uno. Debe actualizarse cuando se añadan, eliminen o muevan ficheros relevantes.

## Raíz del repositorio

| Fichero | Utilidad |
| --- | --- |
| `agents.md` | Define las normas obligatorias para agentes IA y automatizaciones que trabajen en el repositorio. Incluye reglas de calidad, documentación, GitHub API, modularidad, despliegue en GitHub Pages, comprobaciones y revisión antes de finalizar tareas. |
| `package.json` | Declara el proyecto como módulo ES y contiene scripts de desarrollo/comprobación: `serve` para servir la app con `python3 -m http.server 8092` y `check` para validar sintaxis de los ficheros JavaScript con `node --check`. |
| `index.html` | Punto de entrada de la aplicación. Carga `css/styles.css`, define la estructura principal de la interfaz, el canvas del juego, HUD, controles táctiles, toast, modal y arranca `js/main.js` como módulo. |

## GitHub Actions

| Fichero | Utilidad |
| --- | --- |
| `.github/workflows/ci.yml` | Workflow de CI para pull requests y ejecución manual. Valida la sintaxis JavaScript con `npm run check` y comprueba que existen los ficheros/carpetas estáticos básicos (`index.html`, `css`, `js`, `assets`) y que `index.html` referencia los assets principales. |
| `.github/workflows/pages.yml` | Workflow de GitHub Actions para desplegar automáticamente la app estática en GitHub Pages desde `main`. Ejecuta `npm run check`, prepara `dist` con `index.html`, `css`, `js` y `assets`, sube el artefacto y publica con `actions/deploy-pages`. |

## Estilos

| Fichero | Utilidad |
| --- | --- |
| `css/styles.css` | Hoja de estilos global de la aplicación. Define variables CSS, layout principal, apariencia del canvas, HUD, modales, botones, controles táctiles, avisos, ayudas de pausa y comportamiento responsive. |

## JavaScript principal

| Fichero | Utilidad |
| --- | --- |
| `js/main.js` | Punto de arranque JavaScript. Importa la configuración y la clase `Game`, ajusta el tamaño del canvas según el mapa configurado, instancia el juego y llama a `game.start()`. |
| `js/config.js` | Configuración central del juego. Contiene tamaños, mundo, controles, rutas de sprites, mapa compacto inicial, zonas bloqueadas de expansión, productos, licencias, mejoras, parámetros de jugador y clientes. Es la fuente principal de datos ajustables. |
| `js/game.js` | Orquestador principal del juego. Crea assets, input, estado, jugador, UI y renderer; controla el bucle de actualización/renderizado, objetivo de interacción actual, cambios de fase, clientes, reputación, guardado/carga y cierre de día. |
| `js/assets.js` | Cargador de imágenes. Recorre los sprites definidos en `CONFIG`, crea objetos `Image`, espera a su carga y los deja disponibles para el renderer. |
| `js/input.js` | Gestión de entrada de usuario. Centraliza teclado y controles táctiles, expone acciones consumibles y vector de movimiento, y traduce teclas configuradas a acciones de juego. |
| `js/state.js` | Factoría del estado inicial. Construye productos, licencias, mejoras, estantes, palés, pedidos, clientes, mensajes y flags de interfaz para empezar o restaurar una partida. |

## Entidades

| Fichero | Utilidad |
| --- | --- |
| `js/entities/player.js` | Lógica del jugador. Gestiona posición, dirección, animación, velocidad, detección centralizada del objetivo de interacción, interacción con cajas, estantes, palés, caja registradora, terminal, reciclaje, clientes y movimiento de mobiliario. |
| `js/entities/customer.js` | Lógica de clientes. Define listas de compra, navegación por el mapa, inspección de estantes, colas, compra, abandono, paciencia y efectos sobre ventas/reputación. |

## Sistemas

| Fichero | Utilidad |
| --- | --- |
| `js/systems/render.js` | Sistema de renderizado sobre canvas. Dibuja mapa, paredes, puertas, zonas bloqueadas por expansión, objetos, cajas, estantes, personajes, burbujas, indicador visual del objetivo de interacción y estados visuales usando sprites y formas simples. |
| `js/systems/world.js` | Utilidades del mundo y colisiones. Calcula casillas bloqueadas, posiciones de tiles, zonas cercanas e identificadores de casillas adyacentes transitables. |
| `js/systems/orders.js` | Sistema de pedidos y entregas. Permite comprar mercancía, descuenta dinero/costes, gestiona temporizadores de entrega y coloca cajas en palés libres o reintenta si no hay hueco. |
| `js/systems/economy.js` | Sistema económico. Gestiona productos desbloqueados, compra de licencias y mejoras, cambios de precio y progresión de reputación. |
| `js/systems/save.js` | Persistencia de partida y ajustes locales. Serializa el estado, jugador, parte del mapa y configuración de zoom; guarda/carga en `localStorage`; restaura una partida combinándola con un estado base actualizado y migra guardados antiguos al layout compacto cuando procede. |

## Interfaz

| Fichero | Utilidad |
| --- | --- |
| `js/ui/hud.js` | Interfaz de usuario del juego. Actualiza HUD, etiquetas del mundo, toasts, terminal de gestión, pestañas de pedidos/precios/licencias/mejoras/mobiliario, ayuda de pausa, informes, carga/guardado y modales informativos. |

## Utilidades

| Fichero | Utilidad |
| --- | --- |
| `js/utils/math.js` | Helpers matemáticos y de formato. Incluye `clamp`, aleatorios, selección, distancia, centro de tile, formato de dinero y comprobación de rectángulos que se tocan. |
| `js/utils/pathfinding.js` | Búsqueda de caminos en rejilla. Implementa una exploración con heurística Manhattan para que clientes puedan desplazarse hasta objetivos evitando casillas no transitables. |

## Assets gráficos

| Fichero | Utilidad |
| --- | --- |
| `assets/sprites/player/sheet-transparent.png` | Sprite sheet del jugador con animaciones direccionales. |
| `assets/sprites/player/prompt-used.txt` | Prompt usado para regenerar el sprite sheet direccional del jugador. |
| `assets/sprites/player-box-full/sheet-transparent.png` | Sprite sheet del jugador caminando con una caja llena, usado cuando transporta producto. |
| `assets/sprites/player-box-full/raw-sheet.png` | Imagen generada original del jugador con caja llena antes del procesado. |
| `assets/sprites/player-box-full/raw-sheet-clean.png` | Sprite sheet del jugador con caja llena tras limpiar el fondo magenta. |
| `assets/sprites/player-box-full/down-1.png` a `assets/sprites/player-box-full/up-4.png` | Frames individuales del jugador con caja llena, divididos por dirección y paso. |
| `assets/sprites/player-box-full/down-strip.png`, `left-strip.png`, `right-strip.png`, `up-strip.png` | Tiras direccionales del jugador con caja llena para previsualización y depuración. |
| `assets/sprites/player-box-full/down.gif`, `left.gif`, `right.gif`, `up.gif` | GIFs de previsualización de la animación del jugador con caja llena. |
| `assets/sprites/player-box-full/prompt-used.txt` | Prompt usado para generar el sprite sheet del jugador con caja llena. |
| `assets/sprites/player-box-full/pipeline-meta.json` | Metadatos de procesado y control de calidad del sprite sheet del jugador con caja llena. |
| `assets/sprites/player-box-empty/sheet-transparent.png` | Sprite sheet del jugador caminando con una caja vacía, usado cuando termina de reponer y aún lleva el cartón. |
| `assets/sprites/player-box-empty/raw-sheet.png` | Imagen generada original del jugador con caja vacía antes del procesado. |
| `assets/sprites/player-box-empty/raw-sheet-clean.png` | Sprite sheet del jugador con caja vacía tras limpiar el fondo magenta. |
| `assets/sprites/player-box-empty/down-1.png` a `assets/sprites/player-box-empty/up-4.png` | Frames individuales del jugador con caja vacía, divididos por dirección y paso. |
| `assets/sprites/player-box-empty/down-strip.png`, `left-strip.png`, `right-strip.png`, `up-strip.png` | Tiras direccionales del jugador con caja vacía para previsualización y depuración. |
| `assets/sprites/player-box-empty/down.gif`, `left.gif`, `right.gif`, `up.gif` | GIFs de previsualización de la animación del jugador con caja vacía. |
| `assets/sprites/player-box-empty/prompt-used.txt` | Prompt usado para generar el sprite sheet del jugador con caja vacía. |
| `assets/sprites/player-box-empty/pipeline-meta.json` | Metadatos de procesado y control de calidad del sprite sheet del jugador con caja vacía. |
| `assets/sprites/customer/sheet-transparent.png` | Sprite sheet de clientes con animaciones direccionales. |
| `assets/sprites/customer/prompt-used.txt` | Prompt usado para regenerar el sprite sheet direccional del cliente. |
| `assets/sprites/customer-student/sheet-transparent.png` | Sprite sheet direccional del cliente estudiante, usado como variante visual y de comportamiento de clientes. |
| `assets/sprites/customer-student/raw-sheet.png` | Imagen generada original del cliente estudiante antes del procesado. |
| `assets/sprites/customer-student/raw-sheet-clean.png` | Sprite sheet del cliente estudiante tras limpiar el fondo magenta. |
| `assets/sprites/customer-student/down-1.png` a `assets/sprites/customer-student/up-4.png` | Frames individuales del cliente estudiante, divididos por dirección y paso. |
| `assets/sprites/customer-student/down-strip.png`, `left-strip.png`, `right-strip.png`, `up-strip.png` | Tiras direccionales del cliente estudiante para previsualización y depuración. |
| `assets/sprites/customer-student/down.gif`, `left.gif`, `right.gif`, `up.gif` | GIFs de previsualización de la animación del cliente estudiante. |
| `assets/sprites/customer-student/prompt-used.txt` | Prompt usado para generar el sprite sheet del cliente estudiante. |
| `assets/sprites/customer-student/pipeline-meta.json` | Metadatos de procesado y control de calidad del sprite sheet del cliente estudiante. |
| `assets/sprites/customer-business/sheet-transparent.png` | Sprite sheet direccional del cliente ejecutivo, usado como variante visual y de comportamiento de clientes. |
| `assets/sprites/customer-business/raw-sheet.png` | Imagen generada original del cliente ejecutivo antes del procesado. |
| `assets/sprites/customer-business/raw-sheet-clean.png` | Sprite sheet del cliente ejecutivo tras limpiar el fondo magenta. |
| `assets/sprites/customer-business/down-1.png` a `assets/sprites/customer-business/up-4.png` | Frames individuales del cliente ejecutivo, divididos por dirección y paso. |
| `assets/sprites/customer-business/down-strip.png`, `left-strip.png`, `right-strip.png`, `up-strip.png` | Tiras direccionales del cliente ejecutivo para previsualización y depuración. |
| `assets/sprites/customer-business/down.gif`, `left.gif`, `right.gif`, `up.gif` | GIFs de previsualización de la animación del cliente ejecutivo. |
| `assets/sprites/customer-business/prompt-used.txt` | Prompt usado para generar el sprite sheet del cliente ejecutivo. |
| `assets/sprites/customer-business/pipeline-meta.json` | Metadatos de procesado y control de calidad del sprite sheet del cliente ejecutivo. |
| `assets/sprites/customer-senior/sheet-transparent.png` | Sprite sheet direccional del cliente mayor, usado como variante visual y de comportamiento de clientes. |
| `assets/sprites/customer-senior/raw-sheet.png` | Imagen generada original del cliente mayor antes del procesado. |
| `assets/sprites/customer-senior/raw-sheet-clean.png` | Sprite sheet del cliente mayor tras limpiar el fondo magenta. |
| `assets/sprites/customer-senior/down-1.png` a `assets/sprites/customer-senior/up-4.png` | Frames individuales del cliente mayor, divididos por dirección y paso. |
| `assets/sprites/customer-senior/down-strip.png`, `left-strip.png`, `right-strip.png`, `up-strip.png` | Tiras direccionales del cliente mayor para previsualización y depuración. |
| `assets/sprites/customer-senior/down.gif`, `left.gif`, `right.gif`, `up.gif` | GIFs de previsualización de la animación del cliente mayor. |
| `assets/sprites/customer-senior/prompt-used.txt` | Prompt usado para generar el sprite sheet del cliente mayor. |
| `assets/sprites/customer-senior/pipeline-meta.json` | Metadatos de procesado y control de calidad del sprite sheet del cliente mayor. |
| `assets/sprites/shelf/sprite.png` | Sprite de estantería usado para mostrar mobiliario de venta. |
| `assets/sprites/register/sprite.png` | Sprite de caja registradora usado en la zona de cobro. |
| `assets/sprites/pallet/sprite.png` | Sprite de palé usado para zona de almacén y entregas. |
| `assets/sprites/computer/sprite.png` | Sprite del ordenador/terminal de gestión de la oficina. |
| `assets/sprites/wall/sprite.png` | Sprite de pared usado en la composición visual del supermercado. |
| `assets/sprites/door/sprite.png` | Sprite de puerta/entrada del supermercado. |

## Notas de mantenimiento

- Si se añade un módulo JavaScript, documentarlo en la sección que corresponda: principal, entidad, sistema, interfaz o utilidad.
- Si se añade un asset referenciado desde `js/config.js`, incluirlo también en la sección de assets gráficos.
- Si se añade, cambia o elimina un workflow, documentarlo en la sección de GitHub Actions.
- Si se cambia el propósito de un fichero, actualizar su descripción para que este inventario siga siendo útil para nuevos agentes y mantenedores.
- Este proyecto actual es una app HTML/CSS/JavaScript ligera sin build step obligatorio.
