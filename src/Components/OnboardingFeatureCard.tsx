import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';

type Props = {
  iconName: string;
  label: string;
};

const OnboardingFeatureCard = ({ iconName, label }: Props) => {
  return (
    <View style={styles.card}>
      <Icon name={iconName} size={22} color={Colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  label: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: Fonts.medium,
    marginTop: 8,
  },
});

export default OnboardingFeatureCard;
