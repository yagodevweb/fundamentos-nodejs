import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}
class CreateTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public execute({ title, value, type }: Request): Transaction {
    if (!CreateTransactionService.validateTransactionType(type)) {
      throw new Error('Atenção: Tipo de transação inválido.');
    }

    if (
      !CreateTransactionService.checkAvailableBalance(
        this.transactionsRepository,
        { value, type },
      )
    ) {
      throw new Error(
        'Atenção: Saldo insuficiente para a operação de outcome.',
      );
    }

    const transaction = this.transactionsRepository.create({
      title,
      value,
      type,
    });

    return transaction;
  }

  private static validateTransactionType(type: string): boolean {
    if (!['income', 'outcome'].includes(type)) {
      return false;
    }

    return true;
  }

  private static checkAvailableBalance(
    transactionsRepository: TransactionsRepository,
    { value, type }: Omit<Request, 'title'>,
  ): boolean {
    if (type === 'outcome') {
      const { total } = transactionsRepository.getBalance();

      if (value > total) {
        return false;
      }
    }

    return true;
  }
}

export default CreateTransactionService;
