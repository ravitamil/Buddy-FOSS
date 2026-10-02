import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {AddGroupScreenFrame} from '@/features/groups/components/AddGroupScreenSections';
import {useAddGroupScreen} from '@/features/groups/hooks/useAddGroupScreen';

const AddGroupScreen = () => {
  const screen = useAddGroupScreen();
  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AddGroupScreenFrame screen={screen} fabBottomPadding={insets.bottom + 160} />
    </GestureHandlerRootView>
  );
};

export default AddGroupScreen;
