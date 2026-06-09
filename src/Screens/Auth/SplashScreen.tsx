import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../Assets';
import { Colors } from '../../Constant/Colors';

type Props = {
  navigation: {
    replace: (screen: string) => void;
  };
};

const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.content}>
        <Image
          source={Images.splashIllustration}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%',
  },
  splashImage: {
    width: '100%',
    height: '85%',
  },
});

export default SplashScreen;
