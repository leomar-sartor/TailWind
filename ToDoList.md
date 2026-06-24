
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

# A FAZER

### Filtros

- Precisam ser dinamicos, sem a necessidade de clicar em um botão para executar;
- Novo componente input com label - diferente do de login;

### Outros
    - Adicionar Autorizations
    - Normalizar dados para gravar - tudo minusculo ou maiusculo, isso ajuda nos filtros também
    - Validação de CPF e CNPJ no FRONT
    - Substituir o alert de exclusão por algo mais legal.