import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../Components/ScreenHeader';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { useSecurePhotoScreen } from '../../Functions/useSecurePhotoScreen';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ViewProfileGallery'
>;
type GalleryRoute = RouteProp<ProfileStackParamList, 'ViewProfileGallery'>;

const PHOTO_SIZE = (wp('100%') - AuthStyles.horizontalPadding * 2 - wp('3%')) / 2;

const ProtectedPhoto = ({
  source,
  style,
  resizeMode,
}: {
  source: ImageSourcePropType;
  style: object;
  resizeMode: 'cover' | 'contain';
}) => (
  <View style={[styles.protectedWrap, style]} collapsable={false}>
    <Image
      source={source}
      style={StyleSheet.absoluteFill}
      resizeMode={resizeMode}
      pointerEvents="none"
      accessible={false}
    />
    <Pressable
      style={StyleSheet.absoluteFill}
      onLongPress={() => undefined}
      delayLongPress={10000}
    />
  </View>
);

const ViewProfileGalleryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GalleryRoute>();
  const { name, photos } = route.params;
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const { isRecording } = useSecurePhotoScreen();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#FFE5EC', '#FFF8FA', Colors.background]}
        style={styles.topGlow}
      />

      <ScreenHeader
        title={Strings.photoGallery}
        subtitle={name}
        subtitleLayout="below"
        onBack={() => navigation.goBack()}
        style={styles.screenHeader}
      />

      <View style={styles.privacyBanner}>
        <Icon name="shield-lock-outline" size={fs(16)} color={Colors.primary} />
        <Text style={styles.privacyText}>{Strings.photoPrivacyNotice}</Text>
      </View>

      {photos.length === 0 ? (
        <View style={styles.centerContent}>
          <Icon name="image-off-outline" size={fs(36)} color={Colors.gold} />
          <Text style={styles.emptyText}>{Strings.noPhotosYet}</Text>
        </View>
      ) : isRecording ? (
        <View style={styles.centerContent}>
          <Icon name="eye-off-outline" size={fs(36)} color={Colors.primary} />
          <Text style={styles.emptyText}>
            {Strings.photosHiddenWhileRecording}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={`${name}-photo-${index}`}
                style={styles.photoCard}
                activeOpacity={0.9}
                onPress={() => setActivePhoto(index)}
                delayLongPress={10000}
                onLongPress={() => undefined}
              >
                <ProtectedPhoto
                  source={photo}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(107, 4, 29, 0.35)']}
                  style={styles.photoOverlay}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={activePhoto !== null && !isRecording}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePhoto(null)}
      >
        <Pressable
          style={styles.lightbox}
          onPress={() => setActivePhoto(null)}
          onLongPress={() => undefined}
        >
          {activePhoto !== null ? (
            <ProtectedPhoto
              source={photos[activePhoto]}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          ) : null}
          <TouchableOpacity
            style={styles.lightboxClose}
            activeOpacity={0.85}
            onPress={() => setActivePhoto(null)}
          >
            <Icon name="close" size={fs(20)} color={Colors.white} />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('16%'),
  },
  screenHeader: {
    zIndex: 1,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: AuthStyles.horizontalPadding,
    marginBottom: hp('1.6%'),
    paddingHorizontal: wp('3.2%'),
    paddingVertical: hp('1.1%'),
    borderRadius: wp('3%'),
    backgroundColor: Colors.notificationBg,
    borderWidth: 1,
    borderColor: Colors.goldLight,
    gap: wp('2%'),
  },
  privacyText: {
    flex: 1,
    fontSize: FontSizes.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.primary,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: AuthStyles.horizontalPadding,
    gap: hp('1%'),
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('3%'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: wp('3%'),
  },
  photoCard: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 1.15,
    borderRadius: wp('4%'),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.goldLight,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  protectedWrap: {
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: FontSizes.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    textAlign: 'center',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    width: wp('92%'),
    height: hp('70%'),
  },
  lightboxClose: {
    position: 'absolute',
    top: hp('7%'),
    right: wp('6%'),
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ViewProfileGalleryScreen;
