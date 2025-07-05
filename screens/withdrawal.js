// screens/WithdrawalHistory.js
import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { Card } from 'react-native-paper';


const WithdrawalHistory = () => {
    const [balance, setBalance] = useState(215.00);
    const [amountToWithdraw, setAmountToWithdraw] = useState('');
    const [withdrawalHistory, setWithdrawalHistory] = useState([
      { id: '1', date: 'Jul 6, 2023 12:15 pm', amount: 100, status: 'Pending' },
      { id: '2', date: 'Jul 6, 2023 12:15 pm', amount: 40, status: 'Approved' },
      { id: '3', date: 'Jul 6, 2023 12:15 pm', amount: 35, status: 'Approved' },
      { id: '4', date: 'Jul 6, 2023 12:15 pm', amount: 200, status: 'Pending' },
      { id: '5', date: 'Jul 6, 2023 12:15 pm', amount: 45, status: 'Approved' },
      { id: '6', date: 'Jul 6, 2023 12:15 pm', amount: 84, status: 'Pending' },
    ]);
    const [isVisible, setIsVisible] = useState(false);

    const openBottomSheet = () => {
        setIsVisible(true);
    };

    const closeBottomSheet = () => {
        setIsVisible(false);
    };

    const handleWithdraw = () => {
      const amount = parseFloat(amountToWithdraw);
      if (!isNaN(amount) && amount > 0 && amount <= balance) {
        setBalance(balance - amount);
        setAmountToWithdraw('');
        setWithdrawalHistory([...withdrawalHistory, { id: (withdrawalHistory.length + 1).toString(), date: new Date().toLocaleString(), amount, status: 'Pending' }]);
      }
    }
  return (
    <View>
      <Text>Withdrawal History</Text>
      <FlatList
        data={withdrawalData}
        renderItem={({ item }) => (
          <Card>
            <Text>{item.date}</Text>
            <Text>{item.amount}</Text>
            <Text>{item.status}</Text>
          </Card>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default WithdrawalHistory;