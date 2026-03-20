// Importa a classe Emprestimo do model — é daqui que vêm os métodos de acesso ao banco de dados
import Emprestimo from "../model/Emprestimo.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";
// Importa o tipo EmprestimoDTO para tipar os dados recebidos do front-end
import type EmprestimoDTO from "../dto/EmprestimoDTO.js";

// Define a classe EmprestimoController que HERDA da classe Emprestimo
// A herança permite acessar os métodos estáticos do model diretamente
// O controller é responsável por receber as requisições HTTP e devolver as respostas — nunca acessa o banco diretamente
class EmprestimoController extends Emprestimo {

    /**
    * Método para listar todos os empréstimos.
    * Retorna um array de empréstimos com informações dos alunos e dos livros.
    */
    // Método estático e assíncrono que busca todos os empréstimos ativos e os retorna em JSON
    // "Promise<Response>" indica que este método sempre retorna uma resposta HTTP ao final
  static async todos(req: Request, res: Response): Promise<void> {
  try {
    // Chama o método do model para buscar todos os empréstimos ativos no banco
    // O resultado já vem com os dados de aluno e livro embutidos (graças ao JOIN da query)
    const listaDeEmprestimos = await Emprestimo.listarEmprestimos();

    // Se o model retornar null, significa que houve falha na consulta
    // Retorna status 400 (Bad Request) para informar o cliente que algo deu errado
    if (!listaDeEmprestimos) {
      res.status(400).json({ mensagem: "Não foi possível recuperar as informações dos empréstimos." });
      return;
    }

    // Retorna a lista em formato JSON com status HTTP 200 (OK — requisição bem-sucedida)
    res.status(200).json(listaDeEmprestimos);

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao listar empréstimos: ${error}`);
    // Retorna status 500 (Internal Server Error) para erros inesperados do servidor
    res.status(500).json({ mensagem: "Erro ao listar os empréstimos." });
  }
}

    /**
     * Retorna informações de um empréstimo
     * @param req Objeto de requisição HTTP
     * @param res Objeto de resposta HTTP.
     * @returns Informações de empréstimo em formato JSON.
     */
    // Método que busca um único empréstimo com base no ID informado na URL (ex: GET /emprestimo/5)
  static async emprestimo(req: Request, res: Response): Promise<void> {
  try {
    // Lê o parâmetro "id" da URL e converte de string para número inteiro
    // O "as string" garante ao TypeScript que o valor existe e é uma string antes do parseInt
    const idEmprestimo: number = parseInt(req.params.id as string);

    // Valida se o ID fornecido é um número válido
    // isNaN retorna true se a conversão falhar (ex: /emprestimo/abc)
    if (isNaN(idEmprestimo)) {
      res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
      return;
    }

    // Chama o método do model passando o ID para buscar o empréstimo específico no banco
    const emprestimo = await Emprestimo.listarEmprestimo(idEmprestimo);

    // Se o model retornar null, o empréstimo não foi encontrado
    // Retorna status 404 (Not Found) para informar o cliente
    if (!emprestimo) {
      res.status(404).json({ mensagem: "Empréstimo não encontrado." });
      return;
    }

    // Retorna o objeto do empréstimo em JSON com status HTTP 200 (OK)
    res.status(200).json(emprestimo);

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao acessar método herdado: ${error}`);
    // Retorna status 500 (Internal Server Error) para erros inesperados do servidor
    res.status(500).json({ mensagem: "Erro ao recuperar as informações do empréstimo." });
  }
}

    /**
     * Cadastra um novo empréstimo.
     * Recebe os dados do empréstimo a partir da requisição e passa para o serviço.
     */
    // Método que recebe os dados do front-end e cria um novo empréstimo no banco de dados
 static async cadastrar(req: Request, res: Response): Promise<void> {
  try {
    // Lê o corpo da requisição HTTP e tipifica como EmprestimoDTO
    // O front-end envia os dados do novo empréstimo no corpo da requisição em formato JSON
    const dadosRecebidos: EmprestimoDTO = req.body;

    // Valida se os campos obrigatórios foram enviados antes de tentar cadastrar
    // Sem essa verificação, o banco poderia receber dados inválidos ou incompletos
    if (!dadosRecebidos.aluno?.id_aluno || !dadosRecebidos.livro?.id_livro || !dadosRecebidos.data_emprestimo) {
      res.status(400).json({ mensagem: "ID do aluno, ID do livro e data do empréstimo são obrigatórios." });
      return;
    }

    // Cria um novo objeto Emprestimo com os dados recebidos do front-end
    const emprestimo = new Emprestimo(
      dadosRecebidos.aluno.id_aluno,                                          // ID do aluno
      dadosRecebidos.livro.id_livro,                                          // ID do livro
      new Date(dadosRecebidos.data_emprestimo),                               // Converte string para Date
      dadosRecebidos.status_emprestimo ?? "",                                 // Se não informado, usa string vazia
      dadosRecebidos.data_devolucao ? new Date(dadosRecebidos.data_devolucao) : undefined
      // Se data_devolucao foi informada, converte para Date; senão passa undefined
      // Quando undefined, o construtor calcula automaticamente (data_emprestimo + 7 dias)
    );

    // Chama o método do model para persistir o novo empréstimo no banco de dados
    const result = await Emprestimo.cadastrarEmprestimo(emprestimo);

    if (result) {
      // Retorna mensagem de sucesso com status HTTP 201 (Created — recurso criado com sucesso)
      res.status(201).json({ mensagem: "Empréstimo cadastrado com sucesso." });
    } else {
      // Retorna status 400 (Bad Request) se o banco não conseguiu salvar
      res.status(400).json({ mensagem: "Não foi possível cadastrar o empréstimo no banco de dados." });
    }

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao cadastrar empréstimo: ${error}`);
    // Retorna status 500 (Internal Server Error) para erros inesperados do servidor
    res.status(500).json({ mensagem: "Erro ao cadastrar o empréstimo." });
  }
}

    /**
     * Atualiza um empréstimo existente.
     * Recebe os dados do empréstimo a partir da requisição e passa para o serviço.
     */
    // Método que recebe os novos dados do front-end e atualiza o empréstimo no banco
static async atualizar(req: Request, res: Response): Promise<void> {
  try {
    // Lê o parâmetro "id" da URL e converte para número inteiro
    // Exemplo de URL: PUT /emprestimo/4  →  idEmprestimo = 4
    const idEmprestimo = parseInt(req.params.id as string);

    // Valida se o ID fornecido é um número válido
    // isNaN retorna true se a conversão falhar (ex: /emprestimo/abc)
    if (isNaN(idEmprestimo)) {
      res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
      return;
    }

    // Lê o corpo da requisição e tipifica como EmprestimoDTO
    // O front-end envia os dados atualizados no corpo da requisição em formato JSON
    const dadosRecebidos: EmprestimoDTO = req.body;

    // Valida se os campos obrigatórios foram enviados antes de tentar atualizar
    // O operador ?. (optional chaining) evita crash se "aluno" ou "livro" vier undefined no body
    if (!dadosRecebidos.aluno?.id_aluno || !dadosRecebidos.livro?.id_livro || !dadosRecebidos.data_emprestimo) {
      res.status(400).json({ mensagem: "ID do aluno, ID do livro e data do empréstimo são obrigatórios." });
      return;
    }

    // Chama o método do model passando cada campo individualmente como parâmetro
    // Diferente do cadastrar, o atualizarEmprestimo recebe os dados separados (não um objeto Emprestimo)
    const result = await Emprestimo.atualizarEmprestimo(
      idEmprestimo,                                                           // ID do empréstimo (usado no WHERE)
      dadosRecebidos.aluno.id_aluno,                                          // Novo ID do aluno
      dadosRecebidos.livro.id_livro,                                          // Novo ID do livro
      new Date(dadosRecebidos.data_emprestimo),                               // Nova data de empréstimo
      dadosRecebidos.data_devolucao ? new Date(dadosRecebidos.data_devolucao) : new Date(),
      // Se data_devolucao foi informada, converte para Date; senão usa a data atual como fallback
      // ⚠️ Diferença do cadastrar: aqui usa new Date() (data atual) ao invés de undefined
      dadosRecebidos.status_emprestimo ?? ""                                  // Novo status do empréstimo
    );

    if (result) {
      // Retorna mensagem de sucesso com status HTTP 200 (OK)
      res.status(200).json({ mensagem: "Empréstimo atualizado com sucesso." });
    } else {
      // Retorna status 400 (Bad Request) se o banco não conseguiu atualizar
      // Pode indicar que o empréstimo não existe no banco
      res.status(400).json({ mensagem: "Não foi possível atualizar o empréstimo no banco de dados." });
    }

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao atualizar empréstimo: ${error}`);
    // Retorna status 500 (Internal Server Error) para erros inesperados do servidor
    res.status(500).json({ mensagem: "Erro ao atualizar o empréstimo." });
  }
}

    /**
    * Método para remover um empréstimo do banco de dados
    * 
    * @param req Objeto de requisição HTTP com o ID do empréstimo a ser removido.
    * @param res Objeto de resposta HTTP.
    * @returns Mensagem de sucesso ou erro em formato JSON.
    */
    // Método que recebe um ID pela URL e realiza a remoção lógica do empréstimo no banco
  static async remover(req: Request, res: Response): Promise<void> {
  try {
    // Lê o parâmetro "id" da URL e converte para número inteiro
    // Exemplo de URL: DELETE /emprestimo/2  →  idEmprestimo = 2
    const idEmprestimo = parseInt(req.params.id as string);

    // Valida se o ID fornecido é um número válido
    // isNaN retorna true se a conversão falhar (ex: /emprestimo/abc)
    if (isNaN(idEmprestimo)) {
      res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
      return;
    }

    // Chama o método do model para remover (logicamente) o empréstimo com o ID informado
    // O resultado é um booleano: true = removido com sucesso, false = não encontrado ou já inativo
    const resultado = await Emprestimo.removerEmprestimo(idEmprestimo);

    if (resultado) {
      // Retorna mensagem de sucesso com status HTTP 200 (OK)
      res.status(200).json({ mensagem: "Empréstimo removido com sucesso." });
    } else {
      // Retorna status 404 (Not Found) se o empréstimo não foi encontrado ou já estava inativo
      res.status(404).json({ mensagem: "Empréstimo não encontrado para exclusão." });
    }

  } catch (error) {
    // console.error é o método correto para registrar erros no Node.js
    console.error(`Erro ao remover empréstimo: ${error}`);
    // Retorna status 500 (Internal Server Error) para erros inesperados do servidor
    res.status(500).json({ mensagem: "Erro ao remover empréstimo." });
  }
}
}

// Exporta a classe EmprestimoController para que possa ser importada e usada nas rotas da aplicação
export default EmprestimoController;