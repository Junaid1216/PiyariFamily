import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { AuthStyles, FontSizes } from '../Constant/AuthStyles';
import { Fonts } from '../Constant/Fonts';
import { fs, wp } from '../Functions/responsive';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  showArrow?: boolean;
  style?: ViewStyle;
};

const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  showArrow = false,
  style,
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}>
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.text}>{title}</Text>
          {showArrow && (
            <Icon
              name="arrow-right"
              size={fs(20)}
              color={Colors.white}
              style={styles.arrow}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: AuthStyles.buttonRadius,
    height: AuthStyles.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabled: {
    opacity: 0.55,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    marginLeft: wp('2%'),
  },
  text: {
    color: Colors.white,
    fontSize: FontSizes.button,
    fontFamily: Fonts.semiBold,
    letterSpacing: 0.2,
  },
});

export default PrimaryButton;
