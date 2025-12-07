#!/bin/bash

echo "==============================================="
echo "   TravelShip - Lancement de l'application"
echo "==============================================="
echo ""

echo "[1/3] Vérification de MongoDB..."
echo "Si vous utilisez MongoDB local, assurez-vous qu'il est lancé (mongod)"
echo "Si vous utilisez MongoDB Atlas, ignorez ce message"
echo ""
sleep 2

echo "[2/3] Démarrage du Backend (Port 5000)..."
cd backend
gnome-terminal -- bash -c "npm run dev; exec bash" &
cd ..
sleep 3

echo "[3/3] Démarrage du Frontend (Port 3000)..."
cd frontend
gnome-terminal -- bash -c "npm run dev; exec bash" &
cd ..
sleep 2

echo ""
echo "==============================================="
echo "   Application lancée avec succès !"
echo "==============================================="
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Ouvrez votre navigateur sur http://localhost:3000"
echo ""
echo "Pour arrêter l'application, fermez les fenêtres de terminal"
echo "==============================================="
