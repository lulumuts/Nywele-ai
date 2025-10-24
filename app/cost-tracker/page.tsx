'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp, PieChart, Calendar, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';

interface Expense {
  id: string;
  date: string;
  category: 'product' | 'salon' | 'tools' | 'maintenance';
  style?: string;
  amount: number;
  description: string;
}

export default function CostTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(5000);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'product',
    date: new Date().toISOString().split('T')[0],
  });

  // Load expenses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nywele-expenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    }
    const savedBudget = localStorage.getItem('nywele-budget');
    if (savedBudget) {
      setMonthlyBudget(Number(savedBudget));
    }
  }, []);

  // Save expenses to localStorage
  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem('nywele-expenses', JSON.stringify(newExpenses));
  };

  const addExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      alert('Please fill in all fields');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      date: newExpense.date || new Date().toISOString().split('T')[0],
      category: newExpense.category || 'product',
      style: newExpense.style,
      amount: newExpense.amount,
      description: newExpense.description,
    };

    saveExpenses([expense, ...expenses]);
    setNewExpense({
      category: 'product',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const deleteExpense = (id: string) => {
    saveExpenses(expenses.filter(e => e.id !== id));
  };

  const saveBudget = () => {
    localStorage.setItem('nywele-budget', monthlyBudget.toString());
    alert('Budget saved!');
  };

  // Calculate current month spending
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetRemaining = monthlyBudget - totalSpent;
  const budgetPercentage = (totalSpent / monthlyBudget) * 100;

  // Category breakdown
  const categoryTotals = {
    product: currentMonthExpenses.filter(e => e.category === 'product').reduce((sum, e) => sum + e.amount, 0),
    salon: currentMonthExpenses.filter(e => e.category === 'salon').reduce((sum, e) => sum + e.amount, 0),
    tools: currentMonthExpenses.filter(e => e.category === 'tools').reduce((sum, e) => sum + e.amount, 0),
    maintenance: currentMonthExpenses.filter(e => e.category === 'maintenance').reduce((sum, e) => sum + e.amount, 0),
  };

  const categoryLabels: Record<string, string> = {
    product: 'Products',
    salon: 'Salon Visits',
    tools: 'Tools & Equipment',
    maintenance: 'Maintenance',
  };

  return (
    <>
      <Navbar />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&display=swap');
      `}</style>
      
      <div className="min-h-screen bg-peach px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#9E6240', fontFamily: 'Caprasimo, serif' }}>
              Hair Care Budget Tracker
            </h1>
            <p className="text-xl" style={{ color: '#914600' }}>
              Track your spending and save money on your hair care routine
            </p>
          </motion.div>

          {/* Budget Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl shadow-xl p-6" 
              style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#914600' }}>Monthly Budget</h3>
                <DollarSign size={24} style={{ color: '#AF5500' }} />
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="text-3xl font-bold border-none outline-none bg-transparent"
                  style={{ color: '#AF5500', width: '120px' }}
                />
                <span className="text-xl" style={{ color: '#914600' }}>KES</span>
              </div>
              <button
                onClick={saveBudget}
                className="w-full py-2 rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#9E6240', color: 'white' }}
              >
                Save Budget
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl shadow-xl p-6"
              style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#914600' }}>Total Spent</h3>
                {budgetPercentage > 100 ? (
                  <TrendingUp size={24} style={{ color: '#DC2626' }} />
                ) : (
                  <TrendingDown size={24} style={{ color: '#16A34A' }} />
                )}
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: '#AF5500' }}>
                KES {totalSpent.toLocaleString()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(budgetPercentage, 100)}%`,
                    backgroundColor: budgetPercentage > 100 ? '#DC2626' : budgetPercentage > 80 ? '#F59E0B' : '#16A34A'
                  }}
                />
              </div>
              <p className="text-sm mt-2" style={{ color: '#914600' }}>
                {budgetPercentage.toFixed(0)}% of budget used
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl shadow-xl p-6"
              style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#914600' }}>Remaining</h3>
                <Calendar size={24} style={{ color: '#AF5500' }} />
              </div>
              <p className="text-3xl font-bold mb-2" style={{ color: budgetRemaining < 0 ? '#DC2626' : '#16A34A' }}>
                KES {Math.abs(budgetRemaining).toLocaleString()}
              </p>
              <p className="text-sm" style={{ color: '#914600' }}>
                {budgetRemaining < 0 ? 'Over budget' : 'Left to spend this month'}
              </p>
            </motion.div>
          </div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl shadow-xl p-6 mb-8"
            style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <PieChart size={28} style={{ color: '#914600' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#914600' }}>Category Breakdown</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(categoryTotals).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'rgba(158, 98, 64, 0.1)' }}>
                  <span className="font-semibold" style={{ color: '#914600' }}>{categoryLabels[category]}</span>
                  <span className="text-lg font-bold" style={{ color: '#AF5500' }}>KES {amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Add Expense Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
              style={{ backgroundColor: '#914600', color: 'white' }}
            >
              <Plus size={20} />
              Add New Expense
            </button>
          </div>

          {/* Add Expense Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-2xl shadow-xl p-6 mb-8"
              style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: '#914600' }}>Add Expense</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#914600' }}>Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl"
                    style={{ borderColor: '#9E6240' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#914600' }}>Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 rounded-xl"
                    style={{ borderColor: '#9E6240' }}
                  >
                    <option value="product">Products</option>
                    <option value="salon">Salon Visit</option>
                    <option value="tools">Tools & Equipment</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#914600' }}>Amount (KES)</label>
                  <input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 rounded-xl"
                    style={{ borderColor: '#9E6240' }}
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#914600' }}>Style (Optional)</label>
                  <input
                    type="text"
                    value={newExpense.style || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, style: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl"
                    style={{ borderColor: '#9E6240' }}
                    placeholder="Box Braids"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#914600' }}>Description</label>
                  <input
                    type="text"
                    value={newExpense.description || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 rounded-xl"
                    style={{ borderColor: '#9E6240' }}
                    placeholder="Shampoo, Conditioner, Leave-in"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addExpense}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all"
                  style={{ backgroundColor: '#914600', color: 'white' }}
                >
                  Add Expense
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border-2 rounded-xl font-semibold transition-all"
                  style={{ borderColor: '#9E6240', color: '#914600' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Expense List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl shadow-xl p-6"
            style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#914600' }}>Recent Expenses</h2>
            
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign size={48} className="mx-auto mb-4" style={{ color: 'rgba(158, 98, 64, 0.3)' }} />
                <p style={{ color: '#914600' }}>No expenses tracked yet. Add your first expense to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.slice(0, 20).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-md"
                    style={{ backgroundColor: 'rgba(158, 98, 64, 0.05)', border: '1px solid rgba(158, 98, 64, 0.2)' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)', color: '#914600' }}>
                          {categoryLabels[expense.category]}
                        </span>
                        <span className="text-sm" style={{ color: '#914600' }}>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold" style={{ color: '#914600' }}>{expense.description}</p>
                      {expense.style && (
                        <p className="text-sm" style={{ color: '#AF5500' }}>Style: {expense.style}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold" style={{ color: '#AF5500' }}>KES {expense.amount.toLocaleString()}</span>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 rounded-lg transition-all hover:bg-red-100"
                        style={{ color: '#DC2626' }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Cost Saving Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl shadow-xl p-6 mt-8"
            style={{ backgroundColor: 'rgba(127, 62, 0, 0.1)', border: '2px solid #9E6240' }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: '#914600' }}>💡 Cost-Saving Tips</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2" style={{ color: '#914600' }}>
                <span className="text-lg">•</span>
                <span>Buy products in bulk during sales to save 20-30%</span>
              </li>
              <li className="flex items-start gap-2" style={{ color: '#914600' }}>
                <span className="text-lg">•</span>
                <span>Protective styles can last 6-8 weeks, reducing maintenance costs</span>
              </li>
              <li className="flex items-start gap-2" style={{ color: '#914600' }}>
                <span className="text-lg">•</span>
                <span>DIY deep conditioning treatments save KES 1,500+ monthly</span>
              </li>
              <li className="flex items-start gap-2" style={{ color: '#914600' }}>
                <span className="text-lg">•</span>
                <span>Multi-use products (leave-in that works as detangler) reduce spending</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </>
  );
}

