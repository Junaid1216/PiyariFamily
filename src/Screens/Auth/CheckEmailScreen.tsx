import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import AuthBackground from '../../Components/AuthBackground';
import AuthFooterHint from '../../Components/AuthFooterHint';
import AuthIconBadge from '../../Components/AuthIconBadge';
import BackButton from '../../Components/BackButton';
import OtpCodeInput from '../../Components/OtpCodeInput';
import PrimaryButton from '../../Components/PrimaryButton';
import ResendCodeSection from '../../Components/ResendCodeSection';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { authService, getApiErrorMessage } from '../../API';
import { AuthStackParamList } from '../../Navigation/AuthNavigator';
import { hp, wp } from '../../Functions/responsive';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: { email: string }) => void;
  };
};

type CheckEmailRoute = RouteProp<AuthStackParamList, 'CheckEmail'>;

const CheckEmailScreen = ({ navigation }: Props) => {
  const route = useRoute<CheckEmailRoute>();
  const email = route.params.email;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Toast.show('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyResetOtp({
        email,
        otp: code,
      });

      if (response?.status == 200) {
        Toast.show(response.message || 'OTP verified successfully');
        navigation.navigate('CodeVerified', { email });
        return;
      }

      Toast.show(response.message || 'Verification failed. Please try again.');
    } catch (error) {
      Toast.show(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await authService.forgotPassword({ email });

      if (response?.status == 200) {
        Toast.show(response.message || 'Reset code resent');
        setResendCooldown(response.resend_after_seconds ?? 45);
        return;
      }

      Toast.show(response.message || 'Failed to resend code. Please try again.');
    } catch (error) {
      Toast.show(getApiErrorMessage(error));
    }
  };

  return (
    <AuthBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid
            bounces={false}
          >
            <BackButton variant="pink" onPress={() => navigation.goBack()} />

            <AuthIconBadge iconName="lock-outline" />

            <Text style={styles.title}>{Strings.checkYourEmail}</Text>
            <Text style={styles.subtitle}>{Strings.checkEmailSubtitle}</Text>

            <OtpCodeInput value={code} onChangeText={setCode} />

            <ResendCodeSection
              cooldownSeconds={resendCooldown}
              onResend={handleResend}
            />

            <View style={styles.flexSpacer} />

            <View style={styles.bottomSection}>
              <PrimaryButton
                title={Strings.verifyCode}
                onPress={handleVerify}
                loading={loading}
                showArrow
              />
              <AuthFooterHint
                text={Strings.spamFolderHint}
                style={styles.footerHint}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>
    </AuthBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1%'),
  },
  title: {
    fontSize: FontSizes.h2,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    marginBottom: hp('1%'),
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginBottom: hp('3.5%'),
    fontFamily: Fonts.regular,
    lineHeight: hp('2.5%'),
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
  },
  flexSpacer: {
    flex: 1,
    minHeight: hp('10%'),
  },
  bottomSection: {
    width: '100%',
    paddingBottom: AuthStyles.bottomSectionPadding,
  },
  footerHint: {
    marginTop: AuthStyles.footerHintTop,
  },
});

export default CheckEmailScreen;
