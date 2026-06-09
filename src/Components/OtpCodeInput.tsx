import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { Colors } from '../Constant/Colors';
import { AuthStyles } from '../Constant/AuthStyles';
import { Fonts } from '../Constant/Fonts';

const CELL_COUNT = 6;

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

const OtpCodeInput = ({ value, onChangeText }: Props) => {
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChangeText,
  });

  return (
    <CodeField
      ref={ref}
      {...props}
      value={value}
      onChangeText={onChangeText}
      cellCount={CELL_COUNT}
      rootStyle={styles.codeFieldRoot}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={({ index, symbol, isFocused }) => (
        <View
          key={index}
          style={[styles.cell, isFocused && styles.focusCell]}
          onLayout={getCellOnLayoutHandler(index)}>
          <Text style={styles.cellText}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  codeFieldRoot: {
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  cell: {
    width: 46,
    height: 52,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusCell: {
    borderColor: Colors.focusBorder,
    borderWidth: 1.5,
  },
  cellText: {
    fontSize: 22,
    color: Colors.primary,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
  },
});

export default OtpCodeInput;
