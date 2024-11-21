import { useRef, useState, useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAvailableDimensions } from './AvailableDimensions';

const CustomInput = ({
  containerStyle,
  placeholder,
  onChangeText,
  error,
  value,
  editable,
  toolTip,
  disabled,
  multiline,
  keyboardType,
  scan,
  handleScan,
  ...props
}) => {
  const { width, height, landscape } = useAvailableDimensions();
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(value || '');
  const [showPassword, setShowPassword] = useState(props.secureTextEntry);
  const labelPosition = useRef(new Animated.Value(text ? 1 : 0)).current;
  const navigation = useNavigation();
  const handleFocus = () => {
    setIsFocused(true);
    animatedLabel(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!text) {
      animatedLabel(0);
    }
  };

  const handleTextChange = text => {
    setText(text);
    if (onChangeText) {
      onChangeText(text);
    }
    if (text) {
      animatedLabel(1);
    } else {
      animatedLabel(isFocused ? 1 : 0);
    }
  };

  const animatedLabel = toValue => {
    Animated.timing(labelPosition, {
      toValue: toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelStyle = {
    left: 20,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [17, 0],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ['gray', '#888'],
    }),
  };
  useEffect(() => {
    if (value == '') {
      setText('');
      setIsFocused(false);
      animatedLabel(0);
    }
  }, [value]);
  return (
    <View style={[{ ...containerStyle }, { width: landscape ? height : width || '100%' }]}>
      <View
        style={[
          styles.innerContainer,
          error && { borderColor: 'red' },
          disabled && {
            backgroundColor: '#F5F5F5',
            borderColor: '#757575',
            borderWidth: 0.5,
            borderRadius: 5,
          },
          multiline && { height: 'auto' },
        ]}>
        <Animated.Text
          style={[
            styles.label,
            labelStyle,
            disabled && { color: '#AEAEAE', zIndex: 1000 },
          ]}>
          {placeholder}
        </Animated.Text>

        <View style={[styles.inputContainer, multiline && { height: 'auto' }]}>
          <TextInput
            {...props}
            style={[styles.input, multiline && { height: 'auto' }]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={multiline ? true : false}
            onChangeText={handleTextChange}
            value={text}
            editable={editable == false || disabled ? false : true}
            textAlignVertical="center"
            keyboardType={keyboardType || 'default'}
            textContentType={
              props.secureTextEntry ? 'newPassword' : props.secureTextEntry
            }
            secureTextEntry={showPassword}
          />

          {props.secureTextEntry && error && !!text && (
            <View>
              <TouchableOpacity
                style={{ width: 24 }}
                onPress={() => setShowPassword(!showPassword)}>
                {!showPassword ? (
                  <Icon name="eye-outline" color={'gray'} size={24} />
                ) : (
                  <Icon name="eye-off-outline" color={'gray'} size={24} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    height: 60,
    justifyContent: 'center',
    width: '90%',
    marginHorizontal: '5%',
    backgroundColor: 'white',
    borderColor: '#757575',
    borderWidth: 0.5,
    borderRadius: 5,
  },
  label: {
    position: 'absolute',
    color: 'gray',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 50,
    marginTop: 10,
    paddingLeft: 20,
    color: 'black',
    paddingRight: 20,
  },
  errorText: {
    marginTop: 5,
    fontSize: 14,
    color: 'red',
    textAlign: 'right',
    marginRight: '10%',
  },
});

export default CustomInput;
