import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';

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
    marginBottom: 16,
    marginTop: 4,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  barEmpty: {
    backgroundColor: Colors.gradientStart,
    opacity: 0.7,
  },
  label: {
    fontSize: 13,
    color: Colors.gold,
    fontFamily: Fonts.semiBold,
    marginLeft: 10,
    minWidth: 48,
    textAlign: 'right',
  },
});

export default PasswordStrengthMeter;
