import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import { AxiosError } from 'axios';
import ScreenHeader from '../../Components/ScreenHeader';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  Api,
  ENDPOINTS,
  getApiErrorMessage,
  mapReferralStats,
  type ApiErrorResponse,
  type ReferralStats,
} from '../../API';
import { REFERRAL_LINK, REFERRAL_REWARDS_TABLE } from '../../Constant/Referrals';
import { AuthStyles } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { fs, hp, wp } from '../../Functions/responsive';
import {
  selectReferralStats,
  setReferralStats,
  useAppDispatch,
  useAppSelector,
} from '../../Redux';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ReferralProgram'
>;

const PINK_CARD = '#FFF5F7';

const DEFAULT_STATS: ReferralStats = {
  referralCode: '',
  referralLink: REFERRAL_LINK,
  registered: 0,
  pointsEarned: 0,
  conversionRate: '',
  rewardsTable: REFERRAL_REWARDS_TABLE,
};

const ReferralProgramScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const cachedStats = useAppSelector(selectReferralStats);
  const stats = cachedStats ?? DEFAULT_STATS;
  const [loading, setLoading] = useState(!cachedStats);

  const fetchReferralStats = useCallback(async () => {
    setLoading(true);

    try {
      console.log('Referral Stats Request:', ENDPOINTS.REFERRALS_STATS);
      const res = await Api.getReferralStats();

      if (res?.status == 200) {
        console.log('Referral Stats Success:', res?.data);
        dispatch(setReferralStats(mapReferralStats(res?.data)));
      } else {
        console.log('Referral Stats Failed:', res?.data);
        dispatch(setReferralStats(DEFAULT_STATS));
        Toast.show(
          res?.data?.message ?? 'Failed to load referral stats',
          Toast.LONG,
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Referral Stats Error:', axiosError?.response?.data || error);
      dispatch(setReferralStats(DEFAULT_STATS));
      Toast.show(
        getApiErrorMessage(error, 'Failed to load referral stats'),
        Toast.LONG,
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchReferralStats();
    }, [fetchReferralStats]),
  );

  const handleCopy = () => {
    Toast.show(Strings.linkCopied);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#FFE5EC', '#FFF8FA', Colors.background]}
        style={styles.topGlow}
      />

      <ScreenHeader
        title={Strings.referralProgram}
        onBack={() => navigation.goBack()}
        compact
        style={styles.header}
      />

      <View style={styles.body}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.heroCard}
          >
            <View style={styles.crownRing}>
              <Icon name="crown" size={fs(26)} color={Colors.gold} />
            </View>

            <Text style={styles.heroTitle}>{Strings.inviteAndEarnRewards}</Text>
            <Text style={styles.heroSubtitle}>
              {Strings.inviteEarnSubtitle}
            </Text>

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {Strings.rewardsOnRegistrationOnly}
              </Text>
              <Icon name="check" size={fs(11)} color={Colors.white} />
            </View>
          </LinearGradient>

          <Text style={styles.sectionLabel}>{Strings.yourReferralCode}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>
              {stats.referralCode || '-'}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>{Strings.yourReferralLink}</Text>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>
              {stats.referralLink}
            </Text>
            <TouchableOpacity
              style={styles.linkCopyBtn}
              activeOpacity={0.85}
              onPress={handleCopy}
            >
              <Icon name="content-copy" size={fs(16)} color={Colors.gold} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.copyBtn}
              activeOpacity={0.88}
              onPress={handleCopy}
            >
              <Icon name="content-copy" size={fs(15)} color={Colors.white} />
              <Text style={styles.copyBtnText}>{Strings.copyLink}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.whatsappBtn} activeOpacity={0.88}>
              <Icon name="whatsapp" size={fs(15)} color={Colors.primary} />
              <Text style={styles.whatsappBtnText}>{Strings.whatsapp}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>{Strings.rewardsTable}</Text>
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>
                {Strings.successfulRegistrations}
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>
                {Strings.pointsEarnedLabel}
              </Text>
            </View>
            <View style={styles.tableDivider} />
            {stats.rewardsTable.map(row => (
              <View key={row.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{row.registrations}</Text>
                <Text style={styles.tableCellBold}>{row.points}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>{Strings.yourStats}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Icon
                  name="account-plus-outline"
                  size={fs(20)}
                  color={Colors.gold}
                />
              </View>
              <Text style={styles.statValue}>{stats.registered}</Text>
              <Text style={styles.statLabel}>{Strings.registered}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Icon name="star" size={fs(20)} color={Colors.gold} />
              </View>
              <Text style={styles.statValue}>
                {stats.pointsEarned} pts
              </Text>
              <Text style={styles.statLabel}>{Strings.pointsEarnedStat}</Text>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Icon name="shield-check" size={fs(16)} color={Colors.primary} />
            <Text style={styles.noteText}>{Strings.referralPointsNote}</Text>
          </View>
        </ScrollView>
        )}

        <View
          style={[
            styles.footer,
            { paddingBottom: getFooterBottomPadding(insets.bottom) },
          ]}
        >
          <PrimaryButton
            title={Strings.viewMyRewards}
            onPress={() => navigation.navigate('MyRewards')}
            showArrow
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('16%'),
  },
  header: {
    marginBottom: hp('1.2%'),
    zIndex: 1,
  },
  body: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('1.5%'),
  },
  heroCard: {
    borderRadius: wp('5%'),
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2.2%'),
    paddingBottom: hp('2%'),
    alignItems: 'center',
    marginBottom: hp('2.2%'),
  },
  crownRing: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.2%'),
  },
  heroTitle: {
    fontSize: fs(19),
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: hp('0.7%'),
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: hp('2.1%'),
    marginBottom: hp('1.5%'),
    paddingHorizontal: wp('1%'),
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: wp('5%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.55%'),
  },
  heroBadgeText: {
    fontSize: fs(10),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  sectionLabel: {
    fontSize: fs(10),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: hp('0.9%'),
  },
  codeBox: {
    backgroundColor: PINK_CARD,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F0D0D8',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    marginBottom: hp('1.2%'),
  },
  codeText: {
    fontSize: fs(18),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK_CARD,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F0D0D8',
    paddingLeft: wp('3.5%'),
    paddingRight: wp('2%'),
    paddingVertical: hp('1.1%'),
    marginBottom: hp('1.2%'),
  },
  linkText: {
    flex: 1,
    fontSize: fs(12),
    fontFamily: Fonts.medium,
    color: Colors.primary,
    marginRight: wp('2%'),
  },
  linkCopyBtn: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('2%'),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E0E4',
  },
  actionRow: {
    flexDirection: 'row',
    gap: wp('2.5%'),
    marginBottom: hp('2.2%'),
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.8%'),
    backgroundColor: Colors.primary,
    borderRadius: wp('3.2%'),
    height: hp('5.2%'),
  },
  copyBtnText: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.8%'),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: wp('3.2%'),
    height: hp('5.2%'),
  },
  whatsappBtnText: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  tableCard: {
    backgroundColor: PINK_CARD,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F3DDE3',
    overflow: 'hidden',
    marginBottom: hp('2.2%'),
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.2%'),
    paddingBottom: hp('0.9%'),
  },
  tableHeaderText: {
    flex: 1,
    fontSize: fs(11),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  tableHeaderRight: {
    textAlign: 'right',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#EDD6DC',
    marginHorizontal: wp('4%'),
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
  },
  tableCell: {
    flex: 1,
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  tableCellBold: {
    flex: 1,
    fontSize: fs(12),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: wp('2.5%'),
    marginBottom: hp('1.8%'),
  },
  statCard: {
    flex: 1,
    backgroundColor: PINK_CARD,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F3DDE3',
    paddingVertical: wp('1.6%'),
    paddingHorizontal: wp('2%'),
    alignItems: 'center',
  },
  statIconBox: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('2.5%'),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('0.7%'),
    borderWidth: 1,
    borderColor: '#F0E8EA',
  },
  statValue: {
    fontSize: fs(22),
    fontFamily: Fonts.bold,
    color: Colors.gold,
    marginBottom: hp('0.15%'),
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: fs(10),
    fontFamily: Fonts.medium,
    color: Colors.textLight,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp('2.5%'),
    backgroundColor: PINK_CARD,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F3DDE3',
    padding: wp('3.5%'),
    marginBottom: hp('0.5%'),
  },
  noteText: {
    flex: 1,
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.primary,
    lineHeight: hp('1.85%'),
    opacity: 0.85,
  },
  footer: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
});

export default ReferralProgramScreen;
