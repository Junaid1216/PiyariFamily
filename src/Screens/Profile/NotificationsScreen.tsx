import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
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
  applyNotificationRead,
  getApiErrorMessage,
  isApiSuccess,
  isViewProfileRequestNotification,
  mapNotifications,
  mapPhotoAccessRequests,
  pickPendingPhotoAccessCount,
  type AppNotification,
} from '../../API';
import { AuthStyles, FontSizes } from '../../Constant/AuthStyles';
import { Colors } from '../../Constant/Colors';
import { Fonts } from '../../Constant/Fonts';
import { Strings } from '../../Constant/Strings';
import { ProfileStackParamList } from '../../Navigation/ProfileStackNavigator';
import { navigateToProfileScreen } from '../../Functions/profileNavigation';
import { fs, hp, wp } from '../../Functions/responsive';

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Notifications'
>;

const NotificationsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [pendingViewProfileCount, setPendingViewProfileCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const bellRef = useRef<View>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await Api.getNotifications();

      if (isApiSuccess(res?.status, res?.data?.success)) {
        setNotifications(
          mapNotifications(res?.data).filter(
            item => !isViewProfileRequestNotification(item),
          ),
        );
      } else {
        const message = res?.data?.message ?? Strings.notificationsError;
        setError(message);
        Toast.show(message, Toast.LONG);
        setNotifications(current => (current.length > 0 ? current : []));
      }
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        Strings.notificationsError,
      );
      setError(message);
      Toast.show(message, Toast.LONG);
      setNotifications(current => (current.length > 0 ? current : []));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingPhotoAccessCount = useCallback(async () => {
    try {
      const res = await Api.getPhotoAccessRequests();

      if (isApiSuccess(res?.status, res?.data?.success)) {
        setPendingViewProfileCount(
          pickPendingPhotoAccessCount(mapPhotoAccessRequests(res?.data)),
        );
      }
    } catch {
      setPendingViewProfileCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      fetchPendingPhotoAccessCount();
      return () => setMenuOpen(false);
    }, [fetchNotifications, fetchPendingPhotoAccessCount]),
  );

  const markAsRead = async (item: AppNotification) => {
    if (!item.unread || readingId || markingAll || clearing) {
      return;
    }

    setReadingId(item.id);

    try {
      const res = await Api.markNotificationRead(item.id);

      if (isApiSuccess(res?.status, res?.success)) {
        setNotifications(current => applyNotificationRead(current, item.id));
      } else {
        Toast.show(res?.message ?? Strings.notificationsError, Toast.LONG);
      }
    } catch (requestError) {
      Toast.show(
        getApiErrorMessage(requestError, Strings.notificationsError),
        Toast.LONG,
      );
    } finally {
      setReadingId(null);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const openMenu = () => {
    if (markingAll || clearing) {
      return;
    }

    const menuWidth = wp('42%');
    bellRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPos({
        top: y + height + hp('0.35%'),
        left: Math.max(wp('4%'), x + width - menuWidth),
        width: menuWidth,
      });
      setMenuOpen(true);
    });
  };

  const handleMarkAllRead = async () => {
    closeMenu();
    if (markingAll || clearing || !notifications.some(item => item.unread)) {
      return;
    }

    setMarkingAll(true);

    try {
      const res = await Api.markAllNotificationsRead();

      if (isApiSuccess(res?.status, res?.success)) {
        setNotifications(current =>
          current.map(item => ({ ...item, unread: false })),
        );
        if (res?.message) {
          Toast.show(res.message, Toast.LONG);
        }
      } else {
        Toast.show(res?.message ?? Strings.notificationsError, Toast.LONG);
      }
    } catch (requestError) {
      Toast.show(
        getApiErrorMessage(requestError, Strings.notificationsError),
        Toast.LONG,
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClearAll = async () => {
    closeMenu();
    if (clearing || markingAll || notifications.length === 0) {
      return;
    }

    setClearing(true);

    try {
      const res = await Api.clearAllNotifications();

      if (isApiSuccess(res?.status, res?.success)) {
        setNotifications([]);
        if (res?.message) {
          Toast.show(res.message, Toast.LONG);
        }
      } else {
        Toast.show(res?.message ?? Strings.notificationsError, Toast.LONG);
      }
    } catch (requestError) {
      Toast.show(
        getApiErrorMessage(requestError, Strings.notificationsError),
        Toast.LONG,
      );
    } finally {
      setClearing(false);
    }
  };

  const handleActionPress = (item: AppNotification) => {
    markAsRead(item);
    navigateToProfileScreen(navigation, 'ChooseYourPlan');
  };

  const hasUnread = notifications.some(item => item.unread);
  const showListLoader = loading && notifications.length === 0 && !error;

  const renderNotification = (item: AppNotification) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => markAsRead(item)}
    >
      <View style={styles.iconWrap}>
        <Icon name={item.icon} size={fs(18)} color={Colors.primary} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.timeWrap}>
            {item.time ? <Text style={styles.timeText}>{item.time}</Text> : null}
            {item.count ? (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{item.count}</Text>
              </View>
            ) : null}
            {item.unread ? <View style={styles.unreadDot} /> : null}
          </View>
        </View>

        <Text style={styles.cardDesc}>{item.description}</Text>

        {item.actionLabel ? (
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.88}
            onPress={() => handleActionPress(item)}
          >
            <Text style={styles.actionBtnText}>{item.actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#FFE5EC', '#FFF8FA', Colors.background]}
        style={styles.topGlow}
      />

      <ScreenHeader
        title={Strings.notificationsTitle}
        onBack={() => navigation.goBack()}
        style={styles.screenHeader}
        rightElement={
          <View ref={bellRef} collapsable={false} style={styles.bellWrap}>
            <TouchableOpacity
              style={styles.notificationBtn}
              activeOpacity={0.8}
              disabled={markingAll || clearing}
              onPress={openMenu}
            >
              <Icon name="bell-outline" size={fs(20)} color={Colors.primary} />
              {hasUnread ? <View style={styles.notificationDot} /> : null}
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('ViewProfileRequests')}
        >
          <View style={styles.iconWrap}>
            <Icon name="account-eye-outline" size={fs(18)} color={Colors.primary} />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>{Strings.viewProfileRequests}</Text>
              <View style={styles.timeWrap}>
                {pendingViewProfileCount > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {pendingViewProfileCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={styles.cardDesc}>
              {Strings.viewProfileRequestsDesc}
            </Text>
          </View>
        </TouchableOpacity>

        {showListLoader ? (
          <View style={styles.listState}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error && notifications.length === 0 ? (
          <View style={styles.listState}>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              activeOpacity={0.88}
              onPress={fetchNotifications}
            >
              <Text style={styles.retryBtnText}>{Strings.tryAgain}</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          <Text style={styles.emptyText}>{Strings.notificationsEmpty}</Text>
        )}
      </ScrollView>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.menuBackdrop} onPress={closeMenu}>
          <Pressable
            style={[
              styles.menu,
              {
                top: menuPos.top,
                left: menuPos.left,
                width: menuPos.width,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuOption}
              activeOpacity={0.85}
              onPress={handleMarkAllRead}
            >
              <Text style={styles.menuOptionText}>{Strings.markAllRead}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuOption, styles.menuOptionLast]}
              activeOpacity={0.85}
              onPress={handleClearAll}
            >
              <Text style={styles.menuOptionText}>{Strings.clearAll}</Text>
            </TouchableOpacity>
          </Pressable>
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
  bellWrap: {
    marginRight: -wp('3.5%'),
  },
  notificationBtn: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: Colors.notificationBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: hp('1.2%'),
    right: wp('2.8%'),
    width: wp('2.2%'),
    height: wp('2.2%'),
    borderRadius: wp('1.1%'),
    backgroundColor: Colors.redish,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  menuBackdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    borderWidth: 1.2,
    borderColor: Colors.dividerPink,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  menuOption: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.4%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerPink,
  },
  menuOptionLast: {
    borderBottomWidth: 0,
  },
  menuOptionText: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: AuthStyles.horizontalPadding,
    paddingBottom: hp('3%'),
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: wp('3.5%'),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: wp('3.5%'),
    marginBottom: hp('1.2%'),
  },
  iconWrap: {
    width: wp('10.5%'),
    height: wp('10.5%'),
    borderRadius: wp('5.25%'),
    backgroundColor: Colors.tabActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: hp('0.35%'),
  },
  cardTitle: {
    flex: 1,
    fontSize: fs(14),
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
    marginRight: wp('2%'),
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
  },
  timeText: {
    fontSize: fs(11),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  unreadDot: {
    width: wp('1.8%'),
    height: wp('1.8%'),
    borderRadius: wp('0.9%'),
    backgroundColor: Colors.primary,
  },
  countBadge: {
    minWidth: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('1.2%'),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: fs(10),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  cardDesc: {
    fontSize: fs(12),
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    lineHeight: hp('1.9%'),
  },
  actionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.7%'),
    marginTop: hp('1%'),
  },
  actionBtnText: {
    fontSize: fs(11),
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  listState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('4%'),
  },
  emptyText: {
    fontSize: FontSizes.bodySmall,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: hp('2%'),
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

export default NotificationsScreen;
