/*!
  * Alphaxcore.js v1.2.0
  * Copyright 2020 Authors MinerNL
  * Copyright 2021 Authors AlphaX Projects
*/

var WebURL         = "https://test.novagrid.online/";
var API            = "https://test.novagrid.online/api/";
var stratumAddress = "stratum.novagrid.online";

currentPage = "index";

console.log('MiningCore.WebUI : ', WebURL);		                      // Returns website URL
console.log('API address used : ', API);                                      // Returns API URL
console.log('Stratum address  : ', "stratum+tcp://" + stratumAddress + ":");  // Returns Stratum URL
console.log('Page Load        : ', window.location.href);                     // Returns full URL


// Check browser compatibility
var nua = navigator.userAgent;
var is_IE = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Trident') > -1) && !(nua.indexOf('Chrome') > -1));
if(is_IE) {console.log('Running in IE browser is not supported - ', nua);}


// General formatter function
function _formatter(value, decimal, unit) {
	if (value === 0) {
	return "0 " + unit;
	} else {
	var si = [
	{ value: 1, symbol: "" },
	{ value: 1e3, symbol: "k" },
	{ value: 1e6, symbol: "M" },
	{ value: 1e9, symbol: "G" },
	{ value: 1e12, symbol: "T" },
	{ value: 1e15, symbol: "P" },
	{ value: 1e18, symbol: "E" },
	{ value: 1e21, symbol: "Z" },
	{ value: 1e24, symbol: "Y" }
	];
	for (var i = si.length - 1; i > 0; i--) {
	if (value >= si[i].value) {
	break;
	}
	}
	return ((value / si[i].value).toFixed(decimal).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + " " + si[i].symbol + unit);
	}
}


// Time convert Local -> UTC
function convertLocalDateToUTCDate(date, toUTC) {
	date = new Date(date);
	var localOffset = date.getTimezoneOffset() * 60000;
	var localTime = date.getTime();
	if (toUTC) {
	date = localTime + localOffset;
	} else {
	date = localTime - localOffset;
	}
	newDate = new Date(date);
	return newDate;
}


// Time convert UTC -> Local
function convertUTCDateToLocalDate(date) {
	var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
	var localOffset = date.getTimezoneOffset() / 60;
	var hours = date.getUTCHours();
	newDate.setHours(hours - localOffset);
	return newDate;
}


// String convert -> Date
function dateConvertor(date){
   var options = {  
     year: "numeric",  
     month: "numeric",  
     day: "numeric"
   };  

   var newDateFormat = new Date(date).toLocaleDateString("en-US", options); 
   var newTimeFormat = new Date(date).toLocaleTimeString();  
   var dateAndTime = newDateFormat +' '+ newTimeFormat        
   return dateAndTime
}


// Scroll to top of the page
function scrollPageTop() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
	var elmnt = document.getElementById("page-scroll-top");

	if (elmnt) {
		elmnt.scrollIntoView();
	} else {
		console.warn("âš ï¸ Warning: Element #page-scroll-top not found. Skipping scroll.");
	}
}


// Check if file exits
function doesFileExist(urlToFile) {
	var xhr = new XMLHttpRequest();
	xhr.open('HEAD', urlToFile, false);
	xhr.send();
	if (xhr.status == "404") {
	return false;
	} else {
	return true;
	}
}


// Generate Coin based sidebar
function loadNavigation() {
	return $.ajax(API + "pools")
	.done(function(data) {
	var coinLogo = "";
	var coinName = "";
	var poolList = "<ul class='navbar-nav'>";
        $.each(data.pools, function(index, value) {
		poolList += "<li class='nav-item'>";
		poolList += "<a href='#" + value.id.toLowerCase() + "' class='nav-link coin-header" + (currentPool == value.id.toLowerCase() ? " coin-header-active" : "") + "'>"
		poolList += "<img  src='coinlogo/" + value.coin.type.toLowerCase() + ".png'> " + value.coin.type;
		poolList += "</a>";
		poolList += "</li>";
	if (currentPool === value.id) {
		coinLogo = "<img class='avatar-img rounded-circle' src='coinlogo/" + value.coin.type.toLowerCase() + ".png'>";
		coinName = value.coin.name;
		if (typeof coinName === "undefined" || coinName === null) {
		coinName = value.coin.type;
		} 
	}
	});
	poolList += "</ul>";	  
	if (poolList.length > 0) {
        $(".coin-list-header").html(poolList);
	}  
	var sidebarList = "";
	const sidebarTemplate = $(".sidebar-template").html();
	sidebarList += sidebarTemplate
	.replace(/{{ coinId }}/g, currentPool)
	.replace(/{{ coinLogo }}/g, coinLogo)
	.replace(/{{ coinName }}/g, coinName)
	$(".sidebar-wrapper").html(sidebarList);
	$("a.link").each(function() {
		if (localStorage[currentPool + "-walletAddress"] && this.href.indexOf("/dashboard") > 0)
		{
		this.href = "#" + currentPool + "/dashboard?address=" + localStorage[currentPool + "-walletAddress"];
		} 
	});
	})
	.fail(function() {
	$.notify(
	{message: "Error: No response from API.<br>(loadNavigation)"},
	{type: "danger",timer: 3000}
	);
	});
}


// Load Index page content
function loadIndex() {
	$("div[class^='page-']").hide();  
	$(".page").hide();
	$(".wrapper").show();
	$(".footer").show();

	var hashList = window.location.hash.split(/[#/?=]/);
	currentPool    = hashList[1];
	currentPage    = hashList[2];
	currentAddress = hashList[3];

	if (currentPool && !currentPage)
	{currentPage ="stats";}

	else if(!currentPool && !currentPage)
	{currentPage ="index";}

	if (currentPool && currentPage) {
	loadNavigation();
	$(".main-index").hide();
	$(".main-pool").show();
	$(".page-" + currentPage).show();
	$(".sidebar").show();
	} else {
	$(".main-index").show();
	$(".main-pool").hide();
	$(".page-index").show();
	$(".sidebar").hide();
	}
  
	if (currentPool) {
	$("li[class^='nav-']").removeClass("active");
	switch (currentPage) {

      	case "stats":
	console.log('Loading Stats page content');
	$(".nav-stats").addClass("active");
        loadStatsPage();
        break;

      	case "dashboard":
	console.log('Loading Dashboard page content');
        $(".nav-dashboard").addClass("active");
	loadDashboardPage();
        break;

	case "miners":
	console.log('Loading Miners page content');
        $(".nav-miners").addClass("active");
	loadMinersPage();
        break;

      	case "blocks":
	console.log('Loading Blocks page content');
	$(".nav-blocks").addClass("active");
        loadBlocksPage();
        break;

      	case "payments":
	console.log('Loading Payments page content');
	$(".nav-payments").addClass("active");
        loadPaymentsPage();
        break;

      	case "connect":
	console.log('Loading Connect page content');
        $(".nav-connect").addClass("active");
	loadConnectPage();
        break;

	case "faq":
	console.log('Loading FAQ page content');
        $(".nav-faq").addClass("active");
        break;

      	case "support":
	console.log('Loading Support page content');
        $(".nav-support").addClass("active");
        break;

      	default:
	}
	} else {
	loadWidgetMediumPage(); // Change to Big Medium Small
	}
	scrollPageTop();
}

// Load Overview page content
function loadOverview() {
	$(".wrapper").show();
	$(".footer").show();
	$(".main-overview").show();
	$(".page-overview").show();
  
	loadOverviewPage();

	scrollPageTop();
}

// Load Widget big page content
function loadWidgetBigPage() {
	console.log('Loading big widget page content');
	return $.ajax(API + "pools")
	.done(function(data) {  
	var poolCoinWidgetBigTemplate = "";
      	$.each(data.pools, function(index, value) {
        var coinLogo = "<img class='coinimg' src='coinlogo/" + value.coin.type.toLowerCase() + ".png'>";
		var coinName = value.coin.name;
		if (typeof coinName === "undefined" || coinName === null) {coinName = value.coin.type;}        		
		poolCoinWidgetBigTemplate += "<div class='col-md-12'>";
		poolCoinWidgetBigTemplate += "<div class='card card-dark card-pricing'>";
		poolCoinWidgetBigTemplate += "<div class='card card-header bg-dark'>";
		poolCoinWidgetBigTemplate += "<div class='profile-picture'>";
		poolCoinWidgetBigTemplate += "<div class='avatar avatar-xl'>";
                poolCoinWidgetBigTemplate += "<img class='avatar-img rounded-circle' src='coinlogo/" + value.coin.type.toLowerCase() + ".png'>";
                poolCoinWidgetBigTemplate += "</div>";
                poolCoinWidgetBigTemplate += "</div>";
                poolCoinWidgetBigTemplate += "</div>";
		poolCoinWidgetBigTemplate += "<div class='card-body'>";
		poolCoinWidgetBigTemplate += "<ul class='specification-list'>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Name</span>";
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + coinName + "</span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Effort</span>"; 
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + (value.poolEffort * 100).toFixed(2) + " %</span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Payout</span>"; 
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + value.paymentProcessing.payoutScheme + "</span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Pool Fee</span>";
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + value.poolFeePercent + " %</span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Chain Height</span>";
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + value.networkStats.blockHeight + " </span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Network Hashrate</span>";
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + _formatter(value.networkStats.networkHashrate, 3, "H/s") + " </span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Network Diff</span>";
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + _formatter(value.networkStats.networkDifficulty, 3, "H/s") + " </span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Pool Hashrate</span>";
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + _formatter(value.poolStats.poolHashrate, 3, "H/s") + " </span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "<li>";
		poolCoinWidgetBigTemplate += "<span class='name-specification'>Pool Miner's</span>";
		poolCoinWidgetBigTemplate += "<span class='status-specification'>" + value.poolStats.connectedMiners + " </span>";
		poolCoinWidgetBigTemplate += "</li>";
		poolCoinWidgetBigTemplate += "</ul>";
		poolCoinWidgetBigTemplate += "</div>";
		poolCoinWidgetBigTemplate += "<div class='card-footer'>";
		poolCoinWidgetBigTemplate += "<button class='btn btn-primary btn-block'><a href='#" + value.id.toLowerCase() + "'<span><h3> GO MINE -> " + coinName + " </h3></span></a></button>";
		poolCoinWidgetBigTemplate += "</div>";
		poolCoinWidgetBigTemplate += "</div>";
		poolCoinWidgetBigTemplate += "</div>";
	});
	$(".pool-coin-widget-big").html(poolCoinWidgetBigTemplate);
	})
	.fail(function() {
		var poolCoinWidgetBigTemplate = "";
		poolCoinWidgetBigTemplate += "<div class='col-md-12'>";
		poolCoinWidgetBigTemplate += "<tr><td colspan='8'>";
		poolCoinWidgetBigTemplate += "<div class='alert alert-warning'>";
		poolCoinWidgetBigTemplate += "<h4><i class='fas fa-exclamation-triangle'></i> Warning!</h4>";
		poolCoinWidgetBigTemplate += "<hr>";
		poolCoinWidgetBigTemplate += "<p>The pool is currently down for maintenance.</p>";
		poolCoinWidgetBigTemplate += "<p>Please try again later.</p>";
		poolCoinWidgetBigTemplate += "</div>";
		poolCoinWidgetBigTemplate += "</td></tr>";  
	$(".pool-coin-widget-big").html(poolCoinWidgetBigTemplate);  
	});
}

// Load Widget medium page content
function loadWidgetMediumPage() {
    console.log("Loading cached coin prices...");

    // Load CoinPaprika prices first
    $.ajax("https://test.novagrid.online/assets/data/coinpaprika_prices.json", {
        cache: false,
        success: function (coinPaprikaData) {
            console.log("CoinPaprika Prices Loaded");

            // Load CoinGecko prices as a backup
            $.ajax("https://test.novagrid.online/assets/data/coingecko_prices.json", {
                cache: false,
                success: function (coinGeckoData) {
                    console.log("CoinGecko Prices Loaded");

                    // Fetch mining pool data
                    $.ajax(API + "pools")
                        .done(function (data) {
                            if (!data.pools) {
                                console.error("ERROR: 'pools' data is missing from API response.");
                                return;
                            }

                            let poolCoinWidgetMediumTemplate = "";
                            let sortedPools = data.pools.sort((a, b) => a.coin.name.localeCompare(b.coin.name));

                            $.each(sortedPools, function (index, pool) {
                                let paprikaId = pool.coin.coinpaprikaName 
                                    ? pool.coin.coinpaprikaName.toLowerCase().trim() 
                                    : null;
                                let geckoId = pool.coin.coinGeckoName 
                                    ? pool.coin.coinGeckoName.toLowerCase().trim() 
                                    : null;
                                let coinSymbol = pool.coin.type.toLowerCase().trim();
                                let coinName = pool.coin.name;
                                let coinPriceUSD = null;  // Set to null initially
                                let priceSource = ""; // Empty string initially

                                // Fetch CoinPaprika price
                                if (paprikaId && coinPaprikaData[paprikaId] && typeof coinPaprikaData[paprikaId].price !== "undefined") {
                                    coinPriceUSD = `$${parseFloat(coinPaprikaData[paprikaId].price).toFixed(8)}`;
                                    priceSource = "CoinPaprika Price";
                                }
                                // Fetch CoinGecko price as a backup
                                else if (geckoId && coinGeckoData[geckoId] && typeof coinGeckoData[geckoId].price !== "undefined") {
                                    coinPriceUSD = `$${parseFloat(coinGeckoData[geckoId].price).toFixed(8)}`;
                                    priceSource = "CoinGecko Price";
                                }

                                // If no price is available, set the text properly
                                let priceDisplay = coinPriceUSD ? `<strong>${priceSource}:</strong> ${coinPriceUSD}` : "Price Not Available";

                                console.log(`Processing: ${coinName} - ${priceDisplay}`);

                                poolCoinWidgetMediumTemplate += `
                                    <div class="col-md-4">
                                        <div class="med-box med-box-widget med-widget-user">
                                            <div class="med-widget-user-header bg-night">
                                                <button class='btn btn-outline-success btn-round btn-sm float-right'>
                                                    <a href='#${pool.id.toLowerCase()}'>
                                                        <span class='btn-label'>Start Mining&nbsp;&nbsp;
                                                            <img src='coinlogo/${coinSymbol}.png' height='20' width='20'>
                                                        </span>
                                                    </a>
                                                </button>
                                                <h3 class='med-widget-user-username'>${coinName}</h3>
                                            </div>
                                            <div class="med-widget-user-image">
                                                <img class='avatar-img rounded-circle' src='coinlogo/${coinSymbol}.png'>
                                            </div>
                                            <div class="med-box-footer">
                                                <div class="row">
                                                    <div class="col-sm-4 med-border-right">
                                                        <div class="med-description-block">
                                                            <h5 class="med-description-header">${pool.coin.algorithm}</h5>
                                                            <span class="med-description-text">Algorithm</span>
                                                        </div>
                                                    </div>
                                                    <div class="col-sm-4 med-border-right">
                                                        <div class="med-description-block">
                                                            <h5 class="med-description-header">${pool.paymentProcessing.payoutScheme}</h5>
                                                            <span class="med-description-text">Payout</span>
                                                        </div>
                                                    </div>
                                                    <div class="col-sm-4">
                                                        <div class="med-description-block">
                                                            <h5 class="med-description-header">${pool.poolFeePercent} %</h5>
                                                            <span class="med-description-text">Pool Fee</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="text-center mt-3">${priceDisplay}</div>
                                            </div>
                                        </div>
                                    </div>`;
                            });

                            $(".pool-coin-widget-medium").html(poolCoinWidgetMediumTemplate);
                        })
                        .fail(function () {
                            $(".pool-coin-widget-medium").html(
                                "<div class='alert alert-warning'>The pool is currently down for maintenance.</div>"
                            );
                        });
                },
                error: function () {
                    console.error("ERROR: Failed to load CoinGecko prices.");
                },
            });
        },
        error: function () {
            console.error("ERROR: Failed to load CoinPaprika prices.");
        },
    });
}


// Load Widget small page content
function loadWidgetSmallPage() {
	console.log('Loading small widget page content');
	return $.ajax(API + "pools")
	.done(function(data) {
	var poolCoinWidgetSmallTemplate = "";
	$.each(data.pools, function(index, value) {
	var coinLogo = "<img class='coinimg' src='coinlogo/" + value.coin.type.toLowerCase() + ".png'>";
		var coinName = value.coin.name;
						var coinName = value.coin.name;
						if (typeof coinName === "undefined" || coinName === null) {coinName = value.coin.type;}
						poolCoinWidgetSmallTestTemplate += "<div class='col-md-4'>";
						poolCoinWidgetSmallTestTemplate += "<div class='card card-round'>";
						poolCoinWidgetSmallTestTemplate += "<div class='card-body'>";
						//poolCoinWidgetSmallTestTemplate += "<div class='card-fee fw-light float-right text-info'><h6>Pool Fee: " + value.poolFeePercent + " %</h6></div>";
						poolCoinWidgetSmallTestTemplate += "<center><div class='card-title fw-bold'>" + coinName + "</div></center>";
						poolCoinWidgetSmallTestTemplate += "<div class='card-list'>";
						poolCoinWidgetSmallTestTemplate += "<div class='item-list'>";
						poolCoinWidgetSmallTestTemplate += "<div class='avatar'>";
						poolCoinWidgetSmallTestTemplate += "<img class='avatar-img rounded-circle' src='coinlogo/" + value.coin.type.toLowerCase() + ".png'>";
						poolCoinWidgetSmallTestTemplate += "</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='info-user ml-3'>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-warning'>Algo :&emsp;&emsp;" + value.coin.algorithm + "</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Payout :&emsp;" + value.paymentProcessing.payoutScheme + "</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Pool Fee :&emsp;" + value.poolFeePercent + " %</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Pool Hashrate :&emsp;" + _formatter(value.poolStats.poolHashrate, 3, "H/s") + "</div>";
						//poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Estimated Blocks :&emsp;" + (value.PoolisOfPercent * 720 / 100).toFixed(4) + "</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Estimated Blocks : " + ((value.poolStats.poolHashrate / value.networkStats.networkHashrate) * 100).toFixed(0) + " %" + "</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Pool Effort :&emsp;" + (value.poolEffort * 100).toFixed(2) + " %" + "</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Pool Miner's :&emsp;" + value.poolStats.connectedMiners + "</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Total Blocks :&emsp;" + value.totalBlocks + "</div>";
						poolCoinWidgetSmallTestTemplate += "<div class='username text-info'>Total Paid :&emsp;" + _formatter(value.totalPaid, 2,"") + "</div>";
						poolCoinWidgetSmallTestTemplate += "</div>";
						poolCoinWidgetSmallTestTemplate += "</div>";
						poolCoinWidgetSmallTestTemplate += "<center><button class='btn btn-magblue btn-round btn-sm'><a href='#" + value.id.toLowerCase() + "'<span class='btn-label'>Go Mine&nbsp;&nbsp;<img src='coinlogo/" + value.coin.type.toLowerCase() + ".png' height='20' width='20'></span></a></center></button>";
						poolCoinWidgetSmallTestTemplate += "</div>";
						poolCoinWidgetSmallTestTemplate += "</div>";
						poolCoinWidgetSmallTestTemplate += "</div>";
						poolCoinWidgetSmallTestTemplate += "</div>";
						poolCoinWidgetSmallTestTemplate += "</div>";
	});
	$(".pool-coin-widget-small").html(poolCoinWidgetSmallTemplate);
	})
	.fail(function() {
		var poolCoinWidgetSmallTemplate = "";
		poolCoinWidgetSmallTemplate += "<div class='col-md-12'>";
		poolCoinWidgetSmallTemplate += "<tr><td colspan='8'>";
		poolCoinWidgetSmallTemplate += "<div class='alert alert-warning'>";
		poolCoinWidgetSmallTemplate += "<h4><i class='fas fa-exclamation-triangle'></i> Warning!</h4>";
		poolCoinWidgetSmallTemplate += "<hr>";
		poolCoinWidgetSmallTemplate += "<p>The pool is currently down for maintenance.</p>";
		poolCoinWidgetSmallTemplate += "<p>Please try again later.</p>";
		poolCoinWidgetSmallTemplate += "</div>";
		poolCoinWidgetSmallTemplate += "</td></tr>";	  
	$(".pool-coin-widget-small").html(poolCoinWidgetSmallTemplate);	  
	});
}

// Load Overview page content
function loadOverviewPage() {
	console.log('Loading overview page content');
	return $.ajax(API + "pools")
	.done(function(data) {
	var poolOverviewTemplate = "";
	$.each(data.pools, function(index, value) {
	var coinLogo = "<img class='coinimg' src='coinlogo/" + value.coin.type.toLowerCase() + ".png'>";
	var coinName = value.coin.name;
		if (typeof coinName === "undefined" || coinName === null) {coinName = value.coin.type;}
		poolOverviewTemplate += '<tr>';
		poolOverviewTemplate += '<td>' + coinLogo + '</td>';
		poolOverviewTemplate += '<td>' + coinName + '</td>';
		poolOverviewTemplate += '<td>' + value.coin.type + '</td>';
		poolOverviewTemplate += '<td>' + value.poolStats.connectedMiners + '</td>';
		poolOverviewTemplate += '<td>' + _formatter(value.poolStats.poolHashrate, 3, "H/s") + '</td>';
		poolOverviewTemplate += '<td>' + value.networkStats.blockHeight + '</td>';
		poolOverviewTemplate += '<td>' + _formatter(value.totalPaid, 4, "") + '</td>';
		poolOverviewTemplate += "<td><button class='btn btn-outline-success btn-round btn-sm float-right'><a href='../#" + value.id.toLowerCase() + "'<span class='btn-label'>Start Mining&nbsp;&nbsp;<img src='coinlogo/" + value.coin.type.toLowerCase() + ".png' height='20' width='20'></span></a></button></td>";
		poolOverviewTemplate += '</tr>';
	});
	$("#pool-overview").html(poolOverviewTemplate);
	})
	.fail(function() {
	$.notify(
	{message: "Error: No response from API.<br>(loadOverviewPage)"},
	{type: "danger",timer: 3000}
	);
	});
}

// Load Stats page content
function loadStatsPage() {
	setInterval(
	(function load() {
	loadStatsData();
	return load;
	})(),
	60000);
	setInterval(
	(function load() {
	loadStatsChart();
	return load;
	})(),
	60000);
}


// Load Stats page data
function loadStatsData() {
	return $.ajax(API + "pools")
	.done(function(data) {
	$.each(data.pools, function(index, value) {
		if (currentPool === value.id) {
		var PoolisOfPercent = ((value.poolStats.poolHashrate / value.networkStats.networkHashrate) * 100);    	
		var roundEffort = (value.poolEffort * 100).toFixed(2);
		$("#coinName").text(value.coin.name);
		$("#coinAlgo").text(value.coin.algorithm);
		$("#blockchainHeight").text(value.networkStats.blockHeight);
		$("#connectedPeers").text(value.networkStats.connectedPeers);
		$("#minimumPayment").text(value.paymentProcessing.minimumPayment + " " + value.coin.type);
		$("#payoutScheme").text(value.paymentProcessing.payoutScheme);
		$("#rewardType").text(value.networkStats.rewardType);
		$("#poolFeePercent").text(value.poolFeePercent + " %");
		$("#poolHashRate").text(_formatter(value.poolStats.poolHashrate, 5, "H/s"));
		$("#poolMiners").text(value.poolStats.connectedMiners + " Miner(s)");
		$("#poolWorkers").text(value.poolStats.connectedWorkers + " Worker(s)");
		$("#networkHashRate").text(_formatter(value.networkStats.networkHashrate, 3, "H/s"));
		$("#networkDifficulty").text(_formatter(value.networkStats.networkDifficulty, 3, "H/s"));
		$("#lastNetworkBlock").text(dateConvertor(value.networkStats.lastNetworkBlockTime));
		$("#blockConfirmations").text(value.paymentProcessing.minimumConfirmations);
		$("#poolPercentofNetwork").text(PoolisOfPercent.toFixed(3) + " %");
		$("#poolEstimatedBlocks").text((PoolisOfPercent * 720 / 100).toFixed(4));
		$("#totalPaid").text(_formatter(value.totalPaid, 2,""));
		$("#sharesPerSecond").text(_formatter(value.poolStats.sharesPerSecond, 5, 'H/s'));
		$("#poolBlocks").text(value.totalBlocks);
		$("#lastPoolBlock").text(dateConvertor(value.lastPoolBlockTime));
		$("#poolEffort").text(roundEffort + "%");
		}
	});
	})
	.fail(function() {
	$.notify(
	{message: "Error: No response from API.<br>(loadStatsData)"},
        {type: "danger",timer: 3000}
	);
	});
}


// Load Stats page charts
function loadStatsChart() {
	return $.ajax(API + "pools/" + currentPool + "/performance")
	.done(function(data) {
	labels = [];	  
	poolHashRate = [];
	networkHashRate = [];
	networkDifficulty = [];
	connectedMiners = [];
	$.each(data.stats, function(index, value) {
	if (labels.length === 0 || (labels.length + 1) % 2 === 1) {
		var createDate = convertLocalDateToUTCDate(new Date(value.created),false);
		labels.push(createDate.getHours() + ":00");
		} else {
		labels.push("");
	}
	poolHashRate.push(value.poolHashrate);
	networkHashRate.push(value.networkHashrate);
	networkDifficulty.push(value.networkDifficulty);
	connectedMiners.push(value.connectedMiners);
	});
	var dataPoolHash	  = {labels: labels,series: [poolHashRate]};
	var dataNetworkHash       = {labels: labels,series: [networkHashRate]};
	var dataNetworkDifficulty = {labels: labels,series: [networkDifficulty]};
	var dataMiners            = {labels: labels,series: [connectedMiners]};
	var options		  = {height: "200px",showArea: true,showPoint: false,seriesBarDistance: 1,axisX: {showGrid: false},
                                     axisY: {offset: 47,scale: "logcc",labelInterpolationFnc: function(value) {return _formatter(value, 1, "H/s");}},
                                     lineSmooth: Chartist.Interpolation.simple({divisor: 2})};
	var chartMiners		  = {height: "200px",showArea: true,showPoint: false,seriesBarDistance: 1,axisX: {showGrid: false},
                                     axisY: {offset: 47,scale: "logcc",labelInterpolationFnc: function(value) {return _formatter(value, 1, "");}},
                                     lineSmooth: Chartist.Interpolation.simple({divisor: 2})};
	var responsiveOptions 	  = [["screen and (max-width: 320px)",{axisX: {labelInterpolationFnc: function(value) {return value[1];}}}]];
	Chartist.Line("#chartStatsHashRate", dataNetworkHash, options, responsiveOptions);
	Chartist.Line("#chartStatsHashRatePool",dataPoolHash,options,responsiveOptions);
	Chartist.Line("#chartStatsDiff", dataNetworkDifficulty, options, responsiveOptions);
	Chartist.Line("#chartStatsMiners", dataMiners, chartMiners, responsiveOptions);
	})
	.fail(function() {
	$.notify(
	{message: "Error: No response from API.<br>(loadStatsChart)"},
	{type: "danger",timer: 3000}
	);
	});
}


// Load Dashboard page content
function loadDashboardPage() {
    function render() {
        setInterval(
            (function load() {
                var walletAddress = $("#walletAddress").val();
                loadDashboardData(walletAddress);
                loadDashboardWorkerList(walletAddress);
                loadDashboardChart(walletAddress);
                loadDashboardPayouts(walletAddress); // Load payouts for the specific wallet
                return load;
            })(),
            60000
        );
    }

    var walletQueryString = window.location.hash.split(/[#/?]/)[3];
    if (walletQueryString) {
        var wallet = walletQueryString.replace("address=", "");
        if (wallet) {
            $("#walletAddress").val(wallet);
            localStorage.setItem(currentPool + "-walletAddress", wallet);
            render();
        }
    }

    if (localStorage[currentPool + "-walletAddress"]) {
        $("#walletAddress").val(localStorage[currentPool + "-walletAddress"]);
        render();
    }
}



// Load Dashboard wallet
function loadWallet() {
	console.log( 'Loading wallet address:',$("#walletAddress").val() );
	if ($("#walletAddress").val().length > 0) {
	localStorage.setItem(currentPool + "-walletAddress", $("#walletAddress").val() );
	}
	var coin = window.location.hash.split(/[#/?]/)[1];
	var currentPage = window.location.hash.split(/[#/?]/)[2] || "stats";
	window.location.href = "#" + currentPool + "/" + currentPage + "?address=" + $("#walletAddress").val();
}


// Load Dashboard page data

function loadDashboardData(walletAddress) {
    console.log(`Fetching Dashboard Data for ${walletAddress}...`);

    // Step 1: Load cached CoinPaprika & CoinGecko prices
    $.ajax("https://crimson-pool.com/assets/data/coinpaprika_prices.json", {
        cache: false,
        success: function (coinPaprikaData) {
            console.log("CoinPaprika Prices Loaded");

            $.ajax("https://crimson-pool.com/assets/data/coingecko_prices.json", {
                cache: false,
                success: function (coinGeckoData) {
                    console.log("CoinGecko Prices Loaded");

                    // Step 2: Fetch pool data to get the correct coin ID
                    $.ajax(API + "pools")
                        .done(function (poolsData) {
                            const currentPoolData = poolsData.pools.find(pool => pool.id === currentPool);

                            if (!currentPoolData) {
                                console.warn("Pool data is missing or invalid.");
                                $("#totalEarned").text("Unavailable");
                                return;
                            }

                            // Retrieve CoinPaprika & CoinGecko IDs
                            const paprikaId = currentPoolData.coin?.coinpaprikaName?.toLowerCase()?.trim();
                            const geckoId = currentPoolData.coin?.coinGeckoName?.toLowerCase()?.trim();

                            console.log("Coin IDs:", { paprikaId, geckoId });

                            // Step 3: Fetch miner stats for this wallet
                            $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress)
                                .done(function (data) {
                                    $("#pendingShares").text(_formatter(data.pendingShares, 0, ""));

                                    let workerHashRate = 0;
                                    if (data.performance) {
                                        $.each(data.performance.workers, function (index, value) {
                                            workerHashRate += value.hashrate;
                                        });
                                    }
                                    $("#minerHashRate").text(_formatter(workerHashRate, 3, "H/s"));
                                    $("#pendingBalance").text(_formatter(data.pendingBalance, 5, ""));
                                    $("#paidBalance").text(_formatter(data.totalPaid, 5, ""));

                                    // Calculate Lifetime Balance
                                    const lifetimeBalance = (data.pendingBalance || 0) + (data.totalPaid || 0);
                                    $("#lifetimeBalance").text(_formatter(lifetimeBalance, 5, ""));

                                    // Step 4: Get price from CoinPaprika or CoinGecko
                                    let coinPrice = null;
                                    let priceSource = "Unavailable";

                                    if (paprikaId && coinPaprikaData[paprikaId]?.price) {
                                        coinPrice = parseFloat(coinPaprikaData[paprikaId].price);
                                        priceSource = "CoinPaprika";
                                    } else if (geckoId && coinGeckoData[geckoId]?.price) {
                                        coinPrice = parseFloat(coinGeckoData[geckoId].price);
                                        priceSource = "CoinGecko";
                                    }

                                    // Step 5: Compute & Display Total Earned
                                    if (coinPrice !== null) {
                                        const totalEarned = coinPrice * lifetimeBalance;
                                        $("#totalEarned").html(`<strong>${priceSource}:</strong> $${totalEarned.toFixed(2)}`);
                                    } else {
                                        $("#totalEarned").text("Unavailable");
                                    }

                                    console.log("Total Earned Calculated:", { lifetimeBalance, coinPrice, priceSource });
                                })
                                .fail(function () {
                                    console.error("Failed to fetch miner stats.");
                                    $("#totalEarned").text("Unavailable");
                                });
                        })
                        .fail(function () {
                            console.error("Failed to fetch pool data.");
                            $("#totalEarned").text("Unavailable");
                        });
                },
                error: function () {
                    console.error("CoinGecko prices failed to load.");
                },
            });
        },
        error: function () {
            console.error("CoinPaprika prices failed to load.");
        },
    });
}


// Load Dashboard page worker
function loadDashboardWorkerList(walletAddress) {
	return $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress)
	.done(function(data) {
	var workerList = "";
	if (data.performance) {
	var workerCount = 0;
	$.each(data.performance.workers, function(index, value) {
	workerCount++;
		workerList += "<tr>";
		workerList += "<td>" + workerCount + "</td>";
		if (index.length === 0) {
		workerList += "<td>Unnamed</td>";
		} else {
		workerList += "<td>" + index + "</td>";
		}
		workerList += "<td>" + _formatter(value.hashrate, 3, "H/s") + "</td>";
		workerList += "<td>" + _formatter(value.sharesPerSecond, 3, "S/s") + "</td>";
		workerList += "</tr>";
	});
	} else {
		workerList += '<tr><td colspan="4">No Worker Connected</td></tr>';
	}
	$("#workerCount").text(workerCount);
	$("#workerList").html(workerList);
	})
	.fail(function() {
	$.notify(
	{message: "Error: No response from API.<br>(loadDashboardWorkerList)"},
	{type: "danger",timer: 3000}
	);
	});
}





// Load Dashboard page chart
function loadDashboardChart(walletAddress) {
	return $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress + "/performance")
	.done(function(data) {
	labels = [];
	minerHashRate = [];	
        $.each(data, function(index, value) {
	if (labels.length === 0 || (labels.length + 1) % 2 === 1) {
		var createDate = convertLocalDateToUTCDate(
		new Date(value.created),
		false
	);
	labels.push(createDate.getHours() + ":00");
	} else {
		labels.push("");
	}
	var workerHashRate = 0;
	$.each(value.workers, function(index2, value2) {workerHashRate += value2.hashrate;});
	minerHashRate.push(workerHashRate);
	});
	var data = {labels: labels,series: [minerHashRate]};
        var options		= {height: "200px",showArea: true,seriesBarDistance: 1,axisX: {showGrid: false},
				  axisY: {offset: 47,labelInterpolationFnc: function(value) {return _formatter(value, 1, "");}},
				  lineSmooth: Chartist.Interpolation.simple({divisor: 2})};
	var responsiveOptions 	= [["screen and (max-width: 320px)",{axisX: {labelInterpolationFnc: function(value) {return value[0];}}}]];
	Chartist.Line("#chartDashboardHashRate", data, options, responsiveOptions);
	})
	.fail(function() {
	$.notify(
	{message: "Error: No response from API.<br>(loadDashboardChart)"},
	{type: "danger",timer: 3000}
	);
	});
}

// Load dashjboard Payouts for Miner

function loadDashboardPayouts(walletAddress) {
    if (!walletAddress) {
        $("#payoutList").html('<tr><td colspan="3" class="text-center">No wallet address provided.</td></tr>');
        return;
    }

    $.ajax(API + "pools/" + currentPool + "/miners/" + walletAddress + "/payments")
        .done(function(data) {
            var payoutList = "";

            if (data.length > 0) {
                $.each(data, function(index, payout) {
                    var utcDate = new Date(payout.created);
                    var localDate = convertUTCDateToLocalDate(utcDate);

                    payoutList += "<tr>";
                    payoutList += "<td>" + localDate.toLocaleString() + "</td>"; // Payout date
                    payoutList += "<td>" + _formatter(payout.amount, 5, "") + "</td>"; // Payout amount
                    payoutList += "<td><a href='" + payout.transactionInfoLink + "' target='_blank'>" +
                                  payout.transactionConfirmationData.substring(0, 16) + " &hellip; " +
                                  payout.transactionConfirmationData.substring(payout.transactionConfirmationData.length - 16) +
                                  "</a></td>"; // Transaction link
                    payoutList += "</tr>";
                });
            } else {
                payoutList = '<tr><td colspan="3" class="text-center">No payouts available for this wallet.</td></tr>';
            }

            $("#payoutList").html(payoutList);
        })
        .fail(function() {
            $("#payoutList").html('<tr><td colspan="3" class="text-center">Error loading payouts.</td></tr>');
            $.notify(
                { message: "Error: Unable to fetch payouts.<br>(loadDashboardPayouts)" },
                { type: "danger", timer: 3000 }
            );
        });
}


// Load Miners Page

function loadMinersPage() {
    return $.ajax(API + "pools/" + currentPool + "/miners?page=0&pagesize=20")
        .done(function(data) {
            var minerList = [];
            var requests = [];

            if (data.length > 0) {
                // Loop through miners
                $.each(data, function(index, miner) {
                    var request = $.ajax(API + "pools/" + currentPool + "/miners/" + miner.miner)
                        .done(function(minerData) {
                            if (minerData.performance && minerData.performance.workers) {
                                let workers = minerData.performance.workers;
                                let workerCount = Object.keys(workers).length;

                                // Calculate current hashrate
                                let currentHashrate = 0;
                                let totalShareRate = 0;

                                $.each(workers, function(workerName, workerData) {
                                    currentHashrate += workerData.hashrate || 0;
                                    totalShareRate += workerData.sharesPerSecond || 0;
                                });

                                if (workerCount > 0) {
                                    // Add miner data to the list for sorting
                                    minerList.push({
                                        address: miner.miner,
                                        currentHashrate: currentHashrate,
                                        totalShareRate: totalShareRate,
                                        workerCount: workerCount
                                    });
                                }
                            }
                        });
                    requests.push(request);
                });

                // Wait for all requests to complete
                $.when.apply($, requests).done(function() {
                    // Sort miners by current hash rate in descending order
                    minerList.sort(function(a, b) {
                        return b.currentHashrate - a.currentHashrate;
                    });

                    // Build the table
                    let tableContent = "";
                    minerList.forEach(function(miner) {
                        tableContent += "<tr>";
                        tableContent += "<td>" + miner.address + "</td>"; // Miner address
                        tableContent += "<td>" + _formatter(miner.currentHashrate, 3, "H/s") + "</td>"; // Current hash rate
                        tableContent += "<td>" + _formatter(miner.totalShareRate, 3, "S/s") + "</td>"; // Share rate
                        tableContent += "<td>" + miner.workerCount + " Worker(s)</td>"; // Worker count
                        tableContent += "</tr>";
                    });

                    // Fallback if no miners with workers
                    if (tableContent === "") {
                        tableContent = '<tr><td colspan="4">No Miners with Connected Workers</td></tr>';
                    }
                    $("#minerList").html(tableContent);
                });
            } else {
                $("#minerList").html('<tr><td colspan="4">No Miners Available</td></tr>');
            }
        })
        .fail(function() {
            $.notify(
                { message: "Error: No response from API.<br>(loadMinersPage)" },
                { type: "danger", timer: 3000 }
            );
        });
}




// Load Blocks page content

function loadBlocksPage() {
    return $.ajax(API + "pools/" + currentPool + "/blocks?page=0&pageSize=50")
        .done(function(data) {
            var blockList = "";
            if (data.length > 0) {
                $.each(data, function(index, value) {
                    var utcDate = new Date(value.created);
                    var localDate = convertUTCDateToLocalDate(utcDate);
                    var effort = Math.round(value.effort * 100);
                    var effortClass = "";

                    if (effort < 100) {
                        effortClass = "effort1";
                    } else if (effort < 200) {
                        effortClass = "effort2";
                    } else if (effort < 500) {
                        effortClass = "effort3";
                    } else {
                        effortClass = "effort4";
                    }

                    var calcs = Math.round(value.confirmationProgress * 100);
                    blockList += "<tr>";
                    blockList += "<td>" + localDate.toLocaleString() + "</td>";
                    blockList += "<td>" + value.miner.substring(0, 8) + " &hellip; " + value.miner.substring(value.miner.length - 8) + "</td>";
                    blockList += "<td><a href='" + value.infoLink + "' target='_blank'>" + value.blockHeight + "</a></td>";
                    blockList += "<td>" + _formatter(value.networkDifficulty, 5, "H/s") + "</td>";
                    if (typeof value.effort !== "undefined") {
                        blockList += "<td><span class='" + effortClass + "'>" + effort + "%</span></td>";
                    } else {
                        blockList += "<td>n/a</td>";
                    }
                    var status = value.status;
                    if (value.status == "confirmed") {
                        blockList += "<td><span class='badge badge-success'>Confirmed</span></td>";
                    } else if (value.status == "pending") {
                        blockList += "<td><span class='badge badge-warning'>Pending</span></td>";
                    } else if (value.status == "orphaned") {
                        blockList += "<td><span class='badge badge-danger'>Orphaned</span></td>";
                    } else {
                        blockList += "<td>" + status + "</td>";
                    }
                    blockList += "<td>" + _formatter(value.reward, 5, "") + "</td>";
                    blockList += "<td><div class='progress-bar bg-info progress-bar-striped progress-bar-animated' role='progressbar' aria-valuenow='" + calcs + "' aria-valuemin='0' aria-valuemax='100' style='width: " + calcs + "%'><span>" + calcs + "% Completed</span></div></td>";
                    blockList += "</tr>";
                });
            } else {
                blockList += '<tr><td colspan="6">No Blocks Found Yet</td></tr>';
            }
            $("#blockList").html(blockList);
        })
        .fail(function() {
            $.notify(
                {message: "Error: No response from API.<br>(loadBlocksList)"},
                {type: "danger", timer: 3000}
            );
        });
}

// Load Payments Page

function loadPaymentsPage() {
    return $.ajax(API + "pools/" + currentPool + "/payments?page=0&pageSize=500")
        .done(function(data) {
            var paymentList = "";
            if (data.length > 0) {
                $.each(data, function(index, value) {
                    var utcDate = new Date(value.created);
                    var localDate = convertUTCDateToLocalDate(utcDate);

                    paymentList += '<tr>';
                    paymentList += "<td>" + localDate.toLocaleString() + "</td>";
                    paymentList += '<td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring(0, 12) + ' &hellip; ' + value.address.substring(value.address.length - 12) + '</a></td>';
                    paymentList += '<td>' + _formatter(value.amount, 5, '') + '</td>';
                    paymentList += '<td colspan="2"><a href="' + value.transactionInfoLink + '" target="_blank">' + value.transactionConfirmationData.substring(0, 16) + ' &hellip; ' + value.transactionConfirmationData.substring(value.transactionConfirmationData.length - 16) + ' </a></td>';
                    paymentList += '</tr>';
                });
            } else {
                paymentList += '<tr><td colspan="4">No Payments Made Yet</td></tr>';
            }
            $("#paymentList").html(paymentList);
        })
        .fail(function() {
            $.notify(
                {message: "Error: No response from API.<br>(loadPaymentsList)"},
                {type: "danger", timer: 3000}
            );
        });
}



// Load Connect page content
function loadConnectPage() {
	return $.ajax(API + "pools")
	.done(function(data) {
	var connectPoolConfig = "";
	$.each(data.pools, function(index, value) {
	if (currentPool === value.id) {
		defaultPort = Object.keys(value.ports)[0];
		coinName = value.coin.name;
		coinType = value.coin.type.toLowerCase();
		algorithm = value.coin.algorithm;
			connectPoolConfig += "<tr><td>Crypto Coin Name</td><td>" + coinName + " (" + value.coin.type + ") </td></tr>";
			connectPoolConfig += "<tr><td>Coin Algorithm</td><td>" + value.coin.algorithm + "</td></tr>";
			connectPoolConfig += "<tr><td>Coin Reward Type</td><td>" + value.networkStats.rewardType + "</td></tr>";
			connectPoolConfig += '<tr><td>Pool Wallet</td><td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring(0, 12) + " &hellip; " + value.address.substring(value.address.length - 12) + "</a></td></tr>";
			connectPoolConfig += "<tr><td>Payout Scheme</td><td>" + value.paymentProcessing.payoutScheme + "</td></tr>";
			connectPoolConfig += "<tr><td>Minimum Payment</td><td>" + value.paymentProcessing.minimumPayment + " " + value.coin.type + "</td></tr>";
			if (typeof value.paymentProcessing.minimumPaymentToPaymentId !== "undefined") {
			connectPoolConfig += "<tr><td>Minimum Payout (to Exchange)</td><td>" + value.paymentProcessing.minimumPaymentToPaymentId + "</td></tr>";}
			connectPoolConfig += "<tr><td>Pool Fee</td><td>" + value.poolFeePercent + "%</td></tr>";
		$.each(value.ports, function(port, options) {
			connectPoolConfig += "<tr><td>" + stratumAddress + ":" + port + "</td><td>";
			if (typeof options.varDiff !== "undefined" && options.varDiff != null) {
			connectPoolConfig += "Difficulty Variable / " + options.varDiff.minDiff + " &harr; ";
			if (typeof options.varDiff.maxDiff === "undefined" || options.varDiff.maxDiff == null) {
			connectPoolConfig += "&infin; ";
			} else {
			connectPoolConfig += options.varDiff.maxDiff;}
			} else {
			connectPoolConfig += "Difficulty Static / " + options.difficulty ;}
			connectPoolConfig += "</td></tr>";
		});
        }
	});
	connectPoolConfig += "</tbody>";
	$("#connectPoolConfig").html(connectPoolConfig);
	$("#miner-config").html("");
	$("#miner-config").load("poolconfig/" + coinType + ".html",
	function( response, status, xhr ) {
		if ( status == "error" ) {
		$("#miner-config").load("poolconfig/default.html",
		function(responseText){
		var config = $("#miner-config")
		.html()
		.replace(/{{ stratumAddress }}/g, coinType + "." + stratumAddress + ":" + defaultPort)
		.replace(/{{ coinName }}/g, coinName)
		.replace(/{{ aglorithm }}/g, algorithm);
		$(this).html(config);  
		});
		} else {
		var config = $("#miner-config")
		.html()
		.replace(/{{ stratumAddress }}/g, coinType + "." + stratumAddress + ":" + defaultPort)
		.replace(/{{ coinName }}/g, coinName)
		.replace(/{{ aglorithm }}/g, algorithm);
		$(this).html(config);
		}
	}
	);
	})
	.fail(function() {
	$.notify(
	{message: "Error: No response from API.<br>(loadConnectConfig)"},
	{type: "danger",timer: 3000}
	);
	});
}
 
