import {BottomSheet, BottomSheetAction} from '@ravitamil/buddy-ui/overlays';
import React from 'react';

export const ExportPortfolioSheet = ({
  open,
  onOpenChange,
  onExportOption,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportOption: (format: 'pdf' | 'csv') => void;
}) => {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[40]}
      title="Export Portfolio"
      description="Choose an export format">
      <BottomSheetAction
        icon="document"
        label="Export as PDF"
        description="Portable document for sharing or printing"
        onPress={() => onExportOption('pdf')}
      />
      <BottomSheetAction
        icon="grid"
        label="Export as CSV"
        description="Spreadsheet-ready transaction data"
        onPress={() => onExportOption('csv')}
      />
    </BottomSheet>
  );
};
