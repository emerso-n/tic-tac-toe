console.log('JS LOADED')

const gameboard = document.querySelector('#gameboard')
const winbox = document.querySelector('#winbox')
const winboxText = document.querySelector('#winbox div')
const winboxBtn = document.querySelector('#winbox button')

// player creation

const playerFactory = (token, CPUBool) => {
  const currentTokens = []
  return { token, currentTokens, CPUBool }
}
const player = { one: playerFactory('X', false), two: playerFactory('O', true) }

let currentPlayer = player.one
