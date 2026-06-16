import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Images } from '../../Assets';
import BackButton from '../../Components/BackButton';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import {
  LIKED_ME_PROFILES,
  PROFILES_I_LIKED,
  ShortlistedProfile,
} from '../../Constant/Shortlisted';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { LikeStackParamList } from '../../Navigation/LikeStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type TabKey = 'liked' | 'likedMe';
type NavigationProp = NativeStackNavigationProp<
  LikeStackParamList,
  'Shortlisted'
>;

const ShortlistedScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabKey>('liked');

  const profiles =
    activeTab === 'liked' ? PROFILES_I_LIKED : LIKED_ME_PROFILES;

  const renderProfile = ({ item }: { item: ShortlistedProfile }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.avatar} resizeMode="cover" />

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName}>
            {item.name}, {item.age}
          </Text>
          <Icon name="heart" size={fs(20)} color={Colors.redish} />
        </View>

        <View style={styles.locationRow}>
          <Icon name="map-marker-outline" size={fs(13)} color={Colors.textLight} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <View style={styles.tagRow}>
          <View style={styles.infoTag}>
            <Icon name="school-outline" size={fs(11)} color={Colors.primary} />
            <Text style={styles.infoTagText}>{item.education}</Text>
          </View>
          <View style={styles.infoTag}>
            <Icon name="briefcase-outline" size={fs(11)} color={Colors.primary} />
            <Text style={styles.infoTagText}>{item.profession}</Text>
          </View>
          {item.isVerified ? (
            <View style={styles.verifiedTag}>
              <Image
                source={Images.verifiedIcon}
                style={styles.verifiedIcon}
                resizeMode="contain"
              />
              <Text style={styles.verifiedText}>{Strings.verifiedBadge}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.viewProfileBtn}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('ProfileDetail', { profileId: item.id === '4' || item.id === '5' ? '2' : '1' })
          }
        >
          <Text style={styles.viewProfileText}>{Strings.viewProfile}</Text>
          <Icon name="arrow-right" size={fs(16)} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton
          variant="pink"
          compact
          onPress={() => navigation.getParent()?.navigate('Home')}
        />
        <Text style={styles.headerTitle}>{Strings.shortlisted}</Text>
        <TouchableOpacity
          style={styles.filterBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('FilterMatches')}
        >
          <Icon name="tune-variant" size={fs(22)} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('liked')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'liked' && styles.tabTextActive,
            ]}
          >
            {Strings.profilesILiked}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'likedMe' && styles.tabActive]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('likedMe')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'likedMe' && styles.tabTextActive,
            ]}
          >
            {Strings.likedMe}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={profiles}
        keyExtractor={item => item.id}
        renderItem={renderProfile}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
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
  filterBtn: {
    width: wp('10.7%'),
    height: wp('10.7%'),
    borderRadius: wp('5.35%'),
    backgroundColor: Colors.tabActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: AuthStyles.horizontalPadding,
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('3.5%'),
    padding: wp('1%'),
    marginBottom: hp('2%'),
  },
  tab: {
    flex: 1,
    paddingVertical: hp('1.2%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('2%'),
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: wp('3%'),
    marginBottom: hp('1.8%'),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: wp('22%'),
    height: wp('28%'),
    borderRadius: wp('3.5%'),
  },
  cardBody: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('0.4%'),
  },
  cardName: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    marginBottom: hp('0.8%'),
  },
  locationText: {
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('1.5%'),
    marginBottom: hp('0.8%'),
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    backgroundColor: Colors.tabActiveBg,
    paddingHorizontal: wp('2.2%'),
    paddingVertical: hp('0.35%'),
    borderRadius: wp('2.5%'),
  },
  infoTagText: {
    fontSize: fs(10),
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('0.8%'),
    backgroundColor: '#FFF8E1',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.35%'),
    borderRadius: wp('2.5%'),
  },
  verifiedIcon: {
    width: fs(10),
    height: fs(10),
    tintColor: Colors.gold,
  },
  verifiedText: {
    fontSize: fs(9),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: wp('1%'),
  },
  viewProfileText: {
    fontSize: fs(12),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});

export default ShortlistedScreen;
