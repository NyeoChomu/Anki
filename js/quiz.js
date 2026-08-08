let questionQueue = [];
let currentWord = null;

let totalWordCount = 0;
let wrongAnswerCount = 0;

let answerRevealed = false;


/* =========================
   HTML 요소
========================= */

const progressText =
    document.getElementById(
        "progressText"
    );


const wordText =
    document.getElementById(
        "wordText"
    );


const answerCard =
    document.getElementById(
        "answerCard"
    );


const answerContent =
    document.getElementById(
        "answerContent"
    );


const resultButtons =
    document.getElementById(
        "resultButtons"
    );


const wrongButton =
    document.getElementById(
        "wrongButton"
    );


const correctButton =
    document.getElementById(
        "correctButton"
    );


const exitButton =
    document.getElementById(
        "exitButton"
    );


/* =========================
   초기화
========================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeQuiz
);


/*
 * 퀴즈 초기화
 */
async function initializeQuiz() {

    const stored =
        sessionStorage.getItem(
            "selectedChapters"
        );


    /*
     * 선택된 챕터가 없으면
     * 퀴즈 페이지에 직접 접근한 것이므로
     * 메인 페이지로 돌아간다.
     */
    if (!stored) {

        goBackToMain();

        return;
    }


    let selectedChapterIds;


    try {

        selectedChapterIds =
            JSON.parse(stored);

    } catch (error) {

        console.error(
            "선택된 챕터 데이터를 읽을 수 없습니다.",
            error
        );


        goBackToMain();

        return;
    }


    try {

        const data =
            await loadWordData();


        /*
         * 선택된 챕터의 모든 단어를 가져온다.
         */
        questionQueue =
            getWordsFromChapters(
                data,
                selectedChapterIds
            );


        /*
         * 단어가 하나도 없으면
         * 메인으로 돌아간다.
         */
        if (
            questionQueue.length === 0
        ) {

            alert(
                "선택한 챕터에 단어가 없습니다."
            );


            goBackToMain();

            return;
        }


        /*
         * 배열 복사
         */
        questionQueue =
            [...questionQueue];


        /*
         * 처음 문제 순서는 랜덤
         */
        shuffle(
            questionQueue
        );


        totalWordCount =
            questionQueue.length;


        wrongAnswerCount = 0;


        /*
         * 첫 문제 출력
         */
        showNextQuestion();

    } catch (error) {

        console.error(
            error
        );


        wordText.textContent =
            "단어 데이터를 불러오지 못했습니다.";


        answerContent.innerHTML = `
            <div>
                <p>
                    data/words.json을 확인해주세요.
                </p>

                <p>
                    파일 위치와 JSON 형식이
                    올바른지 확인해주세요.
                </p>
            </div>
        `;
    }
}


/* =========================
   다음 문제
========================= */

function showNextQuestion() {

    /*
     * 큐가 비었다는 것은
     * 모든 단어를 정답 처리했다는 뜻이다.
     */
    if (
        questionQueue.length === 0
    ) {

        finishQuiz();

        return;
    }


    /*
     * 큐의 첫 번째 단어를
     * 현재 문제로 설정
     */
    currentWord =
        questionQueue[0];


    answerRevealed =
        false;


    /*
     * 일본어 단어 표시
     */
    wordText.textContent =
        currentWord.word;


    /*
     * 답 블록 초기화
     */
    answerCard.classList.remove(
        "revealed"
    );


    answerContent.innerHTML =
        "클릭해서 정답 확인";


    /*
     * 정답 / 오답 버튼 숨기기
     */
    resultButtons.classList.add(
        "hidden"
    );


    /*
     * 진행도 업데이트
     */
    updateProgress();
}


/* =========================
   답 확인
========================= */

function revealAnswer() {

    /*
     * 이미 공개된 상태면
     * 아무것도 하지 않는다.
     */
    if (answerRevealed) {
        return;
    }


    answerRevealed =
        true;


    answerCard.classList.add(
        "revealed"
    );


    answerContent.innerHTML = `

        <div class="reading">
            ${escapeHtml(
                currentWord.reading
            )}
        </div>

        <div class="meaning">
            ${escapeHtml(
                currentWord.meaning
            )}
        </div>

    `;


    /*
     * 답을 확인한 후에만
     * 정답 / 오답 버튼 표시
     */
    resultButtons.classList.remove(
        "hidden"
    );
}


/* =========================
   오답
========================= */

function handleWrong() {

    /*
     * 답을 확인하기 전에는
     * 정답 / 오답 처리를 할 수 없다.
     */
    if (!answerRevealed) {
        return;
    }


    wrongAnswerCount++;


    /*
     * 현재 단어를 큐에서 제거
     */
    const wrongWord =
        questionQueue.shift();


    /*
     * 제거한 단어를
     * 큐 맨 뒤로 보낸다.
     */
    questionQueue.push(
        wrongWord
    );


    /*
     * 다음 문제
     */
    showNextQuestion();
}


/* =========================
   정답
========================= */

function handleCorrect() {

    /*
     * 답을 확인하기 전에는
     * 정답 처리를 할 수 없다.
     */
    if (!answerRevealed) {
        return;
    }


    /*
     * 현재 단어를 큐에서 제거
     */
    questionQueue.shift();


    /*
     * 큐가 비었다면
     * 모든 단어를 정답 처리한 것이다.
     */
    if (
        questionQueue.length === 0
    ) {

        finishQuiz();

        return;
    }


    /*
     * 다음 문제
     */
    showNextQuestion();
}


/* =========================
   진행도
========================= */

function updateProgress() {

    /*
     * 현재까지 정답 처리한
     * 고유 단어 수
     */
    const completed =
        totalWordCount -
        questionQueue.length;


    progressText.textContent =
        `${completed} / ${totalWordCount}`;
}


/* =========================
   퀴즈 완료
========================= */

function finishQuiz() {

    /*
     * 선택된 챕터 정보를 제거한다.
     *
     * 다음에 메인에서 다시 챕터를 선택하면
     * 새로운 학습 세션이 시작된다.
     */
    sessionStorage.removeItem(
        "selectedChapters"
    );


    /*
     * 완료 후 메인 페이지로 이동
     */
    window.location.href =
        "index.html";
}


/* =========================
   돌아가기
========================= */

function goBackToMain() {

    /*
     * 현재 학습 세션 삭제
     */
    sessionStorage.removeItem(
        "selectedChapters"
    );


    /*
     * 메인으로 이동
     */
    window.location.href =
        "index.html";
}


/* =========================
   이벤트
========================= */


/*
 * 답 블록 클릭
 */
answerCard.addEventListener(
    "click",
    revealAnswer
);


/*
 * 키보드로 답 확인
 */
answerCard.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            revealAnswer();
        }
    }
);


/*
 * 오답 버튼
 */
wrongButton.addEventListener(
    "click",
    handleWrong
);


/*
 * 정답 버튼
 */
correctButton.addEventListener(
    "click",
    handleCorrect
);


/*
 * 돌아가기 버튼
 */
exitButton.addEventListener(
    "click",
    goBackToMain
);