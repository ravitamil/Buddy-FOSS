import React, {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router, useLocalSearchParams} from 'expo-router';
import {LoadingIndicator, Text} from '@ravitamil/buddy-ui';
import {YStack} from 'tamagui';

import {ScreenContainer} from '@/components/ui';
import {useAuth} from '@/context';
import {logger as appLogger} from '@/services/LoggerService';
import {GroupMemberService} from '@/services/GroupMemberService';

const logger = appLogger.contextLogger('InviteGroupScreen');
const PENDING_INVITE_KEY = '@BuddyApp:pendingGroupInviteToken';

type InviteScreenStatus = 'loading' | 'joining' | 'success' | 'error';

const InviteGroupScreen = () => {
  const {isAuthenticated, isLoading} = useAuth();
  const params = useLocalSearchParams<{token?: string; groupId?: string}>();
  const rawToken = params.token ?? params.groupId;
  const token =
    typeof rawToken === 'string'
      ? rawToken
      : Array.isArray(rawToken) && typeof rawToken[0] === 'string'
        ? rawToken[0]
        : null;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<InviteScreenStatus>('loading');
  const [message, setMessage] = useState('Checking invite...');

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid invite link.');
      return;
    }

    if (!isAuthenticated) {
      void AsyncStorage.setItem(PENDING_INVITE_KEY, token).then(() => {
        logger.info('Stored pending invite, redirecting to login');
        router.replace('/');
      });
      return;
    }

    void (async () => {
      setStatus('joining');
      setMessage('Joining the group...');

      try {
        const result = await GroupMemberService.acceptInvite(token);

        if (!result) {
          setStatus('error');
          setMessage('This invite link is invalid or has expired.');
          return;
        }

        setStatus('success');
        setMessage('You joined the group!');
        timeoutRef.current = setTimeout(() => {
          router.replace({pathname: '/groups/[id]', params: {id: result.groupId}});
        }, 1200);
      } catch (error) {
        logger.error('handleInvite error', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    })();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, isLoading, token]);

  const isError = status === 'error';

  return (
    <ScreenContainer dotSize={2} dotSpacing={18}>
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$6" gap="$4">
        {!isError ? (
          <LoadingIndicator size="large" color="$iconBrand" accessibilityLabel={message} />
        ) : null}
        <Text color={isError ? '$red10' : '$text'} textAlign="center" fontSize="$5" lineHeight="$6">
          {message}
        </Text>
      </YStack>
    </ScreenContainer>
  );
};

export default InviteGroupScreen;
