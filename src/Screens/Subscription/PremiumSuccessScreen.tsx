import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Images } from '../../Assets';
import PrimaryButton from '../../Components/PrimaryButton';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { useHideTabBar } from '../../Functions/useHideTabBar';
import { fs, hp, wp } from '../../Functions/responsive';

type RouteProps = RouteProp<ProfileStackParamList, 'PremiumSuccess'>;
type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'PremiumSuccess'
>;

type SuccessPerk = {
  label: string;
  icon?: string;
  iconSource?: ImageSourcePropType;
};

const SUCCESS_PERKS: SuccessPerk[] = [
  { icon: 'chat-outline', label: 'Unlimited Chats' },
  { iconSource: Images.profileBoostIcon, label: 'Profile Boost' },
  { icon: 'star-outline', label: 'Super Likes' },
  { icon: 'shield-check-outline', label: 'See Likes' },
];

const PremiumSuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { plan, priceLabel } = route.params;
  useHideTabBar();

  const nextBilling = '22 July 2026';
  const planLabel = plan === 'VIP' ? Strings.vipPlan : Strings.vvipPlan;

  const renderPerkIcon = (perk: SuccessPerk) => {
    if (perk.iconSource) {
      return (
        <Image
          source={perk.iconSource}
          style={styles.perkCustomIcon}
          resizeMode="contain"
        />
      );
    }

    return <Icon name={perk.icon!} size={fs(22)} color={Colors.primary} />;
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.crownOuter}
          >
            <View style={styles.crownInner}>
              <Icon name="crown" size={fs(44)} color={Colors.gold} />
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.title}>{Strings.yourePremiumNow}</Text>
        <Text style={styles.subtitle}>{Strings.premiumWelcomeMessage}</Text>

        <View style={styles.detailsCard}>
          <View style={styles.activePill}>
            <Icon name="check-circle" size={fs(14)} color="#2E7D32" />
            <Text style={styles.activeText}>{Strings.subscriptionActive}</Text>
          </View>

          <View style={styles.planRow}>
            <Text style={styles.planText}>{planLabel}</Text>
            <Text style={styles.planPrice}>
              {priceLabel}
              {Strings.perMonth}
            </Text>
          </View>

          <Text style={styles.billingText}>
            {Strings.nextBillingDate.replace('{date}', nextBilling)}
          </Text>
        </View>

        <View style={styles.perksGrid}>
          {SUCCESS_PERKS.map(perk => (
            <View key={perk.label} style={styles.perkCard}>
              <View style={styles.perkIconWrap}>{renderPerkIcon(perk)}</View>
              <Text style={styles.perkLabel}>{perk.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.perksGridTitle}>
          Your profile is now boosted for 24 hours
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: getFooterBottomPadding(insets.bottom) },
        ]}
      >
        <PrimaryButton
          title={Strings.startExploringMatches}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Settings' }],
            })
          }
          showArrow
        />
        <TouchableOpacity
          style={styles.manageLinkWrap}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ManageSubscription')}
        >
          <Text style={styles.manageLink}>{Strings.manageSubscription}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('2.5%'),
    paddingBottom: hp('2%'),
    alignItems: 'center',
  },
  heroWrap: {
    marginBottom: hp('2%'),
  },
  crownOuter: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: hp('0.8%') },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  crownInner: {
    width: wp('24%'),
    height: wp('24%'),
    borderRadius: wp('12%'),
    borderWidth: 2,
    borderColor: 'rgba(212, 160, 23, 0.45)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.h2,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: hp('0.8%'),
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: hp('2.4%'),
    marginBottom: hp('2.5%'),
    paddingHorizontal: wp('2%'),
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('4.5%'),
    borderWidth: 1,
    borderColor: Colors.focusBorder,
    padding: wp('4.5%'),
    marginBottom: hp('2.2%'),
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: wp('1.5%'),
    backgroundColor: '#E8F5E9',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1.2%'),
  },
  activeText: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: '#2E7D32',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('0.5%'),
  },
  planText: {
    fontSize: fs(16),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  planPrice: {
    fontSize: fs(16),
    fontFamily: Fonts.bold,
    color: Colors.gold,
  },
  billingText: {
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  perksGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  perkCard: {
    width: '48%',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('3.5%'),
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('3%'),
    alignItems: 'center',
    marginBottom: hp('1.2%'),
  },
  perkIconWrap: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('0.8%'),
  },
  perksGridTitle: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
    textAlign: 'center',
    marginTop: hp('1.2%'),
  },
  perkCustomIcon: {
    width: wp('7%'),
    height: wp('7%'),
  },
  perkLabel: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1.2%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  manageLinkWrap: {
    alignItems: 'center',
    marginTop: hp('1.2%'),
  },
  manageLink: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
});

export default PremiumSuccessScreen;
