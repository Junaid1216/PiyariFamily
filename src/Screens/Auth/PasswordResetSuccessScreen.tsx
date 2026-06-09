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
    marginBottom: 28,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  handshakeIcon: {
    width: 38,
    height: 38,
  },
  appName: {
    fontSize: 24,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 13,
    color: Colors.gold,
    fontFamily: Fonts.medium,
    fontStyle: 'italic',
    marginTop: 2,
  },
  title: {
    fontSize: 28,
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
    paddingHorizontal: 8,
    marginBottom: 24,
    maxWidth: 320,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
  },
  successIcon: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  successText: {
    flex: 1,
    fontSize: 15,
    color: Colors.primary,
    fontFamily: Fonts.semiBold,
    lineHeight: 20,
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
  supportBtn: {
    alignItems: 'center',
    marginTop: 18,
  },
  supportText: {
    fontSize: 14,
    color: Colors.gold,
    fontFamily: Fonts.semiBold,
  },
  footerDivider: {
    marginTop: 18,
    marginBottom: 4,
  },
});

export default PasswordResetSuccessScreen;
