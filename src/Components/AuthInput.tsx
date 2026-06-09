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
import { Colors } from '../Constant/Colors';
import { AuthStyles } from '../Constant/AuthStyles';
import { Fonts } from '../Constant/Fonts';
import { wp } from '../Functions/responsive';

type Props = TextInputProps & {
  label: string;
  iconName: string;
  showToggle?: boolean;
};

const AuthInput = ({
  label,
  iconName,
  showToggle = false,
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
          size={20}
          color={Colors.primary}
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
              size={20}
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
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: Colors.label,
    marginBottom: 8,
    fontFamily: Fonts.medium,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 14,
    height: AuthStyles.inputHeight,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontFamily: Fonts.regular,
    paddingVertical: 0,
    height: '100%',
  },
  eyeBtn: {
    paddingLeft: 8,
  },
});

export default AuthInput;
