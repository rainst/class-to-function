import React, { Component } from 'react';
import { storage } from '../../firebase-config';
import moment from 'moment/moment';
import '../../css/index.css';

class ScreenshotImage extends Component{

  constructor(props) {
    super(props);
    this.state = {
        screenshot: '',
        thumbnail: 'Loading',
        urls: [null, null]
    };

    this.getDownloadURLFromStorage = this.getDownloadURLFromStorage.bind(this);
    this.getImageUrls = this.getImageUrls.bind(this);
  }

  async componentDidMount(){
    let urls = await this.getImageUrls(this.props);
    this.setState({
        screenshot: this.props.screenshot,
        thumbnail: this.props.thumbnail,
        urls: urls
    });
  }

  // Won't re-render when paging results unless this function is defined
  async UNSAFE_componentWillReceiveProps(nextProps){
    let urls = await this.getImageUrls(nextProps);
    this.setState({
        screenshot: nextProps.screenshot,
        thumbnail: nextProps.thumbnail,
        urls: urls
    });
  }

  isArchived(date){
    // Entries over 550 days (about 18 months) are 
    return Math.abs(moment(date, 'YYYY-MM-DD hh:mm').diff(moment(), 'days')) > 550;
  }

  async getThumbnailUrlFromStorage(storage, key, date){
    if (this.isArchived(date)) {
      return process.env.PUBLIC_URL + '/archived_thumbnail.jpg';
    } else {
      return await this.getDownloadURLFromStorage(storage, key);
    }
  }

  async getDownloadURLFromStorage(storage, key){
      try {
          return await storage.ref().child(key).getDownloadURL();
      } catch(e) {
          console.log('Image URL not found.');
          console.error(e);
          return '';
      }
  }

  async getImageUrls(props){
    if(props.screenshot && props.thumbnail) {
        // Need to get the URLs from Storage
        const screenshotUrl = await this.getDownloadURLFromStorage(storage, props.screenshot);
        const thumbnailUrl = await this.getThumbnailUrlFromStorage(storage, props.thumbnail);
        return [screenshotUrl, thumbnailUrl]
    } else {
        console.error(`Could not find image URL.`);
        return [null, null];
    }
  }

  render() {
    const linkId = this.props.date + '_screenshot';
    const imageId = this.props.date + '_thumb';
    const screenshotUrl = this.state.urls[0];
    const thumbnailUrl = this.state.urls[1];
    return (
      <div className="wrapper">
          <a id={linkId} href={ screenshotUrl } target="_blank" rel="noopener noreferrer">
              {   (this.state.thumbnail === 'Loading') ?
                    <li className="thumbnail">Loading...</li>
                  : (!thumbnailUrl) ?
                    <li className="thumbnail">No thumbnail available.</li>
                  :
                    <img className="thumbnail" alt="" id={imageId} src={ thumbnailUrl } />
              }
          </a>
      </div>
    );
  }

}

export default ScreenshotImage;
