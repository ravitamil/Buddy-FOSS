import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ImageSourcePropType} from 'react-native';

import {
  EditGroupMissingState,
  EditGroupScreenFrame,
} from '@/features/groups/components/EditGroupScreenChrome';
import {useEditGroupScreen} from '@/features/groups/hooks/useEditGroupScreen';
import loadingJson from '../../assets/lottie/Loading.json';

const loadingSource = loadingJson as ImageSourcePropType;

interface EditGroupScreenProps {
  groupId: string;
}

const EditGroupScreen: React.FC<EditGroupScreenProps> = ({groupId}) => {
  const screen = useEditGroupScreen({groupId});
  const insets = useSafeAreaInsets();

  if (!screen.group) {
    return <EditGroupMissingState onBack={screen.navigateBack} />;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <EditGroupScreenFrame
        screen={screen}
        fabBottomPadding={insets.bottom + 160}
        loadingSource={loadingSource}
      />
    </GestureHandlerRootView>
  );
};

export default EditGroupScreen;
