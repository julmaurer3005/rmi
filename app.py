import sys
import os
import io
import json
from flask import Flask, request, jsonify, render_template, send_file
from main import gerar_relatorio

# Configura o diretório base para evitar problemas no Hostinger
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FONTES_PATH = os.path.join(BASE_DIR, "fontes.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

app = Flask(__name__)

# Garante que o diretório de output existe
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    data_input = data.get("date", "")
    
    if not data_input:
        return jsonify({"error": "Data não fornecida"}), 400
        
    try:
        buffer, nome_arquivo, total_sucesso = gerar_relatorio(data_input)
        return send_file(
            buffer,
            as_attachment=True,
            download_name=nome_arquivo,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/fontes', methods=['GET', 'POST'])
def manage_fontes():
    if request.method == 'GET':
        if not os.path.exists(FONTES_PATH):
            return jsonify([])
        with open(FONTES_PATH, "r", encoding="utf-8") as f:
            fontes = json.load(f)
        return jsonify(fontes)
        
    elif request.method == 'POST':
        novas_fontes = request.json
        with open(FONTES_PATH, "w", encoding="utf-8") as f:
            json.dump(novas_fontes, f, indent=4, ensure_ascii=False)
        return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
