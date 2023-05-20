console.log('JS LOADED')

const gameboard = document.querySelector('#gameboard')
const winbox = document.querySelector('#winbox')
const winboxText = document.querySelector('#winbox div')
const winboxBtn = document.querySelector('#winbox button')

// player creation

const playerFactory = (token, CPUBool) => {
  const currentTokens = ''
  return { token, currentTokens, CPUBool }
}
const player = { one: playerFactory('X', false), two: playerFactory('O', true) }
// TEMP BOARD
player.one.currentTokens = ''
player.two.currentTokens = ''

let currentPlayer = player.one

// AI stuff

const CPUPlayer = (() => {
  const PlaceToken = () => {
    const actualFreeTokens = []
    gridSpaces.forEach(grid => {
      if (!grid.classList.length) {
        actualFreeTokens.push(grid.id)
      }
    })
    const playerHuman = { currentTokens: player.one.currentTokens, CPUBool: player.one.CPUBool }
    const playerCPU = { currentTokens: player.two.currentTokens, CPUBool: player.two.CPUBool }

    const minimax = (freeTokens, _player) => {
      // check gamestate
      if (GameManager.threeofsame.test(_player.currentTokens)) {
        return _player.CPUBool ? 10 : -10
        // this player win
      } else if (freeTokens.length === 0) {
        return 0
      }
      //
      let bestScore = _player.CPUBool === true ? -Infinity : Infinity // the cpu wants positive score, human wants negative (aka computer is maxing, human is mining) so we start with the opposite of the best score so any score above or below it will be better and will replace it when found
      let bestMove
      for (let i = 0; i < freeTokens.length; i++) { // iterate through all possible moves
        _player.currentTokens += freeTokens[i]
        // console.log(_player.currentTokens)
        // testArray.push(freeTokens[i])
        // console.log(testArray)
        
        const score = minimax(freeTokens.slice(1), _player.CPUBool ? playerHuman : playerCPU)
        
        console.log(_player.currentTokens)
        
        if (_player.CPUBool === true) {
          if (score > bestScore) {
            bestScore = score
            bestMove = freeTokens[i]
          }
        } else { // the cpu and human player have different bestScore and bestMove values... i think
          if (score < bestScore) {
            bestScore = score
            bestMove = freeTokens[i]
          }
        }
        _player.currentTokens = _player.currentTokens.slice(0, -freeTokens[i].length)
        // testArray.pop()
      }
      return _player.CPUBool === true ? bestScore : bestMove
    }
    //
    const bestid = minimax(actualFreeTokens, playerCPU)
    gridSpaces.every(grid => {
      if (grid.id === bestid) {
        grid.click()
        return false
      }
      return true
    })
  }
  return { PlaceToken }
})()

// game manager stuff

let gridSpaces = [] // ok so the problem is that i am tracking whether a space is filled by whether it has a class and in order to do the minimax funcition the ai has to call the placetoken function a bunch of times and then undo the placing of the token, or else it has to make a copy of the board to use for each branch but uhhh i dont think that'll work if im using dom objects unless it does?? maybe i guess i can try it idk. seems inefficient tho
const GameManager = (() => {
  // grid creation

  // 1AD   1B   1C4
  //  2A  2B4D  2C
  // 3A4   3B   3CD

  // is there an easier way to do this? no, theres a harder and more scalable way to do it...but maybe we stick with this way
  const gridIds = ['1AD', '1B', '1C4', '2A', '2B4D', '2C', '3A4', '3B', '3CD']
  const createGridObject = (id) => {
    const gridObject = document.createElement('button')
    gridObject.id = id
    gameboard.appendChild(gridObject)
    gridObject.addEventListener('click', PlaceToken)
    gridSpaces.push(gridObject)
  }
  const MakeGridSpaces = () => {
    gridSpaces = []
    for (let i = 0; i < 9; i++) {
      createGridObject(gridIds[i])
    }
  }
  MakeGridSpaces()
  const gameStates = { disabled: 'disabled', enabled: 'enabled' }
  let gameState = gameStates.enabled
  function PlaceToken (e) {
    if (e.target.classList.length || gameState === gameStates.disabled) {
      return
    }
    currentPlayer === player.one ? e.target.classList.add('x-token-1') : e.target.classList.add('o-token-1')
    currentPlayer.currentTokens += e.target.id
    CheckWin()
  }

  function SwitchPlayer () {
    if (currentPlayer === player.one) currentPlayer = player.two
    else currentPlayer = player.one
    if (currentPlayer.CPUBool === true) CPUPlayer.PlaceToken()
  }

  const threeofsame = /(.).*\1.*\1/
  function CheckWin () {
    if (threeofsame.test(currentPlayer.currentTokens)) {
      EndGame(currentPlayer.token)
    } else if (CheckTie()) {
      EndGame('Tie')
    } else SwitchPlayer()
  }

  function CheckTie () {
    return gridSpaces.every(grid => {
      if (!grid.classList.length) { // checks for empty grid spaces and returns false if it finds one, which breaks the loop and returns false because no there is no tie bc there are still unused spaces
        return false
      }
      return true // if no spaces are empty then there is indeed a tie
    })
  }

  function EndGame (endType) {
    winbox.style.display = 'flex'
    if (endType === 'Tie') endType = 'Nobody'
    winboxText.innerText = `${endType} Wins!`
    gameState = gameStates.disabled
  }

  function ResetGame () {
    gridSpaces.forEach(grid => {
      grid.remove()
    })
    MakeGridSpaces()
    player.one.currentTokens = ''
    player.two.currentTokens = ''
    currentPlayer = player.one
    winbox.style.display = 'none'
    gameState = gameStates.enabled
  // reset here
  }
  winboxBtn.addEventListener('click', ResetGame)
  return { threeofsame }
})()
