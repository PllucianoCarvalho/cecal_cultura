// Arquivo de autenticação dos professores
(function() {
    const professores = [
        { email: 'luciano@prof', senha: '123456', nome: 'Professor', role: 'professor' },
        { email: 'luciano@gestao', senha: '123456', nome: 'Luciano', role: 'gestao' },
        { email: 'cleo@campinalagoa.edu.br', senha: '123456', nome: 'Cleo', role: 'gestao' },
    ];

    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            
            const professorValido = professores.find(prof => 
                prof.email === email && prof.senha === password
            );
            
            if (professorValido) {
                localStorage.setItem('professorLogado', 'true');
                localStorage.setItem('professorEmail', email);
                localStorage.setItem('professorNome', professorValido.nome);
                localStorage.setItem('professorRole', professorValido.role);
                window.location.href = 'dashboard_profs.html';
            } else {
                errorMessage.textContent = 'Email ou senha inválidos!';
                errorMessage.style.display = 'block';
                document.getElementById('password').value = '';
            }
        });
    });
})();
