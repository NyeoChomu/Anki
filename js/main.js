let wordData = null;


const chapterList =
    document.getElementById(
        "chapterList"
    );


const startButton =
    document.getElementById(
        "startButton"
    );


const selectionInfo =
    document.getElementById(
        "selectionInfo"
    );


/*
 * 메인 페이지가 열릴 때
 * 이전 퀴즈 진행 상태를 삭제한다.
 *
 * 따라서 퀴즈를 완료하고 돌아왔거나
 * 돌아가기 버튼으로 돌아온 경우
 * 항상 새로운 학습을 시작하게 된다.
 */
sessionStorage.removeItem(
    "selectedChapters"
);


document.addEventListener(
    "DOMContentLoaded",
    initializeMain
);


/*
 * 메인 페이지 초기화
 */
async function initializeMain() {

    try {

        wordData =
            await loadWordData();


        renderChapters();

        updateSelection();

    } catch (error) {

        console.error(error);


        chapterList.innerHTML = `
            <p class="error-message">
                단어 데이터를 불러오지 못했습니다.
                <br>
                <br>
                data/words.json 파일의 위치와
                JSON 형식을 확인해주세요.
            </p>
        `;
    }
}


/*
 * 챕터 목록 생성
 */
function renderChapters() {

    chapterList.innerHTML = "";


    if (
        !wordData.chapters ||
        wordData.chapters.length === 0
    ) {

        chapterList.innerHTML = `
            <p class="error-message">
                등록된 챕터가 없습니다.
            </p>
        `;

        return;
    }


    wordData.chapters.forEach(
        chapter => {

            const item =
                document.createElement(
                    "label"
                );


            item.className =
                "chapter-item";


            item.dataset.chapterId =
                chapter.id;


            item.innerHTML = `
                <input
                    type="checkbox"
                    class="chapter-checkbox"
                    value="${escapeHtml(chapter.id)}"
                >

                <div class="chapter-info">

                    <div class="chapter-name">
                        ${escapeHtml(chapter.name)}
                    </div>

                    <div class="chapter-count">
                        ${chapter.words.length}단어
                    </div>

                </div>
            `;


            const checkbox =
                item.querySelector(
                    ".chapter-checkbox"
                );


            checkbox.addEventListener(
                "change",
                () => {

                    item.classList.toggle(
                        "selected",
                        checkbox.checked
                    );


                    updateSelection();
                }
            );


            chapterList.appendChild(
                item
            );
        }
    );
}


/*
 * 현재 선택된 챕터 ID 가져오기
 */
function getSelectedChapterIds() {

    return Array.from(
        document.querySelectorAll(
            ".chapter-checkbox:checked"
        )
    ).map(
        checkbox => checkbox.value
    );
}


/*
 * 선택 상태 업데이트
 */
function updateSelection() {

    const selectedIds =
        getSelectedChapterIds();


    const selectedWords =
        wordData
            ? getWordsFromChapters(
                wordData,
                selectedIds
            )
            : [];


    if (selectedIds.length === 0) {

        selectionInfo.textContent =
            "챕터를 선택해주세요.";


        startButton.disabled =
            true;


        return;
    }


    selectionInfo.textContent =
        `${selectedIds.length}개 챕터 · ${selectedWords.length}단어 선택됨`;


    startButton.disabled =
        selectedWords.length === 0;
}


/*
 * 암기 시작
 */
startButton.addEventListener(
    "click",
    startQuiz
);


function startQuiz() {

    const selectedChapterIds =
        getSelectedChapterIds();


    if (
        selectedChapterIds.length === 0
    ) {
        return;
    }


    /*
     * 선택한 챕터만 저장한다.
     *
     * 실제 문제 진행도는 저장하지 않는다.
     */
    sessionStorage.setItem(
        "selectedChapters",
        JSON.stringify(
            selectedChapterIds
        )
    );


    window.location.href =
        "quiz.html";
}
const settingsButton =
    document.getElementById(
        "settingsButton"
    );


settingsButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "setting.html";
    }
);
