let wordData = null;

let selectedChapterId = null;


/* =========================
   HTML 요소
========================= */

const chapterSelect =
    document.getElementById(
        "chapterSelect"
    );


const deleteChapterButton =
    document.getElementById(
        "deleteChapterButton"
    );


const newChapterName =
    document.getElementById(
        "newChapterName"
    );


const addChapterButton =
    document.getElementById(
        "addChapterButton"
    );


const chapterEditor =
    document.getElementById(
        "chapterEditor"
    );


const chapterName =
    document.getElementById(
        "chapterName"
    );


const saveChapterButton =
    document.getElementById(
        "saveChapterButton"
    );


const wordList =
    document.getElementById(
        "wordList"
    );


const wordCount =
    document.getElementById(
        "wordCount"
    );


const newWord =
    document.getElementById(
        "newWord"
    );


const newReading =
    document.getElementById(
        "newReading"
    );


const newMeaning =
    document.getElementById(
        "newMeaning"
    );


const addWordButton =
    document.getElementById(
        "addWordButton"
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


/* =========================
   초기화
========================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    try {

        const data =
            await loadWordData();


        /*
         * 원본 객체를 직접 수정하지 않고
         * 복사본을 사용한다.
         */
        wordData =
            JSON.parse(
                JSON.stringify(data)
            );


        renderChapterSelect();

        updateJson();

    } catch (error) {

        console.error(
            error
        );


        alert(
            "words.json을 불러오지 못했습니다."
        );


        jsonOutput.value =
            "words.json을 불러오지 못했습니다.";
    }
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


    /*
     * 기존에 선택했던 챕터가 있다면
     * 선택 상태 유지
     */
    if (selectedChapterId) {

        const exists =
            wordData.chapters.some(
                chapter =>
                    chapter.id ===
                    selectedChapterId
            );


        if (exists) {

            chapterSelect.value =
                selectedChapterId;

        } else {

            selectedChapterId =
                null;

        }
    }
}


/* =========================
   챕터 선택
========================= */

chapterSelect.addEventListener(
    "change",
    handleChapterSelect
);


function handleChapterSelect() {

    selectedChapterId =
        chapterSelect.value ||
        null;


    renderSelectedChapter();
}


/* =========================
   선택 챕터 표시
========================= */

function renderSelectedChapter() {

    if (!selectedChapterId) {

        chapterEditor.classList.add(
            "hidden"
        );

        return;
    }


    const chapter =
        getSelectedChapter();


    if (!chapter) {

        chapterEditor.classList.add(
            "hidden"
        );

        return;
    }


    chapterEditor.classList.remove(
        "hidden"
    );


    /*
     * 기존 챕터 이름을
     * input에 넣는다.
     */
    chapterName.value =
        chapter.name;


    renderWordList();
}


/* =========================
   선택 챕터 가져오기
========================= */

function getSelectedChapter() {

    if (!selectedChapterId) {
        return null;
    }


    return wordData.chapters.find(
        chapter =>
            chapter.id ===
            selectedChapterId
    );
}


/* =========================
   챕터 이름 저장
========================= */

saveChapterButton.addEventListener(
    "click",
    saveChapterName
);


function saveChapterName() {

    const chapter =
        getSelectedChapter();


    if (!chapter) {
        return;
    }


    const name =
        chapterName.value.trim();


    if (!name) {

        alert(
            "챕터 이름을 입력해주세요."
        );

        chapterName.focus();

        return;
    }


    chapter.name =
        name;


    renderChapterSelect();


    chapterSelect.value =
        selectedChapterId;


    updateJson();


    alert(
        "챕터 이름을 수정했습니다."
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
        newChapterName.value.trim();


    if (!name) {

        alert(
            "챕터 이름을 입력해주세요."
        );

        newChapterName.focus();

        return;
    }


    /*
     * 동일한 이름의 챕터가 있는지 확인
     */
    const duplicate =
        wordData.chapters.some(
            chapter =>
                chapter.name === name
        );


    if (duplicate) {

        alert(
            "이미 같은 이름의 챕터가 있습니다."
        );

        return;
    }


    const id =
        createChapterId();


    const newChapter = {

        id: id,

        name: name,

        words: []

    };


    wordData.chapters.push(
        newChapter
    );


    /*
     * 입력창 초기화
     */
    newChapterName.value = "";


    /*
     * 새 챕터를 자동으로 선택
     */
    selectedChapterId =
        id;


    renderChapterSelect();


    chapterSelect.value =
        id;


    renderSelectedChapter();

    updateJson();
}


/* =========================
   챕터 삭제
========================= */

deleteChapterButton.addEventListener(
    "click",
    deleteSelectedChapter
);


function deleteSelectedChapter() {

    const chapter =
        getSelectedChapter();


    if (!chapter) {

        alert(
            "삭제할 챕터를 선택해주세요."
        );

        return;
    }


    const confirmed =
        confirm(
            `"${chapter.name}" 챕터를 삭제하시겠습니까?\n\n챕터 안의 모든 단어도 함께 삭제됩니다.`
        );


    if (!confirmed) {
        return;
    }


    wordData.chapters =
        wordData.chapters.filter(
            item =>
                item.id !==
                selectedChapterId
        );


    selectedChapterId =
        null;


    renderChapterSelect();


    renderSelectedChapter();


    updateJson();
}


/* =========================
   단어 목록 표시
========================= */

function renderWordList() {

    const chapter =
        getSelectedChapter();


    if (!chapter) {
        return;
    }


    wordList.innerHTML = "";


    wordCount.textContent =
        `${chapter.words.length}단어`;


    if (
        chapter.words.length === 0
    ) {

        wordList.innerHTML = `
            <p class="empty-message">
                이 챕터에는 등록된 단어가 없습니다.
            </p>
        `;

        return;
    }


    chapter.words.forEach(
        word => {

            const wordBox =
                document.createElement(
                    "div"
                );


            wordBox.className =
                "word-edit-item";


            wordBox.innerHTML = `

                <div class="input-group">

                    <label>
                        일본어
                    </label>

                    <input
                        class="edit-word"
                        type="text"
                        value="${escapeHtmlAttribute(
                            word.word
                        )}"
                    >

                </div>


                <div class="input-group">

                    <label>
                        발음
                    </label>

                    <input
                        class="edit-reading"
                        type="text"
                        value="${escapeHtmlAttribute(
                            word.reading
                        )}"
                    >

                </div>


                <div class="input-group">

                    <label>
                        뜻
                    </label>

                    <input
                        class="edit-meaning"
                        type="text"
                        value="${escapeHtmlAttribute(
                            word.meaning
                        )}"
                    >

                </div>


                <div class="word-action-row">

                    <button
                        class="secondary-button save-word-button"
                        type="button"
                    >
                        수정 저장
                    </button>

                    <button
                        class="danger-button delete-word-button"
                        type="button"
                    >
                        단어 삭제
                    </button>

                </div>

            `;


            /*
             * 단어 수정
             */

            const saveButton =
                wordBox.querySelector(
                    ".save-word-button"
                );


            saveButton.addEventListener(
                "click",
                () => {

                    saveWord(
                        word,
                        wordBox
                    );
                }
            );


            /*
             * 단어 삭제
             */

            const deleteButton =
                wordBox.querySelector(
                    ".delete-word-button"
                );


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteWord(
                        word.id
                    );
                }
            );


            wordList.appendChild(
                wordBox
            );
        }
    );
}


/* =========================
   단어 수정
========================= */

function saveWord(
    word,
    wordBox
) {

    const wordInput =
        wordBox.querySelector(
            ".edit-word"
        );


    const readingInput =
        wordBox.querySelector(
            ".edit-reading"
        );


    const meaningInput =
        wordBox.querySelector(
            ".edit-meaning"
        );


    const wordValue =
        wordInput.value.trim();


    const readingValue =
        readingInput.value.trim();


    const meaningValue =
        meaningInput.value.trim();


    if (!wordValue) {

        alert(
            "일본어 단어를 입력해주세요."
        );

        wordInput.focus();

        return;
    }


    if (!readingValue) {

        alert(
            "발음을 입력해주세요."
        );

        readingInput.focus();

        return;
    }


    if (!meaningValue) {

        alert(
            "뜻을 입력해주세요."
        );

        meaningInput.focus();

        return;
    }


    /*
     * 기존 객체의 값만 변경
     */
    word.word =
        wordValue;


    word.reading =
        readingValue;


    word.meaning =
        meaningValue;


    updateJson();


    /*
     * 버튼을 잠시 변경해서
     * 저장됐다는 것을 보여준다.
     */

    const originalText =
        saveButtonText(
            wordBox
        );


    const saveButton =
        wordBox.querySelector(
            ".save-word-button"
        );


    saveButton.textContent =
        "저장 완료";


    setTimeout(
        () => {

            saveButton.textContent =
                originalText;

        },
        1200
    );
}


/*
 * 저장 버튼 원래 텍스트
 */
function saveButtonText(
    wordBox
) {

    const button =
        wordBox.querySelector(
            ".save-word-button"
        );


    return button.textContent ===
        "저장 완료"
        ? "수정 저장"
        : button.textContent;
}


/* =========================
   단어 삭제
========================= */

function deleteWord(
    wordId
) {

    const chapter =
        getSelectedChapter();


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
            `"${word.word}" 단어를 삭제하시겠습니까?`
        );


    if (!confirmed) {
        return;
    }


    chapter.words =
        chapter.words.filter(
            item =>
                item.id !== wordId
        );


    renderWordList();

    updateJson();
}


/* =========================
   단어 추가
========================= */

addWordButton.addEventListener(
    "click",
    addWord
);


function addWord() {

    const chapter =
        getSelectedChapter();


    if (!chapter) {

        alert(
            "먼저 챕터를 선택해주세요."
        );

        return;
    }


    const wordValue =
        newWord.value.trim();


    const readingValue =
        newReading.value.trim();


    const meaningValue =
        newMeaning.value.trim();


    if (!wordValue) {

        alert(
            "일본어 단어를 입력해주세요."
        );

        newWord.focus();

        return;
    }


    if (!readingValue) {

        alert(
            "발음을 입력해주세요."
        );

        newReading.focus();

        return;
    }


    if (!meaningValue) {

        alert(
            "뜻을 입력해주세요."
        );

        newMeaning.focus();

        return;
    }


    const newWordObject = {

        id:
            createWordId(
                chapter
            ),

        word:
            wordValue,

        reading:
            readingValue,

        meaning:
            meaningValue

    };


    chapter.words.push(
        newWordObject
    );


    /*
     * 입력창 초기화
     */
    newWord.value = "";

    newReading.value = "";

    newMeaning.value = "";


    renderWordList();

    updateJson();


    /*
     * 다음 단어를 바로 입력할 수 있도록
     * 첫 번째 입력창에 포커스
     */
    newWord.focus();
}


/* =========================
   ID 생성
========================= */

function createChapterId() {

    let id;


    do {

        id =
            "chapter_" +
            Date.now() +
            "_" +
            Math.floor(
                Math.random() * 100000
            );

    } while (
        wordData.chapters.some(
            chapter =>
                chapter.id === id
        )
    );


    return id;
}


function createWordId(
    chapter
) {

    let id;


    do {

        id =
            "word_" +
            Date.now() +
            "_" +
            Math.floor(
                Math.random() * 100000
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
   JSON 업데이트
========================= */

function updateJson() {

    if (!wordData) {
        return;
    }


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
    copyJson
);


async function copyJson() {

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
            1200
        );

    } catch (error) {

        /*
         * Clipboard API가 작동하지 않는 경우
         */
        jsonOutput.focus();

        jsonOutput.select();

        document.execCommand(
            "copy"
        );


        alert(
            "JSON을 복사했습니다."
        );
    }
}


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


    link.href =
        url;


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
   HTML attribute용 escape
========================= */

function escapeHtmlAttribute(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
