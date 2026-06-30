import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
  PROFILE_SETUP_TOTAL_STEPS,
  QUALIFICATION_OPTIONS,
  Qualification,
} from '../../Constant/ProfileSetup';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { hp } from '../../Functions/responsive';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
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

  const handleContinue = () => {
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
    navigation.navigate('Career');
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
