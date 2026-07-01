const { ImageKit } = require('@imagekit/nodejs');

let imageKitClient = null;
if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
  imageKitClient = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

async function uploadFile(file) {
  // file is expected as base64 string
  if (!imageKitClient) {
    // Fallback: return a fake URL so local development/tests work without ImageKit
    return { url: `https://example.com/soundSphere-${Date.now()}.mp3` };
  }

  try {
    const result = await imageKitClient.files.upload({
      file,
      fileName: `soundSphere-${Date.now()}`,
      folder: '/soundSphere',
    });

    return result;
  } catch (error) {
    console.error('Error uploading file to ImageKit:', error);
    throw error;
  }
}

module.exports = { uploadFile };