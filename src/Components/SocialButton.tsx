import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Images } from '../Assets';
import { Colors } from '../Constant/Colors';
import { AuthStyles } from '../Constant/AuthStyles';
import { Fonts } from '../Constant/Fonts';

type Provider = 'google' | 'apple';

type Props = {
  provider: Provider;
  title: string;
  onPress: () => void;
};

const SocialButton = ({ provider, title, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.88}>
      <View style={styles.iconWrap}>
        {provider === 'google' ? (
          <Image source={Images.googleIcon} style={styles.googleIcon} />
        ) : (
          <Icon name="apple" size={20} color={Colors.black} brand />
        )}
      </View>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: AuthStyles.buttonRadius,
    backgroundColor: Colors.socialButtonBg,
    height: AuthStyles.buttonHeight,
    marginBottom: 12,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: Fonts.medium,
  },
});

export default SocialButton;
