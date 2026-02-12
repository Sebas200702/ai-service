#!/bin/bash

# Inicializar el repositorio si no existe
if [ ! -d ".git" ]; then
    git init
    echo "Repositorio Git inicializado."
fi

# Añadir archivos y hacer commit
git add .
git commit -m "Initial commit"

# Instrucciones para el usuario
echo "Para subir el código, ejecuta los siguientes comandos reemplazando con tu URL:"
echo "git remote add origin <TU_URL_DE_GITHUB>"
echo "git branch -M main"
echo "git push -u origin main"
