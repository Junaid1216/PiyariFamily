import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export { wp, hp };

export const normalize = (size: number): number => {
  const baseWidth = 375;
  const { Dimensions } = require('react-native');
  const screenWidth = Dimensions.get('window').width;
  return Math.round((size * screenWidth) / baseWidth);
};
