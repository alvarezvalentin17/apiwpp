const express = require("express");
const bodyParser = require("body-parser");
const qrcode = require("qrcode");
const cors = require("cors");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  authStrategy: new LocalAuth(),
});

let generatedQRCode = null; // Almacena el código QR generado como base64

// Manejar el evento de nuevo QR
client.on("qr", async (qr) => {
  try {
    // Generar el código QR como base64
    generatedQRCode = await qrcode.toDataURL(qr, { type: "png", small: true });

    // Imprimir mensaje en consola
    console.log("Código QR generado como base64");
  } catch (error) {
    console.error("Error al generar el código QR como base64:", error);
  }
});

// Manejar el evento de autenticación y guardar la sesión
client.on("authenticated", (session) => {
  console.log("Autenticado");
});

client.initialize();

// Endpoint para obtener el código QR como base64
app.get("/qrcode", (req, res) => {
  // Devolver el código QR como respuesta
  if (generatedQRCode) {
    res.send(generatedQRCode);
  } else {
    res.status(404).send("Código QR no disponible");
  }
});

// Endpoint para enviar mensajes
app.post("/enviar-mensaje", async (req, res) => {
  try {
    const { numero, mensaje } = req.body;

    if (!numero || !mensaje) {
      return res
        .status(400)
        .json({ error: "Número y mensaje son obligatorios" });
    }

    // Obtener el objeto Chat para el número de teléfono deseado
    const chat = await client.getChatById(`598${numero}@c.us`);

    // Enviar un mensaje al chat
    await chat.sendMessage(mensaje);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
