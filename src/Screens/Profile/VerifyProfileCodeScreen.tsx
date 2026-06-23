import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { hp, wp } from '../../Functions/responsive';

type RouteProps = RouteProp<ProfileStackParamList, 'VerifyProfileCode'>;
type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'VerifyProfileCode'
>;

const VerifyProfileCodeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (code.length !== 6) {
      Toast.show('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('ProfileVerified', { phone: route.params.phone });
    }, 800);
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
            <BackButton variant="pink" onPress={() => navigation.goBack()} />

            <AuthIconBadge iconName="shield-check-outline" />

            <Text style={styles.title}>{Strings.enterVerificationCode}</Text>
            <Text style={styles.subtitle}>{Strings.verifyProfileCodeSubtitle}</Text>

            <OtpCodeInput value={code} onChangeText={setCode} />

            <ResendCodeSection
              onResend={() => Toast.show('Verification code resent')}
            />

            <View style={styles.flexSpacer} />

            <View style={styles.bottomSection}>
              <PrimaryButton
                title={Strings.verifyNumber}
                onPress={handleVerify}
                loading={loading}
                showArrow
              />
              <AuthFooterHint
                text={Strings.verificationTrustHint}
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
    minHeight: hp('8%'),
  },
  bottomSection: {
    width: '100%',
    paddingBottom: AuthStyles.bottomSectionPadding,
  },
  footerHint: {
    marginTop: AuthStyles.footerHintTop,
  },
});

export default VerifyProfileCodeScreen;
