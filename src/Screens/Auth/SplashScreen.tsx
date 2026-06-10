import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../Assets';
import { AuthStyles } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { hp } from '../../Functions/responsive';

type Props = {
  navigation: {
    replace: (screen: string) => void;
  };
};

const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.root}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: AuthStyles.horizontalPadding,
    backgroundColor: Colors.white,
  },
  splashImage: {
    width: '100%',
    height: hp('85%'),
  },
});

export default SplashScreen;
