const DATA_URL = "./data/words.json";


/*
 * words.json 불러오기
 */
async function loadWordData() {

    const response = await fetch(DATA_URL);

    if (!response.ok) {

        throw new Error(
            `단어 데이터를 불러오지 못했습니다. HTTP ${response.status}`
        );
    }


    return await response.json();
}


/*
 * 챕터 ID를 기준으로 챕터 가져오기
 */
function getChaptersByIds(data, chapterIds) {

    return data.chapters.filter(
        chapter => chapterIds.includes(chapter.id)
    );
}


/*
 * 여러 챕터의 단어를 하나의 배열로 합치기
 */
function getWordsFromChapters(data, chapterIds) {

    const chapters =
        getChaptersByIds(
            data,
            chapterIds
        );


    return chapters.flatMap(
        chapter => {

            return chapter.words.map(
                word => ({

                    ...word,

                    chapterId:
                        chapter.id,

                    chapterName:
                        chapter.name
                })
            );
        }
    );
}


/*
 * HTML 특수문자 처리
 */
function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/*
 * 배열 랜덤화
 */
function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }


    return array;
}