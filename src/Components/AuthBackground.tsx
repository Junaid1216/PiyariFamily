import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../Constant/Colors';
import { hp } from '../Functions/responsive';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const AuthBackground = ({ children, style }: Props) => {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        locations={[0, 0.55, 1]}
        style={styles.gradient}
      />
      <SafeAreaView
        style={[styles.safeArea, style]}
        edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('30%'),
  },
  safeArea: {
    flex: 1,
  },
});

export default AuthBackground;
