import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../Constant/Colors';

type Props = {
  total?: number;
  activeIndex?: number;
  style?: ViewStyle;
};

const OnboardingDots = ({ total = 3, activeIndex = 0, style }: Props) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 18,
  },
  dot: {
    borderRadius: 4,
  },
  activeDot: {
    width: 28,
    height: 8,
    backgroundColor: Colors.gold,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.gradientStart,
  },
});

export default OnboardingDots;
