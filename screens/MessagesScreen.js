import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const MessagesScreen = () => {
  const messages = [
    { id: '1', sender: 'Ahmad F W', message: 'Your order is ready.', time: '2 min ago' },
    { id: '2', sender: 'Support', message: 'Issue resolved.', time: '10 min ago' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={styles.sender}>{item.sender}</Text>
            <Text>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  messageItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  sender: { fontWeight: 'bold' },
  time: { fontSize: 12, color: 'gray' },
});

export default MessagesScreen;