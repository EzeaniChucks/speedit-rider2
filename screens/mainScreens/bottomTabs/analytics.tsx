import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {LineChart, PieChart} from 'react-native-chart-kit';
import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import axiosInstance from '../../../store/instance';
import {useSelector} from 'react-redux';
import {formatCurrency} from '../../../util/helpers';
import {formatDate} from '../../../util/date';

// Interface definitions
interface Wallet {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings?: number;
}

interface Transaction {
  amount: string;
  date: string;
  reference: string;
  status: string;
  purpose: string;
}

interface PerformanceMetrics {
  acceptanceRate: number;
  currentRating: string;
  completedOrders: number;
  rejectedOrders?: number;
}

interface TimeFrameMetrics {
  earnings: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  orders: {
    completed: number;
    completedToday: number;
    averageDeliveryTime: number;
    averageEarningsPerOrder?: number;
  };
  performance: PerformanceMetrics;
}

interface HistoricalData {
  last5Transactions: Transaction[];
  last5Orders: any[]; // Define proper order interface if needed
}

interface AnalyticsResponse {
  success: boolean;
  data: {
    wallet: Wallet;
    timeFrame: {
      [key: string]: TimeFrameMetrics | HistoricalData;
      historical: HistoricalData;
    };
  };
}

const RiderAnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState<
    AnalyticsResponse['data'] | null
  >(null);
  const [chartData, setChartData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const user = useSelector((state: any) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<
    'today' | 'week' | 'month' | 'year'
  >('week');
  const [activeTab, setActiveTab] = useState<'earnings' | 'performance'>(
    'earnings',
  );
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async (
    range: 'today' | 'week' | 'month' | 'year' = timeRange,
  ) => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.get(
        `/riders/analytics/${user?.id}?timeRange=${range}`,
      );
      setAnalyticsData(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (analyticsData) {
      // Get transactions from historical data (not nested under timeRange)
      const currentTransactions =
        analyticsData.timeFrame.historical?.last5Transactions || [];
      setTransactions(currentTransactions);

      // Get time frame specific data
      const timeFrameData = analyticsData.timeFrame[timeRange] as
        | TimeFrameMetrics
        | undefined;

      // Prepare chart data based on time range
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyTotals = Array(7).fill(0);

      currentTransactions.forEach(txn => {
        const day = new Date(txn.date).getDay();
        dailyTotals[day] += Number(txn.amount);
      });

      setChartData({
        labels: days,
        datasets: [
          {
            data: dailyTotals,
            color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      });
    }
  }, [analyticsData, timeRange]);

  const handleTimeRangeChange = (
    range: 'today' | 'week' | 'month' | 'year',
  ) => {
    setTimeRange(range);
    fetchAnalyticsData(range);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#008080',
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    fillShadowGradient: '#008080',
    fillShadowGradientOpacity: 0.2,
  };

  // Get current time frame data with proper type assertion
  const currentTimeFrameData = analyticsData?.timeFrame[timeRange] as
    | TimeFrameMetrics
    | undefined;
  const historicalData = analyticsData?.timeFrame.historical;

  const performanceData = [
    {
      name: 'Completed',
      count: currentTimeFrameData?.performance.completedOrders || 0,
      color: '#008080',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Rejected',
      count: currentTimeFrameData?.performance.rejectedOrders || 0,
      color: '#FF6347',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => fetchAnalyticsData()}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analyticsData && !loading && !refreshing) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size={30} color={'teal'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings And Performance</Text>
      </View>

      {/* Wallet Summary Card */}
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <FontAwesome6
            name="wallet"
            size={20}
            color="#008080"
            iconStyle="solid"
          />
          <Text style={styles.walletTitle}>Wallet Balance</Text>
        </View>

        <View style={styles.walletAmountContainer}>
          <Text style={styles.walletAmount}>
            {formatCurrency(analyticsData?.wallet?.availableBalance || 0)}
          </Text>
          <View style={styles.walletTrendIndicator}>
            <Ionicons name="trending-up" size={16} color="#4CAF50" />
            <Text style={styles.trendText}>2.5% this week</Text>
          </View>
        </View>

        <View style={styles.pendingBalanceContainer}>
          <View style={styles.pendingBalancePill}>
            <Text style={styles.pendingLabel}>Pending:</Text>
            <Text style={styles.pendingAmount}>
              {formatCurrency(analyticsData?.wallet?.pendingBalance || 0)}
            </Text>
            <View style={styles.pendingTooltip}>
              <Ionicons name="information-circle" size={14} color="#666" />
            </View>
          </View>
        </View>
      </View>

      {/* Time Range Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeRangeContainer}>
        {(['today', 'week', 'month', 'year'] as const).map(range => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.activeTimeRange,
            ]}
            onPress={() => handleTimeRangeChange(range)}>
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.activeTimeRangeText,
              ]}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'earnings' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('earnings')}>
          <Ionicons
            name="cash-outline"
            size={20}
            color={activeTab === 'earnings' ? '#008080' : '#888'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'earnings' && styles.activeTabText,
            ]}>
            Earnings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'performance' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('performance')}>
          <FontAwesome6
            name="chart-line"
            size={16}
            color={activeTab === 'performance' ? '#008080' : '#888'}
            iconStyle="solid"
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'performance' && styles.activeTabText,
            ]}>
            Performance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAnalyticsData()}
            tintColor="#008080"
          />
        }>
        {activeTab === 'earnings' ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Earnings Overview</Text>
              {chartData ? (
                transactions.length > 0 ? (
                  <LineChart
                    data={chartData}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    fromZero
                  />
                ) : (
                  <View style={styles.chartPlaceholder}>
                    <Text style={styles.placeholderText}>
                      No transaction data available
                    </Text>
                  </View>
                )
              ) : (
                <View style={styles.chartPlaceholder}>
                  <ActivityIndicator size="small" color="#008080" />
                  <Text style={styles.placeholderText}>
                    Loading chart data...
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Today</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(currentTimeFrameData?.earnings.today || 0)}
                </Text>
                <Text style={styles.statSubtext}>
                  {currentTimeFrameData?.orders.completedToday || 0} orders
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  Total for{' '}
                  {timeRange == 'today' ? 'today' : `the ${timeRange}`}
                </Text>
                <Text style={styles.statValue}>
                  {formatCurrency(currentTimeFrameData?.earnings.total || 0)}
                </Text>
                <Text style={styles.statSubtext}>
                  {currentTimeFrameData?.orders.completed || 0} orders
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Latest Credits For{' '}
                {timeRange == 'today' ? 'Today' : `The ${timeRange}`}{' '}
              </Text>
              {historicalData?.last5Transactions?.length ? (
                historicalData.last5Transactions.map((txn, index) => (
                  <View key={index}>
                    <View style={styles.transactionItem}>
                      <View style={styles.transactionIcon}>
                        <Ionicons
                          name="cash-outline"
                          size={20}
                          color="#008080"
                        />
                      </View>
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionAmount}>
                          {formatCurrency(txn.amount)}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {formatDate(txn.date)}
                        </Text>
                      </View>
                      <Text style={styles.transactionRef}>
                        {txn.purpose?.split('_').join(' ') || 'Wallet Funding'}
                      </Text>
                    </View>
                    {index < historicalData.last5Transactions.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No earnings available for{' '}
                  {timeRange == 'today' ? 'today' : `the ${timeRange}`}
                </Text>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Performance</Text>
              <PieChart
                data={performanceData}
                width={Dimensions.get('window').width - 40}
                height={200}
                chartConfig={chartConfig}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={styles.chart}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Acceptance Rate</Text>
                <Text style={styles.statValue}>
                  {Math.round(
                    currentTimeFrameData?.performance.acceptanceRate || 0,
                  )}
                  %
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg. Delivery</Text>
                <Text style={styles.statValue}>
                  {currentTimeFrameData?.orders.averageDeliveryTime || 0}m
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Your Rating</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.statValue}>
                    {parseFloat(
                      currentTimeFrameData?.performance.currentRating || '0',
                    ).toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent Deliveries</Text>
              {historicalData?.last5Orders?.length ? (
                historicalData.last5Orders.map((order, index) => (
                  <View key={index}>
                    <View style={styles.deliveryItem}>
                      <View style={styles.deliveryIcon}>
                        <FontAwesome6
                          name="motorcycle"
                          size={16}
                          color="#008080"
                          iconStyle="solid"
                        />
                      </View>
                      <View style={styles.deliveryDetails}>
                        <Text style={styles.deliveryEarnings}>
                          {formatCurrency(order.earnings)}
                        </Text>
                        <Text style={styles.deliveryTime}>
                          {new Date(order.deliveryTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <Text style={styles.deliveryDistance}>
                        {order.distance?.toFixed(1) || '0.0'} km
                      </Text>
                    </View>
                    {index < historicalData.last5Orders.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No recent deliveries</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    padding: 20,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#008080',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008080',
    marginLeft: 8,
  },
  walletAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  walletTrendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  pendingBalanceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
  },
  pendingBalancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 128, 128, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pendingLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 6,
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008080',
  },
  pendingTooltip: {
    marginLeft: 6,
    opacity: 0.7,
  },
  timeRangeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 16,
    marginBottom: 70,
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', // Add this
    alignItems: 'center', // Add this
    minHeight: 40, // Ensure minimum touch area
  },
  timeRangeText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14, // Explicit font size
  },
  activeTimeRange: {
    backgroundColor: '#008080',
  },
  activeTimeRangeText: {
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#008080',
  },
  tabText: {
    marginLeft: 8,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#008080',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  chartPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#008080',
  },
  statSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionIcon: {
    backgroundColor: 'rgba(0, 128, 128, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  transactionRef: {
    fontSize: 12,
    color: '#aaa',
    textTransform: 'capitalize',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  deliveryIcon: {
    backgroundColor: 'rgba(0, 128, 128, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryEarnings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deliveryDistance: {
    fontSize: 14,
    color: '#008080',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 60,
  },
});

export default RiderAnalyticsScreen;
