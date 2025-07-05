import { HStack, Pressable, VStack } from 'native-base';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@react-native-vector-icons/ant-design';
import Icons from '@react-native-vector-icons/ionicons';
import { navigate } from '../NavigationService';
const OrderPickedScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
        <HStack justifyContent={'space-around'}>
        <Pressable onPress={()=>navigation.goBack()}>
         <Icon name="arrow-left" size={20} color="teal"  /></Pressable>
      <Text style={styles.header}>Pick: 02165465-2115145=54485-5455c</Text></HStack>
      <TouchableOpacity style={styles.orderStatusButton}>
        <Text style={styles.orderStatusText}>Order Ready, Pick now!</Text>
      </TouchableOpacity>
      
      <Text style={styles.deliverTo}>Deliver to:</Text>
      <View style={{flexDirection:'row',}}>
      <Icon name="user" size={20} color="black"  />
      <Text style={styles.name}>Bulbul Ahmed</Text> </View>
      <View style={{flexDirection:'row',}}>
      <Icons name="location" size={20} color="black"  /><VStack>
      <Text style={styles.address}>2154 S. Maryland Pkwy Las</Text>
      <Text style={styles.address}>Vegas, NV 25874</Text></VStack>
      </View>
      <Text style={styles.itemsHeader}>Items</Text>
      <ScrollView style={styles.itemsList}>
        <Text style={styles.item}>Burger Meal</Text>
        <Text style={styles.item}>Pizza</Text>
        <Text style={styles.item}>Black Beans And Rice</Text>
      </ScrollView>

      <TouchableOpacity style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Confirm Items</Text>
      </TouchableOpacity>

      <TouchableOpacity  onPress={() => navigate('CustomerTrack',{name:'order'})}  style={styles.pickedOrderButton}>
        <Text style={styles.pickedOrderButtonText}>Picked Order</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderStatusButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  orderStatusText: {
    fontSize: 16,
  },
  deliverTo: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    marginBottom: 4,marginLeft:10
  },
  address: {
    fontSize: 14,
    color: '#666',marginLeft:10
  },
  itemsHeader: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  itemsList: {
    marginBottom: 20,
  },
  item: {
    fontSize: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#008000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  pickedOrderButton: {
    backgroundColor: '#ff4d4d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickedOrderButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default OrderPickedScreen;