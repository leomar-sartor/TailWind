
# FEITOS

1. Trocar Ícone e Título no Login - seguir recomendação e ferramenta do curso;
 - https://realfavicongenerator.net
2. Não está autenticando, usei qualquer coisa e entra normalmente no sistema;
3. Empresa e Setor
 - Adicionado campo cnpj - Validação na API;
 - Nome Fantasia como opcional;
 - Descrição como opcional;
 - Máscara de CNPJ númerico e alphanumérico ao criar, editar e listagem;
4. Colaborador
 - Obrigatório Empresa e Setor;
 - Máscara de CPF ao criar, editar e listagem;
5. Adicionado Ativo para Empresa/Setor/Colaborador/Usuario
6. Deleção empresa, setor e colaborador - É necessário ir removendo um a um.
    - Uma empresa não pode ser apagada se tiver vínculo com Setor ou Usuário;
    - Um Setor não pode ser apagado se tiver vínculo com Colaborador;
7. Filtros
    - Busca considerando parte do texto;
8. Exibição da Mensagem de erro - Exceptions - Na exclusão por exemplo - EMPRESA;
9. Normalização da API para buscas com Case Insensitive;
10. Filtros dinamicos;
11. Unique Key para Cnpj e Cpf no banco;
12. Adicionado ToastFy para Exclusão;
13. Ajustado Light e Dark Theme - ainda tem coisa a melhorar;
14. Novo componente input com label - diferente do de login;

# A FAZER

### Outros
    - Adicionar Autorizations
    - Validação de CPF e CNPJ no FRONT - Validação única