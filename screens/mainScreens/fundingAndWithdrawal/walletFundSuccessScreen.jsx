import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AntIcons from '@react-native-vector-icons/ant-design';
import {useNavigation} from '@react-navigation/native';

const PaymentSuccessScreen = ({route}) => {
  const navigation = useNavigation();
  const {amount, newBalance} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successCard}>
          <View style={styles.successIconContainer}>
            <AntIcons name="check-circle" size={60} color="#4CAF50" />
          </View>

          <Text style={styles.successTitle}>Funding Successful!</Text>
          <Text style={styles.amount}>
            ₦{parseFloat(amount).toLocaleString()}
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>New Balance:</Text>
            <Text style={styles.detailValue}>
              ₦{newBalance.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() =>
              navigation.navigate('MainApp', {screen: 'Analytics'})
            }>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'teal',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  doneButton: {
    backgroundColor: 'teal',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaymentSuccessScreen;
