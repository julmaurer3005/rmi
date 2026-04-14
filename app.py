import sys
import os
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
        nome_arquivo, total_sucesso = gerar_relatorio(data_input)
        return jsonify({
            "success": True, 
            "message": f"Relatório gerado concluído! {total_sucesso} notícia(s) incluída(s).",
            "file_url": f"/download/{os.path.basename(nome_arquivo)}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download/<filename>')
def download(filename):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({"error": "Arquivo não encontrado."}), 404

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
