import React, {useState, useEffect} from 'react';
import {Avatar, Card, Text} from '@ravitamil/buddy-ui';
import * as ImagePicker from 'expo-image-picker';
import {Image} from 'expo-image';
import {YStack, styled} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {SupabaseStorageService} from '../../services/SupabaseStorageService';
import {logger as appLogger} from '../../services/LoggerService';
import {useMembership} from '../../context/MembershipContext';
import {useAuth} from '../../context/AuthContext';
import {profileImageStorage} from '../../services/storage/cacheStorage';
import appIcon from '../../../assets/icon.png';

const logger = appLogger.contextLogger('ProfilePicture');

const ProfilePicturePressable = styled(YStack, {
  name: 'ProfilePicturePressable',
  padding: 0,
  backgroundColor: 'transparent',
  borderWidth: 0,
  alignItems: 'center',
  justifyContent: 'center',
  pressStyle: {
    opacity: 0.7,
  },
});

const StarBadgeFrame = styled(YStack, {
  name: 'ProfilePictureStarBadge',
  position: 'absolute',
  bottom: -2,
  right: -2,
  backgroundColor: '$warning6',
  borderRadius: 100,
  padding: 5,
  borderWidth: 2,
  borderColor: '$buttonPrimaryText',
  shadowColor: '$shadowColor',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
});

const StarIcon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

const CameraBadgeFrame = styled(YStack, {
  name: 'ProfilePictureCameraBadge',
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '$primary',
  borderRadius: 14,
  width: 28,
  height: 28,
  borderWidth: 2,
  borderColor: '$background',
  shadowColor: '$shadowColor',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  alignItems: 'center',
  justifyContent: 'center',
});

const CameraIcon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
const ThemedPersonIcon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

interface ProfilePictureProps {
  size?: number;
  imageUri?: string | null;
  onImageChange?: (uri: string) => void;
  editable?: boolean;
  borderColor?: string;
  borderWidth?: number;
  userId?: string;
  fallbackColors?: [string, string];
  fallbackVariant?: 'app' | 'initials' | 'gradient' | 'icon';
  initialsText?: string;
  showStarBadge?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  size = 120,
  imageUri,
  onImageChange,
  editable = true,
  borderColor,
  borderWidth = 2,
  userId,
  fallbackColors = ['$glassSurfaceFill', '$glassSurfaceFill'],
  fallbackVariant = 'icon',
  initialsText,
  showStarBadge = false,
}) => {
  const [saving, setSaving] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(imageUri || null);

  const {isPro: currentUserIsPro} = useMembership();
  const {user} = useAuth();

  // Determine if we should show the Golden Ring
  // Only for current user if they are Pro
  const isCurrentUser = !userId || (user && user.uid === userId);
  const showGoldBorder = isCurrentUser && currentUserIsPro;
  const effectiveBorderColor = showGoldBorder ? '$warning6' : borderColor || '$glassSurfaceBorder';
  const effectiveBorderWidth = showGoldBorder ? borderWidth || 2 : borderWidth || 1.5;
  const fallbackBackgroundColor = fallbackColors[0];

  // Update local state when imageUri prop changes
  useEffect(() => {
    setLocalImageUri(imageUri || null);
  }, [imageUri]);

  // Load saved profile picture path from local cache only when imageUri is not explicitly provided
  useEffect(() => {
    if (imageUri === undefined && userId) {
      void loadSavedProfilePicture();
    }
  }, [userId, imageUri]);

  // Load profile picture from local cache
  const loadSavedProfilePicture = async () => {
    try {
      if (!userId) return;
      const savedImageUri = await profileImageStorage.getItem(`profile_picture_${userId}`);
      if (savedImageUri) {
        setLocalImageUri(savedImageUri);
      }
    } catch (error) {
      logger.error('Error loading profile picture from storage:', error);
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    if (!editable) return;
    void pickImage();
  };

  // Pick image from library
  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted !== true) {
        logger.debug('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        await uploadToSupabase(uri);
      }
    } catch (error) {
      logger.error('Error picking image:', error);
    }
  };

  // Upload image to Supabase
  const uploadToSupabase = async (uri: string) => {
    if (!userId) {
      logger.warn('Cannot upload: No userId provided');
      return;
    }

    setSaving(true);
    try {
      // Upload to Supabase Storage
      const publicUrl = await SupabaseStorageService.uploadAvatar(userId, uri);

      // Save the public URL for immediate local fallback
      const storageKey = userId;
      await profileImageStorage.setItem(`profile_picture_${storageKey}`, publicUrl);

      // Update component state
      setLocalImageUri(publicUrl);
      onImageChange?.(publicUrl);

      logger.info('Profile picture updated on Supabase:', publicUrl);
    } catch (error) {
      logger.error('Error uploading to Supabase:', error);
      // Fallback is implicitly handled as localImageUri stays at previous value
    } finally {
      setSaving(false);
    }
  };

  // Generate single initial for fallback
  const getInitial = () => {
    if (initialsText && initialsText.trim().length > 0) {
      return initialsText.trim().charAt(0).toUpperCase();
    }
    return null;
  };

  const renderImage = () => {
    if (
      localImageUri &&
      (localImageUri.startsWith('http') ||
        localImageUri.startsWith('file:') ||
        localImageUri.startsWith('content:'))
    ) {
      return (
        <Image
          source={{uri: localImageUri}}
          style={{width: '100%', height: '100%'}}
          contentFit="cover"
          transition={200}
        />
      );
    }

    if (fallbackVariant === 'initials') {
      const initial = getInitial();
      if (initial) {
        return (
          <YStack
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            backgroundColor="$glassSurfaceFill">
            <Text
              fontSize={Math.round(size * 0.44)}
              fontWeight="800"
              color="$text"
              letterSpacing={-0.5}
              textAlign="center">
              {initial}
            </Text>
          </YStack>
        );
      }
    }

    if (fallbackVariant === 'app') {
      return (
        <YStack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          backgroundColor="$background">
          <Image
            source={appIcon}
            style={{
              width: '80%',
              height: '80%',
            }}
            contentFit="contain"
            transition={200}
          />
        </YStack>
      );
    }

    return (
      <YStack
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        backgroundColor="$glassSurfaceFill">
        <ThemedPersonIcon name="person" size={Math.round(size * 0.46)} color="$iconBrand" />
      </YStack>
    );
  };

  const renderBadge = () => {
    if (showGoldBorder && showStarBadge) {
      return (
        <StarBadgeFrame>
          <StarIcon name="star" size={size * 0.12} color="$buttonPrimaryText" />
        </StarBadgeFrame>
      );
    }

    if (editable) {
      return (
        <CameraBadgeFrame>
          <CameraIcon name="camera" size={14} color="$buttonPrimaryText" />
        </CameraBadgeFrame>
      );
    }

    return null;
  };

  const Content = (
    <YStack alignItems="center" gap="$2">
      <YStack position="relative" width={size} height={size}>
        <YStack
          width={size}
          height={size}
          borderRadius={size / 2}
          overflow="hidden"
          borderWidth={effectiveBorderWidth}
          borderColor={effectiveBorderColor}
          backgroundColor="$glassSurfaceFill"
          alignItems="center"
          justifyContent="center">
          {renderImage()}
        </YStack>
        {renderBadge()}
      </YStack>

      {saving && (
        <Text fontSize="$2" color="$color11" fontFamily="$body">
          Updating...
        </Text>
      )}
    </YStack>
  );

  if (editable) {
    return (
      <ProfilePicturePressable
        onPress={showImagePickerOptions}
        disabled={saving}
        accessibilityRole="button">
        {Content}
      </ProfilePicturePressable>
    );
  }

  return <YStack pointerEvents="none">{Content}</YStack>;
};

export default ProfilePicture;
