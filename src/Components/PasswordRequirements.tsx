import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontSizes } from '../Constant/AuthStyles';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { fs, hp, wp } from '../Functions/responsive';

type Props = {
  password: string;
};

const requirements = [
  { label: 'At least 8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'At least One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least One number', test: (p: string) => /[0-9]/.test(p) },
  {
    label: 'At least One special char',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

const PasswordRequirements = ({ password }: Props) => {
  return (
    <View style={styles.container}>
      {requirements.map(item => {
        const met = item.test(password);
        return (
          <View key={item.label} style={styles.row}>
            <Icon
              name={met ? 'check-circle' : 'circle-outline'}
              size={fs(16)}
              color={met ? '#4CAF50' : Colors.border}
              style={styles.icon}
            />
            <Text style={[styles.text, met && styles.textMet]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2.5%'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  icon: {
    marginRight: wp('2%'),
  },
  text: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    flex: 1,
  },
  textMet: {
    color: Colors.text,
  },
});

export default PasswordRequirements;
