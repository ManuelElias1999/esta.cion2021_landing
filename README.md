# Estación de uñas · by Dani Velasquez

Landing page de **Estación de uñas**, especialista en uñas acrílicas en Cochabamba, Bolivia.

- **Mano interactiva** (foto real con uñas pintadas en SVG) en la portada: al pasar el cursor (o tocar) cada uña se pinta con un diseño distinto: borgoña foil, francesa dorada, mármol y oro y baby boomer floral.
- **Reservas**: servicio, fecha, hora (bloques de 1 h 30 min) y confirmación por WhatsApp.
- **Colección de diseños**, **menú de servicios**, **tienda** con carrito (pedido por WhatsApp), redes y mapa.

Sitio estático (HTML + CSS + JS), sin dependencias. Para verlo en local:

```bash
python3 -m http.server 8080   # y abre http://localhost:8080
```

## Editar contenido
Al inicio de `app.js`:
- `HORARIOS`: horas de inicio por día.
- `SERVICIOS` y `PRODUCTOS`: nombres, descripciones y precios (`null` = "Consultar").
- `WHATSAPP`: número para reservas y pedidos.

Los diseños de uñas y la mano están en `hand.js`.

## Créditos
Foto de la mano: [Flowers on Fingers (Unsplash)](https://commons.wikimedia.org/wiki/File:Flowers_on_Fingers_(Unsplash).jpg), dominio público (CC0).
