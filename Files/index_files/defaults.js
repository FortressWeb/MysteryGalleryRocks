var WebCom_Components_PhotoAlbumImage_Defaults = {
  id: null,
  assetId: -1,
  name: '',
  caption: '',
  description: '',
  hasShare: false,
  hasLike: false,
  likeButtonUrl: '',
  categoryType: '',
  showImageUrlThumb: false,
  src: null
};

var WebCom_Components_PhotoAlbumLightWeight_Defaults =  {
  id: null,
  name: 'My Photo Album',
  theme: 'classic',
  description: '',
  hasLike: false,
  likeButtonUrl: '',
  hasShare: false,
  albumVersion: '1.2',
  settings : {
    width:500,
    max_width:500,
    pause: 2000,
    autoplay:true,
    loop: true,
    controls: true,
    mode:'slide',
    speed:500
  },
  appearance : {
    bgcolor: '#000000',
    captionFont: {
      size:16,
      family:'Arial, Helvetica, sans-serif',
      style: 'bold',
      color: '#000000',
      textAlign: 'left'
    },
    descriptionFont: {
      size:12,
      family:'Arial, Helvetica, sans-serif',
      style: '',
      color: '#000000',
      textAlign: 'left'
    },
    imageCaptionFont: {
      size:14,
      family:'Arial, Helvetica, sans-serif',
      style: '',
      color: '#FFFFFF',
      textAlign: 'left'
    },
    imageDescriptionFont:{
      size:10,
      family:'Arial, Helvetica, sans-serif',
      style: '',
      color: '#FFFFFF',
      textAlign: 'left'
    },
    captionBlock:{
      position: 'bottom',
      backgroundColor: '',
      borderWidth: '0',
      borderType: 'none',
      borderColor: 'transparent',
      borderPosition: '',
      opacity: '1'
    }
  },
  images: []
};

var WebCom_Components_PhotoAlbum_Defaults =  {
  id: null,
  name: 'My Photo Album',
  theme: 'classic',
  description: '',
  hasLike: false,
  likeButtonUrl: '',
  hasShare: false,
  settings : {
    height:300,
    width:500,
    max_height:300,
    max_width:500,
    delay: 2000,
    isAutoplay:true,
    isLoop: true,
    hasNavigation: true,
    transition:'fade',
    hasThumbnails:true,
    lightbox: '',
    hasImageNav: false,
    transitionSpeed:500,
    layerFollow: false,
    wait:15000
  },
  appearance : {
    bgcolor: '#000000',
    captionFont: {
      size:16,
      family:'Arial, Helvetica, sans-serif',
      style: 'bold',
      color: '#000000'
    },
    descriptionFont: {
      size:12,
      family:'Arial, Helvetica, sans-serif',
      style: '',
      color: '#000000'
    },
    imageCaptionFont: {
      size:14,
      family:'Arial, Helvetica, sans-serif',
      style: '',
      color: '#FFFFFF'
    },
    imageDescriptionFont:{
      size:10,
      family:'Arial, Helvetica, sans-serif',
      style: '',
      color: '#FFFFFF'
    }
  },
  images: []
};

