import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import axiosInstance from '../../../store/instance';

const WithdrawalScreen = () => {
  const navigation: any = useNavigation();
  const user = useSelector((state: any) => state.auth.user);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<any[]>([]);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  // Fetch banks on component mount
  useEffect(() => {
    const fetchBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const response = await axiosInstance.get('/payments/banks/list');
        if (response.data.success) {
          const banksData = response.data.data.data;
          setBanks(banksData);
          setFilteredBanks(banksData); // Initialize filtered banks with all banks
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load banks. Please try again.');
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  // Filter banks based on search query
  useEffect(() => {
    if (bankSearchQuery) {
      const filtered = banks.filter(bank =>
        bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()),
      );
      setFilteredBanks(filtered);
    } else {
      setFilteredBanks(banks);
    }
  }, [bankSearchQuery, banks]);

  const handleGoBack = () => navigation.goBack();

  const verifyAccount = async () => {
    if (!accountNumber || !bankCode) {
      Alert.alert('Error', 'Please select a bank and enter account number');
      return;
    }

    if (accountNumber.length < 10) {
      Alert.alert('Error', 'Account number must be at least 10 digits');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axiosInstance.post('/payments/banks/verify', {
        entityType: 'rider',
        accountNumber,
        bankCode,
      });

      if (response.data.success) {
        setAccountName(response.data.data.data.account_name);
      }
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        'Please check your account number and try again',
      );
      setAccountName('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!amount || !accountNumber || !bankCode || !accountName) {
      Alert.alert('Error', 'Please complete all fields and verify account');
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than zero');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(
        '/payments/request_withdrawal',
        {
          amount: parseFloat(amount),
          accountNumber,
          bankCode,
          entityId: user.id,
          entityType: 'rider',
        },
      );

      if (response.data.success) {
        if (response.data.data.requiresOtp) {
          navigation.replace('WithdrawalOTP', {
            withdrawalData: {
              reference: response.data.data.transferReference,
              amount,
              accountName,
              bankName: selectedBank?.name || '',
              entityType: 'rider',
              phoneNumber: user.phone,
            },
          });
        } else {
          navigation.navigate('WithdrawalSuccess', {
            amount,
            accountName,
            bankName: selectedBank?.name || '',
          });
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Withdrawal Failed',
        error.response.data.error ||
          error.message ||
          'An error occurred while processing your withdrawal',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectBank = (bank: any) => {
    setSelectedBank(bank);
    setBankCode(bank.code);
    setShowBankDropdown(false);
    setAccountName(''); // Reset account name when bank changes
    setBankSearchQuery(''); // Clear search query after selection
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <AntIcons name="left" size={24} color="teal" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Withdraw Funds</Text>
          </View>

          <View style={styles.content}>
            {/* Amount Input */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Withdrawal Amount (₦)</Text>
              <View style={styles.amountContainer}>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>
            </View>

            {/* Bank Selection */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Select Bank</Text>
              <TouchableOpacity
                style={styles.bankSelector}
                onPress={() => setShowBankDropdown(!showBankDropdown)}>
                <Text
                  style={
                    selectedBank
                      ? styles.bankSelectedText
                      : styles.bankPlaceholder
                  }>
                  {selectedBank ? selectedBank.name : 'Select your bank'}
                </Text>
                <AntIcons
                  name={showBankDropdown ? 'up' : 'down'}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              {showBankDropdown && (
                <View style={styles.bankDropdownContainer}>
                  {/* Search input for banks */}
                  <View style={styles.bankSearchContainer}>
                    <AntIcons
                      name="search"
                      size={16}
                      color="#666"
                      style={styles.bankSearchIcon}
                    />
                    <TextInput
                      style={styles.bankSearchInput}
                      placeholder="Search for your bank..."
                      value={bankSearchQuery}
                      onChangeText={setBankSearchQuery}
                      autoFocus={showBankDropdown}
                    />
                    {bankSearchQuery ? (
                      <TouchableOpacity
                        onPress={() => setBankSearchQuery('')}
                        style={styles.bankSearchClear}>
                        <AntIcons name="close" size={16} color="#666" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  
                  <ScrollView
                    style={styles.bankDropdown}
                    nestedScrollEnabled={true}>
                    {isLoadingBanks ? (
                      <ActivityIndicator color="teal" style={styles.loader} />
                    ) : filteredBanks.length > 0 ? (
                      filteredBanks.map(bank => (
                        <TouchableOpacity
                          key={bank.id}
                          style={styles.bankItem}
                          onPress={() => selectBank(bank)}>
                          <Text style={styles.bankText}>{bank.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noBanksFound}>
                        <Text style={styles.noBanksFoundText}>
                          No banks found matching your search
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Account Number Input */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Account Number</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter 10-digit account number"
                value={accountNumber}
                onChangeText={text => {
                  setAccountName('');
                  setAccountNumber(text);
                }}
                maxLength={10}
              />
            </View>

            {/* Account Verification */}
            {accountName ? (
              <View style={styles.verifiedCard}>
                <View style={styles.verifiedRow}>
                  <AntIcons name="check-circle" size={16} color="green" />
                  <Text style={styles.verifiedText}>Verified Account</Text>
                </View>
                <Text style={styles.accountName}>{accountName}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={verifyAccount}
                disabled={!accountNumber || !bankCode || isVerifying}>
                {isVerifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify Account</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Withdrawal Button */}
            <TouchableOpacity
              style={[
                styles.withdrawButton,
                (!amount || !accountName || isSubmitting) &&
                  styles.withdrawButtonDisabled,
              ]}
              onPress={handleWithdrawal}
              disabled={!amount || !accountName || isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.withdrawButtonText}>
                  Withdraw ₦
                  {amount ? parseFloat(amount).toLocaleString('en-NG') : '0.00'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              Transactions may take few minutes to reflect in your account
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  amountContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginTop: 10,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bankSelectedText: {
    fontSize: 16,
    color: '#333',
  },
  bankPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  bankDropdownContainer: {
    maxHeight: 300,
    marginTop: 10,
  },
  bankSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  bankSearchIcon: {
    marginRight: 8,
  },
  bankSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  bankSearchClear: {
    padding: 4,
  },
  bankDropdown: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  bankItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bankText: {
    fontSize: 14,
    color: '#333',
  },
  noBanksFound: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBanksFoundText: {
    color: '#666',
    fontSize: 14,
  },
  loader: {
    padding: 12,
  },
  verifyButton: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  verifiedCard: {
    backgroundColor: '#f0f9f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d0f0d0',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedText: {
    marginLeft: 8,
    color: 'green',
    fontWeight: '500',
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  withdrawButton: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  withdrawButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  note: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 12,
  },
});

export default WithdrawalScreen;