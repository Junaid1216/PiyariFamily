import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthStyles, FontSizes } from '../Constant/AuthStyles';
import { Colors } from '../Constant/Colors';
import { Fonts } from '../Constant/Fonts';
import { fs, hp, wp } from '../Functions/responsive';

export const DROPDOWN_MAX_HEIGHT = hp('28%');
const INPUT_BORDER_WIDTH = 1.2;
const OPTION_ROW_HEIGHT = hp('1.4%') * 2 + FontSizes.body + 8;
const MENU_GAP = hp('0.35%');

export type DropdownPortalEntry = {
  x: number;
  y: number;
  width: number;
  options: readonly string[];
  selectedValues: readonly string[];
  closeOnSelect?: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
};

type DropdownPortalContextValue = {
  openDropdown: (entry: DropdownPortalEntry) => void;
  closeDropdown: () => void;
  entry: DropdownPortalEntry | null;
};

const DropdownPortalContext =
  createContext<DropdownPortalContextValue | null>(null);

export const useDropdownPortal = () => {
  const ctx = useContext(DropdownPortalContext);
  if (!ctx) {
    throw new Error(
      'useDropdownPortal must be used within DropdownPortalProvider',
    );
  }
  return ctx;
};

type ProviderProps = {
  children: React.ReactNode;
};

export const DropdownPortalProvider = ({ children }: ProviderProps) => {
  const [entry, setEntry] = useState<DropdownPortalEntry | null>(null);

  const openDropdown = useCallback((next: DropdownPortalEntry) => {
    setEntry(next);
  }, []);

  const closeDropdown = useCallback(() => {
    setEntry(null);
  }, []);

  const value = useMemo(
    () => ({ openDropdown, closeDropdown, entry }),
    [openDropdown, closeDropdown, entry],
  );

  return (
    <DropdownPortalContext.Provider value={value}>
      {children}
    </DropdownPortalContext.Provider>
  );
};

/** Place as the last child of the screen root (outside ScrollView / footer). */
export const DropdownOverlayHost = () => {
  const { entry, closeDropdown } = useDropdownPortal();
  const hostRef = useRef<View>(null);
  const [hostOrigin, setHostOrigin] = useState({ x: 0, y: 0 });

  const syncHostOrigin = useCallback(() => {
    hostRef.current?.measureInWindow((x, y) => {
      setHostOrigin({ x, y });
    });
  }, []);

  useEffect(() => {
    if (!entry) {
      return;
    }
    const frame = requestAnimationFrame(syncHostOrigin);
    return () => cancelAnimationFrame(frame);
  }, [entry, syncHostOrigin]);

  if (!entry) {
    return (
      <View
        ref={hostRef}
        collapsable={false}
        pointerEvents="none"
        style={styles.host}
        onLayout={syncHostOrigin}
      />
    );
  }

  // Show every option up to max height — 3 items = all 3; more = scroll inside.
  const listHeight = Math.min(
    Math.max(entry.options.length, 1) * OPTION_ROW_HEIGHT,
    DROPDOWN_MAX_HEIGHT,
  );

  const top = entry.y - hostOrigin.y + MENU_GAP;
  const left = entry.x - hostOrigin.x;

  return (
    <View
      ref={hostRef}
      collapsable={false}
      pointerEvents="box-none"
      style={styles.host}
      onLayout={syncHostOrigin}
    >
      <View
        style={[
          styles.menu,
          {
            top,
            left,
            width: entry.width,
            height: listHeight,
          },
        ]}
      >
        <GestureHandlerRootView
          style={styles.menuInner}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
        >
          <ScrollView
            nestedScrollEnabled
            scrollEnabled
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator
            persistentScrollbar={Platform.OS === 'android'}
            indicatorStyle="black"
            bounces={false}
            overScrollMode="never"
            style={{ height: listHeight }}
            contentContainerStyle={styles.listContent}
          >
            {entry.options.map((item, index) => {
              const isSelected = entry.selectedValues.includes(item);
              const isLast = index === entry.options.length - 1;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    isLast && styles.optionLast,
                  ]}
                  onPress={() => {
                    entry.onSelect(item);
                    if (entry.closeOnSelect === false) {
                      return;
                    }
                    entry.onClose();
                    closeDropdown();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected ? (
                    <Icon name="check" size={fs(18)} color={Colors.gold} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </GestureHandlerRootView>
      </View>
    </View>
  );
};

type OverlayProps = {
  visible: boolean;
  anchorRef?: React.RefObject<View | null>;
  options: readonly string[];
  selectedValues: readonly string[];
  closeOnSelect?: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
};

/** Measures the field and publishes the menu into DropdownOverlayHost. */
export const DropdownOptionsOverlay = ({
  visible,
  anchorRef,
  options,
  selectedValues,
  closeOnSelect = true,
  onSelect,
  onClose,
}: OverlayProps) => {
  const { openDropdown, closeDropdown } = useDropdownPortal();
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  const wasVisibleRef = useRef(false);
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible) {
      if (wasVisibleRef.current) {
        closeDropdown();
      }
      wasVisibleRef.current = false;
      return;
    }

    wasVisibleRef.current = true;
    let cancelled = false;

    const publish = () => {
      anchorRef?.current?.measureInWindow((x, y, width, height) => {
        if (cancelled || width <= 0 || height <= 0) {
          return;
        }
        openDropdown({
          x,
          y: y + height,
          width,
          options,
          selectedValues,
          closeOnSelect,
          onSelect: value => onSelectRef.current(value),
          onClose: () => onCloseRef.current(),
        });
      });
    };

    const frame = requestAnimationFrame(() => {
      publish();
      setTimeout(publish, 32);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [
    visible,
    anchorRef,
    options,
    selectedValues,
    closeOnSelect,
    openDropdown,
    closeDropdown,
  ]);

  useEffect(() => {
    return () => closeDropdown();
  }, [closeDropdown]);

  return null;
};

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  menu: {
    position: 'absolute',
    borderWidth: INPUT_BORDER_WIDTH,
    borderColor: Colors.dividerPink,
    borderTopLeftRadius: AuthStyles.inputRadius,
    borderTopRightRadius: AuthStyles.inputRadius,
    borderBottomLeftRadius: AuthStyles.inputRadius,
    borderBottomRightRadius: AuthStyles.inputRadius,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    elevation: 48,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  menuInner: {
    flex: 1,
  },
  listContent: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: OPTION_ROW_HEIGHT,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.4%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerPink,
  },
  optionSelected: {
    backgroundColor: Colors.inputBg,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionText: {
    flex: 1,
    fontSize: FontSizes.body,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  optionTextSelected: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});

export default DropdownOptionsOverlay;
