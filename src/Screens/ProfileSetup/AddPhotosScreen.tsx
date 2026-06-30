import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import BackButton from '../../Components/BackButton';
import PrimaryButton from '../../Components/PrimaryButton';
import SetupProgressBar from '../../Components/SetupProgressBar';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { PROFILE_PHOTO_SLOTS, PROFILE_SETUP_TOTAL_STEPS } from '../../Constant/ProfileSetup';
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

const createEmptyPhotos = () =>
  Array.from({ length: PROFILE_PHOTO_SLOTS }, () => null as string | null);

const AddPhotosScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<(string | null)[]>(createEmptyPhotos);

  const hasAtLeastOnePhoto = photos.some(photo => photo !== null);

  const handlePickPhoto = (index: number) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        const uri = response.assets?.[0]?.uri;
        if (!uri) {
          return;
        }

        setPhotos(prev => {
          const next = [...prev];
          next[index] = uri;
          return next;
        });
      },
    );
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleContinue = () => {
    if (!hasAtLeastOnePhoto) {
      Toast.show(Strings.addPhotoRequired);
      return;
    }
    navigation.navigate('ProfileReady');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BackButton variant="pink" onPress={() => navigation.goBack()} />

        <SetupProgressBar
          currentStep={6}
          totalSteps={PROFILE_SETUP_TOTAL_STEPS}
          label={Strings.profilePhotosStep}
        />

        <Text style={styles.title}>{Strings.addPhotosTitle}</Text>
        <Text style={styles.subtitle}>{Strings.addPhotosSubtitle}</Text>

        <View style={styles.photoGrid}>
          {photos.map((photo, index) => {
            const isMain = index === 0;

            if (photo) {
              return (
                <View key={index} style={styles.photoSlot}>
                  {isMain ? (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>
                        {Strings.mainPhoto}
                      </Text>
                    </View>
                  ) : null}
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    activeOpacity={0.85}
                    onPress={() => handleRemovePhoto(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close" size={fs(14)} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={index}
                style={[styles.photoSlot, styles.photoSlotEmpty]}
                activeOpacity={0.85}
                onPress={() => handlePickPhoto(index)}
              >
                {isMain ? (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>{Strings.mainPhoto}</Text>
                  </View>
                ) : null}
                <View style={styles.emptyContent}>
                  <Icon
                    name={isMain ? 'camera-outline' : 'plus'}
                    size={fs(isMain ? 22 : 20)}
                    color={Colors.focusBorder}
                  />
                  {!isMain ? (
                    <Text style={styles.addPhotoText}>{Strings.addPhoto}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.noticeBox}>
          <Icon
            name="shield-check-outline"
            size={fs(18)}
            color={Colors.primary}
            style={styles.noticeIcon}
          />
          <Text style={styles.noticeText}>{Strings.photosReviewNotice}</Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: getFooterBottomPadding(insets.bottom) },
        ]}
      >
        <PrimaryButton
          title={Strings.completeProfile}
          onPress={handleContinue}
          showArrow
          disabled={!hasAtLeastOnePhoto}
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
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('2%'),
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
    marginBottom: hp('2.5%'),
    lineHeight: hp('2.4%'),
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: wp('2%'),
    rowGap: hp('1.2%'),
    marginBottom: hp('2.2%'),
  },
  photoSlot: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: wp('3%'),
    overflow: 'hidden',
    backgroundColor: Colors.tabActiveBg,
    position: 'relative',
  },
  photoSlotEmpty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.focusBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    top: hp('0.5%'),
    left: wp('1%'),
    zIndex: 2,
    backgroundColor: Colors.primary,
    borderRadius: wp('1.5%'),
    paddingHorizontal: wp('1.5%'),
    paddingVertical: hp('0.2%'),
  },
  mainBadgeText: {
    fontSize: fs(8),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  removeBtn: {
    position: 'absolute',
    top: hp('0.5%'),
    right: wp('1%'),
    zIndex: 2,
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    backgroundColor: Colors.redish,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: hp('0.6%'),
  },
  addPhotoText: {
    fontSize: fs(9),
    fontFamily: Fonts.medium,
    color: Colors.focusBorder,
    textAlign: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: AuthStyles.inputRadius,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  noticeIcon: {
    marginRight: wp('2.5%'),
    marginTop: hp('0.2%'),
  },
  noticeText: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.primary,
    lineHeight: hp('2.2%'),
  },
  footer: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
});

export default AddPhotosScreen;
