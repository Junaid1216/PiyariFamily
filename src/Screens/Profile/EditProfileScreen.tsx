import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import { Images } from '../../Assets';
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import SetupDropdown from '../../Components/SetupDropdown';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import {
  COMMUNITY_OPTIONS,
  Community,
  EDIT_MARITAL_STATUS_OPTIONS,
  EditMaritalStatus,
  MAX_OTHER_LANGUAGES,
  MOTHER_TONGUE_OPTIONS,
  MotherTongue,
  OTHER_LANGUAGE_OPTIONS,
  OtherLanguage,
  RESIDENCE_STATUS_OPTIONS,
  ResidenceStatus,
} from '../../Constant/ProfileSetup';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

type Gender = 'male' | 'female';
type HeightUnit = 'ft' | 'in';

const ABOUT_MAX_LENGTH = 300;
const DEFAULT_ABOUT =
  'I am a family-oriented person who values honesty, kindness, and meaningful connections. I enjoy reading, traveling, and spending quality time with loved ones.';

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('Ayesha');
  const [dateOfBirth] = useState('14 March 1999');
  const [gender, setGender] = useState<Gender>('female');
  const [aboutMe, setAboutMe] = useState(DEFAULT_ABOUT.slice(0, 128));
  const [email] = useState('Ayesh@gmail.com');
  const [phone, setPhone] = useState('+92 34865 43210');
  const [city, setCity] = useState('Lahore, Pakistan');
  const [height, setHeight] = useState('5 ft 4 inches');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('ft');
  const [motherTongue, setMotherTongue] = useState<MotherTongue>('Urdu');
  const [otherLanguages, setOtherLanguages] = useState<OtherLanguage[]>([
    'Urdu',
    'English',
  ]);
  const [maritalStatus, setMaritalStatus] =
    useState<EditMaritalStatus>('Never Married');
  const [community, setCommunity] = useState<Community>('Sunni');
  const [residenceStatus, setResidenceStatus] =
    useState<ResidenceStatus>('Owned');
  const [openDropdown, setOpenDropdown] = useState<
    'motherTongue' | 'languages' | 'marital' | 'community' | 'residence' | null
  >(null);

  const toggleLanguage = (language: OtherLanguage) => {
    setOtherLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(item => item !== language);
      }
      if (prev.length >= MAX_OTHER_LANGUAGES) {
        Toast.show(Strings.maxLanguagesHint);
        return prev;
      }
      return [...prev, language];
    });
  };

  const removeLanguage = (language: OtherLanguage) => {
    setOtherLanguages(prev => prev.filter(item => item !== language));
  };

  const handleSave = () => {
    Toast.show('Profile saved successfully');
    navigation.goBack();
  };

  const renderSectionHeader = (icon: string, title: string) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={fs(16)} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderFieldLabel = (label: string) => (
    <Text style={styles.fieldLabel}>{label}</Text>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton variant="pink" compact onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{Strings.editProfileTitle}</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveText}>{Strings.save}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.photoSection}>
            <View style={styles.photoWrap}>
              <Image
                source={Images.femaleProfile}
                style={styles.profilePhoto}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.85}>
                <Icon name="camera" size={fs(14)} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.85}>
              <Text style={styles.changePhotoText}>{Strings.changePhoto}</Text>
            </TouchableOpacity>
          </View>

          {renderSectionHeader('account-outline', Strings.personalInfoSection)}

          {renderFieldLabel(Strings.fullNameLabel)}
          <View style={styles.inputRow}>
            <Icon
              name="account-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          {renderFieldLabel(Strings.dateOfBirthLabel)}
          <View style={styles.inputRow}>
            <Icon
              name="calendar-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.inputIcon}
            />
            <Text style={styles.inputText}>{dateOfBirth}</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>Age: 25</Text>
            </View>
          </View>

          {renderFieldLabel(Strings.genderLabel)}
          <View style={styles.genderRow}>
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

          <View style={styles.aboutHeader}>
            {renderFieldLabel(Strings.aboutMe)}
            <Text style={styles.charCount}>
              {aboutMe.length}/{ABOUT_MAX_LENGTH}
            </Text>
          </View>
          <View style={styles.aboutRow}>
            <Icon
              name="file-document-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.aboutIcon}
            />
            <TextInput
              style={styles.aboutInput}
              value={aboutMe}
              onChangeText={text =>
                setAboutMe(text.slice(0, ABOUT_MAX_LENGTH))
              }
              placeholder={Strings.aboutMePlaceholder}
              placeholderTextColor={Colors.placeholder}
              multiline
              textAlignVertical="top"
            />
          </View>

          {renderSectionHeader('email-outline', Strings.contactInfoSection)}

          {renderFieldLabel(Strings.emailLabel)}
          <View style={[styles.inputRow, styles.inputRowMuted]}>
            <Icon
              name="email-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.inputIcon}
            />
            <Text style={styles.inputText}>{email}</Text>
          </View>

          {renderFieldLabel(Strings.phoneNumberLabel)}
          <View style={styles.inputRow}>
            <Icon
              name="phone-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          {renderFieldLabel(Strings.locationLabel)}
          <View style={styles.inputRow}>
            <Icon
              name="map-marker-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          {renderSectionHeader('heart-outline', Strings.lifestyleSection)}

          {renderFieldLabel(Strings.heightLabel)}
          <View style={styles.inputRow}>
            <Icon
              name="ruler"
              size={fs(20)}
              color={Colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholderTextColor={Colors.placeholder}
            />
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[
                  styles.unitBtn,
                  heightUnit === 'ft' && styles.unitBtnActive,
                ]}
                onPress={() => setHeightUnit('ft')}
              >
                <Text
                  style={[
                    styles.unitText,
                    heightUnit === 'ft' && styles.unitTextActive,
                  ]}
                >
                  {Strings.heightUnitFt}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitBtn,
                  heightUnit === 'in' && styles.unitBtnActive,
                ]}
                onPress={() => setHeightUnit('in')}
              >
                <Text
                  style={[
                    styles.unitText,
                    heightUnit === 'in' && styles.unitTextActive,
                  ]}
                >
                  {Strings.heightUnitIn}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <SetupDropdown
            label={Strings.motherTongueDetail}
            iconSource={Images.msgTextIcon}
            placeholder={Strings.selectMotherTonguePlaceholder}
            value={motherTongue}
            options={MOTHER_TONGUE_OPTIONS}
            isOpen={openDropdown === 'motherTongue'}
            onToggle={() =>
              setOpenDropdown(prev =>
                prev === 'motherTongue' ? null : 'motherTongue',
              )
            }
            onSelect={value => {
              setMotherTongue(value as MotherTongue);
              setOpenDropdown(null);
            }}
            style={styles.fieldSpacing}
          />

          {renderFieldLabel(Strings.otherLanguages)}
          <TouchableOpacity
            style={styles.dropdownRow}
            activeOpacity={0.85}
            onPress={() =>
              setOpenDropdown(prev =>
                prev === 'languages' ? null : 'languages',
              )
            }
          >
            <Image
              source={Images.msgTextIcon}
              style={styles.dropdownIconImage}
              resizeMode="contain"
            />
            <Text style={styles.dropdownPlaceholder}>
              {Strings.selectLanguage}
            </Text>
            <Icon
              name={openDropdown === 'languages' ? 'chevron-up' : 'chevron-down'}
              size={fs(22)}
              color={Colors.iconMuted}
            />
          </TouchableOpacity>
          {openDropdown === 'languages' ? (
            <View style={styles.dropdownMenu}>
              {OTHER_LANGUAGE_OPTIONS.map(option => {
                const isSelected = otherLanguages.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownOption,
                      isSelected && styles.dropdownOptionSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => toggleLanguage(option)}
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
          <Text style={styles.hintText}>{Strings.maxLanguagesHint}</Text>
          {otherLanguages.length > 0 ? (
            <View style={styles.languagePillRow}>
              {otherLanguages.map(language => (
                <TouchableOpacity
                  key={language}
                  style={styles.languagePill}
                  activeOpacity={0.85}
                  onPress={() => removeLanguage(language)}
                >
                  <Text style={styles.languagePillText}>{language}</Text>
                  <Icon name="close" size={fs(14)} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <SetupDropdown
            label={Strings.maritalStatusDetail}
            iconName="heart-outline"
            placeholder={Strings.maritalStatusPlaceholder}
            value={maritalStatus}
            options={EDIT_MARITAL_STATUS_OPTIONS}
            isOpen={openDropdown === 'marital'}
            onToggle={() =>
              setOpenDropdown(prev => (prev === 'marital' ? null : 'marital'))
            }
            onSelect={value => {
              setMaritalStatus(value as EditMaritalStatus);
              setOpenDropdown(null);
            }}
            style={styles.fieldSpacing}
          />

          <SetupDropdown
            label={Strings.community}
            iconSource={Images.communityIcon}
            placeholder={Strings.community}
            value={community}
            options={COMMUNITY_OPTIONS}
            isOpen={openDropdown === 'community'}
            onToggle={() =>
              setOpenDropdown(prev =>
                prev === 'community' ? null : 'community',
              )
            }
            onSelect={value => {
              setCommunity(value as Community);
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

          <View style={styles.noticeBox}>
            <Icon
              name="shield-check-outline"
              size={fs(18)}
              color={Colors.primary}
              style={styles.noticeIcon}
            />
            <Text style={styles.noticeText}>{Strings.editProfileNotice}</Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: getFooterBottomPadding(insets.bottom) },
          ]}
        >
          <PrimaryButton
            title={Strings.saveChanges}
            onPress={handleSave}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AuthStyles.horizontalPadding,
    marginBottom: hp('1%'),
  },
  headerTitle: {
    fontSize: FontSizes.h3,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  saveText: {
    fontSize: fs(14),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
    minWidth: wp('12%'),
    textAlign: 'right',
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('2%'),
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: hp('2.5%'),
  },
  photoWrap: {
    position: 'relative',
    marginBottom: hp('1%'),
  },
  profilePhoto: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('14%'),
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  cameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  changePhotoText: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginBottom: hp('1.5%'),
    marginTop: hp('0.5%'),
  },
  sectionTitle: {
    fontSize: fs(12),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontSize: FontSizes.body,
    color: Colors.label,
    marginBottom: hp('1%'),
    fontFamily: Fonts.medium,
  },
  fieldSpacing: {
    marginBottom: hp('1.2%'),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: wp('3.7%'),
    height: AuthStyles.inputHeight,
    marginBottom: hp('2%'),
  },
  inputRowMuted: {
    backgroundColor: Colors.tabActiveBg,
  },
  inputIcon: {
    marginRight: wp('2.5%'),
  },
  input: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
    paddingVertical: 0,
  },
  inputText: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
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
  genderRow: {
    flexDirection: 'row',
    gap: wp('3%'),
    marginBottom: hp('2%'),
  },
  genderBtn: {
    flex: 1,
    height: AuthStyles.inputHeight,
    borderRadius: AuthStyles.inputRadius,
    borderWidth: 1.2,
    borderColor: Colors.focusBorder,
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
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  genderTextActive: {
    color: Colors.white,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  charCount: {
    fontSize: fs(11),
    fontFamily: Fonts.medium,
    color: Colors.gold,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.tabActiveBg,
    paddingHorizontal: wp('3.7%'),
    paddingVertical: hp('1.2%'),
    marginBottom: hp('2.2%'),
    minHeight: hp('12%'),
  },
  aboutIcon: {
    marginRight: wp('2.5%'),
    marginTop: hp('0.2%'),
  },
  aboutInput: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
    minHeight: hp('10%'),
    paddingVertical: 0,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('2.5%'),
    padding: wp('0.5%'),
    marginLeft: wp('2%'),
  },
  unitBtn: {
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('2%'),
  },
  unitBtnActive: {
    backgroundColor: Colors.primary,
  },
  unitText: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  unitTextActive: {
    color: Colors.white,
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
  dropdownIconImage: {
    width: fs(20),
    height: fs(20),
    marginRight: wp('2.5%'),
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.placeholder,
  },
  dropdownMenu: {
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    marginBottom: hp('0.8%'),
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
  hintText: {
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginBottom: hp('1%'),
  },
  languagePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
    marginBottom: hp('2%'),
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    backgroundColor: Colors.tabActiveBg,
    borderWidth: 1,
    borderColor: Colors.focusBorder,
    borderRadius: wp('4%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
  },
  languagePillText: {
    fontSize: fs(12),
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: AuthStyles.inputRadius,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  noticeIcon: {
    marginRight: wp('2.5%'),
    marginTop: hp('0.2%'),
  },
  noticeText: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.primary,
    lineHeight: hp('2.2%'),
  },
  footer: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
});

export default EditProfileScreen;
