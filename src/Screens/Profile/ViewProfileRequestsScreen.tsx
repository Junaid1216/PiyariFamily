import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import ScreenHeader from '../../Components/ScreenHeader';
import {
  Api,
  applyPhotoAccessStatus,
  getApiErrorMessage,
  isApiSuccess,
  mapPhotoAccessRequests,
  type ViewProfileRequest,
  type ViewProfileRequestStatus,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ViewProfileRequests'
>;

const STATUS_LABEL: Record<ViewProfileRequestStatus, string> = {
  pending: Strings.pendingStatus,
  accepted: Strings.acceptedStatus,
  declined: Strings.declinedStatus,
};

const getRequestPhotos = (request: ViewProfileRequest): ImageSourcePropType[] =>
  request.photos?.length
    ? request.photos
    : request.image
      ? [request.image]
      : [];

const ViewProfileRequestsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [requests, setRequests] = useState<ViewProfileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await Api.getPhotoAccessRequests();

      if (isApiSuccess(res?.status, res?.data?.success)) {
        setRequests(mapPhotoAccessRequests(res?.data));
      } else {
        const message =
          res?.data?.message ?? Strings.viewProfileRequestsError;
        setRequests([]);
        setError(message);
        Toast.show(message, Toast.LONG);
      }
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        Strings.viewProfileRequestsError,
      );
      setRequests([]);
      setError(message);
      Toast.show(message, Toast.LONG);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  const openProfileDetail = (request: ViewProfileRequest) => {
    if (!request.profileId) {
      return;
    }

    navigation.navigate('ProfileDetail', {
      profileId: request.profileId,
      name: request.name,
      age: request.age,
      location: request.location,
      image: request.image,
      isVerified: request.isVerified,
    });
  };

  const openGallery = (request: ViewProfileRequest) => {
    navigation.navigate('ViewProfileGallery', {
      name: request.name,
      photos: getRequestPhotos(request),
    });
  };

  const respondToRequest = async (
    request: ViewProfileRequest,
    action: 'approve' | 'reject',
  ) => {
    if (respondingId) {
      return;
    }

    setRespondingId(request.id);

    try {
      const res = await Api.respondToPhotoAccessRequest(request.id, action);

      if (isApiSuccess(res?.status, res?.data?.success)) {
        const nextStatus: ViewProfileRequestStatus =
          action === 'approve' ? 'accepted' : 'declined';
        const apiStatus = res?.data?.status;
        const mappedStatus =
          apiStatus === 'approved' || apiStatus === 'accepted'
            ? 'accepted'
            : apiStatus === 'rejected' || apiStatus === 'declined'
              ? 'declined'
              : nextStatus;

        setRequests(current =>
          applyPhotoAccessStatus(current, request.id, mappedStatus),
        );
        Toast.show(
          res?.data?.message ??
            (action === 'approve'
              ? `${Strings.requestAccepted}. ${Strings.photosUnlocked}`
              : Strings.requestRejected),
        );

        if (mappedStatus === 'accepted') {
          openGallery({ ...request, status: 'accepted' });
        }
      } else {
        Toast.show(
          res?.data?.message ?? Strings.viewProfileRequestsError,
          Toast.LONG,
        );
      }
    } catch (requestError) {
      Toast.show(
        getApiErrorMessage(requestError, Strings.viewProfileRequestsError),
        Toast.LONG,
      );
    } finally {
      setRespondingId(null);
    }
  };

  const handleAccept = (request: ViewProfileRequest) => {
    respondToRequest(request, 'approve');
  };

  const handleReject = (request: ViewProfileRequest) => {
    respondToRequest(request, 'reject');
  };

  const renderRequest = (request: ViewProfileRequest) => {
    const nameLabel =
      request.age !== undefined ? `${request.name}, ${request.age}` : request.name;
    const isAccepted = request.status === 'accepted';
    const isPending = request.status === 'pending';

    return (
      <View key={request.id} style={styles.requestCard}>
        <LinearGradient
          colors={[Colors.goldLight, Colors.gold, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardAccent}
        />

        <View style={styles.requestTop}>
          <View style={styles.avatarRing}>
            <Image
              source={request.image}
              style={styles.requestImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.requestInfo}>
            <View style={styles.requestNameRow}>
              <Text style={styles.requestName} numberOfLines={1}>
                {nameLabel}
              </Text>
              {request.isVerified ? (
                <View style={styles.verifiedBadge}>
                  <Icon name="shield-check" size={fs(10)} color={Colors.gold} />
                  <Text style={styles.verifiedText}>{Strings.verifiedLabel}</Text>
                </View>
              ) : null}
            </View>

            {request.location ? (
              <View style={styles.locationRow}>
                <Icon
                  name="map-marker-outline"
                  size={fs(13)}
                  color={Colors.gold}
                />
                <Text style={styles.locationText}>{request.location}</Text>
              </View>
            ) : null}

            <View
              style={[
                styles.statusBadge,
                isAccepted && styles.statusAccepted,
                request.status === 'declined' && styles.statusDeclined,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isAccepted && styles.statusAcceptedText,
                  request.status === 'declined' && styles.statusDeclinedText,
                ]}
              >
                {STATUS_LABEL[request.status]}
              </Text>
            </View>
          </View>

          <Text style={styles.timeText}>{request.requestedAt}</Text>
        </View>

        <TouchableOpacity
          style={styles.viewProfileBtn}
          activeOpacity={0.88}
          onPress={() => openProfileDetail(request)}
        >
          <Icon name="account-circle-outline" size={fs(16)} color={Colors.gold} />
          <Text style={styles.viewProfileText}>{Strings.viewProfile}</Text>
          <Icon name="arrow-right" size={fs(15)} color={Colors.gold} />
        </TouchableOpacity>

        {isAccepted ? (
          <TouchableOpacity
            style={styles.photosBtn}
            activeOpacity={0.88}
            onPress={() => openGallery(request)}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.photosBtnFill}
            >
              <Icon name="image-multiple-outline" size={fs(16)} color={Colors.white} />
              <Text style={styles.photosBtnText}>{Strings.viewPhotos}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : isPending ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              activeOpacity={0.88}
              onPress={() => handleReject(request)}
              disabled={Boolean(respondingId)}
            >
              {respondingId === request.id ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
              <Icon name="close" size={fs(16)} color={Colors.primary} />
              <Text style={styles.rejectText}>{Strings.reject}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              activeOpacity={0.88}
              onPress={() => handleAccept(request)}
              disabled={Boolean(respondingId)}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.acceptBtnFill}
              >
                {respondingId === request.id ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                <Icon name="check" size={fs(16)} color={Colors.white} />
                <Text style={styles.acceptText}>{Strings.accept}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#FFE5EC', '#FFF8FA', Colors.background]}
        style={styles.topGlow}
      />

      <ScreenHeader
        title={Strings.viewProfileRequests}
        onBack={() => navigation.goBack()}
        style={styles.screenHeader}
      />

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            activeOpacity={0.88}
            onPress={fetchRequests}
          >
            <Text style={styles.retryBtnText}>{Strings.tryAgain}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={[
            styles.scrollContent,
            requests.length === 0 && styles.emptyScrollContent,
          ]}
        >
          {requests.length > 0 ? (
            requests.map(renderRequest)
          ) : (
            <Text style={styles.emptyText}>
              {Strings.viewProfileRequestsEmpty}
            </Text>
          )}
        </ScrollView>
      )}
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: AuthStyles.horizontalPadding,
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('3%'),
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: wp('4.5%'),
    borderWidth: 1,
    borderColor: '#F3E6C8',
    padding: wp('3.8%'),
    marginBottom: hp('1.8%'),
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('0.45%'),
  },
  requestTop: {
    flexDirection: 'row',
    marginBottom: hp('1.4%'),
  },
  avatarRing: {
    padding: wp('0.6%'),
    borderRadius: wp('8%'),
    borderWidth: 1.5,
    borderColor: Colors.gold,
    marginRight: wp('3%'),
  },
  requestImage: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
  },
  requestInfo: {
    flex: 1,
  },
  requestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: wp('1.5%'),
    marginBottom: hp('0.4%'),
  },
  requestName: {
    fontSize: fs(15),
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('0.8%'),
    backgroundColor: '#FFF8E7',
    paddingHorizontal: wp('1.8%'),
    paddingVertical: hp('0.2%'),
    borderRadius: wp('2%'),
  },
  verifiedText: {
    fontSize: fs(9),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  timeText: {
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginLeft: wp('1%'),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    marginBottom: hp('0.7%'),
  },
  locationText: {
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.tabActiveBg,
    borderRadius: wp('2%'),
    paddingHorizontal: wp('2.4%'),
    paddingVertical: hp('0.28%'),
  },
  statusAccepted: {
    backgroundColor: '#E8F8EE',
  },
  statusDeclined: {
    backgroundColor: Colors.badgeVerified,
  },
  statusText: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  statusAcceptedText: {
    color: '#22C55E',
  },
  statusDeclinedText: {
    color: Colors.redish,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.5%'),
    height: hp('4.8%'),
    borderRadius: AuthStyles.inputRadius,
    borderWidth: 1.2,
    borderColor: Colors.gold,
    backgroundColor: '#FFFBF0',
    marginBottom: hp('1%'),
  },
  viewProfileText: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.gold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: wp('2.5%'),
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.2%'),
    height: hp('5%'),
    borderRadius: AuthStyles.inputRadius,
    borderWidth: 1.2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  rejectText: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  acceptBtn: {
    flex: 1,
    height: hp('5%'),
    borderRadius: AuthStyles.inputRadius,
    overflow: 'hidden',
  },
  acceptBtnFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.2%'),
  },
  acceptText: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  photosBtn: {
    height: hp('5%'),
    borderRadius: AuthStyles.inputRadius,
    overflow: 'hidden',
  },
  photosBtnFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.5%'),
  },
  photosBtnText: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  emptyText: {
    fontSize: FontSizes.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.7%'),
    marginTop: hp('1.2%'),
  },
  retryBtnText: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
});

export default ViewProfileRequestsScreen;
