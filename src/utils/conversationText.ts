const WORD_JOINER = '\u2060';

function keepWordTogether(word: string) {
  return Array.from(word).join(WORD_JOINER);
}

/**
 * 대화 문장은 문장 단위로 줄을 바꾸고, 화면 자동 줄바꿈은 공백에서만 일어나게 한다.
 * 원문에 있던 줄바꿈과 빈 문단은 그대로 보존한다.
 */
export function formatConversationText(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/([.!?。！？])[ \t]+(?=\S)/g, '$1\n')
    .split(/(\s+)/)
    .map(part => /\s/.test(part) ? part : keepWordTogether(part))
    .join('');
}
