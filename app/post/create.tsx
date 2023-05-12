import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MasonryFlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Button } from 'react-native-paper';
import { IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useSWRInfinite from 'swr/infinite';
import useMutation from 'use-mutation';
import { useDebounce } from 'usehooks-ts';

import * as qss from 'qss';

import CachedImage from '../../components/CachedImage';
import Header, { CreateMindDumpTitle } from '../../components/Header';

import { connect } from '../../lib/database';
import { exec } from '../../lib/database-utils';
import { Gif, type GiphyResponse } from '../../lib/giphy';

const style = StyleSheet.create({
	root: {
		flexGrow: 1,
		flexShrink: 1,
	},

	thingy: {
		flexGrow: 1,
		flexShrink: 1,
	},
	list: {
		padding: 16,
	},
	listLoading: {
		flexGrow: 1,
		flexShrink: 1,
		justifyContent: 'center',
	},

	gifRoot: {
		margin: 8,
		borderRadius: 8,
		overflow: 'hidden',
	},

	postDetails: {
		flexGrow: 1,
		flexShrink: 1,
		gap: 12,
		paddingTop: 8,
		paddingHorizontal: 24,
		paddingBottom: 24,
	},
	selectedGifRoot: {
		width: 135,
		borderRadius: 8,
		overflow: 'hidden',
	},

	input: {
		backgroundColor: '#F6F6F6',
		padding: 12,
		borderRadius: 6,
		marginTop: 8,
		marginHorizontal: 24,
	},

	editor: {
		backgroundColor: '#F6F6F6',
		padding: 12,
		borderRadius: 6,
		textAlignVertical: 'top',
		flexGrow: 1,
		flexShrink: 1,
	},
});

const GIPHY_ENDPOINT = process.env.GIPHY_ENDPOINT;
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

const GifPicker = ({ search, onPick }: { search: string; onPick?: (gif: Gif) => void }) => {
	const LIMIT = 25;

	const getKey = React.useCallback((index: number, previous: GiphyResponse) => {
		if (previous) {
			const pagination = previous.pagination;

			if ((pagination.count + pagination.offset + LIMIT) > pagination.total_count) {
				return null;
			}
		}

		const qs = qss.encode({
			api_key: GIPHY_API_KEY,
			offset: index * LIMIT,
			limit: LIMIT,
			q: search || undefined,
		});

		if (search) {
			return `${GIPHY_ENDPOINT}/gifs/search?${qs}`;
		}
		else {
			return `${GIPHY_ENDPOINT}/gifs/trending?${qs}`;
		}
	}, [search]);

	const { data, size, setSize, isLoading } = useSWRInfinite(
		getKey,
		async (url) => {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Response error ${response.status}`);
			}

			const json = await response.json() as GiphyResponse;
			return json;
		},
	);

	const flattenedGifs = React.useMemo(() => {
		if (data) {
			return data.flatMap((resp) => resp.data);
		}

		return [];
	}, [data]);

	const canLoadMore = React.useMemo(() => {
		if (data && data.length > 0) {
			const last = data[data.length - 1];
			const pagination = last.pagination;

			return (pagination.count + pagination.offset + LIMIT) < pagination.total_count;
		}

		return false;
	}, [data]);

	return (
		<View style={style.thingy}>
			{isLoading && (
				<View style={style.listLoading}>
					<ActivityIndicator />
				</View>
			)}

			<MasonryFlashList
				data={flattenedGifs}
				keyExtractor={(item) => item.id}
				numColumns={3}
				optimizeItemArrangement
				overrideItemLayout={(layout, item) => {
					layout.size = +item.images.fixed_height.height;
				}}
				renderItem={({ item }) => {
					const ratio = +item.images.fixed_height.width / +item.images.fixed_height.height;

					return (
						<View style={style.gifRoot}>
							<Pressable
								android_ripple={{ borderless: false, foreground: true }}
								onPress={() => onPick?.(item)}
								accessibilityLabel={item.title}
							>
								<CachedImage
									source={{ uri: item.images.fixed_height.url }}
									cacheKey={`${item.id}-fixed_height`}
									style={{ aspectRatio: ratio }}
									resizeMode='contain'
									placeholder={
										<View style={{ backgroundColor: '#D9D9D9', aspectRatio: ratio }}>
											<ActivityIndicator
												size='small'
												style={{ flex: 1, justifyContent: 'center' }}
											/>
										</View>
									}
								/>
							</Pressable>
						</View>
					);
				}}
				estimatedItemSize={115}
				contentContainerStyle={style.list}
				onEndReached={() => canLoadMore && setSize(size + 1)}
			/>
		</View>
	);
};

const MemoizedGifPicker = React.memo(GifPicker);

const GifSearchSection = (props: { onPick?: (gif: Gif) => void }) => {
	const { onPick } = props;

	const [search, setSearch] = React.useState('');
	const debouncedSearch = useDebounce(search, 500);

	return (
		<>
			<TextInput
				value={search}
				onChangeText={setSearch}
				placeholder='Find a GIF'
				style={style.input}
			/>

			<MemoizedGifPicker search={debouncedSearch} onPick={onPick} />
		</>
	);
};

const createPost = async ({ gif, content }: { gif: Gif; content: string }) => {
	const db = await connect();

	// Android 13 seems to ship with a very old version of SQLite that still
	// doesn't support RETURNING statements.

	// > The RETURNING syntax has been supported by SQLite since version 3.35.0 (2021-03-12).
	// https://www.sqlite.org/lang_returning.html

	await exec(db, [
		{
			sql: `INSERT OR REPLACE INTO giphy(id, json) VALUES(?, ?);`,
			args: [gif.id, JSON.stringify(gif)],
		},
		{
			sql: `INSERT INTO notes(title, content, giphy_id) VALUES(?, ?, ?);`,
			args: [gif.title.replace(/\s+GIF(\s+by.*)?$/, ''), content, gif.id],
		},
	]);

	// Best we can do is to route to the home screen, which is probably ideal
	// anyways since it's not often you want to see the note you just wrote.
};

const PostDetailsSection = (props: { gif: Gif; onCancel?: () => void }) => {
	const { gif, onCancel } = props;

	const [value, setValue] = React.useState('');

	const router = useRouter();
	const [dispatch, { status }] = useMutation(createPost, {
		onSuccess () {
			router.back();
		},
	});

	const ratio = +gif.images.fixed_height.width / +gif.images.fixed_height.height;

	return (
		<View style={style.postDetails}>
			<View style={style.selectedGifRoot}>
				<Pressable
					android_ripple={{ borderless: false, foreground: true }}
					onPress={onCancel}
					accessibilityLabel={gif.title}
				>
					<CachedImage
						source={{ uri: gif.images.fixed_height.url }}
						cacheKey={`${gif.id}-fixed_height`}
						style={{ aspectRatio: ratio }}
						resizeMode='contain'
						placeholder={
							<View style={{ backgroundColor: '#D9D9D9', aspectRatio: ratio }}>
								<ActivityIndicator
									size='small'
									style={{ flex: 1, justifyContent: 'center' }}
								/>
							</View>
						}
					/>
				</Pressable>
			</View>

			<TextInput
				placeholder='Dump your mind'
				multiline
				scrollEnabled
				value={value}
				onChangeText={setValue}
				style={style.editor}
			/>

			<Button
				loading={status === 'running'}
				mode='contained-tonal'
				onPress={() => dispatch({ gif, content: value })}
			>
				Save
			</Button>
		</View>
	);
};

const PostCreatePage = () => {
	const router = useRouter();
	const inset = useSafeAreaInsets();

	const [gif, setGif] = React.useState<Gif>();

	return (
		<View style={StyleSheet.compose(style.root, { marginTop: inset.top })}>
			<Stack.Screen options={{ title: 'Create Post' }} />

			<Header
				title={<CreateMindDumpTitle />}
				action={<IconButton icon='close' accessibilityLabel='Close' onPress={router.back} />}
			/>

			{!gif && <GifSearchSection onPick={setGif} />}
			{gif && <PostDetailsSection gif={gif} onCancel={() => setGif(undefined)} />}
		</View>
	);
};

export default PostCreatePage;
