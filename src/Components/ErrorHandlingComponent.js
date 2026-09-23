import { Platform, ToastAndroid, Alert } from 'react-native';

const ErrorHandlingComponent = (message, error) => {
  const showToastOrAlert = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert('Error', msg);
    }
  };

  if (error?.response?.data?.message) {
    console.log(`${message}: ${error.response.data.message}`);
    showToastOrAlert(`${message}: ${error.response.data.message}`);
  } else if (error?.response?.data?.error) {
    console.log(`${message}: ${error.response.data.error}`);
    showToastOrAlert(`${message}: ${error.response.data.error}`);
  } else if (error?.message) {
    console.log(`${message}: ${error.message}`);
    showToastOrAlert(`${message}: ${error.message}`);
  } else if (error) {
    console.log(`${message}: ${error.toString()}`);
    showToastOrAlert(`${message}: ${error.toString()}`);
  } else {
    showToastOrAlert(`${message}: Something went wrong`);
  }

  return null;
};

export default ErrorHandlingComponent;
