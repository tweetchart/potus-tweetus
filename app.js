/*
 POTUS Tweet Charts <https://github.com/tweetchart/potus-tweetus/>
 Copyright © 2020 github.com/tweetchart (tweetchart.com@gmail.com)
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 
 This software incorporates work covered by the following copyright and
 permission notice:
 
	MIT License
 
	Copyright (c) 2020 rentzhx3
 
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
 
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
 
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
 */

//https://www.sitepoint.com/number-tofixed-rounding-errors-broken-but-fixable/
Number.prototype.fixedFixed = function(args) {
    var decimals = this.toString().split('.')[1]
    if (!decimals || decimals.length <= args) return this.toFixed(args)
    return (+(this.toString() + "1")).toFixed(args)
}

//http://ditio.net/2010/05/02/javascript-date-difference-calculation/
function day_diff(d1, d2) {
    return (d2.getTime() - d1.getTime()) / (24 * 3600 * 1000);
}

function convert(date) {
    return date.replace("T", " ").replace("+0000", "").replace(".000Z", "")
}

function format(days) {
    return JSON.stringify(days || that.all_issues).replace(/\[{}*?]*?/gm, "[\n  {\n    ").replace("}]", "\n  }\n]").replaceAll("\":", "\": ").replaceAll(",\"", ",\n    \"").replaceAll("},{", "\n  },\n  {\n    ")
}

var BASE_NAME = "" + window.location.pathname.match(/(^.*)\/[^\/]*$/)[1];
var REAL_LOCATION = "" + window.location.pathname.match(/(^.*\/)[^\/]*$/)[1];

var BIDEN_NAME = "POTUS"

if (!BASE_NAME.match("POTUS44") && !BASE_NAME.match("realDonaldTrump") && !BASE_NAME.match(BIDEN_NAME)) {
    console.log(BASE_NAME)
    BASE_NAME += "/realDonaldTrump";
} else {
	REAL_LOCATION = REAL_LOCATION.replace("/POTUS44", "")
	REAL_LOCATION = REAL_LOCATION.replace("/realDonaldTrump", "")
	REAL_LOCATION = REAL_LOCATION.replace("/" + BIDEN_NAME, "")
}

var REAL_NAME = "" + BASE_NAME.match(/\/([^\/]*$)/)[1];

var OBAMA = BASE_NAME.match("POTUS44")
var BIDEN = !OBAMA && BASE_NAME.match(BIDEN_NAME)

var PARSE_LATEST = 1 & !OBAMA;
var PARSE_DATES = 0 | !!BIDEN;

console.log (PARSE_DATES)

var INFO_PATH = BASE_NAME + "/info.json";
var ISSUES_PATH = BASE_NAME + (PARSE_DATES ? "/dates.json" : "/days.json");

var OBAMA_REELECTED = new Date("2012-11-06")
var OBAMA_SECOND = new Date("2013-01-20")
var TRUMP_ELECTED = new Date("2016-11-08")
var TRUMP_PRESIDENCY = new Date("2017-01-20")
var ELECTION_DAY = new Date("2020-11-03")
var BIDEN_2021 = new Date("2021-01-20")

var EST_OFFSET = 5
var NIGHT_OFFSET = 5

function get_arc(day) {

    var s = "pre"

    if (-1 < 0) {
        s = "obama1"
    }
    if (0 && day_diff(OBAMA_REELECTED, new Date(day)) >= 0) {
        s = "election2012"
    }
    if (day_diff(OBAMA_SECOND, new Date(day)) >= 0) {
        s = "obama2"
    }

    if (OBAMA && day_diff(TRUMP_ELECTED, new Date(day)) >= 0) {
        s = "election2016"
    }

    if (day_diff(TRUMP_PRESIDENCY, new Date(day)) >= 0) s = "trump"

    if (day_diff(ELECTION_DAY, new Date(day)) >= 0) {
        s = "election2020"
    }

    if (day_diff(BIDEN_2021, new Date(day)) >= 0) {
        s = "biden"
    }

    return s;
}

function get_stats(data) {
    that.totaltweets = _.sumBy(data, function(day) {
        return day.tweets;
    });
	that.dailytweets = (data.length? that.totaltweets / data.length : 0)
    that.totaldays = data.length
    var maxtweet = _.maxBy(data, function(day) {
        return day.tweets;
    });
    that.maxtweets = maxtweet.tweets
    that.maxtweetdate = maxtweet.date
}

//Don't Sweat The DST
function get_offset(day) {
    var year = day.getFullYear();
    var index = day.getMonth() * 100 + day.getDate();

    if ((year == 2009 || year == 2015 || year == 2020) && index >= 208 && index < 1001) return 1;
    if ((year == 2008 || year == 2014 || year == 2025) && index >= 209 && index < 1002) return 1;
    if ((year == 2013 || year == 2019 || year == 2024) && index >= 210 && index < 1003) return 1;
    if ((year == 2007 || year == 2012 || year == 2018) && index >= 211 && index < 1004) return 1;
    if ((year == 2017 || year == 2023) && index >= 212 && index < 1005) return 1;
    if ((year == 2011 || year == 2016 || year == 2022) && index >= 213 && index < 1006) return 1;
    if ((year == 2010 || year == 2021) && index >= 214 && index < 1007) return 1;

    return 0
}

function get_day(d) {
    var day = new Date(d.replace(/ $/, " 12:00:00").replace(/Z?$/, "Z"))

    day.setHours(day.getHours() - EST_OFFSET + get_offset(day))
    day.setHours(day.getHours() - NIGHT_OFFSET)

    if (!day.toJSON()) console.log(d.date + ".")
    day = day.toJSON().slice(0, 10)

    return day;
}

function dailify(data) {
    data = _.sortBy(data, ['date'])
    daily = []
    var date = ""
    data.forEach(function(d) {

        var day = get_day(d.date)

        if (day == date) {
            daily[daily.length - 1].tweets++;
            return;
        }

        while (date != day) {
            if (!date) date = day
            else {
                date = new Date(date)
                date.setUTCDate(date.getUTCDate() + 1)
                date = new Date(date).toJSON().slice(0, 10)
            }

            daily.push({
                date: date,
                tweets: 0,
                day: date.slice(8, 10),
                month: date.slice(0, 7),
                number: (+date.slice(8, 10)),
                tweeted: false,
                arc: get_arc(date)
            })
        }
        date = day
        daily[daily.length - 1].tweets++
        daily[daily.length - 1]["tweeted"] = true
    })
    return daily
}

function update(that) {


    var count = 0;
    var countPresent = 0;

    var currentYear = 0;
    var currentYearPresent = 0;
    var initIssue = 0;
    var initIssuePresent = 0;

    var lastIssue;

    that.status.overall.totalIssues = 0;
    that.status.overall.totalHiatus = 0;
    that.status.overall.totalPresent = 0;

    //_.sortBy(that.all_issues, ['data'])
    _.sortBy(that.all_issues, ['month', 'day'])
        .forEach(function(issue) {
            if (issue.day.length > 2) issue.day = issue.day.slice(3)

            that.status.overall.totalIssues++;
            if (issue["tweets"] == 0) {
                that.status.overall.totalHiatus++;
                if (countPresent > that.status.pubStreak.count) {
                    that.status.pubStreak.count = countPresent;
                    that.status.pubStreak.begin.month = currentYearPresent;
                    that.status.pubStreak.begin.issue = initIssuePresent;
                    that.status.pubStreak.end.month = lastIssue.month;
                    that.status.pubStreak.end.issue = lastIssue.day;
                }
                countPresent = 0;


                if (count === 0) {
                    currentYear = issue.month;
                    initIssue = issue.day;
                }
                count++;


            } else {
                //console.log(initIssue, initIssuePresent)
                that.status.overall.totalPresent++;
                if (count > that.status.longest.hiatusCount) {
                    that.status.longest.hiatusCount = count;
                    that.status.longest.begin.month = currentYear;
                    that.status.longest.begin.issue = initIssue;
                    that.status.longest.end.month = lastIssue.month;
                    that.status.longest.end.issue = lastIssue.day;

                }
                count = 0;


                if (countPresent === 0) {
                    currentYearPresent = issue.month;
                    initIssuePresent = issue.day;
                }
                countPresent++;
            }
            lastIssue = issue;
        });

    that.all_issues[0].offset = that.info.firstoffset ? info.firstoffset : that.all_issues[0].day - 1; //may be set in info.json as firstoffset

    that.status.current.hiatusCount = count;
    that.status.current.begin.issue = initIssue;
    that.status.current.begin.month = currentYear;

    if (that.status.current.hiatusCount > that.status.longest.hiatusCount) {
        that.status.longest.hiatusCount = that.status.current.hiatusCount;
        that.status.longest.begin.month = that.status.current.begin.month;
        that.status.longest.begin.issue = that.status.current.begin.issue;
        that.status.longest.end.month = lastIssue.month;
        that.status.longest.end.issue = lastIssue.day;
    }

    that.status.currentPubStreak.count = countPresent;
    that.status.currentPubStreak.begin.issue = initIssuePresent;
    that.status.currentPubStreak.begin.month = currentYearPresent;

    if (that.status.currentPubStreak.count > that.status.pubStreak.count) {
        that.status.pubStreak.count = that.status.currentPubStreak.count;
        that.status.pubStreak.begin.month = that.status.currentPubStreak.begin.month;
        that.status.pubStreak.begin.issue = that.status.currentPubStreak.begin.issue;
        that.status.pubStreak.end.month = lastIssue.month;
        that.status.pubStreak.end.issue = lastIssue.day;
    }

    that.status.arcs = [];


    var largest = Math.max(that.status.current.hiatusCount, that.status.longest.hiatusCount, that.status.pubStreak.count);


    that.status.currentWidth = (that.status.current.hiatusCount / largest / 0.01) + "%";
    that.status.longestWidth = (that.status.longest.hiatusCount / largest / 0.01) + "%";
    that.status.pubStreakWidth = (that.status.pubStreak.count / largest / 0.01) + "%";
    that.status.currentPubStreakWidth = (that.status.currentPubStreak.count / largest / 0.01) + "%";
    that.status.pTotalPresent = (that.status.overall.totalPresent / that.status.overall.totalIssues / 0.01) + "%";
    that.status.pTotalHiatus = (that.status.overall.totalHiatus / that.status.overall.totalIssues / 0.01) + "%";


    // extract major hiatuses // and streaks?

    var last_issue = {};
    var last_break = {}
    var hiatus_count = 0;
    var streak_count = 0;
    var last_begin = {};
    var last_start = {};

    var hiatuses = [];
    var streaks = [];
    var greatest = 0;
    var longest = 0;
    _.sortBy(that.all_issues, ['month', 'day']).forEach(function(issue) {
        if (last_issue) {
            if (last_issue.tweeted && !issue.tweeted) {
                hiatus_count = 0;
                last_begin = issue;
                if (streak_count > that.info.major_streak_threshold) {
                    streaks.push({
                        start: last_start.month + '-' + last_start.day,
                        end: last_issue.month + '-' + last_issue.day,
                        total: streak_count
                    });
                    if (streak_count > longest) {
                        longest = streak_count;
                    }
                }

            } else if (!last_issue.tweeted && issue.tweeted) {
                streak_count = 0;
                last_start = issue;


                if (hiatus_count > that.info.major_hiatus_threshold) {
                    hiatuses.push({
                        start: last_begin.month + '-' + last_begin.day,
                        end: last_issue.month + '-' + last_issue.day,
                        total: hiatus_count
                    });
                    if (hiatus_count > greatest) {
                        greatest = hiatus_count;
                    }
                }


            }

        }
        last_issue = issue;
        if (!issue.tweeted) {
            hiatus_count++;
        } else {
            streak_count++;
        }
    });

    if (!last_issue.tweeted && hiatus_count >= that.info.major_hiatus_threshold) {
        hiatuses.push({
            start: last_begin.month + '-' + last_begin.day,
            end: (!that.info.ongoing ? last_issue.month + '-' + last_issue.day : '??'),
            total: hiatus_count
        });
        if (hiatus_count > greatest) {
            greatest = hiatus_count;
        }
    }

    if (last_issue.tweeted && streak_count >= that.info.major_streak_threshold) {
        streaks.push({
            start: last_start.month + '-' + last_start.day,
            end: (!that.info.ongoing ? last_issue.month + '-' + last_issue.day : '??'),
            total: streak_count
        });
        if (streak_count > longest) {
            longest = streak_count;
        }
    }

    for (var i = 0; i < hiatuses.length; i++) {
        hiatuses[i].viewProportion = (hiatuses[i].total / greatest / 0.01) + "%";
    }
    that.major_hiatuses = hiatuses;


    for (var i = 0; i < streaks.length; i++) {
        streaks[i].viewProportion = (streaks[i].total / longest / 0.01) + "%";
    }
    that.major_streaks = streaks;

    //	console.log(that.streaks_by_year, that.hiatuses_by_year)


    if (!that.hiatuses_by_year) {
        return setTimeout(update, 200, that)
    }

    that.streaks_by_year = _.sortBy(that.hiatuses_by_year, ['month']);

    //	console.log(that.streaks_by_year, that.$refs.yearlyCanvas)

    if (!that.$refs.yearlyCanvas) {
        return setTimeout(update, 200, that)
    }

    that.initGraph(that.$refs.yearlyCanvas, 'line')
    that.initYearGraph(that.$refs.tweetlyCanvas, 'line')
    that.initTimeGraph(that.$refs.timelyCanvas, 'line')

}


var app = new Vue({
    el: '#app',
    data: {
        graph: null,
        yearGraph: null,
        timeGraph: null,
        all_issues: [],
        totaltweets: 0,
        dailytweets: 0,
        totaldays: 0,
        maxtweets: 0,
        maxtweetdate: "",
        maxmonthtweets: 0,
        maxmonth: "",
        streaks_by_year: [],
        status: {
            current: {
                begin: {},
                hiatusCount: 0
            },
            longest: {
                begin: {},
                end: {},
                hiatusCount: 0
            },
            pubStreak: {
                begin: {},
                end: {},
                count: 0
            },
            currentPubStreak: {
                begin: {},
                count: 0
            },
            overall: {
                totalIssues: 0,
                totalPresent: 0,
                totalHiatus: 0
            }
        },
        show_defrag: false,
        defrag: false,
        show_arcs: false,
        show_size: false,
        show_opacity: false,
        show_disqus: false,
        hide_cap: false,
        info: {},
        url: "",
        REAL_LOCATION: "",
        major_hiatuses: [],
        major_streaks: []
    },
    computed: {
        issues_by_year: function() {
            var defrag = this.defrag
            var data = [];
            var t = _.groupBy(this.all_issues, 'month');
            Object.keys(t)
                .sort()
                .reverse()
                .forEach(function(key) {
                    if (defrag) {
                        data.push({
                            month: key,
                            issues: _.orderBy(t[key], ["tweeted", "tweets", "day"], ["desc", "desc", "asc"])
                        });
                    } else {
                        data.push({
                            month: key,
                            issues: _.orderBy(t[key], ["day"], ["asc"])
                        });
                    }
                });
            return data;
        },

        hiatuses_by_year: function() {

            var data = [];

            this.issues_by_year.forEach(function(group) {

                var total_released = _.sumBy(group.issues, function(issue) {
                    return issue.tweeted ? 1 : 0;
                });


                var total_tweets = _.sumBy(group.issues, function(issue) {
                    return issue.tweets;
                });

                if (total_tweets > that.maxmonthtweets) {
                    that.maxmonthtweets = total_tweets
                    that.maxmonth = group.month
                }

                var total_issues = group.issues.length;

                var total_hiatus = total_issues - total_released;

                var percent = (total_hiatus / total_issues / 0.01).fixedFixed(0);


                data.push({
                    'month': group.month,
                    'total_hiatus': total_hiatus,
                    'total_released': total_released,
                    'total_issues': total_issues,
                    'total_tweets': total_tweets,
                    'percent': percent

                });
            });
            return data;

        }
    },
    mounted: function() {

        that = this;
        that.url = window.location.href;

        that.REAL_LOCATION = REAL_LOCATION;

        axios.get(INFO_PATH)
            .then(function(response) {
                that.info = response.data;
                that.info.arcs.reverse();
                document.title = "@" + that.info.series_name + " Tweet Chart";

                a2a_config.templates.twitter = {
                    text: "@" + that.info.series_name + " #TweetChart" + " @realTweetChart ${link}",
                    related: "realTweetChart,Twitter"
                };
            }).then(function() {
                axios.get(ISSUES_PATH)
                    .then(function(response) {

                        data = response.data

                        if (PARSE_DATES) {
							that.all_issues = dailify(data);
                            //console.log(format(that.all_issues))
//							that.all_issues = that.all_issues.slice(0, that.all_issues.length-1)
						  
						  function load_tweets(that) {
						  var frame = document.querySelector('#twitter-widget-0')
						  
						  if (!frame) return setTimeout(load_tweets, 500, that);
						  
						  var list = frame.contentWindow.document.querySelectorAll('.timeline-Tweet')
						  if (list.length == 0) return setTimeout(load_tweets, 500, that);
						  
						  var last = Array.from(list).filter(d => !d.classList.contains("timeline-Tweet--isRetweet"))
						  
						  if (last.length == 0) last = "";
						  else last = last[last.length - 1].querySelector('time.dt-updated')
						  
						  if (!last || (convert(last.dateTime)) > data[data.length - 1].date) {
						  var button = frame.contentWindow.document.querySelector('.timeline-LoadMore-prompt.timeline-ShowMoreButton')
						  button.click()
						  return setTimeout(load_tweets, 500, that)
						  
						  
						  }
						  list = Array.from(list).map(d => ({
															date: convert(d.querySelector('time.dt-updated').dateTime),
															rt: d.classList.contains("timeline-Tweet--isRetweet")
															})).reverse()
						  
						  if (list[0].rt) list[0].date = "";
						  
						  for (i = 1; i < list.length; i++) {
						  if (list[i].rt) {
						  var next = list.find((d, j) => (!d.rt && j > i))
						  if (!next) {
						  list[i].date = "";
						  continue
						  }
						  if (list[i - 1].date && get_day(next.date) === get_day(list[i - 1].date)) list[i].date = list[i - 1].date
						  else list[i].date = ""
						  }
						  }
						  
						  list = (list.filter(d => d.date))
						  
						  list = list.filter(d => d.date > data[data.length - 1].date)
						  
						  data = data.concat(list);
						  
						  that.all_issues = dailify(data);
						  get_stats(that.all_issues)
						  update(that);
						  
						  };
						  
						  load_tweets(that);
						  
                        } else {
                            that.all_issues = response.data
                        }

                        get_stats(that.all_issues)

                        update(that)

                        if (PARSE_LATEST && !PARSE_DATES) {

                            axios.get("https://www.thetrumparchive.com/latest-tweets")
                                .then(function(response) {
                                    last_id = response.data[0].id
                                    last_date = convert(response.data[0].date)

                                    console.log("latest day:", "\"" + data[data.length - 1].date + "\"")

                                    newtweets = response.data.map(function(d) {
                                        return {
                                            "date": convert(d.date)
                                        }
                                    }).sort(function(a, b) {
                                        return a.date > b.date
                                    }) //response.data.reverse()
                                    newtweets = newtweets.filter(function(d, i) {
                                        if (data[data.length - 1].date == get_day(d.date) && (i == newtweets.length - 1 || data[data.length - 1].date != get_day(newtweets[i + 1].date))) console.log("last tweet:", "\"" + d.date + "\"");
                                        return get_day(d.date) > data[data.length - 1].date
                                    }) //.slice(1)

                                    if (!newtweets.length) console.log("No new tweets");
                                    else {
                                        console.log(newtweets.length + " new tweet" + (newtweets.length > 1 ? "s" : ""));

                                        data = data.concat(dailify(newtweets));
                                        that.all_issues = data;
                                        get_stats(data)
                                        update(that)
                                        console.log(JSON.stringify(newtweets).replace(/\[\s*{}*?]*?/gm, ",\n  {\n    ").replace("}]", "\n  }").replaceAll("\":", "\": ").replaceAll("},{", "\n  },\n  {\n    "))
                                    }


                                    function load_last(that) {

                                        var frame = document.querySelector('#twitter-widget-0')
                                        if (!frame) return setTimeout(load_last, 500, that);

                                        var list = frame.contentWindow.document.querySelectorAll('.timeline-Tweet')
                                        if (list.length == 0) return setTimeout(load_last, 500, that);

                                        var last = Array.from(list).findIndex(d => d.getAttribute("data-tweet-id") == last_id)

                                        if (last == -1) {
                                            var button = frame.contentWindow.document.querySelector('.timeline-LoadMore-prompt.timeline-ShowMoreButton')
                                            button.click()
                                            return setTimeout(load_last, 500, that)
                                        }

                                        list = Array.from(list).map(d => ({
                                            date: convert(d.querySelector('time.dt-updated').dateTime),
                                            rt: d.classList.contains("timeline-Tweet--isRetweet"),
                                            id: d.getAttribute("data-tweet-id")
                                        })).reverse()

                                        last = list.findIndex(d => d.id == last_id)

                                        list = list.filter((d, i) => i > last)

                                        var first = list.find(d => !d.rt)
                                        if (!first) return;

                                        if (list[0].rt) {
                                            if (get_day(first.date) == data[data.length - 1].date) list[0].date = last_date
                                            else list[0].date = "";
                                        }

                                        for (i = 1; i < list.length; i++) {
                                            if (list[i].rt) {
                                                var next = list.find((d, j) => (!d.rt && j > i))
                                                if (!next) {
                                                    list[i].date = "";
                                                    continue
                                                }
                                                if (list[i - 1].date && get_day(next.date) === get_day(list[i - 1].date)) list[i].date = list[i - 1].date
                                                else list[i].date = ""
                                            }
                                        }

                                        console.log(list)
                                        list = dailify(list.filter(d => d.date))

                                        if (!list.length) return;

                                        if (list[0].date == data[data.length - 1].date) {
                                            data[data.length - 1].tweets += list[0].tweets
                                            list = list.slice(1)
                                        }

                                        data = data.concat(list);
                                        that.all_issues = data;
                                        get_stats(data)
                                        update(that);

                                    };

                                    load_last(that);


                                })
                                .catch((error) => {
                                    console.log("real CORS", error)

                                    function load_tweets(that) {
                                        var frame = document.querySelector('#twitter-widget-0')

                                        if (!frame) return setTimeout(load_tweets, 500, that);

                                        var list = frame.contentWindow.document.querySelectorAll('.timeline-Tweet')
                                        if (list.length == 0) return setTimeout(load_tweets, 500, that);

                                        var last = Array.from(list).filter(d => !d.classList.contains("timeline-Tweet--isRetweet"))

                                        if (last.length == 0) last = "";
                                        else last = last[last.length - 1].querySelector('time.dt-updated')

                                        if (!last || get_day(convert(last.dateTime)) > data[data.length - 1].date) {
                                            var button = frame.contentWindow.document.querySelector('.timeline-LoadMore-prompt.timeline-ShowMoreButton')
                                            button.click()
                                            return setTimeout(load_tweets, 500, that)


                                        }
                                        list = Array.from(list).map(d => ({
                                            date: convert(d.querySelector('time.dt-updated').dateTime),
                                            rt: d.classList.contains("timeline-Tweet--isRetweet")
                                        })).reverse()

                                        if (list[0].rt) list[0].date = "";

                                        for (i = 1; i < list.length; i++) {
                                            if (list[i].rt) {
                                                var next = list.find((d, j) => (!d.rt && j > i))
                                                if (!next) {
                                                    list[i].date = "";
                                                    continue
                                                }
                                                if (list[i - 1].date && get_day(next.date) === get_day(list[i - 1].date)) list[i].date = list[i - 1].date
                                                else list[i].date = ""
                                            }
                                        }

                                        list = dailify(list.filter(d => d.date))

                                        list = list.filter(d => d.date > data[data.length - 1].date)

                                        console.log(JSON.stringify(list))
                                        //									 console.log(format(list))

                                        data = data.concat(list);
                                        that.all_issues = data;
                                        get_stats(data)
                                        update(that);

                                    };

                                    load_tweets(that);

                                })



                        }


                    });
            });

        window.disqus_config = function() {
            this.page.url = "https://tweetchart.com/" + REAL_NAME + "/";
            this.page.identifier = "__" + REAL_NAME; //home for home //__POTUS44 for potus44 // __realDonaldTrump for realdonaldtrump //__POTUS for potus
            this.page.title = "@" + REAL_NAME /** + " Tweet Chart"; /**/ //_@_a_b@c-d+e_
            this.callbacks.onReady.push(function(d) {
                show_disqus = 1;
            });
        };


        (function() {
            var d = document,
                s = d.createElement('script');

            s.src = 'https://tweetchart.disqus.com/embed.js';

            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();


        if (PARSE_LATEST)(function() {

            var d = document,
                s = d.createElement('script'),
                a = d.createElement('a');

            a.setAttribute('class', 'twitter-timeline')
            a.setAttribute('href', 'https://twitter.com/' + BASE_NAME.match(/\/([^\/]*$)/)[1] + '?ref_src=twsrc%5Etfw')

            s.src = 'https://platform.twitter.com/widgets.js';
            s.setAttribute('charset', "utf-8")
            s.setAttribute('async', "")
            s.setAttribute('data-timestamp', +new Date());

            d.body.appendChild(a);
            (d.head || d.body).appendChild(s);

        })();

    },
    methods: {
        copyUrl: async function copyPageUrl() {
            try {
                await navigator.clipboard.writeText(location.href);
                console.log('Page URL copied to clipboard');
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        },


        displayKonami: function() {
            this.show_defrag = !this.show_defrag
            //if(this.show_defrag) document.querySelector("#konami").scrollIntoView({behavior:"smooth"})
        },

        initGraph: function(canvas, type) {

            if (this.graph) this.graph.destroy()
            var percentize = function(value, index, values) {
                return value + '%';
            }

            var mapToYear = function(info) {
                return info.month;
            };
            var mapToTotalReleased = function(info) {
                return (info.total_released / info.total_issues * 100);
            };

            var mapToLabel = function(info) {
                return info.total_released + " of " + info.total_issues + " days (" + (info.total_released / info.total_issues * 100).fixedFixed(01).replace(".0", "") + "%)";
            };

            var data = this.streaks_by_year


            var labels = data.map(mapToYear);

            var labelset = data.map(mapToLabel)

            var dataset = data.map(mapToTotalReleased);

            this.graph = new Chart(canvas, {
                type: type,
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataset,
                        label: labelset
                    }]
                },
                options: {


                    tooltips: {
                        displayColors: false,
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return data.datasets[tooltipItem.datasetIndex].label[tooltipItem.index];
                            }
                        }
                    },
                    scales: {
                        yAxes: [{

                            ticks: {
								callback: function(value, index, values) {
								return value.fixedFixed(BIDEN?1:0) + "%";
								}
                            }

                        }]
                    },
                    animation: {
                        animateScale: true
                    },
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false

                }
            });
        },

        initYearGraph: function(canvas, type) {
            if (this.yearGraph) this.yearGraph.destroy()

            var mapToYear = function(info) {
                return info.month;
            };
            var mapToTotalReleased = function(info) {
                return (info.total_tweets / info.total_issues) //.fixedFixed(01).replace(".0","")
            };


            var mapToLabel = function(info) {
                if (info.totalIssues == 0) return "No dates yet"
                var ratio = (info.total_tweets / info.total_issues)
                var ratio = (ratio % 1 == 0 ? ratio.fixedFixed(0) : (ratio < 0.995 ? ratio.fixedFixed(2) : ratio.fixedFixed(1))).replace(/\.?0*$/, "")
                return "" + info.total_tweets + " tweets (" + ratio + " daily)" // in "+info.total_issues+" days)"
            };


            var data = this.streaks_by_year


            var labels = data.map(mapToYear);


            var labelset = data.map(mapToLabel)


            var dataset = data.map(mapToTotalReleased);


            this.yearGraph = new Chart(canvas, {
                type: type,
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataset,
                        label: labelset
                    }]
                },
                options: {
                    tooltips: {
                        displayColors: false,
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return data.datasets[tooltipItem.datasetIndex].label[tooltipItem.index];
                            }
                        }
					},
                    animation: {
                        animateScale: true
                    },
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false

                }
            });
        },


        initTimeGraph: function(canvas, type) {

            if (this.timeGraph) this.timeGraph.destroy()
            var mapToYear = function(info) {
                return info.month;
            };
            var mapToTotalReleased = function(info) {
                return (info.total_issues / info.total_tweets * 24 * 60)
            };

            var mapToLabel = function(info) {
                if (info.total_tweets == 0) return "No tweets"

                var time = (info.total_issues * 24 * 60)

                //Don't Sweat The DST
                if (info.month.match(/03$/)) time -= 60
                if (info.month.match(/^2009/) || info.month.match(/^2015/) || info.month.match(/^2020/) || info.month.match(/^2026/)) {
                    if (info.month.match(/10$/)) time += 60;
                } else if (info.month.match(/11$/)) time += 60;

                time = time / info.total_tweets

                var s = ""
                if (time >= 60 * 24 - 30) {
                    if (time % (60 * 24) >= 24 * 60 - 30 || time % (60 * 24) < 30) time = Math.round(time / 60 / 24) * 60 * 24
                    s += Math.floor(time / 60 / 24) + " day" + (Math.floor(time / 60 / 24) >= 2 ? "s " : " ")
                    time = time % (60 * 24)
                }
                if (time >= 60 - 0.5 || s.length && Math.round(time)) {
                    if (time % (60) >= 59.5 || time % (60) < 0.5 || s.length) time = Math.round(time / 60) * 60
                    s += Math.floor(time / 60) + " hour" + (Math.floor(time / 60) >= 2 ? "s " : " ")
                    time = time % (60)
                }
                if (time >= 1 - 1 / 60 / 2 || s.length && Math.round(time)) {
                    if ((time * 60) % (60) >= 60 - 1 / 120 || (time * 60) % (60) < 1 / 120 || s.length || time >= 10 - 1 / 120) time = Math.round(time)
                    s += Math.floor(time) + " min" + (Math.floor(time) >= 2 ? "s " : " ")
                    time = time - Math.floor(time)
                }

                time *= 60
                if (time > 0.5 && Math.round(time) && s.length <= 5) {
                    s += Math.round(time) + " sec" + (Math.round(time) >= 2 ? "s " : " ")
                }

                return s + "(" + info.total_tweets + " tweets)";
            };

            var data = this.streaks_by_year


            var labels = data.map(mapToYear);

            var labelset = data.map(mapToLabel)

            var dataset = data.map(mapToTotalReleased);


            this.timeGraph = new Chart(canvas, {
                type: type,
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataset,
                        label: labelset
                    }]
                },

                options: {
                    tooltips: {
                        displayColors: false,
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return data.datasets[tooltipItem.datasetIndex].label[tooltipItem.index];
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            type: 'logarithmic',

                            ticks: {
                                callback: function(value, index, values) {
                                    if (!OBAMA) {
                                        if (value == 30) return "30 mins"
                                        if (value == 60) return "1 hour"
                                        if (value == 300) return "5 hours"
                                    }
                                    if (value == 600) return "10 hours"
                                    if (value == 2000) return "> 1 day"
                                    if (value == 7000) return "5 days"
                                    if (value == 20000) return "2 weeks"
                                    if (value == 40000) return "1 tweet"



                                    //return ((value+"")[0] == 1)? value + " mins": '';
                                }
                            }

                        }]
                    },
                    animation: {
                        animateScale: true
                    },
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false

                }
            });
        }

    }
});