import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {usePaystack} from 'react-native-paystack-webview';
import AntIcons from '@react-native-vector-icons/ant-design';

type User = {
  id: string;
  email: string;
};

type Props = {
  amount: number;
  user: User;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  handleVerification: (reference: string) => void;
};

const PaystackPayment = ({
  amount,
  user,
  handleVerification,
  setIsProcessing,
  isProcessing,
}: Props) => {
  const {popup} = usePaystack();

  const paynow = () => {
    if (!user) {
      Alert.alert(
        'Oops. This should not happen',
        'No user profile information found. Please close this app or log out and sign in again.',
      );
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount (₦1 or more)');
      return;
    }
    setIsProcessing(true);

    popup.newTransaction({
      email: user.email,
      amount: Number(amount),
      reference: `WALLET_FUND_${user.id}_${Date.now()}`,
      metadata: {
        id: user?.id,
        purpose: 'wallet_funding',
        custom_fields: [
          {
            display_name: 'Rider ID',
            variable_name: 'rider_id',
            value: user.id,
          },
        ],
        entityType: 'rider',
        entityId: user?.id,
      },
      onSuccess: ({reference}) => {
        handleVerification(reference);
      },
      onCancel: () => {
        setIsProcessing(false);
        Alert.alert('Cancelled', 'Payment was cancelled.');
      },
      onError: error => {
        console.log('Payment Error:', error);
        Alert.alert('Error', 'Payment failed. Please try again.');
        setIsProcessing(false);
      },
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.payButton,
        (!amount || isProcessing) && styles.payButtonDisabled,
      ]}
      onPress={paynow}
      disabled={!amount || isProcessing}>
      {isProcessing ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <AntIcons name="lock" size={16} color="#fff" />
          <Text style={styles.payButtonText}>
            Fund Wallet With ₦{amount?.toLocaleString('en-NG') || '0.00'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 30,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  paymentMethods: {
    marginTop: 20,
  },
  methodsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f9',
    padding: 12,
    borderRadius: 8,
  },
  methodText: {
    marginLeft: 10,
    fontWeight: '500',
    color: '#333',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  securityNote: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});
export default PaystackPayment;
