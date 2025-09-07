// cloudinaryConfig.js
import { Platform } from 'react-native';
import CryptoJS from 'crypto-js'; // You'll need to install: npm install crypto-js

export const cloudinaryConfig = {
  cloudName: 'dbmywcm6u', // Fixed cloud name
  apiKey: '676893836659362',
  apiSecret: 'cb3yYhvQejZuhqw_uIsF09M0id8',
  uploadPreset: 'dentease_profile_pics', // Keep as backup
};

// Generate signature for signed uploads
const generateSignature = (publicId, timestamp) => {
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${cloudinaryConfig.apiSecret}`;
  return CryptoJS.SHA1(stringToSign).toString();
};

export const uploadToCloudinary = async (imageUri) => {
  try {
    console.log('📤 Starting Cloudinary upload...');
    console.log('Image URI:', imageUri);
    
    // Validate imageUri
    if (!imageUri) {
      throw new Error('Image URI is required');
    }

    // Handle different image URI formats
    let finalImageUri = imageUri;
    
    // If imageUri is an object (from image picker), extract the URI
    if (typeof imageUri === 'object' && imageUri !== null) {
      if (imageUri.uri) {
        finalImageUri = imageUri.uri;
      } else if (imageUri.path) {
        finalImageUri = imageUri.path;
      } else if (imageUri.assets && imageUri.assets[0] && imageUri.assets[0].uri) {
        finalImageUri = imageUri.assets[0].uri;
      } else {
        console.error('Invalid image object:', imageUri);
        throw new Error('Could not extract URI from image object');
      }
    }

    console.log('Final Image URI:', finalImageUri);

    const formData = new FormData();
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `dentease-profile-${timestamp}`;
    
    // React Native approach
    formData.append('file', {
      uri: finalImageUri,
      type: 'image/jpeg',
      name: `${publicId}.jpg`,
    });
    
    // Option 1: Try unsigned upload first (simpler)
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'dentease_profiles');
    
    let uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    // If unsigned upload fails, try signed upload
    if (!uploadResponse.ok && uploadResponse.status === 401) {
      console.log('🔄 Unsigned upload failed, trying signed upload...');
      
      const newFormData = new FormData();
      const signature = generateSignature(publicId, timestamp);
      
      newFormData.append('file', {
        uri: finalImageUri,
        type: 'image/jpeg',
        name: `${publicId}.jpg`,
      });
      
      newFormData.append('api_key', cloudinaryConfig.apiKey);
      newFormData.append('timestamp', timestamp.toString());
      newFormData.append('public_id', publicId);
      newFormData.append('folder', 'dentease_profiles');
      newFormData.append('signature', signature);
      
      uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: newFormData,
        }
      );
    }

    console.log('📡 Response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Upload failed:', errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log('✅ Upload successful!', result);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    
    // More specific error handling
    if (error.message.includes('Network request failed')) {
      throw new Error('Network error - please check your internet connection');
    } else if (error.message.includes('Upload failed: 400')) {
      throw new Error('Invalid image format or upload preset configuration');
    } else if (error.message.includes('Upload failed: 401')) {
      throw new Error('Invalid upload preset or unauthorized access');
    } else {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }
};

export const uploadToCloudinaryRN = async (imagePickerResult) => {
  try {
    console.log('📤 Starting Cloudinary upload (RN)...');
    console.log('Image picker result:', imagePickerResult);
    
    let imageUri;
    let fileName;
    let fileType = 'image/jpeg';
    
    // Handle react-native-image-picker format
    if (imagePickerResult.assets && imagePickerResult.assets.length > 0) {
      const asset = imagePickerResult.assets[0];
      imageUri = asset.uri;
      fileName = asset.fileName || `dentease-profile-${Date.now()}.jpg`;
      fileType = asset.type || 'image/jpeg';
    }
    // Handle expo-image-picker format
    else if (imagePickerResult.uri) {
      imageUri = imagePickerResult.uri;
      fileName = `dentease-profile-${Date.now()}.jpg`;
      if (imagePickerResult.type) {
        fileType = imagePickerResult.type;
      }
    }
    // Handle direct URI string
    else if (typeof imagePickerResult === 'string') {
      imageUri = imagePickerResult;
      fileName = `dentease-profile-${Date.now()}.jpg`;
    }
    else {
      throw new Error('Invalid image picker result format');
    }

    if (!imageUri) {
      throw new Error('No image URI found');
    }

    console.log('Processing image:', { imageUri, fileName, fileType });

    const formData = new FormData();
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `dentease-profile-${timestamp}`;
    
    // Try unsigned upload first
    formData.append('file', {
      uri: imageUri,
      type: fileType,
      name: fileName,
    });
    
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'dentease_profiles');
    
    let response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    // If unsigned upload fails, try signed upload
    if (!response.ok && response.status === 401) {
      console.log('🔄 Unsigned upload failed, trying signed upload...');
      
      const newFormData = new FormData();
      const signature = generateSignature(publicId, timestamp);
      
      newFormData.append('file', {
        uri: imageUri,
        type: fileType,
        name: fileName,
      });
      
      newFormData.append('api_key', cloudinaryConfig.apiKey);
      newFormData.append('timestamp', timestamp.toString());
      newFormData.append('public_id', publicId);
      newFormData.append('folder', 'dentease_profiles');
      newFormData.append('signature', signature);
      
      response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
    }

    console.log('📡 Response status:', response.status);

    const responseText = await response.text();
    console.log('📡 Response text:', responseText);

    if (!response.ok) {
      console.error('❌ Upload failed:', responseText);
      throw new Error(`Upload failed: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('✅ Upload successful!', result);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};