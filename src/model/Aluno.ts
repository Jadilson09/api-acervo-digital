// Importa o tipo AlunoDTO, que define a "forma" dos dados de um aluno (como um molde/contrato)
import type AlunoDTO from "../dto/AlunoDTO.js";
// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
// O "pool" é um conjunto de conexões reutilizáveis, mais eficiente que abrir/fechar uma por vez
const database = new DatabaseModel().pool;

// Define a classe Aluno, que representa um aluno no sistema
class Aluno {

    // Atributo privado: ID único do aluno no banco de dados (começa em 0, pois ainda não foi salvo)
    private id_aluno: number = 0;
    // Atributo privado: Registro Acadêmico do aluno (começa vazio)
    private ra: string = "";
    // Atributo privado: Primeiro nome do aluno
    private nome: string;
    // Atributo privado: Sobrenome do aluno
    private sobrenome: string;
    // Atributo privado: Data de nascimento do aluno
    private data_nascimento: Date;
    // Atributo privado: Endereço residencial do aluno
    private endereco: string;
    // Atributo privado: E-mail do aluno
    private email: string;
    // Atributo privado: Número de celular do aluno
    private celular: string;
    // Atributo privado: Status do aluno (true = ativo, false = inativo/removido)
    private status_aluno: boolean = true;

    // Construtor: método especial chamado automaticamente ao criar um novo objeto Aluno
    // Os parâmetros com "_" na frente são uma convenção para diferenciar dos atributos da classe
    constructor(
        _nome: string,           // Nome obrigatório
        _sobrenome: string,      // Sobrenome obrigatório
        _data_nascimento: Date,  // Data de nascimento obrigatória
        _endereco: string,       // Endereço obrigatório
        _email: string,          // E-mail obrigatório
        _celular?: string        // Celular opcional (o "?" indica que pode ser omitido)
    ) {
        // Atribui o valor recebido ao atributo interno da classe
        this.nome = _nome;
        this.sobrenome = _sobrenome;
        this.data_nascimento = _data_nascimento;
        this.endereco = _endereco;
        this.email = _email;
        // Se _celular foi informado, usa esse valor; senão, usa string vazia ("")
        // O operador "??" é chamado de "nullish coalescing" — retorna o lado direito se o esquerdo for null/undefined
        this.celular = _celular ?? "";
    }

    // ==================== GETTERS E SETTERS ====================
    // Getters e setters são métodos públicos que permitem ler/alterar atributos privados com segurança

    // Getter: retorna o ID do aluno
    public getIdAluno(): number {
        return this.id_aluno;
    }

    // Setter: define um novo valor para o ID do aluno
    public setIdAluno(id_aluno: number): void {
        this.id_aluno = id_aluno;
    }

    // Getter: retorna o RA do aluno
    public getRa(): string {
        return this.ra;
    }

    // Setter: define um novo valor para o RA do aluno
    public setRa(ra: string): void {
        this.ra = ra;
    }

    // Getter: retorna o nome do aluno
    public getNome(): string {
        return this.nome;
    }

    // Setter: define um novo valor para o nome do aluno
    public setNome(nome: string): void {
        this.nome = nome;
    }

    // Getter: retorna o sobrenome do aluno
    public getSobrenome(): string {
        return this.sobrenome;
    }

    // Setter: define um novo valor para o sobrenome do aluno
    public setSobrenome(sobrenome: string): void {
        this.sobrenome = sobrenome;
    }

    // Getter: retorna a data de nascimento do aluno
    public getDataNascimento(): Date {
        return this.data_nascimento;
    }

    // Setter: define uma nova data de nascimento para o aluno
    public setDataNascimento(data_nascimento: Date): void {
        this.data_nascimento = data_nascimento;
    }

    // Getter: retorna o endereço do aluno
    public getEndereco(): string {
        return this.endereco;
    }

    // Setter: define um novo endereço para o aluno
    public setEndereco(endereco: string): void {
        this.endereco = endereco;
    }

    // Getter: retorna o e-mail do aluno
    public getEmail(): string {
        return this.email;
    }

    // Setter: define um novo e-mail para o aluno
    public setEmail(email: string): void {
        this.email = email;
    }

    // Getter: retorna o celular do aluno
    public getCelular(): string {
        return this.celular;
    }

    // Setter: define um novo número de celular para o aluno
    public setCelular(celular: string): void {
        this.celular = celular;
    }

    // Getter duplicado do RA (mesma função que getRa acima — provavelmente um erro de duplicidade no código original)
    public getRA(): string {
        return this.ra;
    }

    // Setter duplicado do RA (mesma função que setRa acima)
    public setRA(ra: string): void {
        this.ra = ra;
    }

    // Getter: retorna o status do aluno (true = ativo, false = inativo)
    public getStatusAluno(): boolean {
        return this.status_aluno;
    }

    // Setter: define um novo status para o aluno
    public setStatusAluno(status_aluno: boolean): void {
        this.status_aluno = status_aluno;
    }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Aluno.listarAlunos()

    /**
     * Retorna uma lista com todos os alunos cadastrados no banco de dados
     * 
     * @returns Lista com todos os alunos cadastrados no banco de dados
     */
    // "async" indica que este método é assíncrono — ele pode "esperar" por operações demoradas (como banco de dados)
    // Retorna uma Promise que, quando resolvida, contém um Array de AlunoDTO ou null
    static async listarAlunos(): Promise<Array<AlunoDTO> | null> {
        // Cria uma lista vazia que vai receber os alunos encontrados no banco
        let listaDeAlunos: Array<AlunoDTO> = [];

        try {
            // Bloco try: tenta executar o código; se algo der errado, vai para o catch

            // Define a query SQL que busca todos os alunos ativos no banco de dados
            const querySelectAluno = `SELECT * FROM Aluno WHERE status_aluno = TRUE;`;

            // Executa a query no banco de dados e aguarda o resultado
            // "await" pausa a execução aqui até o banco responder
            const respostaBD = await database.query(querySelectAluno);

            // Percorre cada linha retornada pelo banco de dados
            // "aluno" é o apelido dado a cada linha individual retornada
            respostaBD.rows.forEach((aluno: any) => {

                // Cria um objeto AlunoDTO com os dados de cada linha do banco
                // AlunoDTO é apenas um objeto simples de dados (sem métodos), diferente da classe Aluno
                const alunoDTO: AlunoDTO = {
                    id_aluno: aluno.id_aluno,               // ID do aluno
                    ra: aluno.ra,                           // Registro Acadêmico
                    nome: aluno.nome,                       // Nome
                    sobrenome: aluno.sobrenome,             // Sobrenome
                    data_nascimento: aluno.data_nascimento, // Data de nascimento
                    endereco: aluno.endereco,               // Endereço
                    email: aluno.email,                     // E-mail
                    celular: aluno.celular,                 // Celular
                    status_aluno: aluno.status_aluno        // Status ativo/inativo
                };

                // Adiciona o objeto AlunoDTO à lista
                listaDeAlunos.push(alunoDTO);
            });

            // Retorna a lista com todos os alunos encontrados
            return listaDeAlunos;
        } catch (error) {
            // Se ocorrer qualquer erro durante a consulta, exibe no console para facilitar o debug
            console.log(`Erro ao acessar o modelo: ${error}`);
            // Retorna null para indicar que houve falha
            return null;
        }
    }

    /**
     * Retorna as informações de um aluno informado pelo ID
     * 
     * @param idAluno Identificador único do aluno
     * @returns Objeto com informações do aluno
     */
    // Recebe o ID do aluno como parâmetro e retorna um AlunoDTO ou null
    static async listarAluno(id_aluno: number): Promise<AlunoDTO | null> {
  try {
    // Bloco try: tentamos executar o código que pode gerar um erro.
    // Se ocorrer algum erro dentro deste bloco, ele será capturado pelo catch.

    // Define a query SQL com colunas explícitas (evitar SELECT *)
    // O "$1" é um parâmetro substituído pelo valor real em tempo de execução.
    // Isso é chamado de "prepared statement" e protege contra SQL Injection.
    const querySelectAluno = `
      SELECT
        id_aluno,
        ra,
        nome,
        sobrenome,
        data_nascimento,
        endereco,
        email,
        celular,
        status_aluno
      FROM aluno
      WHERE id_aluno = $1
    `;

    // Executa a query passando o id_aluno como segundo argumento (substitui o $1)
    const respostaBD = await database.query(querySelectAluno, [id_aluno]);

    // Verifica se algum aluno foi encontrado antes de tentar acessar os dados
    // Sem essa verificação, acessar rows[0] quando vazio causaria um erro em runtime
    if (respostaBD.rows.length === 0) {
      return null;
    }

    // Atalho: armazena a primeira linha em uma variável para evitar repetição de "respostaBD.rows[0]"
    const row = respostaBD.rows[0];

    // Monta o objeto AlunoDTO com os dados retornados pelo banco
    // AlunoDTO é um objeto simples de dados (sem métodos), ideal para trafegar informações
    const alunoDTO: AlunoDTO = {
      id_aluno:        row.id_aluno,
      ra:              row.ra,                // Registro Acadêmico
      nome:            row.nome,
      sobrenome:       row.sobrenome,
      data_nascimento: row.data_nascimento,
      endereco:        row.endereco,
      email:           row.email,
      celular:         row.celular,
      status_aluno:    row.status_aluno       // Status ativo/inativo
    };

    // Retorna o objeto preenchido com os dados do banco
    return alunoDTO;

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    // Ele escreve no stderr e aparece em vermelho no terminal
    console.error(`Erro ao realizar a consulta: ${error}`);

    // Retorna null para indicar que não foi possível buscar o aluno
    return null;
  }
}

/**
 * Cadastra um novo aluno no banco de dados
 * @param aluno Objeto Aluno contendo as informações a serem cadastradas
 * @returns Boolean indicando se o cadastro foi bem-sucedido
 */
static async cadastrarAluno(aluno: Aluno): Promise<boolean> {
  try {
    // Query SQL de inserção
    // Os placeholders $1, $2... são substituídos pelos valores reais em tempo de execução
    // "RETURNING id_aluno" faz o banco retornar o ID gerado automaticamente após o INSERT
    // ⚠️ ATENÇÃO: os placeholders NÃO devem ter aspas simples ao redor ($1 e não '$1')
    // Com aspas, o banco interpreta como texto literal e ignora o valor passado
    const queryInsertAluno = `
      INSERT INTO Aluno (nome, sobrenome, data_nascimento, endereco, email, celular)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_aluno;
    `;

    // Executa a query passando os valores do objeto Aluno
    // .toUpperCase() converte para maiúsculas; .toLowerCase() converte para minúsculas
    const result = await database.query(queryInsertAluno, [
      aluno.getNome().toUpperCase(),           // Nome em maiúsculas
      aluno.getSobrenome().toUpperCase(),      // Sobrenome em maiúsculas
      aluno.getDataNascimento(),               // Data de nascimento sem transformação
      aluno.getEndereco().toUpperCase(),       // Endereço em maiúsculas
      aluno.getEmail().toLowerCase(),          // E-mail em minúsculas
      aluno.getCelular()                       // Celular sem transformação
    ]);

    // Verifica se o banco retornou pelo menos uma linha (confirma que o INSERT funcionou)
    if (result.rows.length > 0) {
      console.log(`Aluno cadastrado com sucesso. ID: ${result.rows[0].id_aluno}`);
      return true;
    }

    // Se nenhuma linha foi retornada, o cadastro falhou
    return false;

  } catch (error) {
    console.error(`Erro ao cadastrar aluno: ${error}`);
    return false;
  }
}

    /**
    * Remove um aluno do banco de dados
    * @param id_aluno ID do aluno a ser removido
    * @returns Boolean indicando se a remoção foi bem-sucedida
   */
    // Recebe o ID do aluno e realiza uma "remoção lógica" (não apaga do banco, apenas desativa)
   /**
 * Remove um aluno do banco de dados
 * @param id_aluno ID do aluno a ser removido
 * @returns Boolean indicando se a remoção foi bem-sucedida
 */
static async removerAluno(id_aluno: number): Promise<boolean> {
  try {
    // Busca o aluno no banco antes de tentar remover, para verificar se ele existe e está ativo
    const aluno: AlunoDTO | null = await this.listarAluno(id_aluno);

    // Se o aluno não existir (null) ou já estiver inativo, interrompe e retorna false
    // Usar "early return" evita o aninhamento desnecessário com if/else
    if (!aluno || !aluno.status_aluno) {
      return false;
    }

    // Query que desativa todos os empréstimos vinculados ao aluno
    // Em vez de apagar os registros, usa UPDATE para setar o status como FALSE (remoção lógica)
    // Remoção lógica preserva o histórico no banco de dados
    const queryDeleteEmprestimoAluno = `
      UPDATE emprestimo
      SET status_emprestimo_registro = FALSE
      WHERE id_aluno = $1;
    `;

    // Executa a desativação dos empréstimos do aluno
    await database.query(queryDeleteEmprestimoAluno, [id_aluno]);

    // Query que desativa o próprio aluno (também uma remoção lógica)
    const queryDeleteAluno = `
      UPDATE aluno
      SET status_aluno = FALSE
      WHERE id_aluno = $1;
    `;

    // Executa a desativação do aluno
    // "rowCount" indica quantas linhas foram afetadas pelo UPDATE
    const result = await database.query(queryDeleteAluno, [id_aluno]);

    // Se rowCount for maior que 0, o UPDATE afetou pelo menos uma linha — operação bem-sucedida
    // Isso é mais confiável do que sempre retornar true após o query
    return (result.rowCount ?? 0) > 0;

  } catch (error) {
    console.error(`Erro ao remover aluno: ${error}`);
    return false;
  }
}

    /**
    * Atualiza os dados de um aluno no banco de dados.
    * @param aluno Objeto do tipo Aluno com os novos dados
    * @returns true caso sucesso, false caso erro
    */
    // Recebe um objeto Aluno com os dados atualizados e os salva no banco
 static async atualizarAluno(aluno: Aluno): Promise<boolean> {
  try {
    // Antes de atualizar, verifica se o aluno existe e está ativo no banco
    const alunoConsulta: AlunoDTO | null = await this.listarAluno(aluno.id_aluno);

    // Se o aluno não existir (null) ou estiver inativo, interrompe e retorna false
    // "Early return" evita aninhamento desnecessário com if/else
    if (!alunoConsulta || !alunoConsulta.status_aluno) {
      return false;
    }

    // Query SQL de atualização — cada campo recebe um placeholder "$n"
    // ⚠️ ATENÇÃO: os placeholders NÃO devem ter aspas simples ($1 e não '$1')
    // Com aspas, o banco interpreta como texto literal e ignora o valor passado
    // O WHERE garante que só o aluno com o ID correto seja atualizado
    const queryAtualizarAluno = `
      UPDATE Aluno SET
        nome            = $1,
        sobrenome       = $2,
        data_nascimento = $3,
        endereco        = $4,
        celular         = $5,
        email           = $6
      WHERE id_aluno = $7;
    `;

    // Executa a query de atualização com os valores do objeto aluno recebido
    // .toUpperCase() converte para maiúsculas; .toLowerCase() converte para minúsculas
    const respostaBD = await database.query(queryAtualizarAluno, [
      aluno.getNome().toUpperCase(),       // Nome em maiúsculas
      aluno.getSobrenome().toUpperCase(),  // Sobrenome em maiúsculas
      aluno.getDataNascimento(),           // Data de nascimento sem transformação
      aluno.getEndereco().toUpperCase(),   // Endereço em maiúsculas
      aluno.getCelular(),                  // Celular sem transformação
      aluno.getEmail().toLowerCase(),      // E-mail em minúsculas
      aluno.id_aluno                       // ID do aluno (usado no WHERE)
    ]);

    // Usa o operador ?? (nullish coalescing) para garantir que rowCount nunca seja null
    // Se rowCount for maior que 0, pelo menos uma linha foi atualizada — operação bem-sucedida
    return (respostaBD.rowCount ?? 0) > 0;

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao atualizar aluno: ${error}`);
    return false;
  }
}

}

// Exporta a classe Aluno para que possa ser importada e usada em outros arquivos do projeto
export default Aluno;