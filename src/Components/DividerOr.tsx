import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontSizes } from '../Constant/AuthStyles';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { Strings } from '../Constant/Strings';
import { hp, wp } from '../Functions/responsive';

const DividerOr = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{Strings.or}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('2.5%'),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  text: {
    marginHorizontal: wp('4.3%'),
    color: Colors.textLight,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
  },
});

export default DividerOr;
