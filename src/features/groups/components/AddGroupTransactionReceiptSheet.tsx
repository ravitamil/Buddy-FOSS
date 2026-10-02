import {BottomSheet, BottomSheetAction} from '@ravitamil/buddy-ui/overlays';
import React from 'react';

import type {UseAddGroupTransactionScreenResult} from '../hooks/useAddGroupTransactionScreen';

interface ReceiptSheetProps {
  screen: UseAddGroupTransactionScreenResult;
}

export const AddGroupTransactionReceiptSheet = ({screen}: ReceiptSheetProps) => {
  return (
    <BottomSheet
      open={screen.isReceiptSheetOpen}
      onOpenChange={screen.setIsReceiptSheetOpen}
      snapPoints={[46]}
      zIndex={100000}
      title="Attach Receipt or Document"
      description="Supports .jpg, .png, .pdf, .doc • Max 1 MB (1 file)">
      <BottomSheetAction
        label="Photo Gallery"
        description="Choose from your photos"
        icon="images-outline"
        onPress={() => {
          screen.setIsReceiptSheetOpen(false);
          screen.handlePickImage();
        }}
      />
      <BottomSheetAction
        label="PDF / Document"
        description="Upload PDF, DOCX or invoice file"
        icon="document-text-outline"
        onPress={() => {
          screen.setIsReceiptSheetOpen(false);
          screen.handlePickDocument();
        }}
      />
      <BottomSheetAction
        label="Take Photo"
        description="Scan receipt with device camera"
        icon="camera-outline"
        onPress={() => {
          screen.setIsReceiptSheetOpen(false);
          screen.handleTakePhoto();
        }}
      />
    </BottomSheet>
  );
};
