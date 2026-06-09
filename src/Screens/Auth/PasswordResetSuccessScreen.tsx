import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AuthBackground from '../../Components/AuthBackground';
import AuthStarDivider from '../../Components/AuthStarDivider';
import AuthWelcomeGlow from '../../Components/AuthWelcomeGlow';
import PrimaryButton from '../../Components/PrimaryButton';
import { Images } from '../../Assets';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { hp, wp } from '../../Functions/responsive';

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

const PasswordResetSuccessScreen = ({ navigation }: Props) => {
  return (
    <AuthBackground>
      <AuthWelcomeGlow />
      <View style={styles.root}>
        <View style={styles.centerArea}>
          <View style={styles.brandSection}>
            <LinearGradient
              colors={[Colors.goldLight, Colors.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.logoBadge}>
              <Image
                source={Images.handshakeIcon}
                style={styles.handshakeIcon}
                resizeMode="contain"
              />
            </LinearGradient>

            <Text style={styles.appName}>{Strings.appName}</Text>

            <AuthStarDivider width="42%" starImage={Images.starIcon} />

            <Text style={styles.tagline}>{Strings.tagline}</Text>
          </View>

          <Text style={styles.title}>{Strings.welcomeBackTitle}</Text>
          <Text style={styles.subtitle}>{Strings.welcomeBackSubtitle}</Text>

          <View style={styles.successBox}>
            <Image
              source={Images.resetSuccessCheck}
              style={styles.successIcon}
              resizeMode="contain"
            />
            <Text style={styles.successText}>
              {Strings.passwordResetSuccessMessage}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title={Strings.logInNow}
            onPress={() => navigation.navigate('Login')}
            showArrow
            style={styles.button}
          />

          <TouchableOpacity activeOpacity={0.7} style={styles.supportBtn}>
            <Text style={styles.supportText}>
              {Strings.needHelpContactSupport}
            </Text>
          </TouchableOpacity>

          <AuthStarDivider
            icon="heart"
            width="42%"
            heartImage={Images.heartIcon}
            style={styles.footerDivider}
          />
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
  brandSection: {
    alignItems: 'center',
    marginBottom: hp('3.5%'),
  },
  logoBadge: {
    width: AuthStyles.logoSize,
    height: AuthStyles.logoSize,
    borderRadius: AuthStyles.logoRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.5%'),
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: AuthStyles.shadowOffsetY },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  handshakeIcon: {
    width: wp('10.1%'),
    height: wp('10.1%'),
  },
  appName: {
    fontSize: FontSizes.h3,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    letterSpacing: 0.2,
    marginBottom: hp('0.25%'),
  },
  tagline: {
    fontSize: FontSizes.bodySmall,
    color: Colors.gold,
    fontFamily: Fonts.medium,
    fontStyle: 'italic',
    marginTop: hp('0.25%'),
  },
  title: {
    fontSize: FontSizes.h1,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    marginBottom: hp('1.5%'),
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    lineHeight: hp('2.75%'),
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
    marginBottom: hp('3%'),
    maxWidth: AuthStyles.maxContentWidth,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderRadius: AuthStyles.successBoxRadius,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    width: '100%',
  },
  successIcon: {
    width: wp('9.6%'),
    height: wp('9.6%'),
    marginRight: wp('3%'),
  },
  successText: {
    flex: 1,
    fontSize: FontSizes.bodyLarge,
    color: Colors.primary,
    fontFamily: Fonts.semiBold,
    lineHeight: hp('2.5%'),
  },
  bottomSection: {
    width: '100%',
    paddingBottom: AuthStyles.bottomSectionPadding,
  },
  button: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: AuthStyles.shadowOffsetY },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  supportBtn: {
    alignItems: 'center',
    marginTop: hp('2.25%'),
  },
  supportText: {
    fontSize: FontSizes.body,
    color: Colors.gold,
    fontFamily: Fonts.semiBold,
  },
  footerDivider: {
    marginTop: hp('2.25%'),
    marginBottom: hp('0.5%'),
  },
});

export default PasswordResetSuccessScreen;
