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
import { AxiosError } from 'axios';
import { Images } from '../../Assets';
import ScreenHeader from '../../Components/ScreenHeader';
import FilterChip from '../../Components/FilterChip';
import FilterRangeSlider from '../../Components/FilterRangeSlider';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  Api,
  ENDPOINTS,
  buildMatchFilterParams,
  FILTER_ANY,
  getApiErrorMessage,
  mapFilterSetup,
  mapMatchList,
  pickMatchListTotal,
  withAnyOption,
  type ApiErrorResponse,
  type FilterSetupData,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { SearchStackParamList } from '../../Navigation/SearchStackNavigator';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { fs, hp, wp } from '../../Functions/responsive';

type FilterNavigationProp = NativeStackNavigationProp<
  SearchStackParamList,
  'FilterMatches'
>;

const EMPTY_SETUP: FilterSetupData = {
  quickFilters: [],
  options: {
    cities: [],
    qualifications: [],
    professions: [],
    religions: [],
    maritalStatuses: [],
    incomeRanges: [],
  },
  defaults: {
    ageMin: 18,
    ageMax: 60,
    city: '',
    qualification: FILTER_ANY,
    profession: FILTER_ANY,
    religion: FILTER_ANY,
    maritalStatus: '',
    incomeRange: FILTER_ANY,
  },
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
    activeQuickFilters: Object.fromEntries(
      setup.quickFilters.map(filter => [filter.id, false]),
    ),
  };
};

const FilterMatchesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FilterNavigationProp>();

  const [filterSetup, setFilterSetup] = useState<FilterSetupData>(EMPTY_SETUP);
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState(FILTER_ANY);
  const [profession, setProfession] = useState(FILTER_ANY);
  const [religion, setReligion] = useState(FILTER_ANY);
  const [marital, setMarital] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(60);
  const [incomeRange, setIncomeRange] = useState(FILTER_ANY);
  const [activeQuickFilters, setActiveQuickFilters] = useState<
    Record<string, boolean>
  >({});
  const [metaLoading, setMetaLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchFilterMeta = useCallback(async () => {
    setMetaLoading(true);

    try {
      console.log('Match Filter Meta Request:', ENDPOINTS.MATCHES_FILTER);
      const res = await Api.getMatchFilter();

      if (res?.status == 200) {
        console.log('Match Filter Meta Success:', res?.data);
        const setup = mapFilterSetup(res?.data);
        const defaults = applyDefaults(setup);
        setFilterSetup(setup);
        setLocation(defaults.location);
        setCitySearch(defaults.citySearch);
        setEducation(defaults.education);
        setProfession(defaults.profession);
        setReligion(defaults.religion);
        setMarital(defaults.marital);
        setAgeMin(defaults.ageMin);
        setAgeMax(defaults.ageMax);
        setIncomeRange(defaults.incomeRange);
        setActiveQuickFilters(defaults.activeQuickFilters);
      } else {
        console.log('Match Filter Meta Failed:', res?.data);
        setFilterSetup(EMPTY_SETUP);
        Toast.show(
          res?.data?.message ?? 'Failed to load filter options',
          Toast.LONG,
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Match Filter Meta Error:', axiosError?.response?.data || error);
      setFilterSetup(EMPTY_SETUP);
      Toast.show(
        getApiErrorMessage(error, 'Failed to load filter options'),
        Toast.LONG,
      );
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFilterMeta();
    }, [fetchFilterMeta]),
  );

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
    setActiveQuickFilters(defaults.activeQuickFilters);
  };

  const handleClearAll = () => {
    setLocation('');
    setEducation(FILTER_ANY);
    setProfession(FILTER_ANY);
    setReligion(FILTER_ANY);
    setMarital('');
    setCitySearch('');
    setAgeMin(18);
    setAgeMax(60);
    setIncomeRange(FILTER_ANY);
    setActiveQuickFilters(
      Object.fromEntries(
        filterSetup.quickFilters.map(filter => [filter.id, false]),
      ),
    );
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
        incomeRange,
        activeQuickFilters,
      });

      console.log('Match Filter Request:', ENDPOINTS.MATCHES_FILTER, params);
      const res = await Api.getMatchFilter(params);

      if (res?.status == 200) {
        console.log('Match Filter Success:', res?.data);
        Toast.show(res?.data?.message ?? 'Filters applied', Toast.LONG);
        const matches = mapMatchList(res?.data);
        navigation.navigate('SearchMain', {
          filterMatches: matches,
          filterTotal: pickMatchListTotal(res?.data, matches.length),
          fromFilter: true,
        });
      } else {
        console.log('Match Filter Failed:', res?.data);
        Toast.show(
          res?.data?.message ?? 'Failed to apply filters',
          Toast.LONG,
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Match Filter Error:', axiosError?.response?.data || error);
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
    loading,
    location,
    marital,
    navigation,
    profession,
    religion,
  ]);

  const cityOptions = filterSetup.options.cities;
  const educationOptions = withAnyOption(filterSetup.options.qualifications);
  const professionOptions = withAnyOption(filterSetup.options.professions);
  const religionOptions = withAnyOption(filterSetup.options.religions);
  const maritalOptions = filterSetup.options.maritalStatuses;
  const incomeOptions = withAnyOption(filterSetup.options.incomeRanges);

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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
            min={18}
            max={60}
            lowValue={ageMin}
            highValue={ageMax}
            minLabel="18 yrs"
            centerLabel={`${ageMin} – ${ageMax} ${Strings.ageYears}`}
            maxLabel="60 yrs"
            onLowValueChange={setAgeMin}
            onHighValueChange={setAgeMax}
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
                onChangeText={setCitySearch}
              />
            </View>
            {cityOptions.length > 0 ? (
              <View style={styles.chipRow}>
                {cityOptions.map(city => (
                  <FilterChip
                    key={city}
                    label={city}
                    selected={location === city}
                    onPress={() => setLocation(city)}
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
                    onPress={() => setMarital(option)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {incomeOptions.length > 1 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="wallet-outline" size={fs(18)} color={Colors.primary} />
                <Text style={styles.sectionTitle}>{Strings.incomeRange}</Text>
              </View>
              <View style={styles.chipRow}>
                {incomeOptions.map(option => (
                  <FilterChip
                    key={option}
                    label={option}
                    selected={incomeRange === option}
                    onPress={() => setIncomeRange(option)}
                  />
                ))}
              </View>
            </View>
          ) : null}
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
    paddingBottom: hp('2%'),
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
