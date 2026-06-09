import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import AuthBackground from '../../Components/AuthBackground';
import AuthFooter from '../../Components/AuthFooter';
import AuthInput from '../../Components/AuthInput';
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import TermsCheckbox from '../../Components/TermsCheckbox';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { hp } from '../../Functions/responsive';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

const SignUpScreen = ({ navigation }: Props) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Toast.show('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Toast.show('Passwords do not match');
      return;
    }
    if (!agreed) {
      Toast.show('Please agree to Terms & Privacy Policy');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Toast.show('Account created successfully');
      navigation.navigate('VerifyEmail');
    }, 1000);
  };

  return (
    <AuthBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          bounces={false}
        >
          <BackButton onPress={() => navigation.goBack()} />

          <View style={styles.formSection}>
            <Text style={styles.title}>{Strings.createYourAccount}</Text>
            <Text style={styles.subtitle}>{Strings.signUpSubtitle}</Text>

            <AuthInput
              label={Strings.fullNameLabel}
              iconName="account-outline"
              placeholder={Strings.fullNamePlaceholder}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <AuthInput
              label={Strings.emailLabel}
              iconName="email-outline"
              placeholder={Strings.signUpEmailPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AuthInput
              label={Strings.passwordLabel}
              iconName="lock-outline"
              placeholder={Strings.createPasswordPlaceholder}
              value={password}
              onChangeText={setPassword}
              showToggle
              secureTextEntry
            />

            <AuthInput
              label={Strings.confirmPasswordLabel}
              iconName="shield-check-outline"
              placeholder={Strings.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TermsCheckbox checked={agreed} onToggle={setAgreed} />

            <PrimaryButton
              title={Strings.createAccount}
              onPress={handleSignUp}
              loading={loading}
            />
          </View>

          <AuthFooter
            prefix={Strings.alreadyHaveAccount}
            linkText={Strings.logInLink}
            onPress={() => navigation.navigate('Login')}
          />

          <View style={styles.bottomSpacer} />
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </AuthBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1%'),
    paddingBottom: hp('2%'),
  },
  formSection: {
    width: '100%',
  },
  title: {
    fontSize: FontSizes.h2,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    marginBottom: hp('0.75%'),
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.body,
    textAlign: 'center',
    color: Colors.gold,
    marginBottom: hp('3%'),
    fontFamily: Fonts.regular,
    lineHeight: hp('2.5%'),
  },
  bottomSpacer: {
    height: hp('2%'),
  },
});

export default SignUpScreen;
