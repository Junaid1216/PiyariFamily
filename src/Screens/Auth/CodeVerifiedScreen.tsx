import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import AuthBackground from '../../Components/AuthBackground';
import AuthSoftGlow from '../../Components/AuthSoftGlow';
import AuthStarDivider from '../../Components/AuthStarDivider';
import PrimaryButton from '../../Components/PrimaryButton';
import { Images } from '../../Assets';
import { AuthStyles } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { hp } from '../../Functions/responsive';

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

const CodeVerifiedScreen = ({ navigation }: Props) => {
  return (
    <AuthBackground variant="white">
      <AuthSoftGlow />
      <View style={styles.root}>
        <View style={styles.centerArea}>
          <Image
            source={Images.codeVerifiedIllustration}
            style={styles.illustration}
            resizeMode="contain"
          />

          <Text style={styles.title}>{Strings.codeVerifiedTitle}</Text>
          <Text style={styles.subtitle}>{Strings.codeVerifiedSubtitle}</Text>

          <AuthStarDivider width="48%" starImage={Images.starIcon} />
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title={Strings.setNewPassword}
            onPress={() => navigation.navigate('SetNewPassword')}
            showArrow
            style={styles.button}
          />
          <Text style={styles.stepText}>{Strings.codeVerifiedStep}</Text>
        </View>
      </View>
    </AuthBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: AuthStyles.horizontalPadding,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp('2%'),
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    marginBottom: 12,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  bottomSection: {
    width: '100%',
    paddingBottom: AuthStyles.bottomSectionPadding,
  },
  button: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  stepText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default CodeVerifiedScreen;
