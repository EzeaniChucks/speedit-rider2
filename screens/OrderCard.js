// components/OrderCard.js (extract from OrderSection.js if it's not already separate)
// This is largely your provided component, with onAccept and onIgnore props.
import React, { useState } from 'react';
import { View, StyleSheet, Button as RNButton, FlatList, Modal, TouchableOpacity, Alert } from 'react-native';
import { Box, Text, HStack, Pressable, VStack } from "native-base";
import { RadioButton } from 'react-native-paper';

const OrderCard = ({ order, onAcceptPress, onIgnorePress, onCardPress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const handleReasonSelection = (reason) => {
    setSelectedReason(reason);
  };

  const vehicleOptions = [
    'Distance is too far',
    'The Order is too small',
    "I don't want to place this order",
    "I don't want to go to this store",
    'I have too many orders',
  ];

  const handleSubmitIgnore = () => {
    if (!selectedReason && vehicleOptions.length > 0) { // If there are options, a reason should be selected
        Alert.alert("Reason Required", "Please select a reason for ignoring the order.");
        return;
    }
    onIgnorePress(order.id, selectedReason); // Pass order.id and reason
    setModalVisible(false);
    setSelectedReason(''); // Reset reason
  };

  return (
    <Pressable
      bgColor={'teal.300'}
      style={[styles.offerCard]}
      onPress={() => onCardPress(order)} // For navigating to details or map
    >
      <HStack space={4} justifyContent={'space-between'} marginBottom={10}>
        <VStack pl={2} width={'50%'}>
          <Text style={styles.label}>PICK UP</Text>
          <Text style={styles.address}>{order.pickup_address?.street || 'N/A'}</Text>
          <Text style={styles.addresslower}>{order.pickup_address?.details || 'Details N/A'}</Text>
        </VStack>
        <VStack width={'40%'}>
          <Text style={styles.label}>EST. FARE</Text>
          <Text style={styles.fare}>N{order.estimated_fare || 'N/A'}</Text>
        </VStack>
      </HStack>
      <HStack space={2} justifyContent={'space-between'} alignItems="center">
        <VStack pl={2} width={'50%'}>
          <Text style={styles.label}>DROP OFF</Text>
          <Text style={styles.address}>{order.dropoff_address?.street || 'N/A'}</Text>
          <Text style={styles.addresslower}>{order.dropoff_address?.details || 'Details N/A'}</Text>
        </VStack>
        <VStack width={'40%'}>
          <Text style={styles.label}>TOTAL DISTANCE</Text>
          <Text style={styles.distance}>{order.total_distance_km || 'N/A'} km</Text>
          <Box h={4} />
        </VStack>
      </HStack>
      <View style={styles.buttonContainer}>
        <RNButton title="Ignore" color="#ff4d4d" onPress={() => setModalVisible(true)} />
        <RNButton title="Accept" color="teal" onPress={() => onAcceptPress(order.id)} />
      </View>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Tell us Why?</Text>
            <FlatList
              data={vehicleOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleReasonSelection(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  <RadioButton
                    value={item}
                    status={selectedReason === item ? 'checked' : 'unchecked'}
                    onPress={() => handleReasonSelection(item)}
                    color="teal"
                  />
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.backButton]}
                onPress={() => { setModalVisible(false); setSelectedReason(''); }}
              >
                <Text style={styles.backButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={handleSubmitIgnore}
              >
                <Text style={styles.closeButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
};

// Styles copied from your OrderSection and adjusted for modal
const styles = StyleSheet.create({
    offerCard: {
      width: 320, // Adjusted for better visibility if multiple cards
      // height: 280, // Auto height might be better
      backgroundColor: 'teal.300', // This won't work directly, use NativeBase Box for bgColor
      borderRadius: 12,
      marginRight: 16,
      marginTop:10,
      overflow: 'hidden',
      padding:15, // Increased padding
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    label: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 5, fontWeight: '500' },
    address: { fontSize: 18,  color: 'white', fontWeight: 'bold',},
    addresslower:  { fontSize: 13,  color: '#f0f0f0', lineHeight: 18 },
    distance:  { fontSize: 18,  color: 'white', fontWeight:'bold' },
    fare: { fontSize: 18, color: 'white', fontWeight: 'bold'},
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15, borderTopColor: 'rgba(255,255,255,0.3)', borderTopWidth:1, paddingTop:15},
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'},
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%', maxHeight: '80%' },
    modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
    option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee'},
    optionText: { flex: 1, fontSize: 16, color: '#444' },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, minWidth: 100, alignItems: 'center' },
    backButton: { backgroundColor: '#f0f0f0', borderWidth:1, borderColor: 'teal'},
    backButtonText: { color: 'teal', fontSize: 16, fontWeight: 'bold' },
    closeButton: { backgroundColor: 'teal'},
    closeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  });
  

export default OrderCard;