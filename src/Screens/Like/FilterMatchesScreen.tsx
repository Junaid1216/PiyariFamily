import React, { useCallback, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import { Images } from '../../Assets';
import ScreenHeader from '../../Components/ScreenHeader';
import FilterChip from '../../Components/FilterChip';
import FilterRangeSlider from '../../Components/FilterRangeSlider';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  Api,
  buildMatchFilterParams,
  DEFAULT_AGE_MAX,
  DEFAULT_AGE_MIN,
  DEFAULT_INCOME_MAX,
  DEFAULT_INCOME_MIN,
  FILTER_ANY,
  getApiErrorMessage,
  isApiSuccess,
  mapFilterSetup,
  mapFilterMatchGroups,
  pickMatchListTotal,
  hydrateMatchImages,
  withAnyOption,
  type FilterSetupData,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { SearchStackParamList } from '../../Navigation/SearchStackNavigator';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { navigateToSearchFilterResults } from '../../Functions/matchNavigation';
import { fs, hp, wp } from '../../Functions/responsive';
import {
  selectFilterForm,
  setFilterForm,
  setFilterResults,
  useAppDispatch,
  useAppSelector,
} from '../../Redux';

type FilterNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'FilterMatches'
>;

const logFilterBackendResponse = (source: string, payload: unknown) => {
  const data = (payload ?? {}) as Record<string, unknown>;
  const nested =
    data.data && typeof data.data === 'object' && !Array.isArray(data.data)
      ? (data.data as Record<string, unknown>)
      : null;
  const filterOptions = (data.filter_options ?? nested?.filter_options) as
    | Record<string, unknown>
    | undefined;
  const applied = (data.filters_applied ?? nested?.filters_applied) as
    | Record<string, unknown>
    | undefined;

  console.log(`[Filter] ${source} full backend response:`, payload);
  console.log(`[Filter] ${source} PKR income range from backend:`, {
    hasFilterOptions: Boolean(filterOptions),
    income_ranges: filterOptions?.income_ranges ?? null,
    incomeRanges: filterOptions?.incomeRanges ?? null,
    monthly_income_ranges: filterOptions?.monthly_income_ranges ?? null,
    pkr_income_ranges: filterOptions?.pkr_income_ranges ?? null,
    incomes: filterOptions?.incomes ?? null,
    monthly_incomes: filterOptions?.monthly_incomes ?? null,
    filters_applied_income_range: applied?.income_range ?? null,
    filters_applied_monthly_income: applied?.monthly_income ?? null,
  });
};

const EMPTY_SETUP: FilterSetupData = {
  quickFilters: [],
  extraSections: [],
  options: {
    cities: [],
    qualifications: [],
    professions: [],
    religions: [],
    maritalStatuses: [],
    incomeRanges: [],
  },
  defaults: {
    ageMin: DEFAULT_AGE_MIN,
    ageMax: DEFAULT_AGE_MAX,
    city: '',
    qualification: FILTER_ANY,
    profession: FILTER_ANY,
    religion: FILTER_ANY,
    maritalStatus: '',
    incomeRange: FILTER_ANY,
    incomeMin: DEFAULT_INCOME_MIN,
    incomeMax: DEFAULT_INCOME_MAX,
  },
  bounds: {
    ageMin: DEFAULT_AGE_MIN,
    ageMax: DEFAULT_AGE_MAX,
    incomeMin: DEFAULT_INCOME_MIN,
    incomeMax: DEFAULT_INCOME_MAX,
    incomeStep: 1000,
  },
  incomeRangeMeta: {},
};

const applyDefaults = (setup: FilterSetupData) => {
  const { defaults } = setup;

  return {
    location: defaults.city,
    citySearch: '',
    education: defaults.qualification,
    profession: defaults.profession,
    religion: defaults.religion,
    marital: defaults.maritalStatus,
    ageMin: defaults.ageMin,
    ageMax: defaults.ageMax,
    incomeRange: defaults.incomeRange,
    incomeMin: defaults.incomeMin,
    incomeMax: defaults.incomeMax,
    extraValues: Object.fromEntries(
      setup.extraSections.map(section => [section.id, FILTER_ANY]),
    ),
    activeQuickFilters: Object.fromEntries(
      setup.quickFilters.map(filter => [filter.id, false]),
    ),
  };
};

const FilterMatchesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FilterNavigationProp>();
  const dispatch = useAppDispatch();
  const savedForm = useAppSelector(selectFilterForm);

  const [filterSetup, setFilterSetup] = useState<FilterSetupData>(EMPTY_SETUP);
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState(FILTER_ANY);
  const [profession, setProfession] = useState(FILTER_ANY);
  const [religion, setReligion] = useState(FILTER_ANY);
  const [marital, setMarital] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [ageMin, setAgeMin] = useState(DEFAULT_AGE_MIN);
  const [ageMax, setAgeMax] = useState(DEFAULT_AGE_MAX);
  const [incomeRange, setIncomeRange] = useState(FILTER_ANY);
  const [incomeMin, setIncomeMin] = useState(DEFAULT_INCOME_MIN);
  const [incomeMax, setIncomeMax] = useState(DEFAULT_INCOME_MAX);
  const [activeQuickFilters, setActiveQuickFilters] = useState<
    Record<string, boolean>
  >({});
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchFilterMeta = useCallback(async () => {
    setMetaLoading(true);

    try {
      const res = await Api.getMatchFilter();
      logFilterBackendResponse('meta (open Filter screen)', res?.data);

      if (isApiSuccess(res?.status, res?.data?.success)) {
        const setup = mapFilterSetup(res?.data);
        console.log('[Filter] mapped PKR incomeRanges for UI:', setup.options.incomeRanges);
        const defaults = applyDefaults(setup);
        const restored = savedForm
          ? {
              ...defaults,
              ...savedForm,
              extraValues: {
                ...defaults.extraValues,
                ...savedForm.extraValues,
              },
              activeQuickFilters: {
                ...defaults.activeQuickFilters,
                ...savedForm.activeQuickFilters,
              },
            }
          : defaults;
        setFilterSetup(setup);
        setLocation(restored.location);
        setCitySearch(restored.citySearch);
        setEducation(restored.education);
        setProfession(restored.profession);
        setReligion(restored.religion);
        setMarital(restored.marital);
        setAgeMin(
          Math.min(
            setup.bounds.ageMax - 1,
            Math.max(setup.bounds.ageMin, restored.ageMin),
          ),
        );
        setAgeMax(
          Math.max(
            setup.bounds.ageMin + 1,
            Math.min(setup.bounds.ageMax, restored.ageMax),
          ),
        );
        setIncomeRange(restored.incomeRange);
        const restoredIncomeMin =
          restored.incomeMin ?? setup.defaults.incomeMin;
        const restoredIncomeMax =
          restored.incomeMax ?? setup.defaults.incomeMax;
        const nextIncomeMin = Math.min(
          setup.bounds.incomeMax - setup.bounds.incomeStep,
          Math.max(setup.bounds.incomeMin, restoredIncomeMin),
        );
        const nextIncomeMax = Math.max(
          setup.bounds.incomeMin + setup.bounds.incomeStep,
          Math.min(setup.bounds.incomeMax, restoredIncomeMax),
        );
        setIncomeMin(
          nextIncomeMax > nextIncomeMin
            ? nextIncomeMin
            : setup.defaults.incomeMin,
        );
        setIncomeMax(
          nextIncomeMax > nextIncomeMin
            ? nextIncomeMax
            : setup.defaults.incomeMax,
        );
        setActiveQuickFilters(restored.activeQuickFilters);
        setExtraValues(restored.extraValues);
      } else {
        setFilterSetup(EMPTY_SETUP);
        Toast.show(
          res?.data?.message ?? 'Failed to load filter options',
          Toast.LONG,
        );
      }
    } catch (error) {
      setFilterSetup(EMPTY_SETUP);
      Toast.show(
        getApiErrorMessage(error, 'Failed to load filter options'),
        Toast.LONG,
      );
    } finally {
      setMetaLoading(false);
    }
  }, [savedForm]);

  useFocusEffect(
    useCallback(() => {
      fetchFilterMeta();
    }, [fetchFilterMeta]),
  );

  const currentForm = () => ({
    location,
    citySearch,
    education,
    profession,
    religion,
    marital,
    ageMin,
    ageMax,
    incomeRange,
    incomeMin,
    incomeMax,
    extraValues,
    activeQuickFilters,
  });

  const handleReset = () => {
    const defaults = applyDefaults(filterSetup);
    setLocation(defaults.location);
    setCitySearch(defaults.citySearch);
    setEducation(defaults.education);
    setProfession(defaults.profession);
    setReligion(defaults.religion);
    setMarital(defaults.marital);
    setAgeMin(defaults.ageMin);
    setAgeMax(defaults.ageMax);
    setIncomeRange(defaults.incomeRange);
    setIncomeMin(defaults.incomeMin);
    setIncomeMax(defaults.incomeMax);
    setExtraValues(defaults.extraValues);
    setActiveQuickFilters(defaults.activeQuickFilters);
    dispatch(setFilterForm(defaults));
  };

  const handleClearAll = () => {
    const cleared = {
      location: '',
      education: FILTER_ANY,
      profession: FILTER_ANY,
      religion: FILTER_ANY,
      marital: '',
      citySearch: '',
      ageMin: filterSetup.bounds.ageMin,
      ageMax: filterSetup.bounds.ageMax,
      incomeRange: FILTER_ANY,
      incomeMin: filterSetup.bounds.incomeMin,
      incomeMax: filterSetup.bounds.incomeMax,
      extraValues: Object.fromEntries(
        filterSetup.extraSections.map(section => [section.id, FILTER_ANY]),
      ),
      activeQuickFilters: Object.fromEntries(
        filterSetup.quickFilters.map(filter => [filter.id, false]),
      ),
    };
    setLocation(cleared.location);
    setEducation(cleared.education);
    setProfession(cleared.profession);
    setReligion(cleared.religion);
    setMarital(cleared.marital);
    setCitySearch(cleared.citySearch);
    setAgeMin(cleared.ageMin);
    setAgeMax(cleared.ageMax);
    setIncomeRange(cleared.incomeRange);
    setIncomeMin(cleared.incomeMin);
    setIncomeMax(cleared.incomeMax);
    setExtraValues(cleared.extraValues);
    setActiveQuickFilters(cleared.activeQuickFilters);
    dispatch(setFilterForm(cleared));
  };

  const toggleQuickFilter = (id: string) => {
    setActiveQuickFilters(current => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const applyFilters = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const params = buildMatchFilterParams({
        location,
        citySearch,
        education,
        profession,
        religion,
        marital,
        ageMin,
        ageMax,
        ageBoundMin: filterSetup.bounds.ageMin,
        ageBoundMax: filterSetup.bounds.ageMax,
        incomeRange,
        incomeMin,
        incomeMax,
        incomeBoundMin: filterSetup.bounds.incomeMin,
        incomeBoundMax: filterSetup.bounds.incomeMax,
        incomeRangeMeta: filterSetup.incomeRangeMeta,
        extraValues,
        activeQuickFilters,
      });

      const res = await Api.getMatchFilter(params);
      logFilterBackendResponse('apply filters', res?.data);
      console.log('[Filter] apply query params:', params);
      console.log('[Filter] selected quick filters:', activeQuickFilters);

      if (isApiSuccess(res?.status, res?.data?.success)) {
        Toast.show(res?.data?.message ?? 'Filters applied', Toast.LONG);
        const groups = mapFilterMatchGroups(res?.data);
        const matches = groups.exact.length
          ? groups.exact
          : groups.suggested;
        const hydrated = await hydrateMatchImages(matches);
        dispatch(setFilterForm(currentForm()));
        dispatch(
          setFilterResults({
            results: hydrated,
            total: pickMatchListTotal(res?.data, hydrated.length),
            fallbackUsed: groups.fallbackUsed,
            hasExactMatches: groups.exact.length > 0,
          }),
        );
        console.log('[Filter] navigating to Search with filtered results:', {
          count: hydrated.length,
          hasExactMatches: groups.exact.length > 0,
          fallbackUsed: groups.fallbackUsed,
        });
        navigateToSearchFilterResults(navigation);
      } else {
        Toast.show(
          res?.data?.message ?? 'Failed to apply filters',
          Toast.LONG,
        );
      }
    } catch (error) {
      Toast.show(
        getApiErrorMessage(error, 'Failed to apply filters'),
        Toast.LONG,
      );
    } finally {
      setLoading(false);
    }
  }, [
    activeQuickFilters,
    ageMax,
    ageMin,
    citySearch,
    education,
    incomeRange,
    incomeMin,
    incomeMax,
    extraValues,
    dispatch,
    filterSetup.bounds.ageMax,
    filterSetup.bounds.ageMin,
    filterSetup.bounds.incomeMax,
    filterSetup.bounds.incomeMin,
    filterSetup.incomeRangeMeta,
    loading,
    location,
    marital,
    navigation,
    profession,
    religion,
  ]);

  const cityOptions = filterSetup.options.cities;
  const visibleCityOptions = (() => {
    if (location) {
      const selected = cityOptions.find(
        city => city.toLowerCase() === location.toLowerCase(),
      );
      return selected ? [selected] : [location];
    }

    const query = citySearch.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return cityOptions.filter(city => city.toLowerCase().includes(query));
  })();
  const educationOptions = withAnyOption(filterSetup.options.qualifications);
  const professionOptions = withAnyOption(filterSetup.options.professions);
  const religionOptions = withAnyOption(filterSetup.options.religions);
  const maritalOptions = filterSetup.options.maritalStatuses;
  const formatPkr = (value: number) =>
    `PKR ${value.toLocaleString('en-US')}`;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={Strings.filterMatches}
        subtitle={Strings.filterMatchesSubtitle}
        subtitleLayout="below"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity activeOpacity={0.85} onPress={handleReset}>
            <Text style={styles.resetText}>{Strings.reset}</Text>
          </TouchableOpacity>
        }
      />

      {metaLoading ? (
        <View style={styles.metaLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled
        >
          {filterSetup.quickFilters.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon
                  name="filter-variant"
                  size={fs(18)}
                  color={Colors.primary}
                />
                <Text style={styles.sectionTitle}>{Strings.quickFilters}</Text>
              </View>
              <View style={styles.chipRow}>
                {filterSetup.quickFilters.map(filter => (
                  <FilterChip
                    key={filter.id}
                    label={filter.label}
                    selected={Boolean(activeQuickFilters[filter.id])}
                    onPress={() => toggleQuickFilter(filter.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <FilterRangeSlider
            title={Strings.ageRange}
            iconName="calendar-outline"
            min={filterSetup.bounds.ageMin}
            max={filterSetup.bounds.ageMax}
            lowValue={ageMin}
            highValue={ageMax}
            minLabel={`${filterSetup.bounds.ageMin} yrs`}
            centerLabel={`${ageMin} – ${ageMax} ${Strings.ageYears}`}
            maxLabel={`${filterSetup.bounds.ageMax} yrs`}
            onLowValueChange={setAgeMin}
            onHighValueChange={setAgeMax}
            onDragStart={() => setScrollEnabled(false)}
            onDragEnd={() => setScrollEnabled(true)}
          />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="map-marker-outline"
                size={fs(18)}
                color={Colors.primary}
              />
              <Text style={styles.sectionTitle}>{Strings.locationLabel}</Text>
            </View>
            <View style={styles.searchRow}>
              <Icon
                name="map-marker-outline"
                size={fs(18)}
                color={Colors.textLight}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={Strings.cityOrState}
                placeholderTextColor={Colors.placeholder}
                value={citySearch}
                onChangeText={text => {
                  setCitySearch(text);
                  const match = cityOptions.find(
                    city => city.toLowerCase() === text.trim().toLowerCase(),
                  );
                  setLocation(match ?? '');
                }}
              />
            </View>
            {visibleCityOptions.length > 0 ? (
              <View style={styles.chipRow}>
                {visibleCityOptions.map(city => (
                  <FilterChip
                    key={city}
                    label={city}
                    selected={location === city}
                    onPress={() => {
                      if (location === city) {
                        setLocation('');
                        setCitySearch('');
                        return;
                      }

                      setLocation(city);
                      setCitySearch(city);
                    }}
                  />
                ))}
              </View>
            ) : null}
          </View>

          {educationOptions.length > 1 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="school-outline" size={fs(18)} color={Colors.primary} />
                <Text style={styles.sectionTitle}>{Strings.educationLabel}</Text>
              </View>
              <View style={styles.chipRow}>
                {educationOptions.map(option => (
                  <FilterChip
                    key={option}
                    label={option}
                    selected={education === option}
                    onPress={() => setEducation(option)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {professionOptions.length > 1 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon
                  name="briefcase-outline"
                  size={fs(18)}
                  color={Colors.primary}
                />
                <Text style={styles.sectionTitle}>{Strings.professionLabel}</Text>
              </View>
              <View style={styles.chipRow}>
                {professionOptions.map(option => (
                  <FilterChip
                    key={option}
                    label={option}
                    selected={profession === option}
                    onPress={() => setProfession(option)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {religionOptions.length > 1 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Image
                  source={Images.religionIcon}
                  style={styles.sectionIconImage}
                  resizeMode="contain"
                />
                <Text style={styles.sectionTitle}>{Strings.religionLabel}</Text>
              </View>
              <View style={styles.chipRow}>
                {religionOptions.map(option => (
                  <FilterChip
                    key={option}
                    label={option}
                    selected={religion === option}
                    onPress={() => setReligion(option)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {maritalOptions.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="heart-outline" size={fs(18)} color={Colors.primary} />
                <Text style={styles.sectionTitle}>
                  {Strings.maritalStatusDetail}
                </Text>
              </View>
              <View style={styles.chipRow}>
                {maritalOptions.map(option => (
                  <FilterChip
                    key={option}
                    label={option}
                    selected={marital === option}
                    onPress={() =>
                      setMarital(current => (current === option ? '' : option))
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          {filterSetup.extraSections.map(section => {
            const options = withAnyOption(section.options);

            return (
              <View key={section.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon
                    name="filter-variant"
                    size={fs(18)}
                    color={Colors.primary}
                  />
                  <Text style={styles.sectionTitle}>{section.label}</Text>
                </View>
                <View style={styles.chipRow}>
                  {options.map(option => (
                    <FilterChip
                      key={`${section.id}-${option}`}
                      label={option}
                      selected={(extraValues[section.id] || FILTER_ANY) === option}
                      onPress={() =>
                        setExtraValues(current => ({
                          ...current,
                          [section.id]: option,
                        }))
                      }
                    />
                  ))}
                </View>
              </View>
            );
          })}

          <FilterRangeSlider
            title={Strings.incomeRange}
            iconSource={Images.incomeIcon}
            min={filterSetup.bounds.incomeMin}
            max={filterSetup.bounds.incomeMax}
            lowValue={incomeMin}
            highValue={incomeMax}
            step={filterSetup.bounds.incomeStep}
            showControls={false}
            thumbVariant="outline"
            titleColor={Colors.black}
            minLabel={formatPkr(filterSetup.bounds.incomeMin)}
            centerLabel={`${formatPkr(incomeMin)} – ${formatPkr(incomeMax)}`}
            maxLabel={formatPkr(filterSetup.bounds.incomeMax)}
            onLowValueChange={setIncomeMin}
            onHighValueChange={setIncomeMax}
            onDragStart={() => setScrollEnabled(false)}
            onDragEnd={() => setScrollEnabled(true)}
          />
        </ScrollView>
      )}

      <View
        style={[
          styles.footer,
          { paddingBottom: getFooterBottomPadding(insets.bottom) },
        ]}
      >
        <PrimaryButton
          title={Strings.applyFilters}
          onPress={applyFilters}
          loading={loading}
          disabled={metaLoading}
          showArrow
          leftIcon="filter-variant"
        />
        <TouchableOpacity activeOpacity={0.85} onPress={handleClearAll}>
          <Text style={styles.clearAll}>{Strings.clearAll}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  metaLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('4%'),
  },
  section: {
    marginBottom: hp('2.2%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginBottom: hp('1.2%'),
  },
  sectionTitle: {
    fontSize: fs(14),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  sectionIconImage: {
    width: fs(18),
    height: fs(18),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.focusBorder,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: wp('3.5%'),
    height: AuthStyles.inputHeight,
    marginBottom: hp('1.2%'),
    gap: wp('2%'),
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
    paddingVertical: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
  },
  footer: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  clearAll: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
    marginTop: hp('1.2%'),
  },
});

export default FilterMatchesScreen;
