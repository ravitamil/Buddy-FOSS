import {useState, useEffect} from 'react';
import {useGoogleAuth} from './useGoogleAuth';
import {useUser} from '../context/UserContext';
import {logger as appLogger} from '../services/LoggerService';
import {profileImageStorage} from '../services/storage/cacheStorage';

export const useProfilePicture = () => {
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {authState} = useGoogleAuth();
  const {authUser} = authState;
  const {profile} = useUser();

  // Load profile picture from local cache
  const loadProfilePicture = async () => {
    try {
      setIsLoading(true);
      const storageKey = authUser?.uid || 'default_user';
      const savedImageUri = await profileImageStorage.getItem(`profile_picture_${storageKey}`);
      if (savedImageUri) {
        setProfileImageUri(savedImageUri);
      }
    } catch (error) {
      appLogger.error('Error loading profile picture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile picture
  const updateProfilePicture = (uri: string | null) => {
    setProfileImageUri(uri);
  };

  // Load profile picture when user changes
  useEffect(() => {
    void loadProfilePicture();
  }, [authUser?.uid]);

  // Sync with AuthContext profile picture updates
  useEffect(() => {
    const storageKey = authUser?.uid || 'default_user';
    const uriFromProfile = profile?.profilePictureUri || null;
    // If context has a value different from current local state, update and persist
    if (uriFromProfile && uriFromProfile !== profileImageUri) {
      setProfileImageUri(uriFromProfile);
      // Persist so components relying on local storage also see updates
      profileImageStorage.setItem(`profile_picture_${storageKey}`, uriFromProfile).catch(() => {
        // swallow storage errors to avoid breaking UI
      });
    }
  }, [profile?.profilePictureUri, authUser?.uid]);

  return {
    profileImageUri,
    isLoading,
    updateProfilePicture,
    loadProfilePicture,
    refreshProfilePicture: loadProfilePicture, // Alias for consistency
    userId: authUser?.uid || 'default_user',
  };
};

export default useProfilePicture;
