/**
 * External dependencies
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import {
	thumbnailsPositionLeft,
	thumbnailsPositionBottom,
	thumbnailsPositionRight,
} from '@woocommerce/icons';
import { useDispatch } from '@wordpress/data';
import {
	Icon,
	RangeControl,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControlOption` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - Ignoring because `__experimentalToggleGroupControl` is not yet in the type definitions.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ThumbnailsPosition } from '../constants';
import type { ProductGalleryThumbnailsSettingsProps } from '../../../types';

const positionHelp: Record< ThumbnailsPosition, string > = {
	[ ThumbnailsPosition.LEFT ]: __(
		'A strip of small images will appear to the left of the main gallery image.',
		'woocommerce'
	),
	[ ThumbnailsPosition.BOTTOM ]: __(
		'A strip of small images will appear below the main gallery image.',
		'woocommerce'
	),
	[ ThumbnailsPosition.RIGHT ]: __(
		'A strip of small images will appear to the right of the main gallery image.',
		'woocommerce'
	),
};

export const ProductGalleryThumbnailsBlockSettings = ( {
	context,
}: ProductGalleryThumbnailsSettingsProps ) => {
	const maxNumberOfThumbnails = 8;
	const minNumberOfThumbnails = 3;
	const { productGalleryClientId } = context;
	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	return (
		<>
			<ToggleGroupControl
				className="wc-block-editor-product-gallery-thumbnails__position-toggle"
				isBlock
				label={ __( 'Thumbnails', 'woocommerce' ) }
				value={ context.thumbnailsPosition }
				help={
					positionHelp[
						context.thumbnailsPosition as ThumbnailsPosition
					]
				}
				onChange={ ( value: string ) =>
					updateBlockAttributes( productGalleryClientId, {
						thumbnailsPosition: value,
					} )
				}
			>
				<ToggleGroupControlOption
					value={ ThumbnailsPosition.LEFT }
					label={
						<Icon size={ 32 } icon={ thumbnailsPositionLeft } />
					}
				/>
				<ToggleGroupControlOption
					value={ ThumbnailsPosition.BOTTOM }
					label={
						<Icon size={ 32 } icon={ thumbnailsPositionBottom } />
					}
				/>
				<ToggleGroupControlOption
					value={ ThumbnailsPosition.RIGHT }
					label={
						<Icon size={ 32 } icon={ thumbnailsPositionRight } />
					}
				/>
			</ToggleGroupControl>
			<RangeControl
				label={ __( 'Number of Thumbnails', 'woocommerce' ) }
				value={ context.thumbnailsNumberOfThumbnails }
				onChange={ ( value: number ) =>
					updateBlockAttributes( productGalleryClientId, {
						thumbnailsNumberOfThumbnails: Math.round( value ),
					} )
				}
				help={ __(
					'Choose how many thumbnails (3-8) will display. If more images exist, a “View all” button will display.',
					'woocommerce'
				) }
				max={ maxNumberOfThumbnails }
				min={ minNumberOfThumbnails }
				step={ 1 }
			/>
		</>
	);
};
