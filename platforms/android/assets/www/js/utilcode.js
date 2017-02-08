function logNow(msg) {
    var doLog = false;
    if (msg != '' && doLog == true) {
        console.log(msg);
    }
}

function setStorageItem(name, value) {
    window.localStorage.setItem(name, value);
}

function getStorageItem(name) {

    return window.localStorage.getItem(name);
}

function getCompiledHtml(templateID, data) {
    var src = document.getElementById(templateID).innerHTML;
    var template = Handlebars.compile(src);
    var html = template(data);
    return html;
}

function pushView(viewDescriptor) {
    window.RightViewNavigator.pushView(viewDescriptor);
    window.RightViewNavigator.resetScroller();
    hideLoad();
    fnCalled = false;
}

function popView() {
    window.RightViewNavigator.popView();
}
function clearData() {
    window.localStorage.setItem('upgrade3', "true");
    MessageDialogController.showMessage(stringsDB.data_cleared_successfully, null, stringsDB.ok, stringsDB.data_cleared);
}

var ct = 0;
function hideAlert() {
    if (importStarted == false || importStarted == 'complete') {
        $('.alert').removeClass('in');
    }
}
function cancelAlert() {
    $('.alert').removeClass('in');
}
function showLoad(){
    if(false){
        navigator.notification.activityStart("Loading", "");
    }
    else{
        $('#loading').show();
    }
}

function hideLoad(){
    if(false){
        navigator.notification.activityStop();
    }
    else{
        $('#loading').hide();
        fnCalled=false;
    }
}

//resize event handler
function onResize() {
    var targetColumns = Math.floor( $(document).width()/MIN_COL_WIDTH );
    if ( columns != targetColumns ) {
        layoutColumns();
    }
}

function refreshFavourites(){
    logNow("Refresh Favourites called");
    favQuestions = new Array();
    var qry = 'SELECT QUESTION_NO FROM FOLDER_QUESTIONS;';
    adapter.executeQuery(qry).done(function (results) {
        logNow("results is "+results.rows.length);
        if(results!=null){
            for (var i = 0; i < results.rows.length; i++) {
                    logNow("Found Question: " + results.rows.item(i).question_no + " In Folder Questions");
                favQuestions[i] = Number(results.rows.item(i).question_no);

            }
        }
    });
}
//Fixes double click issue with nexus
var last_click_time = new Date().getTime();
function onClickCall(e) {
    if (window.device != null && window.device.platform == "Android") {
//         //parse out dots so we can compare to earliest Jelly Bean version (410 without dots)
// //                    //console.log("VERSION IS"+window.device.version.replace(/\./g,""));
//         var version = window.device.version.replace(/\./g, "");
//         version = parseInt(version);
//         if (version < 100) {
//             version = version * 100;
//         }
//
//         if (version >= 410) {
//             click_time = e['timeStamp'];
//             if (click_time && (click_time - last_click_time) < 1000) {
//                 e.stopImmediatePropagation();
//                 e.preventDefault();
//                 return false;
//             }
//             last_click_time = click_time;
//         }
    }
}

var last_click_time_touch = new Date().getTime();
function onClickCallTouch(e) {
    if (window.device != null && window.device.platform == "Android") {
//         //parse out dots so we can compare to earliest Jelly Bean version (410 without dots)
// //                    //console.log("VERSION IS"+window.device.version.replace(/\./g,""));
//         var version = window.device.version.replace(/\./g, "");
//         version = parseInt(version);
//         if (version < 100) {
//             version = version * 100;
//         }
//
//         if (version >= 410) {
//             click_time = e['timeStamp'];
//             if (click_time && (click_time - last_click_time_touch) < 1000) {
//                 e.stopImmediatePropagation();
//                 e.preventDefault();
//                 return false;
//             }
//             last_click_time_touch = click_time;
//         }
    }
}

function menuKeyDown() {

}

function makeFooterActive(num) {
    switch (num) {
        case 1:
            $("#foot1").addClass('active');
            $("#foot2").removeClass('active');
            $("#foot3").removeClass('active');
            $("#foot4").removeClass('active');
            break;
        case 2:
            $("#foot2").addClass('active');
            $("#foot1").removeClass('active');
            $("#foot3").removeClass('active');
            $("#foot4").removeClass('active');
            break;
        case 3:
            $("#foot3").addClass('active');
            $("#foot2").removeClass('active');
            $("#foot1").removeClass('active');
            $("#foot4").removeClass('active');
            break;
        case 4:
            $("#foot4").addClass('active');
            $("#foot1").removeClass('active');
            $("#foot2").removeClass('active');
            $("#foot3").removeClass('active');
            break;
        case 5:
            $("#foot4").removeClass('active');
            $("#foot1").removeClass('active');
            $("#foot2").removeClass('active');
            $("#foot3").removeClass('active');

            break;
    }
}

function makeSubActive(num) {
    logNow("MAKE SUB ACTIVE CALLED WITH " + num);
    switch (num) {
        case 1:
            $("#sub1").addClass('active');
            $("#sub2").removeClass('active');
            $("#sub3").removeClass('active');
            break;
        case 2:
            $("#sub2").addClass('active');
            $("#sub1").removeClass('active');
            $("#sub3").removeClass('active');
            break;
        case 3:
            $("#sub3").addClass('active');
            $("#sub2").removeClass('active');
            $("#sub1").removeClass('active');
            break;
        case 4:
            $("#sub1").removeClass('active');
            $("#sub2").removeClass('active');
            $("#sub3").removeClass('active');
            break;
    }
}

function devicePlatform() {
    platform = device.platform;

    if (platform == 'iPhone' || platform == 'iPad' || platform == 'iPhone Simulator' || platform == 'iPad Simulator' || platform == 'iOS') {
        platform = 'IOS';
    }
    else if (platform = 'Android') {
        platform = 'Android';
    }
    else {
        platform = '';
    }
    return platform;
}


function onNav() {
    //hideAlert();
    $('.alert').removeClass('in');

}


/******************************************************************************************************************
 * @Desc Method called when the Home button is clicked on the side menu
 * This method will loop through all the views that are pushed in and pop them out from the history variable of ViewNavigator
 * and it will then update the currentViewDescriptor that the Home is the current one and set the viewDescriptor as home and Push
 * It will also close the open sliding window, if any.

 *****************************************************************************************************************/

function renderHome() {
    if (upgrade != "false") {
        return;
    }
    while (window.RightViewNavigator.history.length > 1) {
        if (window.RightViewNavigator.history.length == 2) {
            window.RightViewNavigator.history.pop();
            layoutColumns();
//            renderCategories();
            //renderCards();
        } else {
            window.RightViewNavigator.history.pop();
        }
    }
    window.RightViewNavigator.currentViewDescriptor = window.RightViewNavigator.history[window.RightViewNavigator.history.length - 1];
    window.RightViewNavigator.viewDescriptor = window.RightViewNavigator.history[window.RightViewNavigator.history.length - 1];
    window.RightViewNavigator.updateView(window.RightViewNavigator.viewDescriptor);
//    makeFooterActive(5);
//    makeSubActive(1);
}
// remove all own properties on obj, effectively reverting it to a new object
wipeObj = function (obj) {
    //logNow("EMPTYING OBJ");
    for (var p in obj) {
        if (obj.hasOwnProperty(p))
            delete obj[p];
    }
};


function backButton() {
    hideAlert();

    var prevSub = '';
    if ($('#sub1').attr('class') == 'tabs-link active') {
        prevSub = 1;
    } else if ($('#sub2').attr('class') == 'tabs-link active') {
        prevSub = 2;
    } else if ($('#sub3').attr('class') == 'tabs-link active') {
        prevSub = 3;
    }
    hideLoad();
    $('#searchAlert').removeClass('in');
    var hist = window.RightViewNavigator.history.length;
    var ver = getAndroidVersion();
    if (hist > 2) {
        var poppingViewDescriptor = window.RightViewNavigator.history[window.RightViewNavigator.history.length - 1];
        window.RightViewNavigator.popView();
        var currentViewDescriptor = window.RightViewNavigator.history[window.RightViewNavigator.history.length - 1];
        if (currentViewDescriptor.sub != '') {
            logNow("PREVIOUS PAGE SUB WAS " + currentViewDescriptor.sub);
            makeSubActive(currentViewDescriptor.sub);
        }
        else {
        }
        if (currentViewDescriptor.foot != '' && currentViewDescriptor.foot != undefined) {
            makeFooterActive(currentViewDescriptor.foot);
        } else {
            makeFooterActive(5);
        }

        logNow("ID " + poppingViewDescriptor.item);
        logNow("OFFSET " + $('#' + poppingViewDescriptor.item).offset());
        if (poppingViewDescriptor.item != '' && poppingViewDescriptor.item != undefined) {
            var origId = poppingViewDescriptor.item;
            poppingViewDescriptor.item = poppingViewDescriptor.item - 1;
            logNow("Scrolling Item Into View" + poppingViewDescriptor.item);
            logNow("Item That was actually clicked" + (poppingViewDescriptor.item + 1));
            var ver = getAndroidVersion();
            if (ver == '' || ver > 401) {
                var rowpos = $('#' + poppingViewDescriptor.item).offset();
                if (rowpos == undefined) {
                    rowpos = $('#' + origId).offset();
                    $('#' + origId).find('.list-link').addClass('active');
                    rowpos.top -= 90;
                }
                else {
                    $('#' + (poppingViewDescriptor.item + 1)).find('.list-link').addClass('active');
                    rowpos.top -= 40;
                }

                logNow("SCROLLING TO " + rowpos.top)
                $('.viewNavigator_contentHolder').scrollTop(rowpos.top);
//
            }

        }

    } else if (hist == 2) {
        window.RightViewNavigator.popView();
//        renderCategories();
        layoutColumns();
    } else if (hist <= 1) {
        MessageDialogController.showConfirm(
            stringsDB.sure_exit, // message
            exitApp, // callback to invoke with index of button pressed
            stringsDB.confirm_exit, // title
            stringsDB.yes + ',' + stringsDB.no // buttonLabels
        );
    }
//    $('#listDiv').css('padding-top', '44px');
//    $('#listDiv2').css('padding-top', '44px');
}

function clearSelected() {
    $(".list-link").each(function (index) {

        if ($(this).hasClass("active")) {
            logNow("INDEX IS " + index);
            logNow("Found listSelected FOUND CURRENT CLASS " + $(this).attr('class'));
            $(this).removeClass("active");
            logNow("AFTER REMOVING CURRENT CLASS " + $(this).attr('class'));

        }
    });
}
function exitApp(button) {
    if (button) {
        navigator.app.exitApp();
    }
}
var intervalVar = undefined;
var data = [],
    rootView = undefined,
    sidebarView = undefined,
    rootData = undefined;
var loaded = false;


var networkState = 'online';

function onOnline() {
    //logNow("NETWORK STATE ONLINE");
    networkState = 'online';
}

function onOffline() {
    //logNow("NETWORK STATE OFFLINE");
    networkState = 'offline';
}


function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN] = 'Unknown';
    states[Connection.ETHERNET] = 'Ethernet';
    states[Connection.WIFI] = 'WiFi';
    states[Connection.CELL_2G] = '2G';
    states[Connection.CELL_3G] = '3G';
    states[Connection.CELL_4G] = '4G';
    states[Connection.CELL] = 'generic';
    states[Connection.NONE] = 'No';

    return states[networkState];
    //alert('Connection type: ' + states[networkState]);

}
function sendQuestionShare(questionUrl, questionNo, shortQuestion) {
    var regex = /(<([^>]+)>)/ig;
    regex = /^\s*/gm;
    if (fnCalled) {
        return;
    }
    fnCalled = true;


    var shareMsg = stringsDB.question + " " + questionNo + ": " + shortQuestion + "- " + stringsDB.islamqa_url + questionUrl + "\n\n" + stringsDB.download_from + " http://goo.gl/nKqwhA " + stringsDB.and_enter + " " + questionNo + " " + stringsDB.in_the_search_box;

    if(platform=='Android'){
    window.plugins.share.show({
            subject: "",
            text: shareMsg
        },
        function () {
            fnCalled = false;
        }, // Success function

        function () {
            MessageDialogController.showMessage(stringsDB.error_sharing_try_again, null, stringsDB.error_sharing_content, stringsDB.ok);
            fnCalled = false;
        } // Failure function
    );
    }
    else{
        window.plugins.socialsharing.share(shareMsg);

    }
}
function processSearch(query) {
    query = query.removeStopWords();
    var resultArray = new Array();
    //aQuery = str.match(/\b\w+\b/g);
    if (query.indexOf("\"") == -1) {
        logNow("DOUBLE QUOTE NOT FOUND");
        resultArray[0] = 'm|' + query;
    } else {
        resultArray[0] = 'm|' + query.replace(/"/g, '');
    }
    var aQuery = query.match(/("[^"]+"|[^"\s]+)/g);//Split space separated words, split "My Word" enclosed as 'My Word'
    if (aQuery.length == 1) {
        return resultArray;
    }
    for (var i = 0; i < aQuery.length; i++) {
        logNow("Terms: " + aQuery[i].replace(/"/g, ''));
        aQuery[i] = aQuery[i].replace(/"/g, '');
        if (/\s/.test(aQuery[i])) {
            resultArray[i + 1] = 'y|' + aQuery[i];
        }
        else {
            resultArray[i + 1] = 'n|' + aQuery[i];
        }
    }
    return resultArray;
}


function isEmailValid(email) {
    var e = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return e.test(email);
}
function confirmBackup() {
    MessageDialogController.showConfirm(
        stringsDB.do_you_want_to_backup, // message
        function (button) {
            if (button) {
                backup2CardNow();
            }
        }, // callback to invoke with index of button pressed
        stringsDB.confirm_backup, // title
        stringsDB.yes + ',' + stringsDB.no // buttonLabels
    );
}
function backup2CardNow() {
    showLoad();
    var folderJson = [], folderQuestionJson = [], folderCounter = 0, folderQuestCounter = 0, qry = '';

    var backupFolderQuestions = function () { // Get all the Folder Questions
        logNow("Backup Folder Questions Called");

        qry = 'SELECT * FROM FOLDER_QUESTIONS';
        adapter.executeQuery(qry).done(function (results) {
            if (results != null && results.rows != null) {
                var len = results.rows.length;
                logNow("FOLDER_QUESTIONS table: " + len + " rows found.");
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        logNow("FOLDER_ID " + results.rows.item(i).folder_id);
                        folderQuestionJson.push({id: results.rows.item(i).id, folder_id: results.rows.item(i).folder_id, question_no: results.rows.item(i).question_no}); // Add them to a associated array to convert to JSON
                        folderQuestCounter = folderQuestCounter + 1; // To check if there is 1 Folder Question at least
                    }
                }

                if (folderCounter > 0) { // If there is at least 1 folder
                    var done = writeToFile('f.js', folderJson); // Call function that writes to file with filename and Array
                    logNow("Done value is " + done + " and Folder Questions Count is " + folderQuestCounter);
                    if (folderQuestCounter > 0) { // If there is at least 1 Folder Question
                        writeToFile('fq.js', folderQuestionJson); // Call function that writes to file with filename and Array
                        MessageDialogController.showMessage(stringsDB.successfully_backed_up, null, stringsDB.ok, stringsDB.success);
                        hideLoad();

                    }
                }

            }
        });
    }
    // 1.
    qry = 'SELECT * FROM FOLDERS';
    adapter.executeQuery(qry).done(function (results) {//Get the Folders
        if (results != null && results.rows != null) {
            var len = results.rows.length;
            logNow("FOLDERS table: " + len + " rows found.");
            if (len > 0) {
                for (var i = 0; i < len; i++) {
                    logNow("FOLDERS " + results.rows.item(i).folder_name);
                    folderJson.push({id: results.rows.item(i).id, folder_name: results.rows.item(i).folder_name, colour: results.rows.item(i).colour}); // MAKE JSON OBJECT HERE - Add them to a associated array to convert to JSON
                    folderCounter = folderCounter + 1; // To check if there is 1 folder at least
                }
                backupFolderQuestions();// Get the Folder Questions
            }
            else {
                MessageDialogController.showMessage(stringsDB.no_folder_to_backup, null, stringsDB.ok, stringsDB.nothing_to_backup);
                hideLoad();
                return;
            }
        }
    });


}

function writeToFile(fileName, jsonData) { // Function to write Array Data as JSON to file to be Imported later
    //2 - Got filesystem so request File Entry
    var gotFS = function (fileSystem) {
        logNow("Got File System");
        fileSystem.root.getFile(fileName, {create: true, exclusive: false}, gotFileEntry, fail);
    }
    //3 - Got file entry so request File Writer to write files
    var gotFileEntry = function (fileEntry) {
        logNow("Got File Entry");
        fileEntry.createWriter(gotFileWriter, fail);
    }
    // 4 - Got file writer, preparing it
    var gotFileWriter = function (writer) {
        // 6 - Called when writing is over.
        writer.onwriteend = function (evt) {
            logNow("Finished Writing to " + fileName);
        };
        // 5 - Write Files Here.
        writer.write(JSON.stringify(jsonData));
    }

    var fail = function (error) {
        logNow(error.code);
    }
    // 1 - Request the Filesystem
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}

function restoreFromCardNow() {
    MessageDialogController.showConfirm(
        stringsDB.do_you_want_to_restore, // message
        function (button) {
            if (button) {
                readFromFile('f.js', 'FOLDERS');
            }
        }, // callback to invoke with index of button pressed
        stringsDB.confirm_restore, // title
        stringsDB.yes + ',' + stringsDB.no // buttonLabels
    );

}

function readFromFile(fileName, table) { // Function to write Array Data as JSON to file to be Imported later
    //2 - Got filesystem so request File Entry
    var gotFS = function (fileSystem) {
        logNow("Got File System");
        fileSystem.root.getFile(fileName, {create: true, exclusive: false}, gotFileEntry, fail);
    }
    //3 - Got file entry so request File Writer to write files
    var gotFileEntry = function (fileEntry) {
        logNow("Got File Entry");
        fileEntry.file(gotFile, fail);
    }
    // 4 - Got file writer, preparing it
    var gotFile = function (file) {
        //readDataUrl(file);
        readAsText(file);
    }
    var readDataUrl = function (file) {
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            console.log("Read as data URL");
            console.log(evt.target.result);
        };
        reader.readAsDataURL(file);
    }
    var readAsText = function (file) {
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            console.log("Read as text");
            console.log(evt.target.result);
            restoreFolders(evt.target.result, table);
        };
        reader.readAsText(file);
    }
    var fail = function (error) {
        logNow(error.code);
    }
    // 1 - Request the Filesystem
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}

function restoreFolders(data, table) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        logNow("ERROR PARSING");
    }
    var qry = '';

    qry = 'DELETE from ' + table; //Empty the folders first
    adapter.executeQuery(qry);

    if (table == 'FOLDERS') { //If table is Folders, insert data into folders table
        if (data.length == 0) {
            MessageDialogController.showMessage(stringsDB.no_backup_to_restore, null, stringsDB.nothing_to_restore, stringsDB.ok);
            hideLoad();
            return;
        }
        adapter.insertFolders(data);

        readFromFile('fq.js', 'FOLDER_QUESTIONS');
    }
    if (table == 'FOLDER_QUESTIONS') {
        adapter.insertFolderQuestions(data);

        qry = 'SELECT * FROM FOLDER_QUESTIONS;';
        adapter.executeQuery(qry).done(function (results) {
            if (results != null && results.rows != null) {
                var len = results.rows.length;
                logNow("AFTER INSERTING FOLDER_QUESTIONS LENGTH: " + len);
            }
        });

        MessageDialogController.showMessage(stringsDB.successfully_restored_backup, null, stringsDB.ok, stringsDB.success);
        refreshFavourites();
    }
}
function resetHideAddToFolder() {
    $('.action-sheet').removeClass('in');
    $('#questionId').val('');
    $('#folderSelect option').remove();
    $('#folderSelect').append($('<option></option>').val("na").html("Select Folder"));
    $('#newFolderName').val('');
    $('#newFolderColour').val('');
    hideAlert();
}

function removeFolder(id) {
    MessageDialogController.showConfirm(
        stringsDB.do_you_want_to_delete_folder, // message
        function (button) {
            var qry = 'DELETE FROM FOLDERS WHERE id ="' + id + '";';
            adapter.executeQuery(qry);

            qry = 'DELETE FROM FOLDER_QUESTIONS WHERE folder_id ="' + id + '";';

            adapter.executeQuery(qry).done(function (results) {
                renderHome();
                renderFolders(0, 20);

            });

        }, // callback to invoke with index of button pressed
        stringsDB.confirm_delete, // title
        stringsDB.yes + ',' + stringsDB.no // buttonLabels
    );

}
function addToFolder(id) { // Called when you touch the + icon in the answer screen
    resetHideAddToFolder();
    logNow("Add to Folder Called with ID" + id);
    var questionId = $('#questionId').val();
    var folderSelect = $('#folderSelect').val();
    var newFolderName = $('#newFolderName').val();
    var newFolderColour = $('#newFolderColour').val();

    if (id != '' && id > 0) {
        $('#folderForm').addClass('in');
        var mySelect = $('#folderSelect');
        $('#questionId').val(id);
        var qry = 'SELECT * FROM FOLDERS';

        adapter.executeQuery(qry).done(function (results) { // Get all folders to populate the dropdown
            if (results != null && results.rows != null) {
                var len = results.rows.length;
                logNow("FOLDERS table: " + len + " rows found.");
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        logNow("FOLDERS " + results.rows.item(i).folder_name);
                        mySelect.append(
                            $('<option></option>').val(results.rows.item(i).id).html(results.rows.item(i).folder_name)
                        );
                    }
                }
            }
        });
    }
}

function saveToFolder() {
    var questionId = $('#questionId').val();
    var folderSelect = $('#folderSelect').val();
    var folderSelectText = $('#folderSelect option:selected').text();
    var newFolderName = $('#newFolderName').val().toTitleCase();
    var newFolderColour = $('#newFolderColour option:selected').val();

    var confirmSaveToFolder = function (button, type) { // Common method to add Folders and Questions or Just adding Questions
        logNow("ConfirmSaveToFolder called with button " + button + " and type " + type);
        if (button == 2 || button == true) { // Check if button pressed is true
            $('#newFolderName').removeClass('required'); // Get daat
            $('#newFolderColourLabel').removeClass('required');
            var questionId = Number($('#questionId').val());
            if (type == 'old') { // Check if adding to old folder
                var folderSelect = Number($('#folderSelect').val()); // Get data
                var folderSelectName = $('#folderSelect').html();
                adapter.insertSingleFolderQuestions(folderSelect, questionId).done(function (results) {// Insert the question to existing folder
                    if (results == 'done') {
                        logNow("Inserted Question " + questionId + " To Folder " + folderSelect);
                        refreshView(true);
                    }
                    else {
                        logNow("Failed to Insert Question " + questionId + " To Folder " + folderSelect);
                    }
                });
                MessageDialogController.showMessage(stringsDB.successfully_added_question + questionId + stringsDB.to_folder + folderSelectText + "!", null, stringsDB.ok, stringsDB.success);
                resetHideAddToFolder();
                refreshFavourites();

            }
            else if (type == 'new') { // Check if creating a new folder
                logNow("CREATING A NEW FOLDER AND INSERTING");
                var newFolderName = $('#newFolderName').val(); // Get data
                var newFolderColour = $('#newFolderColour').val();
                // Insert new folder
                adapter.insertSingleFolder(newFolderName,newFolderColour).done(function (results) {
                        if (results >= 0) {
                            logNow("Inserted New Folder " + newFolderName + " With Colour " + newFolderColour + " Insert ID is " + results);
                            // On success, Insert the question to folder
                            adapter.insertSingleFolderQuestions(results,questionId).done(function (results) {
                                if (results == 'done') {
                                    logNow("Inserted Question " + questionId + " To Folder " + newFolderName);
                                    refreshView(true);
                                }
                                else {
                                    logNow("Failed to Insert Question " + questionId + " To Folder " + newFolderName);
                                }
                            });
                            refreshView(true);
                        }
                        else {
                            logNow("Failed to Insert New Folder " + newFolderName);
                        }
                    });
                // Show success
                MessageDialogController.showMessage(stringsDB.successfully_added_question + questionId + stringsDB.to_folder + newFolderName + stringsDB.with_colour + newFolderColour + "!", null, stringsDB.ok, stringsDB.success);
                resetHideAddToFolder();
                refreshFavourites();
            }
        }
    }

    if (questionId != '' && questionId != undefined) {// Check if question ID is set to the hidden input in the Action Sheet
        if (folderSelect != 'na') {//Adding to Existing Folder

            MessageDialogController.showConfirm(
                stringsDB.do_you_want_to_add_question + questionId + stringsDB.to_folder + folderSelectText + '?', // message
                function (button) {
                    confirmSaveToFolder(button, 'old');
                }, // callback to invoke with index of button pressed
                stringsDB.confirm_add, // title
                stringsDB.yes + ',' + stringsDB.no // buttonLabels
            );
        }
        else if (folderSelect == 'na') { // Meaning no existing folder selected.
            if (newFolderName == '') { // If no existing folder is selected and no new folder name is given, then show its required
                $('#newFolderNameLabel').addClass('required');
                //$('#newFolderNameLable').css('colour','red');
                $('#newFolderColour').removeClass('required');
                return;
            }
            else if (newFolderColour == '') { // Check if colour is selected
                $('#newFolderNameLabel').removeClass('required');
                //$('#newFolderNameLable').css('colour','grey');
                $('#newFolderColour').addClass('required');
                return;
            }
            else { // If all ok, show confirmation.
                MessageDialogController.showConfirm(
                    stringsDB.do_you_want_to_add_question + questionId + stringsDB.to_folder + newFolderName + stringsDB.with_colour + newFolderColour + '?', // message
                    function (button) {
                        confirmSaveToFolder(button, 'new');
                    }, // callback to invoke with index of button pressed
                    stringsDB.confirm_add, // title
                    stringsDB.yes + ',' + stringsDB.no // buttonLabels
                );
            }
        }
    }
}


function removeFromFav(id) {
    logNow("Remove From Folder Called with ID" + id);
    if (id != '' && id > 0) {
        MessageDialogController.showConfirm(
            stringsDB.do_you_want_to_remove_question_folder, // message
            function (button) {
                confirmRemoveFromFav(button, id);
            }, // callback to invoke with index of button pressed
            stringsDB.confirm_remove, // title
            stringsDB.yes + ',' + stringsDB.no // buttonLabels
        );
    }
}


function refreshView(isFav) {
    var viewDescriptor = window.RightViewNavigator.currentView();
    viewDescriptor.fav = isFav;
    window.RightViewNavigator.popView();
    window.RightViewNavigator.pushView(viewDescriptor);
}

function confirmRemoveFromFav(button, id) {
    logNow("Confirm Add to Fav Called with ID" + id);
    id = String(id);
    if (button == 2 || button) {
        //logNow("Executing INSERT INTO FAV (QUESTION_NO) VALUES ('"+id+"');");
        var qry = 'DELETE FROM FOLDER_QUESTIONS where question_no ="' + id + '"';

        adapter.executeQuery(qry).done(function (results) {
            logNow("Deleted Question " + id);
            refreshView(false);
        });
        MessageDialogController.showMessage(stringsDB.successfully_removed_question + id + stringsDB.from_your_folder, null, stringsDB.ok, stringsDB.success);
        refreshView(false);
        refreshFavourites();

    }
}


function promiseFail(updateClean, syncId) {
    if (updateClean == true) {
        logNow("END TRANSACTION - UPDATE CLEAN");
        window.localStorage.setItem('syncId', syncId);
        var qry = new Array();
        qry[0] = 'INSERT INTO QUESTIONS SELECT * FROM QUESTIONS_UPDATE';
        qry[1] = 'INSERT INTO ANSWERS SELECT * FROM ANSWERS_UPDATE';
        qry[2] = 'INSERT INTO LATEST_QUESTIONS SELECT * FROM LATEST_QUESTIONS_UPDATE';
        qry[3] = 'DELETE FROM QUESTIONS_UPDATE';
        qry[4] = 'DELETE FROM ANSWERS_UPDATE';
        qry[5] = 'DELETE FROM LATEST_QUESTIONS_UPDATE';

        adapter.batchExecuteQuery(qry).done(function (results) {
            updateProgress('progUpdateU1', 'progressU1', stringsDB.update_complete, 100);
            setTimeout(function () {
                onNav();
            }, 3500);
            setTimeout(function () {
                resetAlert()
            }, 3500);
        });
    }
    else if (updateClean == 'NA') {
        logNow("END TRANSACTION - NO NEW DATA");
        var qry = new Array();
        qry[0] = 'DELETE FROM QUESTIONS_UPDATE';
        qry[1] = 'DELETE FROM ANSWERS_UPDATE';
        qry[2] = 'DELETE FROM LATEST_QUESTIONS_UPDATE';
        adapter.batchExecuteQuery(qry).done(function (results) {
            setTimeout(function () {
                onNav();
            }, 3500);
            setTimeout(function () {
                resetAlert()
            }, 3500);

        });
    }
    else if (updateClean == 'clean') {
        var qry = new Array();
        qry[0] = 'DELETE FROM QUESTIONS_UPDATE';
        qry[1] = 'DELETE FROM ANSWERS_UPDATE';
        qry[2] = 'DELETE FROM LATEST_QUESTIONS_UPDATE';
        adapter.batchExecuteQuery(qry);
    }

    else {
        logNow("END TRANSACTION - UPDATE NOT CLEAN");
        $('#progUpdateU1').html(stringsDB.update_filed_try_again);
        $('#progressU1>span').css('width', '100%');
        $('#progressU1>span>span').html('100%');
        var qry = new Array();
        qry[0] = 'DELETE FROM QUESTIONS_UPDATE';
        qry[1] = 'DELETE FROM ANSWERS_UPDATE';
        adapter.batchExecuteQuery(qry).done(function (results) {
            setTimeout(function () {
                onNav();
            }, 3500);
            setTimeout(function () {
                resetAlert()
            }, 3500);
        });
    }
}
function resetAlert() {
    $('#alertBt4').css('display', 'block');
    $('#progUpdateU1').html(stringsDB.press_start_to_check_update);
    $('#progressU1>span').css('width', '0%');
    $('#progresU1>span>span').html('0%');
}
var syncID = ''
function updateProgress(progressUpdateId, progressId, msg, percentage) {
    if (msg == '') { // Used by updater
        $('#' + progressId + '>span').css('width', '' + percentage + '%');
        $('#' + progressId + '>span>span').html('' + percentage + '%');
    } else {
        $('#' + progressUpdateId).html(msg);
        $('#' + progressId + '>span').css('width', '' + percentage + '%');
        $('#' + progressId + '>span>span').html('' + percentage + '%');
    }
}

function checkForUpdate() {
    if (networkState != 'online') {
        MessageDialogController.showMessage(stringsDB.need_internet_to_check_update, null, stringsDB.ok, stringsDB.update_failed);
        resetAlert();
        return;
    }

    var updater = setInterval(function () {// Increment the progress bar 1% for every 4 seconds.
        wid = wid + 1;
        if (wid < 96) {
            updateProgress('progUpdateU1', 'progressU1', '', wid);
        }
    }, 4000);

    var wid = 0;
    promiseFail('clean');
    var totalAnswers = 0;
    var qCount = 0;
    var updateClean = true;

    $('#alertBt4').css('display', 'none'); // Hiding the buttons
    updateProgress('progUpdateU1', 'progressU1', stringsDB.checking_for_new_question, '5');

    logNow("CHECK FOR UPDATE CALLED");
    var syncId = window.localStorage.getItem('syncId');
    logNow("SYNCID IS " + syncId);

    var dUrl = "http://www.dawahdesk.com/projects/islamqa/index3.php?task=checkForUpdate&sync_no=" + syncId + "&platform=android";
    logNow("CALLING URL " + dUrl);

    var checkUpdate = $.ajax({//Checking for update files.
        url: dUrl,
        //async : false,
        dataType: "json"
    });
    $.when(checkUpdate).done(function (data) { //GET THE FILES
        data = JSON.stringify(data); //PARSE IT
        logNow("GOT FILE DATA " + data);
        if (data == '[]') { // IF EMPTY - NOTHING TO UPDATE
            updateProgress('progUpdateU1', 'progressU1', stringsDB.you_already_have_latest_question, '100'); //UPDATE ACCORDINGLY
            updateClean = 'NA'; //SET UPDATE AS NA SO THAT CLEANUP HAPPENS
            clearInterval(updater); //CLEAR THE INTERVAL WHICH KEEPS MOVING THE SLIDER EVERY FEW SECONDS
            promiseFail('NA', ''); //CALL THE CLEANUP
            return;
        }
        var fileData = '';
        fileData = JSON.parse(data);

        $.when($.each(fileData, function (pIndex, fileDataGot) {
                var iUrl = fileDataGot.static_path + fileDataGot.files + "?a=" + Math.random(); //FORM URL USING STATIC_PATH + FILENAME AND ADD A RANDOM SEED A=
                logNow("FILE TYPE IS " + fileDataGot.file_type);
                if (fileDataGot.file_type == 'questions') { // IF THE FILE IS QUESTION
                    wid = wid + 5;
                    logNow("WID IS " + wid);
                    updateProgress('progUpdateU1', 'progressU1', stringsDB.update_found_downloading_question, wid);//INCREMENT THE SLIDER TO SHOW PROGRESS
                    logNow("CALLING INNER URL " + iUrl); //GET THE QUESTIONS
                    var getQuestions = $.ajax({
                        url: iUrl,
                        dataType: "json"
                        //async : false,
                    });
                    $.when(getQuestions).done(function (data) { // WHEN YOU FINALLY GET THE QUESTIONS
                        (function (data) { // QUESTIONS COULD HAVE MULTIPLE FILES AND MAY GET CALLED MORE THAN ONCE SO WE NEED A CLOSURE HERE
                            data = JSON.stringify(data);
                            var dataGot = '';
                            dataGot = JSON.parse(data);
                            logNow("GOT QUESTION DATA ");
                            updateProgress('progUpdateU1', 'progressU1', stringsDB.inserting_questions, wid);
                            db.transaction(function (transaction) {
                                $.each(dataGot, function (index, dataGot) {
                                    transaction.executeSql('INSERT INTO QUESTIONS_UPDATE (id, category_id, question, question_full, question_url, question_no) VALUES (?, ?, ?, ?, ?,?)', [dataGot.id, dataGot.category_id, dataGot.question, dataGot.question_full, dataGot.question_url, dataGot.question_no]);
                                    //logNow("INSERTING QUESTION " + dataGot.id);
                                    if (index == 1) {
                                        wid = wid + 5;
                                        updateProgress('progUpdateU1', 'progressU1', stringsDB.downloading_questions, wid);
                                    }
                                });
                            });
                        })(data);
                    });
                    $.when(getQuestions).fail(function () {
                        updateClean = false;
                        clearInterval(updater);
                        promiseFail(false);
                        return;

                    });
                }

                if (fileDataGot.file_type == 'answers') {
                    logNow("CALLING INNER URL " + iUrl);
                    wid = wid + 10;
                    updateProgress('progUpdateU1', 'progressU1', stringsDB.downloading_answers, wid);

                    var getAnswers = $.ajax({
                        url: iUrl,
                        dataType: "json"
                        // async : false,
                    });
                    $.when(getAnswers).done(function (data) {
                        (function (data) {
                            wid = wid + 10;
                            data = JSON.stringify(data);
                            var dataGotA = '';
                            dataGotA = JSON.parse(data);
                            logNow("GOT ANSWERS DATA ");
                            updateProgress('progUpdateU1', 'progressU1', stringsDB.inserting_answers, wid);
                            db.transaction(function (transaction) {
                                qCount = qCount + 1;
                                $.each(dataGotA, function (index, dataGot) {
                                    totalAnswers = totalAnswers + 1;
                                    transaction.executeSql('INSERT INTO ANSWERS_UPDATE (id, question_id, answers) VALUES (?, ?, ?)', [dataGot.id, dataGot.question_id, dataGot.answers]);
                                    //logNow("Local index is is " + index);
                                    //logNow("Local Datagot Length is " + (dataGotA.length - 1));
                                    if (qCount == (((fileData.length - 1) / 2) + 1) && index == (dataGotA.length - 1)) {
                                        wid = 95;
                                        updateProgress('progUpdateU1', 'progressU1', stringsDB.update_complete, 100);
                                        clearInterval(updater);
                                        promiseFail(true, syncID);
                                    }

                                });
                                wid = wid + 5;
                                updateProgress('progUpdateU1', 'progressU1', stringsDB.downloading_answers, wid);
                            });
                        })(data);
                    });
                    $.when(getAnswers).fail(function () {
                        updateClean = false;
                        clearInterval(updater);
                        promiseFail(false, '');
                        return;

                    });

                }
                if (fileDataGot.file_type == 'latest') {
                    logNow("CALLING INNER URL " + iUrl);
                    wid = wid + 5;
                    updateProgress('progUpdateU1', 'progressU1', stringsDB.updating_answers, wid);

                    var getAnswers = $.ajax({
                        url: iUrl,
                        dataType: "json"
                        // async : false,
                    });
                    $.when(getAnswers).done(function (data) {
                        (function (data) {
                            data = JSON.stringify(data);
                            var dataGotL = '';
                            dataGotL = JSON.parse(data);
                            logNow("GOT LATEST DATA ");
                            db.transaction(function (transaction) {
                                qCount = qCount + 1;
                                $.each(dataGotL, function (index, dataGot) {
                                    totalAnswers = totalAnswers + 1;
                                    transaction.executeSql('DELETE FROM LATEST_QUESTIONS');
                                    transaction.executeSql('INSERT INTO LATEST_QUESTIONS_UPDATE (id, question_no) VALUES (?, ?)', [dataGot.id, dataGot.question_no]);
                                    //logNow("Local index is is " + index);
                                    //logNow("Local Datagot Length is " + (dataGotA.length - 1));

                                });
                            });
                        })(data);
                    });
                    $.when(getAnswers).fail(function () {
                        updateClean = false;
                        clearInterval(updater);
                        promiseFail(false, '');
                        return;

                    });

                }
                syncID = fileDataGot.curr_sync_id;

            })).done(function () {
                if (updateClean == true) {
                    //promiseFail(true);
                }
                else {
                    //promiseFail(false);
                }
            });
    });
    $.when(checkUpdate).fail(function () {
        updateClean = false;
        clearInterval(updater);
        promiseFail(false, '');
        return;
    });

}

function getAndroidVersion() {
    if (window.device != null && window.device.platform == "Android") {
        var version = window.device.version.replace(/\./g, "");

        version = parseInt(version);
        //logNow("VERSION IS "+version);
        if (version < 100) {
            version = version * 10;
            //  logNow("Multiplied IS "+version);
        }
        return version;
    } else {
        return '';
    }
}

String.prototype.removeStopWords = function () {
    /*
     * String method to remove stop words
     * Written by GeekLad http://geeklad.com
     * Stop words obtained from http://www.lextek.com/manuals/onix/stopwords1.html
     *   Usage: string_variable.removeStopWords();
     *   Output: The original String with stop words removed
     */
    var x;
    var y;
    var word;
    var stop_word;
    var regex_str;
    var regex;
    var cleansed_string = this.valueOf();
    var stop_words = new Array(
        'a',
        'about',
        'above',
        'across',
        'after',
        'again',
        'against',
        'all',
        'almost',
        'alone',
        'along',
        'already',
        'also',
        'although',
        'always',
        'among',
        'an',
        'and',
        'another',
        'any',
        'anybody',
        'anyone',
        'anything',
        'anywhere',
        'are',
        'area',
        'areas',
        'around',
        'as',
        'ask',
        'asked',
        'asking',
        'asks',
        'at',
        'away',
        'b',
        'back',
        'backed',
        'backing',
        'backs',
        'be',
        'became',
        'because',
        'become',
        'becomes',
        'been',
        'before',
        'began',
        'behind',
        'being',
        'beings',
        'best',
        'better',
        'between',
        'big',
        'both',
        'but',
        'by',
        'c',
        'came',
        'can',
        'cannot',
        'case',
        'cases',
        'certain',
        'certainly',
        'clear',
        'clearly',
        'come',
        'could',
        'd',
        'did',
        'differ',
        'different',
        'differently',
        'do',
        'does',
        'done',
        'down',
        'down',
        'downed',
        'downing',
        'downs',
        'during',
        'e',
        'each',
        'early',
        'either',
        'end',
        'ended',
        'ending',
        'ends',
        'enough',
        'even',
        'evenly',
        'ever',
        'every',
        'everybody',
        'everyone',
        'everything',
        'everywhere',
        'f',
        'face',
        'faces',
        'fact',
        'facts',
        'far',
        'felt',
        'few',
        'find',
        'finds',
        'first',
        'for',
        'four',
        'from',
        'full',
        'fully',
        'further',
        'furthered',
        'furthering',
        'furthers',
        'g',
        'gave',
        'general',
        'generally',
        'get',
        'gets',
        'give',
        'given',
        'gives',
        'go',
        'going',
        'good',
        'goods',
        'got',
        'great',
        'greater',
        'greatest',
        'group',
        'grouped',
        'grouping',
        'groups',
        'h',
        'had',
        'has',
        'have',
        'having',
        'he',
        'her',
        'here',
        'herself',
        'high',
        'high',
        'high',
        'higher',
        'highest',
        'him',
        'himself',
        'his',
        'how',
        'however',
        'i',
        'if',
        'important',
        'in',
        'interest',
        'interested',
        'interesting',
        'interests',
        'into',
        'is',
        'it',
        'its',
        'itself',
        'j',
        'just',
        'k',
        'keep',
        'keeps',
        'kind',
        'knew',
        'know',
        'known',
        'knows',
        'l',
        'large',
        'largely',
        'last',
        'later',
        'latest',
        'least',
        'less',
        'let',
        'lets',
        'like',
        'likely',
        'long',
        'longer',
        'longest',
        'm',
        'made',
        'make',
        'making',
        'man',
        'many',
        'may',
        'me',
        'member',
        'members',
        'men',
        'might',
        'more',
        'most',
        'mostly',
        'mr',
        'mrs',
        'much',
        'must',
        'my',
        'myself',
        'n',
        'necessary',
        'need',
        'needed',
        'needing',
        'needs',
        'never',
        'new',
        'new',
        'newer',
        'newest',
        'next',
        'no',
        'nobody',
        'non',
        'noone',
        'not',
        'nothing',
        'now',
        'nowhere',
        'number',
        'numbers',
        'o',
        'of',
        'off',
        'often',
        'old',
        'older',
        'oldest',
        'on',
        'once',
        'one',
        'only',
        'open',
        'opened',
        'opening',
        'opens',
        'or',
        'order',
        'ordered',
        'ordering',
        'orders',
        'other',
        'others',
        'our',
        'out',
        'over',
        'p',
        'part',
        'parted',
        'parting',
        'parts',
        'per',
        'perhaps',
        'place',
        'places',
        'point',
        'pointed',
        'pointing',
        'points',
        'possible',
        'present',
        'presented',
        'presenting',
        'presents',
        'problem',
        'problems',
        'put',
        'puts',
        'q',
        'quite',
        'r',
        'rather',
        'really',
        'right',
        'right',
        'room',
        'rooms',
        's',
        'said',
        'same',
        'saw',
        'say',
        'says',
        'second',
        'seconds',
        'see',
        'seem',
        'seemed',
        'seeming',
        'seems',
        'sees',
        'several',
        'shall',
        'she',
        'should',
        'show',
        'showed',
        'showing',
        'shows',
        'side',
        'sides',
        'since',
        'small',
        'smaller',
        'smallest',
        'so',
        'some',
        'somebody',
        'someone',
        'something',
        'somewhere',
        'state',
        'states',
        'still',
        'still',
        'such',
        'sure',
        't',
        'take',
        'taken',
        'than',
        'that',
        'the',
        'their',
        'them',
        'then',
        'there',
        'therefore',
        'these',
        'they',
        'thing',
        'things',
        'think',
        'thinks',
        'this',
        'those',
        'though',
        'thought',
        'thoughts',
        'three',
        'through',
        'thus',
        'to',
        'today',
        'together',
        'too',
        'took',
        'toward',
        'turn',
        'turned',
        'turning',
        'turns',
        'two',
        'u',
        'under',
        'until',
        'up',
        'upon',
        'us',
        'use',
        'used',
        'uses',
        'v',
        'very',
        'w',
        'want',
        'wanted',
        'wanting',
        'wants',
        'was',
        'way',
        'ways',
        'we',
        'well',
        'wells',
        'went',
        'were',
        'what',
        'when',
        'where',
        'whether',
        'which',
        'while',
        'who',
        'whole',
        'whose',
        'why',
        'will',
        'with',
        'within',
        'without',
        'work',
        'worked',
        'working',
        'works',
        'would',
        'x',
        'y',
        'year',
        'years',
        'yet',
        'you',
        'young',
        'younger',
        'youngest',
        'your',
        'yours',
        'z'
    )

    // Split out all the individual words in the phrase
    words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/g)

    // Review all the words
    for (x = 0; x < words.length; x++) {
        // For each word, check all the stop words
        for (y = 0; y < stop_words.length; y++) {
            // Get the current word
            word = words[x].replace(/\s+|[^a-z]+/ig, "");	// Trim the word and remove non-alpha

            // Get the stop word
            stop_word = stop_words[y];

            // If the word matches the stop word, remove it from the keywords
            if (word.toLowerCase() == stop_word) {
                // Build the regex
                regex_str = "^\\s*" + stop_word + "\\s*$";		// Only word
                regex_str += "|^\\s*" + stop_word + "\\s+";		// First word
                regex_str += "|\\s+" + stop_word + "\\s*$";		// Last word
                regex_str += "|\\s+" + stop_word + "\\s+";		// Word somewhere in the middle
                regex = new RegExp(regex_str, "ig");

                // Remove the word from the keywords
                cleansed_string = cleansed_string.replace(regex, " ");
            }
        }
    }
    return cleansed_string.replace(/^\s+|\s+$/g, "");
}

/**
 * The object encapsulates messaging functionality to work both in PhoneGap and
 * browser environment.
 * @author Zorayr Khalapyan
 *
 */
var MessageDialogController = (function () {

    var that = {};

    /**
     * Invokes the method 'fun' if it is a valid function. In case the function
     * method is null, or undefined then the error will be silently ignored.
     *
     * @param fun  the name of the function to be invoked.
     * @param args the arguments to pass to the callback function.
     */
    var invoke = function (fun, args) {
        if (fun && typeof fun === 'function') {
            fun(args);
        }
    };

    that.showMessage = function (message, callback, buttonName, title) {

        title = title || "DEFAULT_TITLE";
        buttonName = buttonName || 'OK';

        if (navigator.notification && navigator.notification.alert) {

            navigator.notification.alert(
                message,    // message
                callback,   // callback
                title,      // title
                buttonName  // buttonName
            );

        } else {

            alert(message);
            invoke(callback);
        }

    };

    that.showConfirm = function (message, callback, title, buttonLabels) {
        logNow("BUTTON LABLES " + buttonLabels);
        //Set default values if not specified by the user.
        buttonLabels = buttonLabels || 'OK,Cancel';
        var buttonList = buttonLabels.split(',');

        title = title || "DEFAULT TITLE";

        //Use Cordova version of the confirm box if possible.
        if (navigator.notification && navigator.notification.confirm) {
            var _callback = function (index) {
                if (callback) {
                    //The ordering of the buttons are different on iOS vs. Android.
                    if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
                        index = buttonList.length - index;
                    }
                    callback(index == 1);
                }
            };

            navigator.notification.confirm(
                message,      // message
                _callback,    // callback
                title,        // title
                buttonLabels  // buttonName
            );

            //Default to the usual JS confirm method.
        } else {
            invoke(callback, confirm(message));
        }

    };

    return that;

})();


String.prototype.toTitleCase = function () {
    var input = this;
    try {
        var str = input.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        return str;
    }
    catch (err) {
        return input;
    }
};