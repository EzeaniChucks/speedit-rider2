import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Button,
  TouchableOpacity,
} from 'react-native';
import {
  Provider as PaperProvider,
  Card,
  Title,
  Button as PaperButton,
} from 'react-native-paper'; // Ensure this is Paper's Button
import {BarChart} from 'react-native-chart-kit';
import RecentActivity from './activity'; // Adjust path
import {Box, HStack, VStack} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {fetchWalletBalance} from '../store/wallet';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const EarningsScreen = () => {
  const navigation = useNavigation(); // For RecentActivity's "Show More" if not passed as prop
  const dispatch = useDispatch();
  const {
    balance,
    status: balanceStatus,
    error: balanceError,
  } = useSelector(state => state.wallet);
  // console.log(
  //   'Balance:',
  //   balance,
  //   'Status:',
  //   balanceStatus,
  //   'Error:',
  //   balanceError,
  // );
  // Static chart data as in original, can be dynamic later
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{data: [20, 40, 60, 80, 100, 40, 20]}],
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchWalletBalance());
    }, [dispatch]),
  );

  if (balanceStatus === 'loading' && balance === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="teal" />
      </View>
    );
  }

  if (balanceError) {
    Alert.alert('Error', `Failed to load wallet balance: ${balanceError}`);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Title style={styles.title}>Earnings Dashboard</Title>
      <Card style={styles.card}>
        <Card.Content style={{alignItems: 'center', alignContent: 'center'}}>
          <HStack
            space={3}
            style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <VStack
              style={styles.boxContainer}
              space={10}
              alignItems={'flex-start'}>
              <Text style={styles.orderText}> Total Income</Text>
              <Box>
                <Text style={styles.totalIncome}>
                  {balance !== null
                    ? `N${parseFloat(balance.data?.balance).toFixed(2)}`
                    : '$0.00'}
                </Text>
                {/* <Text style={styles.subText}>↑ 0.5% than last month</Text> */}
              </Box>
            </VStack>
            <VStack space={4} alignItems={'flex-start'}>
              {/* These could be other stats if available from APIs */}
              <Box style={styles.boxContainer}>
                <Text style={styles.orderText}>Total Order (Sample)</Text>
                <Text style={styles.orderText}> 380</Text>
              </Box>
              <Box style={styles.boxContainer}>
                <Text style={styles.deliveryText}>
                  Online Delivery (Sample)
                </Text>
                <Text style={styles.deliveryText}> 89%</Text>
              </Box>
            </VStack>
          </HStack>
        </Card.Content>
      </Card>
      <Box>
        <HStack
          flexDirection={'row'}
          justifyContent={'space-around'}
          alignContent={'center'}
          alignItems={'center'}
          space={4}>
          <TouchableOpacity
            onPress={() => navigation.navigate('WalletFund')}
            title="fund wallet">
            <Text>Fund Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('WalletWithdrawal')}
            title="withdraw to back">
            <Text>Withdraw To Bank</Text>
          </TouchableOpacity>
        </HStack>
      </Box>
      <Box justifyContent={'center'}>
        <HStack
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignContent={'center'}
          alignItems={'center'}>
          <Text style={styles.trendIncomeTitle}>Trend Income (Sample)</Text>
          {/* <PaperButton buttonColor='teal' mode="contained" onPress={() => {}} style={styles.button}>Week</PaperButton> */}
        </HStack>
      </Box>
      <BarChart
        data={chartData}
        width={380} // Adjust width based on screen
        height={220}
        fromZero={true}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`, // Teal color
          style: {borderRadius: 16},
        }}
        style={styles.chart}
      />
      <RecentActivity navigation={navigation} /> {/* Pass navigation */}
      <Box h={100} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  boxContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
    width: 170, // Might need to adjust width based on screen
  },
  card: {
    marginTop: 20,
    padding: 0,
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
  }, // Reduced card padding
  title: {fontSize: 24, fontWeight: 'bold'},
  totalIncome: {fontSize: 28, fontWeight: 'bold', color: 'teal'}, // Adjusted size
  subText: {fontSize: 12, color: '#888'},
  orderText: {marginTop: 5, color: '#000', fontSize: 14, fontWeight: '500'},
  deliveryText: {color: '#000', fontSize: 14, fontWeight: '500'},
  trendIncomeTitle: {fontSize: 18, marginVertical: 10, fontWeight: 'bold'},
  chart: {borderRadius: 16, marginBottom: 20, alignSelf: 'center'},
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'teal',
    borderRadius: 10,
    marginTop: 10,
  },
});

export default EarningsScreen;
