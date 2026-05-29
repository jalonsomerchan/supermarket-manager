# Documento de Diseño de Videojuego (GDD)
## GDD: Supermarket Manager 2D (Estilo RPG Pixel Art)

Este documento detalla los aspectos de diseño, mecánicas, comportamiento de las entidades, gestión del tiempo, economía avanzada y especificaciones artísticas para el desarrollo de un simulador de gestión de tienda en 2D con perspectiva cenital e identidad visual Pixel Art de 8/16-bits.

---

## 1. Visión General del Juego

* **Título Provisional:** *Supermarket Manager 2D*
* **Género:** Simulación / Gestión / Estrategia en tiempo real
* **Plataforma:** Web (PC e iPhone/Safari mediante controles táctiles o teclado)
* **Perspectiva:** 2D Cenital (Top-Down, vista de pájaro estilo RPG clásico)
* **Estilo Artístico:** Pixel Art inspirado en RPGs de consola portátil (estilo Pokémon de 3ª generación / Stardew Valley).
* **Objetivo del Jugador:** Gestionar una tienda minorista, planificar la cadena de suministro mediante pedidos, desbloquear licencias comerciales, expandir y mejorar el local, ajustar los precios de venta para maximizar beneficios sin ahuyentar a la clientela, reponer los estantes y atender las cajas eficientemente para sobrevivir al balance financiero de cada jornada.

---

## 2. Gestión del Tiempo y Ciclo de Jornadas

El juego se estructura en torno a **Días (Jornadas Laborales)** independientes, lo que elimina el bucle infinito y añade presión estratégica al jugador.

### El Reloj del Juego
* **Escala de Tiempo:** 1 segundo en la vida real equivale a 10 minutos dentro del juego. 
* **Duración del Día:** Una jornada completa de apertura dura **12 minutos reales** (de 08:00 a 20:00).

### Fases de la Jornada
1. **Fase de Gestión y Apertura (08:00 - 20:00):** Las puertas se abren automáticamente. Los clientes entran de forma fluida según la reputación de la tienda. El jugador debe dividir su tiempo entre reponer, cobrar y monitorizar los pedidos en camino.
2. **Fase de Cierre (20:00):** Se apaga el cartel exterior. No se permite la entrada de nuevos clientes. Los clientes que ya están dentro de la tienda terminan su lista de la compra, hacen cola y pagan.
3. **Fase de Balance (Fin del Día):** Una vez que el último cliente abandona el local, el juego se pausa por completo y despliega la pantalla flotante del **Informe de Ganancias**.

### El Informe de Ganancias (UI)
Antes de avanzar al siguiente día, el jugador debe revisar y aceptar un desglose financiero interactivo:
* **Ingresos Brutos:** Todo el dinero recaudado en la caja registradora por la venta de artículos.
* **Gastos de Operación:** Coste total de los pedidos que se han pagado al proveedor durante el día.
* **Métricas de Clientela:** Número de clientes totales que pagaron satisfactoriamente frente a los clientes perdidos (los que se marcharon enfadados por falta de stock o por colas lentas).
* **Reputación Neta:** Puntos de experiencia ganados o perdidos para la tienda.
* **Balance Neto:** Calculado mediante la ecuación:
  $$\text{Balance Neto} = \text{Ingresos Brutos} - \text{Gastos de Operación}$$
  *Si el balance es positivo, se resalta en verde brillante con efectos de monedas pixeladas; si es negativo, se muestra en rojo parpadeante alertando del riesgo de quiebra.*

---

## 3. Cadena de Suministro: Pedidos con Tiempo de Espera

Los productos del almacén no son infinitos ni inmediatos. El jugador debe anticiparse a la demanda utilizando un sistema logístico de pedidos en espera.

### Interfaz del Terminal de Pedidos
En el almacén de la tienda hay una mesa con un ordenador. Al interactuar con él, se abre la pantalla de **Pedidos al Proveedor**:
* El jugador compra stock por **Cajas Cerradas** (cada caja contiene un lote cerrado de unidades, por ejemplo, 10 o 15 unidades de un solo tipo de producto).
* Al confirmar la compra, el importe del coste mayorista se descuenta inmediatamente del dinero disponible de la tienda.
* El jugador solo puede pedir productos cuyas **Licencias Comerciales** hayan sido previamente adquiridas.

### El Retraso en la Entrega (Delivery Delay)
* Los pedidos entran en una cola de reparto logística y **tardan 3 horas de juego (18 segundos reales)** en llegar a la tienda.
* **Mecánica de Alerta:** Una pequeña barra de progreso con el icono pixelado de un camión aparece en la esquina superior del HUD mostrando la cuenta atrás del pedido.
* **La Entrega Física:** Al cumplirse el tiempo, una furgoneta aparca brevemente en la zona de descarga trasera y deposita los sprites de las cajas físicas sobre los **palés del almacén**. El stock se queda ahí bloqueado esperando a que el jugador lo recoja a mano.

---

## 4. Configuración Dinámica de Precios (PVP) y Elasticidad

El jugador tiene control absoluto sobre cuánto cobrar por cada artículo desde el terminal informático, afectando directamente al humor de la IA de los clientes.

### Elasticidad de la Demanda y Reacciones del Cliente
Cada artículo cuenta con un **Precio Recomendado de Venta (PVP Base)** de mercado. El jugador puede modificar el precio final con botones de `+` o `-` en intervalos de \$0.10:

* **Estrategia "Low Cost" (Por debajo del PVP Base):** Los clientes compran el producto con una probabilidad del 100% si lo ven. La reputación de la tienda aumenta al final del día. Sin embargo, el margen de beneficio neto disminuye críticamente.
* **Precio Justo (Igual al PVP Base):** El comportamiento de compra es estándar y equilibrado.
* **Estrategia de Usura (Por encima del PVP Base):** 
  * Si el precio supera hasta un 20% el PVP Base, un porcentaje de clientes dudará, pero terminará comprando.
  * Si el precio supera el 20% del PVP Base, el cliente se negará a comprar. Detendrá su marcha, el jugador escuchará un sonido de "error" y aparecerá un globo de diálogo flotante con un sprite de **Moneda Rota (Enfado por precio abusivo)** sobre su cabeza. El cliente descarta el producto, rompe su lista y se dirige a la salida de inmediato, penalizando gravemente la reputación de la tienda.

---

## 5. Licencias Comerciales de Productos

Al inicio del juego, la tienda solo tiene permiso legal para vender productos básicos de panadería y lácteos. Para desbloquear nuevos artículos que dejen mayores márgenes de beneficio, el jugador debe comprar **Licencias** desde el ordenador de gestión.

### Requisitos y Gestión de Licencias
* Las licencias exigen un **Nivel de Reputación mínimo** de la tienda y un pago único en dólares.
* Al comprar una licencia, los nuevos productos aparecen disponibles instantáneamente en el catálogo del terminal de pedidos para ser importados.
* **Mecánica de Configuración de Estantes:** Al interactuar con un estante vacío, se abre un menú radial donde el jugador puede asignar qué producto de sus licencias activas albergará ese estante. Cambiar el tipo de producto de un estante requiere vaciar primero su stock actual.

### Árbol de Licencias Disponibles

1. **Licencia Básica (Desbloqueada por defecto - Nivel 1):**
   * *Productos:* Pan de Molde, Leche Entera.
2. **Licencia de Bebidas y Snacks (Coste: \$250 | Requiere Nivel 2):**
   * *Productos:* Refresco de Cola, Aperitivos (Patatas Fritas).
3. **Licencia de Desayunos y Cafetería (Coste: \$600 | Requiere Nivel 3):**
   * *Productos:* Café Molido, Azúcar Refinado, Galletas de Chocolate.
4. **Licencia de Bebidas Alcohólicas (Coste: \$1,200 | Requiere Nivel 4):**
   * *Productos:* Cerveza Artesana, Vino Tinto.
5. **Licencia de Productos Frescos y Frutería (Coste: \$2,500 | Requiere Nivel 5):**
   * *Productos:* Manzanas (Requiere caja/expositor de madera), Plátanos.
6. **Licencia de Congelados (Coste: \$5,000 | Requiere Nivel 6):**
   * *Productos:* Helado de Vainilla, Pizza Congelada (Requiere la mejora física de *Arcón Congelador*).

---

## 6. Sistema de Mejoras de la Tienda (Upgrades)

El dinero acumulado neto sobrante puede reinvertirse al final de cada día o durante la jornada desde el terminal informático para mejorar la eficiencia del jugador o la capacidad del local.

### Categoría A: Mejoras del Jugador (Habilidades)
* **Zapatillas de Correr:** Aumenta la velocidad de movimiento del jugador un 20% de forma permanente. (Coste: \$300). *Visualmente, la animación de caminar del jugador duplica su velocidad de frames.*
* **Fuerza Hércules (Carga Doble):** Permite al jugador llevar hasta **2 cajas a la vez** en sus manos (máximo 10 unidades de stock en lugar de 5), reduciendo el número de viajes al almacén. (Coste: \$750). *Cambia el sprite de carga a dos cajas apiladas.*
* **Escáner Láser de Caja:** Duplica la velocidad a la que se procesan los carritos de los clientes cuando el jugador está en la caja registradora, disminuyendo la probabilidad de que se agote su paciencia en la cola. (Coste: \$500)

### Categoría B: Mejoras de Infraestructura y Maquinaria
* **Segundo Mostrador de Caja (Caja 2):** Instala un nuevo mueble de cobro. Permite dividir las colas de los clientes a la mitad. (Coste: \$1,500).
* **Contenedor Industrial:** Aumenta la velocidad de desecho de cajas vacías y reduce a 0 ms el tiempo de animación de reciclaje. (Coste: \$200)
* **Arcón Congelador:** Mobiliario especial obligatorio para poder almacenar y vender los productos derivados de la *Licencia de Congelados*. Ocupa un espacio de 2x1 casillas en el mapa. (Coste: \$1,000)

### Categoría C: Expansión del Local (Reformas)
* **Ampliación de Zona Comercial Fase 1:** Expande las dimensiones del mapa jugable de la tienda de $16 \times 12$ casillas a $20 \times 15$ casillas, abriendo espacio para colocar más pasillos y estantes, lo que permite albergar todas las licencias simultáneamente. (Coste: \$3,500)
* **Palé Adicional en Almacén:** Instala un segundo palé de descarga en la zona trasera, permitiendo almacenar hasta 4 cajas de pedidos en espera de forma simultánea sin que se bloquee la cadena de transporte por falta de espacio físico. (Coste: \$400)

---

## 7. Acciones del Jugador y Mecánica Activa de Reposición

El jugador interactúa mediante proximidad con los módulos de la tienda. El movimiento se ve alterado por la física del inventario de carga.

### Bucle de Reposición de Estantes
1. El jugador se dirige al almacén y se sitúa sobre las cajas de un producto entregado en los palés.
2. Al pulsar la tecla de acción, el jugador levanta una **Caja de Reposición**. Su sprite cambia y se ralentiza su velocidad de movimiento un 10% debido al peso.
3. Se desplaza hasta el estante asignado para ese tipo de producto.
4. Al mantener pulsada la tecla de acción frente al estante, se activa un indicador circular de progreso. Las unidades se transfieren visualmente de sus manos al mueble a un ritmo de 1 unidad cada 200 ms.
5. **Gestión de Residuos:** Una vez vaciada la caja, el jugador lleva entre sus manos un sprite de caja de cartón aplastada/vacía. Debe caminar hacia el **Contenedor de Reciclaje** de la tienda para desecharla antes de poder ir a buscar más mercancía o atender la caja registradora.

---

## 8. Comportamiento y Flujo de la Inteligencia Artificial (Clientes)

Los clientes son entidades autónomas gobernadas por una máquina de estados finitos (FSM) que calcula sus rutas con el algoritmo de búsqueda de caminos **A* (A-Star)** para esquivar los pasillos del mobiliario.

[Entrada / Spawn] ──> [Analizar Lista] ──> [Calcular Ruta A* al Estante]
│
[Desaparecer] <── [Salir Enfadado] <── [Paciencia 0] <── [Hacer Cola en Caja] <── [Verificar Precios/Stock]


### Estados Detallados de los Clientes
* **Spawn & Lista:** Entran por la puerta y generan un array aleatorio de necesidades basado en las licencias activas de la tienda (Ej: `[Pan: 2, Leche: 1]`).
* **Navegación e Inspección:** Caminan hacia el estante correspondiente empleando sus animaciones direccionales de movimiento. Al llegar, se detienen 1.5 segundos simulando que miran el estante.
  * *Caso Exitoso:* Hay stock y el precio es aceptable. Reducen el stock del estante, añaden el artículo a su carrito de la compra (un sprite de cesta que se va llenando) y van al siguiente artículo de su lista.
  * *Caso Fallido (Sin Stock):* El cliente muestra una burbuja con el **Icono del Producto Tachado**. Su barra de paciencia disminuye drásticamente. Si era el único producto de su lista, pasa directamente a la cola de salida sin pagar nada.
* **Fila de Espera en Caja:** Cuando terminan su lista, caminan hacia los mosaicos de espera de la caja registradora formando una fila de nodos.
* **Barra de Paciencia en Cola:** Aparece un medidor flotante sobre sus cabezas que dura exactamente **20 segundos reales**. Si el jugador no se sitúa detrás del mostrador para cobrarlos antes de que expire el tiempo, el cliente tira la cesta al suelo (dejando basura que ralentiza el paso) y se marcha indignado de la tienda con animación de correr rápido.

---

## 9. Tabla de Economía, Costes y Capacidad Base

| ID | Nombre del Producto | Lote de Compra (Caja) | Coste Caja (Almacén) | Coste Unitario Real | PVP Base Recomendado | Capacidad Máx. Estante |
|:---|:---|:---|:---|:---|:---|:---|
| 01 | **Pan de Molde** | 10 unidades | \$10.00 | \$1.00 | **\$2.50** | 12 unidades |
| 02 | **Leche Entera** | 10 unidades | \$8.00 | \$0.80 | **\$1.80** | 10 unidades |
| 03 | **Café Molido** | 5 unidades | \$17.50 | \$3.50 | **\$7.00** | 8 unidades |
| 04 | **Refresco de Cola** | 15 unidades | \$7.50 | \$0.50 | **\$1.50** | 15 unidades |
| 05 | **Cerveza Artesana** | 12 unidades | \$14.40 | \$1.20 | **\$3.00** | 12 unidades |
| 06 | **Aperitivos (Patatas)**| 10 unidades | \$4.00 | \$0.40 | **\$1.20** | 10 unidades |

---

## 10. Aspectos Visuales y Diseño de la Interfaz (UI)

La UI y los textos de los menús deben utilizar fuentes pixeladas (estilo *Retro Pixel*) y marcos con bordes de estilo menú de RPG clásico (márgenes oscuros con un filete blanco).

### Elementos de Feedback en Pantalla (UI Contextual)
Para mantener la inmersión retro, la información flotante se integra con burbujas de diálogo e iconos pixelados (*Emotes*):
* **Barras de Llenado:** Los estantes muestran de forma fija un pequeño marcador visual pixelado en su base (Ej. `[IIIIII....] 6/10`) que cambia de color a amarillo cuando el stock baja del 30%, y a rojo parpadeante cuando está a cero.
* **Bocadillos de Emoción (Pop-up Balloons / Emotes):** Iconos de 16x16 píxeles que emergen sobre las cabezas de los personajes:
  * 🛒 **Cesta de la compra:** Buscando artículos de forma normal.
  * ❌ **Producto Tachado:** Frustración por estante vacío.
  * 💔 **Moneda Rota:** Cliente enfadado por un precio excesivamente caro.
  * ⏳ **Reloj de Arena:** Paciencia de espera en cola agotándose críticamente.

---

## 11. Especificación de Sprites y Animaciones (Pixel Art)

Para recrear el estilo RPG clásico (estilo Pokémon), el motor del juego renderizará los gráficos divididos en dos grandes categorías: **Tilesets** (entorno estático) y **Spritesheets** (entidades dinámicas y animadas). Todas las texturas deben dibujarse escaladas a una rejilla base (Grid) donde **1 Casilla = 32x32 píxeles** (o 16x16 duplicado por software a $\times 2$).

### A. Estructura de Spritesheets para Personajes (Jugador y Clientes)
Cada personaje requiere un archivo de imagen ordenado en una matriz de movimientos direccionales de 4 vías (Abajo, Izquierda, Derecha, Arriba).

#### 1. El Jugador (Tendero)
Necesita 3 hojas de sprites independientes dependiendo de su estado de carga:
* **Sprite Jugador Normal (Libre):** Animación de IDLE (parado, 1 frame) y de CAMINAR (3 frames por dirección). Total: 12 frames.
* **Sprite Jugador Cargando Caja:** Variación de los frames anteriores donde los brazos del personaje se muestran extendidos hacia el frente sosteniendo una caja de cartón marrón de píxeles.
* **Sprite Jugador con Caja Vacía:** Variación donde sostiene una caja aplastada y arrugada antes de tirarla al contenedor de reciclaje.

#### 2. Los Clientes (Múltiples Variaciones)
Para evitar la monotonía visual, se deben diseñar al menos **3 variaciones de diseño de cliente** (ej. Cliente Joven, Cliente Anciano, Cliente Ejecutivo), compartiendo la misma estructura de animaciones:
* **Caminar Normal:** 3 frames por dirección (Abajo, Izquierda, Derecha, Arriba).
* **Caminar con Cesta (Shopping):** El personaje se desplaza mostrando un sprite de una cesta en su mano lateral. La cesta cambia de textura interna (vacía, medio llena, llena) según los artículos adquiridos.
* **Animación de Huida / Enfadado:** Animación de caminar pero configurada a doble velocidad de fotogramas por segundo cuando abandonan el local descontentos.

Estructura de Animación de Personaje (Matriz Típica RPG):
Fila 1: [Abajo Frame 1]  [Abajo Frame 2 (IDLE)]  [Abajo Frame 3]
Fila 2: [Izquierda F1]  [Izquierda F2 (IDLE)]  [Izquierda F3]
Fila 3: [Derecha F1]    [Derecha F2 (IDLE)]    [Derecha F3]
Fila 4: [Arriba F1]     [Arriba F2 (IDLE)]     [Arriba F3]


### B. El Tileset de la Tienda (Mobiliario y Entorno)
Un único mapa de bits ordenado que contiene todos los bloques de construcción del entorno. Cada elemento ocupa múltiplos exactos de 32x32 píxeles.

#### 1. Suelos y Paredes (Estructura)
* **Mosaico de Suelo Comercial:** Textura clara y repetible (beige o gris claro) de 32x32.
* **Suelo Industrial de Almacén:** Textura de hormigón gris oscuro con líneas diagonales de seguridad amarillas y negras en sus bordes de unión.
* **Paredes:** Bloques superiores que bloquean el paso, simulando los muros de la tienda.

#### 2. Mobiliario Interactivo
* **Estante de Productos Comunes (Ancho: 32px, Alto: 64px):** Vista desde arriba de una estantería de madera o metal. Debe contar con **4 variaciones visuales por producto asignado** según su stock interno:
  * *Sprite Vacío:* Solo se ve la balda metálica gris.
  * *Sprite Stock Bajo:* Un par de píxeles de color representando productos sueltos.
  * *Sprite Stock Medio:* Filas de productos visibles a medio llenar.
  * *Sprite Stock Lleno:* Estantería completamente colorida y repleta.
* **Mueble de Caja Registradora (64x32px):** Una cinta transportadora pixelada con un terminal de pantalla azul. El jugador se posiciona arriba (mirando abajo) y el cliente se posiciona a la derecha (mirando a la izquierda).
* **Contenedor de Reciclaje (32x32px):** Un contenedor de color azul o verde para tirar las cajas de cartón usadas.
* **Mesa de Oficina con Ordenador (64x32px):** Ubicado en el almacén; es el punto de interacción para abrir la UI de pedidos y licencias.
* **Palés de Descarga (32x32px por palé):** Estructura de madera en el suelo donde se van apilando visualmente sprites de cajas de cartón cerradas a medida que llegan los camiones de reparto.