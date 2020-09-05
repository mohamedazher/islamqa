function renderImportDatabase() {
    $('#listDiv').css('padding-top', '24px');
    $('#listDiv2').css('padding-top', '24px');
    $('.searchBox').css('display', 'none');
    $('.subheader').css('display', 'none');
    rootView.view.children().remove();
    var ver = getAndroidVersion();
    var html = '';

    if (ver != '' && ver < 402) {
        var src = document.getElementById("importDBTemplatev23").innerHTML;
        var template = Handlebars.compile(src);
        html = template();
    } else {
        var src = document.getElementById("importDBTemplatev403").innerHTML;
        var template = Handlebars.compile(src);
        html = template();
    }

    rootView.view.html(html);
    window.setTimeout(function () {

        if (getStorageItem('questionsLoaded') == 'true') {
            $('#alert1').removeClass('in');
            $('#lcButton1').attr('disabled', 'disabled');
            $('#lcButton1').html('Done');
            $('#lcButton1').css('background', 'grey');
            $('#lcButton2').removeAttr('disabled');

            $('#ltButton1').attr('disabled', 'disabled');
            $('#ltButton1').prop("ontouchend", null).attr("ontouchend", null);
            $('#ltButton1').html('Done');
            $('#ltButton1').css('background', 'grey');
            $('#ltButton2').removeAttr('disabled');
        }
        if (getStorageItem('answers1Loaded') == 'true') {
            $('#alert2').removeClass('in');
            $('#ltButton2').attr('disabled', 'disabled');
            $('#ltButton2').css('background', 'grey');
            $('#ltButton2').html('Done');
            $('#ltButton3').removeAttr('disabled');

            $('#lcButton2').attr('disabled', 'disabled');
            $('#ltButton2').prop("ontouchend", null).attr("ontouchend", null);
            $('#lcButton2').css('background', 'grey');
            $('#lcButton2').html('Done');
            $('#lcButton3').removeAttr('disabled');
        }
    }, 500);
}
function updateCounts(i, count) {
    document.getElementById(i + 'cts').innerHTML = count;
}

function renderCards() {
    onNav();

    hideLoad();

    setStorageItem('questionsLoaded', 'false');
    setStorageItem('answers1Loaded', 'false');
    var rateApp = getStorageItem('rateApp');
    var rateAppCounter = getStorageItem('rateAppCounter');
    var rateAppCounter = Number(rateAppCounter) + 1;
    setStorageItem('rateAppCounter', rateAppCounter);
    var randNum = Math.floor(Math.random() * (245 - 1 + 1) + 1);//Random number between 0 and 11000
    var qry = 'SELECT * FROM CATEGORIES WHERE ELEMENT in (SELECT CATEGORY_ID FROM (SELECT DISTINCT CATEGORY_ID FROM QUESTIONS GROUP BY CATEGORY_ID HAVING COUNT(CATEGORY_ID)>5 LIMIT ' + randNum + ',9));';

    adapter.executeQuery(qry).done(function (results) {
        logNow("LEN " + results.rows.length);
        var qry = '';
        for (var i = 0; i < results.rows.length; i++) {
            qry = qry + " SELECT * FROM (SELECT '" + results.rows.item(i).category_links + "' as cate, * FROM QUESTIONS WHERE CATEGORY_ID ='" + results.rows.item(i).element + "' LIMIT 5) as tab" + i;
            if (i != (results.rows.length - 1)) {
                qry = qry + " UNION ";
            }
        }
        logNow(qry);
        carDataCats = results;
        adapter.executeQuery(qry).done(function (results) {
            cardData = results;
            cardDataLength = 9;
            layoutColumns();
            $(window).resize(onResize);
        })
    });

    if (rateApp == 'true' && rateAppCounter != null && rateAppCounter >= 10&& navigator.notification!=undefined) {
        navigator.notification.confirm(
            stringsDB.if_you_enjoy_using_this_app, // message
            onRateClick, // callback to invoke with index of button pressed
            stringsDB.rate_better_islam_qa_app, // title
            stringsDB.rate_app + ',' + stringsDB.remind_me_later + ',' + stringsDB.no_thanks    // buttonLabels
        );
    }

}

//function to layout the columns
function layoutColumns() {
    rootView.view.children().remove();
    var ansDiv = $('<div id="ansDiv">');
    ansDiv.css("padding", "0px");
//    ansDiv.css("padding-bottom", "44px");
    ansDiv.css("margin-top", "-10px");
    var content = $('<div>');
    content.detach();
    content.empty();

    columns = Math.floor($(document).width() / MIN_COL_WIDTH);

    var columns_dom = [];
    for (var x = 0; x < columns; x++) {
        var col = $('<div class="column">');
        col.css("width", Math.floor(100 / columns) + "%");
        columns_dom.push(col);
        content.append(col);
    }

    for (var x = 0; x < cardDataLength; x++) {
        // var html = compiledCardTemplate( cards_data[x] );
        var html = getCompiledHtml("cardTemplate", { results: [carDataCats.rows.item(x).category_links, cardData, x]});

        var targetColumn = x % columns_dom.length;
        columns_dom[targetColumn].append($(html));
    }
    ansDiv.append(content);
    rootView.view.append(ansDiv);
    window.RightViewNavigator.resetScroller();
    makeFooterActive(1);
    makeSubActive(4);
}

function renderCategories() {
    if (getStorageItem('upgrade4') != 'false') {
        return;
    }
    onNav();
    var qry = 'SELECT * FROM CATEGORIES WHERE PARENT = "0"';
    adapter.executeQuery(qry).done(function (results) {
        if (results != null && results.rows != null) {
            var html = getCompiledHtml("categoriesTemplate", { results: [results]});
            var viewDescriptor = {
                title: stringsDB.categories,
                view: $(html),
                backLabel: stringsDB.back,
                sub: 1,
                //funct: "render" + type + "View"
                tabs: "Y"
            };
            pushView(viewDescriptor);
            hideLoad();
            makeFooterActive(5);
            makeSubActive(1);
            setStorageItem('questionsLoaded', 'false');
            setStorageItem('answers1Loaded', 'false');
            var rateApp = getStorageItem('rateApp');
            var rateAppCounter = getStorageItem('rateAppCounter');
            var rateAppCounter = Number(rateAppCounter) + 1;
            setStorageItem('rateAppCounter', rateAppCounter);


            adapter.setCategoryCount(results);
            $('.viewNavigator_contentHolder').css('background', 'white');
        }
    });
}

function onRateClick(button) {
    //logNow("BUTTON IS "+button);
    if (button == '1') {    // Rate Now
        if (platform == 'IOS') {
            //window.open('itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=APP_ID&onlyLatestVersion=true&pageNumber=0&sortOrdering=1&type=Purple+Software'); // or itms://
            //logNow("IOS SHARE URL");
            setStorageItem('rateApp', "false");
            window.open('http://dawahdesk.com/projects/Assim/ios.html', '_system'); // or itms://
        } else if (platform == 'Android') {
            window.open('market://details?id=com.dkurve.betterislamqa', '_system');
            setStorageItem('rateApp', "false");
        }
    }
    else if (button == '2') { // Later
        //logNow("LATER");
        setStorageItem('rateAppCounter', "0");
    } else if (button == '3') { // No
        //logNow("NEVER");
        setStorageItem('rateApp', "false");
    }
}

var counts = new Array();
function renderCatList(id) {
    if (fnCalled) {
        return;
    }
    fnCalled = true;
    var colour = new Array(), categoryResults = '';
    onNav();
    showLoad();
    var html = '';
    var title = stringsDB.better_islam_qa;
    rootView.view.children().remove();

    //Getting the title of the category clicked to set it on top

    var qry = 'SELECT * FROM CATEGORIES WHERE element ="' + id + '";';
    adapter.executeQuery(qry).done(function (results) {
        if (results != null && results.rows != null) {
            var len = results.rows.length;
            for (var i = 0; i < len; i++) {
                title = results.rows.item(i).category_links;
            }
        }
    });
    qry = 'SELECT f.colour, fq.question_no FROM FOLDERS as f, FOLDER_QUESTIONS as fq WHERE fq.folder_id = f.id and fq.question_no in (SELECT question_no FROM QUESTIONS WHERE CATEGORY_ID ="' + id + '")';
    adapter.executeQuery(qry).done(function (results) {
        if (results != null && results.rows != null) {
            var len = results.rows.length;
            for (var i = 0; i < len; i++) {
                //logNow("PUSHING QUESTION:" + results.rows.item(i).question_no + " WITH COLOUR:" + results.rows.item(i).colour);
                colour[results.rows.item(i).question_no] = results.rows.item(i).colour;
            }
        }
    });

    qry = 'SELECT * FROM CATEGORIES WHERE PARENT ="' + id + '";'
    adapter.executeQuery(qry).done(function (results) {


        if (results != null && results.rows != null) {
            categoryResults = results;
            html = getCompiledHtml("subCateTemplate", { results: [results]});
        }
    });
    qry = 'SELECT * FROM QUESTIONS WHERE CATEGORY_ID ="' + id + '" LIMIT 0,20;';
    adapter.executeQuery(qry).done(function (results) {
        if (results != null && results.rows != null) {
            html = html + getCompiledHtml("subCateQuestTemplate", { results: [results, colour, id, 0, 20, '%']});
        }

        var viewDescriptor = {
            title: title,
            view: $(html),
            backLabel: stringsDB.back,
            sub: 4,
            //funct: "render" + type + "View"
            category: id,
            tabs: "Y"
        };
        pushView(viewDescriptor);
        makeSubActive(4);
        fnCalled = false;
        hideLoad();
        adapter.setCategoryCount(categoryResults);

    });


}

function loadNext(id, skip, count, query) {
    logNow('LOAD NEXT CALLED');
    if (fnCalled) {
        return;
    }
    fnCalled=true;
    var colour = '';
    var isFolder = false;
    if (getStorageItem('upgrade4') != 'false') {
        return;
    }
    onNav();
    showLoad();
    if (query == null || query == undefined || query == '') {
        query = '%';
    }
    var skip = new Number(skip);
    var count = new Number(count);
    var resultArray = '', resultArrayMain = '';
    var sub = 1;
    var title = stringsDB.better_islam_qa;
    logNow("LOAD MORE CALLED WITH ID " + id + " AND QUERY " + query + " AND SKIP " + skip + " COUNT " + count);


    var qry = 'SELECT * FROM QUESTIONS WHERE CATEGORY_ID LIKE "' + id + '" LIMIT ' + skip + ',' + count + ';';
    if (query == 'random32') {
        makeFooterActive(2);
        sub = 4;
        title = stringsDB.shuffle;
        var randNum = Math.floor(Math.random() * (11000 - 1 + 1) + 1);//Random number between 0 and 11000
        qry = 'SELECT * FROM QUESTIONS LIMIT ' + randNum + ',' + count + ';';
    }
    else if (query == 'latest') {
        title = stringsDB.latest_qa;
        qry = 'SELECT * FROM QUESTIONS WHERE QUESTION_NO in (SELECT QUESTION_NO from LATEST_QUESTIONS) LIMIT ' + skip + ',' + count + ' ;';
        sub = 3;
    }
    else if (query == 'favourites') {
        title = stringsDB.favourties;
        qry = 'SELECT  * FROM QUESTIONS WHERE QUESTION_NO in (SELECT QUESTION_NO from FAV) LIMIT ' + skip + ',' + count + ' ;';
        sub = 2;
    }
    else if (query.split('|')[0] == 'folders') {
        title = query.split('|')[1];
        qry = 'SELECT  * FROM QUESTIONS WHERE QUESTION_NO in (SELECT CAST(QUESTION_NO AS INTEGER) from FOLDER_QUESTIONS where folder_id = ' + id + ') LIMIT ' + skip + ',' + count + ' ;';
        sub = 2;
        colour = query.split('|')[2];
        isFolder = id;
    }
    else if (query != '%') {
        title = stringsDB.search;
        //SEARCHING
        sub = 4;
        if (!isNaN(query)) {
            renderAns(query);
            return;
        }
        else if (1) {
            sub = 4;
            resultArray = processSearch(query);
            if (resultArray.length == 1 && /\s/.test(resultArray[0])) {
                resultArray = processSearch(resultArray[0]);
            }
            resultArrayMain = resultArray;
            if (resultArray.length > 1) {
                var qry0 = 'SELECT 1, * FROM QUESTIONS WHERE QUESTION LIKE "%' + query.replace(/"/g, '') + '%"';
                var qry1 = 'SELECT 3, * FROM QUESTIONS WHERE QUESTION LIKE '; // ANDS
                var qry3 = 'SELECT 4,  * FROM QUESTIONS WHERE QUESTION_FULL LIKE '; // ANDS
                var qry2 = 'SELECT 5, * FROM QUESTIONS WHERE QUESTION LIKE ';
                var qry4 = 'SELECT 7,  * FROM QUESTIONS WHERE QUESTION_FULL LIKE ';
                var qry5 = 'SELECT 2, * FROM QUESTIONS WHERE QUESTION_FULL LIKE "%' + query.replace(/"/g, '') + '%"';
                for (var i = 1; i < resultArray.length; i++) {
                    var holder = resultArray[i].split('|');
                    //                      if(i!=0){
                    qry1 += ' "%' + holder[1] + '%" ';
                    qry3 += ' "%' + holder[1] + '%" ';
//                        }
                    qry2 += ' "%' + holder[1] + '%" ';
                    qry4 += ' "%' + holder[1] + '%" ';
                    if (i != (resultArray.length) - 1) {
                        //                        if(i!=0){
                        qry1 += ' AND QUESTION LIKE ';
                        qry3 += ' AND QUESTION_FULL LIKE ';
                        //                      }
                        qry2 += ' UNION SELECT 6, * FROM QUESTIONS WHERE QUESTION LIKE ';
                        qry4 += ' UNION SELECT 8, * FROM QUESTIONS WHERE QUESTION_FULL LIKE ';
                    }
                }
                qry = qry0 + ' UNION ' + qry1 + ' UNION ' + qry2 + ' UNION ' + qry3 + ' UNION ' + qry4 + ' UNION ' + qry5 + 'ORDER BY 1 LIMIT ' + skip + ',' + count;
                qry = "SELECT DISTINCT * FROM (SELECT id, category_id, question, question_full, question_url, question_no FROM ( " + qry + " ));"
            }
            else {
                qry = 'SELECT 1, * FROM QUESTIONS WHERE QUESTION LIKE "%' + query + '%" UNION SELECT 2, * FROM QUESTIONS WHERE QUESTION_FULL LIKE "%' + query + '%" ORDER BY 1 LIMIT ' + skip + ',' + count + ';';
            }
        }
    }

    logNow("EXECUTING " + qry);
    var resultSet = '';

    adapter.executeQuery(qry).done(function (results) {
        var len = results.rows.length;
        resultSet = results.rows;
        logNow("Questions table: " + len + " rows found.");
        logNow("SUB IS " + sub);

        var htmlDiv = getCompiledHtml("qListTemplate", { results: [results, colour, id, skip, count, query]});

        var viewDescriptor = {
            title: title,
            view: $(htmlDiv),
            backLabel: stringsDB.back,
            sub: sub,
            category: id,
            tabs: "Y",
            folder: isFolder
        };
        pushView(viewDescriptor);
        if (title == 'Search') {
            makeFooterActive(3);
        }
        else if (query == 'latest') {
            makeSubActive(3);
        }
        else if (query.split('|')[0] == 'folders') {
            makeSubActive(2);
        }
        else {
            makeSubActive(4);
        }
        if (query == 'random32') {
            makeFooterActive(2);
        }
        hideLoad();
        $('.alert').removeClass('in');

        if (query != null && query != undefined && query != '' && query != '%' && query != 'latest' && query != 'favourites') {
            if (resultArrayMain.length > 1) {
                setTimeout(function () {
                    for (var i = 0; i < resultArrayMain.length; i++) {
                        var holder = resultArrayMain[i].split('|');
                        logNow("HIGHLIGHTING " + holder[1]);
                        $('li').highlight(holder[1]);
                    }
                }, 50);
            }
            else {
                $('li').highlight(query);
            }
        }
    });
}
function loadAns(id) {
    $('.alert').removeClass('in');
    showLoad();
    logNow("LOADING ANS " + id);
    onNav();
    var qry = "SELECT * FROM QUESTIONS WHERE question_no ='" + id + "'";
    adapter.executeQuery(qry).done(function (results) {
        if (results != null && results.rows != null) {
            hideLoad();
            return;
        }
        logNow("Questions table: " + results.rows.item(0).id + " found.");
        if (results.rows.item(0).question_no > 0) {
            //render ans takes only Question id, not the question number seen in the app
            renderAns(results.rows.item(0).id);
        }
        else {
            hideLoad();
        }
    });
}
function renderFolders(skip, count) {
    if (getStorageItem('upgrade4') != 'false') {
        return;
    }
    counts = new Array();
    showLoad();
    var skip = new Number(skip);
    var count = new Number(count);
    var qry = 'SELECT * FROM FOLDERS ORDER BY ID LIMIT ' + skip + ',' + count;
    adapter.executeQuery(qry).done(function (results) {
        var htmlDiv = getCompiledHtml("foldersTemplate", { results: [results, skip, count]});
        var viewDescriptor = {
            title: stringsDB.my_folders,
            view: $(htmlDiv),
            backLabel: stringsDB.back,
            sub: 2,
            //funct: "render" + type + "View"
            category: '%',
            tabs: "Y"
        };
        pushView(viewDescriptor);
        makeFooterActive(5);
        makeSubActive(2);
        hideLoad();
        adapter.setFolderCount(results);
    });
    refreshFavourites();

}
function renderAns(id) {
    logNow("Render Ans called with " + id);
    showLoad();

    onNav();
    var htmlDiv = '', question = '', questionUrl = '', questionNo = '', shortQuestion = '', isFav = false;

    //Getting question details
    var qry = "SELECT * FROM QUESTIONS WHERE question_no ='" + id + "'";
    adapter.executeQuery(qry).done(function (results) {
        if (results.rows.length <=0) {
            hideLoad();
            return;
        }
        shortQuestion = results.rows.item(0).question;
        question = results.rows.item(0).question_full;
        questionUrl = results.rows.item(0).question_url;
        questionNo = results.rows.item(0).question_no;

    });

    //Get Answer Details and compile template
    qry = 'SELECT * FROM ANSWERS WHERE QUESTION_ID in (select id from questions where question_no = "' + id + '");';
    adapter.executeQuery(qry).done(function (results) {
        if (results.rows.length <=0) {
            hideLoad();
            return;
        }
        htmlDiv = getCompiledHtml("answersTemplate", { results: [results, question, questionUrl, questionNo, shortQuestion]});

        if (favQuestions.indexOf(Number(questionNo)) != -1) {
            logNow(questionNo + " Is In Favourites " + favQuestions);
            isFav = true;
        }
        else {
            logNow(questionNo + " Is Not In Favourites");
            logNow(questionNo + " Is In Favourites " + favQuestions);

        }
        var viewDescriptor = {
            title: stringsDB.answer,
            view: $(htmlDiv),
            //sub: 1,
            item: id,
            backLabel: stringsDB.back,
            favLabel: "+",
            question: questionNo,
            fav: isFav,
            colour: 'f5f5f5'
            //funct: "render" + type + "View"
        };
        pushView(viewDescriptor);
        makeSubActive(4);

    });


}

var fnCalled = false;


function renderSearch(cate) {
    if (getStorageItem('upgrade4') != 'false') {
        return;
    }
    $('#searchAlert').addClass('in');
}
function doSearchNow() {
    showLoad();
    var query = $('#searchPut').val();
    logNow("Query: " + query);

    if (query == '' || query == null) {
        alert("Please enter a search term");
        //$('.searchfield').focus();
        hideLoad();
        return false;
    } else {
        loadNext('%', 0, 20, query);
        return false;
    }

}

function renderSettings() {
    if (getStorageItem('upgrade4') != 'false') {
        return;
    }
    if (fnCalled) {
        return;
    }
    fnCalled = true;
    var ver = getAndroidVersion();

    var qry = 'SELECT COUNT(*) as count FROM ANSWERS;';
    adapter.executeQuery(qry).done(function (results) {

        var htmlDiv = getCompiledHtml("settingsTemplate", { results: [ver, results.rows.item(0).count]});

        var viewDescriptor = {
            title: stringsDB.settings,
            view: $(htmlDiv),
            foot: 4,
            backLabel: stringsDB.back,
            colour: 'f5f5f5'
        };
        pushView(viewDescriptor);
        onNav();
        makeSubActive(4);
        makeFooterActive(4);
        fnCalled = false;
    });


}

function renderAbout() {
    if (getStorageItem('upgrade4') != 'false') {
        return;
    }
    if (fnCalled) {
        return;
    }
    fnCalled = true;

    var htmlDiv = getCompiledHtml("aboutTemplate");

    var viewDescriptor = {
        title: stringsDB.about,
        view: $(htmlDiv),
        foot: 4,
        backLabel: stringsDB.back,
        colour: 'f5f5f5'
    };
    pushView(viewDescriptor);
    onNav();
    makeSubActive(4);
    makeFooterActive(4);
    fnCalled = false;

}
