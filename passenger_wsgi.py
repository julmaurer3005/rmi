import sys
import os

# Adiciona o diretório atual ao sys.path para importações locais funcionarem corretamente
sys.path.insert(0, os.path.dirname(__file__))

# O Passenger WSGI espera que o objeto chamável da aplicação se chame 'application'
from app import app as application
