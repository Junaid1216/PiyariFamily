import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthStyles, FontSizes } from '../Constant/AuthStyles';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { fs, hp, wp } from '../Functions/responsive';

type Props = {
  label?: string;
  iconName?: string;
  iconSource?: ImageSourcePropType;
  iconImageSize?: number;
  iconText?: string;
  placeholder: string;
  value: string;
  options: readonly string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  style?: ViewStyle;
};

const SetupDropdown = ({
  label,
  iconName,
  iconSource,
  iconImageSize = fs(15),
  iconText,
  placeholder,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  style,
}: Props) => {
  return (
    <View style={style}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TouchableOpacity
        style={styles.dropdownRow}
        activeOpacity={0.85}
        onPress={onToggle}
      >
        {iconSource ? (
          <Image
            source={iconSource}
            style={[
              styles.dropdownIcon,
              styles.iconImage,
              { width: iconImageSize, height: iconImageSize } as ImageStyle,
            ]}
            resizeMode="contain"
          />
        ) : iconText ? (
          <Text style={[styles.dropdownIcon, styles.iconText]}>{iconText}</Text>
        ) : (
          <Icon
            name={iconName!}
            size={fs(20)}
            color={Colors.primary}
            style={styles.dropdownIcon}
          />
        )}
        <Text
          style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}
        >
          {value || placeholder}
        </Text>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={fs(22)}
          color={Colors.iconMuted}
        />
      </TouchableOpacity>
      {isOpen ? (
        <View style={styles.dropdownMenu}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.dropdownScroll}
          >
            {options.map(option => {
              const isSelected = value === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownOption,
                    isSelected && styles.dropdownOptionSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => onSelect(option)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {isSelected ? (
                    <Icon name="check" size={fs(18)} color={Colors.gold} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: FontSizes.body,
    color: Colors.label,
    marginBottom: AuthStyles.fieldLabelGap,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
    lineHeight: FontSizes.body + 2,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.dividerPink,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: wp('3.7%'),
    height: AuthStyles.inputHeight,
    marginBottom: hp('0.5%'),
  },
  dropdownIcon: {
    marginRight: wp('2.5%'),
  },
  iconImage: {
    width: fs(15),
    height: fs(15),
  },
  iconText: {
    fontSize: fs(22),
    fontFamily: Fonts.bold,
    color: Colors.primary,
    lineHeight: fs(22),
    transform: [{ rotate: '12deg' }],
  },
  dropdownText: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  dropdownPlaceholder: {
    color: Colors.placeholder,
  },
  dropdownMenu: {
    borderWidth: 1.2,
    borderColor: Colors.dividerPink,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    marginBottom: hp('1%'),
  },
  dropdownScroll: {
    maxHeight: hp('28%'),
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.4%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerPink,
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.inputBg,
  },
  dropdownOptionText: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  dropdownOptionTextSelected: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});

export default SetupDropdown;
