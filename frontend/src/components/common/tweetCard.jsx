import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './tweetCard.css';
import userPlaceholder from './placeholder.jpg';
import TweetActions from './tweetActions';
import TweetActionDetails from './TweetActionDetails';
import apiService from '../../services/httpService';
import { backendURI } from '../../utils/config';

class TweetCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tweet: {
                first_name: "",
                hashtags: [],
                last_name: "",
                likes: [],
                likes_count: 0,
                replies_count: 0,
                retweeters: [],
                retweets_count: 0,
                tweet_date: "",
                tweet_id: "",
                tweet_image: [],
                tweet_owner: { _id: "", first_name: "", last_name: "", user_name: "" },
                tweet_text: "",
                user_id: "",
                user_name: "",
                _id: ""
            },
            user_id: ""
        }
        this.onHashtagClick = this.onHashtagClick.bind(this);
        this.onTweetImageClick = this.onTweetImageClick.bind(this);
    }
    componentDidMount = () => {
        console.log("in tweet card component mount");
        let user_id = localStorage.getItem("user_id");
        this.setState({ tweet: this.props.data, user_id: user_id })
    }
    componentWillReceiveProps(props) {
        console.log("in tweet card recieve props");
        this.setState({ tweet: props.data });
    }
    onHashtagClick = (e) => {
        localStorage.setItem("search_input", e.target.text.replace(/#/g, ''));
    }
    deleteTweet = async (e) => {
        let data = {
            user_id: this.state.user_id,
            tweet_id: this.state.tweet.tweet_id || this.state.tweet._id
        };
        let result = await apiService.post(`${backendURI}/api/tweets/delete`, data);
        window.location = "/home";
    }

    bookmarkTweet = async (e) => {
        let data = {
            user_id: this.state.user_id,
            tweet_id: this.state.tweet.tweet_id || this.state.tweet._id
        };
        let result = await apiService.post(`${backendURI}/api/bookmark`, data);
        window.location = "/bookmarks";
    }

    removeBookmark = async (e) => {
        let data = {
            user_id: this.state.user_id,
            tweet_id: this.state.tweet._id
        };
        let result = await apiService.post(`${backendURI}/api/bookmark/delete`, data);
        window.location = "/bookmarks";
    };

    onTweetImageClick = (e) => {
        let modal = document.getElementById("tweetImageModal");
        var modalImage = document.getElementById("tweet_image_modal");
        modal.style.display = "block";
        modalImage.src = e.target.src;

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            modal.style.display = "none";
        }
    };
    handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        let { tweet, user_id } = this.state;
        let data = {
            user_id: user_id,
            tweet_id: this.state.tweet.tweet_id || this.state.tweet._id
        }
        if (tweet.likes.includes(user_id) || tweet.likes.find(like => like._id === user_id)) {
            let result = await apiService.post(`${backendURI}/api/tweets/unlike`, data);
            if (result.status === 201) {
                if (tweet.showDetails) {
                    let result = await apiService.get(`${backendURI}/api/tweets/tweet/${data.tweet_id}`);
                    let tweet = result.data;
                    tweet.showDetails = true;
                    this.setState({ tweet: tweet });
                }
                else {
                    tweet.likes_count -= 1;
                    tweet.likes = tweet.likes.filter(like => like._id === user_id);
                    this.setState({ tweet: tweet });
                }
            }
        }
        else {
            let result = await apiService.post(`${backendURI}/api/tweets/like`, data);
            if (result.status === 201) {
                if (tweet.showDetails) {
                    let result = await apiService.get(`${backendURI}/api/tweets/tweet/${data.tweet_id}`);
                    let tweet = result.data;
                    tweet.showDetails = true;
                    this.setState({ tweet: tweet });
                }
                else {
                    tweet.likes_count += 1;
                    tweet.likes.push(user_id);
                    this.setState({ tweet: tweet });
                }
            }
        }
    }
    render() {
        let tweet = this.state.tweet;
        let tweetImages, retweetInfo, tweetActionDetails, deleteTweet, bookmarkTweet, hashtags = [];
        let tweetOwnerImage = userPlaceholder;

        if (tweet.tweet_image && tweet.tweet_image.length) {
            tweetImages = (
                <div>
                    <div className="tweet-image col-sm-12">
                        <img src={tweet.tweet_image[0]} className="tweet_image" alt="" onClick={this.onTweetImageClick} />
                    </div>
                    <div id="tweetImageModal" class="modal">
                        <span class="close">&times;</span>
                        <img class="modal-content" id="tweet_image_modal" />
                        <div id="caption"></div>
                    </div>
                </div>
            );
        }
        if (tweet.tweet_owner && tweet.tweet_owner.user_image) {
            tweetOwnerImage = tweet.tweet_owner.user_image;
        }
        if (tweet.user_id && tweet.tweet_owner._id !== tweet.user_id) {
            retweetInfo = (
                <div className="tweet-owner col-sm-12">
                    <i className="fas fa-retweet mr-2"></i>
                    <Link to={{ pathname: `/profile/${tweet.user_id}` }}>
                        {tweet.first_name} {tweet.last_name}
                    </Link> retweeted
                </div>
            );
        }
        if (tweet.hashtags && tweet.hashtags.length) {
            tweet.hashtags.map(hashtag => {
                hashtag = "#" + hashtag + " ";
                hashtag = (
                    <Link to="/explore/tweets" onClick={this.onHashtagClick}>
                        {hashtag}
                    </Link>
                )
                hashtags.push(hashtag);
                return 0;
            });
        }
        if (tweet.showDetails) {
            tweetActionDetails = (<TweetActionDetails data={tweet} />)
        }

        if ((tweet.user_id === localStorage.getItem("user_id") || tweet.tweet_owner._id === localStorage.getItem("user_id")) && !tweet.showDetails) {
            deleteTweet = (<a class="dropdown-item" href="" onClick={this.deleteTweet}>Delete Tweet</a>);
        }

        if (tweet.bookmarksPage) {
            bookmarkTweet = (<a class="dropdown-item" href="" onClick={this.removeBookmark}>Remove from Bookmarks</a>);
        } else {
            bookmarkTweet = (<a class="dropdown-item" href="" onClick={this.bookmarkTweet}>Bookmark Tweet</a>);
        }

        let tweet_content = (
            <div className="row mx-auto mt-2">
                <div className="col-sm-1 pl-2 p-0 d-flex justify-content-center">
                    <Link to={{ pathname: `/profile/${tweet.tweet_owner._id}` }}>
                        <img src={tweetOwnerImage} className="tweet_owner_image" alt="" />
                    </Link>
                </div>
                <div className="col-sm-11 row">
                    <div className="retweet-info">
                        {retweetInfo}
                    </div>
                    <div className="tweet-owner col-sm-11">
                        <Link to={{ pathname: `/profile/${tweet.tweet_owner._id}` }}><b>{tweet.tweet_owner.first_name} {tweet.tweet_owner.last_name} </b></Link>
                        <Link to={{ pathname: `/profile/${tweet.tweet_owner._id}` }}>@{tweet.tweet_owner.user_name}</Link> . {new Date(tweet.tweet_date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                    </div>
                    <div className="col-sm-1">
                        <div className="btn-group">
                            <button type="button" className="btn dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className="sr-only">Toggle Dropdown</span>
                            </button>
                            <div class="dropdown-menu">
                                {deleteTweet}
                                {bookmarkTweet}
                            </div>
                        </div>

                    </div>
                    <div className="tweet-text col-sm-12">
                        {tweet.tweet_text}
                    </div>
                    <div className="tweet-text col-sm-12">
                        {hashtags}
                    </div>
                    {tweetImages}
                    {tweetActionDetails}
                    <TweetActions data={tweet} handleLike={this.handleLike} />
                </div>
            </div>
        );
        if (!tweet.showDetails) {
            tweet_content = (
                <Link to={{ pathname: "/tweet", state: { tweet_id: tweet._id } }}>
                    {tweet_content}
                </Link>
            );
        }
        return (
            <div className="row mx-auto tweet-card">
                {tweet_content}
            </div>
        );
    }
}

export default TweetCard;