import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Strings } from '../Constant';

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
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
});

export default HomeScreen;
