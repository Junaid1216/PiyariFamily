import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import { Images } from '../../Assets';
import AuthInput from '../../Components/AuthInput';
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import SetupProgressBar from '../../Components/SetupProgressBar';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import {
  MARITAL_STATUS_OPTIONS,
  MaritalStatus,
  PROFILE_SETUP_TOTAL_STEPS,
} from '../../Constant/ProfileSetup';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { fs, hp, wp } from '../../Functions/responsive';

type Gender = 'male' | 'female';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
    replace: (screen: string) => void;
  };
};

const parseDateOfBirth = (value: string): Date | null => {
  const cleaned = value.replace(/\s/g, '');
  const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const calculateAge = (date: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
};

const formatDateInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
};

const BasicInfoScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | ''>('');
  const [maritalDropdownOpen, setMaritalDropdownOpen] = useState(false);

  const age = useMemo(() => {
    const parsed = parseDateOfBirth(dateOfBirth);
    if (!parsed) {
      return null;
    }
    return calculateAge(parsed);
  }, [dateOfBirth]);

  const handleContinue = () => {
    if (!fullName.trim()) {
      Toast.show('Please enter your full name');
      return;
    }
    if (!parseDateOfBirth(dateOfBirth)) {
      Toast.show('Please enter a valid date of birth');
      return;
    }
    if (!maritalStatus) {
      Toast.show('Please select your marital status');
      return;
    }
    navigation.navigate('Education');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton variant="pink" onPress={() => navigation.goBack()} />

          <SetupProgressBar
            currentStep={1}
            totalSteps={PROFILE_SETUP_TOTAL_STEPS}
            label={Strings.basicInfoStep}
          />

          <View style={styles.logoWrap}>
            <Image
              source={Images.appLogo}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>{Strings.tellUsAboutYouTitle}</Text>
          <Text style={styles.subtitle}>{Strings.tellUsAboutYouSubtitle}</Text>

          <AuthInput
            label={Strings.fullNameLabel}
            iconName="account-outline"
            placeholder={Strings.fullNamePlaceholder}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>{Strings.genderLabel}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === 'male' && styles.genderBtnActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setGender('male')}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'male' && styles.genderTextActive,
                ]}
              >
                {Strings.genderMale}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === 'female' && styles.genderBtnActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setGender('female')}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'female' && styles.genderTextActive,
                ]}
              >
                {Strings.genderFemale}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>{Strings.dateOfBirthLabel}</Text>
          <View style={styles.dobRow}>
            <Icon
              name="calendar-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.dobIcon}
            />
            <TextInput
              style={styles.dobInput}
              placeholder={Strings.dateOfBirthPlaceholder}
              placeholderTextColor={Colors.placeholder}
              value={dateOfBirth}
              onChangeText={text => setDateOfBirth(formatDateInput(text))}
              keyboardType="number-pad"
              maxLength={14}
            />
            {age !== null ? (
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>
                  Age: {age} {Strings.ageYears}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.fieldLabel}>{Strings.maritalStatusDetail}</Text>
          <TouchableOpacity
            style={styles.dropdownRow}
            activeOpacity={0.85}
            onPress={() => setMaritalDropdownOpen(prev => !prev)}
          >
            <Icon
              name="heart-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.dropdownIcon}
            />
            <Text
              style={[
                styles.dropdownText,
                !maritalStatus && styles.dropdownPlaceholder,
              ]}
            >
              {maritalStatus || Strings.maritalStatusPlaceholder}
            </Text>
            <Icon
              name={maritalDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={fs(22)}
              color={Colors.iconMuted}
            />
          </TouchableOpacity>
          {maritalDropdownOpen ? (
            <View style={styles.dropdownMenu}>
              {MARITAL_STATUS_OPTIONS.map(option => {
                const isSelected = maritalStatus === option;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownOption,
                      isSelected && styles.dropdownOptionSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setMaritalStatus(option);
                      setMaritalDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected && styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected ? (
                      <Icon name="check" size={fs(18)} color={Colors.gold} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: getFooterBottomPadding(insets.bottom) },
          ]}
        >
          <PrimaryButton
            title={Strings.continueBtn}
            onPress={handleContinue}
            showArrow
          />
        </View>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('2%'),
  },
  logoWrap: {
    alignSelf: 'center',
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2.5%'),
    overflow: 'hidden',
  },
  logo: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('3%'),
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
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: hp('3%'),
    lineHeight: hp('2.4%'),
  },
  fieldLabel: {
    fontSize: FontSizes.body,
    color: Colors.label,
    marginBottom: hp('1%'),
    fontFamily: Fonts.medium,
  },
  genderContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FDECEC',
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.white,
    padding: wp('1%'),
    gap: wp('1.5%'),
    marginBottom: hp('2.2%'),
  },
  genderBtn: {
    flex: 1,
    height: hp('5.2%'),
    borderRadius: wp('2.4%'),
    borderWidth: 1,
    borderColor: '#FDECEC',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  genderTextActive: {
    color: Colors.white,
    fontFamily: Fonts.bold,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: wp('3.7%'),
    height: AuthStyles.inputHeight,
    marginBottom: hp('1%'),
  },
  dobIcon: {
    marginRight: wp('2.5%'),
  },
  dobInput: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
    paddingVertical: 0,
  },
  ageBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: wp('2.2%'),
    paddingVertical: hp('0.45%'),
    borderRadius: wp('3%'),
    marginLeft: wp('1.5%'),
  },
  ageBadgeText: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: wp('3.7%'),
    height: AuthStyles.inputHeight,
    marginBottom: hp('0.5%'),
  },
  dropdownIcon: {
    marginRight: wp('2.5%'),
  },
  dropdownText: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  dropdownPlaceholder: {
    color: Colors.placeholder,
  },
  dropdownMenu: {
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    marginBottom: hp('1%'),
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.4%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.inputBg,
  },
  dropdownOptionText: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  dropdownOptionTextSelected: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
});

export default BasicInfoScreen;
