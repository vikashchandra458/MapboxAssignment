import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useAvailableDimensions} from './AvailableDimensions';

const CustomButton = ({onPress, isValid, title, style, textStyle, icon}) => {
  const {width} = useAvailableDimensions();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: width * 0.9, 
          backgroundColor: isValid ? '#8D00FF' : '#F5F5F5', 
          opacity: isValid ? 1 : 0.5, 
          borderWidth: 0.5,
          borderColor: isValid ? 'white' : '#757575', 
          paddingVertical: 8,
        },
        style,
      ]}
      activeOpacity={1}
      disabled={!isValid} 
      onPress={onPress}>
      <Text
        style={[
          styles.buttonText,
          {
            color: isValid ? 'white' : '#757575', 
          },
          textStyle,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
});

export default CustomButton;
