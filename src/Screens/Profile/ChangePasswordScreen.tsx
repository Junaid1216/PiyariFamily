import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import BackButton from '../../Components/BackButton';
import PasswordStrengthMeter from '../../Components/PasswordStrengthMeter';
import PrimaryButton from '../../Components/PrimaryButton';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ChangePassword'
>;

const REQUIREMENTS = [
  { label: 'At least 8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'At least One uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least One number', test: (p: string) => /[0-9]/.test(p) },
  {
    label: 'At least One special char',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

type PasswordFieldProps = {
  label: string;
  placeholder: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
};

const PasswordField = ({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
}: PasswordFieldProps) => {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <Icon name={icon} size={fs(20)} color={Colors.primary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setHidden(prev => !prev)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={fs(20)}
            color={Colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ChangePasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show('Passwords do not match');
      return;
    }

    const allMet = REQUIREMENTS.every(item => item.test(newPassword));
    if (!allMet) {
      Toast.show('Please meet all password requirements');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Toast.show(Strings.passwordUpdated);
      navigation.goBack();
    }, 800);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#FFE5EC', '#FFF8FA', Colors.background]}
        style={styles.topGlow}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.flex}>
          <View style={styles.header}>
            <BackButton
              variant="pink"
              compact
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>{Strings.changePassword}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            bounces={false}
          >
            <View style={styles.iconBadge}>
              <LinearGradient
                colors={[Colors.goldLight, Colors.gold]}
                style={styles.iconGradient}
              >
                <Icon name="key-variant" size={fs(28)} color={Colors.white} />
              </LinearGradient>
            </View>

            <Text style={styles.title}>{Strings.updateYourPassword}</Text>
            <Text style={styles.subtitle}>{Strings.changePasswordSubtitle}</Text>

            <PasswordField
              label={Strings.currentPasswordLabel}
              placeholder={Strings.currentPasswordPlaceholder}
              icon="lock-outline"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <PasswordField
              label={Strings.newPasswordLabel}
              placeholder={Strings.newPasswordPlaceholder}
              icon="shield-check-outline"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <PasswordStrengthMeter password={newPassword} />

            <View style={styles.requirementsGrid}>
              {REQUIREMENTS.map(item => {
                const met = item.test(newPassword);
                return (
                  <View key={item.label} style={styles.requirementItem}>
                    <Icon
                      name={met ? 'check-circle' : 'circle-outline'}
                      size={fs(14)}
                      color={met ? '#4CAF50' : Colors.border}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        met && styles.requirementTextMet,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <PasswordField
              label={Strings.confirmNewPasswordLabel}
              placeholder={Strings.confirmNewPasswordPlaceholder}
              icon="shield-check-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.securityNote}>
              <Icon
                name="shield-check-outline"
                size={fs(18)}
                color={Colors.primary}
              />
              <Text style={styles.securityNoteText}>
                {Strings.passwordSecurityNote}
              </Text>
            </View>

            <PrimaryButton
              title={Strings.updatePassword}
              onPress={handleUpdate}
              loading={loading}
              showArrow
            />

            <TouchableOpacity
              style={styles.forgotWrap}
              activeOpacity={0.85}
              onPress={() => Toast.show('Password reset link sent')}
            >
              <Text style={styles.forgotText}>{Strings.forgotYourPassword}</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('18%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AuthStyles.horizontalPadding,
    marginBottom: hp('1%'),
    zIndex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.h3,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: AuthStyles.backButtonSize,
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('3%'),
  },
  iconBadge: {
    alignSelf: 'center',
    marginBottom: hp('1.8%'),
    marginTop: hp('0.5%'),
  },
  iconGradient: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('4.5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.h2,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: hp('0.6%'),
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: hp('2.4%'),
    marginBottom: hp('2.5%'),
    paddingHorizontal: wp('2%'),
  },
  fieldWrap: {
    marginBottom: hp('1.4%'),
  },
  fieldLabel: {
    fontSize: fs(12),
    fontFamily: Fonts.medium,
    color: Colors.textLight,
    marginBottom: hp('0.6%'),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tabActiveBg,
    borderWidth: 1,
    borderColor: '#F0D0D8',
    borderRadius: wp('3.2%'),
    paddingHorizontal: wp('3.5%'),
    height: AuthStyles.inputHeight,
    gap: wp('2.5%'),
  },
  input: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.label,
    paddingVertical: 0,
  },
  requirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
    marginTop: hp('0.2%'),
  },
  requirementItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    marginBottom: hp('0.8%'),
  },
  requirementText: {
    flex: 1,
    fontSize: fs(10),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  requirementTextMet: {
    color: Colors.textSecondary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp('2.5%'),
    backgroundColor: Colors.tabActiveBg,
    borderWidth: 1,
    borderColor: '#F0D0D8',
    borderRadius: wp('3%'),
    padding: wp('3.5%'),
    marginBottom: hp('2%'),
    marginTop: hp('0.5%'),
  },
  securityNoteText: {
    flex: 1,
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.primary,
    lineHeight: hp('2%'),
  },
  forgotWrap: {
    alignItems: 'center',
    marginTop: hp('1.5%'),
  },
  forgotText: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.gold,
  },
});

export default ChangePasswordScreen;
