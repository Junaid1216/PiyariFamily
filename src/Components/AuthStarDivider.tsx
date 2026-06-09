import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';

type Props = {
  icon?: 'star' | 'heart';
  width?: ViewStyle['width'];
  style?: ViewStyle;
  starImage?: ImageSourcePropType;
  heartImage?: ImageSourcePropType;
};

const AuthStarDivider = ({
  icon = 'star',
  width,
  style,
  starImage,
  heartImage,
}: Props) => {
  const isCompact = width != null;

  return (
    <View
      style={[
        styles.container,
        isCompact && styles.containerCompact,
        width != null && { width },
        style,
      ]}>
      <View style={styles.line} />
      {icon === 'heart' ? (
        heartImage ? (
          <Image
            source={heartImage}
            style={styles.heartImage}
            resizeMode="contain"
          />
        ) : (
          <Icon name="heart" size={12} color={Colors.gold} style={styles.icon} />
        )
      ) : starImage ? (
        <Image source={starImage} style={styles.starImage} resizeMode="contain" />
      ) : (
        <Icon
          name="star-four-points"
          size={10}
          color={Colors.gold}
          style={styles.icon}
        />
      )}
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    marginVertical: 22,
  },
  containerCompact: {
    alignSelf: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.6,
  },
  icon: {
    marginHorizontal: 10,
  },
  starImage: {
    width: 14,
    height: 14,
    marginHorizontal: 10,
  },
  heartImage: {
    width: 16,
    height: 16,
    marginHorizontal: 10,
  },
});

export default AuthStarDivider;
