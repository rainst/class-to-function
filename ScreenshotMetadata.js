import React, { Component } from 'react';
import '../../css/index.css';

class ScreenshotMetadata extends Component{

  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * @desc Repackages the screenshot metadata for user view.
   */
  getMetadata(meta){
      let metadata = {};
      if ('dateTime' in meta){
          metadata['Captured'] = `${meta.dateTime.replace('T', ' ').substring(0, 19)}`;
      }
      if ('site' in meta){
          metadata['Site'] = `${meta.site.replace(/-/g, ".")}`;
      }
      if ('advertiserId' in meta){
          if('advertiserName' in meta) {
              metadata['Advertiser'] = `${meta.advertiserName} (${meta.advertiserId})`;
          } else {
              metadata['Advertiser'] = `${meta.advertiserId}`;
          }
      }
      if ('campaignId' in meta){
          if('campaignName' in meta) {
              metadata['Campaign'] = `${meta.campaignName} (${meta.campaignId})`;
          } else {
              metadata['Campaign'] = `${meta.campaignId}`;
          }
      }
      if ('lineItemId' in meta){
          if('lineItemName' in meta){
              metadata['Line Item'] = `${meta.lineItemName} (${meta.lineItemId})`;
          } else {
              metadata['Line Item'] = `${meta.lineItemId}`;
          }
      }
      if ('creativeId' in meta){
          metadata['Creative ID'] = `${meta.creativeId}`;
      }
      return metadata
  }

  render() {
    const metadata = this.getMetadata(this.props.metadata);
    return (
        <div class="standard-text">
            { Object.keys(metadata).map((key) => {
                return (
                    <li key={key} class="standard-text">
                        <b>{key}</b>: {metadata[key]}
                    </li>
                )
            })}
        </div>
    );
  }
}

export default ScreenshotMetadata;
