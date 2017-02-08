function renderImportDatabase() {
    $('#listDiv').css('padding-top', '24px');
    $('#listDiv2').css('padding-top', '24px');
    $('.searchBox').css('display', 'none');
    $('.subheader').css('display', 'none');
    //logNow("RENDER IMPORT DATABASE CALLED");
    rootView.view.children().remove();
    var ver = getAndroidVersion();

    var htmlDiv = "<div id='ansDiv'><div class='boxCover'><strong>Import Wizard:</strong><p class='boxInner'>This wizard will help you import the Questions and Answers database into your phone.</p>";
    htmlDiv = htmlDiv + "<p><strong>Note:</strong> During import your phone may appear to hang. This is normal and your phone would resume once the import is done.</p><p>&nbsp;</p>";
    if (ver != '' && ver < 402) {
        htmlDiv = htmlDiv + "<p style='text-align:center;'><strong>Step 1: Load Questions</strong></p><button id='ltButton1' class='button button-small button-blue block' ontouchend=\"$('#alert1').addClass('in')\">Import Questions</button><p>&nbsp;</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'><strong>Step 2: Load Answers Part 1</strong></p><button id='ltButton2' class='button button-small button-blue block' ontouchend=\"$('#alert2').addClass('in')\" disabled>Import Answers 1</button><p>&nbsp;</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'><strong>Step 3: Load Answers Part 2</strong></p><button id='ltButton3' class='button button-small button-blue block' ontouchend=\"$('#alert3').addClass('in')\" disabled>Import Answers 2</button><p>&nbsp;</p>";
        //htmlDiv = htmlDiv+"<p style='text-align:center;'><strong class='list-title'>Step 2: Click on Import Questions</strong></p><button class='buttonGrey block' onclick=\"backButton()\" disabled>Import Questions</button><p>&nbsp;</p>";
        //htmlDiv = htmlDiv+"<p style='text-align:center;'><strong class='list-title'>Step 3: Click on Import Answers</strong></p><button class='buttonGrey block' onclick=\"backButton()\" disabled>Import Answers</button><p>&nbsp;</p>";
    } else {
        htmlDiv = htmlDiv + "<p style='text-align:center;'><strong>Step 1: Load Questions</strong></p><button id='lcButton1' class='button button-small button-blue block' onclick=\"$('#alert1').addClass('in')\">Import Questions</button><p>&nbsp;</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'><strong>Step 2: Load Answers Part 1</strong></p><button id='lcButton2' class='button button-small button-blue block' onclick=\"$('#alert2').addClass('in')\" disabled>Import Answers 1</button><p>&nbsp;</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'><strong>Step 3: Load Answers Part 2</strong></p><button id='lcButton3' class='button button-small button-blue block' onclick=\"$('#alert3').addClass('in')\" disabled>Import Answers 2</button><p>&nbsp;</p>";
        //htmlDiv = htmlDiv+"<p style='text-align:center;'><strong class='list-title'>Step 2: Click on Import Questions</strong></p><button class='buttonGrey block' ontouchend=\"backButton()\" disabled>Import Questions</button><p>&nbsp;</p>";
        //htmlDiv = htmlDiv+"<p style='text-align:center;'><strong class='list-title'>Step 3: Click on Import Answers</strong></p><button class='buttonGrey block' ontouchend=\"backButton()\" disabled>Import Answers</button><p>&nbsp;</p>";
    }
    htmlDiv = htmlDiv + "</div></div>";
    rootView.view.html(htmlDiv);

    window.setTimeout(function () {
        if (window.localStorage.getItem('questionsLoaded') == 'true') {
            logNow("TRUE");
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
        if (window.localStorage.getItem('answers1Loaded') == 'true') {
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
    //logNow("appending "+i+" With "+count);
    //$('#'+i+'cts').append(count);
    //$('#'+i+'cts').html(count);
    document.getElementById(i + 'cts').innerHTML = count;
}
function renderCategories() {
    onNav();
    //$('#listDiv2').css('padding-bottom','2px');
    //$('.footer').empty();
    rootView.view.children().remove();
    // var html = rootData.ResultSet.listItems;

    //db.transaction(queryDBCate, errorCB);
    db.transaction(function (transaction) {
        transaction.executeSql('SELECT * FROM CATEGORIES WHERE PARENT = "0"', [],
            function (transaction, results) {
                if (results != null && results.rows != null) {
                    html = '';
                    var catsLen = results.rows.length;
                    var catsRows = results.rows
                    logNow("Categories table: " + catsLen + " rows found.");
                    var html = "<div id='listDiv2'><ul class='list list-messages'>";
                    for (var i = 0; i < catsLen; i++) {
                        html = html + "<li class='list-row list-message list-message-small' id='" + catsRows.item(i).element + "'' onclick='renderCatList(" + catsRows.item(i).element + ")' >";
                        html = html + "<h3 class='list-messsage-title'>" + catsRows.item(i).category_links + "</h3><span id='" + i + "cts' class='list-message-count'>0</span></li>";

                        transaction.executeSql('SELECT ' + i + ' as ele, count(*) as count FROM QUESTIONS WHERE CATEGORY_ID = "' + catsRows.item(i).element + '"', [],
                            function (transaction, result) {
                                if (result != null && result.rows != null) {
                                    var len = result.rows.length;
                                    document.getElementById(result.rows.item(0).ele + 'cts').innerHTML = result.rows.item(0).count;
                                    $('#alert3').removeClass('in');
                                }
                            }, errorCB);
                    }
                    html = html + "</ul></div>";
                    rootView.view.html(html);
                    $('#loading').hide();
                    makeFooterActive(5);
                    makeSubActive(1);
                    window.localStorage.setItem('questionsLoaded', 'false');
                    window.localStorage.setItem('answers1Loaded', 'false');
                    var rateApp = window.localStorage.getItem('rateApp');
                    var rateAppCounter = window.localStorage.getItem('rateAppCounter');
                    var rateAppCounter = Number(rateAppCounter) + 1;
                    window.localStorage.setItem('rateAppCounter', rateAppCounter);

                    //logNow("RATE COUNTER IS "+rateAppCounter);
                    window.RightViewNavigator.resetScroller();
                    if (rateApp == 'true' && rateAppCounter != null && rateAppCounter >= 10) {
                        MessageDialogController.showConfirm(
                            'If you enjoy using this app, would you mind taking a moment to rate it? It won\'t take more than a minute. Thanks for your support!', // message
                            onRateClick, // callback to invoke with index of button pressed
                            'Rate Better Islam Q&A App', // title
                            'Rate App,Remind me later, No Thanks'    // buttonLabels
                        );
                    }

                }
            }, errorCB);
    }, successCB, errorCB);
}

function onRateClick(button) {
    //logNow("BUTTON IS "+button);
    if (button == '1') {    // Rate Now
        if (platform == 'IOS') {
            //window.open('itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=APP_ID&onlyLatestVersion=true&pageNumber=0&sortOrdering=1&type=Purple+Software'); // or itms://
            //logNow("IOS SHARE URL");
            window.localStorage.setItem('rateApp', "false");
            window.open('http://dawahdesk.com/projects/Assim/ios.html', '_system'); // or itms://
        } else if (platform == 'Android') {
            window.open('market://details?id=com.dkurve.betterislamqa', '_system');
            window.localStorage.setItem('rateApp', "false");
        }
    }
    else if (button == '2') { // Later
        //logNow("LATER");
        window.localStorage.setItem('rateAppCounter', "0");
    } else if (button == '3') { // No
        //logNow("NEVER");
        window.localStorage.setItem('rateApp', "false");
    }
}

var counts = new Array();
function renderCatList(id) {
    if (fnCalled) {
        return;
    }
    fnCalled = true;
    var colour = new Array();
    onNav();
    $('#loading').show();
    $("#body").css("left", "0px");
    //window.slidingView.bodyOffset = 0;
    var title = "Better Islam Q&A";
    //logNow("RENDER VIEW CALLED WITH ID " + id);
    rootView.view.children().remove();
    var ver = getAndroidVersion();

    //Getting the title of the category clicked to set it on top
    db.transaction(function (transaction) {
        transaction.executeSql('SELECT * FROM CATEGORIES WHERE element ="' + id + '";', [],
            function (transaction, results) {
                if (results != null && results.rows != null) {
                    var len = results.rows.length;
                    //logNow("Questions table: " + len + " rows found.");
                    for (var i = 0; i < len; i++) {

                        title = results.rows.item(i).category_links;
                    }
                }
            }, errorCB);
        var qry = 'SELECT f.colour, fq.question_no FROM FOLDERS as f, FOLDER_QUESTIONS as fq WHERE fq.folder_id = f.id and fq.question_no in (SELECT question_no FROM QUESTIONS WHERE CATEGORY_ID ="' + id + '")';
        logNow("Executed Query "+qry);
        transaction.executeSql(qry, [],
            function (transaction, results) {

                if (results != null && results.rows != null) {
                    var len = results.rows.length;
                    //logNow("Questions table: " + len + " rows found.");
                    for (var i = 0; i < len; i++) {
                        logNow("PUSHING QUESTION:"+results.rows.item(i).question_no+" WITH COLOUR:"+results.rows.item(i).colour);
                       colour[results.rows.item(i).question_no] =  results.rows.item(i).colour;
                    }
                }
            }, errorCB);

        transaction.executeSql('SELECT * FROM CATEGORIES WHERE PARENT ="' + id + '";', [],
            function (transaction, results) {
                if (results != null && results.rows != null) {
                    var html = '';
                    html = "<div id='listDiv2'><ul class='list list-contacts'><li class='list-contacts-title'>Sub-Categories</li>";
                    var len = results.rows.length;
                    //logNow("Categories table: " + len + " rows found.");
                    for (var i = 0; i < len; i++) {
                        ////logNow("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
                        html = html + "<li class='list-row list-message list-message-small' id='" + results.rows.item(i).element + "' onclick='renderCatList(" + results.rows.item(i).element + ")' >";
                        html = html + "<h3 class='list-messsage-title'>" + results.rows.item(i).category_links + "</h3><span id='" + i + "cts' class='list-message-count'>0</span></li>";
                        transaction.executeSql('SELECT ' + i + ' as ele, count(*) as count FROM QUESTIONS WHERE CATEGORY_ID = "' + results.rows.item(i).element + '"', [],
                            function (innerId) {
                                return (
                                    function (tx, results) {
                                        var len = results.rows.length;
                                        counts.push(results.rows.item(0).count);
                                        //document.getElementById(results.rows.item(0).ele+'cts').innerHTML = results.rows.item(0).count;
                                    }
                                    );
                            }(id),
                            errorCB);
                    }

                        //logNow('SELECT * FROM QUESTIONS WHERE CATEGORY_ID ="' + id + '" LIMIT 0,20;');
                        transaction.executeSql('SELECT * FROM QUESTIONS WHERE CATEGORY_ID ="' + id + '" LIMIT 0,20;', [],
                            function (transaction, results) {
                                if (results != null && results.rows != null) {
                                    html = html + "</ul><ul class='list list-contacts'><li class='list-contacts-title'>Questions</li>";
                                    var len = results.rows.length;
                                    //logNow("Questions table: " + len + " rows found.");
                                    for (var i = 0; i < len; i++) {
                                        ////logNow("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
                                        html = html + "<li class='list-row "+colour[results.rows.item(i).question_no]+"' id='" + results.rows.item(i).id + "' onclick='renderAns(" + results.rows.item(i).question_no + ")'>";
                                        html = html + "<strong class='list-link' ontouchstart='clearSelected();'>" + results.rows.item(i).question + "</strong></li>";
                                    }
                                }
                                if (ver != '' && ver < 402) {
                                    html = html + "</ul><div class=\"form-submit\"> <button class='button button-green icon-left-arrow' ontouchend=\"backButton()\"> Prev</button>&nbsp;&nbsp;<button  class='button button-green icon-right-arrow' ontouchend=\"loadNext(" + id + ",20,20,'%')\">Next </button></div></div>";
                                } else {
                                    html = html + "</ul><div class=\"form-submit\"> <button class='button button-green icon-left-arrow'  onclick=\"backButton()\"> Prev</button>&nbsp;&nbsp;<button  class='button button-green icon-right-arrow' onclick=\"loadNext(" + id + ",20,20,'%')\">Next </button></div></div>";
                                }
                                var viewDescriptor = {
                                    title: title,
                                    view: $(html),
                                    backLabel: "BACK",
                                    sub: 4,
                                    //funct: "render" + type + "View"
                                    category: id,
                                    tabs: "Y"
                                };
                                window.RightViewNavigator.pushView(viewDescriptor);
                                window.RightViewNavigator.resetScroller();
                                makeSubActive(4);
                                fnCalled = false;
                                setTimeout(function () {
                                    logNow("COUNTS LENGTH IS " + counts.length);
                                    $('#loading').hide();
                                    var l = counts.length;
                                    for (i = 0; i < l; i++) {
//                                    document.getElementById(i+'cts').innerHTML = counts[i];
                                        updateCounts(l - (i + 1), counts.pop());
                                    }
                                    //counts=new Array();
                                }, 4);

                            }, errorCB);


                }
            }, errorCB);
    }, successCB, errorCB);
}

function loadNext(id, skip, count, query) {
    logNow('LOAD NEXT CALLED');
    var colour ='';
    if(window.localStorage.getItem('upgrade3')!='false'){
        return;
    }
    onNav();
    $('#loading').show();
    if (query == null || query == undefined || query == '') {
        query = '%';
    }
    var skip = new Number(skip);
    var count = new Number(count);
    var ver = getAndroidVersion();
    var resultArray = '';
    var sub = 1;

    logNow("LOAD MORE CALLED WITH ID " + id + " AND QUERY " + query + " AND SKIP " + skip + " COUNT " + count);
    var title = "Better Islam Q&A";
    var htmlDiv = "<div id='listDiv2'><ul class='list list-contacts'><li class='list-contacts-title'>Questions</li>";

    db.transaction(function (transaction) {
        var qry = 'SELECT * FROM QUESTIONS WHERE CATEGORY_ID LIKE "' + id + '" LIMIT ' + skip + ',' + count + ';';
        if (query == 'random32') {
            makeFooterActive(2);
            sub = 4;
            title = "Shuffle!";

            //$('#foot').css('display', 'none');
            var randNum = Math.floor(Math.random() * (11000 - 1 + 1) + 1);//Random number between 0 and 11000
            qry = 'SELECT * FROM QUESTIONS LIMIT ' + randNum + ',' + count + ';';
        }
        else if (query == 'latest') {
            title = 'Latest Q&A';
            qry = 'SELECT * FROM QUESTIONS WHERE QUESTION_NO in (SELECT QUESTION_NO from LATEST_QUESTIONS) LIMIT ' + skip + ',' + count + ' ;';
            sub = 3;
        }
        else if (query == 'favourites') {
            title = 'Favourites';
            qry = 'SELECT  * FROM QUESTIONS WHERE QUESTION_NO in (SELECT QUESTION_NO from FAV) LIMIT ' + skip + ',' + count + ' ;';
            sub = 2;
        }
        else if (query.split('|')[0] == 'folders') {
            title = query.split('|')[1];
            qry = 'SELECT  * FROM QUESTIONS WHERE QUESTION_NO in (SELECT CAST(QUESTION_NO AS INTEGER) from FOLDER_QUESTIONS where folder_id = '+id+') LIMIT ' + skip + ',' + count + ' ;';
            sub = 2;
            colour = query.split('|')[2];
        }
        else if (query != '%') {
            title = "Search";
            //SEARCHING
            sub = 4;
            if (!isNaN(query)) {
                loadAns(query);
                return;
            }
            else if (1) {
                sub =4;
                resultArray = processSearch(query);
                if (resultArray.length == 1 && /\s/.test(resultArray[0])) {
                    resultArray = processSearch(resultArray[0]);
                }
                if (resultArray.length > 1) {
                    var qry0 = 'SELECT 1, * FROM QUESTIONS WHERE QUESTION LIKE "%' + query.replace(/"/g, '') + '%"';
                    var qry1 = 'SELECT 2, * FROM QUESTIONS WHERE QUESTION LIKE ';
                    var qry2 = 'SELECT 3, * FROM QUESTIONS WHERE QUESTION LIKE ';
                    var qry3 = 'SELECT 4,  * FROM QUESTIONS WHERE QUESTION_FULL LIKE ';
                    var qry4 = 'SELECT 5,  * FROM QUESTIONS WHERE QUESTION_FULL LIKE ';
                    var qry5 = 'SELECT 6, * FROM QUESTIONS WHERE QUESTION_FULL LIKE "%' + query.replace(/"/g, '') + '%"';
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
                            qry2 += ' OR QUESTION LIKE ';
                            qry4 += ' OR QUESTION_FULL LIKE ';
                        }
                    }
                    qry = qry0
                        + ' UNION '
                        + qry1
                        + ' UNION '
                        + qry2
                        + ' UNION '
                        + qry5
                        + ' UNION '
                        + qry3
                        + ' UNION '
                        + qry4
                        + 'ORDER BY 1 LIMIT ' + skip + ',' + count;
                }
                else {
                    qry = 'SELECT 1, * FROM QUESTIONS WHERE QUESTION LIKE "%' + query + '%" UNION SELECT 2, * FROM QUESTIONS WHERE QUESTION_FULL LIKE "%' + query + '%" ORDER BY 1 LIMIT ' + skip + ',' + count + ';';
                }
            }
        }

        logNow("EXECUTING " + qry);
        transaction.executeSql(qry, [],
            function (transaction, results) {
                if (results != null && results.rows != null) {
                    var len = results.rows.length;
                        logNow("Questions table: " + len + " rows found.");

                    for (var i = 0; i < len; i++) {
                        ////logNow("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
                        htmlDiv = htmlDiv + "<li class='list-row list-message list-message-smaller "+colour+"' id='" + results.rows.item(i).id + "' onclick='renderAns(" + results.rows.item(i).question_no + ")' ><div class='list-message-img "+colour+"'></div>";
                        htmlDiv = htmlDiv + "<h3 class='list-messsage-title noafter' ontouchstart='clearSelected();'>" + results.rows.item(i).question + "</h3></li>";
                        if (i == (len - 1)) {
                            if (ver != '' && ver < 402) {
                                htmlDiv = htmlDiv + '</ul><div class="form-submit"><button class="button button-green icon-left-arrow" ontouchend="backButton()"> Prev</button>&nbsp;&nbsp;<button  class="button button-green icon-right-arrow" ontouchend="loadNext(\'' + id + '\',' + (skip + count) + ',20,\'' + query + '\')">Next</button></div></div>';
                            } else {
                                htmlDiv = htmlDiv + '</ul><div class="form-submit"><button class="button button-green icon-left-arrow" onclick="backButton()"> Prev</button>&nbsp;&nbsp;<button  class="button button-green icon-right-arrow" onclick="loadNext(\'' + id + '\',' + (skip + count) + ',20,\'' + query + '\')">Next</button></div></div>';
                            }
                        }
                    }

                    if (len == 0) {
                        htmlDiv = htmlDiv + "<li class='list-row'><strong>No results!</strong><br /></li> </ul>";
                        htmlDiv = htmlDiv + "<div class=\"form-submit\"> <button class='button button-green icon-left-arrow' onclick=\"backButton()\"> Prev</button></div></div>";
                    }
                    logNow("SUB IS "+sub);

                    //if(ver<402 && ver!=0 && ver !=null && ver!=undefined){
                    if (1) {
                        //logNow("PUSHING VIEW");
                        var viewDescriptor = {
                            title: title,
                            view: $(htmlDiv),
                            backLabel: "BACK",
                            sub: sub,
                            //funct: "render" + type + "View"
                            category: id,
                            tabs: "Y"

                        };
                        window.RightViewNavigator.pushView(viewDescriptor);
                        window.RightViewNavigator.resetScroller();
                        if (title == 'Search') {
                            makeFooterActive(3);
                        }
                        else if (query == 'latest') {
                            logNow("Highlighting Sub 3");
                            makeSubActive(3);
                        }
                        else if (query == 'favourites') {
                            makeSubActive(2);
                        }
                        else {
                            makeSubActive(4);
                        }
                    } else {
                        $('#listDiv2').empty();
                        $('#listDiv2').html(html);
                    }

                    $('#loading').hide();
                    if (query == 'random32') {
                        makeFooterActive(2);
                        $('.footer').css('display', 'none');
                    }
                    if (query != null && query != undefined && query != '' && query != '%' && query != 'latest' && query != 'favourites') {
                        resultArray = processSearch(query);
                        if (resultArray.length > 1) {
                            setTimeout(function () {
                                for (var i = 0; i < resultArray.length; i++) {
                                    var holder = resultArray[i].split('|');
                                    logNow("HIGHLIGHTING " + holder[1]);
                                    $('li').highlight(holder[1]);
                                }
                            }, 50);
                        }
                        else {
                            $('li').highlight(query);
                        }

                    }
                    $('.alert').removeClass('in');
                    $("#loadDiv").hide();
                }
            }, errorCB);
    }, successCB, errorCB);
}
function loadAns(id) {
    $('.alert').removeClass('in');
    $('#loading').show();
    logNow("LOADING ANS " + id);

    onNav();
    db.transaction(function (transaction) {
        transaction.executeSql('SELECT * FROM QUESTIONS WHERE QUESTION_NO ="' + id + '";', [],
            function (transaction, results) {
                if (results != null && results.rows != null) {
                    //logNow("Questions table: " + len + " rows found.");
                    var len = results.rows.length;
                    if (len > 0) {
                        renderAns(results.rows.item(0).id);
                    }
                    else {
                        $('#loading').hide();
                        //navigator.notification.alert("Error Sharing Content, Please Try Again", null, "Error Sharing Content", "Ok");
                    }
                }
            }, errorCB);
    }, successCB, errorCB);
}
function renderFolders(skip, count){
    counts = new Array();
    $('#loading').show();
    var skip = new Number(skip);
    var count = new Number(count);
    var ver = getAndroidVersion();
    db.transaction(function (transaction) {
        transaction.executeSql('SELECT * FROM FOLDERS ORDER BY ID LIMIT ' + skip + ',' + count, [],
            function (transaction, results) {
                if (results != null && results.rows != null) {
                    var len = results.rows.length;
                    var rows = results.rows
                    logNow("Folders table: " + len + " rows found.");
                    var html = "<div id='listDiv2'><ul class='list list-boxed'>";
                    for (var i = 0; i < len; i++) {
                        html = html + "<li class='list-row' id='" + rows.item(i).id + "' onclick='loadNext("+rows.item(i).id+",0,20,\"folders|"+rows.item(i).folder_name.toTitleCase() +"|"+rows.item(i).colour+"\")' >";
                        html = html + "<a class='list-link icon-right "+rows.item(i).colour+"' href='#'>" + rows.item(i).folder_name.toTitleCase() + "<span id='" + i + "cts' class='list-val'>0</span></a></li>";
                        var sql =  'SELECT ' + i + ' as ele, count(*) as count,'+rows.item(i).id+' as folderId FROM FOLDER_QUESTIONS WHERE FOLDER_ID = ' + rows.item(i).id + '';
                        //logNow("Executing Query "+sql);
                        transaction.executeSql(sql, [],

                                    function (tx, results) {
                                        var len = results.rows.length;
                                        //counts.push(results.rows.item(0).count);
                                        //logNow("UPDATING "+results.rows.item(0).ele+" WITH "+results.rows.item(0).count);
                                        document.getElementById(results.rows.item(0).ele+'cts').innerHTML = results.rows.item(0).count;
                                    },
                            errorCB);
                        if (i == (len - 1)) {
                            if (ver != '' && ver < 402) {
                                html = html + '</ul><div class="form-submit"><button class="button button-green icon-left-arrow" ontouchend="backButton()"> Prev</button>&nbsp;&nbsp;<button  class="button button-green icon-right-arrow" ontouchend="renderFolders(' + (skip + count) + ',20)">Next</button></div></div>';
                            } else {
                                html = html + '</ul><div class="form-submit"><button class="button button-green icon-left-arrow" onclick="backButton()"> Prev</button>&nbsp;&nbsp;<button  class="button button-green icon-right-arrow" onclick="renderFolders(' + (skip + count) + ',20)">Next</button></div></div>';
                            }
                        }
                    }
                    if (len == 0) {
                        html = html + "<li class='list-row'><strong>No results!</strong><br /></li> </ul>";
                        html = html + "<div class=\"form-submit\"> <button class='button button-green icon-left-arrow' onclick=\"backButton()\"> Prev</button></div></div>";
                    }
                    html = html + "</ul></div>";
                    var viewDescriptor = {
                        title: 'My Folders',
                        view: $(html),
                        backLabel: "BACK",
                        sub: 2,
                        //funct: "render" + type + "View"
                        category: '%',
                        tabs: "Y"
                    };
                    window.RightViewNavigator.pushView(viewDescriptor);
                    window.RightViewNavigator.resetScroller();
                    $('#loading').hide();
                    makeFooterActive(5);
                    makeSubActive(2);

                }
            }, errorCB);
    }, successCB, errorCB);
}
function renderAns(id) {
    $('#loading').show();
    if (fnCalled) {
        return;
    }
    fnCalled = true;
    onNav();
    db.transaction(function (transaction) {
        var question = '';
        var answer = '';
        var questionUrl = '';
        var questionNo = '';
        var favQuestions= new Array();
        var isFav = false;
        var ver = getAndroidVersion();
        var qry = 'SELECT * FROM QUESTIONS WHERE question_no ="' + id + '";';
        logNow("Executing Query "+qry);
        transaction.executeSql(qry, [],
            function (transaction, results) {
                if (results != null && results.rows != null) {
                    var len = results.rows.length;
                    logNow("Questions table: " + len + " rows found.");
                    question = results.rows.item(0).question_full;
                    questionUrl = results.rows.item(0).question_url;
                    questionNo = results.rows.item(0).question_no;
                    var html = '';
                    html = "<div id='ansDiv' style='-webkit-user-select: text !important;'><div class='boxCover'><p><strong>Question: " + questionNo + "</strong></p>";
                    var len = results.rows.length;
                    var questions = new Array();
                    transaction.executeSql('SELECT QUESTION_NO FROM FOLDER_QUESTIONS', [],
                        function (transaction, results) {
                            if (results != null && results.rows != null) {

                                var len = results.rows.length;
                                logNow("Folder Questions table: " + len + " rows found.");
                                if (len > 0) {
                                    for (var i = 0; i < len; i++) {
                                        favQuestions[i] =Number(results.rows.item(i).question_no);
                                        logNow("Found Question: "+results.rows.item(i).question_no+" In Folder Questions");
                                    }
                                }
                            }
                        },errorCB);
                    transaction.executeSql('SELECT * FROM ANSWERS WHERE QUESTION_ID in (select id from questions where question_no = "' + id + '");', [],
                            function (transaction, results) {
                                if (results != null && results.rows != null) {
                                    var len = results.rows.length;
                                    logNow("ANSWERS table: " + len + " rows found.");
                                    //answer = results.rows.item(0).answers;
                                    //var ans = processAnswer(results.rows.item(0).answers);
                                    var answers = results.rows.item(0).answers;
                                    transaction.executeSql('SELECT * FROM QUESTIONS;', [],
                                        function (transaction, results) {
                                            if (results != null && results.rows != null) {
                                                logNow("Questions table: " + results.rows.length + " rows found.");
                                                var len = results.rows.length;
                                                if (len > 0) {
                                                    for (var i = 0; i < len; i++) {
                                                        questions[i] = String(results.rows.item(i).question_no);
                                                    }
                                                    answers = answers.replace(/(\s\d\d+)/g, function (match, contents, offset, string) {
//                                                        logNow("Match is: " + match);
//                                                        logNow("Contents is: " + contents);
                                                            if (jQuery.inArray(Number(contents), questions)){

                                                            return '<span style="font-weight: 900;color:#2087fc" onclick="loadAns(' + contents + ')">' + contents + '</span>';
                                                        }
                                                        else {
                                                            return '<span style="font-weight: 900;color:#000000">' + contents + '</span>';
                                                        }
                                                    });
                                                }
                                                html = html + "<p id='quest'><strong>" + question + "</strong></p></div><p>&nbsp;</p><div class='boxCover'>";
                                                html = html + "<div id='ans'><p><strong>Answer:</strong></p><p class='boxInner'>" + answers + "</p></div>";

                                                if (ver != '' && ver < 402) {
                                                    html = html + "</div><p>&nbsp;</p><div class='boxCover'><button class='button button-small button-blue block' ontouchend=\"sendQuestionShare('quest','ans','" + questionUrl + "'," + questionNo + ")\">Touch To Share</button></div></div>";
                                                }
                                                else {
                                                    html = html + "</div><p>&nbsp;</p><div class='boxCover'><button class='button button-small button-blue block' onclick=\"sendQuestionShare	('quest','ans','" + questionUrl + "'," + questionNo + ")\">Touch To Share</button></div></div>";
                                                }
                                                //logNow(html);
                                                if(favQuestions.indexOf(questionNo)!=-1){
                                                    logNow(questionNo+" Is In Favourites");
                                                    isFav = true;
                                                }
                                                else{
                                                    logNow(questionNo+" Is Not In Favourites");
                                                }
                                                var viewDescriptor = {
                                                    title: 'Answer',
                                                    view: $(html),
                                                    //sub: 1,
                                                    item: id,
                                                    backLabel: "BACK",
                                                    favLabel:"+",
                                                    question:questionNo,
                                                    fav:isFav
                                                    //funct: "render" + type + "View"
                                                };
                                                window.RightViewNavigator.pushView(viewDescriptor);
                                                window.RightViewNavigator.resetScroller();
                                                makeSubActive(4);
                                                fnCalled = false;
                                                $('#loading').hide();
                                            }
                                        }, errorCB);
                                }
                            }, errorCB);


                }
            }, errorCB);
    }, successCB, errorCB);


}


function renderAskForm() {

    var html = "";
    html += "<div class=\"container\"><form method='post' action='#' onsubmit='return false;'>";
    html += "      <h2 class=\"heading\">Ask a Question<\/h2>";
    html += "      <fieldset>";
    html += "        <p>";
    html += "          <label class=\"text-label\" for=\"name\">Name<\/label>";
    html += "          <input type=\"text\" placeholder=\"Name\" class=\"text-field\" id=\"name\" name=\"name\">";
    html += "        <\/p>";
    html += "        <p>";
    html += "          <label class=\"text-label\" for=\"email\">E-Mail<\/label>";
    html += "          <input type=\"text\" placeholder=\"example@mail.com\" class=\"text-field\" id=\"email\" name=\"email\">";
    html += "        <\/p>";
    html += "        <p>";
    html += "          <label class=\"text-label\" for=\"subject\">Subject<\/label>";
    html += "          <input type=\"text\"  placeholder=\"Subject\" class=\"text-field\" id=\"subject\" name=\"subject\">";
    html += "        <\/p>";
    html += "        <p>";
    html += "          <textarea value=\"Question\" class=\"text-area\" id=\"question\" name=\"question\" placeholder=\"Question\"></textarea>";
    html += "<span class=\"hint\">Please limit yourself to 1 question per day.</span>"
    html += "        <\/p>";
    html += "        <div>";
    html += "          <button class=\"buttonGrey block\" ontouchend=\"doAsk(this.form);\">Submit<\/button><\/div>";
    html += "      <\/fieldset>";
    html += "  </form>  <\/div>";

    var viewDescriptor = {
        title: "Ask a Question",
        view: $(html),
        foot: 1,
        backLabel: "BACK"
    };
    window.RightViewNavigator.pushView(viewDescriptor);
    window.RightViewNavigator.resetScroller();
    onNav();
    makeFooterActive(1);
    makeSubActive(4);


}
var fnCalled = false;

function doAsk(frm) {
    //logNow("DOASK CALLED");
    if (fnCalled) {
        return;
    }
    fnCalled = true;
    var status = true;
    var name = $('#name').val();
    var email = $('#email').val();
    var subject = $('#subject').val();
    var question = $('#question').val();
    if (name == '' && email == '' && subject == '' && question == '') {
        name = frm.elements["name"].value;
        email = frm.elements["email"].value;
        subject = frm.elements["subject"].value;
        question = frm.elements["question"].value;
    }
    //logNow("Name " + name + " Email: " + email + " Subject " + subject + " question" + question);
    if (name == "") {
        $("#name").addClass("required");
        status = false;
    } else {
        $("#name").removeClass("required");

    }
    if (email == "") {
        $("#email").addClass("required");
        status = false;
    } else if (!isEmailValid(email)) {
        $("#email").addClass("required");
        fnCalled = false;
        navigator.notification.alert("Email Id is Not Valid", null, "Invalid Email", "Ok");
        //alert("Email id is not valid");
        status = false;
    } else {
        $("#email").removeClass("required");
    }
    if (subject == "") {
        $("#subject").addClass("required");
        status = false;
    } else {
        $("#subject").removeClass("required");

    }
    if (question == "") {
        $("#question").addClass("required");
        status = false;
    } else {
        $("#question").removeClass("required");
    }
    if (status) {
        $('#loading').show();
        ////logNow("cleared");

        $.ajax({
            url: "http://www.dawahdesk.com/projects/htmldom/contact.php",
            type: "post",
            data: {
                name: name,
                mail: email,
                subject: subject,
                message: question
            },
            success: function (data, textStatus, jqXHR) {
                if (data == "success") {
                    $('#loading').hide();
                    fnCalled = false;
                    //alert("Message sent successfully!");
                    navigator.notification.alert("Message sent successfully!", null, "Success!", "Ok");
                    frm.elements["name"].value = '';
                    frm.elements["email"].value = '';
                    frm.elements["subject"].value = '';
                    frm.elements["question"].value = '';
                    ////logNow(data);
                } else {
                    $('#loading').hide();
                    fnCalled = false;
                    //alert("Database save failed");
                    navigator.notification.alert("Send Question failed", null, "Send Question Failed", "Ok");
                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#loading').hide();
                fnCalled = false;
                //alert("Error: You need to be connected to the Internet to send us a message");
                navigator.notification.alert("You need to be connected to the Internet to Ask a Qustion", null, "Send Question Failed", "Ok");
            }
        });
    }
    else {
        fnCalled = false;
    }

}

function showSearch(category) {
    if(window.localStorage.getItem('upgrade3')!='false'){
        return;
    }
    logNow("SUB 1 CLASS " + $('#sub1').attr('class'));
    ////logNow("SUB 2 CLASS "+$('#sub2').attr('class'));
    logNow("CATEGORY IS" + category);
    //return;
    if ($('#sub1').attr('class') != 'tabs-link active') {
        renderHome();
    }
    //var category = window.RightViewNavigator.category;
    var searchVisible = $('.searchBox').css('display');
    if (searchVisible == 'none') {
        var htmlDiv = $('<form class="search-bar" action="#" onsubmit="return doSearch(\'' + category + '\',this);"><input type="search" placeholder="Search" class="search-bar-input" id="query"><input type = "hidden" value="category"></form>');
        //var htmlDiv = "<form method='post' action='' onsubmit='doSearch(" + category + ",this);return false;'><input placeholder = \"Search...\" class=\"searchfield\" id='query' type=\"text\" >";
        //htmlDiv = htmlDiv + "<input type=\"button\" class=\"searchbutton\" ontouchend='doSearch(" + category + ",this.form)' value=\"Go\"></form>";

        //$('#listDiv').css('padding-top', '79px');
        $('#listDiv2').css('padding-top', '79px');
        $('.searchBox').html(htmlDiv);
        $('.searchBox').css('display', 'block');
        //setTimeout( function() { 
        makeFooterActive(3);

        //}, 500 );
    } else {
        //$('#listDiv').css('padding-top', '44px');
        $('#listDiv2').css('padding-top', '44px');
        $('.searchBox').css('display', 'none');
        //setTimeout( function() {
        makeFooterActive(5);
        //}, 500 );

    }
}

function renderSearch(cate) {
    if(window.localStorage.getItem('upgrade3')!='false'){
        return;
    }
    $('#searchAlert').addClass('in');
}
function doSearchNow() {
    $('#loading').show();
    var query = $('#searchPut').val();
    logNow("Query: " + query);

    if (query == '' || query == null) {
        alert("Please enter a search term");
        //$('.searchfield').focus();
        $('#loading').hide();
        return false;
    } else {
        loadNext('%', 0, 20, query);
        return false;
    }

}
function doSearch(category, frm) {

    var query = $('#query').val();
    query = frm.elements["query"].value;
    logNow("Search Category " + category + " Query: " + query);
    $('#loading').show();
    //logNow("Search Category " + category + " Query: " + $('#query').val());
    if (query == '') {
        query = frm.elements["query"].value;
        logNow("Search Category " + category + " Query: " + query);
    }
    if (category == undefined) {
        category = '%';
    }
    if (query == '' || query == null) {
        alert("Please enter a search term");
        //$('.searchfield').focus();
        $('#loading').hide();
        return false;
    } else {
        loadNext(category, 0, 20, query);
        return false;
    }

}

function renderAbout() {
    if(window.localStorage.getItem('upgrade3')!='false'){
        return;
    }
    if (fnCalled) {
        return;
    }
    fnCalled = true;
    var ver = getAndroidVersion();
    var htmlDiv = "<div id='ansDiv'><div class='boxCover'><strong>Introduction</strong><p class='boxInner'>";
    htmlDiv = htmlDiv + "Welcome to Islam Question & Answer! This site aims to provide intelligent, authoritative responses to anyones question about Islam, whether it be from a Muslim or a non-Muslim, and to help solve general and personal social problems. Responses are composed by Sheikh Muhammed Salih Al-Munajjid, a known Islamic lecturer and author. Questions about any topic are welcome, such as theology, worship, human and business relations, or social and personal issues.";

    htmlDiv = htmlDiv + "<p>All questions and answers have been prepared, approved, revised, edited, amended or annotated by Shaykh Muhammad Saalih al-Munajjid, the supervisor of this site.</p>";
    htmlDiv = htmlDiv + "<p>With the spread of Islam world-wide walillah il-hamd and its diffusion into the internet, some sites have been published claiming to serve Muslims and to speak in the name of Islam. However, not all of these sites, which discuss issues relevant to Islam, present accurate and reliable information based on the true beliefs and practices of the Prophet (peace & blessings of Allaah be upon him) and his companions. Thus, there is a need to increase the number of sites providing resources based on these authentic teachings. It is hoped that this site will be among them. The objectives of Islam Q&A include:</p><p>&nbsp;</p>";
    htmlDiv = htmlDiv + "<p><ul style='list-style:disc !important;margin-left: 20px;'><li>To teach and familiarize Muslims with various aspects of their religion </li>";
    htmlDiv = htmlDiv + "<li>To be a source for guiding people to Islam </li>";
    htmlDiv = htmlDiv + "<li>To respond to users questions and inquiries to the best of our resources and capabilities </li>";
    htmlDiv = htmlDiv + "<li>To assist in solving the social and personal problems of the Muslims in an Islamic context </li></ul></p>";
    htmlDiv = htmlDiv + "<p>It was decided to make the site all-encompassing, directed towards Muslims and non-Muslims alike. Subject areas include, but are not limited to, Islamic fiqh and jurisprudence, Islamic history, Islamic social laws (including marriage, divorce, contracts, and inheritance), Islamic finance, basic tenets and aqeedah of the Islamic faith and tawheed, and Arabic grammar as it relates to the Quran and Islamic texts.</p>";
    htmlDiv = htmlDiv + "<p>The responses are handled by Sheikh Muhammad Salih al-Munajjid, using only authentic, scholarly sources based on the Quran and sunnah, and other reliable contemporary scholarly opinions. References are provided where appropriate in the responses. All requests are held with confidence, and replies are available personally and/or publicly (posted to this site).</p>";
    htmlDiv = htmlDiv + "<p>A database organized by subject areas, containing common as well as previously asked questions, is available for exploring, either by browsing the entire contents or specific subject areas, or by searching for specific keywords. In an effort to maximize efficient use of everyones time and effect the most rapid responses, please be sure to consult the database before submitting a question to make sure it has not already been asked before.</p>";
    htmlDiv = htmlDiv + "<p><strong>Help:</strong></p><p>If you face any problem with the app, click on the button below to clear all data and restart you app.</p>";
    if (ver != '' && ver < 402) {
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' ontouchend=\"clearData()\">Clear App Data</button><p>&nbsp;</p>";
        htmlDiv = htmlDiv + "<p><strong>Updates:</strong></p><p>New questions would be available on a weekly basis. Please check for update once a week.</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' ontouchend=\"$('#updateAlert').addClass('in');\">Check For Update</button><p>&nbsp;</p>";
        //htmlDiv = htmlDiv+"<p style='text-align:center;'><h2>Step 2: Click on Import Questions</h2></p><button class='buttonGrey block' onclick=\"backButton()\" disabled>Import Questions</button><p>&nbsp;</p>";
        //htmlDiv = htmlDiv+"<p style='text-align:center;'><h2>Step 3: Click on Import Answers</h2></p><button class='buttonGrey block' onclick=\"backButton()\" disabled>Import Answers</button><p>&nbsp;</p>";
    } else {
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' onclick=\"clearData()\">Clear App Data</button><p>&nbsp;</p>";
        htmlDiv = htmlDiv + "<p><strong>Updates:</strong></p><p>New questions would be available on a weekly basis. Please check for update once a week.</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' onclick=\"$('#updateAlert').addClass('in');\">Check For Update</button><p>&nbsp;</p>";
        //htmlDiv = htmlDiv+"<p style='text-align:center;'><h2>Step 2: Click on Import Questions</h2></p><button class='buttonGrey block' ontouchend=\"backButton()\" disabled>Import Questions</button><p>&nbsp;</p>";
        //htmlDiv = htmlDiv+"<p style='text-align:center;'><h2>Step 3: Click on Import Answers</h2></p><button class='buttonGrey block' ontouchend=\"backButton()\" disabled>Import Answers</button><p>&nbsp;</p>";
    }
    htmlDiv = htmlDiv + "<p>This app is brought to you by Dawah Desk.<p>";
    htmlDiv = htmlDiv + "<p><strong>About Dawah Desk:</strong></p><p>Dawah Office For Every Da'ee</p><p><h2>Mission:</h2></p><p></p>Da'wah desk is a website aimed at building virtual Da'wah office for every Da'ee around the globe right from the speaker down to anyone who wants to do some Da'wah bi-ithnillaah. In addition to this, it has been envisioned to make it as an open Da'wah source for all the Da'ees</p>";
    htmlDiv = htmlDiv + "<p>Visit us at <a href=\"http://www.dawahdesk.com\">www.DawahDesk.com</a></p></p>";
    htmlDiv = htmlDiv + "</div></div>";


    var viewDescriptor = {
        title: "About",
        view: $(htmlDiv),
        foot: 4,
        backLabel: "BACK"
    };
    window.RightViewNavigator.pushView(viewDescriptor);
    window.RightViewNavigator.resetScroller();
    onNav();
    makeSubActive(4);
    makeFooterActive(4);

    fnCalled = false;

}
