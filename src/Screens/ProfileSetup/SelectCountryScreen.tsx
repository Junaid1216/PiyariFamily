import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { CountryOption } from '../../Constant/ProfileSetup';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { AxiosError } from 'axios';
import {
  Api,
  ENDPOINTS,
  mapCountries,
} from '../../API';
import type { ApiErrorResponse } from '../../API';
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
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCode, setSelectedCode] = useState<CountryCode>('PK');
  const [loading, setLoading] = useState(true);

  const fetchCountries = useCallback(async () => {
    setLoading(true);

    try {
      console.log('Countries Request:', ENDPOINTS.COUNTRIES);
      const res = await Api.getCountries();
      console.log('Countries Response:', JSON.stringify(res?.data, null, 2));

      if (res?.status == 200) {
        const mappedCountries = await mapCountries(res?.data?.data);
        console.log(
          'Countries Success:',
          JSON.stringify(mappedCountries, null, 2),
        );

        if (mappedCountries.length > 0) {
          setCountries(mappedCountries);

          if (!mappedCountries.some(country => country.code === 'PK')) {
            setSelectedCode(mappedCountries[0].code);
          }
        } else {
          setCountries([]);
        }
      } else {
        Toast.show(res?.data?.message ?? 'Failed to load countries', Toast.LONG);
        setCountries([]);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.log('Countries API Error:', {
        status: axiosError?.response?.status,
        url: ENDPOINTS.COUNTRIES,
        data: axiosError?.response?.data || error,
      });
      Toast.show(
        axiosError?.response?.data?.message ?? 'Failed to load countries',
        Toast.LONG,
      );
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return countries;
    }
    return countries.filter(country =>
      country.name.toLowerCase().includes(query),
    );
  }, [countries, search]);

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredCountries}
            keyExtractor={item => `${item.code}-${item.name}`}
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
        )}
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: getFooterBottomPadding(insets.bottom) },
        ]}
      >
        <PrimaryButton
          title={Strings.continueBtn}
          onPress={() => navigation.navigate('BasicInfo')}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('8%'),
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
