import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CountryCode } from 'react-native-country-picker-modal';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import { AxiosError } from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  Api,
  ENDPOINTS,
  getApiErrorMessage,
  resolveProfileData,
  type ApiErrorResponse,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import {
  CountryOption,
  PROFILE_COUNTRIES,
} from '../../Constant/ProfileSetup';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { getFooterBottomPadding } from '../../Functions/safeArea';
import { fs, hp, wp } from '../../Functions/responsive';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

const getFlagEmoji = (countryCode: CountryCode) =>
  countryCode
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');

const CountrySeparator = () => <View style={styles.separator} />;

const SelectCountryScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<CountryCode>('PK');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return PROFILE_COUNTRIES;
    }

    return PROFILE_COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(query),
    );
  }, [search]);

  const selectedCountry = useMemo(
    () => PROFILE_COUNTRIES.find(country => country.code === selectedCode),
    [selectedCode],
  );

  useFocusEffect(
    useCallback(() => {
      const loadProfileCountry = async () => {
        try {
          console.log('Profile Country Prefill Request:', ENDPOINTS.PROFILE);
          const res = await Api.getProfile();

          if (res?.status == 200) {
            console.log('Profile Country Prefill Success:', res?.data);
            const profile = resolveProfileData(res?.data);

            if (profile.country) {
              const matchedCountry = PROFILE_COUNTRIES.find(
                country =>
                  country.name.toLowerCase() === profile.country?.toLowerCase(),
              );

              if (matchedCountry) {
                setSelectedCode(matchedCountry.code);
              }
            }

            if (profile.city) {
              setCity(profile.city);
            }

            if (profile.state) {
              setState(profile.state);
            }
          } else {
            console.log('Profile Country Prefill Failed:', res?.data);
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          console.log(
            'Profile Country Prefill Error:',
            axiosError?.response?.data || error,
          );
        }
      };

      loadProfileCountry();
    }, []),
  );

  const saveProfileCountry = useCallback(async () => {
    if (!selectedCountry || saving) {
      return;
    }

    setSaving(true);

    try {
      console.log('Profile Country Request:', ENDPOINTS.PROFILE_COUNTRY);
      const res = await Api.updateProfileCountry({
        country: selectedCountry.name,
        city: city.trim(),
        state: state.trim(),
      });

      if (res?.status == 200) {
        console.log('Profile Country Success:', res);
        navigation.navigate('BasicInfo');
      } else {
        console.log('Profile Country Failed:', res);
        Toast.show(res?.message ?? 'Failed to save country', Toast.LONG);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Profile Country Error:', axiosError?.response?.data || error);
      Toast.show(
        getApiErrorMessage(error, 'Failed to save country'),
        Toast.LONG,
      );
    } finally {
      setSaving(false);
    }
  }, [city, navigation, saving, selectedCountry, state]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <BackButton variant="pink" onPress={() => navigation.goBack()} />

        <Text style={styles.title}>{Strings.selectCountryTitle}</Text>
        <Text style={styles.subtitle}>{Strings.selectCountrySubtitle}</Text>

        <View style={styles.searchRow}>
          <Icon
            name="magnify"
            size={fs(20)}
            color={Colors.textLight}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={Strings.searchCountryPlaceholder}
            placeholderTextColor={Colors.placeholder}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={filteredCountries}
          keyExtractor={(item: CountryOption) => `${item.code}-${item.name}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={CountrySeparator}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No countries found</Text>
          }
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCode;

            return (
              <TouchableOpacity
                style={[
                  styles.countryRow,
                  isSelected && styles.countryRowSelected,
                ]}
                activeOpacity={0.85}
                onPress={() => setSelectedCode(item.code)}
              >
                <Text style={styles.countryFlag}>
                  {getFlagEmoji(item.code)}
                </Text>
                <Text
                  style={[
                    styles.countryName,
                    isSelected && styles.countryNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
                {isSelected ? (
                  <Icon name="check" size={fs(18)} color={Colors.gold} />
                ) : (
                  <Icon
                    name="chevron-right"
                    size={fs(22)}
                    color={Colors.iconMuted}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: getFooterBottomPadding(insets.bottom) },
        ]}
      >
        <PrimaryButton
          title={Strings.continueBtn}
          onPress={saveProfileCountry}
          loading={saving}
          disabled={!selectedCountry}
          showArrow
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    marginTop: wp('2%'),
    paddingHorizontal: AuthStyles.horizontalPadding,
  },
  title: {
    fontSize: FontSizes.h2,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: hp('0.6%'),
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginBottom: hp('2.2%'),
    lineHeight: hp('2.4%'),
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
    marginBottom: hp('2%'),
  },
  searchIcon: {
    marginRight: wp('2.5%'),
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: hp('1%'),
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    paddingVertical: hp('8%'),
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('2%'),
    borderRadius: wp('2.5%'),
  },
  countryRowSelected: {
    backgroundColor: Colors.tabActiveBg,
  },
  countryName: {
    flex: 1,
    marginLeft: wp('3.5%'),
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  countryFlag: {
    fontSize: fs(20),
    width: wp('7%'),
    textAlign: 'center',
  },
  countryNameSelected: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: wp('2%'),
  },
  footer: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
});

export default SelectCountryScreen;
