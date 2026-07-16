import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-simple-toast';
import { AxiosError } from 'axios';
import { Images } from '../../Assets';
import AuthInput from '../../Components/AuthInput';
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import SetupDropdown from '../../Components/SetupDropdown';
import SetupProgressBar from '../../Components/SetupProgressBar';
import {
  Api,
  ENDPOINTS,
  getApiErrorMessage,
  saveProfileCache,
  type ApiErrorResponse,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import {
  PROFILE_SETUP_TOTAL_STEPS,
  QUALIFICATION_OPTIONS,
  Qualification,
} from '../../Constant/ProfileSetup';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { hp } from '../../Functions/responsive';
import { store } from '../../Redux';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

const matchQualification = (value?: string | null): Qualification | '' => {
  if (!value) {
    return '';
  }

  const normalized = value.toLowerCase();
  const matched = QUALIFICATION_OPTIONS.find(
    option => option.toLowerCase() === normalized,
  );

  return matched ?? '';
};

const EducationScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [qualification, setQualification] = useState<Qualification | ''>('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [university, setUniversity] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'qualification' | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('Redux Education:', store.getState());

      const cachedProfile = store.getState().profile.profile;
      if (!cachedProfile) {
        return;
      }

      const qualificationValue = matchQualification(
        cachedProfile.qualification ?? cachedProfile.education,
      );
      if (qualificationValue) {
        setQualification(qualificationValue);
      }
      if (cachedProfile.field_of_study) {
        setFieldOfStudy(cachedProfile.field_of_study);
      }
      if (cachedProfile.university) {
        setUniversity(cachedProfile.university);
      }
      if (cachedProfile.graduation_year) {
        setGraduationYear(String(cachedProfile.graduation_year));
      }
    }, []),
  );

  const handleContinue = async () => {
    if (!qualification) {
      Toast.show('Please select your highest qualification');
      return;
    }
    if (!fieldOfStudy.trim()) {
      Toast.show('Please enter your field of study');
      return;
    }
    if (!university.trim()) {
      Toast.show('Please enter your university or college name');
      return;
    }
    if (!graduationYear.trim()) {
      Toast.show('Please enter your graduation year');
      return;
    }
    if (saving) {
      return;
    }

    const qualificationValue = qualification.toLowerCase();

    setSaving(true);

    try {
      console.log('Profile Education Request:', ENDPOINTS.PROFILE_EDUCATION);
      const res = await Api.updateProfileEducation({
        qualification: qualificationValue,
        highest_education: qualificationValue,
        field_of_study: fieldOfStudy.trim(),
        university: university.trim(),
        graduation_year: graduationYear.trim(),
        education_details: 'None',
      });

      if (res?.status == 200) {
        console.log('Profile Education Success:', res);
        saveProfileCache({
          qualification: qualificationValue,
          education: qualificationValue,
          field_of_study: fieldOfStudy.trim(),
          university: university.trim(),
          graduation_year: graduationYear.trim(),
        });
        Toast.show(res?.message ?? 'Education saved', Toast.LONG);
        navigation.navigate('Career');
      } else {
        console.log('Profile Education Failed:', res);
        Toast.show(res?.message ?? 'Failed to save education', Toast.LONG);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Profile Education Error:', axiosError?.response?.data || error);
      Toast.show(getApiErrorMessage(axiosError), Toast.LONG);
    } finally {
      setSaving(false);
    }
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
            currentStep={2}
            totalSteps={PROFILE_SETUP_TOTAL_STEPS}
            label={Strings.educationStep}
          />

          <Text style={styles.title}>{Strings.yourEducationTitle}</Text>
          <Text style={styles.subtitle}>{Strings.yourEducationSubtitle}</Text>

          <SetupDropdown
            label={Strings.highestQualificationLabel}
            iconName="school-outline"
            placeholder={Strings.selectQualificationPlaceholder}
            value={qualification}
            options={QUALIFICATION_OPTIONS}
            isOpen={openDropdown === 'qualification'}
            onToggle={() =>
              setOpenDropdown(prev =>
                prev === 'qualification' ? null : 'qualification',
              )
            }
            onSelect={value => {
              setQualification(value as Qualification);
              setOpenDropdown(null);
            }}
            style={styles.fieldSpacing}
          />

          <AuthInput
            label={Strings.fieldOfStudyLabel}
            iconSource={Images.fieldStudyIcon}
            placeholder={Strings.fieldOfStudyPlaceholder}
            value={fieldOfStudy}
            onChangeText={setFieldOfStudy}
          />

          <AuthInput
            label={Strings.universityLabel}
            iconSource={Images.universityIcon}
            placeholder={Strings.universityPlaceholder}
            value={university}
            onChangeText={setUniversity}
          />

          <AuthInput
            label={Strings.graduationYearLabel}
            iconSource={Images.calendarIcon}
            placeholder={Strings.graduationYearPlaceholder}
            value={graduationYear}
            onChangeText={setGraduationYear}
            keyboardType="number-pad"
            maxLength={4}
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
            loading={saving}
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

export default EducationScreen;
