import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontSizes } from '../Constant/AuthStyles';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { Strings } from '../Constant/Strings';
import { fs, hp, wp } from '../Functions/responsive';
import AppLogo from './AppLogo';

const AuthHeader = () => {
  return (
    <View style={styles.container}>
      <AppLogo />
      <Text style={styles.appName}>{Strings.appName}</Text>

      <View style={styles.starDivider}>
        <View style={styles.dividerLine} />
        <Icon
          name="star-four-points"
          size={fs(10)}
          color={Colors.gold}
          style={styles.starIcon}
        />
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.tagline}>{Strings.tagline}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: hp('1.5%'),
    marginBottom: hp('2.8%'),
  },
  appName: {
    fontSize: FontSizes.h3,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    marginTop: hp('1.5%'),
    letterSpacing: 0.2,
  },
  starDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('0.7%'),
    width: wp('42%'),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.75,
  },
  starIcon: {
    marginHorizontal: wp('2%'),
  },
  tagline: {
    fontSize: FontSizes.bodySmall,
    color: Colors.gold,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AuthHeader;
