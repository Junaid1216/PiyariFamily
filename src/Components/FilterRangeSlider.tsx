import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { fs, hp, wp } from '../Functions/responsive';

type Props = {
  label: string;
  min: number;
  max: number;
  lowValue: number;
  highValue: number;
};

const FilterRangeSlider = ({
  label,
  min,
  max,
  lowValue,
  highValue,
}: Props) => {
  const range = max - min;
  const lowPercent = ((lowValue - min) / range) * 100;
  const highPercent = ((highValue - min) / range) * 100;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={styles.trackBg} />
        <View
          style={[
            styles.trackFill,
            { left: `${lowPercent}%`, width: `${highPercent - lowPercent}%` },
          ]}
        />
        <View style={[styles.thumb, { left: `${lowPercent}%` }]} />
        <View style={[styles.thumb, { left: `${highPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: hp('2.2%'),
  },
  label: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('1.2%'),
  },
  track: {
    height: hp('2.8%'),
    justifyContent: 'center',
  },
  trackBg: {
    height: hp('0.7%'),
    borderRadius: wp('1%'),
    backgroundColor: Colors.gradientStart,
  },
  trackFill: {
    position: 'absolute',
    height: hp('0.7%'),
    borderRadius: wp('1%'),
    backgroundColor: Colors.primary,
  },
  thumb: {
    position: 'absolute',
    width: wp('5.5%'),
    height: wp('5.5%'),
    borderRadius: wp('2.75%'),
    backgroundColor: Colors.primary,
    marginLeft: -wp('2.75%'),
    top: '50%',
    marginTop: -wp('2.75%'),
    borderWidth: 2,
    borderColor: Colors.white,
  },
});

export default FilterRangeSlider;
