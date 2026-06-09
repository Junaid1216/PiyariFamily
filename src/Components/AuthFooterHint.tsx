import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';

type Props = {
  text: string;
  style?: ViewStyle;
};

const AuthFooterHint = ({ text, style }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <Icon
        name="information-outline"
        size={14}
        color={Colors.textLight}
        style={styles.icon}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    flexShrink: 1,
  },
});

export default AuthFooterHint;
