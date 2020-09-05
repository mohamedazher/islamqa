var db=0;
var catData = '';
var questData = '';
var ansData = '';
var acatData = '';
var aLinkData = '';
var arcatData = '';
var articleData = '';
var qInserting = 1;
var aCount = 0;
var qCount = 0;
var rendered = false;
var loadAns1Called = false;
var loadAns2Called = false;
var qLength=0;
var aLength=0;
var qIndex=0;
var aIndex=0;
var importStarted = false;
function createDB(){

    if(importStarted==true){
        return;
    }
    importStarted = true;
    //$('#loading').show();
    $('#progressQ>span').css('width', '1%');
    $('#progressQ>span>span').html('1%');
    $('#alertBt1').css('display','none');
    db = window.openDatabase("assim", "1.0", "Question and Answers Db", 78000000);
    loadCate();
}
function readAsText2(file) {
    var reader = new FileReader();
    reader.onloadend = function (evt) {
        console.log("Read as text");
        console.log("FINISHED READING: " + currFile + "- PARSING NOW");
        dataGot = JSON.stringify(evt.target.result);
        fileName = currFile.substring(0, 4);
        if (fileName == 'cate') {
            catDate = '';
            catData = JSON.parse(dataGot);
            console.log("CALLING POPULATE CATS");
            populateCats();
        } else if (fileName == 'ques') {
            questData = '';
            questData = JSON.parse(dataGot);
            console.log('CALLING POPULATE QUESTIONS');
            populateQuest();
        } else if (fileName == 'answ') {
            ansData = '';
            ansData = JSON.parse(dataGot);;
            populateAns();
        }
    };
    reader.readAsText(file);
}


function getData(file) {
    console.log("FILE NAME IS " + file);
    var dataGot = '';
    $.ajax({
        url: "js/"+file+".js",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            data = JSON.stringify(data);
            dataGot = '';
            dataGot = JSON.parse(data);

            //window["load"+file.substring(0,4)](db);
            var fileName=file.substring(0,4);
            if(fileName=='cate'){
                catDate = '';
                catData = dataGot;
                populateCats();
            }

            else if(fileName=='ques'){
                questData='';
                questData=dataGot;
                populateQuest();
            }
            else if(fileName=='answ'){
                ansData = dataGot;
                populateAns();
            }
            loaded = true;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            //console.log("Error Featching Data");
        }
    });

    //return dataGot;
}


function loadCate() {
    tcatData = getData("categories");
}

function loadQues(qInserting) {
    //for (qInserting = 1; qInserting <=4; qInserting++) {
        tquestData = getData("questions" + qInserting);
    //}
}

function loadAnsw(qInserting) {
    //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    console.log("Load Answers Called");
    //for (qInserting = 1; qInserting < 2; qInserting++) {
        tquestData = getData("answers" + qInserting);
   // }
}
function doTestError(e) {
    console.log('Test fail' + e);
}

function doTestSuccess() {
    console.log('Test pass');
}
function populateCats() {
    console.log("Populating Categories");
    //tx.executeSql('DROP TABLE IF EXISTS categories');
    var transaction_err = function (trans, e) {
        console.log('Error: ' + e.message);
        doTestError(e.message);
    }
//        var db_ptr = sqlitePlugin.openDatabase("gid_native.sqlite3", '', '', '', function
        try {
            $('#progUpdateQ').html('Creating Tables');
            db.transaction(function (tx) {
                //CATEGORIES
                tx.executeSql('DROP TABLE IF EXISTS categories');
                tx.executeSql('DROP TABLE IF EXISTS QUESTIONS');
                tx.executeSql('DROP TABLE IF EXISTS ANSWERS');
                tx.executeSql('CREATE TABLE IF NOT EXISTS CATEGORIES (id, category_links, category_url, element, parent)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS QUESTIONS (id, category_id, question collate nocase, question_full collate nocase, question_url, question_no)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ANSWERS (id, question_id, answers)');
                tx.executeSql('DELETE FROM CATEGORIES');
                tx.executeSql('DELETE FROM QUESTIONS');
                tx.executeSql('DELETE FROM ANSWERS');

                $.each(catData, function (index, catData) {
                    tx.executeSql('INSERT INTO CATEGORIES (id, category_links, category_url, element, parent) VALUES (?, ?, ?, ?, ?)', [catData.id, catData.category_links, catData.category_url, catData.element, catData.parent]);
                    // console.log("INSERTED "+catData.id);
                });
            }, doTestError, function () {
                //db_ptr.close(doTestSuccess, doTestError);
                $('#progUpdateQ').html('Populating Categories');
                $('#progressQ>span').css('width', '4%');
                $('#progressQ>span>span').html('4%');

            });
        } catch (err) {
            doTestError(err);
        }
//        }, doTestError);
    loadQues(qInserting);

}

function populateQuest() {
    console.log("POPULATE QUESTIONS CALLED");
    var transaction_err = function (trans, e) {
        console.log('Error: ' + e.message);
        doTestError(e.message);
    }
    //if (qInserting == 1) {
//        var db_ptr = sqlitePlugin.openDatabase("gid_native.sqlite3", '', '', '', function
            try {
                db.transaction(function (tx) {
                    $.each(questData, function (index, questData) {
                        tx.executeSql('INSERT INTO QUESTIONS (id, category_id, question, question_full, question_url, question_no) VALUES (?, ?, ?, ?, ?,?)', [questData.id, questData.category_id, questData.question, questData.question_full, questData.question_url, questData.question_no],
                            function () {
                                //if (questData.id > 5900) {
                                    //console.log("INSERTED QUESTIONS" + questData.id);
                                //}
                            },
                            transaction_err
                        );
                         //console.log("INSERTED "+questData.id);
                    });

                }, doTestError, function () {
                    //db_ptr.close(doTestSuccess, doTestError);
                    console.log("FINISHED INSERTING FILE QUESTIONS"+qInserting);
                    qInserting = qInserting + 1;

                    if (qInserting <= 4) {
                        console.log("INSERTED QUESTIONS FILE: " + (qInserting-1));
                        $('#progressQ>span').css('width', (qInserting*10)+'%');
                        $('#progressQ>span>span').html((qInserting*10)+'%');
                        $('#progUpdateQ').html('Populating Questions - '+(qInserting*2500));
                        getData("questions" + qInserting);
                        qInserting = qInserting + 1;
                        if(qInserting<=4){
                        getData("questions" + qInserting);
                        }
                    } else {
                        //$('#loading').hide();
                        qInserting=1;
                        loadAnsw(qInserting);
                    }
                    //loadAnsw(1);

                });
            } catch (err) {
                doTestError(err);
            }
//        }, doTestError);
        //qInserting = qInserting + 1;
   // }
    //qInserting = 1;

}
function populateAns() {
    console.log("POPULATE Answers CALLED");
    var transaction_err = function (trans, e) {
        console.log('Error: ' + e.message);
        doTestError(e.message);
    }

    //var db_ptr = sqlitePlugin.openDatabase("gid_native.sqlite3", '', '', '', function () {
        try {
            db.transaction(function (tx) {

                $.each(ansData, function (index, ansData) {
                    tx.executeSql('INSERT INTO ANSWERS (id, question_id, answers) VALUES (?, ?, ?)', [ansData.id, ansData.question_id, ansData.answers],
                        function () {
//                            if (ansData.id > 5600) {
//                                console.log("INSERTED ANSWERS" + ansData.id);
//                            }
                        },
                        transaction_err
                    );
                    // console.log("INSERTED "+catData.id);
                });
            }, doTestError, function () {
                //db_ptr.close(doTestSuccess, doTestError);
                //loadAnsw(qInserting);
                qInserting = qInserting + 1;
                if (qInserting <=10) {
                    console.log("INSERTED ANSWERS FILE: " + qInserting-1);
                    $('#progressQ>span').css('width', ((qInserting*5)+50)+'%');
                    $('#progressQ>span>span').html(((qInserting*5)+50)+'%');
                    $('#progUpdateQ').html('Populating Answers - '+(qInserting*1000));

                    getData("answers" + qInserting);
                    qInserting = qInserting + 1;
                    if (qInserting <=10) {
                    getData("answers" + qInserting);
                    }
                } else {
                    window.localStorage.setItem('upgrade4', "false");
                    window.localStorage.setItem('rateApp', "true");
                    upgrade="false";
                    renderCategories();
                }
            });
        } catch (err) {
            doTestError(err);
        }
    //}, doTestError);

    //renderCategories();
    //loadAudioCategories();
}

function errorCB(err) {
    //alert("Error processing SQL: "+err.code);
}

function successCB() {
    //alert("success!");
}

