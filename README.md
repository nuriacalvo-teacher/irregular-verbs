# 🇪🇸 Irregular Verbs - Learning App

## Descripción
App interactiva para aprender verbos irregulares en inglés con 3 ejercicios, autenticación, leaderboard integrado con Google Sheets y pantalla final con resultados.

## Archivos
- `index.html` - Archivo principal (contiene HTML, CSS y JavaScript)
- Requiere una URL de Google Apps Script para guardar resultados

## Configuración
1. Reemplaza `YOUR_SCRIPT_ID` en `index.html` con tu ID de Google Apps Script
2. El código de acceso es: `nuriaLEGEND`

## Características
✅ 3 ejercicios (50 preguntas cada uno)
✅ Pantalla final con felicitaciones/ánimos
✅ Envío automático a Google Sheets
✅ Leaderboard en tiempo real
✅ Guardado de progreso
✅ Interfaz responsive

## Google Apps Script
El script debe tener un método `doPost(e)` que:
- Reciba los datos: date, firstName, lastName, course, score (0-100), time (segundos)
- Escriba en una hoja de cálculo
- Devuelva un JSON con `{success: true}`