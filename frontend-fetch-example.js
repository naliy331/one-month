// 前端使用範例：把這段接到你的遊戲結局頁面

async function generateEndingFromVercel(gameState, playerName) {
  try {
    const res = await fetch('/api/generate-ending', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playerName,
        gameState
      })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || '生成結局失敗');
    }

    return data.result;
  } catch (error) {
    console.error(error);
    return {
      layer1: '這三天裡，你沒有把所有話說出口，但你已經讓一部分自己出現在別人眼裡。',
      layer2: '你有一個習慣——在真正靠近之前，先把自己放在一個可以被看見的角落。',
      layer3: '你其實已經在做了。你會在一個自然的入口裡，慢慢把自己放進那段對話裡。',
      layer4: '下次那個入口出現的時候，你不需要再等那麼久。',
      mbtiTendency: '難以判斷'
    };
  }
}

// 使用方式：
// const ending = await generateEndingFromVercel(state, state.player.name);
// console.log(ending);
