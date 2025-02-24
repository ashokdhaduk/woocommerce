/**
 * External dependencies
 */
import { BlockAttributes } from '@wordpress/blocks';
import { select, dispatch } from '@wordpress/data';
import { findBlock } from '@woocommerce/utils';

/**
 * Internal dependencies
 */
import { ThumbnailsPosition } from './inner-blocks/product-gallery-thumbnails/constants';

/**
 * Generates layout attributes based on the position of thumbnails.
 *
 * @param {string} thumbnailsPosition - The position of thumbnails ('bottom' or other values).
 * @return {{type: string, orientation?: string, flexWrap?: string}} - An object representing layout attributes.
 */
export const getGroupLayoutAttributes = (
	thumbnailsPosition: string
): { type: string; orientation?: string; flexWrap?: string } => {
	switch ( thumbnailsPosition ) {
		case 'bottom':
			// Stack
			return { type: 'flex', orientation: 'vertical' };
		case 'off':
			// Stack
			return { type: 'flex', orientation: 'vertical' };
		default:
			// Row
			return { type: 'flex', flexWrap: 'nowrap' };
	}
};

/**
 * Updates block attributes based on provided attributes.
 *
 * @param {BlockAttributes}             attributesToUpdate - The new attributes to set on the block.
 * @param {BlockAttributes | undefined} block              - The block object to update.
 */
export const updateBlockAttributes = (
	attributesToUpdate: BlockAttributes,
	block: BlockAttributes | undefined
): void => {
	if ( block !== undefined ) {
		const updatedBlock = {
			...block,
			attributes: {
				...block.attributes,
				...attributesToUpdate,
			},
		};

		dispatch( 'core/block-editor' ).updateBlock(
			block.clientId,
			updatedBlock
		);
	}
};

/**
 * Sets the layout of group block based on the thumbnails' position.
 *
 * @param {ThumbnailsPosition} thumbnailsPosition - The position of thumbnails.
 * @param {string}             clientId           - The client ID of the block to update.
 */
const setGroupBlockLayoutByThumbnailsPosition = (
	thumbnailsPosition: ThumbnailsPosition,
	clientId: string
): void => {
	const block = select( 'core/block-editor' ).getBlock( clientId );
	block?.innerBlocks.forEach( ( innerBlock ) => {
		if (
			innerBlock.name === 'core/group' &&
			innerBlock.attributes.metadata.name === 'Gallery Area'
		) {
			updateBlockAttributes(
				{
					layout: getGroupLayoutAttributes( thumbnailsPosition ),
				},
				innerBlock
			);
		}
	} );
};

/**
 * Moves inner blocks to a position based on provided attributes.
 *
 * @param {BlockAttributes} attributes - The attributes of the parent block.
 * @param {string}          clientId   - The clientId of the parent block.
 */
export const moveInnerBlocksToPosition = (
	attributes: BlockAttributes,
	clientId: string
): void => {
	const { getBlock, getBlockRootClientId, getBlockIndex } =
		select( 'core/block-editor' );
	const productGalleryBlock = getBlock( clientId );

	if ( productGalleryBlock?.name === 'woocommerce/product-gallery' ) {
		const { moveBlockToPosition } = dispatch( 'core/block-editor' );
		const previousLayout = productGalleryBlock.innerBlocks.length
			? productGalleryBlock.innerBlocks[ 0 ].attributes.layout
			: null;

		const thumbnailsBlock = findBlock( {
			blocks: [ productGalleryBlock ],
			findCondition( block ) {
				return block.name === 'woocommerce/product-gallery-thumbnails';
			},
		} );
		const largeImageParentBlock = findBlock( {
			blocks: [ productGalleryBlock ],
			findCondition( block ) {
				return Boolean(
					block.innerBlocks?.find(
						( innerBlock ) =>
							innerBlock.name ===
							'woocommerce/product-gallery-large-image'
					)
				);
			},
		} );
		const largeImageParentBlockIndex = getBlockIndex(
			largeImageParentBlock?.clientId || ''
		);
		const thumbnailsBlockIndex = getBlockIndex(
			thumbnailsBlock?.clientId || ''
		);

		if (
			largeImageParentBlock &&
			thumbnailsBlock &&
			largeImageParentBlockIndex !== -1 &&
			thumbnailsBlockIndex !== -1
		) {
			const { thumbnailsPosition } = attributes;
			setGroupBlockLayoutByThumbnailsPosition(
				thumbnailsPosition,
				clientId
			);

			setGroupBlockLayoutByThumbnailsPosition(
				thumbnailsPosition,
				productGalleryBlock.innerBlocks[ 0 ].clientId
			);

			if ( previousLayout ) {
				const orientation =
					getGroupLayoutAttributes( thumbnailsPosition ).orientation;
				updateBlockAttributes(
					{
						layout: { ...previousLayout, orientation },
					},
					productGalleryBlock.innerBlocks[ 0 ]
				);
			}

			if (
				( ( thumbnailsPosition === 'bottom' ||
					thumbnailsPosition === 'right' ) &&
					thumbnailsBlockIndex < largeImageParentBlockIndex ) ||
				( thumbnailsPosition === 'left' &&
					thumbnailsBlockIndex > largeImageParentBlockIndex )
			) {
				moveBlockToPosition(
					thumbnailsBlock.clientId,
					getBlockRootClientId( thumbnailsBlock.clientId ) ||
						undefined,
					getBlockRootClientId( largeImageParentBlock.clientId ) ||
						undefined,
					largeImageParentBlockIndex
				);
			}
		}
	}
};
