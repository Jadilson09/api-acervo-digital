// Importa o tipo EmprestimoDTO, que define a estrutura de dados de um empréstimo (objeto simples, sem métodos)
import type EmprestimoDTO from "../dto/EmprestimoDTO.js";
// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
// O "pool" gerencia múltiplas conexões simultâneas de forma eficiente
const database = new DatabaseModel().pool;

// Define a classe Emprestimo, que representa um empréstimo de livro no sistema
class Emprestimo {

    // Atributo privado: ID único do empréstimo no banco de dados (começa em 0, pois ainda não foi salvo)
    private id_emprestimo: number = 0;
    // Atributo privado: ID do aluno que realizou o empréstimo (chave estrangeira referenciando a tabela Aluno)
    private id_aluno: number;
    // Atributo privado: ID do livro emprestado (chave estrangeira referenciando a tabela Livro)
    private id_livro: number;
    // Atributo privado: Data em que o empréstimo foi realizado
    private data_emprestimo: Date;
    // Atributo privado: Data prevista para devolução do livro
    private data_devolucao: Date;
    // Atributo privado: Situação atual do empréstimo (ex: "Em Andamento", "Devolvido", "Atrasado")
    private status_emprestimo: string;
    // Atributo privado: Indica se o registro está ativo no banco (true = ativo, false = removido logicamente)
    private status_emprestimo_registro: boolean = true;

    // Construtor: chamado automaticamente ao criar um novo objeto Emprestimo
    constructor(
        _id_aluno: number,          // ID do aluno — obrigatório
        _id_livro: number,          // ID do livro — obrigatório
        _data_emprestimo: Date,     // Data do empréstimo — obrigatório
        _status_emprestimo?: string, // Status do empréstimo — opcional (o "?" indica que pode ser omitido)
        _data_devolucao?: Date      // Data de devolução — opcional
    ) {
        // Cria uma cópia da data de empréstimo para calcular a data de devolução padrão
        // Isso é necessário para não modificar o objeto original (_data_emprestimo)
        const dataDevolucaoPadrao = new Date(_data_emprestimo);
        // Adiciona 7 dias à data de empréstimo para definir o prazo padrão de devolução
        // getDate() retorna o dia atual, e setDate() define um novo dia somando +7
        dataDevolucaoPadrao.setDate(dataDevolucaoPadrao.getDate() + 7);

        // Atribui os valores recebidos aos atributos internos da classe
        this.id_aluno = _id_aluno;
        this.id_livro = _id_livro;
        this.data_emprestimo = _data_emprestimo;
        // Se _status_emprestimo não foi informado, usa "Em Andamento" como valor padrão
        // O operador "??" retorna o lado direito se o esquerdo for null ou undefined
        this.status_emprestimo = _status_emprestimo ?? "Em Andamento";
        // Se _data_devolucao não foi informada, usa a data calculada automaticamente (empréstimo + 7 dias)
        this.data_devolucao = _data_devolucao ?? dataDevolucaoPadrao;
    }

    // ==================== GETTERS E SETTERS ====================
    // Métodos públicos para acessar e modificar os atributos privados da classe com segurança

    // Getter: retorna o ID do empréstimo
    public getIdEmprestimo(): number {
        return this.id_emprestimo;
    }
    // Setter: define um novo valor para o ID do empréstimo
    public setIdEmprestimo(value: number) {
        this.id_emprestimo = value;
    }

    // Getter: retorna o ID do aluno vinculado ao empréstimo
    public getIdAluno(): number {
        return this.id_aluno;
    }
    // Setter: define um novo ID de aluno para o empréstimo
    public setIdAluno(value: number) {
        this.id_aluno = value;
    }

    // Getter: retorna o ID do livro vinculado ao empréstimo
    public getIdLivro(): number {
        return this.id_livro;
    }
    // Setter: define um novo ID de livro para o empréstimo
    public setIdLivro(value: number) {
        this.id_livro = value;
    }

    // Getter: retorna a data em que o empréstimo foi realizado
    public getDataEmprestimo(): Date {
        return this.data_emprestimo;
    }
    // Setter: define uma nova data de empréstimo
    public setDataEmprestimo(value: Date) {
        this.data_emprestimo = value;
    }

    // Getter: retorna a data prevista de devolução do livro
    public getDataDevolucao(): Date {
        return this.data_devolucao;
    }
    // Setter: define uma nova data de devolução
    public setDataDevolucao(value: Date) {
        this.data_devolucao = value;
    }

    // Getter: retorna o status atual do empréstimo (ex: "Em Andamento", "Devolvido")
    public getStatusEmprestimo(): string {
        return this.status_emprestimo;
    }
    // Setter: define um novo status para o empréstimo
    public setStatusEmprestimo(value: string) {
        this.status_emprestimo = value;
    }

    // Getter: retorna se o registro do empréstimo está ativo (true) ou removido logicamente (false)
    public getStatusEmprestimoRegistro(): boolean {
        return this.status_emprestimo_registro;
    }
    // Setter: define o status do registro do empréstimo
    public setStatusEmprestimoRegistro(value: boolean) {
        this.status_emprestimo_registro = value;
    }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Emprestimo.listarEmprestimos()

    /**
    * Retorna uma lista com todos os Emprestimos cadastrados no banco de dados
    * 
    * @returns Lista com todos os Emprestimos cadastrados no banco de dados
    */
    // Método assíncrono que busca todos os empréstimos ativos e retorna uma lista de EmprestimoDTO ou null
   static async listarEmprestimos(): Promise<Array<EmprestimoDTO> | null> {
  try {
    // Query SQL com JOIN: une três tabelas (Emprestimo, Aluno e Livro) em uma única consulta
    // Isso evita múltiplas consultas ao banco — traz os dados de aluno e livro juntos com o empréstimo
    // JOIN Aluno ON e.id_aluno = a.id_aluno: conecta o empréstimo ao seu respectivo aluno
    // JOIN Livro ON e.id_livro = l.id_livro: conecta o empréstimo ao seu respectivo livro
    // WHERE status_emprestimo_registro = TRUE: traz apenas registros ativos (não removidos)
    const querySelectEmprestimo = `
      SELECT e.id_emprestimo, e.id_aluno, e.id_livro,
             e.data_emprestimo, e.data_devolucao, e.status_emprestimo, e.status_emprestimo_registro,
             a.ra, a.nome, a.sobrenome, a.celular, a.email,
             l.titulo, l.autor, l.editora, l.isbn
      FROM Emprestimo e
      JOIN Aluno a ON e.id_aluno = a.id_aluno
      JOIN Livro l ON e.id_livro = l.id_livro
      WHERE e.status_emprestimo_registro = TRUE;
    `;

    // Executa a query no banco de dados e aguarda o resultado
    const respostaBD = await database.query(querySelectEmprestimo);

    // Se o banco não retornou nenhuma linha, não há empréstimos — retorna null
    if (respostaBD.rows.length === 0) {
      return null;
    }

    // .map() transforma cada linha retornada pelo banco em um objeto EmprestimoDTO
    // O parâmetro é tipado como "any" pois os dados brutos do banco não seguem exatamente
    // a estrutura do EmprestimoDTO — a montagem do objeto é feita manualmente abaixo
    const listaDeEmprestimos: Array<EmprestimoDTO> = respostaBD.rows.map((linha: any) => ({
      id_emprestimo:              linha.id_emprestimo,
      data_emprestimo:            linha.data_emprestimo,            // Data do empréstimo
      data_devolucao:             linha.data_devolucao,             // Data de devolução (opcional)
      status_emprestimo:          linha.status_emprestimo,          // Status do empréstimo (opcional)
      status_emprestimo_registro: linha.status_emprestimo_registro, // Status do registro (opcional)

      // Objeto aninhado com os dados do aluno relacionado ao empréstimo
      aluno: {
        id_aluno:  linha.id_aluno,
        ra:        linha.ra,        // Registro Acadêmico
        nome:      linha.nome,
        sobrenome: linha.sobrenome,
        celular:   linha.celular,
        email:     linha.email
      },

      // Objeto aninhado com os dados do livro relacionado ao empréstimo
      livro: {
        id_livro: linha.id_livro,
        titulo:   linha.titulo,   // Título do livro
        autor:    linha.autor,    // Autor do livro
        editora:  linha.editora,  // Editora do livro
        isbn:     linha.isbn      // ISBN do livro
      }
    }));

    // Retorna a lista completa de empréstimos encontrados
    return listaDeEmprestimos;

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao acessar o modelo: ${error}`);
    return null;
  }
}

    /**
     * Retorna as informações de um empréstimo informado pelo ID
     * 
     * @param id_emprestimo Identificador único do empréstimo
     * @returns Objeto com informações do empréstimo
     */
    // Recebe o ID do empréstimo e retorna um único EmprestimoDTO ou null
  static async listarEmprestimo(id_emprestimo: number): Promise<EmprestimoDTO | null> {
  try {
    // Query SQL com JOIN igual ao listarEmprestimos, mas filtrando por um ID específico
    // O "$1" é o placeholder substituído pelo valor de id_emprestimo (proteção contra SQL Injection)
    const querySelectEmprestimo = `
      SELECT e.id_emprestimo, e.id_aluno, e.id_livro,
             e.data_emprestimo, e.data_devolucao, e.status_emprestimo, e.status_emprestimo_registro,
             a.ra, a.nome, a.sobrenome, a.celular, a.email,
             l.titulo, l.autor, l.editora, l.isbn
      FROM Emprestimo e
      JOIN Aluno a ON e.id_aluno = a.id_aluno
      JOIN Livro l ON e.id_livro = l.id_livro
      WHERE e.id_emprestimo = $1;
    `;

    // Executa a query passando o id_emprestimo como parâmetro (substitui o $1)
    const respostaBD = await database.query(querySelectEmprestimo, [id_emprestimo]);

    // Verifica se algum empréstimo foi encontrado antes de tentar acessar os dados
    // Sem essa verificação, acessar rows[0] quando vazio causaria um erro em runtime
    if (respostaBD.rows.length === 0) {
      return null;
    }

    // Atalho: armazena a primeira linha em uma variável para evitar repetição de "respostaBD.rows[0]"
    const row = respostaBD.rows[0];

    // Monta o objeto EmprestimoDTO com os dados retornados pelo banco
    const emprestimoDTO: EmprestimoDTO = {
      id_emprestimo:              row.id_emprestimo,
      data_emprestimo:            row.data_emprestimo,
      data_devolucao:             row.data_devolucao,
      status_emprestimo:          row.status_emprestimo,
      status_emprestimo_registro: row.status_emprestimo_registro,

      // Objeto aninhado com os dados do aluno relacionado ao empréstimo
      aluno: {
        id_aluno:  row.id_aluno,
        ra:        row.ra,
        nome:      row.nome,
        sobrenome: row.sobrenome,
        celular:   row.celular,
        email:     row.email
      },

      // Objeto aninhado com os dados do livro relacionado ao empréstimo
      livro: {
        id_livro: row.id_livro,
        titulo:   row.titulo,
        autor:    row.autor,
        editora:  row.editora,
        isbn:     row.isbn
      }
    };

    // Retorna o objeto empréstimo montado com os dados do banco
    return emprestimoDTO;

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao realizar consulta: ${error}`);
    return null;
  }
}

    /**
     * Cadastra um novo empréstimo no banco de dados
     */
    // Recebe um objeto Emprestimo completo e tenta inseri-lo no banco
 static async cadastrarEmprestimo(emprestimo: Emprestimo): Promise<boolean> {
  try {
    // Query SQL de inserção — os "$1" a "$5" serão substituídos pelos valores reais
    // "RETURNING id_emprestimo" faz o banco retornar o ID gerado automaticamente após o INSERT
    const queryInsertEmprestimo = `
      INSERT INTO Emprestimo (id_aluno, id_livro, data_emprestimo, data_devolucao, status_emprestimo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_emprestimo;
    `;

    // Organiza os valores do objeto emprestimo em um array, na mesma ordem dos placeholders ($1, $2...)
    // Atributos acessados diretamente pois estamos dentro da própria classe
    const valores = [
      emprestimo.id_aluno,           // $1 — ID do aluno
      emprestimo.id_livro,           // $2 — ID do livro
      emprestimo.data_emprestimo,    // $3 — Data do empréstimo
      emprestimo.data_devolucao,     // $4 — Data de devolução
      emprestimo.status_emprestimo   // $5 — Status do empréstimo
    ];

    // Executa a query passando o array de valores e armazena o resultado
    const resultado = await database.query(queryInsertEmprestimo, valores);

    // Usa o operador ?? (nullish coalescing) para garantir que rowCount nunca seja null
    // Se rowCount for maior que 0, pelo menos uma linha foi inserida — cadastro bem-sucedido
    if ((resultado.rowCount ?? 0) > 0) {
      console.log(`Empréstimo cadastrado com sucesso! ID: ${resultado.rows[0].id_emprestimo}`);
      return true;
    }

    // Se nenhuma linha foi afetada, o cadastro não funcionou — retorna false
    return false;

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao cadastrar empréstimo: ${error}`);
    return false;
  }
}

    /**
     * Atualiza os dados de um empréstimo existente no banco de dados
     */
    // Diferente dos outros métodos, este recebe os dados separados como parâmetros individuais (não um objeto Emprestimo)
 static async atualizarEmprestimo(
  id_emprestimo: number,     // ID do empréstimo a ser atualizado
  id_aluno: number,          // Novo ID do aluno
  id_livro: number,          // Novo ID do livro
  data_emprestimo: Date,     // Nova data de empréstimo
  data_devolucao: Date,      // Nova data de devolução
  status_emprestimo: string  // Novo status do empréstimo
): Promise<boolean> {
  try {
    // Query SQL de atualização — o WHERE garante que apenas o empréstimo com o ID correto seja alterado
    // "RETURNING id_emprestimo" retorna o ID do registro atualizado, confirmando que ele existe
    const queryUpdateEmprestimo = `
      UPDATE Emprestimo
      SET
        id_aluno         = $1,
        id_livro         = $2,
        data_emprestimo  = $3,
        data_devolucao   = $4,
        status_emprestimo = $5
      WHERE id_emprestimo = $6
      RETURNING id_emprestimo;
    `;

    // Organiza os valores em um array na mesma ordem dos placeholders da query
    // id_emprestimo vai por último ($6) pois é usado no WHERE, não no SET
    const valores = [
      id_aluno,           // $1 — novo ID do aluno
      id_livro,           // $2 — novo ID do livro
      data_emprestimo,    // $3 — nova data de empréstimo
      data_devolucao,     // $4 — nova data de devolução
      status_emprestimo,  // $5 — novo status
      id_emprestimo       // $6 — ID usado no WHERE
    ];

    // Executa a query de atualização e armazena o resultado
    const resultado = await database.query(queryUpdateEmprestimo, valores);

    // Usa o operador ?? (nullish coalescing) para garantir que rowCount nunca seja null
    // Se rowCount for 0, nenhuma linha foi alterada — o ID informado não existe no banco
    if ((resultado.rowCount ?? 0) === 0) {
      // Lança um erro manualmente para ser capturado pelo bloco catch abaixo
      throw new Error('Empréstimo não encontrado.');
    }

    // Se chegou até aqui, a atualização foi bem-sucedida — retorna true
    return true;

  } catch (error) {
    // Captura tanto erros do banco quanto o erro lançado manualmente acima
    console.error(`Erro ao atualizar empréstimo: ${error}`);
    return false;
  }
}

    /**
     * Remove um empréstimo ativo do banco de dados
     * 
     * @param id_emprestimo 
     * @returns true caso o empréstimo tenha sido removido, false caso contrário
     */
    // Realiza uma remoção lógica: não apaga o registro, apenas muda o status para FALSE
    static async removerEmprestimo(id_emprestimo: number): Promise<boolean> {
        try {
            // Query de remoção lógica — usa UPDATE para desativar o registro em vez de DELETE
            // Isso preserva o histórico de empréstimos no banco de dados
            const queryDeleteEmprestimo = `UPDATE emprestimo 
                                            SET status_emprestimo_registro = FALSE
                                            WHERE id_emprestimo=$1`;

            // Executa a query passando o ID do empréstimo como parâmetro (substitui o $1)
            const respostaBD = await database.query(queryDeleteEmprestimo, [id_emprestimo]);

            // Verifica se pelo menos uma linha foi afetada pelo UPDATE
            if (respostaBD.rowCount != 0) {
                // Exibe mensagem de sucesso no console
                console.log('Empréstimo removido com sucesso!');
                // Retorna true para indicar que a remoção foi bem-sucedida
                return true;
            }

            // Se rowCount for 0, nenhum registro foi encontrado com esse ID — retorna false
            return false;

        } catch (error) {
            // Exibe o erro no console e retorna false em caso de falha
            console.log(`Erro ao remover empréstimo: ${error}`);
            return false;
        }
    }
}

// Exporta a classe Emprestimo para que possa ser importada e usada em outros arquivos do projeto
export default Emprestimo;