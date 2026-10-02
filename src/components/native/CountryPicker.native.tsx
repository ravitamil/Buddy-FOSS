import React from 'react';
import CountryPickerLib, {
  Country as LibCountry,
  CountryCode as LibCountryCode,
} from 'react-native-country-picker-modal';

type LibCountryPickerProps = React.ComponentProps<typeof CountryPickerLib>;

export type Country = LibCountry;
export type CountryCode = LibCountryCode;

export interface CountryPickerProps {
  countryCode: CountryCode;
  withFilter?: boolean;
  withFlag?: boolean;
  withCallingCode?: boolean;
  withEmoji?: boolean;
  onSelect?: (country: Country) => void;
  visible?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  containerButtonStyle?: LibCountryPickerProps['containerButtonStyle'];
  theme?: LibCountryPickerProps['theme'];
  children?: React.ReactNode;
}

export default function CountryPicker(props: CountryPickerProps) {
  const {children, ...rest} = props;
  if (children) {
    const child = children as React.ReactElement<{onPress?: () => void}>;

    return (
      <CountryPickerLib
        {...rest}
        renderFlagButton={(flagProps) => (
          <React.Fragment>
            {React.cloneElement(child, {
              onPress: () => flagProps.onOpen?.(),
            })}
          </React.Fragment>
        )}
      />
    );
  }
  return <CountryPickerLib {...props} />;
}
