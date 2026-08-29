import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  resolvePhotoAccessRespond,
  type PhotoAccessAction,
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

const ViewProfileRequestsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [requests, setRequests] = useState<ViewProfileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [respondingAction, setRespondingAction] =
    useState<PhotoAccessAction | null>(null);

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

  const openGallery = (request: ViewProfileRequest) => {
    const accessGranted = request.status === 'accepted';

    navigation.navigate('ViewProfileGallery', {
      userId: request.profileId || undefined,
      name: request.name ?? '',
      accessGranted,
    });
  };

  const respondToRequest = async (
    request: ViewProfileRequest,
    action: PhotoAccessAction,
  ) => {
    if (respondingId) {
      return;
    }

    setRespondingId(request.id);
    setRespondingAction(action);

    try {
      const res = await Api.respondToPhotoAccessRequest(request.id, action);

      if (isApiSuccess(res?.status, res?.data?.success)) {
        const resolved = resolvePhotoAccessRespond(res?.data);
        const backendMessage =
          resolved.message ||
          (typeof res?.data?.message === 'string' ? res.data.message.trim() : '');
        if (backendMessage) {
          Toast.show(backendMessage, Toast.LONG);
        }

        const mappedStatus: ViewProfileRequestStatus =
          resolved.status ?? (action === 'approve' ? 'accepted' : 'declined');
        const targetId = resolved.requestId || request.id;

        setRequests(current =>
          applyPhotoAccessStatus(
            current,
            targetId,
            mappedStatus,
            res?.data?.status,
            resolved.request,
          ),
        );
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
      setRespondingAction(null);
    }
  };

  const handleAccept = (request: ViewProfileRequest) => {
    respondToRequest(request, 'approve');
  };

  const handleReject = (request: ViewProfileRequest) => {
    respondToRequest(request, 'reject');
  };

  const renderRequest = (request: ViewProfileRequest) => {
    const name = request.name?.trim();
    const nameLabel = name
      ? request.age != null
        ? `${name}, ${request.age}`
        : name
      : request.age != null
        ? String(request.age)
        : '';
    const isAccepted = request.status === 'accepted';
    const isDeclined = request.status === 'declined';

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
              {nameLabel ? (
                <Text style={styles.requestName} numberOfLines={1}>
                  {nameLabel}
                </Text>
              ) : null}
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
                {request.statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.timeText}>{request.requestedAt}</Text>
        </View>

        <TouchableOpacity
          style={styles.photosBtn}
          activeOpacity={0.88}
          onPress={() => openGallery(request)}
        >
          <LinearGradient
            colors={
              isAccepted
                ? [Colors.primary, Colors.primaryDark]
                : ['#8A5A66', '#6E414B']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.photosBtnFill}
          >
            <Icon
              name={isAccepted ? 'image-multiple-outline' : 'lock-outline'}
              size={fs(16)}
              color={Colors.white}
            />
            <Text style={styles.photosBtnText}>{Strings.viewPhotos}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.rejectBtn,
              isDeclined && styles.rejectBtnDeclined,
            ]}
            activeOpacity={0.88}
            onPress={() => handleReject(request)}
            disabled={Boolean(respondingId)}
          >
            {respondingId === request.id && respondingAction === 'reject' ? (
              <ActivityIndicator
                size="small"
                color={isDeclined ? Colors.white : Colors.primary}
              />
            ) : (
              <>
                <Icon
                  name="close"
                  size={fs(16)}
                  color={isDeclined ? Colors.white : Colors.primary}
                />
                <Text
                  style={[
                    styles.rejectText,
                    isDeclined && styles.rejectTextDeclined,
                  ]}
                >
                  {Strings.rejectedButton}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptBtn,
              isDeclined && styles.acceptBtnIdle,
            ]}
            activeOpacity={0.88}
            onPress={() => handleAccept(request)}
            disabled={Boolean(respondingId)}
          >
            {isDeclined ? (
              respondingId === request.id && respondingAction === 'approve' ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Icon name="check" size={fs(16)} color={Colors.primary} />
                  <Text style={styles.acceptTextIdle}>
                    {Strings.acceptedButton}
                  </Text>
                </>
              )
            ) : (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.acceptBtnFill}
              >
                {respondingId === request.id &&
                respondingAction === 'approve' ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Icon name="check" size={fs(16)} color={Colors.white} />
                    <Text style={styles.acceptText}>
                      {Strings.acceptedButton}
                    </Text>
                  </>
                )}
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
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
  rejectBtnDeclined: {
    backgroundColor: Colors.redish,
    borderColor: Colors.redish,
  },
  rejectText: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  rejectTextDeclined: {
    color: Colors.white,
  },
  acceptBtn: {
    flex: 1,
    height: hp('5%'),
    borderRadius: AuthStyles.inputRadius,
    overflow: 'hidden',
  },
  acceptBtnIdle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('1.2%'),
    backgroundColor: Colors.white,
    borderWidth: 1.2,
    borderColor: Colors.primary,
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
  acceptTextIdle: {
    fontSize: fs(13),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  photosBtn: {
    height: hp('5%'),
    borderRadius: AuthStyles.inputRadius,
    overflow: 'hidden',
    marginBottom: hp('1%'),
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
