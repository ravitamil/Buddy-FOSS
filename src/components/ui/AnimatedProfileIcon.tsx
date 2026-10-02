import React from 'react';
import {YStack, styled} from 'tamagui';
import ProfilePicture from './ProfilePicture';
import {useProfilePicture} from '../../hooks/useProfilePicture';
import {useAuth} from '../../context/AuthContext';
import {useUser} from '../../context/UserContext';
import {getInitials} from '../../utils/userUtils';

interface AnimatedProfileIconProps {
  onPress: () => void;
  size?: number;
  showStarBadge?: boolean;
}

const AnimatedProfileIcon: React.FC<AnimatedProfileIconProps> = ({
  onPress,
  size = 48,
  showStarBadge = false,
}) => {
  const {profileImageUri, userId} = useProfilePicture();
  const {user} = useAuth();
  const {profile} = useUser();

  // Compute initials for fallback avatar when no profile image is present
  const initialsText = React.useMemo(() => {
    const nameCandidate =
      (profile?.displayName && profile.displayName.trim()) ||
      [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() ||
      (user?.displayName && user.displayName.trim()) ||
      'User';
    return getInitials(nameCandidate);
  }, [profile?.displayName, profile?.firstName, profile?.lastName, user?.displayName]);

  return (
    <ProfileIconButton onPress={onPress} accessibilityRole="button">
      <ProfilePicture
        size={size}
        imageUri={profile?.profilePictureUri || profileImageUri}
        onImageChange={() => {}} // Non-editable in HomeScreen
        editable={false}
        borderColor="$borderColor"
        borderWidth={1}
        userId={userId}
        fallbackColors={['$blue6', '$blue8']}
        fallbackVariant="initials"
        initialsText={initialsText}
        showStarBadge={showStarBadge}
      />
    </ProfileIconButton>
  );
};

const ProfileIconButton = styled(YStack, {
  name: 'AnimatedProfileIconButton',
  padding: 0,
  backgroundColor: 'transparent',
  borderWidth: 0,
  alignItems: 'center',
  justifyContent: 'center',
  pressStyle: {
    opacity: 0.7,
  },
});

export default AnimatedProfileIcon;
