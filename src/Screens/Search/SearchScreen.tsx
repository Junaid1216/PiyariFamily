import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
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
import {
  Api,
  buildMatchSearchParams,
  getApiErrorMessage,
  getImageCacheKey,
  hydrateMatchImages,
  isApiSuccess,
  mapFilterMatchGroups,
  mapFilterSetup,
  profileMatchesSearchQuery,
  type FilterQuickOption,
  type SuggestedMatch,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { SearchStackParamList } from '../../Navigation/SearchStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';
import { useTabRootBackToHome } from '../../Functions/tabNavigation';
import {
  clearFilterResults,
  selectFilterApplied,
  selectFilterForm,
  selectFilterHasExactMatches,
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

const MIN_SEARCH_LENGTH = 2;
const DUPLICATE_SEARCH_WINDOW_MS = 1500;

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
  useTabRootBackToHome(navigation);
  const route = useRoute<SearchRouteProp>();
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();
  const filterResults = useAppSelector(selectFilterResults);
  const filterApplied = useAppSelector(selectFilterApplied);
  const filterForm = useAppSelector(selectFilterForm);
  const filterHasExactMatches = useAppSelector(selectFilterHasExactMatches);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null,
  );
  const [quickFilters, setQuickFilters] = useState<FilterQuickOption[]>([]);
  const [searchCatalogs, setSearchCatalogs] = useState<{
    cities: string[];
    professions: string[];
  }>({ cities: [], professions: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<SuggestedMatch[]>(
    [],
  );
  const [emptyMessage, setEmptyMessage] = useState(Strings.noMatchesFound);
  const [loading, setLoading] = useState(true);
  const loadedQuickFiltersRef = useRef(false);
  const searchGenerationRef = useRef(0);
  const lastSearchKeyRef = useRef('');
  const lastSearchAtRef = useRef(0);
  const catalogsRef = useRef(searchCatalogs);

  catalogsRef.current = searchCatalogs;

  const comingFromFilter = Boolean(route.params?.fromFilter);
  const appliedQuickFilterIds = Object.entries(
    filterForm?.activeQuickFilters ?? {},
  )
    .filter(([, enabled]) => Boolean(enabled))
    .map(([id]) => id);
  const showingFilterResults =
    filterApplied &&
    !submittedQuery.trim() &&
    (comingFromFilter || !activeQuickFilter);

  const applySearchMeta = useCallback((payload: unknown) => {
    const setup = mapFilterSetup(payload as Parameters<typeof mapFilterSetup>[0]);

    if (setup.quickFilters.length) {
      setQuickFilters(setup.quickFilters);
      loadedQuickFiltersRef.current = true;
    }

    if (setup.options.cities.length || setup.options.professions.length) {
      setSearchCatalogs({
        cities: setup.options.cities,
        professions: setup.options.professions,
      });
    }
  }, []);

  const fetchMatchSearch = useCallback(
    async (query: string, quickFilter: string | null) => {
      const trimmedQuery = query.trim();
      const requestKey = JSON.stringify({
        query: trimmedQuery,
        quickFilter,
        gender: profile?.gender ?? '',
      });
      const now = Date.now();

      if (
        lastSearchKeyRef.current === requestKey &&
        now - lastSearchAtRef.current < DUPLICATE_SEARCH_WINDOW_MS
      ) {
        return;
      }

      const generation = ++searchGenerationRef.current;
      lastSearchKeyRef.current = requestKey;
      lastSearchAtRef.current = now;
      setLoading(true);

      try {
        const params = buildMatchSearchParams({
          searchQuery: trimmedQuery,
          quickFilter,
          profileGender: profile?.gender,
          searchCatalogs: catalogsRef.current,
        });
        console.log('[Search] GET /matches/search params:', params);

        const res = await Api.getMatchSearch(params);

        if (generation !== searchGenerationRef.current) {
          return;
        }

        if (isApiSuccess(res?.status, res?.data?.success)) {
          const groups = mapFilterMatchGroups(res?.data);
          const isUserSearch = trimmedQuery.length >= MIN_SEARCH_LENGTH;
          applySearchMeta(res?.data);

          if (
            trimmedQuery.length >= MIN_SEARCH_LENGTH &&
            !catalogsRef.current.cities.length &&
            !catalogsRef.current.professions.length
          ) {
            const meta = await Api.getMatchFilter();
            if (
              generation === searchGenerationRef.current &&
              isApiSuccess(meta?.status, meta?.data?.success)
            ) {
              applySearchMeta(meta?.data);
            }
          }

          if (generation !== searchGenerationRef.current) {
            return;
          }

          if (isUserSearch) {
            const exactMatches =
              groups.fallbackUsed || !groups.exact.length
                ? []
                : groups.exact.filter(match =>
                    profileMatchesSearchQuery(
                      match,
                      trimmedQuery,
                      catalogsRef.current,
                    ),
                  );

            setSuggestedMatches(await hydrateMatchImages(exactMatches));
            setEmptyMessage(Strings.noExactMatchesFound);
          } else {
            const mapped = groups.exact.length
              ? groups.exact
              : groups.suggested;
            setSuggestedMatches(await hydrateMatchImages(mapped));
            setEmptyMessage(
              res?.data?.message?.trim() || Strings.noMatchesFound,
            );
          }

          if (trimmedQuery.length >= MIN_SEARCH_LENGTH || quickFilter) {
            dispatch(clearFilterResults());
          }
          if (trimmedQuery.length >= MIN_SEARCH_LENGTH) {
            setRecentSearches(current =>
              [
                trimmedQuery,
                ...current.filter(item => item !== trimmedQuery),
              ].slice(0, 8),
            );
          }
        } else {
          setSuggestedMatches([]);
          setEmptyMessage(
            res?.data?.message ?? Strings.noMatchesFound,
          );
          Toast.show(
            res?.data?.message ?? 'Failed to load search results',
            Toast.LONG,
          );
        }
      } catch (error) {
        if (generation !== searchGenerationRef.current) {
          return;
        }

        setSuggestedMatches([]);
        const message = getApiErrorMessage(
          error,
          'Failed to load search results',
        );
        setEmptyMessage(message);
        Toast.show(message, Toast.LONG);
      } finally {
        if (generation === searchGenerationRef.current) {
          setLoading(false);
        }
      }
    },
    [applySearchMeta, dispatch, profile?.gender],
  );

  const submitSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();

      if (trimmed.length > 0 && trimmed.length < MIN_SEARCH_LENGTH) {
        Toast.show('Enter at least 2 characters to search', Toast.LONG);
        return;
      }

      Keyboard.dismiss();
      setSubmittedQuery(trimmed);
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      if (!route.params?.fromFilter) {
        return;
      }

      setSearchQuery('');
      setSubmittedQuery('');
      setActiveQuickFilter(null);
      navigation.setParams({
        fromFilter: undefined,
        filterMatches: undefined,
        filterTotal: undefined,
      });
    }, [navigation, route.params?.fromFilter]),
  );

  useEffect(() => {
    if (!showingFilterResults) {
      return;
    }

    setSuggestedMatches(filterResults);
    setLoading(false);
  }, [filterResults, showingFilterResults]);

  useEffect(() => {
    if (showingFilterResults) {
      return;
    }

    fetchMatchSearch(submittedQuery, activeQuickFilter);
  }, [activeQuickFilter, fetchMatchSearch, showingFilterResults, submittedQuery]);

  const removeRecentSearch = (item: string) => {
    setRecentSearches(prev => prev.filter(search => search !== item));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const matchesTitle =
    (showingFilterResults && filterHasExactMatches) ||
    submittedQuery.trim().length >= MIN_SEARCH_LENGTH
      ? Strings.exactMatches
      : Strings.suggestedMatches;
  const hasSubmittedSearch = submittedQuery.trim().length >= MIN_SEARCH_LENGTH;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={true}
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
            <Image
              source={Images.filterIcon}
              style={styles.filterIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Icon name="magnify" size={fs(20)} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={Strings.searchPlaceholder}
            placeholderTextColor={Colors.placeholder}
            value={searchQuery}
            returnKeyType="search"
            onChangeText={text => {
              setSearchQuery(text);
              if (!text.trim() && submittedQuery) {
                setSubmittedQuery('');
              }
            }}
            onSubmitEditing={() => submitSearch(searchQuery)}
            blurOnSubmit
          />
        </View>

        {quickFilters.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{Strings.quickFilters}</Text>
            <View style={styles.quickFilterRow}>
              {quickFilters.map(filter => {
                const selected = showingFilterResults
                  ? appliedQuickFilterIds.includes(filter.id)
                  : activeQuickFilter === filter.id;

                return (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.quickFilterChip,
                      selected && styles.quickFilterChipSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (
                        showingFilterResults &&
                        appliedQuickFilterIds.includes(filter.id)
                      ) {
                        return;
                      }

                      setActiveQuickFilter(prev =>
                        prev === filter.id ? null : filter.id,
                      );
                    }}
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
            <View style={styles.recentHeader}>
              <Text style={styles.recentLabel}>{Strings.recentSearches}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={clearRecentSearches}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearAll}>{Strings.clearAll}</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.recentRow}
                activeOpacity={0.85}
                onPress={() => {
                  setSearchQuery(item);
                  submitSearch(item);
                }}
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

        {!loading &&
        (suggestedMatches.length > 0 || hasSubmittedSearch) ? (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{matchesTitle}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : suggestedMatches.length > 0 ? (
          <View style={styles.suggestedGrid}>
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
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Icon
                name="account-search-outline"
                size={fs(32)}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {hasSubmittedSearch
                ? Strings.noExactMatchesFound
                : emptyMessage}
            </Text>
            {hasSubmittedSearch ? (
              <>
                <View style={styles.emptyQueryChip}>
                  <Icon
                    name="magnify"
                    size={fs(14)}
                    color={Colors.gold}
                  />
                  <Text style={styles.emptyQueryText} numberOfLines={1}>
                    {submittedQuery}
                  </Text>
                </View>
                <Text style={styles.emptyHint}>
                  {Strings.noExactMatchesHint}
                </Text>
              </>
            ) : (
              <Text style={styles.emptyHint}>
                {Strings.noExactMatchesHint}
              </Text>
            )}
          </View>
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
    textAlign: 'left',
  },
  filterBtn: {
    width: wp('10.7%'),
    height: wp('10.7%'),
    borderRadius: wp('5.35%'),
    backgroundColor: Colors.tabActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    width: fs(18),
    height: fs(18),
    tintColor: Colors.primary,
  },
  loaderWrap: {
    minHeight: hp('18%'),
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
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  recentLabel: {
    fontSize: fs(13),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  clearAll: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2%'),
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('4.5%'),
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('5%'),
    borderWidth: 1,
    borderColor: Colors.focusBorder,
  },
  emptyIconWrap: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.8%'),
    borderWidth: 1,
    borderColor: Colors.focusBorder,
  },
  emptyTitle: {
    fontSize: fs(16),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: hp('1.2%'),
  },
  emptyQueryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    maxWidth: '100%',
    backgroundColor: Colors.white,
    borderRadius: wp('5%'),
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.7%'),
    marginBottom: hp('1.2%'),
    borderWidth: 1,
    borderColor: Colors.goldLight,
  },
  emptyQueryText: {
    flexShrink: 1,
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  emptyHint: {
    fontSize: fs(13),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: fs(20),
  },
  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  suggestedCard: {
    width: '48%',
    marginBottom: wp('3%'),
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
    position: 'absolute',
    left: wp('2%'),
    bottom: hp('0.8%'),
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
