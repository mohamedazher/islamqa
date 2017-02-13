var db = 0;
var catData = '';
var questData = '';
var ansDataa = new Array();
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
var qLength = 0;
var aLength = 0;
var qIndex = 0;
var aIndex = 0;
var importStarted = false;
function createDB() {
    if (importStarted == true) {
        return;
    }
    importStarted = true;

    //$('#loading').show();
    $('#progressQ>span').css('width', '1%');
    $('#progressQ>span>span').html('1%');
    $('#alertBt1').css('display', 'none');

    if(platform=='Android'){
        db = window.openDatabase("islamqa", "1.0", "Question and Answers Db", 100000000);
    }

    loadCate();
}

function getData(file) {
    logNow("FILE NAME IS " + file);
    var dataGot = '';
    $.ajax({
        url: "js/" + file + ".js",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            data = JSON.stringify(data);
            //window.localStorage.setItem('jsonDataTime', new Date());
            //logNow("GOT DATA FROM js/"+file+".js");
            dataGot = '';
            dataGot = JSON.parse(data);

            //window["load"+file.substring(0,4)](db);
            var fileName = file.substring(0, 4);
            if (fileName == 'cate') {
                catDate = '';
                catData = dataGot;
                db.transaction(populateCats, errorCB, successCB);
            }
            if (fileName == 'late') {
                catDate = '';
                catData = dataGot;
                db.transaction(populateLatest, errorCB, successCB);
            }
            else if (fileName == 'ques') {
                questData = '';
                //logNow('CALLING POPULATE QUESTIONS');
                questData = dataGot;
                //db.transaction(populateQuest, errorCB, successCB);
                logNow("DATA RECEIVED IS " + dataGot.length);
                (function (questData) {
                    logNow("THIS IS FIRST FUNCTION");
                    db.transaction(function (tx) {
                        logNow("INSERTING NEW QUESTION FILE");
                        //$('#loading').show();
                        qLength = qLength + questData.length;
                        var h;
                        $.each(questData, function (index, questData) {
                            qIndex = qIndex + 1;
                            tx.executeSql('INSERT INTO QUESTIONS (id, category_id, question, question_full, question_url, question_no) VALUES (?, ?, ?, ?, ?,?)', [questData.id, questData.category_id, questData.question, questData.question_full, questData.question_url, questData.question_no]);
                            //logNow("INSERTED QUESTIONS"+questData.id);
                            ////logNow("QINSERTING IS "+qInserting);
                            if (h != '1') {
                                qCount = qCount + 1;
                                logNow("Incrementing qCount - " + qCount);
                                $('#progressQ>span').css('width', (qCount * 25) + '%');
                                $('#progressQ>span>span').html((qCount * 25) + '%');
                                $('#progUpdateQ').html('Populating Questions - ' + (qCount * 2000));
                                h = 1;
                            }
                            //logNow("INSERTED ANSWERS"+ansData.question_id);
                            ////logNow("QINSERTING IS "+qInserting);
                            if (qCount == 4 && qLength == qIndex) {
                                //loadAnsw(1);
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
                                window.localStorage.setItem('questionsLoaded', 'true');


                            }
                        });
                        //})(ansD);
                    });
                })(dataGot);
            }
//            else if(fileName=='answ'){
//                ansData[aCount] = dataGot;
//                aCount = aCount+1;
//                if(aCount==2){
//                	db.transaction(populateAns, errorCB, successCB);
//                }
//
//            }
            else if (fileName == 'answ') {
                ansData = dataGot;
                logNow("DATA RECEIVED IS " + dataGot.length);
                (function (ansData) {
                    //logNow("THIS IS FIRST FUNCTION");
                    db.transaction(function (tx) {
                        logNow("INSERTING NEW ANSWER FILE");
                        aLength = aLength + ansData.length;
                        //$('#loading').show();
                        var h;
                        $.each(ansData, function (index, ansData) {
                            aIndex = aIndex + 1;
                            tx.executeSql('INSERT INTO ANSWERS (id, question_id, answers) VALUES (?, ?, ?)', [ansData.id, ansData.question_id, ansData.answers]);
                            if (h != '1') {
                                aCount = aCount + 1;
                                logNow("Incrementing aCount - " + aCount);
                                logNow("Inserting File Answers" + aCount + ".js");
                                if (aCount <= 5) {
                                    $('#progUpdateA1').html('Populating Answers - ' + (aCount * 1000));
                                    $('#progressA1>span').css('width', (aCount * 20) + '%');
                                    $('#progressA1>span>span').html((aCount * 20) + '%');
                                }
                                else {
                                    $('#progUpdateA2').html('Populating Answers - ' + (aCount * 1000));
                                    var percentage = ((aCount - 5) * 15);
                                    percentage = (percentage > 100) ? 100 : percentage;
                                    $('#progressA2>span').css('width', percentage + '%');
                                    $('#progressA2>span>span').html(percentage + '%');

                                }
                                h = 1;
                            }
                            //logNow("aLength is "+aLength+" Index is "+aIndex);
                            ////logNow("QINSERTING IS "+qInserting);
                            if (aCount == 5 && aLength == aIndex) {
                                logNow("Finished Inserting 5 Files, Moving...");
                                //loadAnsw(2);
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
                                window.localStorage.setItem('answers1Loaded', 'true');
                            }
                            if (aCount == 12 && aLength == aIndex) {
                                window.localStorage.setItem('answers2Loaded', 'true');
                                loadAnsw(3);
                            }
                        });
                        //})(ansD);
                    });
                })(dataGot);
                //return dataGot;
                //}

            }
            else if (fileName == 'acat') {
                acatData = '';
                acatData = dataGot;
                db.transaction(populateAcat, errorCB, successCB);
            }
            else if (fileName == 'alin') {
                aLinkData = '';
                aLinkData = dataGot;
                db.transaction(populateAlink, errorCB, successCB);
            }
            else if (fileName == 'arca') {
                arcatData = '';
                arcatData = dataGot;
                db.transaction(populateArcat, errorCB, successCB);
            }
            else if (fileName == 'arti') {
                articleData = '';
                articleData = dataGot;
                db.transaction(populateArticle, errorCB, successCB);
            }
            loaded = true;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            //logNow("Error Featching Data");
        }
    });
    return dataGot;
}

function loadCate() {
    catData = getData("categories");
}
function loadQues(qInserting) {
    for (var i = 1; i < 5; i++) {
        questData = getData("questions" + i);
    }
}
function loadLatest() {
    questData = getData("latest_questions");
}
function loadAnsw(qInserting) {
//    db = window.openDatabase("assim", "1.0", "Question and Answers Db", 100000000);
    //qInserting=1;
    if (qInserting == 1 && loadAns1Called == false) {
        $('#alertBt2').css('display', 'none');
        loadAns1Called = true;
        for (var i = 1; i < 6; i++) {
            questData = getData("answers" + i);
        }
    }
    else if (qInserting == 2 && loadAns2Called == false) {
//        db = window.openDatabase("assim", "1.0", "Question and Answers Db", 100000000);
        $('#alertBt3').css('display', 'none');
        if (aCount == 0) {
            aCount = 5;
        }
        for (var i = 6; i < 13; i++) {
            loadAns2Called = true;
            questData = getData("answers" + i);
        }
    }
    else if (qInserting == 3 && rendered != true) {
        //$('.progress>span').css('width', '100%');
        //$('.progress>span>span').html('100%');
        rendered = true;
        window.localStorage.setItem('upgrade4', "false");
        window.localStorage.setItem('rateApp', "true");
        upgrade = "false";
//        renderCategories();
        renderCards();
        //$('#loading').show();
    }
}
function loadAudioCategories() {
    questData = getData("acategories");
}
function loadAudioLinks() {
    questData = getData("alinks");
}
function loadArticleCategories() {
    questData = getData("arcategories");
}
function loadArticles() {
    questData = getData("articles");
}
function populateCats(tx) {
    logNow("Populating Categories");
//    tx.executeSql('DROP INDEX IF EXISTS QUEST_ID');
//    tx.executeSql('DROP INDEX IF EXISTS QUEST_NO');
//    tx.executeSql('DROP INDEX IF EXISTS QUESTION_ID');
//    tx.executeSql('DROP INDEX IF EXISTS PARENT_ID');
//    tx.executeSql('DROP TABLE IF EXISTS categories');
//    tx.executeSql('DROP TABLE IF EXISTS QUESTIONS');
//    tx.executeSql('DROP TABLE IF EXISTS ANSWERS');
//    tx.executeSql('DROP TABLE IF EXISTS LATEST_QUESTIONS');
//    tx.executeSql('DROP TABLE IF EXISTS FAV');
//    tx.executeSql('DROP TABLE IF EXISTS FOLDERS');
//    tx.executeSql('DROP TABLE IF EXISTS FOLDER_QUESTIONS');
//    tx.executeSql('DROP TABLE IF EXISTS FAVOURITES');

    tx.executeSql('CREATE TABLE IF NOT EXISTS CATEGORIES (id INTEGER, category_links, category_url, element INTEGER, parent INTEGER)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS LATEST_QUESTIONS (id INTEGER, question_no INTEGER)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS LATEST_QUESTIONS_UPDATE (id INTEGER, question_no INTEGER)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS QUESTIONS (id INTEGER, category_id INTEGER, question collate nocase, question_full collate nocase, question_url, question_no INTEGER)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS ANSWERS (id, question_id, answers)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS QUESTIONS_UPDATE (id INTEGER, category_id INTEGER, question collate nocase, question_full collate nocase, question_url, question_no INTEGER)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS ANSWERS_UPDATE (id INTEGER, question_id INTEGER, answers)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS FAV (id INTEGER PRIMARY KEY AUTOINCREMENT, question_no INTEGER)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS FOLDERS (id INTEGER PRIMARY KEY AUTOINCREMENT, folder_name, colour)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS FOLDER_QUESTIONS (id INTEGER PRIMARY KEY AUTOINCREMENT, folder_id INTEGER, question_no INTEGER)');
    tx.executeSql('DELETE FROM CATEGORIES');
    tx.executeSql('DELETE FROM QUESTIONS');
    tx.executeSql('DELETE FROM ANSWERS');
    tx.executeSql('DELETE FROM QUESTIONS_UPDATE');
    tx.executeSql('DELETE FROM ANSWERS_UPDATE');
//    tx.executeSql('DELETE FROM FAV');
    tx.executeSql('CREATE INDEX IF NOT EXISTS QUEST_ID ON QUESTIONS (ID)');
    tx.executeSql('CREATE INDEX IF NOT EXISTS  QUEST_NO ON QUESTIONS (QUESTION_NO)');
    tx.executeSql('CREATE INDEX IF NOT EXISTS  QUEST_NO2 ON LATEST_QUESTIONS (QUESTION_NO)');
    tx.executeSql('CREATE INDEX IF NOT EXISTS  QUEST_NO3 ON FAV (QUESTION_NO)');
    tx.executeSql('CREATE INDEX IF NOT EXISTS  QUESTION_ID ON ANSWERS (question_id)');
    tx.executeSql('CREATE INDEX IF NOT EXISTS  PARENT_ID ON CATEGORIES (parent)');
    tx.executeSql('CREATE INDEX IF NOT EXISTS  FOLDER_ID ON FOLDER_QUESTIONS (folder_id)');

    //logNow("COUNT IS "+catData.length);
    var catLen = catData.length - 1;
    $.each(catData, function (index, catData) {
        tx.executeSql('INSERT INTO CATEGORIES (id, category_links, category_url, element, parent) VALUES (?, ?, ?, ?, ?)', [catData.id, catData.category_links, catData.category_url, catData.element, catData.parent]);
        //logNow("INSERTED "+catData.id);
        //logNow("catData Lingth: "+catLen);
        //logNow("catData Index: "+index);
        if (index == catLen) {
            $('#progressQ>span').css('width', '4%');
            $('#progressQ>span>span').html('4%');
            //loadQues(qInserting);
            loadLatest();
        }
    });
}

function populateLatest(tx) {
    logNow("Populating Latest Questions");
    //logNow("COUNT IS "+catData.length);
    var catLen = catData.length - 1;
    $.each(catData, function (index, catData) {
        tx.executeSql('INSERT INTO LATEST_QUESTIONS (id, question_no) VALUES (?, ?)', [catData.id, catData.question_no]);
        //logNow("INSERTED "+catData.id);
        //logNow("catData Length: "+catLen);
        //logNow("catData Index: "+index);
        if (index == catLen) {
            $('#progressQ>span').css('width', '8%');
            $('#progressQ>span>span').html('8%');
            loadQues(qInserting);
        }
    });
}

function populateQuest(tx) {
    //logNow('POPULATE QUESTIONS CALLED WITH QINSERTING'+qInserting);
    $('#progUpdate').html('Populating Questions');

    if (qInserting == 1) {
        $.each(questData, function (index, questData) {
            tx.executeSql('INSERT INTO QUESTIONS (id, category_id, question, question_full, question_url, question_no) VALUES (?, ?, ?, ?, ?,?)', [questData.id, questData.category_id, questData.question, questData.question_full, questData.question_url, questData.question_no]);
            //logNow("INSERTED QUESTIONS"+questData.id);
            ////logNow("QINSERTING IS "+qInserting);
        });
        tx.executeSql('CREATE INDEX QUEST_ID ON QUESTIONS (ID)');
        qInserting = qInserting + 1;
    }
    qInserting = 1;
    loadAnsw(1);
    //loadAns2();
}
function loadAns2() {


    for (var i = 1; i < 2; i++) {
        logNow("THIS IS FOR LOOP I " + i);
        var ansData = getData("answers" + i);
        logNow("GOT DATA OF LENGTH " + ansData.length);
        (function (value) {
            logNow("THIS IS FIRST FUNCTION");

            db.transaction(function (tx) {
                logNow("INSERTING NEW ANSWER FILE");

                //(function (ansData) {
                //logNow("INSERTING NEW ANSWER FILE");


                $.each(ansData, function (index, ansData) {
                    tx.executeSql('INSERT INTO ANSWERS (id, question_id, answers) VALUES (?, ?, ?)', [ansData.id, ansData.question_id, ansData.answers]);
                    logNow("INSERTED ANSWERS" + ansData.question_id);
                    ////logNow("QINSERTING IS "+qInserting);
                });
                //})(ansD);
//                if(value==10){
//                    window.localStorage.setItem('upgrade4', "false");
//                    window.localStorage.setItem('rateApp', "true");
//                    upgrade="false";
//                    renderCategories();
//
//                }
            });

        })(i); // <-- CALL th
    }

}
function populateAns(tx) {
    tx.executeSql('DROP TABLE IF EXISTS ANSWERS');
    logNow('POPULATE ANSWERS CALLED WITH QINSERTING' + qInserting)
    if (qInserting == 1) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS ANSWERS (id, question_id, answers)');
        //logNow("ANSWERS COUNT IS "+ansData.length);
        tx.executeSql('DELETE FROM ANSWERS');
        $.each(ansData, function (index, ansData) {
            $.each(ansData, function (index, ansData) {
                tx.executeSql('INSERT INTO ANSWERS (id, question_id, answers) VALUES (?, ?, ?)', [ansData.id, ansData.question_id, ansData.answers]);
                //logNow("INSERTED ANSWERS"+ansData.question_id);
                ////logNow("QINSERTING IS "+qInserting);
            });
        });
        tx.executeSql('CREATE INDEX QUESTION_ID ON ANSWERS (question_id)');


        qInserting = qInserting + 1;
    }
    qInserting = 1;
    window.localStorage.setItem('upgrade4', "false");
    window.localStorage.setItem('rateApp', "true");
    upgrade = "false";
    renderCategories();
    //]] }

    //renderCategories();
    //loadAudioCategories();
}

var WebSqlAdapter = function () {

    this.initialize = function () {
        logNow("DB OPENED ");
        if(platform=='IOS'){
            this.db = window.sqlitePlugin.openDatabase("Database", "1.0", "IslamQA", -1);
        }
        else if(platform=='Android'){
            this.db = window.openDatabase("islamqa", "1.0", "Question and Answers Db", 100000000);
        }
        db = this.db;
    }


    this.executeQuery = function (qry) {
        var deferred = $.Deferred();
        this.db.transaction(
            function (tx) {

                var sql = qry;
                logNow("Executing: "+sql);
                tx.executeSql(sql, [], function (tx, results) {
                    deferred.resolve(results);
                });
            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.setFolderCount = function (res) {

        this.db.transaction(
            function (tx) {
                for (var i = 0; i < res.rows.length; i++) {
                    var sql = 'SELECT ' + i + ' as ele, count(*) as count,' + res.rows.item(i).id + ' as folderId FROM FOLDER_QUESTIONS WHERE FOLDER_ID = ' + res.rows.item(i).id;
                    tx.executeSql(sql, [],
                        function (tx, results) {
                            document.getElementById(results.rows.item(0).ele + 'cts').innerHTML = results.rows.item(0).count;
                        });
                }
            });
    };

    this.setCategoryCount = function (res) {
        this.db.transaction(
            function (tx) {
                logNow("res.rows.length is "+res.rows.length);
                for (var i = 0; i < res.rows.length; i++) {
                    (function (i) {
                        var sql = 'SELECT ' + i + ' as ele, count(*) as count FROM QUESTIONS WHERE CATEGORY_ID = "' + res.rows.item(i).element + '"';
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                document.getElementById(result.rows.item(0).ele + 'cts').innerHTML = result.rows.item(0).count;
                            });
                    })(i);
                }
            });
    };

    this.insertFolders = function (data) {
        var deferred = $.Deferred();
        this.db.transaction(
            function (tx) {

                var sql = 'INSERT INTO FOLDERS (id, folder_name,  colour) VALUES (?, ?, ?)';
                $.each(data, function (index, data) {
                    tx.executeSql(sql, [data.id, data.folder_name, data.colour]);
                    logNow("INSERTED FOLDER" + data.folder_name);
                    if(index == (data.length-1)){
                        deferred.resolve('done');
                    }
                });

            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.insertSingleFolder = function (folder_name,colour) {
        var deferred = $.Deferred();
        this.db.transaction(
            function (tx) {

                var sql = 'INSERT INTO FOLDERS (folder_name,  colour) VALUES (?, ?)';
                tx.executeSql(sql, [folder_name, colour],
                    function (tx, result) {
                        logNow("INSERTED FOLDER" + folder_name);
                        deferred.resolve(result.insertId);
                    });


            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.insertFolderQuestions = function (data) {
        var deferred = $.Deferred();
        var len = data.length;
        this.db.transaction(
            function (tx) {

                var sql = 'INSERT INTO FOLDER_QUESTIONS (id, folder_id, question_no) VALUES (?, ?, ?)';
                $.each(data, function (index, data) {
                    tx.executeSql(sql, [data.id, data.folder_id, data.question_no]);
                    logNow("INSERTED FOLDER QUESTION" + data.question_no);
                    if(index == (len-1)){
                        deferred.resolve('done');
                    }
                });

            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.insertSingleFolderQuestions = function (folder_id,question_no) {
        var deferred = $.Deferred();
        this.db.transaction(
            function (tx) {

                var sql = 'INSERT INTO FOLDER_QUESTIONS (folder_id, question_no) VALUES (?, ?)';
                tx.executeSql(sql, [folder_id, question_no]);
                logNow("INSERTED FOLDER QUESTION" + question_no);
                deferred.resolve('done');

            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };


    this.batchExecuteQuery = function (array) {
        var deferred = $.Deferred();

        this.db.transaction(
            function (tx) {
                for(var i = 0; i<array.length;i++){
                    tx.executeSql(array[i]);
                    if(i== (array.length-1)){
                        deferred.resolve('done');
                    }
                }

            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };


    var createTable = function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS employee');
        var sql = "CREATE TABLE IF NOT EXISTS employee ( " +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "firstName VARCHAR(50), " +
            "lastName VARCHAR(50), " +
            "title VARCHAR(50), " +
            "managerId INTEGER, " +
            "city VARCHAR(50), " +
            "officePhone VARCHAR(50), " +
            "cellPhone VARCHAR(50), " +
            "pic VARCHAR(50), " +
            "email VARCHAR(50))";
        tx.executeSql(sql, null,
            function () {
                console.log('Create table success');
            },
            function (tx, error) {
                alert('Create table error: ' + error.message);
            });
    }


}

function errorCB(tx, e) {
    //alert("Error processing SQL: "+err.code);
//    logNow("Database Error: "+(e ? e.message : 'no err msg available'));
}

function successCB() {
    //alert("Transaction success!");
}

