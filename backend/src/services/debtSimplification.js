/**
 * Servicio de Simplificación de Deudas
 * Algoritmo: Minimización de Flujos de Efectivo (Min Cash Flow)
 */

// Encontrar el índice del valor mínimo (máximo deudor)
const getMinIndex = (amount) => {
    let minInd = 0;
    for (let i = 1; i < amount.length; i++) {
        if (amount[i] < amount[minInd]) {
            minInd = i;
        }
    }
    return minInd;
};

// Encontrar el índice del valor máximo (máximo acreedor)
const getMaxIndex = (amount) => {
    let maxInd = 0;
    for (let i = 1; i < amount.length; i++) {
        if (amount[i] > amount[maxInd]) {
            maxInd = i;
        }
    }
    return maxInd;
};

// Función recursiva para resolver las deudas
const minCashFlowRec = (amount, users, transactions) => {
    const mxCredit = getMaxIndex(amount);
    const mxDebit = getMinIndex(amount);

    // Si ambos son 0, hemos terminado (usamos un pequeño margen por errores de punto flotante)
    if (Math.abs(amount[mxCredit]) < 0.01 && Math.abs(amount[mxDebit]) < 0.01) {
        return;
    }

    // Encontrar el mínimo entre lo que debe el deudor y lo que le deben al acreedor
    const min = Math.min(-amount[mxDebit], amount[mxCredit]);

    // Registrar la transacción
    if (min > 0.01) { // Solo si la transacción es significativa
        transactions.push({
            from: users[mxDebit], // El objeto usuario completo o ID
            to: users[mxCredit],
            amount: parseFloat(min.toFixed(2))
        });
    }

    // Actualizar balances
    amount[mxCredit] -= min;
    amount[mxDebit] += min;

    // Recursión
    minCashFlowRec(amount, users, transactions);
};

export const simplifyDebts = (balances) => {
    // balances es un array de objetos: { user: Object, balance: Number }
    // donde balance positivo significa que le deben, negativo que debe.

    if (!balances || balances.length === 0) return [];

    // Filtrar usuarios con balance 0
    const activeBalances = balances.filter(b => Math.abs(b.balance) > 0.01);

    if (activeBalances.length === 0) return [];

    const amount = activeBalances.map(b => b.balance);
    const users = activeBalances.map(b => b.user);
    const transactions = [];

    minCashFlowRec(amount, users, transactions);

    return transactions;
};
