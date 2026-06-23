import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Images } from '../../Assets';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { HomeStackParamList } from '../../Navigation/HomeStackNavigator';
import { navigateToSubscription } from '../../Functions/subscriptionNavigation';
import { navigateToProfileScreen } from '../../Functions/profileNavigation';
import { fs, hp, wp } from '../../Functions/responsive';

type HomeNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'HomeMain'
>;

type MatchTag = {
  icon: string;
  label: string;
};

type FeaturedMatch = {
  id: string;
  name: string;
  age: number;
  location: string;
  image: ImageSourcePropType;
  tags: MatchTag[];
  isNew?: boolean;
  isVerified?: boolean;
};

type SuggestedMatch = {
  id: string;
  name: string;
  age: number;
  location: string;
  profession: string;
  image: ImageSourcePropType;
  tier: 'VIP' | 'VVIP';
  isVerified: boolean;
};

const FEATURED_MATCHES: FeaturedMatch[] = [
  {
    id: '1',
    name: 'Jannat',
    age: 26,
    location: 'Lahore, Pakistan',
    image: Images.femaleProfile2,
    isNew: true,
    isVerified: true,
    tags: [
      { icon: 'school-outline', label: 'MBA' },
      { icon: 'briefcase-outline', label: 'Software Engineer' },
      { icon: 'heart-outline', label: 'Muslim' },
    ],
  },
  {
    id: '2',
    name: 'Aisha',
    age: 24,
    location: 'Karachi, Pakistan',
    image: Images.femaleProfile,
    isVerified: true,
    tags: [
      { icon: 'school-outline', label: 'BBA' },
      { icon: 'briefcase-outline', label: 'Designer' },
      { icon: 'heart-outline', label: 'Muslim' },
    ],
  },
  {
    id: '3',
    name: 'Rohan',
    age: 29,
    location: 'Islamabad, Pakistan',
    image: Images.maleProfile,
    isVerified: true,
    tags: [
      { icon: 'school-outline', label: 'BS CS' },
      { icon: 'briefcase-outline', label: 'Engineer' },
      { icon: 'heart-outline', label: 'Muslim' },
    ],
  },
];

const SUGGESTED_MATCHES: SuggestedMatch[] = [
  {
    id: '1',
    name: 'Aisha',
    age: 26,
    location: 'Lahore',
    profession: 'Designer',
    image: Images.femaleProfile,
    tier: 'VIP',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Rohan',
    age: 29,
    location: 'Karachi',
    profession: 'Engineer',
    image: Images.maleProfile,
    tier: 'VVIP',
    isVerified: true,
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = wp('5.5%');
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<FlatList<FeaturedMatch>>(null);

  const goToIndex = useCallback((index: number) => {
    const nextIndex =
      ((index % FEATURED_MATCHES.length) + FEATURED_MATCHES.length) %
      FEATURED_MATCHES.length;

    sliderRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
    setActiveIndex(nextIndex);
  }, []);

  const handleDislike = () => {
    goToIndex(activeIndex + 1);
  };

  const handleLike = () => {
    goToIndex(activeIndex + 1);
  };

  const onFeaturedScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  const renderFeaturedCard = ({ item }: { item: FeaturedMatch }) => (
    <View style={[styles.featuredCard, { width: CARD_WIDTH }]}>
      <Image
        source={item.image}
        style={styles.featuredImage}
        resizeMode="cover"
      />

      <View style={styles.featuredBadges}>
        {item.isNew ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{Strings.newBadge}</Text>
          </View>
        ) : (
          <View />
        )}
        {item.isVerified ? (
          <View style={styles.verifiedBadge}>
            <Icon name="shield-check" size={fs(13)} color={Colors.redish} />
            <Text style={styles.verifiedBadgeText}>
              {Strings.verifiedBadge}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.featuredInfo}>
        <Text style={styles.featuredName}>
          {item.name} {item.age}
        </Text>
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={fs(13)} color={Colors.white} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.tagRow}>
          {item.tags.map(tag => (
            <View key={tag.label} style={styles.tagChip}>
              <Icon name={tag.icon} size={fs(11)} color={Colors.white} />
              <Text style={styles.tagText}>{tag.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerLogoWrap}>
            <Image
              source={Images.appLogo}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.headerTitle} pointerEvents="none">
            {Strings.appName}
          </Text>

          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.8}
            onPress={() => navigateToProfileScreen(navigation, 'Notifications')}
          >
            <Icon name="bell-outline" size={fs(20)} color={Colors.primary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>{Strings.homeGreeting}</Text>
        <Text style={styles.subtitle}>{Strings.homeSubtitle}</Text>

        <TouchableOpacity
          style={styles.premiumBanner}
          activeOpacity={0.88}
          onPress={() => navigateToSubscription(navigation, 'ChooseYourPlan')}
        >
          <View style={styles.premiumBannerLeft}>
            <View style={styles.premiumIconWrap}>
              <Icon name="crown" size={fs(20)} color={Colors.gold} />
            </View>
            <View>
              <Text style={styles.premiumBannerTitle}>
                {Strings.premiumBannerTitle}
              </Text>
              <Text style={styles.premiumBannerSubtitle}>
                {Strings.premiumBannerSubtitle}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={fs(22)} color={Colors.primary} />
        </TouchableOpacity>

        <FlatList
          ref={sliderRef}
          data={FEATURED_MATCHES}
          renderItem={renderFeaturedCard}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          bounces={false}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onFeaturedScrollEnd}
          onScrollToIndexFailed={info => {
            setTimeout(() => {
              sliderRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            }, 100);
          }}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH,
            offset: CARD_WIDTH * index,
            index,
          })}
          style={styles.featuredSlider}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.dislikeBtn}
            activeOpacity={0.85}
            onPress={handleDislike}
          >
            <Icon name="close" size={fs(30)} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likeBtn}
            activeOpacity={0.85}
            onPress={handleLike}
          >
            <Icon name="heart" size={fs(28)} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.pagination}>
          {FEATURED_MATCHES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex
                  ? styles.paginationDotActive
                  : styles.paginationDotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{Strings.suggestedMatches}</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.seeAll}>{Strings.seeAll} →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedList}
        >
          {SUGGESTED_MATCHES.map(match => (
            <TouchableOpacity
              key={match.id}
              style={styles.suggestedCard}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('ProfileDetail', { profileId: match.id })
              }
            >
              <View style={styles.suggestedImageWrap}>
                <Image
                  source={match.image}
                  style={styles.suggestedImage}
                  resizeMode="cover"
                />
                {match.isVerified ? (
                  <View style={styles.suggestedVerifyBadge}>
                    <Icon
                      name="shield-check"
                      size={fs(11)}
                      color={Colors.white}
                    />
                  </View>
                ) : null}
                <View style={styles.suggestedTierBadge}>
                  <Icon
                    name={match.tier === 'VIP' ? 'star' : 'crown'}
                    size={fs(10)}
                    color={Colors.white}
                  />
                  <Text style={styles.suggestedTierText}>{match.tier}</Text>
                </View>
              </View>

              <View style={styles.suggestedBody}>
                <Text style={styles.suggestedName}>
                  {match.name}, {match.age}
                </Text>
                <View style={styles.suggestedLocationRow}>
                  <Icon
                    name="map-marker-outline"
                    size={fs(11)}
                    color={Colors.textLight}
                  />
                  <Text style={styles.suggestedLocation}>{match.location}</Text>
                </View>
                <View style={styles.suggestedBottomRow}>
                  <View style={styles.professionTag}>
                    <Text style={styles.professionText}>
                      {match.profession}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.suggestedLikeBtn}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name="heart-outline"
                      size={fs(16)}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: wp('5.5%'),
    paddingTop: hp('0.5%'),
    paddingBottom: hp('1.5%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
    minHeight: wp('12%'),
  },
  headerLogoWrap: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('3.5%'),
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerLogo: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('2.5%'),
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: fs(22),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  notificationBtn: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: Colors.notificationBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: hp('1.2%'),
    right: wp('2.8%'),
    width: wp('2.2%'),
    height: wp('2.2%'),
    borderRadius: wp('1.1%'),
    backgroundColor: Colors.gold,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  greeting: {
    fontSize: fs(20),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.4%'),
  },
  subtitle: {
    fontSize: fs(13),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginBottom: hp('1.5%'),
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: Colors.focusBorder,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.4%'),
    marginBottom: hp('2%'),
  },
  premiumBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
    flex: 1,
  },
  premiumIconWrap: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('3%'),
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBannerTitle: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.2%'),
  },
  premiumBannerSubtitle: {
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  featuredSlider: {
    width: CARD_WIDTH,
    height: hp('40%'),
  },
  featuredCard: {
    height: hp('40%'),
    borderRadius: wp('7%'),
    overflow: 'hidden',
    backgroundColor: Colors.gradientStart,
  },
  featuredImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFill,
  },
  featuredBadges: {
    position: 'absolute',
    top: hp('1.6%'),
    left: wp('3.2%'),
    right: wp('3.2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: wp('3.2%'),
    paddingVertical: hp('0.45%'),
    borderRadius: wp('3%'),
  },
  newBadgeText: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    backgroundColor: Colors.white,
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.45%'),
    borderRadius: wp('3%'),
  },
  verifiedBadgeText: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.redish,
  },
  featuredInfo: {
    position: 'absolute',
    left: wp('4.5%'),
    right: wp('4.5%'),
    bottom: hp('2%'),
  },
  featuredName: {
    fontSize: fs(26),
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: hp('0.5%'),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    marginBottom: hp('1.2%'),
  },
  locationText: {
    fontSize: fs(13),
    fontFamily: Fonts.regular,
    color: Colors.white,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: wp('1.5%'),
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    paddingHorizontal: wp('2.2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('3.5%'),
  },
  tagText: {
    fontSize: fs(10),
    fontFamily: Fonts.medium,
    color: Colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('10%'),
    marginTop: hp('2.2%'),
  },
  dislikeBtn: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  likeBtn: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.8%'),
    marginTop: hp('1.8%'),
    marginBottom: hp('2.5%'),
  },
  paginationDot: {
    borderRadius: wp('1%'),
  },
  paginationDotActive: {
    width: wp('6.5%'),
    height: hp('0.75%'),
    backgroundColor: Colors.primary,
    borderRadius: wp('1.5%'),
  },
  paginationDotInactive: {
    width: wp('1.8%'),
    height: wp('1.8%'),
    borderRadius: wp('0.9%'),
    backgroundColor: Colors.gradientStart,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  sectionTitle: {
    fontSize: fs(16),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  seeAll: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  suggestedList: {
    gap: wp('3%'),
    paddingRight: wp('2%'),
  },
  suggestedCard: {
    width: wp('43%'),
    backgroundColor: Colors.white,
    borderRadius: wp('4.5%'),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  suggestedImageWrap: {
    width: '100%',
    height: hp('15.5%'),
    position: 'relative',
    backgroundColor: Colors.gradientStart,
  },
  suggestedImage: {
    width: '100%',
    height: '100%',
  },
  suggestedVerifyBadge: {
    position: 'absolute',
    top: hp('0.8%'),
    left: wp('2%'),
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('3%'),
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedTierBadge: {
    position: 'absolute',
    top: hp('0.8%'),
    right: wp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('0.8%'),
    backgroundColor: Colors.gold,
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('2.5%'),
  },
  suggestedTierText: {
    fontSize: fs(9),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  suggestedBody: {
    paddingHorizontal: wp('3%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('1.1%'),
  },
  suggestedName: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.2%'),
  },
  suggestedLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('0.5%'),
    marginBottom: hp('0.9%'),
  },
  suggestedLocation: {
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  suggestedBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  professionTag: {
    backgroundColor: Colors.suggestedTagBg,
    paddingHorizontal: wp('2.8%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('3%'),
    maxWidth: '68%',
  },
  professionText: {
    fontSize: fs(10),
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  suggestedLikeBtn: {
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: wp('4.25%'),
    borderWidth: 1,
    borderColor: Colors.focusBorder,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: hp('0.5%'),
  },
});

export default HomeScreen;
