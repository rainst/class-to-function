import React, { Component } from 'react';
import SmartTextInput from '../SmartTextInput';
import config from '../../config'
import Helmet from 'react-helmet';
import DayPicker, { DateUtils } from 'react-day-picker';
import '../../css/index.css';
import 'react-day-picker/lib/style.css'

class SearchScreenshots extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searching: false,
            dateRange: {
                from: undefined,
                to: undefined },
            to: undefined,
            from: undefined,
            advertisersAndCampaigns: [],
            advertisers: [],
            campaigns: [],
            advertiser: '',
            campaign: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleAdvertiserChange = this.handleAdvertiserChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.select = this.select.bind(this);
        this.getCampaigns = this.getCampaigns.bind(this);
        this.handleDayClick = this.handleDayClick.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.resetDateRange = this.resetDateRange.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleAdvertiserChange(e) {
        this.setState({
            advertiser: e.target.value,
            campaign: ''
        });
    }

    handleSubmit(e) {
        e.preventDefault();
    }

    getCampaigns(advertiser, advertisers, advertisersAndCampaigns) {
        let campaigns = [];
        // if the advertiser exists return it's campaigns
        if (advertisers.includes(advertiser)) {
            for (let i in advertisersAndCampaigns) {
                if (advertisersAndCampaigns[i]['advertiserName'] === advertiser) {
                    campaigns.push(advertisersAndCampaigns[i]['campaignName']);
                }
            }
        // else return all campaigns
        } else {
            for (let i in advertisersAndCampaigns) {
                if(advertisersAndCampaigns[i]['campaignName'] !== '') {
                    campaigns.push(advertisersAndCampaigns[i]['campaignName']);
                }
            }
        }
        return campaigns;
    }

    async handleSearch(e) {
        e.preventDefault();
        this.setState({
            searching: true
        });

        this.props.showResults();
        this.props.setResults('', []);

        let body = {
            'fromDate': this.state.from,
            'toDate': ((this.state.to === "") ? this.state.from : this.state.to),
            'advertiser': this.state.advertiser,
            'campaign': this.state.campaign,
            'entityKind': 'Screenshot'
        };
        if (this.props.role !== null && this.props.role !== 'admin') {
            body['site'] = this.props.role;
        }

        console.log('Search Datastore Cloud Function using:');
        console.log(body);

        try {
            let response = await fetch(`https://us-central1-${config.projectId}.cloudfunctions.net/datastore-queryDatastore`, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {'Content-Type': 'application/json'},
            });
            let results = await response.json();
            this.props.setResults('ResultsScreenshots', results);
            if (results.length === 0) {
                this.props.showNoResultsMessage();
            }
        } catch(error) {
            console.error('Cloud Function to get Search results failed.');
            console.error(error);
        }
        this.setState({
            searching: false
        });

    }

    async componentDidMount() {
        try {
            let response = await fetch(`https://us-central1-${config.projectId}.cloudfunctions.net/datastore-getAllAdvertiserAndCampaignNames`);
            let advertisersAndCampaigns = await response.json();
            let advertisers = [];
            let campaigns = [];
            // Remove empty rows
            // Remove House Ads from Advertisers and Campaigns
            for(let i in advertisersAndCampaigns) {
                if( (advertisersAndCampaigns[i]['advertiserName'] !== '') && (advertisersAndCampaigns[i]['advertiserName'] !== 'House Ads') ) {
                    advertisers.push(advertisersAndCampaigns[i]['advertiserName']);
                }
                if( (advertisersAndCampaigns[i]['campaignName'] !== '') && (advertisersAndCampaigns[i]['campaignName'] !== 'Telstra House Ads - AFL') ) {
                    campaigns.push(advertisersAndCampaigns[i]['campaignName']);
                }
            }
            advertisers = Array.from(new Set(advertisers)).sort();
            campaigns = Array.from(new Set(campaigns)).sort();
            this.setState({
                advertisersAndCampaigns: advertisersAndCampaigns,
                advertisers: advertisers,
                campaigns: campaigns
            });
        }
        catch(e) {
            console.error('Cloud Function to get Advertiser and Campaign names failed.');
            console.error(e);
        }
    }

    select(tab) {
        this.setState({
            tab: tab
        });
    }

    handleDayClick(day) {
        const range = DateUtils.addDayToRange(day, this.state.dateRange);
        if (!range.from && !range.to){
            this.resetDateRange();
        }
        else {
            this.setState({
                dateRange: range,
                from: this.formatDate(range.from),
                to: this.formatDate(range.to)
            });
        }
    }

    resetDateRange() {
        this.setState({
            dateRange: {
                from: undefined,
                to: undefined
            },
            from: '',
            to: ''
        });
    }

    handleResetClick() {
        this.setState({
            dateRange: {
                from: undefined,
                to: undefined
            },
            from: '',
            to: '',
            advertiser: '',
            campaign: ''
        });
    }

    /**
     * @desc Format to YYYY-MM-DD.
     */
    formatDate(date) {
        if (date) {
            return date.toISOString().substring(0, 10);
        } else {
            return '';
        }
    }

    /**
     * @desc Checks state and renders based on that.
     * Passes the search results to Result component as a prop if there are any.
     */
    render() {
        const { from, to } = this.state.dateRange;
        const modifiers = { start: from, end: to };
        const disableSearch = !this.state.from && !this.state.to && (this.state.advertiser==='') && (this.state.campaign==='');

        return (
            <div className='search-container'>
                <form onSubmit={ e => {
                    e.preventDefault();
                }}>

                    <div>
                        <div className="RangeExample">

                            <DayPicker
                                className="Selectable"
                                numberOfMonths={1}
                                selectedDays={[from, { from, to }]}
                                modifiers={modifiers}
                                onDayClick={this.handleDayClick}
                            />
                            <Helmet>
                                <style>{`
                                  .Selectable .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
                                    background-color: #f0f8ff !important;
                                    color: #4a90e2;
                                  }
                                  .Selectable .DayPicker-Day {
                                    border-radius: 0 !important;
                                  }
                                  .Selectable .DayPicker-Day--start {
                                    border-top-left-radius: 50% !important;
                                    border-bottom-left-radius: 50% !important;
                                  }
                                  .Selectable .DayPicker-Day--end {
                                    border-top-right-radius: 50% !important;
                                    border-bottom-right-radius: 50% !important;
                                  }
                                  .DayPicker {
                                    width: 100%;
                                  }
                                  .DayPicker-Day--today {
                                    color: #fa6900;
                                  }
                                  .DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside) {
                                    background-color: #103d5d;
                                  }
                                `}</style>
                            </Helmet>

                            <div className='standard'>
                                { ( this.state.to && this.state.from && (this.state.to !== this.state.from) ) &&
                                <p>Date range selected: { this.state.from } to { this.state.to }</p>
                                }
                                { ( this.state.to && (!this.state.from || (this.state.to === this.state.from) ) ) &&
                                <p>Date selected: { this.state.to }</p>
                                }
                                { ( !this.state.to && this.state.from ) &&
                                <p>Date selected: { this.state.from }</p>
                                }
                                { ( !this.state.to && !this.state.from ) &&
                                <p>No date range selected.</p>
                                }
                            </div>

                        </div>

                        <div className='advertiser-search'>
                            <SmartTextInput
                                name="advertiser"
                                onChange={ this.handleAdvertiserChange }
                                options={ this.state.advertisers }
                                value={ this.state.advertiser }
                                highlighted={ ( this.state.advertisers.includes(this.state.advertiser) ) }
                                placeholder=" Advertiser"
                            />
                        </div>

                        <div className='campaign-search'>
                            <SmartTextInput
                                name="campaign"
                                onChange={ this.handleChange }
                                options={ this.getCampaigns(this.state.advertiser, this.state.advertisers, this.state.advertisersAndCampaigns) }
                                value={ this.state.campaign }
                                highlighted={ ( this.getCampaigns(this.state.advertiser, this.state.advertisers, this.state.advertisersAndCampaigns).includes(this.state.campaign) ) }
                                placeholder=" Campaign"
                            />
                        </div>

                        <div className='buttons'>
                            <button className="reset" disabled={ disableSearch } onClick={ this.handleResetClick }>
                                Reset
                            </button>
                            <button className="search" disabled={ disableSearch || this.state.searching } onClick={ this.handleSearch }>
                                { (this.state.searching) ?
                                    "Searching..."
                                :
                                    "Search"
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export default SearchScreenshots;
