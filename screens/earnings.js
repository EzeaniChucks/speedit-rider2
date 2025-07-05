import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import WithdrawalBottomSheet from './WithdrawalBottomSheet'; // Adjust path
import { Box, VStack } from 'native-base';
import Icons from '@react-native-vector-icons/ant-design'; // Ensure this is installed
import { fetchWalletBalance, fetchWalletTransactions, resetWalletState } from '../store/wallet';
import { useFocusEffect } from '@react-navigation/native';

const TransactionHistoryScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Daily'); // Tab logic might need separate API or client-side filtering
    const tabs = [{ label: 'Daily' }, { label: 'Monthly' }, { label: 'Yearly' }];
    const [isWithdrawalSheetVisible, setIsWithdrawalSheetVisible] = useState(false);

    const dispatch = useDispatch();
    const { balance, status: balanceStatus, error: balanceError } = useSelector((state) => state.wallet);
    const { 
        transactions, 
        transactionStatus, 
        transactionError,
        currentPage,
        totalPages
    } = useSelector((state) => state.wallet);

    const loadData = useCallback((page = 1, isRefreshing = false) => {
        dispatch(fetchWalletBalance());
        dispatch(fetchWalletTransactions({ page, limit: 10 })); // Adjust limit as needed
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            loadData(1, true); // Load first page on focus
            return () => {
                // Optional: dispatch(resetWalletState()); // If you want to clear data on screen blur
            };
        }, [loadData])
    );
    
    const handleRefresh = () => {
        loadData(1, true);
    };

    const handleLoadMore = () => {
        if (transactionStatus !== 'loading' && currentPage < totalPages) {
            dispatch(fetchWalletTransactions({ page: currentPage + 1, limit: 10 }));
        }
    };

    const openBottomSheet = () => setIsWithdrawalSheetVisible(true);
    const closeBottomSheet = () => setIsWithdrawalSheetVisible(false);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
           <Icons name={item.type === 'credit' ? "pluscircleo" : "minuscircleo"} size={30} color={item.type === 'credit' ? 'teal' : 'crimson'} />
            <VStack space={1} alignItems={'flex-start'} flex={1} ml={3}>
                <Text style={styles.itemTitle}>{item.description || `Transaction ID: ${item.id}`}</Text>
                <Text style={styles.itemDate}>{new Date(item.createdAt || item.date).toLocaleString()}</Text>
                <Text style={[styles.itemStatus, {color: item.status === 'Completed' || item.status === 'successful' ? 'green' : 'orange'}]}>{item.status}</Text>
            </VStack>
            <Text style={[styles.itemAmount, {color: item.type === 'credit' ? 'teal' : 'crimson'}]}>
                {item.type === 'credit' ? '+' : '-'} ${parseFloat(item.amount).toFixed(2)}
            </Text>
        </View>
    );

    if (balanceStatus === 'loading' && currentPage === 1 && transactions.length === 0) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="teal" /></View>;
    }

    if (balanceError) {
        Alert.alert("Error", `Failed to load balance: ${balanceError}`);
    }
    if (transactionError && transactions.length === 0) {
         Alert.alert("Error", `Failed to load transactions: ${transactionError}`);
    }


    return (
        <View style={styles.container}>
            <Box safeArea padding={4}>
                <Text style={styles.balanceLabel}>Total Balance:</Text>
                <Text style={styles.balanceAmount}>
                    {balanceStatus === 'succeeded' && balance !== null ? `$${parseFloat(balance).toFixed(2)}` : 'Loading...'}
                </Text>
            </Box>
            {/* CustomTabBar might need more sophisticated filtering based on API or client-side logic */}
            {/* <CustomTabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} /> */}
            
            {transactionStatus === 'loading' && currentPage === 1 && transactions.length === 0 ? (
                 <View style={styles.centered}><ActivityIndicator size="large" color="teal" /></View>
            ) : transactionError && transactions.length === 0 ? (
                <View style={styles.centered}><Text>Error loading transactions. Pull to refresh.</Text></View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id?.toString() || `trans-${index}`}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={<View style={styles.centered}><Text>No transactions found.</Text></View>}
                    refreshControl={
                        <RefreshControl
                            refreshing={transactionStatus === 'loading' && currentPage === 1}
                            onRefresh={handleRefresh}
                            colors={["teal"]}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={transactionStatus === 'loading' && currentPage > 1 ? <ActivityIndicator size="small" color="teal" /> : null}
                />
            )}
            
            <Box p={4}>
                <Button title="Withdraw Funds" onPress={openBottomSheet} color="teal" />
            </Box>
            
            <WithdrawalBottomSheet 
                visible={isWithdrawalSheetVisible} 
                onClose={closeBottomSheet} 
                currentBalance={balance !== null ? parseFloat(balance) : 0}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    balanceLabel: {
        fontSize: 18,
        color: '#555',
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'teal',
        marginBottom: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 10,
        marginVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemDate: {
        fontSize: 12,
        color: '#666',
    },
    itemStatus: {
        fontSize: 12,
        fontWeight: '500',
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default TransactionHistoryScreen;