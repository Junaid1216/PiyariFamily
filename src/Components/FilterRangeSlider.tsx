import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { fs, hp, wp } from '../Functions/responsive';

type Props = {
  title: string;
  iconName?: string;
  iconSource?: ImageSourcePropType;
  min: number;
  max: number;
  lowValue: number;
  highValue: number;
  minLabel: string;
  centerLabel: string;
  maxLabel: string;
  onLowValueChange?: (value: number) => void;
  onHighValueChange?: (value: number) => void;
};

const FilterRangeSlider = ({
  title,
  iconName,
  iconSource,
  min,
  max,
  lowValue,
  highValue,
  minLabel,
  centerLabel,
  maxLabel,
  onLowValueChange,
  onHighValueChange,
}: Props) => {
  const range = max - min;
  const lowPercent = ((lowValue - min) / range) * 100;
  const highPercent = ((highValue - min) / range) * 100;

  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionHeader}>
        {iconSource ? (
          <Image
            source={iconSource}
            style={styles.sectionIconImage}
            resizeMode="contain"
          />
        ) : iconName ? (
          <Icon name={iconName} size={fs(18)} color={Colors.primary} />
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>

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

      <View style={styles.labelsRow}>
        <Text style={styles.edgeLabel}>{minLabel}</Text>
        <Text style={styles.centerLabel}>{centerLabel}</Text>
        <Text style={styles.edgeLabel}>{maxLabel}</Text>
      </View>

      {onLowValueChange || onHighValueChange ? (
        <View style={styles.controlsRow}>
          {onLowValueChange ? (
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Min</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onLowValueChange(Math.max(min, lowValue - 1))}
              >
                <Icon
                  name="minus-circle-outline"
                  size={fs(22)}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.controlValue}>{lowValue}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  onLowValueChange(Math.min(highValue - 1, lowValue + 1))
                }
              >
                <Icon
                  name="plus-circle-outline"
                  size={fs(22)}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          ) : null}

          {onHighValueChange ? (
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Max</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  onHighValueChange(Math.max(lowValue + 1, highValue - 1))
                }
              >
                <Icon
                  name="minus-circle-outline"
                  size={fs(22)}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.controlValue}>{highValue}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onHighValueChange(Math.min(max, highValue + 1))}
              >
                <Icon
                  name="plus-circle-outline"
                  size={fs(22)}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: hp('2.2%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginBottom: hp('1.2%'),
  },
  sectionIconImage: {
    width: fs(18),
    height: fs(18),
  },
  title: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.primary,
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
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('0.8%'),
  },
  edgeLabel: {
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  centerLabel: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('4%'),
    marginTop: hp('1.2%'),
  },
  controlGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('3%'),
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('2%'),
  },
  controlLabel: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.textLight,
    marginRight: wp('1%'),
  },
  controlValue: {
    minWidth: wp('7%'),
    textAlign: 'center',
    fontSize: fs(13),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
});

export default FilterRangeSlider;
