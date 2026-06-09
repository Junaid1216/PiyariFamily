import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthStyles, FontSizes } from '../Constant/AuthStyles';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { fs, hp, wp } from '../Functions/responsive';

type Props = TextInputProps & {
  label: string;
  iconName: string;
  showToggle?: boolean;
  iconColor?: string;
};

const AuthInput = ({
  label,
  iconName,
  showToggle = false,
  iconColor = Colors.primary,
  secureTextEntry,
  ...rest
}: Props) => {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Icon
          name={iconName}
          size={fs(20)}
          color={iconColor}
          style={styles.leftIcon}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={showToggle ? hidden : secureTextEntry}
          {...rest}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={() => setHidden(prev => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.eyeBtn}>
            <Icon
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={fs(20)}
              color={Colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: hp('2.2%'),
  },
  label: {
    fontSize: FontSizes.body,
    color: Colors.label,
    marginBottom: hp('1%'),
    fontFamily: Fonts.medium,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: wp('3.7%'),
    height: AuthStyles.inputHeight,
  },
  leftIcon: {
    marginRight: wp('2.7%'),
  },
  input: {
    flex: 1,
    fontSize: FontSizes.bodyLarge,
    color: Colors.text,
    fontFamily: Fonts.regular,
    paddingVertical: 0,
    height: '100%',
  },
  eyeBtn: {
    paddingLeft: wp('2%'),
  },
});

export default AuthInput;
