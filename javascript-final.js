console.log('JS LOADED')

const gameboard = document.querySelector('#gameboard')
const winbox = document.querySelector('#winbox')
const winboxText = document.querySelector('#winbox div')
const winboxBtn = document.querySelector('#winbox button')

// PLAYER CREATION

const playerFactory = (token, CPUBool) => {
  const currentTokens = []
  return { token, currentTokens, CPUBool }
}
const player = { one: playerFactory('x', false), two: playerFactory('o', true) }

let currentPlayer = player.one

// GAMEMANAGER
const GameManager = (() => {
  // GRID CREATION
  // 1AD   1B   1C4
  //  2A  2B4D  2C
  // 3A4   3B   3CD
  let gridSpaces = []
  const gridIds = ['1AD', '1B', '1C4', '2A', '2B4D', '2C', '3A4', '3B', '3CD']
  const MakeGridSpaces = () => {
    gridSpaces = []
    gridIds.forEach(id => {
      // CREATE GRID OBJECT
      const gridObject = document.createElement('button')
      gridObject.id = id
      gameboard.appendChild(gridObject)
      gridObject.addEventListener('click', PlaceToken)
      gridSpaces.push(gridObject)
    })
  }
  MakeGridSpaces()
  // GAME STATES
  const gameStates = { disabled: 'disabled', enabled: 'enabled' }
  let gameState = gameStates.enabled

  function PlaceToken (e) {
    if (e.target.classList.length || gameState === gameStates.disabled) {
      return
    }
    e.target.classList.add(`${currentPlayer.token}-token-1`)
    currentPlayer.currentTokens.push(e.target.id)
    CheckWin()
  }

  function SwitchPlayer () {
    currentPlayer === player.one ? currentPlayer = player.two : currentPlayer = player.one
    if (currentPlayer.CPUBool === true) CPUPlayer.PlaceToken()
  }

  const threeofsame = /(.).*\1.*\1/
  function CheckWin () {
    if (threeofsame.test(currentPlayer.currentTokens.join(''))) {
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
    player.one.currentTokens = []
    player.two.currentTokens = []
    currentPlayer = player.one
    winbox.style.display = 'none'
    gameState = gameStates.enabled
  // reset here
  }
  winboxBtn.addEventListener('click', ResetGame)
  return { threeofsame, gridSpaces }
})()

// CPU STUFF

const CPUPlayer = (() => {
  function PlaceToken () {
    const actualFreeTokens = []
    GameManager.gridSpaces.forEach(grid => {
      if (!grid.classList.length) {
        actualFreeTokens.push(grid.id)
      }
    })
    function minimax (freeTokens, currPlayer, lastTokens = []) {
      if (lastTokens && GameManager.threeofsame.test(lastTokens.join(''))) {
        return currPlayer.CPUBool ? { bestScore: -10 } : { bestScore: 10 }
      } else if (freeTokens.length === 0) return { bestScore: 0 }

      const moves = []
      for (let i = 0; i < freeTokens.length; i++) {
        currPlayer.currentTokens.push(freeTokens[i])

        const newFreeSpaces = freeTokens.filter((n, index) => index !== i)
        const score = minimax(newFreeSpaces, currPlayer.CPUBool ? player.one : player.two, currPlayer.currentTokens)
        moves.push(Object.assign(score, { bestMove: freeTokens[i] }))

        currPlayer.currentTokens.pop()
        if ((currPlayer.CPUBool && score.bestScore === 10) || (!currPlayer.CPUBool && score.bestScore === -10)) break
      }
      const bestMove = { bestScore: currPlayer.CPUBool ? -Infinity : Infinity }
      if (currPlayer.CPUBool) {
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].bestScore > bestMove.bestScore) {
            bestMove.bestScore = moves[i].bestScore
            bestMove.bestMove = moves[i].bestMove
          }
        }
      } else {
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].bestScore < bestMove.bestScore) {
            bestMove.bestScore = moves[i].bestScore
            bestMove.bestMove = moves[i].bestMove
          }
        }
      }
      return bestMove
    }
    const bestid = minimax(actualFreeTokens, player.two)
    GameManager.gridSpaces.every(grid => {
      if (grid.id === bestid.bestMove) {
        grid.click()
        return false
      }
      return true
    })
  }
  return { PlaceToken }
})()
