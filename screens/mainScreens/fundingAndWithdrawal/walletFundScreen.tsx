import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import {useNavigation} from '@react-navigation/native';
import {PaystackProvider} from 'react-native-paystack-webview';
import {useVerifyWalletFundingMutation} from '../../../store/walletApi';
import {useSelector} from 'react-redux';
import PaystackPayment from '../../../components/paystackPayment';

const WalletFundScreen = () => {
  const navigation: any = useNavigation();
  const user = useSelector((state: any) => state.auth.user);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifyFunding] = useVerifyWalletFundingMutation();

  const handleGoBack = () => navigation.goBack();

  const handleVerification = async (reference: string) => {
    try {
      const response = await verifyFunding({trxref: reference}).unwrap();
      console.log('payment verification response:', response);
      if (response.success) {
        navigation.navigate('PaymentSuccess', {
          amount,
          newBalance:
            response?.data?.result?.wallet?.balance || 'Not Available',
        });
      }
    } catch (error: any) {
      console.log('payment verification error:', error);
      Alert.alert(
        'Error',
        (typeof error.response == 'string' && error.response) ||
          error.message ||
          (typeof error.error == 'string' && error.response) ||
          'Payment verification failed',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <AntIcons name="left" size={24} color="teal" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fund Wallet</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Amount</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          <View style={styles.paymentMethods}>
            <Text style={styles.methodsTitle}>Payment Method</Text>
            <View style={styles.methodBadge}>
              <AntIcons name="credit-card" size={20} color="teal" />
              <Text style={styles.methodText}>Card/Bank Transfer</Text>
            </View>
          </View>
        </View>

        <PaystackProvider
          // publicKey="pk_test_33b8b339f59b4db53664adcb9c9eaf55f6b5892f"
          publicKey="pk_live_7867daf55cd483721fed9f816c79ad0817987579"
          currency="NGN"
          defaultChannels={['card', 'bank', 'ussd', 'qr', 'mobile_money']}>
          <PaystackPayment
            amount={Number(amount)}
            user={user}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            handleVerification={handleVerification}
          />
        </PaystackProvider>

        <Text style={styles.securityNote}>
          <AntIcons name="safety" size={16} color="teal" />
          Secured by Paystack
        </Text>
      </View>
    </SafeAreaView>
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

export default WalletFundScreen;
