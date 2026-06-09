import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors } from '../Constant/Colors';
import { AuthStyles } from '../Constant/AuthStyles';
import { Fonts } from '../Constant/Fonts';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
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
        <Text style={styles.text}>{title}</Text>
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
  text: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    letterSpacing: 0.2,
  },
});

export default PrimaryButton;
