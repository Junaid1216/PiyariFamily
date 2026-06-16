import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Images } from '../../Assets';
import BackButton from '../../Components/BackButton';
import FilterChip from '../../Components/FilterChip';
import FilterRangeSlider from '../../Components/FilterRangeSlider';
import PrimaryButton from '../../Components/PrimaryButton';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { LikeStackParamList } from '../../Navigation/LikeStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  LikeStackParamList,
  'FilterMatches'
>;

const LOCATION_OPTIONS = ['Lahore', 'Multan', 'Karachi', 'Islamabad'];
const EDUCATION_OPTIONS = ['Any', 'High School', "Bachelor's", "Master's"];
const PROFESSION_OPTIONS = ['Any', 'IT/Tech', 'Doctor', 'Engineer', 'Teacher'];
const RELIGION_OPTIONS = ['Any', 'Muslim', 'Hindu', 'Christian', 'Sikh'];
const MARITAL_OPTIONS = ['Never Married', 'Divorced', 'Widowed'];

const FilterMatchesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [location, setLocation] = useState('Lahore');
  const [education, setEducation] = useState("Bachelor's");
  const [profession, setProfession] = useState('IT/Tech');
  const [religion, setReligion] = useState('Hindu');
  const [marital, setMarital] = useState('Never Married');
  const [citySearch, setCitySearch] = useState('');

  const handleReset = () => {
    setLocation('Lahore');
    setEducation("Bachelor's");
    setProfession('IT/Tech');
    setReligion('Hindu');
    setMarital('Never Married');
    setCitySearch('');
  };

  const handleClearAll = () => {
    setLocation('');
    setEducation('Any');
    setProfession('Any');
    setReligion('Any');
    setMarital('');
    setCitySearch('');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton variant="pink" compact onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{Strings.filterMatches}</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={handleReset}>
          <Text style={styles.resetText}>{Strings.reset}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <FilterRangeSlider
          label={`${Strings.ageRange}: 24 – 32 ${Strings.ageYears}`}
          min={18}
          max={50}
          lowValue={24}
          highValue={32}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="map-marker-outline" size={fs(18)} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{Strings.locationLabel}</Text>
          </View>
          <View style={styles.searchRow}>
            <Icon name="magnify" size={fs(18)} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder={Strings.cityOrState}
              placeholderTextColor={Colors.placeholder}
              value={citySearch}
              onChangeText={setCitySearch}
            />
          </View>
          <View style={styles.chipRow}>
            {LOCATION_OPTIONS.map(city => (
              <FilterChip
                key={city}
                label={city}
                selected={location === city}
                onPress={() => setLocation(city)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="school-outline" size={fs(18)} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{Strings.educationLabel}</Text>
          </View>
          <View style={styles.chipRow}>
            {EDUCATION_OPTIONS.map(option => (
              <FilterChip
                key={option}
                label={option}
                selected={education === option}
                onPress={() => setEducation(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="briefcase-outline" size={fs(18)} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{Strings.professionLabel}</Text>
          </View>
          <View style={styles.chipRow}>
            {PROFESSION_OPTIONS.map(option => (
              <FilterChip
                key={option}
                label={option}
                selected={profession === option}
                onPress={() => setProfession(option)}
              />
            ))}
          </View>
        </View>

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
            {RELIGION_OPTIONS.map(option => (
              <FilterChip
                key={option}
                label={option}
                selected={religion === option}
                onPress={() => setReligion(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="heart-outline" size={fs(18)} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{Strings.maritalStatusDetail}</Text>
          </View>
          <View style={styles.chipRow}>
            {MARITAL_OPTIONS.map(option => (
              <FilterChip
                key={option}
                label={option}
                selected={marital === option}
                onPress={() => setMarital(option)}
              />
            ))}
          </View>
        </View>

        <FilterRangeSlider
          label={`${Strings.incomeRange}: PKR 5000 – PKR 20000`}
          min={0}
          max={100000}
          lowValue={5000}
          highValue={20000}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, hp('1.5%')) },
        ]}
      >
        <PrimaryButton
          title={Strings.applyFilters}
          onPress={() => navigation.goBack()}
          showArrow
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
  resetText: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
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
    color: Colors.primary,
    marginTop: hp('1.2%'),
  },
});

export default FilterMatchesScreen;
