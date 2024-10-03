import {PixelRatio, Dimensions} from 'react-native';

export default NormaliseText = size => {
  const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
  const scale = SCREEN_WIDTH / 320; // Calculate scale based on screen width
  const newSize = size * scale; // Adjust size based on scale

  // Round the new size for iOS and Android
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};
