import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import {useNavigation} from '@react-navigation/native';

const WithdrawalSuccessScreen = ({route}: any) => {
  const navigation: any = useNavigation();
  const {amount, accountName, bankName} = route.params;

  const handleGoHome = () => {
    navigation.navigate('MainApp', {screen: 'Home'});
  };

  const formatAmount = (value: string | number) => {
    return typeof value === 'string'
      ? parseFloat(value).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : value.toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <AntIcons name="check-circle" size={80} color="#4BB543" />
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Withdrawal Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your funds are on the way to your bank account
        </Text>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>₦{formatAmount(amount)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Name:</Text>
            <Text style={styles.detailValue}>{accountName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bank:</Text>
            <Text style={styles.detailValue}>{bankName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, styles.statusSucccesful]}>
              Successful
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <Text style={styles.note}>
          <AntIcons name="clock-circle" size={14} color="#666" /> Funds will
          reflect in few minutes
        </Text>

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleGoHome}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statusProcessing: {
    color: '#FFA500',
  },
  statusSucccesful: {
    color: 'teal',
  },
  note: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    fontSize: 14,
  },
  doneButton: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WithdrawalSuccessScreen;
