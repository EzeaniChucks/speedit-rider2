// CustomTabBar.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const CustomTabBar = ({tabs, activeTab, setActiveTab}) => (
  <View style={styles.container}>
    {tabs.map(tab => (
      <TouchableOpacity
        key={tab.label}
        style={[styles.tab, activeTab === tab.label && styles.activeTab]}
        onPress={() => setActiveTab(tab.label)}>
        <Text style={styles.tabText}>{tab.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontWeight: 'bold',
  },
});

export default CustomTabBar;
