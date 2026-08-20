import React, { useEffect, useRef, useState } from 'react';
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
import { authService, ENDPOINTS, getApiErrorMessage } from '../../API';
import {
  navigateAfterLogin,
  resolvePostLoginRoute,
} from '../../Functions/authNavigation';
import { AuthStackParamList } from '../../Navigation/AuthNavigator';
import { hp, wp } from '../../Functions/responsive';
import { setAuthSession, store } from '../../Redux';

type Props = {
  navigation: {
    goBack: () => void;
    replace: (screen: string) => void;
    reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
  };
};

type VerifyEmailRoute = RouteProp<AuthStackParamList, 'VerifyEmail'>;

const isSelectedEmailInvalid = (error: unknown) => {
  const data = (error as any)?.response?.data || error;
  const fieldErrors = data?.errors
    ? Object.values(data.errors).flat().join(' ')
    : '';
  const text = `${data?.message ?? ''} ${fieldErrors}`.toLowerCase();
  return text.includes('selected email is invalid');
};

const VerifyEmailScreen = ({ navigation }: Props) => {
  const route = useRoute<VerifyEmailRoute>();
  const email = (route.params.email || '').trim();
  const autoSend = Boolean(route.params.autoSend);
  const signupPassword = route.params.password || '';
  const signupName = route.params.name?.trim() || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(autoSend ? 0 : 45);
  const autoSendStarted = useRef(false);

  const sendOtp = async (showToast = true) => {
    if (resending) {
      return;
    }

    setResending(true);

    try {
      console.log('Resend Email OTP Request:', ENDPOINTS.AUTH.RESEND_EMAIL_OTP);
      const response = await authService.resendEmailOtp({ email });

      if (response?.status == 200 || response?.success == 200 || response?.success === true) {
        console.log('Resend Email OTP Success:', response);
        if (showToast) {
          Toast.show(response.message || 'Verification code sent', Toast.LONG);
        }
        setResendCooldown(response.resend_after_seconds ?? 45);
        return;
      }

      console.log('Resend Email OTP Failed:', response);
      Toast.show(response.message || 'Failed to send code. Please try again.');
    } catch (error) {
      console.log('Resend Email OTP Error:', (error as any)?.response?.data || error);
      Toast.show(getApiErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (!autoSend || autoSendStarted.current) {
      return;
    }

    autoSendStarted.current = true;
    sendOtp(true);
    // Register already emails an OTP. Auto-send only for login → verify.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend, email]);

  const goToNextScreen = async (token?: string | null) => {
    let nextToken = token || store.getState().auth.accessToken;

    if (!nextToken && signupPassword) {
      try {
        const loginResponse = await authService.login({
          email,
          password: signupPassword,
        });
        nextToken =
          loginResponse.token ||
          loginResponse.access_token ||
          loginResponse.data?.token ||
          store.getState().auth.accessToken;
      } catch (loginError) {
        console.log(
          'Verify Email Login Fallback Error:',
          (loginError as any)?.response?.data || loginError,
        );
      }
    }

    store.dispatch(
      setAuthSession({
        user: store.getState().auth.user ?? {
          id: 0,
          name: signupName,
          email,
          phone: '',
          is_verified: true,
        },
        accessToken: nextToken || store.getState().auth.accessToken,
      }),
    );

    Toast.show('Email verified successfully');
    const nextRoute = await resolvePostLoginRoute();
    navigateAfterLogin(navigation, nextRoute);
  };

  const handleVerify = async () => {
    const otp = code.replace(/\D/g, '');

    if (otp.length !== 6) {
      Toast.show('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      console.log('Verify Email OTP Request:', ENDPOINTS.AUTH.VERIFY_EMAIL_OTP, {
        email,
        otp,
      });
      const response = await authService.verifyEmailOtp({
        email,
        otp,
      });

      if (
        response?.status == 200 ||
        response?.success === true ||
        response?.success == 200
      ) {
        console.log('Verify Email OTP Success:', response);
        await goToNextScreen(
          response.token ||
            response.access_token ||
            store.getState().auth.accessToken,
        );
        return;
      }

      if (isSelectedEmailInvalid(response)) {
        console.log('Verify Email OTP Pending Account:', response);
        await goToNextScreen();
        return;
      }

      console.log('Verify Email OTP Failed:', response);
      Toast.show(response.message || 'Verification failed. Please try again.');
    } catch (error) {
      console.log(
        'Verify Email OTP Error:',
        (error as any)?.response?.data || error,
      );

      if (isSelectedEmailInvalid(error)) {
        await goToNextScreen();
        return;
      }

      Toast.show(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    sendOtp(true);
  };

  return (
    <AuthBackground variant="white">
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
            <BackButton variant="gray" onPress={() => navigation.goBack()} />

            <AuthIconBadge iconName="email-check-outline" />

            <Text style={styles.title}>{Strings.verifyYourEmail}</Text>
            <Text style={styles.subtitle}>{Strings.verifyEmailSubtitle}</Text>

            <OtpCodeInput value={code} onChangeText={setCode} />

            <ResendCodeSection
              cooldownSeconds={resendCooldown}
              loading={resending}
              onResend={handleResend}
            />

            <View style={styles.flexSpacer} />

            <View style={styles.bottomSection}>
              <PrimaryButton
                title={Strings.verifyAndContinue}
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

export default VerifyEmailScreen;
