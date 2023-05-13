console.log('JS LOADED')

const gridSpaces = document.querySelectorAll('.grid')
gridSpaces.forEach(grid => grid.addEventListener('click', PlaceToken))

const winbox = document.querySelector('#winbox')

// player creation

const playerFactory = (token) => {
  const currentTokens = ''
  return { token, currentTokens }
}
const player = { one: playerFactory('X'), two: playerFactory('O') }

let currentPlayer = player.one

// game manager stuff

function PlaceToken (e) {
  // prevent clicking the same grid twice
  currentPlayer === player.one ? e.target.style.backgroundImage = 'url("images/x-es/x.gif")' : e.target.style.backgroundImage = 'url("images/o-es/o.gif")'
  currentPlayer.currentTokens += e.target.id
  CheckWin() ? EndGame() : SwitchPlayer()
}

function SwitchPlayer () {
  if (currentPlayer === player.one) currentPlayer = player.two
  else currentPlayer = player.one
}
// ok so i think for the gamemanager ur just putting the placetoken() and switchplayer() function inside an object that you can only call with like gamemanager.switchplayer() rite so they're like private functions
// so i guess just keep figuring it out like this and then fix it later or whatever

// anyway after switching players it has to check for a win
// if we use the grid method then wins are when one player has either 3 of the same number or character in their grid tokens or whatever, or when they have three tokens with completely different numbers and letters. that works rite

// 1AD   1B   1C4
//  2A  2B4D  2C
// 3A4   3B   3CD

// is there an easier way to do this? ...maybe idk
const threeofsame = /(.).*\1.*\1/
function CheckWin () {
  // console.log(currentPlayer.currentTokens)
  return threeofsame.test(currentPlayer.currentTokens)
}

function EndGame () {
  winbox.style.display = 'block'
  winbox.innerText = `${currentPlayer.token} Wins!`
  // turn off ability to click on grids and add a new game button
}

function ResetGame () {
  // reset here
}
