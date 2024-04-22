const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Stockage des connexions des utilisateurs par salle
const roomConnections = {};

// Écoute des connexions Socket.IO
io.on("connection", (socket) => {
  console.log("Nouvelle connexion socket");

  // Gestion de la connexion à une salle spécifique
  socket.on("joinRoom", (roomId) => {
    // Joindre la salle correspondante
    socket.join(roomId);
    // Enregistrement de la connexion dans la salle correspondante
    if (!roomConnections[roomId]) {
      roomConnections[roomId] = [];
    }
    roomConnections[roomId].push(socket);
    console.log(`Socket ${socket.id} a rejoint la salle ${roomId}`);
  });

  // Gestion des messages
  socket.on("chat message", (msg) => {
    // Récupérer la salle à partir de la socket
    const roomId = Object.keys(socket.rooms)[0];
    console.log(`Message reçu dans la salle ${roomId}: ${msg}`);
    // Émettre le message à tous les sockets dans la salle spécifique
    if (roomId) {
      io.to(roomId).emit("chat message", msg);
    }
  });

  // Gestion de la déconnexion
  socket.on("disconnect", () => {
    // Supprimer la connexion de la salle correspondante
    Object.keys(roomConnections).forEach((roomId) => {
      roomConnections[roomId] = roomConnections[roomId].filter(
        (conn) => conn !== socket
      );
    });
  });
});

// Définir une route pour la salle dynamique
app.get("/room/:id", (req, res) => {
  const roomId = req.params.id;
  // Envoyer une réponse HTML ou renvoyer un fichier HTML correspondant à la salle
  res.sendFile(__dirname + "/pages/room.html"); // Vous devez créer ce fichier HTML
});

// Démarre le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO démarré sur le port ${PORT}`);
});
