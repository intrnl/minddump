import React from 'react';
import { Image, type ImageProps } from 'react-native';

import * as FileSystem from 'expo-file-system';
import useSWR from 'swr';

import { nanoid } from 'nanoid/non-secure';

export interface SourceOption {
	uri: string;
	headers?: Record<string, string>;
	expiresIn?: number;
}

export interface CachedImageProps extends ImageProps {
	source: SourceOption;
	cacheKey: string;
	placeholder?: React.ReactNode;
}

/** Mobile platforms only, not usable in web */
const CachedImage = (props: CachedImageProps) => {
	const { cacheKey, source, placeholder, ...rest } = props;

	const { data, error } = useSWR(`CachedImage/${cacheKey}`, async () => {
		const { uri, headers, expiresIn } = source;

		const fileUri = `${FileSystem.cacheDirectory!}/${cacheKey}`;
		const entry = await FileSystem.getInfoAsync(fileUri);

		if (
			!entry.exists ||
			entry.size === 0 ||
			(expiresIn && ((Date.now() / 1000) - entry.modificationTime > expiresIn))
		) {
			const rid = nanoid(6);
			const tempUri = `${FileSystem.cacheDirectory!}/t${rid}-${cacheKey}`;

			const response = await FileSystem.downloadAsync(uri, tempUri, { headers });

			if (response.status !== 200) {
				throw new Error(`Response error ${response.status}`);
			}

			await FileSystem.moveAsync({ from: tempUri, to: fileUri });
			return fileUri;
		}
		else {
			return fileUri;
		}
	});

	if (!data && !error) {
		return (placeholder as any) || null;
	}

	return (
		<Image
			{...rest}
			source={{ ...source, uri: error ? source.uri : data }}
		/>
	);
};

export default CachedImage;
