import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';

type Props = {
  onPress: () => void;
  variant?: 'default' | 'gray' | 'pink';
};

const BackButton = ({ onPress, variant = 'default' }: Props) => {
  const isPink = variant === 'pink';
  const isGray = variant === 'gray';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPink && styles.buttonPink,
        isGray && styles.buttonGray,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Icon
        name="chevron-left"
        size={22}
        color={isGray ? Colors.iconMuted : Colors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonPink: {
    backgroundColor: Colors.backButtonPink,
    borderColor: Colors.backButtonPink,
  },
  buttonGray: {
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
});

export default BackButton;
