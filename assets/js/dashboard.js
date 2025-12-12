// Dashboard de Professores - Gerenciamento de Alunos
(function() {
    // Utilitários de normalização e verificação
    function normalizarTexto(txt) {
        return (txt || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function existeAluno(nome, turma) {
        const n = normalizarTexto(nome);
        const t = normalizarTexto(turma);
        return obterAlunos().some(a => normalizarTexto(a.nome) === n && normalizarTexto(a.turma) === t);
    }
    // Verificar se o professor está logado
    function verificarAutenticacao() {
        const logado = localStorage.getItem('professorLogado');
        if (!logado) {
            window.location.href = 'area_profs.html';
        }
        // Exibir papel na UI
        const role = localStorage.getItem('professorRole') || 'professor';
        const nome = localStorage.getItem('professorNome') || '';
        const nav = document.querySelector('nav ul');
        if (nav) {
            const li = document.createElement('li');
            li.style.marginLeft = '12px';
            li.textContent = `Acesso: ${role === 'gestao' ? 'Pedagoga/Direção' : 'Professor'}${nome ? ' ('+nome+')' : ''}`;
            nav.appendChild(li);
        }

        // Ajustar visibilidade dos botões conforme role
        const btnNovo = document.getElementById('btn-novo-aluno');
        const btnMassa = document.getElementById('btn-inserir-massa');
        const badge = document.getElementById('gestao-only-badge');
        const thAcoes = document.querySelector('#tabela-alunos thead tr th:last-child');
        if (role !== 'gestao') {
            if (btnNovo) btnNovo.classList.add('hidden');
            if (btnMassa) btnMassa.classList.add('hidden');
            if (badge) {
                badge.classList.remove('hidden');
            }
            if (thAcoes) thAcoes.classList.add('hidden');
        } else {
            if (badge) badge.classList.add('hidden');
            if (thAcoes) thAcoes.classList.remove('hidden');
        }

        // Nota atribuída global: gestão edita, professor só visualiza
        const inputNotaGlobal = document.getElementById('nota-atribuida-global');
        const viewNotaGlobal = document.getElementById('nota-atribuida-view');
        const notaGlobal = obterNotaGlobal();
        if (role === 'gestao') {
            if (inputNotaGlobal) {
                inputNotaGlobal.classList.remove('hidden');
                inputNotaGlobal.value = notaGlobal === '' ? '' : notaGlobal;
                inputNotaGlobal.addEventListener('change', () => {
                    let val = inputNotaGlobal.value;
                    val = clampNotaGlobal(val);
                    inputNotaGlobal.value = val === '' ? '' : val; // refletir clamp
                    salvarNotaGlobal(val);
                    recomputarNotasComNotaGlobal();
                });
            }
            if (viewNotaGlobal) viewNotaGlobal.classList.add('hidden');
        } else {
            if (inputNotaGlobal) inputNotaGlobal.classList.add('hidden');
            if (viewNotaGlobal) {
                viewNotaGlobal.classList.remove('hidden');
                viewNotaGlobal.textContent = notaGlobal === '' ? '—' : formatNotaExibicao(notaGlobal);
            }
        }
    }

    // Inicializar na carga da página
    document.addEventListener('DOMContentLoaded', function() {
        verificarAutenticacao();
        carregarAlunos();
        inicializarEventos();
    });

    // Inicializar eventos
    function inicializarEventos() {
        // Botões de novo aluno e inserir em massa
        document.getElementById('btn-novo-aluno').addEventListener('click', () => {
            if (!podeGerenciar()) return;
            document.getElementById('form-individual').classList.remove('hidden');
        });

        document.getElementById('btn-cancelar-individual').addEventListener('click', () => {
            document.getElementById('form-individual').classList.add('hidden');
            document.getElementById('aluno-form').reset();
        });

        document.getElementById('btn-inserir-massa').addEventListener('click', () => {
            if (!podeGerenciar()) return;
            document.getElementById('modal-massa').classList.remove('hidden');
        });

        document.getElementById('btn-fechar-modal').addEventListener('click', () => {
            fecharModalMassa();
        });

        document.getElementById('btn-fechar-massa').addEventListener('click', () => {
            fecharModalMassa();
        });

        // Enviar formulário
        document.getElementById('aluno-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('nome').value.trim();
            const turma = document.getElementById('turma').value;

            if (nome && turma) {
                adicionarAluno(nome, turma);
                this.reset();
                document.getElementById('form-individual').classList.add('hidden');
            }
        });

        // Importar em massa
        document.getElementById('btn-importar').addEventListener('click', () => {
            importarEmMassa();
        });

        // Exportar CSV
        const btnExport = document.getElementById('btn-exportar-csv');
        if (btnExport) {
            btnExport.addEventListener('click', exportarCSV);
        }

        // Filtros e busca
        document.getElementById('filter-turma').addEventListener('change', () => {
            filtrarAlunos();
        });

        document.getElementById('search-aluno').addEventListener('input', () => {
            filtrarAlunos();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('professorLogado');
            localStorage.removeItem('professorEmail');
            localStorage.removeItem('professorNome');
            window.location.href = 'area_profs.html';
        });

        // Fechar modal ao clicar fora
        document.getElementById('modal-massa').addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalMassa();
            }
        });
    }

    function fecharModalMassa() {
        document.getElementById('modal-massa').classList.add('hidden');
        document.getElementById('textarea-massa').value = '';
    }

    // Adicionar um aluno
    function adicionarAluno(nome, turma) {
        if (!podeGerenciar()) return;
        if (existeAluno(nome, turma)) {
            mostrarMensagem(`Aluno "${nome}" já existe na turma ${turma}.`, 'error');
            return;
        }

        const alunos = obterAlunos();
        const id = Date.now();
        const notaGlobal = obterNotaGlobal();
        const novo = {
            id,
            nome,
            turma,
            participacao: 's/participação',
            desempenho: 'insatisfátorio',
            comportamento: 'insatisfátorio',
            nota: ''
        };
        novo.nota = calcularNota(novo, notaGlobal);
        alunos.push(novo);
        localStorage.setItem('alunos', JSON.stringify(alunos));
        mostrarMensagem(`✓ Aluno "${nome}" adicionado com sucesso!`, 'success');
        carregarAlunos();
    }

    // Importar em massa
    function importarEmMassa() {
        if (!podeGerenciar()) return;
        const texto = document.getElementById('textarea-massa').value.trim();
        const turmaMassa = document.getElementById('turma-massa').value;

        if (!turmaMassa) {
            mostrarMensagem('Selecione a turma para inserção em massa.', 'error');
            return;
        }

        if (!texto) {
            mostrarMensagem('Cole os dados dos alunos!', 'error');
            return;
        }

        const linhas = texto.split('\n');
        const alunos = obterAlunos();
        const notaGlobal = obterNotaGlobal();
        let adicionados = 0;
        let duplicados = 0;

        linhas.forEach(linha => {
            // Remove índice no início da linha (ex: "1", "01", "1.", "1)") e tabs/espacos
            let nome = linha
                .replace(/^\s*\d+\s*[-.)]?\s*/, '') // remove numeração inicial
                .replace(/\t+/g, ' ')                 // converte tabs em espaço
                .trim();

            if (nome) {
                if (existeAluno(nome, turmaMassa)) {
                    duplicados++;
                } else {
                    const id = Date.now() + Math.random();
                    const novo = {
                        id,
                        nome,
                        turma: turmaMassa,
                        participacao: 's/participação',
                        desempenho: 'insatisfátorio',
                        comportamento: 'insatisfátorio',
                        nota: ''
                    };
                    novo.nota = calcularNota(novo, notaGlobal);
                    alunos.push(novo);
                    adicionados++;
                }
            }
        });

        if (adicionados > 0) {
            localStorage.setItem('alunos', JSON.stringify(alunos));
            const msgDup = duplicados > 0 ? ` | ${duplicados} duplicado(s) ignorado(s)` : '';
            mostrarMensagem(`✓ ${adicionados} aluno(s) adicionado(s)${msgDup}`, 'success');
            fecharModalMassa();
            carregarAlunos();
        } else {
            mostrarMensagem('Nenhum aluno foi adicionado. Verifique o formato dos dados.', 'error');
        }
    }

    // Exportar CSV com filtro aplicado (se houver)
    function exportarCSV() {
        const turmaFiltro = document.getElementById('filter-turma')?.value || '';
        let alunos = obterAlunos();
        if (turmaFiltro) {
            alunos = alunos.filter(a => a.turma === turmaFiltro);
        }
        if (alunos.length === 0) {
            mostrarMensagem('Não há alunos para exportar.', 'error');
            return;
        }

        const notaGlobal = obterNotaGlobal();
        const linhas = [ ['Nome', 'Turma', 'Participação', 'Desempenho', 'Comportamento', 'Nota atribuída (global)', 'Nota'], ...alunos.map(a => [a.nome, a.turma, a.participacao || '', a.desempenho || '', a.comportamento || '', notaGlobal ?? '', formatNotaExibicao(a.nota)]) ];
        const csv = linhas.map(cols => cols.map(v => {
            const s = (v ?? '').toString().replaceAll('"', '""');
            return `"${s}"`;
        }).join(',')).join('\n');

        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const data = new Date();
        const sufixo = turmaFiltro ? `-${turmaFiltro}` : '';
        a.href = url;
        a.download = `alunos${sufixo}-${data.getFullYear()}${String(data.getMonth()+1).padStart(2,'0')}${String(data.getDate()).padStart(2,'0')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        mostrarMensagem('Exportação iniciada.', 'success');
    }

    // Deletar aluno
    function deletarAluno(id) {
        if (!podeGerenciar()) return;
        if (confirm('Tem certeza que deseja deletar este aluno?')) {
            const alunos = obterAlunos().filter(a => a.id !== id);
            localStorage.setItem('alunos', JSON.stringify(alunos));
            mostrarMensagem('✓ Aluno removido com sucesso!', 'success');
            carregarAlunos();
        }
    }

    // Carregar e exibir alunos
    function carregarAlunos() {
        const alunos = obterAlunos();
        exibirAlunos(alunos);
        atualizarResumo();
    }

    // Obter alunos do localStorage
    function obterAlunos() {
        const alunos = localStorage.getItem('alunos');
        return alunos ? JSON.parse(alunos) : [];
    }

    // Exibir alunos na tabela
    function exibirAlunos(alunos) {
        const tbody = document.getElementById('tbody-alunos');
        const msgVazio = document.getElementById('msg-vazio');

        tbody.innerHTML = '';

        if (alunos.length === 0) {
            msgVazio.style.display = 'block';
            return;
        }

        msgVazio.style.display = 'none';

        let alterouNotas = false;
        const notaGlobal = obterNotaGlobal();
        alunos.forEach(aluno => {
            const notaCalc = calcularNota(aluno, notaGlobal);
            if (aluno.nota !== notaCalc) {
                aluno.nota = notaCalc;
                alterouNotas = true;
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aluno.nome} <span class="turma-badge" style="margin-left:6px;">${aluno.turma}</span></td>
                <td>
                    <select data-field="participacao" data-id="${aluno.id}">
                        <option ${aluno.participacao==='s/participação'?'selected':''}>s/participação</option>
                        <option ${aluno.participacao==='insatisfátorio'?'selected':''}>insatisfátorio</option>
                        <option ${aluno.participacao==='bom'?'selected':''}>bom</option>
                        <option ${aluno.participacao==='muito bom'?'selected':''}>muito bom</option>
                    </select>
                </td>
                <td>
                    <select data-field="desempenho" data-id="${aluno.id}">
                        <option ${aluno.desempenho==='s/participação'?'selected':''}>s/participação</option>
                        <option ${aluno.desempenho==='insatisfátorio'?'selected':''}>insatisfátorio</option>
                        <option ${aluno.desempenho==='bom'?'selected':''}>bom</option>
                        <option ${aluno.desempenho==='muito bom'?'selected':''}>muito bom</option>
                    </select>
                </td>
                <td>
                    <select data-field="comportamento" data-id="${aluno.id}">
                        <option ${aluno.comportamento==='s/participação'?'selected':''}>s/participação</option>
                        <option ${aluno.comportamento==='insatisfátorio'?'selected':''}>insatisfátorio</option>
                        <option ${aluno.comportamento==='bom'?'selected':''}>bom</option>
                        <option ${aluno.comportamento==='muito bom'?'selected':''}>muito bom</option>
                    </select>
                </td>
                <td>
                    <span>${formatNotaExibicao(aluno.nota) || '-'}</span>
                </td>
                ${podeGerenciar() ? `<td><button class="btn-delete" onclick="window.deleteAluno(${aluno.id})">Deletar</button></td>` : ''}
            `;
            tbody.appendChild(tr);
        });

        // Se recomputou notas, salvar
        if (alterouNotas) {
            localStorage.setItem('alunos', JSON.stringify(alunos));
        }

        // Registrar eventos de mudança nos dropdowns para persistir
        tbody.querySelectorAll('select[data-field]').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const field = sel.getAttribute('data-field');
                const id = Number(sel.getAttribute('data-id'));
                const valor = sel.value;
                const alunos = obterAlunos();
                const idx = alunos.findIndex(a => a.id === id);
                if (idx >= 0) {
                    alunos[idx][field] = valor;
                    alunos[idx].nota = calcularNota(alunos[idx]);
                    localStorage.setItem('alunos', JSON.stringify(alunos));
                    carregarAlunos();
                }
            });
        });

        // Nota atribuída agora é global; inputs por aluno removidos
    }

    // Filtrar alunos
    function filtrarAlunos() {
        const turmaFiltro = document.getElementById('filter-turma').value;
        const nomeFiltro = document.getElementById('search-aluno').value.toLowerCase();
        
        let alunos = obterAlunos();

        if (turmaFiltro) {
            alunos = alunos.filter(a => a.turma === turmaFiltro);
        }

        if (nomeFiltro) {
            alunos = alunos.filter(a => a.nome.toLowerCase().includes(nomeFiltro));
        }

        exibirAlunos(alunos);
    }

    // Atualizar resumo
    function atualizarResumo() {
        const alunos = obterAlunos();
        document.getElementById('total-alunos').textContent = alunos.length;
    }

    // Mostrar mensagem
    function mostrarMensagem(texto, tipo) {
        const msgEl = document.getElementById('message');
        msgEl.textContent = texto;
        msgEl.className = `message ${tipo}`;
        msgEl.classList.remove('hidden');

        setTimeout(() => {
            msgEl.classList.add('hidden');
        }, 3000);
    }

    // Expor função globalmente para deletar
    window.deleteAluno = deletarAluno;

    // Helpers de permissão
    function roleAtual() {
        return localStorage.getItem('professorRole') || 'professor';
    }
    function podeGerenciar() { // incluir/deletar
        return roleAtual() === 'gestao';
    }
    function podeEditarNota() { // definir nota base de cálculo
        return roleAtual() === 'gestao';
    }

    // Mapeamento e cálculo de nota
    function scoreValor(valor) {
        const v = (valor || '').toString().toLowerCase();
        if (v === 'muito bom') return 3;
        if (v === 'bom') return 2;
        if (v === 'insatisfátorio') return 1;
        return 0; // s/participação ou vazio
    }

    function calcularNota(aluno, notaGlobal) {
        const base = clampNotaGlobal(notaGlobal);
        if (base === '') return '';
        const soma = scoreValor(aluno.participacao) + scoreValor(aluno.desempenho) + scoreValor(aluno.comportamento);
        const notaFinal = (base / 9) * soma;
        return Number.isFinite(notaFinal) ? Math.round(notaFinal) : '';
    }

    function formatNotaExibicao(nota) {
        const num = parseFloat(nota);
        if (isNaN(num)) return '';
        return Math.round(num);
    }

    function clampNotaGlobal(val) {
        const num = parseFloat(val);
        if (isNaN(num)) return '';
        return Math.max(0, Math.min(100, num));
    }

    function obterNotaGlobal() {
        const v = localStorage.getItem('notaAtribuidaGlobal');
        return v === null ? '' : (v === '' ? '' : parseFloat(v));
    }

    function salvarNotaGlobal(valor) {
        localStorage.setItem('notaAtribuidaGlobal', valor === '' ? '' : valor);
    }

    function recomputarNotasComNotaGlobal() {
        const alunos = obterAlunos();
        const notaGlobal = obterNotaGlobal();
        let mudou = false;
        alunos.forEach(a => {
            const nova = calcularNota(a, notaGlobal);
            if (a.nota !== nova) {
                a.nota = nova;
                mudou = true;
            }
        });
        if (mudou) {
            localStorage.setItem('alunos', JSON.stringify(alunos));
            carregarAlunos();
        } else {
            carregarAlunos();
        }
    }
})();
