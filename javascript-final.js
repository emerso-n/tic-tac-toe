console.log('JS LOADED')

const gameselectview = document.querySelector('#game-select')
const gameview = document.querySelector('#game-view')

const gameboard = document.querySelector('#gameboard')
const winbox = document.querySelector('#winbox')
const winboxText = document.querySelector('#winbox div')
const winboxBtn = document.querySelector('#winbox button')

const vsplayerBtn = document.querySelector('#two-player')
vsplayerBtn.addEventListener('click', StartGame)

const vsai = document.querySelector('#vs-ai')
vsai.addEventListener('click', () => {
  $('#dropdown-content').slideToggle('fast')
})

const diffBtns = document.querySelectorAll('#dropdown-content button')
diffBtns.forEach(btn => btn.addEventListener('click', StartGame))

const backBtn = document.querySelector('#back')
backBtn.addEventListener('click', () => {
  gameview.classList.add('hide')
  gameselectview.classList.remove('hide')
  GameManager.ResetGame()
})

// PLAYER CREATION

const playerFactory = (token, CPUBool) => {
  const currentTokens = []
  return { token, currentTokens, CPUBool }
}
const player = { one: '', two: '' }

let currentPlayer

function StartGame (e) {
  gameselectview.classList.add('hide')
  gameview.classList.remove('hide')
  player.one = playerFactory('x', false)
  if (e.target.parentElement.id !== 'two-player') {
    player.two = playerFactory('o', true)
    CPUPlayer.SetDifficulty(e.target.parentElement.id)
    $('#dropdown-content').slideToggle('fast')
  } else player.two = playerFactory('o', false)

  currentPlayer = player.one
}

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
  function getGridSpaces () {
    return gridSpaces
  }
  // GAME STATES
  const gameStates = { disabled: 'disabled', enabled: 'enabled' }
  let gameState = gameStates.enabled

  function shuffle (array) {
    let currentIndex = array.length; let randomIndex

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }

    return array
  }
  let randomTokens = shuffle([1, 2, 3, 4, 5, 6])
  let n = 0
  let m = 0
  function PlaceToken (e) {
    if (e.target.classList.length || gameState === gameStates.disabled) {
      return
    }
    e.target.classList.add(`${currentPlayer.token}-token-${randomTokens[n]}`)
    m++
    if (m === 2) {
      m = 0
      n++
    }
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
      EndGame('tie')
    } else SwitchPlayer()
  }
  function CheckTie () {
    return gridSpaces.every(grid => {
      if (!grid.classList.length) {
        return false
      }
      return true
    })
  }

  function EndGame (endType) {
    winbox.classList.remove('hide')
    winboxText.innerHTML = `<img src="images/${endType}-win.gif" alt="${endType}" />`
    if (endType !== 'tie') winboxText.innerHTML += '<img src="images/wins.gif" alt="wins" />'
    gameboard.classList.add('whiteout')
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
    randomTokens = shuffle([1, 2, 3, 4, 5, 6])
    n = 0
    m = 0
    gameboard.classList.remove('whiteout')
    winbox.classList.add('hide')
    gameState = gameStates.enabled
  // reset here
  }
  winboxBtn.addEventListener('click', ResetGame)
  return { getGridSpaces, threeofsame, ResetGame }
})()

// CPU STUFF

const CPUPlayer = (() => {
  const CPUDifficulities = { easy: 'easy', hard: 'hard', impossible: 'impossible' }
  let CPUDifficulty
  function SetDifficulty (diff) {
    CPUDifficulty = CPUDifficulities[diff]
  }
  function PlaceToken () {
    const actualFreeTokens = []
    GameManager.getGridSpaces().forEach(grid => {
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
    function getRandomInt (max) {
      return Math.floor(Math.random() * max)
    }

    function getRandom () {
      return actualFreeTokens[getRandomInt(actualFreeTokens.length)]
    }
    function getBest () {
      const bestid = minimax(actualFreeTokens, player.two)
      return bestid.bestMove
    }

    function clickGrid (id) {
      GameManager.getGridSpaces().every(grid => {
        if (grid.id === id) {
          grid.click()
          return false
        }
        return true
      })
    }

    if (CPUDifficulty === CPUDifficulities.easy) {
      clickGrid(getRandom())
    }
    if (CPUDifficulty === CPUDifficulities.hard) {
      const int = getRandomInt(4)
      if (int === 0) {
        clickGrid(getRandom())
        console.log('random')
      } else {
        clickGrid(getBest())
        console.log('best')
      }
    }
    if (CPUDifficulty === CPUDifficulities.impossible) {
      clickGrid(getBest())
    }
  }
  return { PlaceToken, SetDifficulty }
})()
