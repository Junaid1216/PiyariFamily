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
import AuthIconBadge from '../../Components/AuthIconBadge';
import AuthInput from '../../Components/AuthInput';
import BackButton from '../../Components/BackButton';
import PasswordRequirements from '../../Components/PasswordRequirements';
import PasswordStrengthMeter from '../../Components/PasswordStrengthMeter';
import PrimaryButton from '../../Components/PrimaryButton';
import { AuthStyles } from '../../Constant/AuthStyles';
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

const isPasswordValid = (password: string) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const SetNewPasswordScreen = ({ navigation }: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!password || !confirmPassword) {
      Toast.show('Please fill in all fields');
      return;
    }
    if (!isPasswordValid(password)) {
      Toast.show('Please meet all password requirements');
      return;
    }
    if (password !== confirmPassword) {
      Toast.show('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('PasswordResetSuccess');
    }, 1000);
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

            <AuthIconBadge iconName="hand-heart" iconSize={32} />

            <Text style={styles.title}>{Strings.setNewPasswordTitle}</Text>
            <Text style={styles.subtitle}>
              {Strings.setNewPasswordSubtitle}
            </Text>

            <AuthInput
              label={Strings.newPasswordLabel}
              iconName="lock-outline"
              placeholder={Strings.newPasswordPlaceholder}
              value={password}
              onChangeText={setPassword}
              showToggle
              secureTextEntry
            />

            <AuthInput
              label={Strings.confirmNewPasswordLabel}
              iconName="shield-check-outline"
              placeholder={Strings.confirmNewPasswordPlaceholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              showToggle
              secureTextEntry
            />

            <PasswordStrengthMeter password={password} />
            <PasswordRequirements password={password} />

            <View style={styles.flexSpacer} />

            <View style={styles.bottomSection}>
              <PrimaryButton
                title={Strings.resetPassword}
                onPress={handleReset}
                loading={loading}
                showArrow
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
    fontSize: 26,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    marginBottom: 8,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontFamily: Fonts.regular,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  flexSpacer: {
    flex: 1,
    minHeight: hp('6%'),
  },
  bottomSection: {
    width: '100%',
    paddingBottom: AuthStyles.bottomSectionPadding,
  },
});

export default SetNewPasswordScreen;
