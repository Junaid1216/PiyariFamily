import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import AuthBackground from '../../Components/AuthBackground';
import AuthFooterHint from '../../Components/AuthFooterHint';
import AuthIconBadge from '../../Components/AuthIconBadge';
import AuthInput from '../../Components/AuthInput';
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'VerifyProfile'
>;

const VerifyProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      Toast.show('Please enter your phone number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('VerifyProfileCode', { phone: trimmed });
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

            <Text style={styles.title}>{Strings.verifyYourProfile}</Text>
            <Text style={styles.subtitle}>{Strings.verifyProfilePhoneSubtitle}</Text>

            <AuthInput
              label={Strings.phoneNumberLabel}
              iconName="phone-outline"
              placeholder={Strings.phoneNumberPlaceholder}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.hintRow}>
              <Icon
                name="shield-check-outline"
                size={FontSizes.bodyLarge}
                color={Colors.gold}
                style={styles.hintIcon}
              />
              <Text style={styles.hintText}>{Strings.securePhoneOtpHint}</Text>
            </View>

            <View style={styles.flexSpacer} />

            <View style={styles.bottomSection}>
              <PrimaryButton
                title={Strings.sendVerificationCode}
                onPress={handleSendCode}
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
    marginBottom: hp('3%'),
    fontFamily: Fonts.regular,
    lineHeight: hp('2.5%'),
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
    paddingRight: wp('2%'),
  },
  hintIcon: {
    marginRight: wp('2%'),
  },
  hintText: {
    flex: 1,
    fontSize: FontSizes.bodySmall,
    color: Colors.textLight,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    lineHeight: hp('2%'),
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

export default VerifyProfileScreen;
