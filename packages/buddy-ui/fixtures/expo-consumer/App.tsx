import React from 'react';
import {Button, GlassSurface, Text, VStack} from '@ravitamil/buddy-ui';
import {buddyUIConfig} from '@ravitamil/buddy-ui/config';
import {TamaguiProvider} from 'tamagui';

export function App() {
  return (
    <TamaguiProvider config={buddyUIConfig}>
      <VStack flex={1} padding="$4" justifyContent="center">
        <GlassSurface>
          <Text variant="h3">Portable Buddy UI</Text>
          <Button onPress={() => undefined}>Continue</Button>
        </GlassSurface>
      </VStack>
    </TamaguiProvider>
  );
}
