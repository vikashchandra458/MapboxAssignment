import React, {useEffect, useState} from 'react';
import {Keyboard, Dimensions} from 'react-native';

export const useAvailableDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: Dimensions.get('window')?.width || 0,
    height: Dimensions.get('window')?.height || 0,
  });
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Listener to update keyboard height when it shows
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    // Listener to reset keyboard height when it hides
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove(); // Clean up listeners
    };
  }, [Dimensions]);

  useEffect(() => {
    const updateDimensions = () => {
      // Update window dimensions on change
      setWindowDimensions({
        width: Dimensions.get('window')?.width || 0,
        height: Dimensions.get('window')?.height || 0,
      });
    };

    Dimensions.addEventListener('change', updateDimensions); 
  }, [Dimensions]);

  const availableDimensions = {
    width: windowDimensions.width,
    height: windowDimensions.height - keyboardHeight, 
    landscape:
      windowDimensions.width > windowDimensions.height - keyboardHeight, 
  };

  return availableDimensions; 
};
