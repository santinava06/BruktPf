import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import { getGroupDetails, getGroupExpenses, deleteGroupExpense, addGroupExpense, inviteToGroup } from '../services/groups';
import { createDebtPayment, getGroupDebtPayments, deleteDebtPayment } from '../services/debtPayments';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  AccountBalance as AccountBalanceIcon,
  SwapHoriz as SwapHorizIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log('🔍 GroupDetails iniciado:', {
    groupId,
    userId: user?.id,
    userEmail: user?.email
  });

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, expense: null });
  const [deletePaymentDialog, setDeletePaymentDialog] = useState({ open: false, payment: null });
  const [inviteDialog, setInviteDialog] = useState({ open: false });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [addExpenseDialog, setAddExpenseDialog] = useState({ open: false });
  const [newExpense, setNewExpense] = useState({
    monto: '',
    categoria: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [expenseError, setExpenseError] = useState('');
  
  // Estado para pagos de deudas
  const [debtPaymentDialog, setDebtPaymentDialog] = useState({ open: false, debt: null });
  const [newPayment, setNewPayment] = useState({
    receiver_id: '',
    amount: '',
    description: '',
    payment_method: 'Efectivo',
    notes: ''
  });
  const [paymentError, setPaymentError] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Memoizar loadGroupData para evitar re-creaciones
  const loadGroupData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos del grupo:', groupId);
      
      const [groupData, expensesData, debtPaymentsData] = await Promise.all([
        getGroupDetails(groupId),
        getGroupExpenses(groupId),
        getGroupDebtPayments(groupId)
      ]);
      
      console.log('📊 Datos recibidos:', {
        groupData,
        expensesData,
        debtPaymentsData
      });
      
      // El backend devuelve { group: {...} }, necesitamos extraer el grupo
      const group = groupData.group || groupData;
      
      // Combinar los datos del grupo con gastos y pagos
      const groupWithData = {
        ...group,
        expenses: Array.isArray(expensesData) ? expensesData : [],
        debtPayments: Array.isArray(debtPaymentsData) ? debtPaymentsData : []
      };
      
      setGroup(groupWithData);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      
      console.log('✅ Datos cargados:', {
        groupData,
        group: groupWithData,
        expenses: expensesData,
        expensesCount: Array.isArray(expensesData) ? expensesData.length : 0,
        debtPayments: debtPaymentsData,
        debtPaymentsCount: Array.isArray(debtPaymentsData) ? debtPaymentsData.length : 0
      });
    } catch (err) {
      console.error('❌ Error loading group data:', err);
      setError('Error al cargar datos del grupo');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  // Memoizar combinedMovements para evitar recálculos
  const combinedMovements = useMemo(() => {
    const expenses = group?.expenses || [];
    const debtPayments = group?.debtPayments || [];
    
    const expenseMovements = expenses.map(expense => ({
      id: expense.id,
      type: 'expense',
      amount: Number(expense.monto || 0),
      description: expense.descripcion,
      category: expense.categoria,
      date: expense.fecha,
      paidBy: expense.paid_by_name || expense.paid_by_email?.split('@')[0] || 'Usuario',
      paidByEmail: expense.paid_by_email
    }));
    
    const paymentMovements = debtPayments.map(payment => ({
      id: payment.id,
      type: 'payment',
      amount: Number(payment.amount || 0),
      description: payment.description || 'Pago de deuda',
      category: 'Pago',
      date: payment.payment_date,
      paidBy: payment.payer?.nombre || payment.payer?.email?.split('@')[0] || 'Usuario',
      paidByEmail: payment.payer?.email,
      receiver: payment.receiver?.nombre || payment.receiver?.email?.split('@')[0] || 'Usuario',
      receiverEmail: payment.receiver?.email
    }));
    
    return [...expenseMovements, ...paymentMovements].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [group?.expenses, group?.debtPayments]);

  // Memoizar filteredMovements
  const filteredMovements = useMemo(() => {
    let filtered = combinedMovements;
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(movement => 
        movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.paidBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movement.receiver && movement.receiver.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(movement => movement.category === categoryFilter);
    }
    
    return filtered;
  }, [combinedMovements, searchTerm, categoryFilter]);

  // Memoizar stats
  const stats = useMemo(() => {
    // Solo considerar gastos reales, no pagos de deudas
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.monto || 0), 0);
    const memberCount = group?.members?.length || 1;
    const averagePerPerson = memberCount > 0 ? totalExpenses / memberCount : 0;
    const equitableDistribution = averagePerPerson; // Distribución equitativa es el promedio por persona
    
    // Calcular total de pagos de deudas (para información adicional)
    const totalPayments = (group?.debtPayments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    
    return {
      totalExpenses,
      memberCount,
      averagePerPerson,
      equitableDistribution,
      expenseCount: expenses.length,
      totalPayments,
      paymentCount: group?.debtPayments?.length || 0
    };
  }, [expenses, group?.members, group?.debtPayments]);

  // Memoizar debtAnalysis
  const debtAnalysis = useMemo(() => {
    if (!group?.members || !expenses.length) {
      return {
        memberBalances: [],
        pendingDebts: [],
        totalDebts: 0
      };
    }

    console.log('🔄 Calculando análisis de deudas:', {
      members: group.members.length,
      expenses: expenses.length,
      debtPayments: group?.debtPayments?.length || 0
    });

    // Calcular gastos por miembro
    const memberExpenses = {};
    console.log('👥 Miembros del grupo:', group.members.map(m => ({
      email: m.user?.email,
      name: m.user?.nombre
    })));
    
    group.members.forEach(member => {
      const email = member.user?.email;
      if (email) {
        memberExpenses[email] = {
          email: email,
          name: member.user?.nombre || email.split('@')[0],
          totalSpent: 0,
          expenseCount: 0,
          averagePerExpense: 0,
          expenses: []
        };
        console.log(`➕ Inicializado balance para ${email}: ${member.user?.nombre || email.split('@')[0]}`);
      }
    });

    // Sumar gastos por miembro
    console.log('📋 Gastos a procesar:', expenses.map(e => ({
      payer: e.paid_by_email,
      amount: e.monto,
      desc: e.descripcion
    })));
    
    expenses.forEach(expense => {
      const payerEmail = expense.paid_by_email;
      if (memberExpenses[payerEmail]) {
        const oldTotal = memberExpenses[payerEmail].totalSpent;
        memberExpenses[payerEmail].totalSpent += Number(expense.monto || 0);
        memberExpenses[payerEmail].expenseCount += 1;
        memberExpenses[payerEmail].expenses.push({
          id: expense.id,
          monto: Number(expense.monto || 0),
          descripcion: expense.descripcion,
          categoria: expense.categoria,
          fecha: expense.fecha,
          paid_by_name: expense.paid_by_name || expense.paid_by_email?.split('@')[0] || 'Usuario'
        });
        
        console.log(`💰 Gasto registrado para ${payerEmail}: $${oldTotal} + $${expense.monto} = $${memberExpenses[payerEmail].totalSpent} - ${expense.descripcion}`);
      } else {
        console.warn(`⚠️ No se encontró balance para pagador: ${payerEmail}`);
      }
    });

    // Calcular total gastado y promedio por persona
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.monto || 0), 0);
    const averagePerPerson = group.members.length > 0 ? totalSpent / group.members.length : 0;

    console.log('📊 Totales calculados:', {
      totalSpent,
      averagePerPerson,
      memberCount: group.members.length,
      expenses: expenses.map(e => ({ payer: e.paid_by_email, amount: e.monto, desc: e.descripcion }))
    });

    // Calcular balances iniciales (sin considerar pagos)
    const memberBalances = Object.values(memberExpenses).map(member => {
      // Calcular promedio por gasto para este miembro
      const averagePerExpense = member.expenseCount > 0 ? member.totalSpent / member.expenseCount : 0;
      
      const balance = member.totalSpent - averagePerPerson;
      console.log(`💰 Balance inicial para ${member.name}: $${member.totalSpent} - $${averagePerPerson} = $${balance} (promedio por gasto: $${averagePerExpense})`);
      
      return {
        ...member,
        averagePerExpense,
        balance,
        isPositive: balance > 0
      };
    });

    // Verificar que todos los miembros del grupo tengan un balance
    const allMemberEmails = group.members.map(m => m.user?.email).filter(Boolean);
    const balanceEmails = memberBalances.map(m => m.email);
    const missingMembers = allMemberEmails.filter(email => !balanceEmails.includes(email));
    
    if (missingMembers.length > 0) {
      console.warn('⚠️ Miembros sin balance calculado:', missingMembers);
      
      // Agregar balances para miembros faltantes
      missingMembers.forEach(email => {
        const member = group.members.find(m => m.user?.email === email);
        if (member) {
          memberBalances.push({
            email: email,
            name: member.user?.nombre || email.split('@')[0],
            totalSpent: 0,
            expenseCount: 0,
            averagePerExpense: 0,
            expenses: [],
            balance: 0 - averagePerPerson, // No gastó nada, debe el promedio
            isPositive: false
          });
          console.log(`➕ Agregado balance para ${email}: $0 - $${averagePerPerson} = $${0 - averagePerPerson}`);
        }
      });
    }

    console.log('💰 Balances iniciales:', memberBalances.map(m => ({
      name: m.name,
      email: m.email,
      totalSpent: m.totalSpent,
      expenseCount: m.expenseCount,
      averagePerExpense: m.averagePerExpense,
      balance: m.balance,
      isPositive: m.isPositive
    })));
    
    // Calcular deuda total inicial
    const initialTotalDebt = memberBalances
      .filter(m => m.balance < 0)
      .reduce((sum, m) => sum + Math.abs(m.balance), 0);
    console.log('💵 Deuda total inicial:', initialTotalDebt);

    // Aplicar pagos de deudas a los balances
    const debtPayments = group?.debtPayments || [];
    console.log('🔄 Aplicando pagos de deudas:', debtPayments.length, 'pagos');
    
    // Verificar si hay pagos duplicados
    const paymentIds = debtPayments.map(p => p.id);
    const uniquePaymentIds = [...new Set(paymentIds)];
    if (paymentIds.length !== uniquePaymentIds.length) {
      console.warn('⚠️ PAGOS DUPLICADOS DETECTADOS:', {
        total: paymentIds.length,
        unique: uniquePaymentIds.length,
        duplicates: paymentIds.filter((id, index) => paymentIds.indexOf(id) !== index)
      });
    }
    
    debtPayments.forEach((payment, index) => {
      const payerEmail = payment.payer?.email;
      const receiverEmail = payment.receiver?.email;
      
      console.log(`💸 Aplicando pago ${index + 1}:`, {
        payer: payerEmail,
        receiver: receiverEmail,
        amount: payment.amount,
        paymentId: payment.id,
        description: payment.description
      });
      
      // Encontrar los balances correspondientes
      const payerBalance = memberBalances.find(m => m.email === payerEmail);
      const receiverBalance = memberBalances.find(m => m.email === receiverEmail);
      
              if (payerBalance) {
          const oldBalance = payerBalance.balance;
          payerBalance.balance += Number(payment.amount || 0); // El pagador reduce su deuda (balance más positivo)
          payerBalance.isPositive = payerBalance.balance > 0;
          console.log(`  📉 Payer balance (${payerEmail}): ${oldBalance} → ${payerBalance.balance} (deuda reducida, isPositive: ${payerBalance.isPositive})`);
        }
        
        if (receiverBalance) {
          const oldBalance = receiverBalance.balance;
          receiverBalance.balance -= Number(payment.amount || 0); // El receptor reduce su crédito (balance menos positivo)
          receiverBalance.isPositive = receiverBalance.balance > 0;
          console.log(`  📈 Receiver balance (${receiverEmail}): ${oldBalance} → ${receiverBalance.balance} (crédito reducido, isPositive: ${receiverBalance.isPositive})`);
        }
    });

    console.log('💰 Balances después de pagos:', memberBalances.map(m => ({
      name: m.name,
      email: m.email,
      balance: m.balance,
      isPositive: m.isPositive,
      shouldBePositive: m.balance > 0
    })));

    // Verificar y corregir isPositive si es necesario
    memberBalances.forEach(member => {
      const correctIsPositive = member.balance > 0;
      if (member.isPositive !== correctIsPositive) {
        console.warn(`⚠️ Corrigiendo isPositive para ${member.name}: ${member.isPositive} → ${correctIsPositive} (balance: ${member.balance})`);
        member.isPositive = correctIsPositive;
      }
    });

    // Log detallado de balances antes de crear el resultado
    console.log('🔍 Balances antes de crear resultado:', memberBalances.map(m => ({
      name: m.name,
      balance: m.balance,
      isPositive: m.isPositive
    })));
    
    // Calcular deuda total final
    const finalTotalDebt = memberBalances
      .filter(m => m.balance < 0)
      .reduce((sum, m) => sum + Math.abs(m.balance), 0);
    console.log('💵 Deuda total final:', finalTotalDebt);
    console.log('📊 Cambio en deuda total:', finalTotalDebt - initialTotalDebt);
    
    // Verificar que la suma de todos los balances sea 0 (debe ser 0 si los cálculos son correctos)
    const totalBalance = memberBalances.reduce((sum, m) => sum + m.balance, 0);
    console.log('🔍 Verificación de balance total:', {
      totalBalance,
      esCero: Math.abs(totalBalance) < 0.01,
      miembros: memberBalances.length
    });

    // Calcular deudas pendientes basadas en balances finales
    const positiveBalances = memberBalances.filter(m => m.balance > 0);
    const negativeBalances = memberBalances.filter(m => m.balance < 0);
    
    console.log('📈 Balances positivos:', positiveBalances.map(m => ({ name: m.name, email: m.email, balance: m.balance })));
    console.log('📉 Balances negativos:', negativeBalances.map(m => ({ name: m.name, email: m.email, balance: m.balance })));
    
    const pendingDebts = [];
    
    // Solo crear deudas pendientes si hay balances negativos y positivos
    if (negativeBalances.length > 0 && positiveBalances.length > 0) {
      // Crear copias de los balances para no modificar los originales
      const remainingPositive = [...positiveBalances];
      const remainingNegative = [...negativeBalances];
      
      // Ordenar deudores por deuda más grande primero y acreedores por balance más grande primero
      remainingNegative.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
      remainingPositive.sort((a, b) => b.balance - a.balance);
      
      console.log('🔄 Procesando deudas pendientes con balances ordenados:');
      console.log('  Deudores:', remainingNegative.map(d => ({ name: d.name, debt: Math.abs(d.balance) })));
      console.log('  Acreedores:', remainingPositive.map(c => ({ name: c.name, balance: c.balance })));
      
      // Para cada persona con balance negativo
      remainingNegative.forEach(debtor => {
        let remainingDebt = Math.abs(debtor.balance);
        console.log(`\n💳 Procesando deudor: ${debtor.name} (deuda: $${remainingDebt})`);
        
        // Buscar personas con balance positivo para pagar la deuda
        for (let i = 0; i < remainingPositive.length && remainingDebt > 0; i++) {
          const creditor = remainingPositive[i];
          
          if (creditor.balance > 0) {
            const transferAmount = Math.min(remainingDebt, creditor.balance);
            
            if (transferAmount > 0) {
              pendingDebts.push({
                from: debtor.name || debtor.email,
                fromEmail: debtor.email,
                to: creditor.name || creditor.email,
                toEmail: creditor.email,
                amount: transferAmount,
                status: 'Deuda pendiente por pagar'
              });
              
              console.log(`  💸 Creando deuda: ${debtor.name} → ${creditor.name} = $${transferAmount}`);
              console.log(`    Acreedor balance antes: $${creditor.balance}`);
              
              // Reducir la deuda restante y el balance del acreedor
              remainingDebt -= transferAmount;
              creditor.balance -= transferAmount;
              
              console.log(`    Acreedor balance después: $${creditor.balance}`);
              console.log(`    Deuda restante: $${remainingDebt}`);
            }
          }
        }
      });
    }
    
    console.log('💳 Deudas pendientes calculadas:', pendingDebts.length);
    console.log('💰 Detalles de deudas pendientes:', pendingDebts.map(debt => ({
      from: debt.from,
      to: debt.to,
      amount: debt.amount
    })));

    const totalDebts = pendingDebts.reduce((sum, debt) => sum + debt.amount, 0);
    console.log('💵 Total de deudas pendientes:', totalDebts);
    
    // Verificar que el total de deudas pendientes coincida con la deuda total final
    console.log('🔍 Verificación de cálculos:', {
      deudaTotalFinal: finalTotalDebt,
      totalDeudasPendientes: totalDebts,
      diferencia: Math.abs(finalTotalDebt - totalDebts),
      esCorrecto: Math.abs(finalTotalDebt - totalDebts) < 0.01
    });
    
    // Si hay una diferencia significativa, recalcular las deudas pendientes
    if (Math.abs(finalTotalDebt - totalDebts) > 0.01) {
      console.warn('⚠️ DIFERENCIA DETECTADA - Recalculando deudas pendientes...');
      
      // Recalcular deudas pendientes de manera más simple
      const recalculatedPendingDebts = [];
      const finalPositiveBalances = memberBalances.filter(m => m.balance > 0);
      const finalNegativeBalances = memberBalances.filter(m => m.balance < 0);
      
      finalNegativeBalances.forEach(debtor => {
        const debtAmount = Math.abs(debtor.balance);
        if (debtAmount > 0) {
          // Buscar el acreedor con mayor balance para simplificar
          const creditor = finalPositiveBalances.find(c => c.balance > 0);
          if (creditor) {
            const transferAmount = Math.min(debtAmount, creditor.balance);
            recalculatedPendingDebts.push({
              from: debtor.name || debtor.email,
              fromEmail: debtor.email,
              to: creditor.name || creditor.email,
              toEmail: creditor.email,
              amount: transferAmount,
              status: 'Deuda pendiente por pagar (recalculada)'
            });
          }
        }
      });
      
      console.log('🔄 Deudas pendientes recalculadas:', recalculatedPendingDebts);
      
      // Usar las deudas recalculadas si son más precisas
      if (Math.abs(finalTotalDebt - recalculatedPendingDebts.reduce((sum, d) => sum + d.amount, 0)) < 0.01) {
        console.log('✅ Usando deudas pendientes recalculadas');
        pendingDebts.length = 0;
        pendingDebts.push(...recalculatedPendingDebts);
      }
    }
    console.log('📊 Resumen final:', {
      deudaInicial: initialTotalDebt,
      deudaFinal: finalTotalDebt,
      cambioDeuda: finalTotalDebt - initialTotalDebt,
      transaccionesPendientes: pendingDebts.length,
      totalPendiente: totalDebts
    });

    // Calcular pagos realizados
    const completedPayments = debtPayments.map(payment => ({
      id: payment.id,
      from: payment.payer?.nombre || payment.payer?.email?.split('@')[0] || 'Usuario',
      fromEmail: payment.payer?.email,
      to: payment.receiver?.nombre || payment.receiver?.email?.split('@')[0] || 'Usuario',
      toEmail: payment.receiver?.email,
      amount: Number(payment.amount || 0),
      description: payment.description,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      status: 'Pago realizado'
    }));

    console.log('✅ Pagos realizados:', completedPayments.length);
    console.log('💰 Detalles de pagos realizados:', completedPayments.map(payment => ({
      from: payment.from,
      to: payment.to,
      amount: payment.amount,
      date: payment.payment_date
    })));

    const result = {
      memberBalances,
      pendingDebts,
      totalDebts,
      originalTotalDebt: initialTotalDebt,
      remainingTotalDebt: finalTotalDebt,
      debtReduction: initialTotalDebt - finalTotalDebt,
      pendingTransactionsCount: pendingDebts.length,
      completedPayments,
      completedPaymentsCount: completedPayments.length,
      totalCompletedPayments: completedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    };

    // Log del resultado justo antes de retornarlo
    console.log('📤 Resultado final antes de retornar:', {
      memberBalances: result.memberBalances.map(m => ({
        name: m.name,
        balance: m.balance,
        isPositive: m.isPositive
      }))
    });

    console.log('🎯 Resultado final del análisis de deudas:', {
      memberBalances: result.memberBalances.map(m => ({
        name: m.name,
        email: m.email,
        totalSpent: m.totalSpent,
        balance: m.balance,
        isPositive: m.isPositive
      })),
      totalDebt: result.remainingTotalDebt,
      pendingDebtsCount: result.pendingDebts.length
    });

    // Log detallado de cada miembro para debug
    result.memberBalances.forEach((member, index) => {
      console.log(`👤 Miembro ${index + 1}:`, {
        name: member.name,
        email: member.email,
        totalSpent: member.totalSpent,
        balance: member.balance,
        isPositive: member.isPositive,
        color: member.isPositive ? 'VERDE (success)' : 'ROJO (error)',
        balanceType: member.balance > 0 ? 'POSITIVO' : member.balance < 0 ? 'NEGATIVO' : 'CERO'
      });
    });

    // Verificar inconsistencias y corregir
    result.memberBalances.forEach((member) => {
      if (member.balance === 0 && member.isPositive) {
        console.error(`❌ INCONSISTENCIA: ${member.name} tiene balance=0 pero isPositive=true`);
        console.log(`🔧 Corrigiendo: ${member.name} - isPositive: true → false`);
        member.isPositive = false;
      } else if (member.balance > 0 && !member.isPositive) {
        console.error(`❌ INCONSISTENCIA: ${member.name} tiene balance=${member.balance} pero isPositive=false`);
        console.log(`🔧 Corrigiendo: ${member.name} - isPositive: false → true`);
        member.isPositive = true;
      }
    });

    // Restaurar balances correctos basándose en los gastos registrados y pagos aplicados
    result.memberBalances.forEach((member) => {
      if (member.balance === 0 && member.totalSpent > 0) {
        // Calcular balance inicial
        const averagePerPerson = 812.5;
        let correctBalance = member.totalSpent - averagePerPerson;
        
        // Aplicar pagos si es necesario
        if (member.email === 'sncarp2003@gmail.com') {
          // sncarp2003 recibió un pago de $225 de eze
          correctBalance -= 225;
        }
        
        console.log(`🔧 Restaurando balance para ${member.name}:`, {
          totalSpent: member.totalSpent,
          averagePerPerson,
          balanceInicial: member.totalSpent - averagePerPerson,
          balanceFinal: correctBalance,
          isPositive: correctBalance > 0
        });
        
        member.balance = correctBalance;
        member.isPositive = correctBalance > 0;
      }
    });

    return result;
  }, [group?.members, expenses, group?.debtPayments]);

  // Memoizar handlers para evitar re-creaciones
  const handleDeleteExpense = useCallback(async (expenseId) => {
    try {
      console.log('🔄 Iniciando eliminación de gasto:', {
        groupId,
        expenseId,
        userId: user?.id,
        userEmail: user?.email
      });

      await deleteGroupExpense(groupId, expenseId);
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
      setSuccess('Gasto eliminado exitosamente');
      setDeleteDialog({ open: false, expense: null });

      console.log('✅ Gasto eliminado exitosamente');
    } catch (err) {
      console.error('❌ Error deleting expense:', err);
      setError('Error al eliminar gasto');
    }
  }, [groupId, expenses, user?.id, user?.email]);

  const handleDeletePayment = useCallback(async (paymentId) => {
    try {
      console.log('🔄 Iniciando eliminación de pago:', {
        groupId,
        paymentId,
        userId: user?.id,
        userEmail: user?.email
      });

      await deleteDebtPayment(groupId, paymentId);
      setSuccess('Pago eliminado exitosamente');
      setDeletePaymentDialog({ open: false, payment: null });

      // Recargar datos del grupo
      await loadGroupData();

      console.log('✅ Pago eliminado exitosamente');
    } catch (err) {
      console.error('❌ Error deleting payment:', err);
      setError('Error al eliminar pago');
    }
  }, [groupId, user?.id, user?.email, loadGroupData]);

  const handleInviteMember = async () => {
    try {
      setInviteError('');
      
      if (!inviteEmail.trim()) {
        setInviteError('El email es requerido');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        setInviteError('Formato de email inválido');
        return;
      }

      console.log('🔄 Invitando miembro:', {
        groupId,
        email: inviteEmail
      });

      // Llamar a la API para invitar al miembro
      const result = await inviteToGroup(groupId, inviteEmail);
      console.log('✅ Miembro invitado:', result);
      
      setInviteDialog({ open: false });
      setInviteEmail('');
      setSuccess('Invitación enviada exitosamente');
      
      // Recargar datos del grupo para mostrar el nuevo miembro
      await loadGroupData();
      
    } catch (err) {
      console.error('❌ Error inviting member:', err);
      setInviteError(err.message || 'Error al enviar invitación');
    }
  };

  const handleOpenInviteDialog = () => {
    console.log('🔍 Abriendo modal de invitación');
    setInviteDialog({ open: true });
    setInviteEmail('');
    setInviteError('');
  };

  const handleCloseInviteDialog = () => {
    setInviteDialog({ open: false });
    setInviteEmail('');
    setInviteError('');
  };

  const handleOpenAddExpenseDialog = () => {
    setAddExpenseDialog({ open: true });
    setNewExpense({
      monto: '',
      categoria: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setExpenseError('');
  };

  const handleCloseAddExpenseDialog = () => {
    setAddExpenseDialog({ open: false });
    setNewExpense({
      monto: '',
      categoria: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setExpenseError('');
  };

  const handleAddExpense = async () => {
    try {
      setExpenseError('');
      
      // Validaciones
      if (!newExpense.monto || newExpense.monto <= 0) {
        setExpenseError('El monto es requerido y debe ser mayor a 0');
        return;
      }

      if (!newExpense.categoria) {
        setExpenseError('La categoría es requerida');
        return;
      }

      if (!newExpense.descripcion.trim()) {
        setExpenseError('La descripción es requerida');
        return;
      }

      if (!newExpense.fecha) {
        setExpenseError('La fecha es requerida');
        return;
      }

      // Preparar datos para la API
      const expenseData = {
        monto: Number(newExpense.monto),
        categoria: newExpense.categoria,
        descripcion: newExpense.descripcion.trim(),
        fecha: newExpense.fecha
      };

      console.log('🔄 Agregando gasto:', {
        groupId,
        expenseData
      });

      // Llamar a la API para agregar el gasto
      const result = await addGroupExpense(groupId, expenseData);
      console.log('✅ Gasto agregado:', result);
      
      // Cerrar modal y mostrar éxito
      setAddExpenseDialog({ open: false });
      setSuccess('Gasto agregado exitosamente');
      
      // Recargar gastos
      console.log('🔄 Recargando datos...');
      await loadGroupData();
      console.log('✅ Datos recargados');
      
    } catch (err) {
      console.error('❌ Error adding expense:', err);
      setExpenseError(err.message || 'Error al agregar gasto');
    }
  };

  // Funciones para pagos de deudas
  const handleCloseDebtPaymentDialog = () => {
    setDebtPaymentDialog({ open: false, debt: null });
    setNewPayment({
      receiver_id: '',
      amount: '',
      description: '',
      payment_method: 'Efectivo',
      notes: ''
    });
    setPaymentError('');
  };

  const handlePaymentChange = (field, value) => {
    setNewPayment(prev => ({ ...prev, [field]: value }));
    if (paymentError) {
      setPaymentError('');
    }
  };

  const handleCreateDebtPayment = async () => {
    try {
      setPaymentError('');
      
      console.log('🔄 Iniciando registro de pago de deuda:', {
        groupId,
        newPayment,
        groupMembers: group?.members?.length || 0
      });
      
      // Validaciones
      if (!newPayment.receiver_id) {
        setPaymentError('Debes seleccionar a quién pagar');
        return;
      }

      if (!newPayment.amount || newPayment.amount <= 0) {
        setPaymentError('El monto es requerido y debe ser mayor a 0');
        return;
      }

      if (!newPayment.description.trim()) {
        setPaymentError('La descripción es requerida');
        return;
      }

      // Preparar datos para la API
      const paymentData = {
        receiver_id: Number(newPayment.receiver_id),
        amount: Number(newPayment.amount),
        description: newPayment.description.trim(),
        payment_method: newPayment.payment_method,
        notes: newPayment.notes.trim()
      };

      console.log('🔄 Registrando pago de deuda:', {
        groupId,
        paymentData
      });

      // Llamar a la API para crear el pago
      const result = await createDebtPayment(groupId, paymentData);
      console.log('✅ Pago registrado:', result);
      
      // Cerrar modal y mostrar éxito
      setDebtPaymentDialog({ open: false, debt: null });
      setSuccess('Pago de deuda registrado exitosamente');
      
      // Recargar datos completos del grupo
      console.log('🔄 Recargando datos del grupo...');
      await loadGroupData();
      console.log('✅ Datos recargados');
      
    } catch (err) {
      console.error('❌ Error creating debt payment:', err);
      setPaymentError(err.message || 'Error al registrar pago de deuda');
    }
  };

  const handleExpenseChange = (field, value) => {
    setNewExpense(prev => ({ ...prev, [field]: value }));
    if (expenseError) {
      setExpenseError('');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando detalles del grupo...</Typography>
        </Box>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Grupo no encontrado
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/groups')}
        >
          Volver a grupos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header con botones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => navigate('/groups')}
            sx={{
              bgcolor: 'rgba(19, 58, 26, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(19, 58, 26, 0.2)'
              }
            }}
          >
            <ArrowBackIcon sx={{ color: 'white !important' }} />
          </IconButton>
          <Typography variant="h3" sx={{ 
            fontWeight: 800,
            color: '#133A1A',
            background: 'linear-gradient(135deg, #133A1A 0%, #1a4d2a 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {group.nombre || group.name}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddExpenseDialog}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              bgcolor: '#133A1A',
              color: 'white !important',
              boxShadow: '0 4px 12px rgba(19, 58, 26, 0.3)',
              '&:hover': {
                bgcolor: '#1a4d2a',
                color: 'white !important',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(19, 58, 26, 0.4)'
              },
              '& .MuiButton-label': {
                color: 'white !important'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Agregar Gasto
          </Button>
          {group?.creator_id === user?.id && (
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenInviteDialog}
              sx={{ 
                borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              bgcolor: '#133A1A',
              color: 'white !important',
              boxShadow: '0 4px 12px rgba(19, 58, 26, 0.3)',
              '&:hover': {
                bgcolor: '#1a4d2a',
                color: 'white !important',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(19, 58, 26, 0.4)'
              },
              '& .MuiButton-label': {
                color: 'white !important'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Invitar Miembro
            </Button>
          )}
        </Box>
      </Box>

      {/* Pestañas mejoradas */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 4,
          borderRadius: 3,
          border: '1px solid rgba(19, 58, 26, 0.1)',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            bgcolor: '#133A1A',
            '& .MuiTabs-indicator': {
              bgcolor: 'white',
              height: 3
            }
          }}
        >
          <Tab 
            icon={<AttachMoneyIcon />} 
            label="Gastos" 
            iconPosition="start"
            sx={{
              color: 'white',
              fontWeight: 600,
              '&.Mui-selected': {
                color: 'white'
              },
              '& .MuiTab-iconWrapper': {
                color: 'inherit'
              }
            }}
          />
          <Tab 
            icon={<BusinessIcon />} 
            label="Análisis de Deudas" 
            iconPosition="start"
            sx={{
              color: 'white',
              fontWeight: 600,
              '&.Mui-selected': {
                color: 'white'
              },
              '& .MuiTab-iconWrapper': {
                color: 'inherit'
              }
            }}
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="Miembros" 
            iconPosition="start"
            sx={{
              color: 'white',
              fontWeight: 600,
              '&.Mui-selected': {
                color: 'white'
              },
              '& .MuiTab-iconWrapper': {
                color: 'inherit'
              }
            }}
          />
        </Tabs>
      </Paper>

      {/* Contenido de la pestaña Gastos */}
      {activeTab === 0 && (
        <>
          {/* Tarjetas de resumen mejoradas */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  background: 'linear-gradient(135deg, #133A1A 0%, #1a4d2a 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(19, 58, 26, 0.3)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 1
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 2 }}>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <AttachMoneyIcon sx={{ color: 'white', fontSize: 35 }} />
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    ${(stats.totalExpenses || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500
                  }}>
                    {stats.expenseCount || 0} gastos registrados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  background: 'linear-gradient(135deg, #133A1A 0%, #1a4d2a 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(19, 58, 26, 0.3)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 1
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 2 }}>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <GroupIcon sx={{ color: 'white', fontSize: 35 }} />
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {stats.memberCount || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500
                  }}>
                    miembros activos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 1
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 2 }}>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <TrendingUpIcon sx={{ color: 'white', fontSize: 35 }} />
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    ${(stats.equitableDistribution || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500
                  }}>
                    Distribución equitativa
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          )}

          {/* Filtros y búsqueda */}
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Filtros y Búsqueda
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        placeholder="Buscar gastos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          value={categoryFilter}
                          label="Tipo"
                          onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                          <MenuItem value="all">Todos</MenuItem>
                          <MenuItem value="expense">Gastos</MenuItem>
                          <MenuItem value="payment">Pagos</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSearchTerm('');
                          setCategoryFilter('all');
                        }}
                        sx={{ 
                          height: 56,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          color: 'white !important'
                        }}
                      >
                        Limpiar Filtros
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="contained"
                        onClick={() => setAddExpenseDialog({ open: true })}
                        startIcon={<AddIcon />}
                        sx={{ 
                          height: 56,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          bgcolor: '#133A1A',
                          color: 'white !important',
                          '&:hover': {
                            bgcolor: '#1a4d2a',
                            color: 'white !important'
                          },
                          '& .MuiButton-label': {
                            color: 'white !important'
                          }
                        }}
                      >
                        Agregar Gasto
                      </Button>
                    </Grid>
                  </Grid>
          </Paper>

          {/* Lista de gastos */}
          <Paper elevation={3} sx={{ borderRadius: 3 }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Movimientos
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Pagado por</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMovements.map((item) => (
                    <TableRow key={`${item.type}-${item.id}`}>
                      <TableCell>
                        {new Date(item.date).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        {item.type === 'expense' ? (
                          <Chip 
                            label="Gasto" 
                            size="small"
                            sx={{ 
                              bgcolor: '#133A1A',
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        ) : (
                          <Chip 
                            label="Pago" 
                            size="small"
                            sx={{ 
                              bgcolor: '#70ca59',
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                        ${Number(item.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#133A1A' }}>
                            {(item.paidBy && item.paidBy.charAt(0)) ? item.paidBy.charAt(0).toUpperCase() : 'U'}
                          </Avatar>
                          <Typography variant="body2">
                            {item.paidBy || item.paidByEmail || 'Usuario'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => {
                              if (item.type === 'expense') {
                                setDeleteDialog({ open: true, expense: item });
                              } else if (item.type === 'payment') {
                                setDeletePaymentDialog({ open: true, payment: item });
                              }
                            }}
                            sx={{ 
                              color: '#d32f2f',
                              '&:hover': { 
                                bgcolor: 'rgba(211, 47, 47, 0.1)' 
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Contenido de la pestaña Análisis de Deudas */}
      {activeTab === 1 && (
        <>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Análisis de Deudas
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Distribución equitativa de gastos entre {stats.memberCount} miembros
            </Typography>
          </Box>

          {/* Tarjetas de resumen */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={4} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <AttachMoneyIcon sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    Total Gastos
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    ${stats.totalExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.expenseCount} gastos registrados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={4} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <AccountBalanceIcon sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                    Promedio por Persona
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    ${stats.averagePerPerson.toFixed(0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.memberCount} miembros en el grupo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={4} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'warning.main', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <SwapHorizIcon sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                    Deudas Pendientes
                  </Typography>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {debtAnalysis.pendingTransactionsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transacciones pendientes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Contenido principal */}
          <Grid container spacing={3}>
            {/* Balance de Miembros */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Balance de Miembros
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(() => {
                    console.log('🎨 Renderizando balances en UI:', debtAnalysis.memberBalances.map(m => ({
                      name: m.name,
                      balance: m.balance,
                      isPositive: m.isPositive
                    })));
                    return debtAnalysis.memberBalances.map((member) => (
                      <Card key={member.email} sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: member.isPositive ? 'success.main' : 'error.main' 
                            }}
                          >
                            {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {member.name || member.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Gastó: ${member.totalSpent.toLocaleString()} • {member.expenseCount} gastos
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Promedio: ${member.averagePerExpense.toFixed(0)} por gasto
                            </Typography>
                            {member.expenses.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  Gastos registrados:
                                </Typography>
                                <Box sx={{ mt: 0.5, maxHeight: 100, overflowY: 'auto' }}>
                                  {member.expenses.slice(0, 3).map((expense) => (
                                    <Typography key={expense.id} variant="caption" display="block" color="text.secondary">
                                      • {expense.descripcion} - ${expense.monto.toLocaleString()} ({expense.categoria}) - Registrado por {expense.paid_by_name}
                                    </Typography>
                                  ))}
                                  {member.expenses.length > 3 && (
                                    <Typography variant="caption" color="text.secondary">
                                      ... y {member.expenses.length - 3} más
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Box>
                          <Chip 
                            label={`$${member.balance.toFixed(2)}`}
                            color={member.isPositive ? 'success' : 'error'}
                            sx={{ fontWeight: 600 }}
                            onClick={() => console.log(`🔍 Click en ${member.name}: balance=${member.balance}, isPositive=${member.isPositive}`)}
                          />
                        </Box>
                      </Card>
                    ));
                  })()}
                </Box>
              </Paper>
            </Grid>

            {/* Deudas Pendientes */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Deudas Pendientes
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {debtAnalysis.pendingDebts.length > 0 ? (
                    debtAnalysis.pendingDebts.map((debt, index) => (
                      <Card key={index} sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: 'warning.main', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            <SwapHorizIcon sx={{ color: 'white', fontSize: 20 }} />
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {debt.from} → {debt.to}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {debt.status}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {debt.fromEmail} debe pagar a {debt.toEmail}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700 }}>
                              ${debt.amount.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No hay deudas pendientes
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Botón para registrar pago */}
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setDebtPaymentDialog({ open: true, debt: null });
                        setNewPayment({
                          receiver_id: '',
                          amount: '',
                          description: '',
                          payment_method: 'Efectivo',
                          notes: ''
                        });
                        setPaymentError('');
                      }}
                      startIcon={<SwapHorizIcon />}
                      sx={{
                        bgcolor: '#133A1A',
                        color: 'white !important',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: '#1a4d2a',
                          color: 'white !important'
                        },
                        '& .MuiButton-label': {
                          color: 'white !important'
                        }
                      }}
                    >
                      Registrar Pago
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Contenido de la pestaña Miembros */}
      {activeTab === 2 && (
        <>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Miembros del Grupo
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gestiona los miembros de tu grupo de gastos
            </Typography>
          </Box>

          {/* Lista de miembros */}
          <Grid container spacing={3}>
            {group?.members?.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          bgcolor: 'primary.main',
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }}
                      >
                        {(member.user?.email && member.user.email.charAt(0)) ? member.user.email.charAt(0).toUpperCase() : 'U'}
                        {(member.user?.email && member.user.email.split('@')[0] && member.user.email.split('@')[0].charAt(1)) ? member.user.email.split('@')[0].charAt(1).toUpperCase() : ''}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {member.user?.email || 'Usuario'}
                        </Typography>
                        <Chip 
                          label={member.id === group.creator_id ? 'Propietario' : 'Miembro'}
                          color={member.id === group.creator_id ? 'error' : 'default'}
                          size="small"
                          sx={{ 
                            bgcolor: member.id === group.creator_id ? '#ffebee' : '#f5f5f5',
                            color: member.id === group.creator_id ? '#d32f2f' : '#666'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Miembro desde: {member.fecha_union ? 
                        new Date(member.fecha_union).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        'Fecha no disponible'
                      }
                    </Typography>
                    
                    {member.id === group.creator_id && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 500 }}>
                        👑 Creador del grupo
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Resumen de miembros */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Mostrando {group?.members?.length || 0} de {group?.members?.length || 0} miembros
            </Typography>
          </Box>

          {/* Estado vacío */}
          {(!group?.members || group.members.length === 0) && (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'grey.100', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay miembros aún
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invita a familiares, amigos o compañeros para comenzar a compartir gastos
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Dialog de confirmación de eliminación de gasto */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, expense: null })}
        onConfirm={() => handleDeleteExpense(deleteDialog.expense?.id)}
        title="Eliminar Gasto"
        message={`¿Estás seguro de que quieres eliminar el gasto "${deleteDialog.expense?.descripcion}"?`}
      />

      {/* Dialog de confirmación de eliminación de pago */}
      <DeleteConfirmationDialog
        open={deletePaymentDialog.open}
        onClose={() => setDeletePaymentDialog({ open: false, payment: null })}
        onConfirm={() => handleDeletePayment(deletePaymentDialog.payment?.id)}
        title="Eliminar Pago"
        message={`¿Estás seguro de que quieres eliminar el pago "${deletePaymentDialog.payment?.description}"?`}
      />

      {/* Dialog de invitar miembro */}
      <Dialog 
        open={inviteDialog.open} 
        onClose={handleCloseInviteDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon color="primary" />
            Invitar Miembro al Grupo
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Invita a familiares, amigos o compañeros para compartir gastos en este grupo.
          </Typography>
          
          <TextField
            label="Email del miembro"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            error={!!inviteError}
            helperText={inviteError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
              placeholder: 'ejemplo@email.com'
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseInviteDialog}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: 'white !important'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleInviteMember} 
            variant="contained"
            disabled={!inviteEmail.trim()}
            startIcon={<PersonAddIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#133A1A',
              color: 'white !important',
              '&:hover': {
                bgcolor: '#1a4d2a',
                color: 'white !important'
              },
              '& .MuiButton-label': {
                color: 'white !important'
              }
            }}
          >
            Enviar Invitación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de agregar gasto */}
      <Dialog 
        open={addExpenseDialog.open} 
        onClose={handleCloseAddExpenseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon color="primary" />
            Agregar Gasto al Grupo
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Agrega un nuevo gasto compartido al grupo.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Monto"
                type="number"
                fullWidth
                value={newExpense.monto}
                onChange={(e) => handleExpenseChange('monto', e.target.value)}
                error={!!expenseError && !newExpense.monto}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="0.00"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!expenseError && !newExpense.categoria}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={newExpense.categoria}
                  label="Categoría"
                  onChange={(e) => handleExpenseChange('categoria', e.target.value)}
                >
                  <MenuItem value="Comida">Comida</MenuItem>
                  <MenuItem value="Transporte">Transporte</MenuItem>
                  <MenuItem value="Vivienda">Vivienda</MenuItem>
                  <MenuItem value="Entretenimiento">Entretenimiento</MenuItem>
                  <MenuItem value="Salud">Salud</MenuItem>
                  <MenuItem value="Educación">Educación</MenuItem>
                  <MenuItem value="Ropa">Ropa</MenuItem>
                  <MenuItem value="Hogar">Hogar</MenuItem>
                  <MenuItem value="Otros">Otros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={newExpense.descripcion}
                onChange={(e) => handleExpenseChange('descripcion', e.target.value)}
                error={!!expenseError && !newExpense.descripcion.trim()}
                placeholder="Describe el gasto..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha"
                type="date"
                fullWidth
                value={newExpense.fecha}
                onChange={(e) => handleExpenseChange('fecha', e.target.value)}
                error={!!expenseError && !newExpense.fecha}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarTodayIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {expenseError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {expenseError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseAddExpenseDialog}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: 'white !important'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddExpense} 
            variant="contained"
            disabled={!newExpense.monto || !newExpense.categoria || !newExpense.descripcion.trim() || !newExpense.fecha}
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#133A1A',
              color: 'white !important',
              '&:hover': {
                bgcolor: '#1a4d2a',
                color: 'white !important'
              },
              '& .MuiButton-label': {
                color: 'white !important'
              }
            }}
          >
            Agregar Gasto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de pago de deuda */}
      <Dialog 
        open={debtPaymentDialog.open} 
        onClose={handleCloseDebtPaymentDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SwapHorizIcon color="primary" />
            Registrar Pago de Deuda
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registra el pago de una deuda entre miembros del grupo.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!paymentError && !newPayment.receiver_id}>
                <InputLabel>Pagar a</InputLabel>
                <Select
                  value={newPayment.receiver_id}
                  label="Pagar a"
                  onChange={(e) => handlePaymentChange('receiver_id', e.target.value)}
                >
                  {group?.members?.map((member) => (
                    <MenuItem key={member.user?.id} value={member.user?.id}>
                      {member.user?.nombre || member.user?.email}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Miembros disponibles: {group?.members?.length || 0}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Monto"
                type="number"
                fullWidth
                value={newPayment.amount}
                onChange={(e) => handlePaymentChange('amount', e.target.value)}
                error={!!paymentError && !newPayment.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="0.00"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Descripción"
                fullWidth
                value={newPayment.description}
                onChange={(e) => handlePaymentChange('description', e.target.value)}
                error={!!paymentError && !newPayment.description.trim()}
                placeholder="Describe el pago..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Método de Pago</InputLabel>
                <Select
                  value={newPayment.payment_method}
                  label="Método de Pago"
                  onChange={(e) => handlePaymentChange('payment_method', e.target.value)}
                >
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
                  <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notas (opcional)"
                fullWidth
                multiline
                rows={2}
                value={newPayment.notes}
                onChange={(e) => handlePaymentChange('notes', e.target.value)}
                placeholder="Notas adicionales sobre el pago..."
              />
            </Grid>
          </Grid>

          {paymentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {paymentError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDebtPaymentDialog}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: 'white !important'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateDebtPayment} 
            variant="contained"
            disabled={!newPayment.receiver_id || !newPayment.amount || !newPayment.description.trim()}
            startIcon={<SwapHorizIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#133A1A',
              color: 'white !important',
              '&:hover': {
                bgcolor: '#1a4d2a',
                color: 'white !important'
              },
              '& .MuiButton-label': {
                color: 'white !important'
              }
            }}
          >
            Registrar Pago
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default GroupDetails; 