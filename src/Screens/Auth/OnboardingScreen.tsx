import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthFooter from '../../Components/AuthFooter';
import OnboardingDots from '../../Components/OnboardingDots';
import OnboardingFeatureCard from '../../Components/OnboardingFeatureCard';
import PrimaryButton from '../../Components/PrimaryButton';
import { Images } from '../../Assets';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { hp, wp } from '../../Functions/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Feature = {
  iconName: string;
  label: string;
};

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  features: Feature[];
};

type Props = {
  navigation: {
    navigate: (screen: string) => void;
    replace: (screen: string) => void;
  };
};

const SLIDES: Slide[] = [
  {
    id: '1',
    title: Strings.onboardingTitle1,
    subtitle: Strings.onboardingSubtitle1,
    features: [
      { iconName: 'shield-check', label: Strings.onboardingVerified },
      { iconName: 'account-group-outline', label: Strings.onboardingMillions },
      { iconName: 'lock-outline', label: Strings.onboardingPrivate },
    ],
  },
  {
    id: '2',
    title: Strings.onboardingTitle2,
    subtitle: Strings.onboardingSubtitle2,
    features: [
      { iconName: 'heart-outline', label: Strings.onboardingMatches },
      { iconName: 'home-heart', label: Strings.onboardingFamilies },
      { iconName: 'handshake-outline', label: Strings.onboardingTrusted },
    ],
  },
  {
    id: '3',
    title: Strings.onboardingTitle3,
    subtitle: Strings.onboardingSubtitle3,
    features: [
      { iconName: 'account-plus-outline', label: Strings.onboardingEasySetup },
      { iconName: 'shield-lock-outline', label: Strings.onboardingSecure },
      { iconName: 'ring', label: Strings.onboardingForever },
    ],
  },
];

const OnboardingScreen = ({ navigation }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationWrapper}>
        <Image
          source={Images.onboardingIllustration}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>

      <OnboardingDots
        total={SLIDES.length}
        activeIndex={activeIndex}
        style={styles.dots}
      />

      <View style={styles.featuresRow}>
        {item.features.map(feature => (
          <OnboardingFeatureCard
            key={feature.label}
            iconName={feature.iconName}
            label={feature.label}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.bottomSection}>
        <PrimaryButton
          title={Strings.getStarted}
          onPress={() => navigation.replace('SignUp')}
          showArrow
          style={styles.button}
        />

        <AuthFooter
          prefix={Strings.alreadyHaveAccount}
          linkText={Strings.logInLink}
          onPress={() => navigation.replace('Login')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('0.5%'),
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: hp('1.75%'),
  },
  illustration: {
    width: wp('92%'),
    height: hp('36%'),
  },
  title: {
    fontSize: FontSizes.h2,
    color: Colors.primary,
    fontFamily: Fonts.bold,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: hp('1.25%'),
    paddingHorizontal: wp('1%'),
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: hp('2.6%'),
    paddingHorizontal: wp('2.5%'),
  },
  dots: {
    marginVertical: hp('2%'),
  },
  featuresRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: hp('0.5%'),
  },
  bottomSection: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: AuthStyles.bottomSectionPadding,
    paddingTop: hp('1%'),
  },
  button: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: AuthStyles.shadowOffsetY },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default OnboardingScreen;
