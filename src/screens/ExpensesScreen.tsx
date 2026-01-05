import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Expense {
  id: string;
  category: string;
  amount: string;
  description: string;
  date: string;
}

const categories = [
  'Ministry Operations',
  'Outreach Programs',
  'Facilities',
  'Staff',
  'Events',
  'Supplies',
  'Technology',
  'Other',
];

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      category: 'Outreach Programs',
      amount: '450.00',
      description: 'Community food drive supplies',
      date: '2026-01-01',
    },
    {
      id: '2',
      category: 'Facilities',
      amount: '1200.00',
      description: 'Monthly rent payment',
      date: '2025-12-28',
    },
    {
      id: '3',
      category: 'Events',
      amount: '350.00',
      description: 'New Year service decorations',
      date: '2025-12-26',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (parseFloat(newExpense.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount).toFixed(2),
      description: newExpense.description,
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ category: '', amount: '', description: '' });
    setModalVisible(false);
    Alert.alert('Success', 'Expense added successfully');
  };

  const handleDeleteExpense = (id: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setExpenses(expenses.filter((expense) => expense.id !== id));
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'Ministry Operations': 'business',
      'Outreach Programs': 'people',
      Facilities: 'home',
      Staff: 'person',
      Events: 'calendar',
      Supplies: 'cube',
      Technology: 'laptop',
      Other: 'ellipsis-horizontal',
    };
    return iconMap[category] || 'receipt';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseIconContainer}>
          <Ionicons name={getCategoryIcon(item.category)} size={24} color="#4A90E2" />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <Text style={styles.expenseDate}>{item.date}</Text>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>${item.amount}</Text>
          <TouchableOpacity
            onPress={() => handleDeleteExpense(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>${totalExpenses.toFixed(2)}</Text>
        <Text style={styles.summarySubtext}>
          {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'}
        </Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense History</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={32} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#BDC3C7" />
          <Text style={styles.emptyStateText}>No expenses yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap the + button to add your first expense
          </Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#7F8C8D" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text
                  style={[
                    styles.pickerButtonText,
                    !newExpense.category && styles.placeholderText,
                  ]}
                >
                  {newExpense.category || 'Select a category'}
                </Text>
                <Ionicons
                  name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#7F8C8D"
                />
              </TouchableOpacity>

              {showCategoryPicker && (
                <View style={styles.categoryList}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={styles.categoryItem}
                      onPress={() => {
                        setNewExpense({ ...newExpense, category });
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Ionicons
                        name={getCategoryIcon(category)}
                        size={20}
                        color="#4A90E2"
                      />
                      <Text style={styles.categoryItemText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={newExpense.amount}
                  onChangeText={(text) =>
                    setNewExpense({ ...newExpense, amount: text })
                  }
                />
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="What was this expense for?"
                multiline
                numberOfLines={3}
                value={newExpense.description}
                onChangeText={(text) =>
                  setNewExpense({ ...newExpense, description: text })
                }
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddExpense}
              >
                <Text style={styles.submitButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  summaryCard: {
    backgroundColor: '#4A90E2',
    padding: 25,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  summarySubtext: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  addButton: {
    padding: 5,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 3,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 3,
  },
  expenseDate: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 15,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#F9F9F9',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  placeholderText: {
    color: '#BDC3C7',
  },
  categoryList: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    padding: 15,
    color: '#2C3E50',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 8,
    marginTop: 25,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
