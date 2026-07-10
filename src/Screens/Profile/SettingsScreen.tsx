import React, { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import { AxiosError } from 'axios';
import { Images } from '../../Assets';
import ScreenHeader from '../../Components/ScreenHeader';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { Api, ENDPOINTS, authService, getApiErrorMessage, mapProfileToSettings, resolveProfileData, type ApiErrorResponse } from '../../API';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Settings'
>;

type SettingItemProps = {
  icon: string;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  danger?: boolean;
};

const SettingItem = ({
  icon,
  iconBg = Colors.tabActiveBg,
  iconColor = Colors.primary,
  title,
  subtitle,
  onPress,
  danger = false,
}: SettingItemProps) => (
  <TouchableOpacity
    style={styles.settingItem}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <View style={[styles.settingIconWrap, { backgroundColor: iconBg }]}>
      <Icon name={icon} size={fs(20)} color={iconColor} />
    </View>
    <View style={styles.settingTextWrap}>
      <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
        {title}
      </Text>
      <Text style={styles.settingSubtitle}>{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={fs(22)} color={Colors.primary} />
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profileName, setProfileName] = useState('');
  const [profileMeta, setProfileMeta] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePictureVisible, setProfilePictureVisible] = useState(true);
  const [additionalPhotosVisible, setAdditionalPhotosVisible] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      console.log('Profile Request:', ENDPOINTS.PROFILE);
      const res = await Api.getProfile();

      if (res?.status == 200) {
        console.log('Profile Success:', res?.data);
        const rawProfile = resolveProfileData(res?.data);
        const profile = mapProfileToSettings(rawProfile);
        setProfileName(profile.name);
        setProfileMeta(profile.meta);
        setIsVerified(profile.isVerified);
        setProfilePhoto(profile.profilePhoto);
        setProfilePictureVisible(profile.profilePictureVisible);
        setAdditionalPhotosVisible(profile.additionalPhotosVisible);
      } else {
        console.log('Profile Failed:', res?.data);
      }
    } catch (error: any) {
      console.log('Profile Error:', error?.response?.data || error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      console.log('Logout Request:', ENDPOINTS.AUTH.LOGOUT);
      const res = await authService.logout();

      if (res?.status == 200) {
        console.log('Logout Success:', res);
        Toast.show(res?.message ?? 'Logged out successfully', Toast.LONG);
        navigation.getParent()?.getParent()?.getParent()?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          }),
        );
      } else {
        console.log('Logout Failed:', res);
        Toast.show(res?.message ?? 'Failed to log out', Toast.LONG);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Logout Error:', axiosError?.response?.data || error);
      Toast.show(getApiErrorMessage(axiosError, 'Failed to log out'), Toast.LONG);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={Strings.settings}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <Image
            source={
              profilePhoto ? { uri: profilePhoto } : Images.femaleProfile
            }
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileName || '-'}</Text>
            <Text style={styles.profileMeta}>{profileMeta || '-'}</Text>
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <Icon name="shield-check" size={fs(11)} color={Colors.gold} />
                <Text style={styles.verifiedText}>{Strings.verifiedLabel}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileLink}>
              {Strings.editProfile} →
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.referCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ReferralProgram')}
        >
          <View style={styles.referIconWrap}>
            <View style={styles.referIconBox}>
              <Icon name="gift-outline" size={fs(22)} color={Colors.white} />
            </View>
            <View style={styles.coinBadge}>
              <Icon name="circle" size={fs(10)} color={Colors.gold} />
            </View>
          </View>
          <View style={styles.referTextWrap}>
            <View style={styles.referTitleRow}>
              <Text style={styles.referTitle}>{Strings.referAndEarn}</Text>
              <View style={styles.rewardsBadge}>
                <Text style={styles.rewardsText}>{Strings.rewards}</Text>
              </View>
            </View>
            <Text style={styles.referSubtitle}>{Strings.referSubtitle}</Text>
          </View>
          <View style={styles.referArrowWrap}>
            <Icon name="chevron-right" size={fs(18)} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>
          {Strings.profilePhotosVisibility}
        </Text>
        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{Strings.profilePicture}</Text>
            <Switch
              value={profilePictureVisible}
              onValueChange={setProfilePictureVisible}
              trackColor={{
                false: Colors.divider,
                true: Colors.focusBorder,
              }}
              thumbColor={
                profilePictureVisible ? Colors.primary : Colors.white
              }
            />
          </View>
          <View style={styles.toggleDivider} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{Strings.additionalPhotos}</Text>
            <Switch
              value={additionalPhotosVisible}
              onValueChange={setAdditionalPhotosVisible}
              trackColor={{
                false: Colors.divider,
                true: Colors.focusBorder,
              }}
              thumbColor={
                additionalPhotosVisible ? Colors.primary : Colors.white
              }
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{Strings.accountSection}</Text>
        <View style={styles.settingGroup}>
          <SettingItem
            icon="account-outline"
            title={Strings.editProfile}
            subtitle={Strings.updatePersonalDetails}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <View style={styles.itemDivider} />
          <SettingItem
            icon="shield-check-outline"
            title={Strings.verifyYourProfile}
            subtitle={Strings.verifyProfileSubtitle}
            onPress={() => navigation.navigate('VerifyProfile')}
          />
        </View>

        <Text style={styles.sectionLabel}>{Strings.securitySection}</Text>
        <View style={styles.settingGroup}>
          <SettingItem
            icon="lock-outline"
            title={Strings.changePassword}
            subtitle={Strings.updateLoginPassword}
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        <Text style={styles.sectionLabel}>{Strings.subscriptionSection}</Text>
        <View style={styles.settingGroup}>
          <SettingItem
            icon="crown-outline"
            iconBg="#FFF8E7"
            iconColor={Colors.gold}
            title={Strings.myPlan}
            subtitle={Strings.vipPlanActive}
            onPress={() => navigation.navigate('ManageSubscription')}
          />
          <View style={styles.itemDivider} />
          <SettingItem
            icon="star-outline"
            iconBg={Colors.tabActiveBg}
            iconColor={Colors.gold}
            title={Strings.chooseYourPlan}
            subtitle={Strings.premiumBannerSubtitle}
            onPress={() => navigation.navigate('ChooseYourPlan')}
          />
        </View>

        <Text style={styles.sectionLabel}>{Strings.supportSection}</Text>
        <View style={styles.settingGroup}>
          <SettingItem
            icon="help-circle-outline"
            title={Strings.helpCenter}
            subtitle={Strings.helpCenterSubtitle}
          />
          <View style={styles.itemDivider} />
          <SettingItem
            icon="message-text-outline"
            title={Strings.contactSupport}
            subtitle={Strings.contactSupportSubtitle}
          />
          <View style={styles.itemDivider} />
          <SettingItem
            icon="file-document-outline"
            title={Strings.termsAndConditions}
            subtitle={Strings.termsSubtitle}
          />
          <View style={styles.itemDivider} />
          <SettingItem
            icon="star-outline"
            title={Strings.rateTheApp}
            subtitle={Strings.rateAppSubtitle}
          />
        </View>

        <Text style={styles.sectionLabel}>{Strings.dangerZone}</Text>
        <View style={styles.settingGroup}>
          <SettingItem
            icon="logout"
            title={Strings.logOut}
            subtitle={loggingOut ? 'Logging out...' : Strings.logOutSubtitle}
            danger
            onPress={handleLogout}
          />
          <View style={styles.itemDivider} />
          <SettingItem
            icon="alert-outline"
            title={Strings.deactivateAccount}
            subtitle={Strings.deactivateSubtitle}
            danger
            onPress={() => navigation.navigate('AccountOptions')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('3%'),
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('4.5%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
  },
  profileImage: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: wp('3.5%'),
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fs(16),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.2%'),
  },
  profileMeta: {
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginBottom: hp('0.5%'),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: wp('1%'),
    backgroundColor: '#FFF8E7',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.25%'),
    borderRadius: wp('2.5%'),
  },
  verifiedText: {
    fontSize: fs(10),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  editProfileLink: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  referCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: wp('3.5%'),
    marginBottom: hp('2.5%'),
  },
  referIconWrap: {
    position: 'relative',
    marginRight: wp('3%'),
  },
  referIconBox: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('3%'),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinBadge: {
    position: 'absolute',
    top: -hp('0.4%'),
    right: -wp('1%'),
    width: wp('4.5%'),
    height: wp('4.5%'),
    borderRadius: wp('2.25%'),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldLight,
  },
  referTextWrap: {
    flex: 1,
  },
  referTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: wp('2%'),
    marginBottom: hp('0.3%'),
  },
  referTitle: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  rewardsBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.2%'),
    borderRadius: wp('2%'),
  },
  rewardsText: {
    fontSize: fs(9),
    fontFamily: Fonts.bold,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  referSubtitle: {
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  referArrowWrap: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: Colors.tabActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.textLight,
    letterSpacing: 0.6,
    marginBottom: hp('1%'),
  },
  toggleCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: hp('2.2%'),
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.4%'),
  },
  toggleLabel: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: wp('4%'),
  },
  settingGroup: {
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: hp('2.2%'),
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1.4%'),
  },
  settingIconWrap: {
    width: wp('10.5%'),
    height: wp('10.5%'),
    borderRadius: wp('2.8%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  settingTextWrap: {
    flex: 1,
    marginRight: wp('2%'),
  },
  settingTitle: {
    fontSize: fs(14),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
    marginBottom: hp('0.2%'),
  },
  settingTitleDanger: {
    color: Colors.primary,
  },
  settingSubtitle: {
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    lineHeight: hp('1.8%'),
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: wp('17%'),
  },
});

export default SettingsScreen;
