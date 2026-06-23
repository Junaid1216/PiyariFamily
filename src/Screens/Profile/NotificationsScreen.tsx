import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../../Components/BackButton';
import { APP_NOTIFICATIONS } from '../../Constant/Notifications';
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

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#FFE5EC', '#FFF8FA', Colors.background]}
        style={styles.topGlow}
      />

      <View style={styles.header}>
        <BackButton variant="pink" compact onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{Strings.notificationsTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {APP_NOTIFICATIONS.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Icon name={item.icon} size={fs(18)} color={Colors.primary} />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.timeWrap}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  {item.unread ? <View style={styles.unreadDot} /> : null}
                </View>
              </View>

              <Text style={styles.cardDesc}>{item.description}</Text>

              {item.actionLabel ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.88}
                  onPress={() =>
                    navigateToProfileScreen(navigation, 'ChooseYourPlan')
                  }
                >
                  <Text style={styles.actionBtnText}>{item.actionLabel}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AuthStyles.horizontalPadding,
    marginBottom: hp('1.5%'),
    zIndex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.h3,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: AuthStyles.backButtonSize,
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
});

export default NotificationsScreen;
