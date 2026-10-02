import React, {useEffect, useState} from 'react';
import EmojiPicker, {type EmojiType} from 'rn-emoji-keyboard';

import {useTamaguiTheme} from '../../context/TamaguiThemeProvider';

interface EmojiKeyboardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  theme?: 'light' | 'dark';
}

const resolveEmojiTheme = (theme: EmojiKeyboardSheetProps['theme'], isDarkMode: boolean) => {
  if (theme) {
    return theme;
  }

  if (isDarkMode) {
    return 'dark';
  }

  return 'light';
};

export const EmojiKeyboardSheet: React.FC<EmojiKeyboardSheetProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
  theme,
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const currentTheme = resolveEmojiTheme(theme, isDarkMode);
  const [mountKey, setMountKey] = useState(0);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setMountKey((previous) => previous + 1);
        setShouldRender(true);
      }, 50);

      return () => clearTimeout(timer);
    }

    setShouldRender(false);
    return undefined;
  }, [isOpen]);

  const lightTheme = {
    backdrop: '#00000050',
    knob: '#007AFF',
    container: '#ffffff',
    header: '#000000',
    skinTonesContainer: '#f5f5f5',
    category: {
      icon: '#666666',
      iconActive: '#007AFF',
      container: '#f5f5f5',
      containerActive: '#007AFF20',
    },
    search: {
      text: '#000000',
      placeholder: '#999999',
      icon: '#666666',
      background: '#f5f5f5',
    },
  };

  const darkTheme = {
    backdrop: '#00000080',
    knob: '#007AFF',
    container: '#1c1c1e',
    header: '#ffffff',
    skinTonesContainer: '#2c2c2e',
    category: {
      icon: '#999999',
      iconActive: '#007AFF',
      container: '#2c2c2e',
      containerActive: '#007AFF20',
    },
    search: {
      text: '#ffffff',
      placeholder: '#666666',
      icon: '#999999',
      background: '#2c2c2e',
    },
  };

  const handleEmojiSelected = (emojiObject: EmojiType) => {
    onEmojiSelect(emojiObject.emoji);
  };

  return (
    <EmojiPicker
      key={`emoji-picker-${mountKey}`}
      open={isOpen && shouldRender}
      onClose={onClose}
      onEmojiSelected={handleEmojiSelected}
      theme={currentTheme === 'dark' ? darkTheme : lightTheme}
      enableSearchBar
      categoryPosition="top"
      enableRecentlyUsed
      enableCategoryChangeAnimation={false}
      emojiSize={28}
    />
  );
};

export default EmojiKeyboardSheet;
