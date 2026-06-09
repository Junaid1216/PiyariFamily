import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';

type Props = {
  iconName: string;
  iconSize?: number;
};

const AuthIconBadge = ({ iconName, iconSize = 34 }: Props) => {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[Colors.goldLight, Colors.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.badge}>
        <Icon name={iconName} size={iconSize} color={Colors.white} />
      </LinearGradient>
      <View style={styles.starBadge}>
        <Icon name="star-four-points" size={9} color={Colors.white} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});

export default AuthIconBadge;
