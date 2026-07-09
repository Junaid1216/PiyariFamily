import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontSizes } from '../Constant/AuthStyles';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { fs, hp, wp } from '../Functions/responsive';

type Props = {
  cooldownSeconds?: number;
  loading?: boolean;
  onResend?: () => void;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ResendCodeSection = ({
  cooldownSeconds = 45,
  loading = false,
  onResend,
}: Props) => {
  const [seconds, setSeconds] = useState(cooldownSeconds);
  const canResend = seconds === 0;

  useEffect(() => {
    setSeconds(cooldownSeconds);
  }, [cooldownSeconds]);

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
    if (!canResend || loading) {
      return;
    }
    onResend?.();
  };

  return (
    <View style={styles.container}>
      {!canResend && (
        <View style={styles.timerRow}>
          <Icon name="timer-outline" size={fs(16)} color={Colors.textLight} />
          <Text style={styles.timerText}>
            Resend code in {formatTime(seconds)}
          </Text>
        </View>
      )}
      <View style={styles.promptRow}>
        <Text style={styles.prompt}>Didn't receive it? </Text>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.gold} />
        ) : (
          <Text
            style={[styles.resendLink, !canResend && styles.resendDisabled]}
            onPress={handleResend}
            suppressHighlighting
          >
            Resend
          </Text>
        )}
      </View>
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
    marginBottom: hp('1%'),
  },
  timerText: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    marginLeft: wp('1.6%'),
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    fontSize: FontSizes.body,
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
