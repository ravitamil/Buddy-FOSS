import * as Device from 'expo-device';

import type {DeviceInformation} from './types';

export const getDeviceInformation = (): DeviceInformation => ({
  brand: Device.brand,
  manufacturer: Device.manufacturer,
  modelName: Device.modelName,
  modelId: Device.modelId,
  designName: Device.designName,
  productName: Device.productName,
  deviceType: Device.deviceType,
  deviceYearClass: Device.deviceYearClass,
  totalMemory: Device.totalMemory,
  supportedCpuArchitectures: Device.supportedCpuArchitectures,
  osName: Device.osName,
  osVersion: Device.osVersion,
  osBuildId: Device.osBuildId,
  osInternalBuildId: Device.osInternalBuildId,
  osBuildFingerprint: Device.osBuildFingerprint,
  platformApiLevel: Device.platformApiLevel,
  isDevice: Device.isDevice,
});
