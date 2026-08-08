let wordData = null;


/* =========================
   HTML 요소
========================= */

const chapterNameInput =
    document.getElementById(
        "chapterName"
    );


const addChapterButton =
    document.getElementById(
        "addChapterButton"
    );


const chapterSelect =
    document.getElementById(
        "chapterSelect"
    );


const wordInput =
    document.getElementById(
        "wordInput"
    );


const readingInput =
    document.getElementById(
        "readingInput"
    );


const meaningInput =
    document.getElementById(
        "meaningInput"
    );


const addWordButton =
    document.getElementById(
        "addWordButton"
    );


const dataList =
    document.getElementById(
        "dataList"
    );


const jsonOutput =
    document.getElementById(
        "jsonOutput"
    );


const copyJsonButton =
    document.getElementById(
        "copyJsonButton"
    );


const downloadJsonButton =
    document.getElementById(
        "downloadJsonButton"
    );


const backButton =
    document.getElementById(
        "backButton"
    );


/* =========================
   초기화
========================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeSettings
);


async function initializeSettings() {

    try {

        wordData =
            await loadWordData();


        /*
         * JSON 원본을 그대로 사용하지 않고
         * 새 객체로 복사한다.
         */
        wordData =
            JSON.parse(
                JSON.stringify(wordData)
            );


        renderAll();

    } catch (error) {

        console.error(error);


        dataList.innerHTML = `
            <p class="error-message">
                words.json을 불러오지 못했습니다.
            </p>
        `;

        jsonOutput.value =
            "words.json을 불러오지 못했습니다.";
    }
}


/* =========================
   전체 화면 갱신
========================= */

function renderAll() {

    renderChapterSelect();

    renderDataList();

    updateJsonOutput();
}


/* =========================
   챕터 선택 목록
========================= */

function renderChapterSelect() {

    chapterSelect.innerHTML = `
        <option value="">
            챕터를 선택하세요
        </option>
    `;


    wordData.chapters.forEach(
        chapter => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                chapter.id;


            option.textContent =
                chapter.name;


            chapterSelect.appendChild(
                option
            );
        }
    );
}


/* =========================
   현재 데이터 표시
========================= */

function renderDataList() {

    dataList.innerHTML = "";


    if (
        wordData.chapters.length === 0
    ) {

        dataList.innerHTML = `
            <p class="empty-message">
                등록된 챕터가 없습니다.
            </p>
        `;

        return;
    }


    wordData.chapters.forEach(
        chapter => {

            const chapterBox =
                document.createElement(
                    "div"
                );


            chapterBox.className =
                "data-chapter";


            const chapterHeader =
                document.createElement(
                    "div"
                );


            chapterHeader.className =
                "data-chapter-header";


            chapterHeader.innerHTML = `

                <div>

                    <div class="data-chapter-name">
                        ${escapeHtml(
                            chapter.name
                        )}
                    </div>

                    <div class="data-chapter-count">
                        ${chapter.words.length}단어
                    </div>

                </div>

                <button
                    class="delete-button"
                    data-chapter-id="${escapeHtml(
                        chapter.id
                    )}"
                >
                    챕터 삭제
                </button>

            `;


            chapterBox.appendChild(
                chapterHeader
            );


            /*
             * 단어 목록
             */

            if (
                chapter.words.length === 0
            ) {

                const empty =
                    document.createElement(
                        "p"
                    );


                empty.className =
                    "empty-message";


                empty.textContent =
                    "등록된 단어가 없습니다.";


                chapterBox.appendChild(
                    empty
                );

            } else {

                const wordList =
                    document.createElement(
                        "div"
                    );


                wordList.className =
                    "data-word-list";


                chapter.words.forEach(
                    word => {

                        const wordItem =
                            document.createElement(
                                "div"
                            );


                        wordItem.className =
                            "data-word";


                        wordItem.innerHTML = `

                            <div class="data-word-info">

                                <div class="data-word-text">
                                    ${escapeHtml(
                                        word.word
                                    )}
                                </div>

                                <div class="data-word-reading">
                                    ${escapeHtml(
                                        word.reading
                                    )}
                                </div>

                                <div class="data-word-meaning">
                                    ${escapeHtml(
                                        word.meaning
                                    )}
                                </div>

                            </div>

                            <button
                                class="delete-button word-delete-button"
                                data-chapter-id="${escapeHtml(
                                    chapter.id
                                )}"
                                data-word-id="${escapeHtml(
                                    word.id
                                )}"
                            >
                                삭제
                            </button>

                        `;


                        wordList.appendChild(
                            wordItem
                        );
                    }
                );


                chapterBox.appendChild(
                    wordList
                );
            }


            dataList.appendChild(
                chapterBox
            );
        }
    );


    /*
     * 챕터 삭제 이벤트
     */

    document
        .querySelectorAll(
            ".delete-button[data-chapter-id]:not(.word-delete-button)"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteChapter(
                            button.dataset.chapterId
                        );
                    }
                );
            }
        );


    /*
     * 단어 삭제 이벤트
     */

    document
        .querySelectorAll(
            ".word-delete-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteWord(
                            button.dataset.chapterId,
                            button.dataset.wordId
                        );
                    }
                );
            }
        );
}


/* =========================
   챕터 추가
========================= */

addChapterButton.addEventListener(
    "click",
    addChapter
);


function addChapter() {

    const name =
        chapterNameInput.value.trim();


    if (!name) {

        alert(
            "챕터 이름을 입력해주세요."
        );

        chapterNameInput.focus();

        return;
    }


    /*
     * ID 생성
     */
    const id =
        createUniqueChapterId();


    wordData.chapters.push({

        id: id,

        name: name,

        words: []

    });


    /*
     * 입력창 초기화
     */
    chapterNameInput.value = "";


    renderAll();
}


/* =========================
   챕터 삭제
========================= */

function deleteChapter(
    chapterId
) {

    const chapter =
        wordData.chapters.find(
            item =>
                item.id === chapterId
        );


    if (!chapter) {
        return;
    }


    const confirmed =
        confirm(
            `"${chapter.name}" 챕터를 삭제하시겠습니까?\n\n챕터 안의 단어도 모두 삭제됩니다.`
        );


    if (!confirmed) {
        return;
    }


    wordData.chapters =
        wordData.chapters.filter(
            item =>
                item.id !== chapterId
        );


    renderAll();
}


/* =========================
   단어 추가
========================= */

addWordButton.addEventListener(
    "click",
    addWord
);


function addWord() {

    const chapterId =
        chapterSelect.value;


    const word =
        wordInput.value.trim();


    const reading =
        readingInput.value.trim();


    const meaning =
        meaningInput.value.trim();


    if (!chapterId) {

        alert(
            "챕터를 선택해주세요."
        );

        chapterSelect.focus();

        return;
    }


    if (!word) {

        alert(
            "단어를 입력해주세요."
        );

        wordInput.focus();

        return;
    }


    if (!reading) {

        alert(
            "발음을 입력해주세요."
        );

        readingInput.focus();

        return;
    }


    if (!meaning) {

        alert(
            "뜻을 입력해주세요."
        );

        meaningInput.focus();

        return;
    }


    const chapter =
        wordData.chapters.find(
            item =>
                item.id === chapterId
        );


    if (!chapter) {
        return;
    }


    /*
     * 단어 ID 생성
     */
    const id =
        createUniqueWordId(
            chapter
        );


    chapter.words.push({

        id: id,

        word: word,

        reading: reading,

        meaning: meaning

    });


    /*
     * 입력창 초기화
     */
    wordInput.value = "";
    readingInput.value = "";
    meaningInput.value = "";


    renderAll();


    /*
     * 계속 같은 챕터에 단어를
     * 추가할 수 있도록 선택 상태 유지
     */
    chapterSelect.value =
        chapterId;
}


/* =========================
   단어 삭제
========================= */

function deleteWord(
    chapterId,
    wordId
) {

    const chapter =
        wordData.chapters.find(
            item =>
                item.id === chapterId
        );


    if (!chapter) {
        return;
    }


    const word =
        chapter.words.find(
            item =>
                item.id === wordId
        );


    if (!word) {
        return;
    }


    const confirmed =
        confirm(
            `"${word.word}"을(를) 삭제하시겠습니까?`
        );


    if (!confirmed) {
        return;
    }


    chapter.words =
        chapter.words.filter(
            item =>
                item.id !== wordId
        );


    renderAll();
}


/* =========================
   JSON 생성
========================= */

function updateJsonOutput() {

    jsonOutput.value =
        JSON.stringify(
            wordData,
            null,
            4
        );
}


/* =========================
   JSON 복사
========================= */

copyJsonButton.addEventListener(
    "click",
    async () => {

        try {

            await navigator.clipboard.writeText(
                jsonOutput.value
            );


            const originalText =
                copyJsonButton.textContent;


            copyJsonButton.textContent =
                "복사 완료";


            setTimeout(
                () => {

                    copyJsonButton.textContent =
                        originalText;

                },
                1500
            );

        } catch (error) {

            /*
             * Clipboard API가 차단된 경우
             */
            jsonOutput.select();

            document.execCommand(
                "copy"
            );


            alert(
                "JSON을 클립보드에 복사했습니다."
            );
        }
    }
);


/* =========================
   JSON 다운로드
========================= */

downloadJsonButton.addEventListener(
    "click",
    downloadJson
);


function downloadJson() {

    const blob =
        new Blob(
            [
                jsonOutput.value
            ],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "words.json";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );
}


/* =========================
   ID 생성
========================= */

function createUniqueChapterId() {

    let id;


    do {

        id =
            "chapter_" +
            Date.now() +
            "_" +
            Math.floor(
                Math.random() * 10000
            );

    } while (
        wordData.chapters.some(
            chapter =>
                chapter.id === id
        )
    );


    return id;
}


function createUniqueWordId(
    chapter
) {

    let id;


    do {

        id =
            "word_" +
            Date.now() +
            "_" +
            Math.floor(
                Math.random() * 10000
            );

    } while (
        chapter.words.some(
            word =>
                word.id === id
        )
    );


    return id;
}


/* =========================
   메인으로
========================= */

backButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "index.html";
    }
);
