import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDEO_URL =
    'https://drive.google.com/uc?export=download&id=1_UYR_Ea2kuOGOW9KKmvPjdDuvNL9Qv-M';

const FILE_NAME = 'sample.mp4';
const STORAGE_KEY = 'cached_video_path';

export const getCachedVideo = async progressCallback => {
    try {
        const cachedPath = await AsyncStorage.getItem(STORAGE_KEY);

        if (cachedPath && (await RNFS.exists(cachedPath))) {
            return {
                path: cachedPath,
                downloaded: true,
            };
        }

        const localPath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

        const download = RNFS.downloadFile({
            fromUrl: VIDEO_URL,
            toFile: localPath,
            background: true,
            discretionary: true,
            progressDivider: 1,
            progress: res => {
                const progress =
                    (res.bytesWritten / res.contentLength) * 100;

                progressCallback?.(progress);
            },
        });

        const result = await download.promise;

        if (result.statusCode !== 200) {
            throw new Error(`Download failed. Status: ${result.statusCode}`);
        }

        await AsyncStorage.setItem(STORAGE_KEY, localPath);

        return {
            path: localPath,
            downloaded: false,
        };
    } catch (e) {
        console.log('Download Error:', e);
        throw e;
    }
};