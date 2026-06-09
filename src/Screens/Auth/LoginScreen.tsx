import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import AuthBackground from '../../Components/AuthBackground';
import AuthFooter from '../../Components/AuthFooter';
import AuthHeader from '../../Components/AuthHeader';
import AuthInput from '../../Components/AuthInput';
import DividerOr from '../../Components/DividerOr';
import PrimaryButton from '../../Components/PrimaryButton';
import SocialButton from '../../Components/SocialButton';
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

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Toast.show('Please fill in all fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Toast.show('Login successful');
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
          bounces={false}>
          <AuthHeader />

          <View style={styles.formSection}>
            <Text style={styles.title}>{Strings.welcomeBack}</Text>
            <Text style={styles.subtitle}>{Strings.loginSubtitle}</Text>

            <AuthInput
              label={Strings.emailLabel}
              iconName="email-outline"
              placeholder={Strings.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AuthInput
              label={Strings.passwordLabel}
              iconName="lock-outline"
              placeholder={Strings.passwordPlaceholder}
              value={password}
              onChangeText={setPassword}
              showToggle
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>{Strings.forgotPassword}</Text>
            </TouchableOpacity>

            <PrimaryButton
              title={Strings.logIn}
              onPress={handleLogin}
              loading={loading}
            />

            <DividerOr />

            <SocialButton
              provider="google"
              title={Strings.continueGoogle}
              onPress={() => Toast.show('Google login coming soon')}
            />
            <SocialButton
              provider="apple"
              title={Strings.continueApple}
              onPress={() => Toast.show('Apple login coming soon')}
            />
          </View>

          <AuthFooter
            prefix={Strings.noAccount}
            linkText={Strings.createAccount}
            onPress={() => navigation.navigate('SignUp')}
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
    paddingBottom: hp('2%'),
  },
  formSection: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.gold,
    fontFamily: Fonts.medium,
  },
  bottomSpacer: {
    height: hp('2%'),
  },
});

export default LoginScreen;
