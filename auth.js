// Sistema de autenticação

// CADASTRO
// JSON.parse() = converte string JSON para objeto javascrpts
// localStorage.getItem('usuarios') = busca dados salvos no navegador
// || [] = se não existir nenhum dado salvo no navegador, criar um array vazio
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

// Função para salvar no localStorage("Banco de dados" do navegador)
// setItem = salva no navegador
// JSON.stringify(usuarios) = Transforma o objeto usuarios em string
function salvarUsuarios() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

if (document.getElementById('cadastroForm')) {   // <- Verifica se existe o id 'cadastroForm'
    document.getElementById('cadastroForm').addEventListener('submit', function(e) { // <- Adiciona o evento de submit ao formulário qnd clicar em cadastrar
        e.preventDefault(); // <- Previne o comportamento padrão de recarregar a página automaticamente

        // Pegar os valores digitados nos campos do formulário na página de cadastro
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const mensagem = document.getElementById('mensagem'); // referenciar a div das mensagens, para mostrar onde colocar as mensagens do javascript

        // Validações: 
        // Verificar se as senhas são iguais e se não, mostra erro e para a execução
        if(senha !== confirmarSenha) {
            mensagem.textContent = 'As senhas digitadas são diferentes!';
            return;
        }

        // Verificar se o email já existe 
        if(usuarios.find(u => u.email === email)) {
            mensagem.textContent = 'E-mail já cadastrado!';
            return;
        }

        // Criar novo usuário
        const novoUsuario = {
            id: Date.now(), // <- O ID vai ser o horário em que o usuário foi criado
            nome,
            email,
            senha,
            // Arrays vazios para atividades e registros de estudo futuros
            atividades: [],
            registrosEstudo: []
        };

        // Adiciona o novo usuário ao array de usuários e salva no localStorage
        usuarios.push(novoUsuario);
        salvarUsuarios();

        // Login automático salvando o usuário atual e redireciona o usuário para a página principal
        localStorage.setItem('usuarioAtual', JSON.stringify(novoUsuario));
        window.location.herf = 'index.html';
    });
}

// LOGIN
if (document.getElementById('loginForm')) {   // <- Verifica se existe o id 'loginForm'
    document.getElementById('loginForm').addEventListener('submit', function(e) { // <- Adiciona o evento de submit ao formulário qnd clicar em entrar
        e.preventDefault(); // <- Previne o comportamento padrão de recarregar a página automaticamente

        // Pegar os valores digitados nos campos do formulário na página de login
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const mensagem = document.getElementById('mensagem'); // referenciar a div das mensagens, para mostrar onde colocar as mensagens do javascript

        const usuario = usuarios.find(u=> u.email === email && u.senha === senha); // Busca usuário e senha correspondentes
        
        if(usuario) {
            localStorage.setItem('usuarioAtual', JSON.stringify(usuario)); // <- Se encontrou, salva o usuário
            window.location.href='index.html';                            // <- Redireciona para a página principal
        } else {
            mensagem.textContent = 'E-mail ou senha inválidos!'
        }
    });

    // Função para proteger as páginas
    function verificarAutenticacao() {
        const usuarioAtual = localStorage.getItem('usuarioAtual');

        if(!usuarioAtual && window.location.pathname.includes('index.html')) {  // <- se o usuário atual não existe mas está na págona principal
            window.location.href='login.html';                                 // <- redireciona para a página de login
        }
    }

    // Funcção de sair
    function logout() {
        localStorage.removeItem('usuarioAtual');
        window.location.href='login.html'
    }
}

function verificarAutenticacao() {
    const usuarioAtual = localStorage.getItem('usuarioAtual');
    
    if (!usuarioAtual && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('usuarioAtual');
    window.location.href = 'login.html';
}