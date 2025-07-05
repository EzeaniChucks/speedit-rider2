import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const Header = ({
  title,
  backgroundColor,
  iconHexColor,
  navigateTo,
}: {
  title: string;
  backgroundColor?: string;
  iconHexColor?: string;
  navigateTo?: string;
}) => {
  const navigation: any = useNavigation();
  return (
    <View
      style={{
        ...styles.header,
        backgroundColor: backgroundColor ? backgroundColor : 'white',
      }}>
      <TouchableOpacity
        onPress={() =>
          navigateTo ? navigation.navigate(navigateTo) : navigation.goBack()
        }>
        <Icon
          name="arrow-back-circle"
          size={24}
          color={iconHexColor ? iconHexColor : '#00796B'}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{width: 24}} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
});
export default Header;
