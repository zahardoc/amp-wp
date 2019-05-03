/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import Indicator from './indicator';
import { Reorderer } from '../';
import { STORY_PAGE_INNER_WIDTH } from './../../constants';
import './edit.css';

// This is the sum of left (20px) and right (30px) margin.
const TOTAL_PAGE_MARGIN = 50;
const PAGE_BORDER = 3;

class EditorCarousel extends Component {
	constructor() {
		super( ...arguments );

		this.translateWrapper.bind( this );
	}

	translateWrapper() {
		const wrapper = document.querySelector( '.editor-writing-flow .editor-block-list__layout' );

		if ( ! wrapper ) {
			return;
		}

		if ( this.props.isReordering ) {
			wrapper.style.display = 'none';
		} else {
			wrapper.style.display = '';
			wrapper.style.transform = `translateX(calc(50% - ${ PAGE_BORDER }px - ${ ( STORY_PAGE_INNER_WIDTH + TOTAL_PAGE_MARGIN ) / 2 }px - ${ ( this.props.currentIndex ) * TOTAL_PAGE_MARGIN }px - ${ this.props.currentIndex * STORY_PAGE_INNER_WIDTH }px))`;
		}
	}

	componentDidMount() {
		this.translateWrapper();
	}

	componentDidUpdate() {
		this.translateWrapper();
	}

	render() {
		const { pages, currentPage, previousPage, nextPage, onChangePage, isReordering } = this.props;

		const goToPage = ( page ) => {
			onChangePage( page );
		};

		if ( isReordering ) {
			return <Reorderer />;
		}

		return (
			<Fragment>
				<div className="amp-story-editor-carousel-navigation">
					<IconButton
						icon="arrow-left-alt2"
						label={ __( 'Previous Page', 'amp' ) }
						onClick={ ( e ) => {
							e.preventDefault();
							goToPage( previousPage );
						} }
						disabled={ null === previousPage }
					/>
					<Indicator
						pages={ pages }
						currentPage={ currentPage }
						onClick={ goToPage }
					/>
					<IconButton
						icon="arrow-right-alt2"
						label={ __( 'Next Page', 'amp' ) }
						onClick={ ( e ) => {
							e.preventDefault();
							goToPage( nextPage );
						} }
						disabled={ null === nextPage }
					/>
				</div>
			</Fragment>
		);
	}
}

export default compose(
	withSelect( ( select ) => {
		const {
			getBlockOrder,
			getBlocksByClientId,
			getAdjacentBlockClientId,
		} = select( 'core/block-editor' );
		const { getCurrentPage, isReordering } = select( 'amp/story' );

		const currentPage = getCurrentPage();
		const pages = getBlocksByClientId( getBlockOrder() );

		return {
			pages,
			currentPage,
			currentIndex: pages.findIndex( ( { clientId } ) => clientId === currentPage ),
			previousPage: getCurrentPage() ? getAdjacentBlockClientId( currentPage, -1 ) : null,
			nextPage: getCurrentPage() ? getAdjacentBlockClientId( currentPage, 1 ) : null,
			isReordering: isReordering(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { setCurrentPage } = dispatch( 'amp/story' );
		const { selectBlock } = dispatch( 'core/block-editor' );

		return {
			onChangePage: ( pageClientId ) => {
				setCurrentPage( pageClientId );
				selectBlock( pageClientId );
			},
		};
	} )
)( EditorCarousel );