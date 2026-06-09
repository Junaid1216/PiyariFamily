import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';

type Props = {
  iconName: string;
  iconSize?: number;
};

const starPositions = [
  { top: 8, left: 24, size: 14 },
  { top: 20, right: 20, size: 10 },
  { top: 70, right: 8, size: 12 },
  { bottom: 30, left: 16, size: 10 },
  { bottom: 16, right: 28, size: 14 },
];

const AuthSuccessIllustration = ({
  iconName,
  iconSize = 36,
}: Props) => {
  return (
    <View style={styles.wrapper}>
      {starPositions.map((star, index) => (
        <Icon
          key={index}
          name="star-four-points"
          size={star.size}
          color={Colors.gold}
          style={[
            styles.star,
            {
              top: star.top,
              left: star.left,
              right: star.right,
              bottom: star.bottom,
            },
          ]}
        />
      ))}
      <View style={styles.circle}>
        <Icon name={iconName} size={iconSize} color={Colors.white} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
  },
});

export default AuthSuccessIllustration;
