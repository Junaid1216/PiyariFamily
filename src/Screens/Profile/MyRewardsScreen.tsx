import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import { AxiosError } from 'axios';
import ScreenHeader from '../../Components/ScreenHeader';
import {
  Api,
  ENDPOINTS,
  getApiErrorMessage,
  mapReferralHistory,
  mapReferralStats,
  type ApiErrorResponse,
  type ReferralHistoryItem,
  type ReferralStats,
} from '../../API';
import { REDEEM_OPTIONS, REFERRAL_LINK } from '../../Constant/Referrals';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'MyRewards'
>;

const DEFAULT_STATS: ReferralStats = {
  referralCode: '',
  referralLink: REFERRAL_LINK,
  registered: 0,
  pointsEarned: 0,
  rewardsTable: [],
};

const MyRewardsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [stats, setStats] = useState<ReferralStats>(DEFAULT_STATS);
  const [referralHistory, setReferralHistory] = useState<ReferralHistoryItem[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchReferralStats = useCallback(async () => {
    try {
      console.log('Referral Stats Request:', ENDPOINTS.REFERRALS_STATS);
      const res = await Api.getReferralStats();

      if (res?.status == 200) {
        console.log('Referral Stats Success:', res?.data);
        setStats(mapReferralStats(res?.data));
      } else {
        console.log('Referral Stats Failed:', res?.data);
        setStats(DEFAULT_STATS);
        Toast.show(
          res?.data?.message ?? 'Failed to load referral stats',
          Toast.LONG,
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Referral Stats Error:', axiosError?.response?.data || error);
      setStats(DEFAULT_STATS);
      Toast.show(
        getApiErrorMessage(error, 'Failed to load referral stats'),
        Toast.LONG,
      );
    }
  }, []);

  const fetchReferralHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      console.log('Referral History Request:', ENDPOINTS.REFERRALS_HISTORY);
      const res = await Api.getReferralHistory();

      if (res?.status == 200) {
        console.log('Referral History Success:', res?.data);
        setReferralHistory(mapReferralHistory(res?.data));
      } else {
        console.log('Referral History Failed:', res?.data);
        setReferralHistory([]);
        Toast.show(
          res?.data?.message ?? 'Failed to load referral history',
          Toast.LONG,
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Referral History Error:', axiosError?.response?.data || error);
      setReferralHistory([]);
      Toast.show(
        getApiErrorMessage(error, 'Failed to load referral history'),
        Toast.LONG,
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReferralStats();
      fetchReferralHistory();
    }, [fetchReferralStats, fetchReferralHistory]),
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#FFE5EC', '#FFF8FA', Colors.background]}
        style={styles.topGlow}
      />

      <ScreenHeader
        title={Strings.myRewards}
        onBack={() => navigation.goBack()}
        style={styles.screenHeader}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.heroCard}
        >
          <Icon name="crown" size={fs(26)} color={Colors.gold} />
          <Text style={styles.heroLabel}>{Strings.totalPoints}</Text>
          <Text style={styles.heroPoints}>{stats.pointsEarned} pts</Text>
        </LinearGradient>

        <Text style={styles.sectionLabel}>{Strings.rewardsBreakdown}</Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownCard}>
            <Icon name="account-outline" size={fs(18)} color={Colors.primary} />
            <Text style={styles.breakdownValue}>{stats.registered}</Text>
            <Text style={styles.breakdownLabel}>{Strings.registrations}</Text>
          </View>
          <View style={styles.breakdownCard}>
            <Icon name="star-outline" size={fs(18)} color={Colors.primary} />
            <Text style={styles.breakdownValue}>{stats.pointsEarned}</Text>
            <Text style={styles.breakdownLabel}>{Strings.points}</Text>
          </View>
          <View style={styles.breakdownCard}>
            <Icon name="gift-outline" size={fs(18)} color={Colors.primary} />
            <Text style={styles.breakdownValue}>0</Text>
            <Text style={styles.breakdownLabel}>{Strings.redeemed}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{Strings.howToRedeem}</Text>
        {REDEEM_OPTIONS.map(option => (
          <View key={option.id} style={styles.redeemCard}>
            <View style={styles.redeemIconWrap}>
              <Icon name={option.icon} size={fs(18)} color={Colors.primary} />
            </View>
            <View style={styles.redeemTextWrap}>
              <Text style={styles.redeemTitle}>{option.title}</Text>
              <Text style={styles.redeemPoints}>{option.pointsRequired}</Text>
            </View>
            <TouchableOpacity
              style={styles.redeemBtn}
              activeOpacity={0.88}
              onPress={() => Toast.show(Strings.rewardRedeemed)}
            >
              <Text style={styles.redeemBtnText}>{Strings.redeem}</Text>
              <Icon name="arrow-right" size={fs(14)} color={Colors.gold} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.historyHeader}>
          <Text style={styles.sectionLabelInline}>
            {Strings.referralHistory}
          </Text>
        </View>

        {historyLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : referralHistory.length > 0 ? (
          referralHistory.map(item => (
            <View key={item.id} style={styles.historyRow}>
              <Image source={item.image} style={styles.historyAvatar} />
              <View style={styles.historyTextWrap}>
                <Text style={styles.historyName}>{item.name}</Text>
                <Text style={styles.historySubtext}>
                  {Strings.registeredViaLink}
                </Text>
              </View>
              <View style={styles.historyRight}>
                {item.isRegistered ? (
                  <View style={styles.registeredBadge}>
                    <Icon name="check" size={fs(10)} color="#22C55E" />
                    <Text style={styles.registeredBadgeText}>
                      {Strings.registeredBadge}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.historyPoints}>{item.points}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No referral history found</Text>
        )}
      </ScrollView>
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
    height: hp('18%'),
  },
  screenHeader: {
    marginBottom: hp('1%'),
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('3%'),
  },
  loaderWrap: {
    minHeight: hp('12%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSizes.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: hp('2%'),
  },
  heroCard: {
    borderRadius: wp('4.5%'),
    paddingVertical: hp('2.2%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  heroLabel: {
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.9)',
    marginTop: hp('0.8%'),
    marginBottom: hp('0.3%'),
  },
  heroPoints: {
    fontSize: fs(30),
    fontFamily: Fonts.bold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: fs(10),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: hp('0.8%'),
  },
  sectionLabelInline: {
    fontSize: fs(10),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: wp('2%'),
    marginBottom: hp('2%'),
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F3DDE3',
    paddingVertical: hp('1.2%'),
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: fs(16),
    fontFamily: Fonts.bold,
    color: Colors.gold,
    marginTop: hp('0.4%'),
    marginBottom: hp('0.15%'),
  },
  breakdownLabel: {
    fontSize: fs(9),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
    textAlign: 'center',
  },
  redeemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: wp('3.5%'),
    marginBottom: hp('1%'),
  },
  redeemIconWrap: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('2.5%'),
    backgroundColor: Colors.tabActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('2.5%'),
  },
  redeemTextWrap: {
    flex: 1,
    marginRight: wp('2%'),
  },
  redeemTitle: {
    fontSize: fs(12),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.2%'),
  },
  redeemPoints: {
    fontSize: fs(10),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    backgroundColor: '#FFF8E7',
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.55%'),
  },
  redeemBtnText: {
    fontSize: fs(11),
    fontFamily: Fonts.bold,
    color: Colors.gold,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: wp('3%'),
    marginBottom: hp('0.8%'),
  },
  historyAvatar: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('5.5%'),
    marginRight: wp('2.5%'),
  },
  historyTextWrap: {
    flex: 1,
  },
  historyName: {
    fontSize: fs(13),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.15%'),
  },
  historySubtext: {
    fontSize: fs(10),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('0.8%'),
    backgroundColor: '#ECFDF3',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('1.8%'),
    paddingVertical: hp('0.2%'),
    marginBottom: hp('0.3%'),
  },
  registeredBadgeText: {
    fontSize: fs(9),
    fontFamily: Fonts.semiBold,
    color: '#22C55E',
  },
  historyPoints: {
    fontSize: fs(12),
    fontFamily: Fonts.bold,
    color: Colors.gold,
  },
});

export default MyRewardsScreen;
