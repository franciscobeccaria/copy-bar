# copy-bar

Un mod de Claude Code para copiar con un click. Hacés click sobre un bloque de código o una URL en la respuesta de Claude y queda en el portapapeles, entero. No agrega botones ni nada en pantalla: el texto mismo es el botón.

## Instalación

En una sesión de Claude Code:

```
/plugin install copy-bar --marketplace franciscobeccaria/copy-bar
```

Respondé `y` para agregar el marketplace y elegí el alcance con Enter.

Desde la terminal:

```
claude plugin install copy-bar --marketplace franciscobeccaria/copy-bar
```

## Requisito: modo pantalla completa

Claude Code solo recibe clicks en su modo pantalla completa. Activalo en `/config` o con esta línea en `~/.claude/settings.json`, y reiniciá Claude Code:

```json
"tui": "fullscreen"
```

## Uso

- **Bloque de código:** un click en cualquier parte del bloque lo copia entero.
- **URL:** un click la copia. `cmd+click` la sigue abriendo en el navegador.
- **Sin mouse:** `/cp 2` copia el ítem 2 de la última respuesta (bloques de código, rutas y comandos entre backticks, y URLs, en ese orden).

El doble click y el arrastre siguen seleccionando texto como siempre.

## Limitaciones

- El texto entre backticks dentro de un párrafo no se copia con click: en terminales sin links clickeables (como Terminal.app) el link quedaría visible al lado del texto. Para eso está `/cp`.
- Los bloques de código se dibujan en un solo color, sin resaltado de sintaxis.

## Licencia

MIT
