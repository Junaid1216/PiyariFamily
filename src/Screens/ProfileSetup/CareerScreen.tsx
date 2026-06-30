import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-simple-toast';
import { Images } from '../../Assets';
import AuthInput from '../../Components/AuthInput';
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import SetupDropdown from '../../Components/SetupDropdown';
import SetupProgressBar from '../../Components/SetupProgressBar';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EmploymentType,
  INCOME_RANGE_OPTIONS,
  IncomeRange,
  PROFILE_SETUP_TOTAL_STEPS,
  RESIDENCE_STATUS_OPTIONS,
  ResidenceStatus,
} from '../../Constant/ProfileSetup';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { fs, hp, wp } from '../../Functions/responsive';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  Employed: Strings.employed,
  'Self-Employed': Strings.selfEmployed,
  Business: Strings.business,
};

const CareerScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>('Employed');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [incomeRange, setIncomeRange] = useState<IncomeRange | ''>('');
  const [residenceStatus, setResidenceStatus] =
    useState<ResidenceStatus>('Owned');
  const [openDropdown, setOpenDropdown] = useState<
    'income' | 'residence' | null
  >(null);

  const handleContinue = () => {
    if (!jobTitle.trim()) {
      Toast.show('Please enter your job title');
      return;
    }
    if (!company.trim()) {
      Toast.show('Please enter your company name');
      return;
    }
    if (!incomeRange) {
      Toast.show('Please select your income range');
      return;
    }
    navigation.navigate('PhysicalDetails');
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
            currentStep={3}
            totalSteps={PROFILE_SETUP_TOTAL_STEPS}
            label={Strings.careerStep}
          />

          <Text style={styles.title}>{Strings.yourCareerTitle}</Text>
          <Text style={styles.subtitle}>{Strings.yourCareerSubtitle}</Text>

          <Text style={styles.fieldLabel}>{Strings.employmentTypeLabel}</Text>
          <View style={styles.segmentContainer}>
            <View style={styles.segmentRow}>
              {EMPLOYMENT_TYPE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.segmentBtn,
                    employmentType === option && styles.segmentBtnActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setEmploymentType(option)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      employmentType === option && styles.segmentTextActive,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {EMPLOYMENT_LABELS[option]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <AuthInput
            label={Strings.jobTitleLabel}
            iconName="briefcase-outline"
            placeholder={Strings.jobTitlePlaceholder}
            value={jobTitle}
            onChangeText={setJobTitle}
          />

          <AuthInput
            label={Strings.companyLabel}
            iconSource={Images.companyIcon}
            placeholder={Strings.companyPlaceholder}
            value={company}
            onChangeText={setCompany}
          />

          <SetupDropdown
            label={Strings.monthlyIncomeLabel}
            iconSource={Images.incomeIcon}
            placeholder={Strings.selectIncomeRangePlaceholder}
            value={incomeRange}
            options={INCOME_RANGE_OPTIONS}
            isOpen={openDropdown === 'income'}
            onToggle={() =>
              setOpenDropdown(prev => (prev === 'income' ? null : 'income'))
            }
            onSelect={value => {
              setIncomeRange(value as IncomeRange);
              setOpenDropdown(null);
            }}
            style={styles.fieldSpacing}
          />

          <SetupDropdown
            label={Strings.residentialStatusLabel}
            iconName="home-outline"
            placeholder={Strings.residenceStatusPlaceholder}
            value={residenceStatus}
            options={RESIDENCE_STATUS_OPTIONS}
            isOpen={openDropdown === 'residence'}
            onToggle={() =>
              setOpenDropdown(prev =>
                prev === 'residence' ? null : 'residence',
              )
            }
            onSelect={value => {
              setResidenceStatus(value as ResidenceStatus);
              setOpenDropdown(null);
            }}
          />
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
  title: {
    fontSize: FontSizes.h2,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.6%'),
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginBottom: hp('2.5%'),
    lineHeight: hp('2.4%'),
  },
  fieldLabel: {
    fontSize: FontSizes.body,
    color: Colors.label,
    marginBottom: hp('1%'),
    fontFamily: Fonts.medium,
  },
  segmentContainer: {
    backgroundColor: Colors.white,
    borderRadius: AuthStyles.inputRadius,
    borderWidth: 1,
    borderColor: Colors.focusBorder,
    padding: wp('1.5%'),
    marginBottom: hp('2.2%'),
  },
  segmentRow: {
    flexDirection: 'row',
    gap: wp('1.5%'),
  },
  segmentBtn: {
    flex: 1,
    minHeight: hp('5.2%'),
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('1%'),
    borderRadius: wp('2.5%'),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.focusBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: Colors.white,
  },
  fieldSpacing: {
    marginBottom: hp('1.2%'),
  },
  footer: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
});

export default CareerScreen;
