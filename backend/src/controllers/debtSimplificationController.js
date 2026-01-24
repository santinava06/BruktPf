import { simplifyDebts } from '../services/debtSimplification.js';

export const simplifyGroupDebts = async (req, res) => {
    try {
        const { balances } = req.body;

        if (!balances || !Array.isArray(balances)) {
            return res.status(400).json({ error: 'Se requiere un array de balances' });
        }

        // Validar estructura de balances
        const invalidBalances = balances.filter(b =>
            !b.user || typeof b.balance !== 'number'
        );

        if (invalidBalances.length > 0) {
            return res.status(400).json({ error: 'Formato de balances inválido' });
        }

        // Verificar suma cero (aproximadamente)
        const sum = balances.reduce((acc, curr) => acc + curr.balance, 0);
        if (Math.abs(sum) > 0.1) {
            return res.status(400).json({
                error: 'La suma de balances no es cero',
                sum,
                details: 'El sistema de deudas debe estar balanceado para poder simplificarse'
            });
        }

        const simplifiedTransactions = simplifyDebts(balances);

        res.json(simplifiedTransactions);

    } catch (error) {
        console.error('Error simplifying debts:', error);
        res.status(500).json({ error: 'Error interno al simplificar deudas' });
    }
};
