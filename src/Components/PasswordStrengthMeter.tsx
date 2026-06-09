import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontSizes } from '../Constant/AuthStyles';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { hp, wp } from '../Functions/responsive';

type Props = {
  password: string;
};

const getStrength = (password: string) => {
  if (!password) {
    return { score: 0, label: '' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
};

const barColors = [
  Colors.primary,
  '#E8750A',
  Colors.gold,
  Colors.gradientStart,
];

const PasswordStrengthMeter = ({ password }: Props) => {
  const { score, label } = getStrength(password);

  if (!password) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {barColors.map((color, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              index < score ? { backgroundColor: color } : styles.barEmpty,
            ]}
          />
        ))}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
    marginTop: hp('0.5%'),
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    gap: wp('1.6%'),
  },
  bar: {
    flex: 1,
    height: hp('0.5%'),
    borderRadius: wp('0.5%'),
  },
  barEmpty: {
    backgroundColor: Colors.gradientStart,
    opacity: 0.7,
  },
  label: {
    fontSize: FontSizes.bodySmall,
    color: Colors.gold,
    fontFamily: Fonts.semiBold,
    marginLeft: wp('2.7%'),
    minWidth: wp('12%'),
    textAlign: 'right',
  },
});

export default PasswordStrengthMeter;
