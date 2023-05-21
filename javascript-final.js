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
    const freeSpacesReal = [1, 2, 3, 4, 5]
    // you have your list of empty spaces
    // and your currentTokens
    // you add an empty space to currentTokens
    // you remove the space from the empty space array
    // you recursion, with less empty spaces and more tokens in currenTokens
    // let m = 0
    function test (freeSpaces, thisPlayer) {
      // if (GameManager.threeofsame.test(thisPlayer.currentTokens)) return 10 // i guess this just works
      // if (freeSpaces <= 0) return 0
      // for (let i = 0; i < freeSpaces.length; i++) {
      //   player.two.currentTokens.push(freeSpaces[i])
      //   m++
      //   console.log(`before - i: ${i}, m: ${m}, currentTokens: ${thisPlayer.currentTokens}, freespaces: ${freeSpaces}`)

      //   const newFreeSpaces = freeSpaces.filter((n, index) => index !== i)
      //   test(newFreeSpaces, thisPlayer)
      //   player.two.currentTokens.pop()
      //   m++
      //   console.log(`after - i: ${i}, m: ${m}, currentTokens: ${thisPlayer.currentTokens}, freespaces: ${freeSpaces}`)
      // }
      thisPlayer.currentTokens = ['1a', '1b', '3b', '2c']
      const twoofsame = /(.).*\1/
      const match = thisPlayer.currentTokens.join('').match(twoofsame)
      if (match) {
        const found = actualFreeTokens.find(token => token.includes(match[1]))
        console.log(found)
      }
    }
    // test(actualFreeTokens, player.two)

    function minimax (freeTokens, currPlayer, depth = 0, lastTokens = []) {
      if (lastTokens && GameManager.threeofsame.test(lastTokens.join(''))) {
        return currPlayer.CPUBool ? { bestScore: -10, depth } : { bestScore: 10, depth }
      } else if (freeTokens.length === 0) return { bestScore: 0, depth }

      // let bestScore = currPlayer.CPUBool ? -Infinity : Infinity
      const bestMove = { bestScore: currPlayer.CPUBool ? -Infinity : Infinity, depth: Infinity }
      const moves = []
      for (let i = 0; i < freeTokens.length; i++) {
        currPlayer.currentTokens.push(freeTokens[i])

        const newFreeSpaces = freeTokens.filter((n, index) => index !== i)
        const score = minimax(newFreeSpaces, currPlayer.CPUBool ? player.one : player.two, depth + 1, currPlayer.currentTokens)
        // console.log(score)
        // this gets the best score for the current player, min or max
        // console.log(Object.assign(score, { depth }))
        moves.push(Object.assign(score, { move: freeTokens[i] }))

        if ((currPlayer.CPUBool === true && score.bestScore >= bestMove.bestScore && score.depth < bestMove.depth) || (currPlayer.CPUBool === false && score.bestScore <= bestMove.bestScore && score.depth < bestMove.depth)) {
          bestMove.bestScore = score.bestScore
          bestMove.bestMove = freeTokens[i]
          bestMove.depth = score.depth
          // if ((currPlayer.CPUBool && score.bestScore === 10) || (!currPlayer.CPUBool && score.bestScore === -10)) {
          //   currPlayer.currentTokens.pop()
          //   break
          // }
          // can we just break here because it already found a win? i guess it could also be a tie so just check for that
        }

        currPlayer.currentTokens.pop()
      }
      // const minormax = currPlayer.CPUBool ? 'Max' : 'Min'
      // console.log(Object.assign({ minormax }, bestMove))

      return bestMove // ok no so this one will return the best move for which ever play it is, min or max. where tf does it go tho? thats what i need to know
      // it goes to score = minimax, and at the very end it goes to what = minimax
      // u get it
    }
    // player.one.currentTokens = ['1AD', '3B', '3CD']
    // player.two.currentTokens = ['1B', '1C4', '2B4D']
    // const what = minimax(['2A', '2C', '3A4'], player.two)
    // console.log(what)

    function GetBestMove (actualFreeTokens, _player) {
      const moves = []
      for (let i = 0; i < actualFreeTokens.length; i++) {
        const newFreeSpaces = actualFreeTokens.filter((n, index) => index !== i)
        const move = minimax(newFreeSpaces, _player)
        console.log(move)
        moves.push(move)
      }
      console.log(moves)
    }
    GetBestMove(actualFreeTokens, player.two)
    // get best id
    const bestid = minimax(actualFreeTokens, player.two)
    // console.log('end')
    // console.log(bestid)
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
