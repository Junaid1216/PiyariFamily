import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-simple-toast';
import { AxiosError } from 'axios';
import { Images } from '../../Assets';
import ScreenHeader from '../../Components/ScreenHeader';
import PrimaryButton from '../../Components/PrimaryButton';
import SetupDropdown from '../../Components/SetupDropdown';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import {
  COMMUNITY_OPTIONS,
  EDIT_MARITAL_STATUS_OPTIONS,
  HEIGHT_FEET_OPTIONS,
  HEIGHT_INCHES_OPTIONS,
  MAX_OTHER_LANGUAGES,
  MOTHER_TONGUE_OPTIONS,
  OTHER_LANGUAGE_OPTIONS,
  OtherLanguage,
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_PICKER_MAX_SIZE,
  PROFILE_PHOTO_PICKER_QUALITY,
  RESIDENCE_STATUS_OPTIONS,
} from '../../Constant/ProfileSetup';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { Api, ENDPOINTS, getApiErrorMessage, mapFormToProfilePayload, mapProfileToForm, resolveProfileData, saveProfileCache, type ApiErrorResponse } from '../../API';
import { normalizeUploadFile, type UploadFile } from '../../API/formData';
import type { EditProfileFormData } from '../../API';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { fs, hp, wp } from '../../Functions/responsive';
import {
  selectProfilePhoto,
  setProfile,
  store,
  useAppDispatch,
  useAppSelector,
} from '../../Redux';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;


const ABOUT_MAX_LENGTH = 300;

const EMPTY_FORM: EditProfileFormData = {
  fullName: '',
  birthday: '',
  dateOfBirth: '',
  gender: 'female',
  aboutMe: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  heightFeet: '',
  heightInches: '',
  motherTongue: '',
  otherLanguages: [],
  maritalStatus: '',
  community: '',
  residenceStatus: '',
  age: null,
  profilePhoto: null,
};

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const cachedPhoto = useAppSelector(selectProfilePhoto);

  useFocusEffect(
    useCallback(() => {
      console.log('Redux EditProfile:', store.getState());
    }, []),
  );

  const [form, setForm] = useState<EditProfileFormData>(EMPTY_FORM);
  const [openDropdown, setOpenDropdown] = useState<
    | 'feet'
    | 'inches'
    | 'motherTongue'
    | 'languages'
    | 'marital'
    | 'community'
    | 'residence'
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPhoto, setNewPhoto] = useState<UploadFile | null>(null);

  const updateForm = <K extends keyof EditProfileFormData>(
    key: K,
    value: EditProfileFormData[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    const cachedProfile = cachedPhoto;
    if (cachedProfile) {
      setForm(prev => ({
        ...prev,
        profilePhoto: cachedProfile,
      }));
    }

    try {
      console.log('Profile Request:', ENDPOINTS.PROFILE);
      const res = await Api.getProfile();

      if (res?.status == 200) {
        console.log('Profile Success:', res?.data);
        const rawProfile = resolveProfileData(res?.data);
        dispatch(setProfile(rawProfile));
        console.log('Redux EditProfile (after fetch):', store.getState());
        setForm(mapProfileToForm(rawProfile));
      } else {
        console.log('Profile Failed:', res?.data);
        Toast.show(res?.data?.message || 'Failed to load profile', Toast.LONG);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Profile Error:', axiosError?.response?.data || error);
      Toast.show(getApiErrorMessage(axiosError, 'Failed to load profile'), Toast.LONG);
    } finally {
      setLoading(false);
    }
  }, [cachedPhoto, dispatch]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleLanguage = (language: OtherLanguage) => {
    setForm(prev => {
      if (prev.otherLanguages.includes(language)) {
        return {
          ...prev,
          otherLanguages: prev.otherLanguages.filter(item => item !== language),
        };
      }

      if (prev.otherLanguages.length >= MAX_OTHER_LANGUAGES) {
        Toast.show(Strings.maxLanguagesHint);
        return prev;
      }

      return {
        ...prev,
        otherLanguages: [...prev.otherLanguages, language],
      };
    });
  };

  const removeLanguage = (language: OtherLanguage) => {
    setForm(prev => ({
      ...prev,
      otherLanguages: prev.otherLanguages.filter(item => item !== language),
    }));
  };

  const handlePickPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        maxWidth: PROFILE_PHOTO_PICKER_MAX_SIZE,
        maxHeight: PROFILE_PHOTO_PICKER_MAX_SIZE,
        quality: PROFILE_PHOTO_PICKER_QUALITY,
      },
      response => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          return;
        }

        if (
          asset.type &&
          !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
            asset.type.toLowerCase(),
          )
        ) {
          Toast.show('Please select JPEG, PNG, or WEBP image', Toast.LONG);
          return;
        }

        if (asset.fileSize && asset.fileSize > PROFILE_PHOTO_MAX_BYTES) {
          Toast.show(Strings.photoTooLarge, Toast.LONG);
          return;
        }

        setNewPhoto(
          normalizeUploadFile(asset.uri, asset.fileName ?? 'avatar.png', asset.type),
        );
      },
    );
  };

  const handleSave = async () => {
    if (saving || loading) {
      return;
    } else if (!form.fullName.trim()) {
      Toast.show('Please enter your name');
    } else {
      setSaving(true);

      try {
        console.log('Update Profile Request:', ENDPOINTS.PROFILE_UPDATE);
        const res = await Api.updateProfile(
          mapFormToProfilePayload(form),
          newPhoto,
        );

        if (res?.status == 200) {
          console.log('Update Profile Success:', res);
          const photoUri = newPhoto?.uri ?? form.profilePhoto;
          const savedProfile = saveProfileCache({
            ...(typeof res?.data === 'object' && res?.data ? res.data : res),
            profile_photo: photoUri,
            image: photoUri,
          });
          dispatch(setProfile(savedProfile));
          console.log('Redux EditProfile (after save):', store.getState());
          Toast.show(res?.message ?? Strings.profileSaved, Toast.LONG);
          navigation.goBack();
        } else {
          console.log('Update Profile Failed:', res);
          Toast.show(res?.message ?? 'Failed to save profile', Toast.LONG);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        console.log('Update Profile Error:', axiosError?.response?.data || error);
        Toast.show(getApiErrorMessage(axiosError, 'Failed to save profile'), Toast.LONG);
      } finally {
        setSaving(false);
      }
    }
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
      <ScreenHeader
        title={Strings.editProfileTitle}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving || loading}
          >
            <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
              {Strings.save}
            </Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
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
                source={
                  newPhoto?.uri || form.profilePhoto
                    ? { uri: newPhoto?.uri ?? form.profilePhoto ?? undefined }
                    : Images.femaleProfile
                }
                style={styles.profilePhoto}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.cameraBtn}
                activeOpacity={0.85}
                onPress={handlePickPhoto}
              >
                <Icon name="camera" size={fs(14)} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={handlePickPhoto}>
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
              value={form.fullName}
              onChangeText={value => updateForm('fullName', value)}
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
            <Text style={styles.inputText}>{form.dateOfBirth || '-'}</Text>
            {form.age != null ? (
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>Age: {form.age}</Text>
              </View>
            ) : null}
          </View>

          {renderFieldLabel(Strings.genderLabel)}
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                form.gender === 'male' && styles.genderBtnActive,
              ]}
              activeOpacity={0.85}
              onPress={() => updateForm('gender', 'male')}
            >
              <Text
                style={[
                  styles.genderText,
                  form.gender === 'male' && styles.genderTextActive,
                ]}
              >
                {Strings.genderMale}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                form.gender === 'female' && styles.genderBtnActive,
              ]}
              activeOpacity={0.85}
              onPress={() => updateForm('gender', 'female')}
            >
              <Text
                style={[
                  styles.genderText,
                  form.gender === 'female' && styles.genderTextActive,
                ]}
              >
                {Strings.genderFemale}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutHeader}>
            {renderFieldLabel(Strings.aboutMe)}
            <Text style={styles.charCount}>
              {form.aboutMe.length}/{ABOUT_MAX_LENGTH}
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
              value={form.aboutMe}
              onChangeText={value =>
                updateForm('aboutMe', value.slice(0, ABOUT_MAX_LENGTH))
              }
              placeholder={Strings.aboutMePlaceholder}
              placeholderTextColor={Colors.placeholder}
              multiline
              textAlignVertical="top"
            />
          </View>

          {renderSectionHeader('email-outline', Strings.contactInfoSection)}

          {renderFieldLabel(Strings.emailLabel)}
          <View style={styles.inputRow}>
            <Icon
              name="email-outline"
              size={fs(20)}
              color={Colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={value => updateForm('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={Colors.placeholder}
            />
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
              value={form.phone}
              onChangeText={value => updateForm('phone', value)}
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
              value={form.city}
              onChangeText={value => updateForm('city', value)}
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          {renderSectionHeader('heart-outline', Strings.lifestyleSection)}

          {renderFieldLabel(Strings.heightLabel)}
          <View style={styles.heightRow}>
            <SetupDropdown
              iconText="'"
              placeholder={Strings.selectFeetPlaceholder}
              value={form.heightFeet ? `${form.heightFeet} ft` : ''}
              options={HEIGHT_FEET_OPTIONS.map(option => `${option} ft`)}
              isOpen={openDropdown === 'feet'}
              onToggle={() =>
                setOpenDropdown(prev => (prev === 'feet' ? null : 'feet'))
              }
              onSelect={value => {
                updateForm('heightFeet', value.replace(' ft', ''));
                setOpenDropdown(null);
              }}
              style={styles.heightDropdown}
            />
            <SetupDropdown
              iconSource={Images.inchesIcon}
              iconImageSize={fs(11)}
              placeholder={Strings.selectInchesPlaceholder}
              value={form.heightInches ? `${form.heightInches} in` : ''}
              options={HEIGHT_INCHES_OPTIONS.map(option => `${option} in`)}
              isOpen={openDropdown === 'inches'}
              onToggle={() =>
                setOpenDropdown(prev => (prev === 'inches' ? null : 'inches'))
              }
              onSelect={value => {
                updateForm('heightInches', value.replace(' in', ''));
                setOpenDropdown(null);
              }}
              style={styles.heightDropdown}
            />
          </View>

          <SetupDropdown
            label={Strings.motherTongueDetail}
            iconSource={Images.msgTextIcon}
            placeholder={Strings.selectMotherTonguePlaceholder}
            value={form.motherTongue}
            options={MOTHER_TONGUE_OPTIONS}
            isOpen={openDropdown === 'motherTongue'}
            onToggle={() =>
              setOpenDropdown(prev =>
                prev === 'motherTongue' ? null : 'motherTongue',
              )
            }
            onSelect={value => {
              updateForm('motherTongue', value);
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
              name={
                openDropdown === 'languages' ? 'chevron-up' : 'chevron-down'
              }
              size={fs(22)}
              color={Colors.iconMuted}
            />
          </TouchableOpacity>
          {openDropdown === 'languages' ? (
            <View style={styles.dropdownMenu}>
              {OTHER_LANGUAGE_OPTIONS.map(option => {
                const isSelected = form.otherLanguages.includes(option);
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
          {form.otherLanguages.length > 0 ? (
            <View style={styles.languagePillRow}>
              {form.otherLanguages.map(language => (
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
            value={form.maritalStatus}
            options={EDIT_MARITAL_STATUS_OPTIONS}
            isOpen={openDropdown === 'marital'}
            onToggle={() =>
              setOpenDropdown(prev => (prev === 'marital' ? null : 'marital'))
            }
            onSelect={value => {
              updateForm('maritalStatus', value);
              setOpenDropdown(null);
            }}
            style={styles.fieldSpacing}
          />

          <SetupDropdown
            label={Strings.community}
            iconSource={Images.communityIcon}
            placeholder={Strings.community}
            value={form.community}
            options={COMMUNITY_OPTIONS}
            isOpen={openDropdown === 'community'}
            onToggle={() =>
              setOpenDropdown(prev =>
                prev === 'community' ? null : 'community',
              )
            }
            onSelect={value => {
              updateForm('community', value);
              setOpenDropdown(null);
            }}
            style={styles.fieldSpacing}
          />

          <SetupDropdown
            label={Strings.residentialStatusLabel}
            iconName="home-outline"
            placeholder={Strings.residenceStatusPlaceholder}
            value={form.residenceStatus}
            options={RESIDENCE_STATUS_OPTIONS}
            isOpen={openDropdown === 'residence'}
            onToggle={() =>
              setOpenDropdown(prev =>
                prev === 'residence' ? null : 'residence',
              )
            }
            onSelect={value => {
              updateForm('residenceStatus', value);
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
            loading={saving}
            showArrow
          />
        </View>
      </KeyboardAvoidingView>
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: fs(14),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
    minWidth: wp('12%'),
    textAlign: 'right',
  },
  saveTextDisabled: {
    opacity: 0.45,
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
    gap: wp('2%'),
    marginBottom: hp('1.2%'),
  },
  genderBtn: {
    flex: 1,
    height: hp('5%'),
    borderRadius: AuthStyles.inputRadius,
    borderWidth: 1.2,
    borderColor: Colors.focusBorder,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('1%'),
  },
  genderBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: fs(13),
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
  heightRow: {
    flexDirection: 'row',
    gap: wp('2.5%'),
    marginBottom: hp('2%'),
  },
  heightDropdown: {
    flex: 1,
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
