import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { Strings } from '../Constant/Strings';
import { hp } from '../Functions/responsive';
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
          size={10}
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
    fontSize: 24,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    marginTop: 12,
    letterSpacing: 0.2,
  },
  starDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    width: 160,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.75,
  },
  starIcon: {
    marginHorizontal: 8,
  },
  tagline: {
    fontSize: 13,
    color: Colors.gold,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AuthHeader;
