import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { Strings } from '../Constant/Strings';

type Props = {
  checked: boolean;
  onToggle: (value: boolean) => void;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
};

const TermsCheckbox = ({
  checked,
  onToggle,
  onTermsPress,
  onPrivacyPress,
}: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onToggle(!checked)}
        activeOpacity={0.8}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked && <Icon name="check" size={12} color={Colors.white} />}
        </View>
      </TouchableOpacity>
      <Text style={styles.text}>
        {Strings.termsPrefix}
        <Text style={styles.link} onPress={onTermsPress}>
          {Strings.termsOfService}
        </Text>
        {Strings.termsAnd}
        <Text style={styles.link} onPress={onPrivacyPress}>
          {Strings.privacyPolicy}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingRight: 8,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.checkboxBorder,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: Fonts.regular,
  },
  link: {
    color: Colors.gold,
    fontFamily: Fonts.semiBold,
  },
});

export default TermsCheckbox;
