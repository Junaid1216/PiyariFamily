import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';

type Props = {
  initialSeconds?: number;
  onResend?: () => void;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ResendCodeSection = ({ initialSeconds = 45, onResend }: Props) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const canResend = seconds === 0;

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleResend = () => {
    if (!canResend) {
      return;
    }
    setSeconds(initialSeconds);
    onResend?.();
  };

  return (
    <View style={styles.container}>
      {!canResend && (
        <View style={styles.timerRow}>
          <Icon name="timer-outline" size={16} color={Colors.textLight} />
          <Text style={styles.timerText}>
            Resend code in {formatTime(seconds)}
          </Text>
        </View>
      )}
      <Text style={styles.prompt}>
        Didn't receive it?{' '}
        <Text
          style={[styles.resendLink, !canResend && styles.resendDisabled]}
          onPress={handleResend}
          suppressHighlighting
        >
          Resend
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    marginLeft: 6,
  },
  prompt: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
  },
  resendLink: {
    color: Colors.gold,
    fontFamily: Fonts.semiBold,
  },
  resendDisabled: {
    opacity: 0.55,
  },
});

export default ResendCodeSection;
