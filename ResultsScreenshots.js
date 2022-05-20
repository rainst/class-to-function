import React, { Component } from "react";
import ScreenshotImage from "./ScreenshotImage";
import ScreenshotMetadata from "./ScreenshotMetadata";
import "../../css/index.css";
const _ = require("lodash");

class ResultsScreenshots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      ignoredAdCount: 0,
      page: 1,
    };
    this.prepareResults = this.prepareResults.bind(this);
    this.groupedByDateTime = this.groupedByDateTime.bind(this);
    this.filterHouseAds = this.filterHouseAds.bind(this);
    this.appendList = this.appendList.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    // this.groupAdsByDomain = this.groupAdsByDomain.bind(this);
  }

  componentDidMount() {
    const filteredResults = this.prepareResults(this.props.data);
    this.setState({
      results: filteredResults.results,
      ignoredAdCount: filteredResults.ignoredResults,
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const filteredResults = this.prepareResults(nextProps.data.data);
    this.setState({
      results: filteredResults.results,
      ignoredAdCount: filteredResults.ignoredResults,
    });
  }

  appendList(dict, key, value) {
    if (key in dict) {
      dict[key].push(value);
    } else {
      dict[key] = [value];
    }
  }

  groupedByDateTime(ads) {
    const groups = {};
    for (const ad of ads) {
      this.appendList(groups, ad["dateTime"], ad);
    }
    return groups;
  }

  // TODO: add another condition that will group the results by domain name first AFTER groupByDateTime & filterHouseAds
  // groupAdsByDomain(filteredResults) {
  //   console.log(
  //     "Object.keys(filteredResults.results)",
  //     Object.keys(filteredResults.results)
  //   ); // array of date strings
  //   console.log(
  //     "Object.values(filteredResults.results)",
  //     Object.values(filteredResults.results)
  //   ); // array of metadata objects

    // Retrieve day from datetime, set as key
    
    // const retrieveDayFromDateTime = _.groupBy(
    //   filteredResults.results,
    //   (key) => {
    //     return key.dateTime.split("T")[0];
    //   }
    // );
    // console.log(Object.entries(retrieveDayFromDateTime)); // ["day string", [array of metadata objects]]

  //   let results = {};
  //   for (const ad of Object.entries(retrieveDayFromDateTime)) {
  //     console.log("ad in retrieveDayFromDateTime", ad[1]);
  //     console.log("date:", ad[0]); // type string
  //
  //      results[ad[0]] = _.groupBy(ad[1], (key) => {
  //       return key.domain;
  //     });
  //   }
  //
  //   console.log("Built results")
  //   console.log(results)
  //   return results
  // }

  filterHouseAds(results) {
    let filteredResultCount = 0;

    for (const key of Object.keys(results)) {
      const filteredResult = [];
      //   console.log("show key of Object.keys(results)", Object.keys(results));
      for (const ad of results[key]) {
        // console.log(" results[key]", results[key]);
        // console.log("ad", ad);
        if (ad["advertiserName"] !== "House Ads") {
          filteredResult.push(ad);
        } else {
          console.log("Ignoring House Ad");
          console.log(ad);
        }
      }

      if (filteredResult.length === 0) {
        console.log(
          `Dropping group: ${key} because it only contained house ads`
        );
        console.log(results[key]);
        filteredResultCount += 1;
        delete results[key];
      } else {
        results[key] = filteredResult[filteredResult.length - 1];
      }
    }

    return {
      results: results,
      filteredResultCount: filteredResultCount,
    };
  }

  // Remove House Ads and order by captured date time
  prepareResults(results) {
    if (results) {
      console.log("results", results); // [{ obj1 }, { obj2 }, { obj4 }, { obj5 }]

      const groupedResults = this.groupedByDateTime(results);
      const filteredResults = this.filterHouseAds(groupedResults);
      // const groupedByDomain = this.groupAdsByDomain(filteredResults);
      // console.log("groupedByDomain", groupedByDomain);
      const sortedResults = [];

      Object.keys(filteredResults.results)
        .sort()
        .reverse()
        .forEach((key) => sortedResults.push(filteredResults.results[key]));

      return {
        results: sortedResults,
        ignoredResults: filteredResults.filteredResultCount,
      };
    } else {
      return {
        results: [],
        ignoredResults: 0,
      };
    }
  }

  previousPage() {
    const page = this.state.page - 1;
    this.setState({
      page: page,
    });
  }

  nextPage() {
    const page = this.state.page + 1;
    this.setState({
      page: page,
    });
  }

  render() {
    const pageSize = 10;
    const numOfResults = this.state.results.length;
    const numOfIgnoredResults = this.state.ignoredAdCount;
    const lowerBound = (this.state.page - 1) * pageSize;
    let upperBound = this.state.page * pageSize;
    const pagedResults = this.state.results.slice(lowerBound, upperBound); // pagedResults returns an array of 10 object (per page) [{}]
    upperBound = lowerBound + pagedResults.length;

    return (
      <div class="screenshot-results">
        {this.state.results.length > 0 ? (
          <div class="light-blue">
            Displaying {lowerBound + 1}-{lowerBound + pagedResults.length} of{" "}
            {numOfResults} results ({numOfIgnoredResults} ignored).
            {this.state.results.length > 10 && (
              <div class="pagination-buttons">
                <button
                  class="previous"
                  disabled={lowerBound === 0}
                  onClick={this.previousPage}
                >
                  &#60;
                </button>
                <button
                  class="next"
                  disabled={upperBound === numOfResults}
                  onClick={this.nextPage}
                >
                  &#62;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div class="light-blue">No results.</div>
        )}
        {pagedResults.map((result) => {
          return (
            <div class="light-blue">
              {/* <div> Domain: </div>
              <ScreenshotMetadata
                domain={result.domain}
                metadata={domainResults}
              /> */}
              <div class="container">
                <div id={result.id} class="image">
                  <ScreenshotImage
                    key={result.id}
                    date={result.dateTime}
                    screenshot={result.screenshot}
                    thumbnail={result.thumbnail}
                  />
                </div>
                <div class="metadata">
                  <ScreenshotMetadata
                    domain={result.domain}
                    date={result.dateTime}
                    metadata={result}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default ResultsScreenshots;
