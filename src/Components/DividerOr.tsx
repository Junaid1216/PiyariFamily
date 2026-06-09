import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { Strings } from '../Constant/Strings';

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
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  text: {
    marginHorizontal: 16,
    color: Colors.textLight,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
});

export default DividerOr;
