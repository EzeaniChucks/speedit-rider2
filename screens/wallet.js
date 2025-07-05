import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useGetWalletBalanceQuery, useGetWalletTransactionsQuery } from '../store/ordersApi'; // Adjust path
import { useNavigation } from '@react-navigation/native';

const WalletScreen = () => {
    const navigation = useNavigation();
    
    // Fetch Wallet Balance
    const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useGetWalletBalanceQuery();
    
    // Fetch Wallet Transactions
    const { data: transactionsData, isLoading: areTransactionsLoading, refetch: refetchTransactions } = useGetWalletTransactionsQuery({});

    const wallet = balanceData?.data || { balance: 0, pendingBalance: 0 };
    const transactions = transactionsData?.data?.transactions || [];

    const onRefresh = () => {
        refetchBalance();
        refetchTransactions();
    }

    const renderTransaction = ({ item }) => (
        <View style={styles.transactionRow}>
            <View>
                <Text style={styles.transactionPurpose}>{item.purpose.replace('_', ' ')}</Text>
                <Text style={styles.transactionDate}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <Text style={[styles.transactionAmount, item.type === 'credit' ? styles.credit : styles.debit]}>
                {item.type === 'credit' ? '+' : '-'} ₦{parseFloat(item.amount).toFixed(2)}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Wallet</Text>
            </View>

            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                {isBalanceLoading ? <ActivityIndicator color="teal" /> : <Text style={styles.balanceAmount}>₦{parseFloat(wallet.balance).toFixed(2)}</Text>}
                <Text style={styles.pendingBalance}>Pending: ₦{parseFloat(wallet.pendingBalance).toFixed(2)}</Text>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('FundWalletScreen')}>
                    <Text style={styles.actionButtonText}>Fund Wallet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.withdrawButton]} onPress={() => navigation.navigate('WithdrawalScreen')}>
                    <Text style={styles.actionButtonText}>Withdraw</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.transactionsHeader}>Recent Transactions</Text>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
                refreshControl={<RefreshControl refreshing={areTransactionsLoading} onRefresh={onRefresh} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  balanceCard: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10, alignItems: 'center', elevation: 3 },
  balanceLabel: { fontSize: 16, color: '#666' },
  balanceAmount: { fontSize: 36, fontWeight: 'bold', color: 'teal', marginVertical: 5 },
  pendingBalance: { fontSize: 14, color: '#888' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, marginBottom: 20 },
  actionButton: { backgroundColor: 'teal', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  withdrawButton: { backgroundColor: '#FF3D00' },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  transactionsHeader: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 10 },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  transactionPurpose: { textTransform: 'capitalize', fontWeight: 'bold' },
  transactionDate: { fontSize: 12, color: '#999' },
  transactionAmount: { fontWeight: 'bold', fontSize: 16 },
  credit: { color: 'green' },
  debit: { color: 'red' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
});

export default WalletScreen;