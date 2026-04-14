document.addEventListener("DOMContentLoaded", () => {
    // Navigation
    const navRelatorio = document.getElementById('nav-relatorio');
    const navFontes = document.getElementById('nav-fontes');
    const secRelatorio = document.getElementById('section-relatorio');
    const secFontes = document.getElementById('section-fontes');

    navRelatorio.addEventListener('click', (e) => {
        e.preventDefault();
        navRelatorio.classList.add('active');
        navFontes.classList.remove('active');
        secRelatorio.classList.add('active-panel');
        secFontes.classList.remove('active-panel');
    });

    navFontes.addEventListener('click', (e) => {
        e.preventDefault();
        navFontes.classList.add('active');
        navRelatorio.classList.remove('active');
        secFontes.classList.add('active-panel');
        secRelatorio.classList.remove('active-panel');
        loadFontes();
    });

    // Report Generation
    const btnGerar = document.getElementById('btn-gerar');
    const dataInput = document.getElementById('data-input');
    const loadingArea = document.getElementById('loading-area');
    const resultArea = document.getElementById('result-area');
    const resultMessage = document.getElementById('result-message');
    const downloadLink = document.getElementById('download-link');

    btnGerar.addEventListener('click', async () => {
        const dataVal = dataInput.value.trim();
        if(!dataVal) {
            alert("Por favor, digite a data para o relatório.");
            return;
        }

        btnGerar.disabled = true;
        resultArea.classList.add('hidden');
        loadingArea.classList.remove('hidden');

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dataVal })
            });
            const result = await res.json();
            
            loadingArea.classList.add('hidden');
            btnGerar.disabled = false;

            if (res.ok) {
                resultMessage.innerText = result.message;
                downloadLink.href = result.file_url;
                resultArea.classList.remove('hidden');
            } else {
                alert("Erro: " + (result.error || "Falha na geração."));
            }
        } catch (error) {
            loadingArea.classList.add('hidden');
            btnGerar.disabled = false;
            alert("Erro de comunicação com o servidor.");
            console.error(error);
        }
    });

    // Fontes Management
    const tbody = document.getElementById('fontes-tbody');
    const btnAddFonte = document.getElementById('btn-add-fonte');
    const btnSalvar = document.getElementById('btn-salvar-fontes');
    let fontesData = [];

    async function loadFontes() {
        try {
            const res = await fetch('/api/fontes');
            fontesData = await res.json();
            renderTable();
        } catch (error) {
            console.error("Erro ao carregar fontes", error);
        }
    }

    function renderTable() {
        tbody.innerHTML = '';
        fontesData.forEach((fonte, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" value="${fonte.nome}" data-field="nome" data-idx="${index}"></td>
                <td><input type="text" value="${fonte.tipo}" data-field="tipo" data-idx="${index}" placeholder="rss ou site"></td>
                <td><input type="text" value="${fonte.url}" data-field="url" data-idx="${index}"></td>
                <td><button class="btn remove-btn" data-idx="${index}">Deletar</button></td>
            `;
            tbody.appendChild(tr);
        });
        
        // Listeners for inputs changing
        const inputs = tbody.querySelectorAll('input');
        inputs.forEach(inp => {
            inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                const field = e.target.getAttribute('data-field');
                fontesData[idx][field] = e.target.value;
            });
        });

        // Listeners for remove buttons
        const rmvBtns = tbody.querySelectorAll('.remove-btn');
        rmvBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                fontesData.splice(idx, 1);
                renderTable();
            });
        });
    }

    btnAddFonte.addEventListener('click', () => {
        fontesData.push({ nome: "", tipo: "site", url: "https://" });
        renderTable();
    });

    btnSalvar.addEventListener('click', async () => {
        const btnText = btnSalvar.innerText;
        btnSalvar.innerText = "Salvando...";
        
        try {
            const res = await fetch('/api/fontes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fontesData)
            });
            
            if(res.ok) {
                alert("Fontes salvas com sucesso!");
            } else {
                alert("Falha ao salvar fontes.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao enviar dados.");
        } finally {
            btnSalvar.innerText = btnText;
        }
    });
});
