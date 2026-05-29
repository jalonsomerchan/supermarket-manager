# agents.md

## Regla principal

Este repositorio contiene una aplicación web estática HTML/CSS/JavaScript que debe mantenerse ligera, modular, mantenible y preparada para desplegarse correctamente en GitHub Pages.

Las reglas de este archivo son obligatorias. Todo agente, asistente IA o automatización que modifique este repositorio debe leerlas, aplicarlas y comprobarlas antes de terminar cualquier tarea.

Antes de modificar páginas, estilos, JavaScript, assets, documentación o despliegue, el agente debe consultar estas guías cuando existan:

- `docs/file-inventory.md`

## Prioridad

Estas instrucciones tienen prioridad sobre patrones antiguos, preferencias implícitas o soluciones rápidas, salvo que el usuario indique expresamente lo contrario.

Si existe conflicto entre una tarea y estas reglas, el agente debe cumplir la petición del usuario en la medida posible, mantener el proyecto pequeño y modular, y explicar cualquier excepción relevante en el resumen final.

## Principios obligatorios

- Mobile first.
- Diseño profesional, limpio, moderno y vistoso.
- No usar fuentes externas de Google Fonts, Adobe Fonts ni CDNs similares.
- Usar system fonts.
- Evitar dependencias innecesarias.
- Cuidar Core Web Vitals.
- HTML semántico.
- Buen SEO técnico cuando aplique.
- Accesibilidad mínima WCAG AA.
- JavaScript modular con responsabilidades claras.
- Variables CSS globales para colores, radios, sombras, espaciados y transiciones.
- Mantener compatibilidad con GitHub Pages.
- Mantener compatibilidad con despliegues en dominio raíz (`/`) y en subruta (`/nombre-del-repositorio/`).
- Mantener comprobaciones simples y útiles.
- Mantener los ficheros lo más pequeños posible.
- Dividir el código por responsabilidad cuando un fichero crezca demasiado.
- Seguir estándares de calidad, legibilidad, modularidad y mantenibilidad.

## Reglas obligatorias para agentes e IA

Todo agente IA debe aplicar estas reglas en cualquier cambio:

1. Respetar siempre este archivo y la documentación de `docs/`.
2. Consultar `docs/file-inventory.md` antes de tocar la estructura del proyecto.
3. No generar soluciones monolíticas si pueden dividirse en módulos, helpers, constantes o ficheros pequeños.
4. No añadir dependencias si la solución puede hacerse razonablemente con HTML, CSS, JavaScript moderno o APIs nativas del navegador.
5. No romper rutas relativas, assets, despliegue en raíz/subruta, GitHub Pages, accesibilidad ni comprobaciones existentes.
6. No eliminar comprobaciones para ocultar problemas: corregir el código o actualizar la comprobación de forma robusta.
7. No duplicar lógica si puede centralizarse.
8. No crear ficheros grandes por comodidad; preferir piezas pequeñas con nombres claros.
9. Documentar cualquier convención nueva que afecte al uso o mantenimiento del proyecto.
10. Actualizar `docs/file-inventory.md` siempre que se añada, elimine, renombre o mueva cualquier fichero del repositorio.

## Regla crítica sobre el índice de ficheros

Cada vez que se añada un fichero nuevo al repositorio, sea de código, documentación, configuración, workflow, asset o cualquier otro tipo, el mismo cambio debe actualizar también `docs/file-inventory.md` para incluirlo en el índice con una descripción clara de su utilidad.

No se debe abrir ni terminar una PR que añada ficheros nuevos sin esa actualización del índice. Si un fichero nuevo es temporal o generado y no debe versionarse, no debe añadirse al repositorio.

## Reglas obligatorias para crear issues

Cuando un agente IA cree issues en este repositorio, cada issue debe incluir siempre un prompt accionable para solucionarla.

Ese prompt debe cumplir estas condiciones:

- Hacer referencia explícita a este repositorio e incluir su URL.
- Explicar con claridad qué problema, mejora o tarea debe resolverse.
- Indicar que la solución debe respetar todas las condiciones de este `agents.md`.
- Indicar que se deben mantener ficheros pequeños, modularidad, accesibilidad, SEO cuando aplique, rendimiento y compatibilidad con dominio raíz, subrutas y GitHub Pages.
- Pedir que se actualicen comprobaciones y documentación cuando el cambio lo requiera.
- Evitar instrucciones ambiguas sin contexto suficiente.

Formato recomendado:

```md
## Prompt para resolver esta issue

Trabaja en este repositorio: [añade aquí la URL del repositorio].

Resuelve esta issue manteniendo todas las condiciones descritas en `agents.md`: ficheros lo más pequeños posible, código modular, accesibilidad, SEO cuando aplique, rendimiento, compatibilidad con dominio raíz (`/`), subrutas (`/nombre-del-repositorio/`) y GitHub Pages, además de comprobaciones útiles.

[Describe aquí la tarea concreta, el comportamiento esperado y los ficheros o zonas afectadas si se conocen.]

Actualiza comprobaciones y documentación si el cambio modifica comportamiento, arquitectura, rutas, estilos, assets o convenciones del proyecto.
```

Toda issue creada por IA debe ser lo bastante clara como para que otro agente pueda resolverla sin pedir contexto adicional.

Si el usuario pide crear varias issues, cada issue debe ser independiente, accionable y resoluble por otro agente sin depender de contexto externo no incluido en la propia issue.

Si una tarea es grande, dividirla en varias issues o PRs pequeñas, cada una con un objetivo verificable.

## Reglas para trabajar con GitHub API

Cuando un agente IA trabaje con este repositorio mediante GitHub API, debe priorizar cambios pequeños, trazables y fáciles de revisar.

### Antes de modificar código

El agente debe:

1. Identificar la rama base correcta, normalmente `main`.
2. Revisar la estructura del repositorio antes de proponer cambios.
3. Leer los ficheros relevantes antes de editarlos.
4. Comprobar si ya existe una issue, PR o rama relacionada.
5. Evitar cambios masivos si la tarea puede resolverse con cambios pequeños.

### Ramas y pull requests

- Crear una rama nueva por cada tarea o grupo de tareas relacionadas.
- Usar nombres de rama descriptivos, por ejemplo `docs-file-inventory`, `add-pages-deploy` o `improve-mobile-controls`.
- No trabajar directamente sobre `main`, salvo que el usuario lo pida expresamente.
- Abrir una PR con resumen claro de cambios.
- La PR debe indicar qué se ha cambiado, por qué, qué ficheros principales se han tocado, cómo probarlo y si se han actualizado comprobaciones o documentación.

### Commits

- Hacer commits pequeños y coherentes.
- No mezclar cambios no relacionados en el mismo commit.
- Usar mensajes de commit claros, en imperativo y con contexto.
- Evitar commits genéricos como `fix`, `changes`, `update` o `wip`.

### Edición de ficheros

- Leer siempre el fichero actual antes de actualizarlo.
- No sobrescribir ficheros enteros si basta con un cambio localizado.
- Conservar estilo, estructura y convenciones existentes.
- Evitar reordenar código sin necesidad, porque dificulta revisar el diff.
- No borrar comentarios útiles, documentación o comprobaciones salvo que estén obsoletos y se justifique.

### Estrategia recomendada para editar ficheros grandes con GitHub API

- Para ficheros pequeños o medianos, usar `update_file` o `create_blob` con el contenido final completo.
- Para ficheros grandes, evitar reescrituras completas cuando sea posible.
- Hacer cambios localizados sobre ficheros existentes, conservando el resto intacto.
- No crear ficheros auxiliares solo para esquivar limitaciones de la herramienta.
- Si un fichero grande necesita una modificación compleja, preferir dividir antes por arquitectura real: módulos, datos, helpers o componentes con responsabilidad clara.
- Si una llamada falla por tamaño o bloqueo, intentar:
  1. Reducir el cambio al mínimo.
  2. Crear blobs por fichero, no muchos ficheros en una sola llamada.
  3. Separar el cambio en commits pequeños.
  4. Mantener el resultado final previsto, sin meter workarounds raros.

### Pull requests creadas mediante GitHub API

Toda PR creada por IA debe incluir:

```md
## Cambios

- [Cambio principal 1]
- [Cambio principal 2]

## Motivo

[Explica por qué se hizo el cambio.]

## Cómo probarlo

```sh
npm run check
python3 -m http.server 8092
```

## Notas

[Indica limitaciones, decisiones técnicas o cosas no verificadas.]
```

### Búsquedas y contexto

Cuando el agente necesite entender el proyecto, debe buscar primero por:

- nombres de módulos,
- rutas,
- funciones,
- IDs de elementos HTML,
- clases CSS,
- rutas de assets,
- configuración en `js/config.js`,
- estructura documentada en `docs/file-inventory.md`.

No debe asumir que un fichero existe sin comprobarlo.

### Seguridad

- No incluir tokens, secretos, claves API ni credenciales en commits, issues o PRs.
- No imprimir valores de variables de entorno sensibles.
- No crear ficheros `.env` reales; usar `.env.example` para documentación si algún día hiciera falta.
- No añadir permisos amplios a workflows de GitHub Actions si no son necesarios.
- No modificar configuración de despliegue sin explicar el impacto.

### Automatización y CI

- Si se toca JavaScript, intentar mantener o actualizar `npm run check`.
- Si se toca routing o carga de assets, comprobar compatibilidad con rutas relativas, dominio raíz, subrutas y GitHub Pages.
- Si se toca UI, comprobar responsive y accesibilidad básica.
- Si se añaden ficheros nuevos, comprobar que `docs/file-inventory.md` se ha actualizado en el mismo cambio.
- Si no se pueden ejecutar comprobaciones, indicarlo claramente en la PR.

### Criterio general

El objetivo de usar GitHub API no es solo cambiar ficheros, sino dejar un historial claro: issue entendible, rama concreta, commits pequeños, PR revisable y explicación suficiente para continuar el trabajo más tarde.

## Tamaño y modularidad de ficheros

Los ficheros deben mantenerse lo más pequeños posible sin sacrificar claridad.

Buenas prácticas obligatorias:

- Un fichero debe tener una responsabilidad principal.
- Extraer constantes compartidas a `js/config.js` o a módulos pequeños cuando el crecimiento lo justifique.
- Extraer helpers reutilizables a `js/utils/`.
- Extraer lógica de juego a `js/systems/` o `js/entities/` según corresponda.
- Mantener la interfaz en módulos de `js/ui/` cuando crezca.
- Evitar duplicar bloques grandes de HTML, CSS o JavaScript.
- Mantener los estilos globales para tokens, resets y utilidades realmente globales.
- Mantener los estilos específicos agrupados y con nombres claros.

Guía orientativa:

- Si un módulo supera aproximadamente 200 líneas, valorar dividirlo.
- Si un helper mezcla varias responsabilidades, separarlo.
- Si una pantalla contiene mucha UI repetible, mover esa UI a funciones o módulos específicos.
- Si una lista de datos crece, moverla a configuración o datos separados.

La prioridad es claridad, reutilización y mantenimiento.

## Estándares de calidad

Todo cambio debe cumplir estos estándares:

- Código claro, simple y fácil de revisar.
- Nombres descriptivos para clases, funciones, constantes y ficheros.
- Sin lógica duplicada innecesaria.
- Sin código muerto, comentarios obsoletos ni comprobaciones desactivadas sin motivo.
- Sin hacks frágiles si existe una solución estable.
- Sin dependencias pesadas para tareas simples.
- Sin JavaScript de cliente innecesario si HTML/CSS lo resuelve bien.
- Accesibilidad básica: labels, textos alternativos, foco visible, contraste y estructura semántica.
- SEO básico: título, descripción, etiquetas sociales y estructura HTML correcta cuando aplique.
- Rendimiento: evitar assets pesados, scripts innecesarios y bloqueos de render.

## Arquitectura actual

El proyecto actual usa:

- HTML estático como punto de entrada.
- CSS global en `css/styles.css`.
- JavaScript modular ES Modules en `js/`.
- Canvas 2D para el renderizado del juego.
- Assets PNG locales en `assets/sprites/`.
- Persistencia local mediante `localStorage`.
- GitHub Actions para desplegar en GitHub Pages.
- Comprobación básica de sintaxis JavaScript mediante `npm run check`.

## Estructura importante

- `docs/file-inventory.md`: inventario de ficheros actuales y utilidad de cada uno. Debe actualizarse cuando se añadan, eliminen o muevan ficheros relevantes.
- `.github/workflows/pages.yml`: despliegue automático en GitHub Pages desde `main`.
- `package.json`: scripts del proyecto, especialmente `npm run check` y `npm run serve`.
- `index.html`: entrada HTML, estructura base, canvas y carga de `js/main.js`.
- `css/styles.css`: estilos globales, paneles, HUD, modales, controles táctiles y responsive.
- `js/main.js`: arranque de la aplicación.
- `js/config.js`: configuración central de mundo, controles, sprites, mapa, productos, licencias, mejoras, jugador y clientes.
- `js/game.js`: orquestador del bucle de juego.
- `js/assets.js`: carga de imágenes.
- `js/input.js`: teclado y controles táctiles.
- `js/state.js`: estado inicial del juego.
- `js/entities/`: entidades de jugador y clientes.
- `js/systems/`: render, mundo, pedidos, economía y guardado.
- `js/ui/`: interfaz y modales.
- `js/utils/`: utilidades matemáticas y pathfinding.
- `assets/sprites/`: sprites locales del juego.

## Reglas para modificar el proyecto

### No romper rutas, dominio raíz, subrutas ni GitHub Pages

El proyecto debe funcionar tanto si se aloja en la raíz de un dominio (`https://example.com/`) como si se aloja en una subruta (`https://example.com/proyecto/`, GitHub Pages u otro hosting similar).

Usar rutas relativas para assets y módulos cuando sea posible, como `css/styles.css`, `js/main.js` o `assets/sprites/...`.

No crear enlaces internos o assets con rutas absolutas duras tipo `/archivo.png`, `/assets/...` o `/ruta/` si deben funcionar dentro de una subcarpeta.

Antes de terminar cualquier cambio que afecte a rutas, assets, navegación o despliegue, comprobar mentalmente ambos escenarios:

- dominio raíz: `base = '/'`.
- subruta: `base = '/nombre-del-repositorio/'`.

### Mantener controles y experiencia jugable

Cuando se toque lógica de juego, entrada, UI o canvas:

- Mantener teclado y controles táctiles funcionando.
- Evitar bloquear el hilo principal con cálculos pesados.
- Mantener estados de pausa, modales y acciones consumibles de forma coherente.
- No romper guardado/carga en `localStorage` salvo que se migre de forma explícita.

### No añadir dependencias sin necesidad

Evitar librerías nuevas salvo que la tarea lo requiera claramente. Preferir HTML, CSS, JavaScript moderno y APIs del navegador.

### Mantener documentación actualizada

Si se cambia una convención importante, actualizar el documento correspondiente en `docs/` y, si afecta a agentes IA, también este archivo.

Si se añaden, eliminan, renombran o mueven ficheros relevantes, actualizar `docs/file-inventory.md`.

Si se añade cualquier fichero nuevo al repositorio, `docs/file-inventory.md` debe actualizarse en el mismo commit o PR para incluir ese fichero y su utilidad.

## Checklist antes de terminar una tarea

- ¿Se han aplicado las reglas de este `agents.md`?
- ¿Se revisó `docs/file-inventory.md` si el cambio afecta a estructura o ficheros?
- ¿El proyecto sigue funcionando con rutas relativas en raíz y subruta?
- ¿Los assets y módulos siguen cargando en GitHub Pages?
- ¿Los ficheros modificados siguen siendo pequeños y con una responsabilidad clara?
- ¿Se ha evitado duplicar lógica o UI?
- ¿El código cumple estándares de calidad, accesibilidad, SEO cuando aplique y rendimiento?
- ¿Se mantiene `npm run check` como comprobación básica?
- ¿Todo fichero nuevo añadido en la PR aparece también en `docs/file-inventory.md` con una descripción de utilidad?
- ¿Se actualizó `docs/file-inventory.md` si cambió la estructura?
- ¿Se actualizó la documentación si cambió una convención?

## Comandos útiles

```sh
npm run check
npm run serve
```

## Qué evitar

- Convertir el proyecto en algo difícil de reutilizar o mantener.
- Añadir frameworks de UI pesados sin necesidad.
- Usar rutas absolutas que fallen en despliegues con subruta o GitHub Pages.
- Borrar comprobaciones porque parezcan simples.
- Usar fuentes externas.
- Añadir JavaScript innecesario si HTML/CSS lo resuelve bien.
- Crear ficheros enormes con varias responsabilidades.
- Añadir ficheros nuevos sin registrarlos en `docs/file-inventory.md`.
- Crear issues sin prompt accionable para resolverlas.
- Ignorar este archivo por rapidez.
