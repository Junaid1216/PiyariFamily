import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import { AxiosError } from 'axios';
import { Images } from '../../Assets';
import {
  Api,
  ENDPOINTS,
  getApiErrorMessage,
  mapMatchList,
  type ApiErrorResponse,
  type MatchFilterParams,
  type MatchSearchParams,
  type SuggestedMatch,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { SearchStackParamList } from '../../Navigation/SearchStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'SearchMain'
>;

type SearchRouteProp = RouteProp<SearchStackParamList, 'SearchMain'>;

type QuickFilter = 'nearMe' | 'verified' | 'newProfiles';

const QUICK_FILTERS: {
  id: QuickFilter;
  label: string;
  icon: string;
}[] = [
  { id: 'nearMe', label: Strings.nearMe, icon: 'map-marker-outline' },
  {
    id: 'verified',
    label: Strings.verifiedProfiles,
    icon: 'shield-check-outline',
  },
  { id: 'newProfiles', label: Strings.newProfiles, icon: 'creation' },
];

const RECENT_SEARCHES = [
  'Software Engineer, Multan',
  'MBA, Lahore',
  'Doctor, Karachi',
];

const buildSearchParams = (
  searchQuery: string,
  activeQuickFilter: QuickFilter,
): MatchSearchParams => {
  const params: MatchSearchParams = {};
  const query = searchQuery.trim();

  if (query) {
    params.q = query;
    params.search = query;
  }

  if (activeQuickFilter === 'verified') {
    params.verified = 1;
  }

  if (activeQuickFilter === 'newProfiles') {
    params.is_new = 1;
  }

  return params;
};

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchRouteProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] =
    useState<QuickFilter>('nearMe');
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [suggestedMatches, setSuggestedMatches] = useState<SuggestedMatch[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const skipNextSearchRef = useRef(false);

  const fetchMatchSearch = useCallback(async () => {
    setLoading(true);

    try {
      const params = buildSearchParams(searchQuery, activeQuickFilter);
      console.log('Match Search Request:', ENDPOINTS.MATCHES_SEARCH);
      const res = await Api.getMatchSearch(params);

      if (res?.status == 200) {
        console.log('Match Search Success:', res?.data);
        const mapped = mapMatchList(res?.data);
        setSuggestedMatches(mapped);
      } else {
        console.log('Match Search Failed:', res?.data);
        setSuggestedMatches([]);
        Toast.show(
          res?.data?.message ?? 'Failed to load search results',
          Toast.LONG,
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Match Search Error:', axiosError?.response?.data || error);
      setSuggestedMatches([]);
      Toast.show(
        getApiErrorMessage(error, 'Failed to load search results'),
        Toast.LONG,
      );
    } finally {
      setLoading(false);
    }
  }, [activeQuickFilter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (!route.params?.fromFilter) {
        return;
      }

      const filterMatches = route.params.filterMatches ?? [];
      setSuggestedMatches(filterMatches);
      setLoading(false);
      skipNextSearchRef.current = true;
      navigation.setParams({
        fromFilter: undefined,
        filterMatches: undefined,
        filterTotal: undefined,
      });
    }, [navigation, route.params?.filterMatches, route.params?.fromFilter]),
  );

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchMatchSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchMatchSearch, searchQuery, activeQuickFilter]);

  const removeRecentSearch = (item: string) => {
    setRecentSearches(prev => prev.filter(search => search !== item));
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{Strings.findYourMatch}</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FilterMatches')}
          >
            <Icon name="filter-variant" size={fs(20)} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Icon name="magnify" size={fs(20)} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={Strings.searchPlaceholder}
            placeholderTextColor={Colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionLabel}>{Strings.quickFilters}</Text>
        <View style={styles.quickFilterRow}>
          {QUICK_FILTERS.map(filter => {
            const selected = activeQuickFilter === filter.id;

            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.quickFilterChip,
                  selected && styles.quickFilterChipSelected,
                ]}
                activeOpacity={0.85}
                onPress={() => setActiveQuickFilter(filter.id)}
              >
                <Icon
                  name={filter.icon}
                  size={fs(14)}
                  color={selected ? Colors.white : Colors.primary}
                />
                <Text
                  style={[
                    styles.quickFilterText,
                    selected && styles.quickFilterTextSelected,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.recentLabel}>{Strings.recentSearches}</Text>
        {recentSearches.map(item => (
          <View key={item} style={styles.recentRow}>
            <Icon
              name="clock-outline"
              size={fs(18)}
              color={Colors.textLight}
              style={styles.recentIcon}
            />
            <Text style={styles.recentText}>{item}</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => removeRecentSearch(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={fs(16)} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{Strings.suggestedMatches}</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.seeAll}>{Strings.seeAll} →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : suggestedMatches.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedList}
          >
            {suggestedMatches.map(match => (
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

                  <View style={styles.suggestedBadgeColumn}>
                    <View style={styles.suggestedTierBadge}>
                      <Icon
                        name={match.tier === 'VIP' ? 'star' : 'crown'}
                        size={fs(10)}
                        color={Colors.white}
                      />
                      <Text style={styles.suggestedTierText}>{match.tier}</Text>
                    </View>

                    {match.isVerified ? (
                      <View style={styles.suggestedVerifiedRow}>
                        <Image
                          source={Images.verifiedIcon}
                          style={styles.suggestedVerifiedIcon}
                          resizeMode="contain"
                        />
                        <Text style={styles.suggestedVerifiedText}>
                          {Strings.verifiedBadge}
                        </Text>
                      </View>
                    ) : null}
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
        ) : (
          <Text style={styles.emptyText}>No matches found</Text>
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
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('0.5%'),
    paddingBottom: hp('2%'),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  title: {
    fontSize: FontSizes.h2,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: -0.3,
    flex: 1,
  },
  filterBtn: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('3%'),
    backgroundColor: Colors.tabActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: AuthStyles.inputRadius,
    paddingHorizontal: wp('3.8%'),
    height: AuthStyles.inputHeight,
    gap: wp('2.5%'),
    marginBottom: hp('2.2%'),
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
    paddingVertical: 0,
  },
  sectionLabel: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('1.2%'),
  },
  quickFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
    marginBottom: hp('2.2%'),
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.9%'),
    borderRadius: wp('4%'),
    backgroundColor: Colors.tabActiveBg,
    borderWidth: 1,
    borderColor: Colors.focusBorder,
  },
  quickFilterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickFilterText: {
    fontSize: fs(12),
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  quickFilterTextSelected: {
    color: Colors.white,
  },
  recentLabel: {
    fontSize: fs(13),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginBottom: hp('1%'),
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  recentIcon: {
    marginRight: wp('2.5%'),
  },
  recentText: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
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
  loaderWrap: {
    minHeight: hp('18%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSizes.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: hp('4%'),
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
  suggestedTierBadge: {
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
  suggestedBadgeColumn: {
    position: 'absolute',
    top: hp('0.8%'),
    right: wp('2%'),
    alignItems: 'flex-end',
    gap: hp('0.35%'),
  },
  suggestedVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    backgroundColor: Colors.white,
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.35%'),
    borderRadius: wp('5.5%'),
  },
  suggestedVerifiedIcon: {
    width: fs(11),
    height: fs(11),
    tintColor: Colors.gold,
  },
  suggestedVerifiedText: {
    fontSize: fs(9),
    fontFamily: Fonts.medium,
    color: Colors.black,
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
});

export default SearchScreen;
