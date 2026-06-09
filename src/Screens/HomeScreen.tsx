import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Strings } from '../Constant';
import { FontSizes } from '../Constant/AuthStyles';
import { hp } from '../Functions/responsive';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{Strings.appName}</Text>
      <Text style={styles.subtitle}>Welcome to PiyariFamily</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: FontSizes.button,
    color: Colors.textLight,
  },
});

export default HomeScreen;
