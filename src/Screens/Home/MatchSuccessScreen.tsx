import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Images } from '../../Assets';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { HomeStackParamList } from '../../Navigation/HomeStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type RouteProps = RouteProp<HomeStackParamList, 'MatchSuccess'>;
type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'MatchSuccess'
>;

const POTENTIAL_MATCHES = [
  Images.femaleProfile,
  Images.femaleProfile2,
  Images.maleProfile,
];

const MatchSuccessScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { name, fullName, matchImage } = route.params;

  const matchSubtitle = Strings.matchSubtitle.replace('{name}', name);
  const interestNotice = Strings.interestSentNotice.replace('{name}', fullName);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.background]}
      locations={[0, 0.45, 1]}
      style={styles.root}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + hp('2%'), paddingBottom: insets.bottom + hp('2%') },
        ]}
      >
        <Text style={styles.title}>{Strings.itsAMatch}</Text>
        <Text style={styles.subtitle}>{matchSubtitle}</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarRing, styles.avatarRingLeft]}>
              <Image
                source={Images.maleProfile}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.heartBadge}>
              <Icon name="heart" size={fs(22)} color={Colors.white} />
            </View>
            <View style={[styles.avatarRing, styles.avatarRingRight]}>
              <Image
                source={matchImage}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          </View>

          <Icon
            name="star-four-points"
            size={fs(16)}
            color={Colors.gold}
            style={styles.sparkleLeft}
          />
          <Icon
            name="star-four-points"
            size={fs(14)}
            color={Colors.gold}
            style={styles.sparkleRight}
          />
          <Icon
            name="star-four-points"
            size={fs(12)}
            color={Colors.goldLight}
            style={styles.sparkleTop}
          />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Icon name="heart" size={fs(14)} color={Colors.primary} />
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.messageBtn} activeOpacity={0.88}>
          <Icon name="message-text-outline" size={fs(20)} color={Colors.white} />
          <Text style={styles.messageBtnText}>{Strings.sendAMessage}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keepFindingBtn}
          activeOpacity={0.88}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.keepFindingText}>{Strings.keepFinding}</Text>
          <Icon name="arrow-right" size={fs(20)} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.noticeBox}>
          <Image
            source={Images.verifiedIcon}
            style={styles.noticeIcon}
            resizeMode="contain"
          />
          <Text style={styles.noticeText}>{interestNotice}</Text>
        </View>

        <View style={styles.potentialHeader}>
          <Text style={styles.potentialTitle}>{Strings.potentialMatches}</Text>
          <Icon name="chevron-right" size={fs(20)} color={Colors.gold} />
        </View>

        <View style={styles.potentialRow}>
          {POTENTIAL_MATCHES.map((image, index) => (
            <Image
              key={index}
              source={image}
              style={styles.potentialAvatar}
              resizeMode="cover"
            />
          ))}
          <View style={styles.moreMatches}>
            <Text style={styles.moreMatchesText}>+12</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp('6%'),
    alignItems: 'center',
  },
  title: {
    fontSize: fs(28),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.8%'),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fs(14),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: hp('3%'),
    lineHeight: hp('2.4%'),
  },
  avatarSection: {
    width: wp('70%'),
    height: hp('18%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  avatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('14%'),
    borderWidth: 3,
    padding: 3,
    backgroundColor: Colors.white,
  },
  avatarRingLeft: {
    borderColor: Colors.primary,
    marginRight: -wp('6%'),
    zIndex: 1,
  },
  avatarRingRight: {
    borderColor: Colors.gradientStart,
    marginLeft: -wp('6%'),
    zIndex: 1,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: wp('12%'),
  },
  heartBadge: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  sparkleLeft: {
    position: 'absolute',
    left: wp('2%'),
    top: hp('2%'),
  },
  sparkleRight: {
    position: 'absolute',
    right: wp('2%'),
    bottom: hp('2%'),
  },
  sparkleTop: {
    position: 'absolute',
    right: wp('18%'),
    top: 0,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
    width: '100%',
    marginBottom: hp('2.5%'),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  messageBtn: {
    width: '100%',
    height: hp('6.2%'),
    borderRadius: wp('3%'),
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
    marginBottom: hp('1.5%'),
  },
  messageBtnText: {
    fontSize: fs(15),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  keepFindingBtn: {
    width: '100%',
    height: hp('6.2%'),
    borderRadius: wp('3%'),
    borderWidth: 1.2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
    marginBottom: hp('2.5%'),
  },
  keepFindingText: {
    fontSize: fs(15),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  noticeBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp('3%'),
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: Colors.focusBorder,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    marginBottom: hp('3%'),
  },
  noticeIcon: {
    width: fs(18),
    height: fs(18),
    tintColor: Colors.primary,
    marginTop: hp('0.2%'),
  },
  noticeText: {
    flex: 1,
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: hp('2.2%'),
  },
  potentialHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  potentialTitle: {
    fontSize: fs(16),
    fontFamily: Fonts.bold,
    color: Colors.gold,
    fontStyle: 'italic',
  },
  potentialRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
  },
  potentialAvatar: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    borderWidth: 2,
    borderColor: Colors.white,
  },
  moreMatches: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.focusBorder,
    backgroundColor: Colors.tabActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMatchesText: {
    fontSize: fs(13),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
});

export default MatchSuccessScreen;
