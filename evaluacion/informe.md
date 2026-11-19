# Evaluación de la clasificación de frases

- Fecha: 19/11/2026, 5:20:03 p. m.
- Proveedores: Gemini
- Frases evaluadas: 40 (con respuesta válida: 40; sin respuesta: 0)

**Exactitud (4 clases): 97.5 %** (39 de 40)
**Literal vs. no literal: 97.5 %**

## Por clase

| Clase | Frases | Precisión | Exhaustividad | F1 |
|---|---|---|---|---|
| literal | 10 | 90.9 % | 100.0 % | 95.2 % |
| sarcasmo | 10 | 100.0 % | 100.0 % | 100.0 % |
| metafora | 10 | 100.0 % | 100.0 % | 100.0 % |
| ambigua | 10 | 100.0 % | 90.0 % | 94.7 % |

## Matriz de confusión (filas = etiqueta esperada, columnas = respuesta de la IA)

| esperado \ IA | literal | sarcasmo | metafora | ambigua |
|---|---|---|---|---|
| **literal** | 10 | 0 | 0 | 0 |
| **sarcasmo** | 0 | 10 | 0 | 0 |
| **metafora** | 0 | 0 | 10 | 0 |
| **ambigua** | 1 | 0 | 0 | 9 |

## Exactitud según la confianza que declara la IA

| Confianza | Frases | Exactitud |
|---|---|---|
| alta | 36 | 97.2 % |
| baja | 4 | 100.0 % |

## Errores

- **A08** «Juan golpeó a Pedro porque estaba enojado.»: esperado *ambigua*, la IA dijo *literal*

> Las etiquetas esperadas las propuso el equipo y deben ser revisadas por una persona con experiencia; en las frases ambiguas hay varias lecturas razonables.