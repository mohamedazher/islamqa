//Load Next - Questions List Template Helper
Handlebars.registerHelper('qList', function (data, options) {
    var results = data[0], colour = data[1], id = data[2], skip = data[3], count = data[4];
    var query = data[5], rows = results.rows, len = results.rows.length, htmlDiv = "";
    var ver = getAndroidVersion();
    var col = '';
    for (var i = 0; i < len; i++) {
        if (jQuery.isArray(colour)) {
            col = colour[results.rows.item(i).question_no];
        }
        else {
            col = colour;
        }
        htmlDiv = htmlDiv + "<li class='list-row  " + col + "' id='" + results.rows.item(i).question_no + "' onclick='renderAns(" + results.rows.item(i).question_no + ")' >";
        htmlDiv = htmlDiv + "<strong class='list-link " + col + "' ontouchstart='clearSelected();'>" + results.rows.item(i).question + "</strong></li>";
        if (i == (len - 1)) {
            if (ver != '' && ver < 402 && false) {
                htmlDiv = htmlDiv + '</ul><div class="form-submit"><button class="button button-green icon-left-arrow" ontouchend="backButton()">'+stringsDB.previous+'</button>&nbsp;&nbsp;<button  class="button button-green icon-right-arrow" ontouchend="loadNext(\'' + id + '\',' + (skip + count) + ',20,\'' + query + '\')">'+stringsDB.next+'</button></div></div>';
            } else {
                htmlDiv = htmlDiv + '</ul><div class="form-submit"><button class="button button-green icon-left-arrow" onclick="backButton()">'+stringsDB.previous+'</button>&nbsp;&nbsp;<button  class="button button-green icon-right-arrow" onclick="loadNext(\'' + id + '\',' + (skip + count) + ',20,\'' + query + '\')">'+stringsDB.next+'</button></div></div>';
            }
        }
    }
    if (len == 0) {
        htmlDiv = htmlDiv + "<li class='list-row'><strong>"+stringsDB.no_results+"</strong><br /></li> </ul>";
        htmlDiv = htmlDiv + "<div class=\"form-submit\"> <button class='button button-green icon-left-arrow' onclick=\"backButton()\">"+stringsDB.previous+"</button></div></div>";
    }
    return htmlDiv;
});

//Main Page Categories Template Helper
Handlebars.registerHelper('catList', function (data, options) {
    var results = data[0];
    var len = results.rows.length, html = "";
    for (var i = 0; i < len; i++) {
        html = html + "<li class='list-row list-message list-message-small' id='" + results.rows.item(i).element + "'' onclick='renderCatList(" + results.rows.item(i).element + ")' >";
        html = html + "<h3 class='list-messsage-title'>" + results.rows.item(i).category_links + "</h3><span id='" + i + "cts' class='list-message-count'>0</span></li>";
    }
    return html;
});

//Render Cat List Sub Categories Template Helper
Handlebars.registerHelper('subcatList', function (data, options) {
    var results = data[0];
    var len = results.rows.length, html = "";
    for (var i = 0; i < len; i++) {
        ////logNow("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
        html = html + "<li class='list-row list-message list-message-small' id='" + results.rows.item(i).element + "' onclick='renderCatList(" + results.rows.item(i).element + ")' >";
        html = html + "<h3 class='list-messsage-title'>" + results.rows.item(i).category_links + "</h3><span id='" + i + "cts' class='list-message-count'>0</span></li>";
    }
    return html;
});

//Render Folder List
Handlebars.registerHelper('folderList', function (data, options) {
    var results = data[0], skip = data[1], count = data[2];
    var ver = getAndroidVersion();
    var len = results.rows.length, html = "";
    for (var i = 0; i < len; i++) {
        html = html + "<li class='list-row' id='" + results.rows.item(i).id + "' onclick='loadNext(" + results.rows.item(i).id + ",0,20,\"folders|" + results.rows.item(i).folder_name.toTitleCase() + "|" + results.rows.item(i).colour + "\")' >";
        html = html + "<a class='list-link icon-right " + results.rows.item(i).colour + " white' href='#'>" + results.rows.item(i).folder_name.toTitleCase() + "<span id='" + i + "cts' class='list-val'>0</span></a></li>";

        if (i == (len - 1)) {
            if (ver != '' && ver < 402 && false) {
                html = html + '</ul><div class="form-submit"><button class="button button-green icon-left-arrow" ontouchend="backButton()">'+stringsDB.previous+'</button>&nbsp;&nbsp;<button  class="button button-green icon-right-arrow" ontouchend="renderFolders(' + (skip + count) + ',20)">'+stringsDB.next+'</button></div></div>';
            } else {
                html = html + '</ul><div class="form-submit"><button class="button button-green icon-left-arrow" onclick="backButton()">'+stringsDB.previous+'</button>&nbsp;&nbsp;<button  class="button button-green icon-right-arrow" onclick="renderFolders(' + (skip + count) + ',20)">'+stringsDB.next+'</button></div></div>';
            }
        }
    }
    if (len == 0) {
        html = html + "<li class='list-row'><strong>"+stringsDB.no_results+"</strong><br /></li> </ul>";
        html = html + "<div class=\"form-submit\"> <button class='button button-green icon-left-arrow' onclick=\"backButton()\">"+stringsDB.previous+"</button></div></div>";
    }
    return html;
});

//Render Answers
Handlebars.registerHelper('answersList', function (data, options) {
    var results = data[0], question = data[1], questionUrl = data[2], questionNo = data[3], shortQuestion = data[4];
    var ver = getAndroidVersion();
    var len = results.rows.length, html;
    logNow("ANSWERS table: " + len + " rows found.");
    var answers = results.rows.item(0).answers;
    //logNow(answers);
    answers = answers.replace(/\[fatin\](.*?)\[\\fatin\]/g, "<span style='font-weight: 900;color:#2087fc' onclick='renderAns($1)'>$1</span>");
    answers = answers.replace(/\[fatout\](.*?)\[\\fatout\]/g, "<span style='font-weight: 900;color:#000000'>$1</span>");
    html = "<p><strong>Question: " + questionNo + "</strong></p>";
    html = html + "<p id='quest'><strong>" + question + "</strong></p></div><p>&nbsp;</p><div class='boxCover'>";
    html = html + "<div id='ans'><p><strong>Answer:</strong></p><p class='boxInner'>" + answers + "</p></div>";

    if (ver != '' && ver < 402) {
        html = html + "</div><p>&nbsp;</p><div class='boxCover'><button class='button button-small button-blue block' ontouchend=\"sendQuestionShare('" + questionUrl + "'," + questionNo + ",'"+shortQuestion+"' )\">Touch To Share</button></div></div>";
    }
    else {
        html = html + "</div><p>&nbsp;</p><div class='boxCover'><button class='button button-small button-blue block' onclick=\"sendQuestionShare	('" + questionUrl + "'," + questionNo + ",'"+shortQuestion+"')\">Touch To Share</button></div></div>";
    }
    return html;
});

//About Page
Handlebars.registerHelper('settingsPage', function (data, options) {
    var ver = data[0];
    var count = data[1];
    var htmlDiv = '';
    if (ver != '' && ver < 402 && false) {
        htmlDiv = htmlDiv + "<p> You have a total of <strong>"+count+"</strong> Question and Answers on your App!<br /></p>"

         + "<p><strong>"+stringsDB.clear_app_data+":</strong></p><p>"+stringsDB.if_you_face_problems_with_app+"</p>"
         +  "<p style='text-align:center;'></p><button class='button button-small button-blue block' ontouchend=\"clearData()\">"+stringsDB.clear_app_data+"</button><p>&nbsp;</p>"

         + "<p><strong>"+stringsDB.updates+":</strong></p><p>"+stringsDB.new_questions_available_weekly+".</p>"
         + "<p style='text-align:center;'></p><button class='button button-small button-blue block' ontouchend=\"$('#updateAlert').addClass('in');\">"+stringsDB.check_for_update+"</button><p>&nbsp;</p>"

         + "<p><strong>"+stringsDB.backup+":</strong></p><p>"+stringsDB.backup_your_personal_folders+".</p>"
         + "<p style='text-align:center;'></p><button class='button button-small button-blue block' ontouchend=\"confirmBackup();\">"+stringsDB.backup_to_sd_card+"</button><p>&nbsp;</p>"

         + "<p><strong>"+stringsDB.restore+":</strong></p><p>"+stringsDB.restore_your_personal_folders+"</p>"
         + "<p style='text-align:center;'></p><button class='button button-small button-blue block' ontouchend=\"restoreFromCardNow();\">"+stringsDB.restore_from_sd_card+"</button><p>&nbsp;</p>"

         + "<p><strong>"+stringsDB.about+":</strong></p>"
         + "<p style='text-align:center;'></p><button class='button button-small button-blue block' ontouchend=\"renderAbout();\">"+stringsDB.about+"</button><p>&nbsp;</p>";
    } else {
        htmlDiv = htmlDiv + "<p> You have a total of <strong>"+count+"</strong> Question and Answers on your App!<br /></p>";

        htmlDiv = htmlDiv + "<p><strong>"+stringsDB.clear_app_data+"</strong></p><p>"+stringsDB.if_you_face_problems_with_app+"</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' onclick=\"clearData()\">"+stringsDB.clear_app_data+"</button><p>&nbsp;</p>";

        htmlDiv = htmlDiv + "<p><strong>"+stringsDB.updates+":</strong></p><p>"+stringsDB.new_questions_available_weekly+".</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' onclick=\"$('#updateAlert').addClass('in');\">"+stringsDB.check_for_update+"</button><p>&nbsp;</p>";

        htmlDiv = htmlDiv + "<p><strong>"+stringsDB.backup+":</strong></p><p>"+stringsDB.backup_your_personal_folders+".</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' onclick=\"confirmBackup();\">"+stringsDB.backup_to_sd_card+"</button><p>&nbsp;</p>";

        htmlDiv = htmlDiv + "<p><strong>"+stringsDB.restore+":</strong></p><p>"+stringsDB.restore_your_personal_folders+"</p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' onclick=\"restoreFromCardNow();\">"+stringsDB.restore_from_sd_card+"</button><p>&nbsp;</p>";

        htmlDiv = htmlDiv + "<p><strong>"+stringsDB.about+":</strong></p>";
        htmlDiv = htmlDiv + "<p style='text-align:center;'></p><button class='button button-small button-blue block' onclick=\"renderAbout();\">"+stringsDB.about+"</button><p>&nbsp;</p>";
    }
    return htmlDiv;
});
// CARDS HELPER
Handlebars.registerHelper('cardsLayout', function (data, options) {
    var category = data[0], cardData = data[1];
    var  html;
    var colours = new Array();
    colours[0] = "pink",colours[1] = "red",colours[2] = "brown",colours[3] = "violet",colours[4] = "orange";
    colours[5] = "green",colours[6] = "blue",colours[7] = "turquoise",colours[8] = "yellow";
    var randNum = data[2];
    html = "<h1 class='"+colours[randNum]+"'>"+category+"</h1>";
    for(var i = 0; i<cardData.rows.length; i++){
        if(cardData.rows.item(i).cate == category){

            html = html +"<ul class='list list-contacts'><li class='list-row "+colours[randNum]+"' id="+cardData.rows.item(i).id+" onclick='renderAns("+cardData.rows.item(i).question_no+")'>";
            html = html + "<strong class='list-link  "+colours[randNum]+"' style='font-weight: normal;' ontouchstart='clearSelected();'>"+cardData.rows.item(i).question+"</strong></li></ul>";
        }
    }

html = html + "";
    return html;
});
