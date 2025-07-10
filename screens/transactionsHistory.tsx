import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useGetWalletTransactionsQuery } from '../store/ordersApi';
import { formatDate } from '../util/date';
import Header from '../components/header';
import { Transaction, TransactionsResponse } from '../types/transaction.types';
import { useClipboard } from 'native-base';

const Ionicons = Icon as any;

const TransactionHistoryScreen = () => {
  const {
    data: transactionsData,
    isLoading,
    isError,
    refetch,
  } = useGetWalletTransactionsQuery({ page: 1, limit: 20 });

  // Inside your component
  const { onCopy, hasCopied } = useClipboard();
  const [copiedReferenceId, setCopiedReferenceId] = React.useState<
    string | null
  >(null);
  const transactions_data = transactionsData as TransactionsResponse;
  const transactions = transactions_data?.data?.transactions || [];

  const getTransactionIcon = (purpose: string, type: string) => {
    const icons: Record<string, string> = {
      wallet_funding: 'wallet-outline',
      order_payment: 'cart-outline',
      withdrawal: 'cash-outline',
      transfer: 'swap-horizontal-outline',
      deposit: 'card-outline',
      default_credit: 'arrow-down-circle-outline',
      default_debit: 'arrow-up-circle-outline',
    };

    return (
      icons[purpose] ||
      (type === 'credit' ? icons.default_credit : icons.default_debit)
    );
  };

  const getTransactionColor = (status: string, type?: 'debit' | 'credit') => {
    const colors: Record<string, string> = {
      successful: type == 'debit' ? '#F44336' : '#4CAF50',
      failed: '#F44336',
      pending: '#FFC107',
      reversed: '#9C27B0',
    };
    return colors[status] || '#607D8B';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      successful: 'Completed',
      failed: 'Failed',
      pending: 'Processing',
      reversed: 'Reversed',
    };
    return statusMap[status] || status;
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const handleCopy = () => {
      onCopy(item.reference);
      setCopiedReferenceId(item.id);
      setTimeout(() => setCopiedReferenceId(null), 2000); // Reset after 2 seconds
    };

    return (
      <TouchableOpacity
        onPress={() => {
          // navigation.navigate('TransactionDetails', {transaction: item})
        }}
        activeOpacity={0.9}
      >
        <View style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${getTransactionColor(
                    item.status,
                    item.type,
                  )}20`,
                },
              ]}
            >
              <Ionicons
                name={getTransactionIcon(item.purpose, item.type)}
                size={24}
                color={getTransactionColor(item.status, item.type)}
              />
            </View>

            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>
                {item?.purpose?.split('_').join(' ') ||
                  item?.metadata?.purpose.split('_').join(' ')}
              </Text>
              <Text style={styles.transactionSubtitle}>
                {formatDate(item.createdAt)}
              </Text>
            </View>

            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amountText,
                  { color: getTransactionColor(item.status, item.type) },
                ]}
              >
                {item.type === 'credit' ? '+' : '-'}₦
                {parseFloat(item.amount).toFixed(2)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: `${getTransactionColor(
                      item.status,
                      // item.type,
                    )}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getTransactionColor(item.status) },
                  ]}
                >
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
          </View>

          {item.reference && (
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceLabel}>Reference:</Text>
              <View style={styles.referenceValueContainer}>
                <Text
                  style={styles.referenceValue}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.reference}
                </Text>
                <TouchableOpacity
                  onPress={handleCopy}
                  style={styles.copyButton}
                >
                  <Icon
                    name={
                      copiedReferenceId === item.id
                        ? 'checkmark-outline'
                        : 'copy-outline'
                    }
                    size={16}
                    color={
                      copiedReferenceId === item.id ? '#4CAF50' : '#757575'
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {item.paymentMethod && (
            <View style={styles.paymentMethodContainer}>
              <Ionicons
                name={
                  item.paymentMethod === 'card'
                    ? 'card-outline'
                    : item.paymentMethod === 'bank'
                    ? 'business-outline'
                    : 'wallet-outline'
                }
                size={16}
                color="#757575"
              />
              <Text style={styles.paymentMethodText}>
                {item.paymentMethod.charAt(0).toUpperCase() +
                  item.paymentMethod.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !transactions.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Transaction History" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796B" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Transaction History" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>Failed to load transactions</Text>
          <Text style={styles.errorSubtext}>
            Please check your internet connection and try again
          </Text>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Ionicons name="reload" size={20} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Transaction History" />

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={72} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your transaction history will appear here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={['#00796B']}
            tintColor="#00796B"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    gap: 30,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#00796B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    textTransform: 'capitalize',
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#424242',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
    marginTop: 8,
  },
  referenceValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  referenceValue: {
    flex: 1,
    fontSize: 12,
    color: '#424242',
    fontWeight: '500',
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  referenceLabel: {
    fontSize: 12,
    color: '#757575',
    marginRight: 4,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TransactionHistoryScreen;
