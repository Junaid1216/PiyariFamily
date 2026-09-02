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
import { Images } from '../../Assets';
import BackButton from '../../Components/BackButton';
import {
  Api,
  buildMatchSearchParams,
  getApiErrorMessage,
  getImageCacheKey,
  hydrateMatchImages,
  isApiSuccess,
  mapFilterSetup,
  mapMatchList,
  type FilterQuickOption,
  type SuggestedMatch,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { SearchStackParamList } from '../../Navigation/SearchStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';
import {
  clearFilterResults,
  selectFilterApplied,
  selectFilterResults,
  selectProfile,
  useAppDispatch,
  useAppSelector,
} from '../../Redux';

type NavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'SearchMain'
>;

type SearchRouteProp = RouteProp<SearchStackParamList, 'SearchMain'>;

const SEARCH_DEBOUNCE_MS = 600;
const MIN_SEARCH_LENGTH = 2;

const iconForQuickFilter = (id: string) => {
  const key = id.toLowerCase();

  if (key.includes('near')) {
    return 'map-marker-outline';
  }

  if (key.includes('verif')) {
    return 'shield-check-outline';
  }

  if (key.includes('new')) {
    return 'creation';
  }

  return 'filter-variant';
};

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchRouteProp>();
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();
  const filterResults = useAppSelector(selectFilterResults);
  const filterApplied = useAppSelector(selectFilterApplied);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null,
  );
  const [quickFilters, setQuickFilters] = useState<FilterQuickOption[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<SuggestedMatch[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const skipNextSearchRef = useRef(filterApplied);
  const skipFilterSearchRef = useRef(true);
  const activeQuickFilterRef = useRef(activeQuickFilter);
  const searchQueryRef = useRef(searchQuery);
  const loadedQuickFiltersRef = useRef(false);

  activeQuickFilterRef.current = activeQuickFilter;
  searchQueryRef.current = searchQuery;

  const fetchMatchSearch = useCallback(async (query: string) => {
    setLoading(true);

    try {
      const profileGender = profile?.gender;
      const trimmedQuery = query.trim();
      const params = buildMatchSearchParams({
        searchQuery: query,
        quickFilter: activeQuickFilterRef.current,
        profileGender,
      });
      const res = await Api.getMatchSearch(params);

      if (isApiSuccess(res?.status, res?.data?.success)) {
        const mapped = mapMatchList(res?.data);
        let chips = mapFilterSetup(res?.data).quickFilters;

        if (!chips.length && !loadedQuickFiltersRef.current) {
          const meta = await Api.getMatchFilter();
          if (isApiSuccess(meta?.status, meta?.data?.success)) {
            chips = mapFilterSetup(meta?.data).quickFilters;
          }
        }

        if (chips.length) {
          setQuickFilters(chips);
          loadedQuickFiltersRef.current = true;
        }

        setSuggestedMatches(await hydrateMatchImages(mapped));
        if (
          trimmedQuery.length >= MIN_SEARCH_LENGTH ||
          activeQuickFilterRef.current
        ) {
          dispatch(clearFilterResults());
        }
        if (trimmedQuery.length >= MIN_SEARCH_LENGTH) {
          setRecentSearches(current =>
            [trimmedQuery, ...current.filter(item => item !== trimmedQuery)].slice(
              0,
              8,
            ),
          );
        }
      } else {
        setSuggestedMatches([]);
        Toast.show(
          res?.data?.message ?? 'Failed to load search results',
          Toast.LONG,
        );
      }
    } catch (error) {
      setSuggestedMatches([]);
      Toast.show(
        getApiErrorMessage(error, 'Failed to load search results'),
        Toast.LONG,
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, profile?.gender]);

  useFocusEffect(
    useCallback(() => {
      if (!route.params?.fromFilter && !filterApplied) {
        return;
      }

      setSuggestedMatches(filterResults);
      setLoading(false);
      skipNextSearchRef.current = true;
      skipFilterSearchRef.current = true;
      if (route.params?.fromFilter) {
        navigation.setParams({
          fromFilter: undefined,
          filterMatches: undefined,
          filterTotal: undefined,
        });
      }
    }, [
      filterApplied,
      filterResults,
      navigation,
      route.params?.fromFilter,
    ]),
  );

  useEffect(() => {
    if (skipFilterSearchRef.current) {
      skipFilterSearchRef.current = false;
      return;
    }

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const trimmed = searchQueryRef.current.trim();

    if (trimmed.length > 0 && trimmed.length < MIN_SEARCH_LENGTH) {
      return;
    }

    fetchMatchSearch(trimmed);
  }, [activeQuickFilter, fetchMatchSearch]);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const trimmed = searchQuery.trim();

    if (trimmed.length > 0 && trimmed.length < MIN_SEARCH_LENGTH) {
      return;
    }

    const timer = setTimeout(() => {
      fetchMatchSearch(trimmed);
    }, trimmed ? SEARCH_DEBOUNCE_MS : 0);

    return () => clearTimeout(timer);
  }, [fetchMatchSearch, searchQuery]);

  const removeRecentSearch = (item: string) => {
    setRecentSearches(prev => prev.filter(search => search !== item));
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <BackButton
            variant="pink"
            compact
            onPress={() => navigation.getParent()?.navigate('Home')}
          />
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

        {quickFilters.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{Strings.quickFilters}</Text>
            <View style={styles.quickFilterRow}>
              {quickFilters.map(filter => {
                const selected = activeQuickFilter === filter.id;

                return (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.quickFilterChip,
                      selected && styles.quickFilterChipSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() =>
                      setActiveQuickFilter(prev =>
                        prev === filter.id ? null : filter.id,
                      )
                    }
                  >
                    <Icon
                      name={iconForQuickFilter(filter.id)}
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
          </>
        ) : null}

        {recentSearches.length > 0 ? (
          <>
            <Text style={styles.recentLabel}>{Strings.recentSearches}</Text>
            {recentSearches.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.recentRow}
                activeOpacity={0.85}
                onPress={() => setSearchQuery(item)}
              >
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
              </TouchableOpacity>
            ))}
          </>
        ) : null}

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
                  navigation.navigate('ProfileDetail', {
                    profileId: match.id,
                    name: match.name,
                    age: match.age,
                    location: match.location,
                    image: match.image,
                    isVerified: match.isVerified,
                  })
                }
              >
                <View style={styles.suggestedImageWrap}>
                  <Image
                    key={getImageCacheKey(match.image, match.id)}
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
