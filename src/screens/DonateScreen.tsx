import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DonationData {
  amount: string;
  name: string;
  email: string;
  message: string;
}

export default function DonateScreen() {
  const [donationData, setDonationData] = useState<DonationData>({
    amount: '',
    name: '',
    email: '',
    message: '',
  });

  const [selectedAmount, setSelectedAmount] = useState<string>('');

  const quickAmounts = ['10', '25', '50', '100', '250', '500'];

  const handleQuickAmount = (amount: string) => {
    setSelectedAmount(amount);
    setDonationData({ ...donationData, amount });
  };

  const handleCustomAmount = (amount: string) => {
    setSelectedAmount('');
    setDonationData({ ...donationData, amount });
  };

  const handleSubmitDonation = () => {
    if (!donationData.amount || parseFloat(donationData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid donation amount');
      return;
    }

    if (!donationData.name || !donationData.email) {
      Alert.alert('Error', 'Please fill in your name and email');
      return;
    }

    // Here you would integrate with a payment processor like Stripe, PayPal, etc.
    Alert.alert(
      'Thank You!',
      `Your donation of $${donationData.amount} has been received. A confirmation will be sent to ${donationData.email}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setDonationData({
              amount: '',
              name: '',
              email: '',
              message: '',
            });
            setSelectedAmount('');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="heart" size={60} color="#E74C3C" />
          <Text style={styles.title}>Support Our Ministry</Text>
          <Text style={styles.subtitle}>
            Your generous donation helps us spread hope and faith
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Amount</Text>
          <View style={styles.quickAmountContainer}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountButton,
                  selectedAmount === amount && styles.quickAmountButtonSelected,
                ]}
                onPress={() => handleQuickAmount(amount)}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    selectedAmount === amount && styles.quickAmountTextSelected,
                  ]}
                >
                  ${amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.orText}>Or enter custom amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={donationData.amount}
              onChangeText={handleCustomAmount}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={donationData.name}
            onChangeText={(text) =>
              setDonationData({ ...donationData, name: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={donationData.email}
            onChangeText={(text) =>
              setDonationData({ ...donationData, email: text })
            }
          />
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Message (Optional)"
            multiline
            numberOfLines={4}
            value={donationData.message}
            onChangeText={(text) =>
              setDonationData({ ...donationData, message: text })
            }
          />
        </View>

        <TouchableOpacity
          style={styles.donateButton}
          onPress={handleSubmitDonation}
        >
          <Text style={styles.donateButtonText}>
            Donate ${donationData.amount || '0.00'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          <Ionicons name="lock-closed" size={14} color="#7F8C8D" /> Your
          donation is secure and tax-deductible
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2C3E50',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '30%',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickAmountButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  quickAmountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  quickAmountTextSelected: {
    color: '#4A90E2',
  },
  orText: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginVertical: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    padding: 15,
    color: '#2C3E50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  donateButton: {
    backgroundColor: '#E74C3C',
    padding: 18,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  securityNote: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
});
