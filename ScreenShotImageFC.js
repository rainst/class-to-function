import React from "react";
import { storage } from "../../firebase-config";
import moment from "moment/moment";
import "../../css/index.css";

// variables in this.props gets destructured in the function arguments, from another file we know the props are:
// date={result.dateTime}
// screenshot={result.screenshot}
// thumbnail={result.thumbnail}
const ScreenshotImageFC = ({ date, screenshot, thumbnail }) => {
  // variables in this.state go into a useState hook, this was the old state:
  // screenshot: "",
  // thumbnail: "Loading",
  // urls: [null, null],
  // state.screenshot and state.thumbnail were just a copy of props.screenshot and props.thumbnail,
  // so there is no need to put them in a state hook, leaving these 2 in the props is enough.
  // The only state variable needed is urls:
  const [urls, setUrls] = React.useState([null, null]);
  // the default value for state.thumbnail though was used to determine if the component is still loading,
  // that's why I'm introducing this new state variable:
  const [isLoading, setIsLoading] = React.useState(true);

  const linkId = date + "_screenshot";
  const imageId = date + "_thumb";

  // remove this.state
  const screenshotUrl = urls[0];
  const thumbnailUrl = urls[1];

  // This effect replaces componentDidMount and UNSAFE_componentWillReceiveProps,
  // * componentDidMount: because the effect is run when a component mounts anyway
  // * UNSAFE_componentWillReceiveProps: because this effect will also be run whenever
  //   any of the variables specified in the dependency array change.
  React.useEffect(() => {
    getImageUrls({ date, screenshot, thumbnail }).then((urls) => {
      setIsLoading(false);
      setUrls(urls);
    });
  }, [date, screenshot, thumbnail]);

  // here is pretty much the same, just removed this.props
  return (
    <div className="wrapper">
      <a
        id={linkId}
        href={screenshotUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {isLoading ? (
          <li className="thumbnail">Loading...</li>
        ) : !thumbnailUrl ? (
          <li className="thumbnail">No thumbnail available.</li>
        ) : (
          <img className="thumbnail" alt="" id={imageId} src={thumbnailUrl} />
        )}
      </a>
    </div>
  );
};

export default ScreenshotImageFC;

// These functions don't depend on state or props variables of the component, what I
// normally like to in this case is to put them outside of the main body of the function
// to keep it smaller therefore easier to read and maintain (they can also go in a separate file)

const isArchived = (date) => {
  // Entries over 550 days (about 18 months) are
  return (
    Math.abs(moment(date, "YYYY-MM-DD hh:mm").diff(moment(), "days")) > 550
  );
};

const getImageUrls = async (screenshot, thumbnail) => {
  if (screenshot && thumbnail) {
    // Need to get the URLs from Storage
    const screenshotUrl = await getDownloadURLFromStorage(storage, screenshot);

    const thumbnailUrl = await getThumbnailUrlFromStorage(storage, thumbnail);
    return [screenshotUrl, thumbnailUrl];
  } else {
    console.error(`Could not find image URL.`);
    return [null, null];
  }
};

const getThumbnailUrlFromStorage = async (storage, key, date) => {
  if (isArchived(date)) {
    return process.env.PUBLIC_URL + "/archived_thumbnail.jpg";
  } else {
    return await this.getDownloadURLFromStorage(storage, key);
  }
};

const getDownloadURLFromStorage = async (storage, key) => {
  try {
    return await storage.ref().child(key).getDownloadURL();
  } catch (e) {
    console.log("Image URL not found.");
    console.error(e);
    return "";
  }
};
