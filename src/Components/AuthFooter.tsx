import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';

type Props = {
  prefix: string;
  linkText: string;
  onPress: () => void;
};

const AuthFooter = ({ prefix, linkText, onPress }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.prefix}>{prefix} </Text>
      <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
        <Text style={styles.link}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  prefix: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
  },
  link: {
    fontSize: 14,
    color: Colors.gold,
    fontFamily: Fonts.semiBold,
  },
});

export default AuthFooter;
