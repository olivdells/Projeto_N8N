// Lógica da página principal

// Variáveis globais
let usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual')); // converte texto para objeto
let cronometroInterval;
let tempoEstudo = 0; // inicializar o contador de segundos em 0
let atividadeEmAndamento = null; // armazenar o id da atividade
let cronometroAtivo = false; // inicia o cronometro como parado

// Inicialização
document.addEventListener('DOMContentLoaded', function() {  //vai executar oque está nas chaves quando a página terminar de carregar
    verificarAutenticacao(); // Chama a função de verificar se o usuário está logado lá do 'auth.js'
    if(usuarioAtual) { // Se tiver um usuário logado
        document.getElementById('nomeUsuario').textContent = `Olá, ${usuarioAtual.nome}`;
        carregarAtividades();
        carregarResumoSemana();
        carregarSelecionarAtividades();
    }
});

// Funções de dados do usuário
// Carregar
function carregarUsuario() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // Pega a lista de todos os usuários do localStorage
    usuarioAtual = usuarios.find(u => u.id === usuarioAtual.id);
    return usuarioAtual;
}

// Salvar
function salvarUsuario() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; 
    const index = usuarios.findIndex(u => u.id === usuarioAtual.id); // Encontra o indice do usuário atual o array
    if(index !== -1) { // -1 = não encontrou o usuário (se encontrou o usuário)
        usuarios[index] = usuarioAtual; // substitui os dados antigos pelos novos
        localStorage.setItem('usuarios', JSON.stringify(usuarios)); // Salva dnv no localstorage
        localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual)); // Atualiza o usuário atual 
    }
}

// Formulário de atividades
if(document.getElementById('formAtividade')) {
    document.getElementById('formAtividade').addEventListener('submit', function(e) {
        e.preventDefault();

        const materia = document.getElementById('materia').value;
        const descricao = document.getElementById('descricao').value;
        const prazo = document.getElementById('prazo').value;

        // Criar uma nova atividade
        const novaAtividade = {
            id: Date.now(),
            materia,
            descricao,
            prazo,
            status: 'pendente',
            dataCriacao: new Date().toISOString()
        };

        usuarioAtual = carregarUsuario()
        usuarioAtual.atividades.push(novaAtividade); // add a nova atividade no array de atividades
        salvarUsuario();

        // Limpar formulário
        this.reset();

        // Atualizar interface
        carregarAtividades();
        carregarSelecionarAtividades();
        carregarResumoSemana();

        alert('Atividade cadastrada com sucesso!')
    });
}

// Carregar atividades na tabela
function carregarAtividades() {
    usuarioAtual = carregarUsuario(); // Atualizar os dados do usuário
    const tbody = document.getElementById('tabelaAtividades'); // Pega o corpo da tabela lá no 'index.html'
    
    if(!usuarioAtual.atividades || usuarioAtual.atividades.length === 0) { // Se não tiver atividades no array
        tbody.innerHTML = '<tr><td colspan="5" class"text-center">Nenhuma ativudade cadastrada</td></tr>';
        return;
    }

    // Ordena atividade por prazo (o mais próximo de chegar primeiro)
    const atividadesOrdenadas = [...usuarioAtual.atividades].sort((a,b) => { // Cria cópia do array de atividades do usuário
        return new Date(a.prazo) - new Date(b.prazo);                       // ordena por data
    });

    // map - cria uma linha da tabela para cada atividade
    // Operador ternário = condição ? valorSeVerdadeiro : valorSeFalso 
    // cor verde (success) se for concluída, e cor amarelo (waarning) se estiver pendente
    // O botão concluir vai aoarecer só se a atividade não estiver concluída
    tbody.innerHTML = atividadesOrdenadas.map(atividade => `
        <tr>
            <td>${atividade.materia}</td>
            <td>${atividade.descricao}</td>
            <td>${formatarData(atividade.prazo)}</td>
            <td> 
                <span class="badge bg-${atividade.status === 'concluida' ? 'success' : 'warning'}">
                    ${atividade.status === 'concluida' ? 'Concluída' : 'Pendente'}
                </span>
            </td>
            <td>
                ${atividade.status !== 'concluida' ?
                    `<button class="btn btn-sucess btn-sm" onclick="concluirAtividade(${atividade.id})">
                        <i class="bi bi-check"></i> Concluir
                    </button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="excluirAtividade(${atividade.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>  
    `).join(''); // join() -> junta tudo em uma string
}

// Carregar a seleção de atividades
function carregarSelecionarAtividades() {
    usuarioAtual = carregarUsuario();
    const select = document.getElementById('selecionarAtividade');

    if(!usuarioAtual.atividades || usuarioAtual.atividades.length === 0) { // Se não tiver atividades no array
        select.innerHTML = '<option value="">Nenhuma atividade disponível</option>';
        return;
    }

    const atividadesPendentes = usuarioAtual.atividades.filter(a => a.status === 'pendente');

    // a primeira opção é 'Selecione uma atividade' e mas outras são o valor = ID, matéria + a descrição
    select.innerHTML = '<option value="">Selecione uma atividade<option/>' + atividadesPendentes.map(atividade =>
        `<option value="${atividade.id}">${atividade.materia} - ${atividade.descricao}</option>`
    ).join('');
}

// Concluir atividade
function concluirAtividade(id) {
    usuarioAtual = carregarUsuario();
    const atividade = usuarioAtual.atividades.find(a => a.id === id); // encontra a atividade pelo id
    if(atividade) {
        atividade.status = 'concluida';  // coloca os status como concluída
        salvarUsuario();
        carregarAtividades();
        carregarSelecionarAtividades();
        carregarResumoSemana();
    }
}

// Excluir atividade
function excluirAtividade(id) {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) { // Se clicar em ok
        usuarioAtual = carregarUsuario();
        usuarioAtual.atividades = usuarioAtual.atividades.filter(a => a.id !== id); // remove a atividade do array e deixar as outras(que tem id diferente)
        usuarioAtual.registrosEstudo = usuarioAtual.registrosEstudo.filter(r => r.atividadeId !== id); // e os regstros de estudo
        salvarUsuario();
        carregarAtividades();
        carregarSelecionarAtividades();
        carregarResumoSemana();
    }
}

// Temporizador
// Se o usuário selecionou uma atividade continua o andamento, se não alerta e para
function iniciarCronometro() {
    const selectAtividade = document.getElementById('selecionarAtividade');
    
    if (!selectAtividade.value) {
        alert('Selecione uma atividade para estudar!');
        return;
    }
    
    atividadeEmAndamento = parseInt(selectAtividade.value); // transforma o id em número int
    cronometroAtivo = true;
    
    document.getElementById('btnIniciar').disabled = true; // desabilita
    document.getElementById('btnPausar').disabled = false; // habilita
    document.getElementById('btnParar').disabled = false; // habilita
    document.getElementById('selecionarAtividade').disabled = true; // desabilita (não pode mudar de atividade enquanto estuda)
    
    // aumenta o tempo de estudo de 1 em 1 segundo
    cronometroInterval = setInterval(() => {
        tempoEstudo++;
        atualizarCronometro();
    }, 1000);
}

// Pausar o cronometro
function pausarCronometro() {
    cronometroAtivo = false;
    clearInterval(cronometroInterval);
    
    document.getElementById('btnIniciar').disabled = false;
    document.getElementById('btnPausar').disabled = true;
    document.getElementById('btnIniciar').innerHTML = '<i class="bi bi-play"></i> Continuar'; // muda o botão de iniciar para continuar
}

// Parar o cronometro
function pararCronometro() {
    clearInterval(cronometroInterval);
    
    if (tempoEstudo > 0 && atividadeEmAndamento) {
        // Buscar a atividade pelo ID 
        const atividade = usuarioAtual.atividades.find(a => a.id === atividadeEmAndamento);
        
        if (atividade) {  // Verifica se encontrou a atividade
            // Registrar tempo de estudo
            const registro = {
                id: Date.now(),
                atividadeId: atividadeEmAndamento,
                tempoSegundos: tempoEstudo,
                data: new Date().toISOString()
            };
            
            usuarioAtual = carregarUsuario();
            usuarioAtual.registrosEstudo.push(registro);
            salvarUsuario();
            
            // Formatar tempo para enviar
            const tempoFormatado = formatarTempo(tempoEstudo);
            
            // Enviarpara IA n8n
            enviarEstudoParaIA(
                atividade.materia, 
                tempoFormatado,
                atividade.descricao
            );
            
            alert(`Tempo registrado: ${tempoFormatado}`);
            carregarResumoSemana();
        }
    }
    
    // Resetar cronômetro
    tempoEstudo = 0;
    atividadeEmAndamento = null;
    cronometroAtivo = false;
    atualizarCronometro();
    
    document.getElementById('btnIniciar').disabled = false;
    document.getElementById('btnPausar').disabled = true;
    document.getElementById('btnParar').disabled = true;
    document.getElementById('selectAtividade').disabled = false;
    document.getElementById('btnIniciar').innerHTML = '<i class="bi bi-play"></i> Iniciar';
}

// Calcular horas, minutos e segundos a partir do total de segundos
function atualizarCronometro() {
    const horas = Math.floor(tempoEstudo / 3600);
    const minutos = Math.floor((tempoEstudo % 3600) / 60);
    const segundos = tempoEstudo % 60;
    
    // atualiza o cronometro na tela, com 2 digitos
    document.getElementById('cronometro').textContent = 
        `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

// Carregar resumo da semana
function carregarResumoSemana() {
    usuarioAtual = carregarUsuario();
    const resumoDiv = document.getElementById('resumoSemana');
    
    // Calcular datas da semana
    // calcula início da semana (segunda 00:00)
    const hoje = new Date(); 
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1); // Segunda-feira (0 - domingo + 1 = segunda)
    inicioSemana.setHours(0, 0, 0, 0);
    
    // calcula o fim da semana (domingo 23:59:59)
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6); // Domingo
    fimSemana.setHours(23, 59, 59, 999);
    
    // Filtrar atividades da semana
    // Pega só as atividades com prazo dentro desta semana específica
    const atividadesSemana = usuarioAtual.atividades.filter(a => {
        const dataPrazo = new Date(a.prazo);
        return dataPrazo >= inicioSemana && dataPrazo <= fimSemana;
    });
    
    // Calcular tempo de estudo da semana
    // Pega só os registros de estudo dentro desta semana 
    const registrosSemana = usuarioAtual.registrosEstudo.filter(r => {
        const dataRegistro = new Date(r.data);
        return dataRegistro >= inicioSemana && dataRegistro <= fimSemana;
    });
    
    // somar todos os segundos estudados na semana
    const tempoTotal = registrosSemana.reduce((acc, r) => acc + r.tempoSegundos, 0);
    
    // Agrupar por matéria
    // Para cada registro, encontra a atividade correspondente e soma o tempo por matéria
    const tempoPorMateria = {};
    registrosSemana.forEach(registro => {
        const atividade = usuarioAtual.atividades.find(a => a.id === registro.atividadeId);
        if (atividade) {
            tempoPorMateria[atividade.materia] = (tempoPorMateria[atividade.materia] || 0) + registro.tempoSegundos;
        }
    });
    
    // Gerar HTML do resumo
    // Cria uma html com contagem de atividades e tempo total
    let html = `
        <p><strong>Atividades da semana:</strong> ${atividadesSemana.length}</p>
        <p><strong>Tempo total de estudo:</strong> ${formatarTempo(tempoTotal)}</p>
    `;
    
    // Se tem tempo por matéria, adiciona lista com cada matéria e tempo
    if (Object.keys(tempoPorMateria).length > 0) {
        html += '<hr><p><strong>Tempo por matéria:</strong></p><ul>';
        for (const [materia, tempo] of Object.entries(tempoPorMateria)) {
            html += `<li>${materia}: ${formatarTempo(tempo)}</li>`;
        }
        html += '</ul>';
    }
    
    resumoDiv.innerHTML = html; // coloca o html gerado na div de resumo
}

// Funções auxiliares
// converte a data para o formato brasileiro
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// Formata segundos -> seg, minutos -> min e horas -> h
function formatarTempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
        return `${horas}h ${minutos}min`;
    } else if (minutos > 0) {
        return `${minutos}min`;
    } else {
        return `${segundos}seg`;
    }
}

// Para o N8N

// Função para enviar dados de estudo para o n8n
function enviarEstudoParaIA(materia, tempo, descricao) {
    usuarioAtual = carregarUsuario();
    
    const dadosEstudo = {
        mensagem: `Acabei de estudar ${materia} por ${tempo}. Descrição: ${descricao}`,
        email: usuarioAtual.email,
        materia: materia,
        tempo: tempo,
        nome: usuarioAtual.nome
    };
    
    fetch('https://olivdells.app.n8n.cloud/webhook-test/estudos_usuario', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosEstudo)
    })
    .then(response => response.json())
    .then(data => {
        // Esta linha abaixo vai procurar a dica dentro da resposta, não importa onde ela esteja
        console.log("Dados recebidos do n8n:", data);
        
        // Se a IA gerou a dica, ela estará em algum lugar do histórico. 
        // Vamos tentar pegar o campo 'output' que é o padrão do AI Agent
        const dicaIA = data.output || "Estudo registrado na planilha e e-mail enviado!";
        
        alert('Dica da IA: ' + dicaIA);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao conectar com a IA.');
    });
}